import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`bg-white/85 rounded-2xl border border-dashed border-[#2B3439]/18 text-center flex flex-col items-center justify-center ${
        compact ? 'py-7 px-4' : 'py-11 px-6'
      }`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#F7E8D2]/70 text-[#2B3439]/55 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <p className="font-heading text-sm font-bold text-[#2B3439]/80">
        {title}
      </p>
      {description && (
        <p className="text-xs text-[#2B3439]/55 mt-1 max-w-sm">{description}</p>
      )}
    </div>
  );
}
