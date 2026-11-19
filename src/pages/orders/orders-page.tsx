import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CloudUpload,
  FolderOpen,
  Hourglass,
  Layers,
  Plus,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrderCard } from '@/components/order/order-card';
import { OrderDetailsModal } from '@/components/order/order-details-modal';
import { OrderModal } from '@/components/order/order-modal';
import { DeleteModal } from '@/components/shared/delete-modal';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { SearchFilterBar } from '@/components/shared/search-filter-bar';
import { StatsCard } from '@/components/shared/stats-card';
import { SyncModal } from '@/components/sync/sync-modal';
import { COACHES } from '@/config/coaches';
import { useDeleteModal } from '@/hooks/use-delete-modal';
import { formatArabicDate, getTodayDateKey } from '@/lib/date';
import { SERVICE_OPTIONS, SERVICE_STYLE } from '@/lib/service-styles';
import { computeDayStats, storageService } from '@/services/storage.service';
import type { DayRecord, Order, ServiceType } from '@/types/order';

interface DayOrdersBoardProps {
  dateKey?: string;
}

export function DayOrdersBoard({ dateKey }: DayOrdersBoardProps) {
  const navigate = useNavigate();
  const todayKey = getTodayDateKey();
  const targetDate = dateKey ?? todayKey;
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [day, setDay] = useState<DayRecord>(() =>
    storageService.getDay(targetDate),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceType | 'ALL'>(
    'ALL',
  );
  const [activeTab, setActiveTab] = useState<'open' | 'delivered'>('open');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [activeDetailsOrderId, setActiveDetailsOrderId] = useState<
    string | null
  >(null);

  const { itemToDelete, openDeleteModal, closeDeleteModal } =
    useDeleteModal<Order>();

  useEffect(() => {
    setDay(storageService.getDay(targetDate));
  }, [targetDate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCoachChange = (coachName: string) => {
    const updated = storageService.updateCoach(day.date, coachName || null);
    setDay(updated);
  };

  const handleQuickToggle = (
    order: Order,
    field: 'isCompleted' | 'isDelivered',
  ) => {
    const nextValue = !order[field];
    const updated = storageService.updateOrder(day.date, order.id, {
      [field]: nextValue,
      ...(field === 'isDelivered' && nextValue ? { isCompleted: true } : {}),
    });
    setDay(updated);

    // Auto-switch to "delivered" tab when the last open order is marked delivered
    if (field === 'isDelivered' && nextValue) {
      const remainingOpen = updated.orders.filter((o) => !o.isDelivered);
      if (remainingOpen.length === 0 && updated.orders.length > 0) {
        setActiveTab('delivered');
      }
    }
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const updated = storageService.deleteOrder(day.date, itemToDelete.id);
    if (activeDetailsOrderId === itemToDelete.id) {
      setActiveDetailsOrderId(null);
    }
    setDay(updated);
    closeDeleteModal();
  };

  const stats = useMemo(() => computeDayStats(day.orders), [day.orders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return day.orders.filter((order) => {
      if (
        selectedService !== 'ALL' &&
        !order.serviceTypes.includes(selectedService)
      ) {
        return false;
      }
      if (!q) return true;
      return (
        order.studentName.toLowerCase().includes(q) ||
        order.requestDetails.toLowerCase().includes(q) ||
        (order.deviceName ?? '').toLowerCase().includes(q) ||
        (order.notes ?? '').toLowerCase().includes(q) ||
        String(order.orderNumber).includes(q)
      );
    });
  }, [day.orders, searchQuery, selectedService]);

  const openOrders = useMemo(
    () => filteredOrders.filter((o) => !o.isDelivered),
    [filteredOrders],
  );
  const deliveredOrders = useMemo(
    () => filteredOrders.filter((o) => o.isDelivered),
    [filteredOrders],
  );

  const activeDetailsOrder = useMemo(
    () => day.orders.find((o) => o.id === activeDetailsOrderId) ?? null,
    [day.orders, activeDetailsOrderId],
  );

  const isToday = day.date === todayKey;
  const coachOptions =
    day.coachName && !COACHES.includes(day.coachName)
      ? [day.coachName, ...COACHES]
      : COACHES;

  return (
    <div className="space-y-6">
      <PageHeader
        title={formatArabicDate(day.date)}
        subtitle={day.date}
        icon={
          <div className="w-10 h-10 rounded-xl bg-[#F7E8D2] text-[#D27728] flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        }
        badge={
          isToday ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold bg-[#E2A425] text-[#2B3439]">
              اليوم الحالي
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold bg-[#2B3439] text-[#F7E8D2]">
              سجل يوم سابق
            </span>
          )
        }
        actions={
          <>
            {!isToday && (
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-[#2B3439] hover:bg-[#364147] text-[#F7E8D2] text-xs font-heading font-bold transition cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 text-[#E2A425]" />
                <span>العودة لليوم</span>
              </button>
            )}

            <div className="flex items-center gap-2 bg-white border border-[#2B3439]/14 rounded-xl px-3 h-10 shadow-2xs">
              <UserCheck className="w-4 h-4 text-[#D27728] shrink-0" />
              <label
                htmlFor="day-coach-select"
                className="text-xs text-[#2B3439]/60 hidden sm:inline"
              >
                الكوتش:
              </label>
              <select
                id="day-coach-select"
                value={day.coachName ?? ''}
                onChange={(e) => handleCoachChange(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-heading font-bold text-[#2B3439] focus:outline-none cursor-pointer"
              >
                <option value="">— اختر الكوتش —</option>
                {coachOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-white border border-[#2B3439]/14 hover:bg-[#F7E8D2]/50 text-[#2B3439] text-xs sm:text-sm font-heading font-bold transition cursor-pointer"
            >
              <CloudUpload className="w-4 h-4 text-[#D27728]" />
              <span className="hidden sm:inline">مزامنة وتصدير</span>
            </button>
          </>
        }
      />

      {/* 4 Consistent KPI Cards */}
      <section
        aria-label="إحصائيات اليوم"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5"
      >
        <StatsCard
          title="إجمالي الطلبات"
          value={stats.totalOrders}
          icon={Layers}
          tone="neutral"
        />
        <StatsCard
          title="الطلبات المفتوحة"
          value={stats.openOrders}
          icon={FolderOpen}
          tone="orange"
        />
        <StatsCard
          title="انتهى · بانتظار التسليم"
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

      {/* All Filters Row: Open/Delivered tabs + Service type filters side-by-side */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Open / Delivered Tabs */}
        <div
          role="tablist"
          aria-label="تصنيف الطلبات"
          className="inline-flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#2B3439]/10 shadow-[var(--ht-shadow-sm)]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'open'}
            onClick={() => setActiveTab('open')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-heading font-bold transition-all cursor-pointer ${
              activeTab === 'open'
                ? 'bg-[#2B3439] text-[#F7E8D2] shadow-xs'
                : 'text-[#2B3439]/70 hover:bg-[#FBF6EE] hover:text-[#2B3439]'
            }`}
          >
            <FolderOpen
              className={`w-4 h-4 ${
                activeTab === 'open' ? 'text-[#E2A425]' : 'text-[#D27728]'
              }`}
            />
            <span>الطلبات المفتوحة</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-en font-bold ${
                activeTab === 'open'
                  ? 'bg-[#E2A425] text-[#2B3439]'
                  : 'bg-[#FBECE0] text-[#A65314]'
              }`}
            >
              {openOrders.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'delivered'}
            onClick={() => setActiveTab('delivered')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-heading font-bold transition-all cursor-pointer ${
              activeTab === 'delivered'
                ? 'bg-[#2B3439] text-[#F7E8D2] shadow-xs'
                : 'text-[#2B3439]/70 hover:bg-[#FBF6EE] hover:text-[#2B3439]'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 ${
                activeTab === 'delivered' ? 'text-[#E2A425]' : 'text-[#2E8555]'
              }`}
            />
            <span>الطلبات المُسلّمة</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-en font-bold ${
                activeTab === 'delivered'
                  ? 'bg-[#E2A425] text-[#2B3439]'
                  : 'bg-[#E6F6EC] text-[#1E6B40]'
              }`}
            >
              {deliveredOrders.length}
            </span>
          </button>
        </div>

        {/* Service Type Filters */}
        <div className="inline-flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#2B3439]/10 shadow-[var(--ht-shadow-sm)]">
          <button
            type="button"
            onClick={() => setSelectedService('ALL')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-heading font-bold border transition cursor-pointer ${
              selectedService === 'ALL'
                ? 'bg-[#2B3439] text-[#E2A425] border-[#2B3439] shadow-xs'
                : 'bg-[#FBF6EE] text-[#2B3439]/75 border-[#2B3439]/12 hover:bg-[#F7E8D2]/70 hover:text-[#2B3439]'
            }`}
          >
            الكل
          </button>

          {SERVICE_OPTIONS.map((service) => {
            const style = SERVICE_STYLE[service];
            const Icon = style.icon;
            const isActive = selectedService === service;
            return (
              <button
                key={service}
                type="button"
                onClick={() => setSelectedService(service)}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-heading font-bold border transition cursor-pointer ${
                  isActive
                    ? `${style.activeBg} shadow-xs`
                    : `${style.bg} ${style.text} ${style.border} hover:brightness-95`
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{service}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full-width Search Bar Under the Filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
      />

      {/* Orders Grid Section */}
      <section className="space-y-4">
        {activeTab === 'open' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* بطاقة إضافة طلب جديد — ثابتة دائماً على اليمين في أول خانة */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="group relative min-h-[190px] rounded-2xl border-2 border-dashed border-[#E2A425] hover:border-[#D27728] bg-white hover:bg-[#FDF9F3] transition-all duration-200 overflow-hidden shadow-[var(--ht-shadow-sm)] hover:shadow-[var(--ht-shadow-md)] flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
              aria-label="إضافة طلب جديد"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#E2A425]/15 group-hover:bg-[#E2A425] text-[#D27728] group-hover:text-[#2B3439] flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-105">
                <Plus className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="mt-3.5">
                <h3 className="font-heading text-base sm:text-lg font-extrabold text-[#2B3439] group-hover:text-[#D27728] transition-colors">
                  طلب جديد
                </h3>
                <p className="text-xs text-[#2B3439]/65 mt-1">
                  انقر لإضافة طلب طالب جديد
                </p>
              </div>
            </button>

            {openOrders.length === 0 ? (
              <div className="col-span-1 md:col-span-1 xl:col-span-2 min-h-[190px] rounded-2xl border border-dashed border-[#2B3439]/15 bg-white/60 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-xl bg-[#F7E8D2]/80 text-[#2B3439]/55 flex items-center justify-center mb-2">
                  <FolderOpen className="w-5 h-5 text-[#D27728]" />
                </div>
                <p className="font-heading text-sm font-bold text-[#2B3439]/80">
                  {stats.totalOrders === 0
                    ? 'لا توجد طلبات مسجلة في هذا اليوم بعد'
                    : 'لا توجد طلبات مفتوحة حالياً'}
                </p>
                <p className="text-xs text-[#2B3439]/55 mt-1 max-w-sm">
                  {stats.totalOrders === 0
                    ? 'اضغط على بطاقة "طلب جديد" على اليمين لتسجيل أول طلب طالب.'
                    : 'تم تسليم جميع الطلبات المطابقة، يمكنك استعراضها من تبويب "الطلبات المُسلّمة".'}
                </p>
              </div>
            ) : (
              openOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onToggleCompleted={(o) => handleQuickToggle(o, 'isCompleted')}
                  onToggleDelivered={(o) => handleQuickToggle(o, 'isDelivered')}
                  onOpenDetails={(o) => setActiveDetailsOrderId(o.id)}
                />
              ))
            )}
          </div>
        ) : deliveredOrders.length === 0 ? (
          <EmptyState
            title="لا توجد طلبات مُسلّمة في هذا اليوم بعد"
            description="عند تحديد «تم التسليم» على أي طلب، ينتقل تلقائياً إلى هذا القسم."
            icon={CheckCircle2}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {deliveredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onToggleCompleted={(o) => handleQuickToggle(o, 'isCompleted')}
                onToggleDelivered={(o) => handleQuickToggle(o, 'isDelivered')}
                onOpenDetails={(o) => setActiveDetailsOrderId(o.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <OrderModal
        open={isCreateModalOpen}
        dateKey={day.date}
        entity={null}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(updatedDay) => {
          setDay(updatedDay);
          setActiveTab('open');
        }}
      />

      <OrderDetailsModal
        dateKey={day.date}
        order={activeDetailsOrder}
        onClose={() => setActiveDetailsOrderId(null)}
        onQuickToggle={handleQuickToggle}
        onUpdated={(updatedDay) => setDay(updatedDay)}
        onRequestDelete={(order) => openDeleteModal(order)}
      />

      <SyncModal
        open={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        day={day}
        onSynced={(updatedDay) => setDay(updatedDay)}
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

export function OrdersPage() {
  return <DayOrdersBoard />;
}
