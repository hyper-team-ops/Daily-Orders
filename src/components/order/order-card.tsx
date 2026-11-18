import { Check, Clock, Eye, Laptop } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatTime } from '@/lib/date';
import { SERVICE_STYLE } from '@/lib/service-styles';
import type { Order } from '@/types/order';

interface OrderCardProps {
  order: Order;
  onToggleCompleted: (order: Order) => void;
  onToggleDelivered: (order: Order) => void;
  onOpenDetails: (order: Order) => void;
}

export function OrderCard({
  order,
  onToggleCompleted,
  onToggleDelivered,
  onOpenDetails,
}: OrderCardProps) {
  const accentBar = order.isDelivered
    ? 'bg-[#2E8555]'
    : order.isCompleted
      ? 'bg-[#E2A425]'
      : 'bg-[#D27728]';

  return (
    <article
      onClick={() => onOpenDetails(order)}
      className={`group relative bg-white rounded-2xl border transition-all duration-150 overflow-hidden shadow-[var(--ht-shadow-sm)] hover:shadow-[var(--ht-shadow-md)] cursor-pointer ${
        order.isDelivered
          ? 'border-[#2E8555]/25 bg-[#FBFDFC] opacity-80 hover:opacity-100'
          : 'border-[#2B3439]/10'
      }`}
    >
      <div className={`h-1.5 w-full ${accentBar}`} />

      <div className="p-4 flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center justify-center min-w-[30px] h-6 px-2 rounded-lg bg-[#2B3439] text-[#F7E8D2] text-xs font-bold font-en">
              #{order.orderNumber}
            </span>
            {order.serviceTypes.map((service) => {
              const style = SERVICE_STYLE[service] ?? SERVICE_STYLE['برامج'];
              const Icon = style.icon;
              return (
                <span
                  key={service}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold border ${style.bg} ${style.text} ${style.border}`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span>{service}</span>
                </span>
              );
            })}
          </div>

          <StatusBadge
            isCompleted={order.isCompleted}
            isDelivered={order.isDelivered}
          />
        </div>

        <div>
          <h3 className={`font-heading text-base sm:text-lg font-extrabold leading-snug transition-colors ${order.isDelivered ? 'text-[#2B3439]/50 line-through decoration-[#2E8555]/50 decoration-1' : 'text-[#2B3439]'}`}>
            {order.studentName}
          </h3>
          <p className="text-xs sm:text-sm text-[#2B3439]/70 mt-1 line-clamp-2 leading-relaxed">
            {order.requestDetails}
          </p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {order.deviceName && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#2B3439]/75 bg-[#FBF6EE] border border-[#2B3439]/8 px-2.5 py-1 rounded-lg font-en">
                <Laptop className="w-3.5 h-3.5 text-[#D27728] shrink-0" />
                <span className="truncate max-w-[180px]">
                  {order.deviceName}
                </span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-[#2B3439]/55">
              <Clock className="w-3 h-3" />
              <span>{formatTime(order.createdAt)}</span>
            </span>
          </div>
        </div>

        <div className="h-px bg-[#2B3439]/8" />

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div
            className="flex items-center gap-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none group/chk">
              <button
                type="button"
                role="checkbox"
                aria-checked={order.isCompleted}
                onClick={() => onToggleCompleted(order)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition cursor-pointer ${
                  order.isCompleted
                    ? 'bg-[#E2A425] border-[#E2A425] text-[#2B3439]'
                    : 'bg-white border-[#2B3439]/30 group-hover/chk:border-[#E2A425]'
                }`}
              >
                {order.isCompleted && (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                )}
              </button>
              <span className="text-xs font-semibold text-[#2B3439]/85">
                تم الانتهاء
              </span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none group/del">
              <button
                type="button"
                role="checkbox"
                aria-checked={order.isDelivered}
                onClick={() => onToggleDelivered(order)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition cursor-pointer ${
                  order.isDelivered
                    ? 'bg-[#2E8555] border-[#2E8555] text-white'
                    : 'bg-white border-[#2B3439]/30 group-hover/del:border-[#2E8555]'
                }`}
              >
                {order.isDelivered && (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                )}
              </button>
              <span className="text-xs font-semibold text-[#2B3439]/85">
                تم التسليم
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(order);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-bold bg-[#F7E8D2] hover:bg-[#E2A425] text-[#2B3439] transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>التفاصيل</span>
          </button>
        </div>
      </div>
    </article>
  );
}
