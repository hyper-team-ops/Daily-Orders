import { useMemo, useState } from 'react';
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  CloudUpload,
  ExternalLink,
  Eye,
  FileCheck2,
  FolderOpen,
  Hourglass,
  Layers,
  Plus,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrderCard } from '@/components/order/order-card';
import { OrderDetailsModal } from '@/components/order/order-details-modal';
import { DeleteModal } from '@/components/shared/delete-modal';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { SyncModal } from '@/components/sync/sync-modal';
import { COACHES } from '@/config/coaches';
import { useDeleteModal } from '@/hooks/use-delete-modal';
import {
  formatArabicDate,
  formatShortArabicDate,
  formatTime,
  getTodayDateKey,
} from '@/lib/date';
import { SERVICE_STYLE } from '@/lib/service-styles';
import { computeDayStats, storageService } from '@/services/storage.service';
import type { DayRecord, DaySummary, Order } from '@/types/order';

export function DaysPage() {
  const navigate = useNavigate();
  const todayKey = getTodayDateKey();

  const [days, setDays] = useState<DaySummary[]>(() =>
    storageService.listDays(),
  );
  const [selectedDay, setSelectedDay] = useState<DayRecord>(() =>
    storageService.getDay(todayKey),
  );
  const [pickedDate, setPickedDate] = useState(todayKey);

  const [activeDetailsOrderId, setActiveDetailsOrderId] = useState<
    string | null
  >(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const { itemToDelete, openDeleteModal, closeDeleteModal } =
    useDeleteModal<Order>();

  const refreshState = (targetDate = selectedDay.date) => {
    setSelectedDay(storageService.getDay(targetDate));
    setDays(storageService.listDays());
    setPickedDate(targetDate);
  };

  const handleOpenDate = () => {
    if (!pickedDate) return;
    refreshState(pickedDate);
  };

  const handleCoachChange = (coachName: string) => {
    storageService.updateCoach(selectedDay.date, coachName || null);
    refreshState(selectedDay.date);
  };

  const handleQuickToggle = (
    order: Order,
    field: 'isCompleted' | 'isDelivered',
  ) => {
    const nextValue = !order[field];
    storageService.updateOrder(selectedDay.date, order.id, {
      [field]: nextValue,
      ...(field === 'isDelivered' && nextValue ? { isCompleted: true } : {}),
    });
    refreshState(selectedDay.date);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    storageService.deleteOrder(selectedDay.date, itemToDelete.id);
    if (activeDetailsOrderId === itemToDelete.id) {
      setActiveDetailsOrderId(null);
    }
    closeDeleteModal();
    refreshState(selectedDay.date);
  };

  const stats = useMemo(
    () => computeDayStats(selectedDay.orders),
    [selectedDay.orders],
  );

  const activeDetailsOrder = useMemo(
    () =>
      selectedDay.orders.find((o) => o.id === activeDetailsOrderId) ?? null,
    [selectedDay.orders, activeDetailsOrderId],
  );

  const coachOptions =
    selectedDay.coachName && !COACHES.includes(selectedDay.coachName)
      ? [selectedDay.coachName, ...COACHES]
      : COACHES;

  return (
    <div className="space-y-6">
      <PageHeader
        title="سجل الأيام"
        subtitle="استعرض الطلبات السابقة حسب التاريخ والخدمة"
        icon={
          <div className="w-10 h-10 rounded-xl bg-[#F7E8D2] text-[#D27728] flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white px-3 h-10 rounded-xl border border-[#2B3439]/14 shadow-2xs">
              <Calendar className="w-4 h-4 text-[#2B3439]/55 shrink-0" />
              <input
                type="date"
                value={pickedDate}
                onChange={(e) => setPickedDate(e.target.value)}
                aria-label="اختر التاريخ"
                className="text-sm font-en font-semibold text-[#2B3439] bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenDate}
              className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl bg-[#E2A425] hover:bg-[#D27728] text-[#2B3439] hover:text-white text-xs sm:text-sm font-heading font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>فتح اليوم</span>
            </button>
          </div>
        }
      />

      {/* 4 Daily KPI Cards */}
      <section
        aria-label="إحصائيات اليوم المحدد"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5"
      >
        <StatsCard
          title="إجمالي الطلبات"
          value={stats.totalOrders}
          icon={Layers}
          tone="neutral"
        />
        <StatsCard
          title="مفتوح"
          value={stats.openOrders}
          icon={FolderOpen}
          tone="orange"
        />
        <StatsCard
          title="بانتظار التسليم"
          value={stats.completedNotDelivered}
          icon={Hourglass}
          tone="gold"
        />
        <StatsCard
          title="تم التسليم"
          value={stats.deliveredOrders}
          icon={CheckCircle2}
          tone="delivered"
        />
      </section>

      {/* Two-Column Desktop Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Main Column: Daily Orders Table / Mobile Cards */}
        <section className="xl:col-span-8 bg-white rounded-2xl border border-[#2B3439]/10 shadow-[var(--ht-shadow-sm)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2B3439]/8 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E2A425]" />
              <h3 className="font-heading text-base font-extrabold text-[#2B3439]">
                طلبات اليوم ({selectedDay.orders.length})
              </h3>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/days/${selectedDay.date}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-bold bg-[#FBF6EE] hover:bg-[#F7E8D2] text-[#2B3439] border border-[#2B3439]/10 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D27728]" />
              <span>إدارة الطلبات بالكاردات</span>
            </button>
          </div>

          {selectedDay.orders.length === 0 ? (
            <div className="p-6">
              <EmptyState
                compact
                title="لا توجد طلبات مسجلة في هذا اليوم"
                description="اختر تاريخاً آخر من الأعلى أو من قائمة الأيام المسجلة."
              />
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#FBF6EE] border-b border-[#2B3439]/10 text-xs font-heading font-bold text-[#2B3439]/70">
                      <th className="py-3 px-4 w-14 text-center">#</th>
                      <th className="py-3 px-4">اسم الطالب</th>
                      <th className="py-3 px-4">الطلب</th>
                      <th className="py-3 px-4">الخدمة</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4">الوقت</th>
                      <th className="py-3 px-4 text-center w-24">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B3439]/8 text-sm">
                    {selectedDay.orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-[#FBF6EE]/65 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-center font-en font-bold text-xs text-[#2B3439]/75">
                          {order.orderNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-heading font-bold text-[#2B3439]">
                            {order.studentName}
                          </p>
                          {order.deviceName && (
                            <p className="text-[11px] text-[#2B3439]/55 font-en mt-0.5">
                              {order.deviceName}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs sm:text-sm text-[#2B3439]/80 max-w-[220px]">
                          <p className="line-clamp-2">{order.requestDetails}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {order.serviceTypes.map((service) => {
                              const style =
                                SERVICE_STYLE[service] ??
                                SERVICE_STYLE['برامج'];
                              return (
                                <span
                                  key={service}
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold border ${style.bg} ${style.text} ${style.border}`}
                                >
                                  {service}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge
                            isCompleted={order.isCompleted}
                            isDelivered={order.isDelivered}
                          />
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#2B3439]/65 whitespace-nowrap">
                          {formatTime(order.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setActiveDetailsOrderId(order.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-heading font-bold bg-[#F7E8D2] hover:bg-[#E2A425] text-[#2B3439] transition cursor-pointer"
                            title="عرض وتعديل التفاصيل"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>تفاصيل</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden p-4 space-y-3">
                {selectedDay.orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onToggleCompleted={(o) =>
                      handleQuickToggle(o, 'isCompleted')
                    }
                    onToggleDelivered={(o) =>
                      handleQuickToggle(o, 'isDelivered')
                    }
                    onOpenDetails={(o) => setActiveDetailsOrderId(o.id)}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Secondary Column: Daily Details + Recorded Days */}
        <aside className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-[#2B3439]/10 shadow-[var(--ht-shadow-sm)] p-5 space-y-4">
            <h3 className="font-heading text-base font-extrabold text-[#2B3439]">
              تفاصيل اليوم
            </h3>

            <div className="p-3.5 rounded-xl bg-[#FBF6EE] border border-[#2B3439]/8 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#F7E8D2] text-[#D27728] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-sm font-extrabold text-[#2B3439] truncate">
                  {formatArabicDate(selectedDay.date)}
                </p>
                <p className="text-xs text-[#2B3439]/55 font-en" dir="ltr">
                  {selectedDay.date}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs sm:text-sm py-1 border-b border-[#2B3439]/8">
              <span className="inline-flex items-center gap-2 text-[#2B3439]/70 font-medium">
                <UserCheck className="w-4 h-4 text-[#D27728]" />
                <span>الكوتش:</span>
              </span>
              <select
                value={selectedDay.coachName ?? ''}
                onChange={(e) => handleCoachChange(e.target.value)}
                aria-label="تغيير الكوتش"
                className="bg-[#FBF6EE] border border-[#2B3439]/12 rounded-lg px-2.5 py-1 text-xs font-heading font-bold text-[#2B3439] focus:outline-none focus:border-[#E2A425] cursor-pointer"
              >
                <option value="">— غير محدد —</option>
                {coachOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[#2B3439]/75">
                  <Layers className="w-4 h-4 text-[#2B3439]/60" />
                  <span>إجمالي الطلبات</span>
                </span>
                <span className="font-en font-bold text-[#2B3439]">
                  {stats.totalOrders}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[#2B3439]/75">
                  <CheckCircle2 className="w-4 h-4 text-[#2E8555]" />
                  <span>تم التسليم</span>
                </span>
                <span className="font-en font-bold text-[#1E6B40]">
                  {stats.deliveredOrders}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[#2B3439]/75">
                  <Hourglass className="w-4 h-4 text-[#C88D18]" />
                  <span>بانتظار التسليم</span>
                </span>
                <span className="font-en font-bold text-[#8B600D]">
                  {stats.completedNotDelivered}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[#2B3439]/75">
                  <FolderOpen className="w-4 h-4 text-[#D27728]" />
                  <span>مفتوحة</span>
                </span>
                <span className="font-en font-bold text-[#D27728]">
                  {stats.openOrders}
                </span>
              </li>
            </ul>

            <div className="pt-2 border-t border-[#2B3439]/8">
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2B3439] hover:bg-[#364147] text-[#F7E8D2] text-xs font-heading font-bold transition cursor-pointer"
              >
                <CloudUpload className="w-4 h-4 text-[#E2A425]" />
                <span>مزامنة وتفريغ هذا اليوم</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#2B3439]/10 shadow-[var(--ht-shadow-sm)] p-4 space-y-2.5">
            <h4 className="font-heading text-sm font-extrabold text-[#2B3439] px-1">
              الأيام المسجلة ({days.length})
            </h4>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pl-1">
              {days.map((item) => {
                const isActive = item.date === selectedDay.date;
                const isTodayItem = item.date === todayKey;
                return (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => refreshState(item.date)}
                    className={`w-full text-right px-3 py-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-[#F7E8D2]/75 border-[#E2A425] shadow-2xs'
                        : 'bg-[#FBF6EE]/50 hover:bg-[#FBF6EE] border-transparent'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading text-xs font-bold text-[#2B3439] truncate">
                          {formatShortArabicDate(item.date)}
                        </span>
                        {isTodayItem && (
                          <span className="px-1.5 py-0.2 text-[10px] font-heading font-bold rounded bg-[#E2A425] text-[#2B3439]">
                            اليوم
                          </span>
                        )}
                      </div>
                      <p
                        className="text-[11px] text-[#2B3439]/55 font-en"
                        dir="ltr"
                      >
                        {item.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-[#2B3439]/10 text-[11px] font-en font-bold text-[#2B3439]">
                        {item.totalOrders}
                      </span>
                      {item.exportedToDrive ? (
                        <FileCheck2 className="w-3.5 h-3.5 text-[#2E8555]" />
                      ) : item.syncedAt ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#E2A425]" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-[#2B3439]/30" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <OrderDetailsModal
        dateKey={selectedDay.date}
        order={activeDetailsOrder}
        onClose={() => setActiveDetailsOrderId(null)}
        onQuickToggle={handleQuickToggle}
        onUpdated={() => refreshState(selectedDay.date)}
        onRequestDelete={(order) => openDeleteModal(order)}
      />

      <SyncModal
        open={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        day={selectedDay}
        onSynced={() => refreshState(selectedDay.date)}
      />

      <DeleteModal
        open={itemToDelete !== null}
        title="تأكيد حذف الطلب"
        description={`هل أنت متأكد من حذف طلب الطالب "${itemToDelete?.studentName ?? ''}"؟ سيتم حذف الطلب وإعادة ترقيم باقي الطلبات.`}
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
