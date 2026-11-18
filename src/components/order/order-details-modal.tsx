import { useState } from 'react';
import {
  Check,
  Clock,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Laptop,
  Pencil,
  Trash2,
  User,
} from 'lucide-react';
import { FormDialog } from '@/components/shared/form-dialog';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatTime } from '@/lib/date';
import { SERVICE_STYLE } from '@/lib/service-styles';
import type { DayRecord, Order } from '@/types/order';
import { OrderForm } from './order-form';

interface OrderDetailsModalProps {
  dateKey: string;
  order: Order | null;
  onClose: () => void;
  onQuickToggle: (order: Order, field: 'isCompleted' | 'isDelivered') => void;
  onUpdated: (updatedDay: DayRecord) => void;
  onRequestDelete: (order: Order) => void;
}

export function OrderDetailsModal({
  dateKey,
  order,
  onClose,
  onQuickToggle,
  onUpdated,
  onRequestDelete,
}: OrderDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(true);

  if (!order) return null;

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  return (
    <FormDialog
      open={Boolean(order)}
      onClose={handleClose}
      title={isEditing ? `تعديل الطلب #${order.orderNumber}` : 'تفاصيل الطلب'}
      subtitle={`Order #${order.orderNumber} · ${formatTime(order.createdAt)}`}
      maxWidthClass="max-w-[560px]"
      icon={
        <span className="px-2.5 py-1 rounded-full bg-[#E2A425] text-[#2B3439] font-en text-xs font-bold">
          #{order.orderNumber}
        </span>
      }
    >
      {isEditing ? (
        <OrderForm
          key={order.id}
          dateKey={dateKey}
          entity={order}
          onSuccess={(updatedDay) => {
            onUpdated(updatedDay);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="p-5 sm:p-6 space-y-4">
            <div className="bg-[#FBF6EE] p-4 rounded-2xl border border-[#2B3439]/10 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2B3439] text-[#E2A425] flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#2B3439]/60">
                      اسم الطالب
                    </p>
                    <p className="font-heading text-lg font-extrabold text-[#2B3439]">
                      {order.studentName}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  isCompleted={order.isCompleted}
                  isDelivered={order.isDelivered}
                />
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-[#2B3439]/8">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {order.serviceTypes.map((service) => {
                    const style =
                      SERVICE_STYLE[service] ?? SERVICE_STYLE['برامج'];
                    const Icon = style.icon;
                    return (
                      <span
                        key={service}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-heading font-bold border ${style.bg} ${style.text} ${style.border}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{service}</span>
                      </span>
                    );
                  })}
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#2B3439]/55">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(order.createdAt)}</span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-[#2B3439]/10 bg-white">
              <div className="flex items-center gap-1.5 text-xs font-heading font-bold text-[#2B3439]/65 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-[#D27728]" />
                <span>تفاصيل الطلب</span>
              </div>
              <p className="text-sm text-[#2B3439] whitespace-pre-wrap leading-relaxed">
                {order.requestDetails}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-[#2B3439]/10 bg-white">
                <div className="flex items-center gap-1.5 text-xs font-heading font-bold text-[#2B3439]/65 mb-1">
                  <Laptop className="w-3.5 h-3.5 text-[#D27728]" />
                  <span>اسم الجهاز</span>
                </div>
                <p className="text-sm font-semibold text-[#2B3439] font-en">
                  {order.deviceName || (
                    <span className="text-[#2B3439]/40 font-normal font-body">
                      غير محدد
                    </span>
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#2B3439]/10 bg-white">
                <div className="flex items-center justify-between text-xs font-heading font-bold text-[#2B3439]/65 mb-1">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#D27728]" />
                    <span>ملاحظات (باسوورد | رقم)</span>
                  </span>
                  {order.notes && (
                    <button
                      type="button"
                      onClick={() => setShowNotes((prev) => !prev)}
                      className="text-[#2B3439]/55 hover:text-[#2B3439] cursor-pointer"
                      title={showNotes ? 'إخفاء' : 'إظهار'}
                    >
                      {showNotes ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-sm font-semibold text-[#2B3439] break-words">
                  {order.notes ? (
                    showNotes ? (
                      order.notes
                    ) : (
                      '••••••••'
                    )
                  ) : (
                    <span className="text-[#2B3439]/40 font-normal">
                      لا توجد ملاحظات
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onQuickToggle(order, 'isCompleted')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition cursor-pointer ${
                  order.isCompleted
                    ? 'bg-[#FDF3DC] border-[#E2A425] text-[#2B3439]'
                    : 'bg-[#FBF6EE] border-[#2B3439]/15 text-[#2B3439]/80 hover:border-[#E2A425]'
                }`}
              >
                <div className="text-right">
                  <p className="text-sm font-heading font-bold">تمّ الانتهاء</p>
                  <p className="text-[11px] opacity-75">
                    {order.isCompleted ? 'العمل مكتمل' : 'قيد العمل'}
                  </p>
                </div>
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    order.isCompleted
                      ? 'bg-[#E2A425] text-[#2B3439]'
                      : 'border-2 border-[#2B3439]/30 bg-white'
                  }`}
                >
                  {order.isCompleted && (
                    <Check className="w-4 h-4 stroke-[3]" />
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onQuickToggle(order, 'isDelivered')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition cursor-pointer ${
                  order.isDelivered
                    ? 'bg-[#E6F6EC] border-[#2E8555] text-[#1E5C39]'
                    : 'bg-[#FBF6EE] border-[#2B3439]/15 text-[#2B3439]/80 hover:border-[#2E8555]'
                }`}
              >
                <div className="text-right">
                  <p className="text-sm font-heading font-bold">تمّ التّسليم</p>
                  <p className="text-[11px] opacity-75">
                    {order.isDelivered ? 'تم التسليم للطالب' : 'لم يُسلّم بعد'}
                  </p>
                </div>
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    order.isDelivered
                      ? 'bg-[#2E8555] text-white'
                      : 'border-2 border-[#2B3439]/30 bg-white'
                  }`}
                >
                  {order.isDelivered && (
                    <Check className="w-4 h-4 stroke-[3]" />
                  )}
                </span>
              </button>
            </div>
          </div>

          <div className="px-5 sm:px-6 py-4 bg-[#FBF6EE] border-t border-[#2B3439]/10 flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => onRequestDelete(order)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-heading font-bold text-[#9F2D3A] hover:bg-[#FCEBEB] transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف الطلب</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-heading font-bold bg-[#2B3439] hover:bg-[#364147] text-[#F7E8D2] transition cursor-pointer"
              >
                <Pencil className="w-4 h-4 text-[#E2A425]" />
                <span>تعديل</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-sm font-heading font-bold bg-white border border-[#2B3439]/15 hover:bg-[#F7E8D2]/50 text-[#2B3439] transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </>
      )}
    </FormDialog>
  );
}
