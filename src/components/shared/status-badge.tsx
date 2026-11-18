import { CheckCircle2, Clock, Hourglass } from 'lucide-react';

interface StatusBadgeProps {
  isCompleted: boolean;
  isDelivered: boolean;
}

export function StatusBadge({ isCompleted, isDelivered }: StatusBadgeProps) {
  if (isDelivered) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-heading font-bold bg-[#E6F6EC] text-[#1E6B40] border border-[#BBE5CB] shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>تم التسليم</span>
      </span>
    );
  }

  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-heading font-bold bg-[#FDF3DC] text-[#8B600D] border border-[#EBD293] shrink-0">
        <Hourglass className="w-3.5 h-3.5 shrink-0" />
        <span>تم الانتهاء</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-heading font-bold bg-[#FBECE0] text-[#A65314] border border-[#EBC3A4] shrink-0">
      <Clock className="w-3.5 h-3.5 shrink-0" />
      <span>تم الاستلام</span>
    </span>
  );
}
