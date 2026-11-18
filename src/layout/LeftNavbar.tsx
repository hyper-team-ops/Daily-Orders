import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  Settings2,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { SidebarWaveDecoration } from '@/components/shared/SidebarWaveDecoration';
import { SyncModal } from '@/components/sync/sync-modal';
import { formatTime } from '@/lib/date';
import { getTodayDateKey } from '@/lib/date';
import { storageService } from '@/services/storage.service';
import {
  getLiveSyncSnapshot,
  subscribeLiveSync,
  type LiveSyncSnapshot,
} from '@/services/live-sheet-sync';

interface LeftNavbarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  {
    to: '/orders',
    label: 'طلبات اليوم',
    icon: ClipboardList,
  },
  {
    to: '/days',
    label: 'سجل الأيام',
    icon: CalendarDays,
  },
] as const;

export function LeftNavbar({ isOpenMobile, onCloseMobile }: LeftNavbarProps) {
  const [liveSync, setLiveSync] = useState<LiveSyncSnapshot>(() =>
    getLiveSyncSnapshot(),
  );
  const [isSyncSettingsOpen, setIsSyncSettingsOpen] = useState(false);
  const todayKey = getTodayDateKey();
  const [todayDay, setTodayDay] = useState(() => storageService.getDay(todayKey));

  useEffect(() => {
    return subscribeLiveSync(setLiveSync);
  }, []);

  const syncVisual = (() => {
    if (liveSync.state === 'syncing' || liveSync.state === 'pending') {
      return {
        dot: 'bg-[#E2A425] animate-pulse',
        title: 'جاري التفريغ في الشيت...',
        subtitle: 'مزامنة تلقائية فورية',
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
      };
    }
    if (liveSync.state === 'synced') {
      return {
        dot: 'bg-[#4ADE80]',
        title: 'متزامن مع الشيت',
        subtitle: liveSync.lastSyncedAt
          ? `آخر تحديث ${formatTime(liveSync.lastSyncedAt)}`
          : 'الساعة 3:00 عصراً',
        icon: <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />,
      };
    }
    if (liveSync.state === 'error') {
      return {
        dot: 'bg-[#D27728]',
        title: 'بانتظار الاتصال بالشيت',
        subtitle: 'محفوظ محلياً بأمان',
        icon: <AlertCircle className="w-4 h-4 text-[#D27728]" />,
      };
    }
    return {
      dot: 'bg-[#E2A425]',
      title: 'مزامنة تلقائية للشيت',
      subtitle: 'فورية + الساعة 3:00 عصراً',
      icon: <Clock className="w-4 h-4" />,
    };
  })();

  const sidebarInner = (
    <div className="relative flex flex-col h-full bg-[#2B3439] text-[#F7E8D2] border-l border-white/8 select-none overflow-hidden">
      {/* Official HyperTeam Flowing Wave Contour Lines (36 SVG paths) */}
      <SidebarWaveDecoration />

      {/* Brand Block */}
      <div className="relative z-10 px-5 py-5 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={`${import.meta.env.BASE_URL}logo-gold.png`}
            alt="HyperTeam"
            className="w-10 h-10 object-contain shrink-0 drop-shadow"
          />
          <div className="min-w-0">
            <h1 className="font-heading text-base font-extrabold text-white leading-tight truncate">
              الطلبات اليومية
            </h1>
            <p className="text-[11px] text-[#E2A425] font-semibold mt-0.5 truncate">
              إدارة طلبات المكتب
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-xl hover:bg-white/10 text-[#F7E8D2]/80 hover:text-white transition cursor-pointer"
          aria-label="إغلاق القائمة"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="relative z-10 flex-1 px-3.5 py-5 space-y-5 overflow-y-auto">
        <div>
          <p className="px-3 mb-2.5 text-[11px] font-heading font-bold text-[#F7E8D2]/45 tracking-wide">
            القائمة الرئيسية
          </p>

          <nav className="space-y-1.5" aria-label="التنقل الرئيسي">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-heading font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#E2A425] text-[#2B3439] shadow-sm'
                        : 'text-[#F7E8D2]/80 hover:bg-white/8 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-[18px] h-[18px] shrink-0 ${
                          isActive ? 'text-[#2B3439]' : 'text-[#E2A425]/85'
                        }`}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Settings / Sync Config */}
            <button
              type="button"
              onClick={() => setIsSyncSettingsOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-heading font-bold transition-all duration-150 text-[#F7E8D2]/80 hover:bg-white/8 hover:text-white cursor-pointer"
            >
              <Settings2 className="w-[18px] h-[18px] shrink-0 text-[#E2A425]/85" />
              <span>الإعدادات</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Live + 3:00 PM Sync Status Footer */}
      <div className="relative z-10 p-4 border-t border-white/10 bg-[#2B3439]/65 backdrop-blur-[2px]">
        <div
          className="rounded-xl bg-white/6 border border-white/8 px-3.5 py-3 flex items-center gap-2.5"
          title={liveSync.errorMessage ?? undefined}
        >
          <div className="w-8 h-8 rounded-lg bg-[#E2A425]/15 text-[#E2A425] flex items-center justify-center shrink-0">
            {syncVisual.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${syncVisual.dot}`}
              />
              <p className="text-[11px] font-heading font-bold text-[#F7E8D2] leading-tight truncate">
                {syncVisual.title}
              </p>
            </div>
            <p className="text-[11px] text-[#F7E8D2]/65 mt-0.5 truncate">
              {syncVisual.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Sync Settings Modal (triggered from sidebar settings button) */}
      {isSyncSettingsOpen && (
        <SyncModal
          open={isSyncSettingsOpen}
          onClose={() => setIsSyncSettingsOpen(false)}
          day={todayDay}
          onSynced={(updated) => setTodayDay(updated)}
        />
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {sidebarInner}
      </aside>

      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#2B3439]/60 backdrop-blur-[2px]"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            {sidebarInner}
          </div>
        </div>
      )}
    </>
  );
}
