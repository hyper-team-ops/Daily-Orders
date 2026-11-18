import { getTodayDateKey } from '@/lib/date';
import { storageService } from './storage.service';
import { syncService } from './sync.service';

export type LiveSyncState = 'idle' | 'pending' | 'syncing' | 'synced' | 'error';

export interface LiveSyncSnapshot {
  state: LiveSyncState;
  lastSyncedAt: string | null;
  errorMessage: string | null;
}

type Listener = (snapshot: LiveSyncSnapshot) => void;

const DEBOUNCE_MS = 1500;

let snapshot: LiveSyncSnapshot = {
  state: 'idle',
  lastSyncedAt: null,
  errorMessage: null,
};

let debounceTimer: number | null = null;
let inFlight = false;
let pendingDateKey: string | null = null;
const listeners = new Set<Listener>();

function emit(next: Partial<LiveSyncSnapshot>): void {
  snapshot = { ...snapshot, ...next };
  for (const listener of listeners) {
    listener(snapshot);
  }
}

async function runFlush(dateKey: string): Promise<void> {
  if (inFlight) {
    pendingDateKey = dateKey;
    return;
  }

  const config = storageService.getSyncConfig();
  if (!config.webhookUrl) {
    emit({ state: 'idle', errorMessage: null });
    return;
  }

  inFlight = true;
  emit({ state: 'syncing', errorMessage: null });

  try {
    // Strictly flush to main Google Sheet only (triggerExport = false)
    const result = await syncService.syncDayToGoogleSheet(dateKey, false);
    emit({
      state: 'synced',
      lastSyncedAt: result.syncedAt,
      errorMessage: null,
    });
  } catch (err) {
    emit({
      state: 'error',
      errorMessage: err instanceof Error ? err.message : 'تعذّرت المزامنة',
    });
  } finally {
    inFlight = false;
    if (pendingDateKey) {
      const nextDate = pendingDateKey;
      pendingDateKey = null;
      void runFlush(nextDate);
    }
  }
}

/**
 * Schedules a debounced background flush to the main Google Sheet (I1 + I3:O32).
 * Only syncs automatically when editing today's orders so past history edits never overwrite today's live sheet.
 */
export function scheduleLiveSheetSync(dateKey: string): void {
  if (dateKey !== getTodayDateKey()) {
    return;
  }

  const config = storageService.getSyncConfig();
  if (!config.webhookUrl) {
    return;
  }

  emit({ state: 'pending', errorMessage: null });

  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer);
  }

  debounceTimer = window.setTimeout(() => {
    debounceTimer = null;
    void runFlush(dateKey);
  }, DEBOUNCE_MS);
}

export function getLiveSyncSnapshot(): LiveSyncSnapshot {
  return snapshot;
}

export function subscribeLiveSync(listener: Listener): () => void {
  listeners.add(listener);
  listener(snapshot);
  return () => {
    listeners.delete(listener);
  };
}
