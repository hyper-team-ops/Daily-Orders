export const SERVICE_TYPES = [
  'برامج',
  'فرمتة',
  'كورسات',
  'حل مشكلة | استشارة',
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export interface Order {
  id: string;
  orderNumber: number;
  studentName: string;
  requestDetails: string;
  serviceTypes: ServiceType[];
  deviceName: string | null;
  notes: string | null;
  isCompleted: boolean;
  isDelivered: boolean;
  createdAt: string;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  coachName: string | null;
  syncedAt: string | null;
  exportedToDrive: boolean;
  orders: Order[];
}

export interface DayStats {
  totalOrders: number;
  openOrders: number;
  completedNotDelivered: number;
  deliveredOrders: number;
}

export interface DaySummary extends DayStats {
  date: string;
  coachName: string | null;
  syncedAt: string | null;
  exportedToDrive: boolean;
}

export interface CreateOrderInput {
  studentName: string;
  requestDetails: string;
  serviceTypes: ServiceType[];
  deviceName?: string | null;
  notes?: string | null;
}

export interface UpdateOrderInput {
  studentName?: string;
  requestDetails?: string;
  serviceTypes?: ServiceType[];
  deviceName?: string | null;
  notes?: string | null;
  isCompleted?: boolean;
  isDelivered?: boolean;
}

export interface SyncConfig {
  webhookUrl: string;
  secretToken: string;
  autoTriggerExport: boolean;
}

export interface SyncResult {
  success: boolean;
  date: string;
  ordersCount: number;
  exportedToDrive: boolean;
  syncedAt: string;
  message: string;
}
