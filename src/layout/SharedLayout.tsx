import { useState } from 'react';
import { AlertCircle, CheckCircle2, Menu, X } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { useDailyAutoSync } from '@/hooks/use-daily-auto-sync';
import { LeftNavbar } from './LeftNavbar';

export function SharedLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { autoSyncBanner, dismissAutoSyncBanner } = useDailyAutoSync();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--ht-canvas)]">
      {/* Mobile / Tablet Top Bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#2B3439] text-[#F7E8D2] border-b-2 border-[#E2A425] shadow-md">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#F7E8D2] transition cursor-pointer"
              aria-label="فتح القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/orders"
              className="flex items-center gap-3 group cursor-pointer"
              title="الرئيسية — طلبات اليوم"
            >
              <img
                src={`${import.meta.env.BASE_URL}logo-gold.png`}
                alt="HyperTeam"
                className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
              />
              <div>
                <h1 className="font-heading text-base font-extrabold text-white leading-tight group-hover:text-[#E2A425] transition-colors">
                  الطلبات اليومية
                </h1>
                <p className="text-[11px] text-[#E2A425] font-semibold">
                  إدارة طلبات المكتب
                </p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Right Fixed Sidebar (RTL) */}
      <LeftNavbar
        isOpenMobile={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-4">
          {autoSyncBanner && (
            <div
              className={`p-3.5 rounded-2xl border text-sm font-semibold flex items-center justify-between gap-3 ${
                autoSyncBanner.type === 'success'
                  ? 'bg-[#E6F6EC] border-[#BBE5CB] text-[#1E6B40]'
                  : 'bg-[#FCEBEB] border-[#E8B7BC] text-[#8A222E]'
              }`}
            >
              <span className="flex items-center gap-2">
                {autoSyncBanner.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{autoSyncBanner.message}</span>
              </span>
              <button
                type="button"
                onClick={dismissAutoSyncBanner}
                className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
                aria-label="إغلاق الإشعار"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <Outlet />
        </div>
      </main>
    </div>
  );
}
