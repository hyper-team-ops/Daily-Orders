import { useEffect, useRef, useState } from 'react';
import { getTodayDateKey } from '@/lib/date';
import { storageService } from '@/services/storage.service';
import { syncService } from '@/services/sync.service';

const AUTO_SYNC_HOUR = 15; // 3:00 PM daily

export interface AutoSyncBanner {
  type: 'success' | 'error';
  message: string;
}

/**
 * Automatically flushes today's orders to the main Google Sheet (I3:O32)
 * every working day (Sunday-Thursday) at 3:00 PM while the app is open on localhost.
 */
export function useDailyAutoSync(onSynced?: () => void) {
  const [banner, setBanner] = useState<AutoSyncBanner | null>(null);
  const inFlightRef = useRef(false);
  const attemptedDateRef = useRef<string | null>(null);

  useEffect(() => {
    const checkAndSync = async () => {
      if (inFlightRef.current) return;

      const now = new Date();
      const dayOfWeek = now.getDay(); // 5 = Friday, 6 = Saturday
      if (dayOfWeek === 5 || dayOfWeek === 6) return;

      // Trigger at or after 3:00 PM (15:00)
      if (now.getHours() < AUTO_SYNC_HOUR) return;

      const todayKey = getTodayDateKey();
      if (attemptedDateRef.current === todayKey) return;

      const config = storageService.getSyncConfig();
      if (!config.webhookUrl) return;

      const day = storageService.getDay(todayKey);
      if (day.syncedAt || day.orders.length === 0) {
        attemptedDateRef.current = todayKey;
        return;
      }

      inFlightRef.current = true;
      attemptedDateRef.current = todayKey;

      try {
        const result = await syncService.syncDayToGoogleSheet(
          todayKey,
          config.autoTriggerExport,
        );
        setBanner({
          type: 'success',
          message: `مزامنة الساعة 3:00 عصراً: ${result.message}`,
        });
        onSynced?.();
      } catch (err) {
        setBanner({
          type: 'error',
          message:
            err instanceof Error
              ? `تعذّرت المزامنة التلقائية (3:00 عصراً): ${err.message}`
              : 'تعذّرت المزامنة التلقائية الساعة 3:00 عصراً',
        });
      } finally {
        inFlightRef.current = false;
      }
    };

    void checkAndSync();
    const intervalId = window.setInterval(() => {
      void checkAndSync();
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [onSynced]);

  return {
    autoSyncBanner: banner,
    dismissAutoSyncBanner: () => setBanner(null),
  };
}
