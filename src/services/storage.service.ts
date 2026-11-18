import { COACHES } from '@/config/coaches';
import { getTodayDateKey } from '@/lib/date';
import { scheduleLiveSheetSync } from './live-sheet-sync';
import type {
  CreateOrderInput,
  DayRecord,
  DayStats,
  DaySummary,
  Order,
  ServiceType,
  SyncConfig,
  UpdateOrderInput,
} from '@/types/order';

const DAYS_STORAGE_KEY = 'hyperteam_daily_orders_days_v1';
const SYNC_CONFIG_STORAGE_KEY = 'hyperteam_daily_orders_sync_config_v1';

type DaysMap = Record<string, DayRecord>;

function readDaysMap(): DaysMap {
  try {
    const raw = localStorage.getItem(DAYS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DaysMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeDaysMap(map: DaysMap): void {
  localStorage.setItem(DAYS_STORAGE_KEY, JSON.stringify(map));
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function computeDayStats(orders: Order[]): DayStats {
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.isDelivered).length;
  const openOrders = totalOrders - deliveredOrders;
  const completedNotDelivered = orders.filter(
    (o) => o.isCompleted && !o.isDelivered,
  ).length;

  return {
    totalOrders,
    openOrders,
    completedNotDelivered,
    deliveredOrders,
  };
}

function normalizeOptional(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeServices(services: ServiceType[]): ServiceType[] {
  const unique = Array.from(new Set(services));
  return unique.length > 0 ? unique : ['برامج'];
}

export const storageService = {
  getDay(dateKey: string): DayRecord {
    const map = readDaysMap();
    const existing = map[dateKey];
    if (existing) {
      return existing;
    }

    const today = getTodayDateKey();
    const fresh: DayRecord = {
      date: dateKey,
      coachName: dateKey === today ? (COACHES[0] ?? null) : null,
      syncedAt: null,
      exportedToDrive: false,
      orders: [],
    };
    map[dateKey] = fresh;
    writeDaysMap(map);
    return fresh;
  },

  listDays(): DaySummary[] {
    const today = getTodayDateKey();
    const map = readDaysMap();

    if (!map[today]) {
      map[today] = {
        date: today,
        coachName: COACHES[0] ?? null,
        syncedAt: null,
        exportedToDrive: false,
        orders: [],
      };
      writeDaysMap(map);
    }

    return Object.values(map)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((day) => ({
        date: day.date,
        coachName: day.coachName,
        syncedAt: day.syncedAt,
        exportedToDrive: day.exportedToDrive,
        ...computeDayStats(day.orders),
      }));
  },

  updateCoach(dateKey: string, coachName: string | null): DayRecord {
    const map = readDaysMap();
    const day = map[dateKey] ?? this.getDay(dateKey);
    const updated: DayRecord = {
      ...day,
      coachName: normalizeOptional(coachName),
    };
    map[dateKey] = updated;
    writeDaysMap(map);
    scheduleLiveSheetSync(dateKey);
    return updated;
  },

  createOrder(dateKey: string, input: CreateOrderInput): DayRecord {
    const map = readDaysMap();
    const day = map[dateKey] ?? this.getDay(dateKey);
    const nextNumber =
      day.orders.length > 0
        ? Math.max(...day.orders.map((o) => o.orderNumber)) + 1
        : 1;

    const newOrder: Order = {
      id: generateId(),
      orderNumber: nextNumber,
      studentName: input.studentName.trim(),
      requestDetails: input.requestDetails.trim(),
      serviceTypes: normalizeServices(input.serviceTypes),
      deviceName: normalizeOptional(input.deviceName),
      notes: normalizeOptional(input.notes),
      isCompleted: false,
      isDelivered: false,
      createdAt: new Date().toISOString(),
    };

    const updated: DayRecord = {
      ...day,
      orders: [...day.orders, newOrder],
    };
    map[dateKey] = updated;
    writeDaysMap(map);
    scheduleLiveSheetSync(dateKey);
    return updated;
  },

  updateOrder(
    dateKey: string,
    orderId: string,
    input: UpdateOrderInput,
  ): DayRecord {
    const map = readDaysMap();
    const day = map[dateKey] ?? this.getDay(dateKey);

    const updatedOrders = day.orders.map((order) => {
      if (order.id !== orderId) return order;

      const nextDelivered =
        input.isDelivered !== undefined ? input.isDelivered : order.isDelivered;
      // Marking an order as delivered automatically enables isCompleted
      const nextCompleted = nextDelivered
        ? true
        : input.isCompleted !== undefined
          ? input.isCompleted
          : order.isCompleted;

      return {
        ...order,
        studentName:
          input.studentName !== undefined
            ? input.studentName.trim()
            : order.studentName,
        requestDetails:
          input.requestDetails !== undefined
            ? input.requestDetails.trim()
            : order.requestDetails,
        serviceTypes:
          input.serviceTypes !== undefined
            ? normalizeServices(input.serviceTypes)
            : order.serviceTypes,
        deviceName:
          input.deviceName !== undefined
            ? normalizeOptional(input.deviceName)
            : order.deviceName,
        notes:
          input.notes !== undefined
            ? normalizeOptional(input.notes)
            : order.notes,
        isCompleted: nextCompleted,
        isDelivered: nextDelivered,
      };
    });

    const updated: DayRecord = {
      ...day,
      orders: updatedOrders,
    };
    map[dateKey] = updated;
    writeDaysMap(map);
    scheduleLiveSheetSync(dateKey);
    return updated;
  },

  deleteOrder(dateKey: string, orderId: string): DayRecord {
    const map = readDaysMap();
    const day = map[dateKey] ?? this.getDay(dateKey);

    const remaining = day.orders
      .filter((o) => o.id !== orderId)
      .map((order, idx) => ({
        ...order,
        orderNumber: idx + 1,
      }));

    const updated: DayRecord = {
      ...day,
      orders: remaining,
    };
    map[dateKey] = updated;
    writeDaysMap(map);
    scheduleLiveSheetSync(dateKey);
    return updated;
  },

  markSynced(dateKey: string, exportedToDrive: boolean): DayRecord {
    const map = readDaysMap();
    const day = map[dateKey] ?? this.getDay(dateKey);
    const updated: DayRecord = {
      ...day,
      syncedAt: new Date().toISOString(),
      exportedToDrive: exportedToDrive ? true : day.exportedToDrive,
    };
    map[dateKey] = updated;
    writeDaysMap(map);
    return updated;
  },

  getSyncConfig(): SyncConfig {
    const envUrl = (import.meta.env.VITE_GAS_WEBHOOK_URL as string | undefined) || '';
    const envSecret =
      (import.meta.env.VITE_GAS_SECRET_TOKEN as string | undefined) ||
      'hyperteam-change-me';

    try {
      const raw = localStorage.getItem(SYNC_CONFIG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SyncConfig>;
        return {
          webhookUrl: (parsed.webhookUrl ?? envUrl).trim(),
          secretToken: (parsed.secretToken ?? envSecret).trim(),
          autoTriggerExport: Boolean(parsed.autoTriggerExport ?? false),
        };
      }
    } catch {
      // fallback to env
    }

    return {
      webhookUrl: envUrl.trim(),
      secretToken: envSecret.trim(),
      autoTriggerExport: false,
    };
  },

  saveSyncConfig(config: SyncConfig): SyncConfig {
    const normalized: SyncConfig = {
      webhookUrl: config.webhookUrl.trim(),
      secretToken: config.secretToken.trim(),
      autoTriggerExport: Boolean(config.autoTriggerExport),
    };
    localStorage.setItem(SYNC_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  },
};
