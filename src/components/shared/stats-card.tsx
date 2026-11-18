import type { LucideIcon } from 'lucide-react';

export type StatsCardTone = 'neutral' | 'orange' | 'gold' | 'delivered';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  tone?: StatsCardTone;
}

const TONE_STYLES: Record<
  StatsCardTone,
  { card: string; iconWrap: string; value: string; topBar: string }
> = {
  neutral: {
    card: 'bg-white border-[#2B3439]/10',
    iconWrap: 'bg-[#F7E8D2]/85 text-[#2B3439]',
    value: 'text-[#2B3439]',
    topBar: 'bg-[#2B3439]/20',
  },
  orange: {
    card: 'bg-white border-[#D27728]/25',
    iconWrap: 'bg-[#D27728]/12 text-[#D27728]',
    value: 'text-[#D27728]',
    topBar: 'bg-[#D27728]',
  },
  gold: {
    card: 'bg-white border-[#E2A425]/35',
    iconWrap: 'bg-[#E2A425]/15 text-[#9A6B10]',
    value: 'text-[#2B3439]',
    topBar: 'bg-[#E2A425]',
  },
  delivered: {
    card: 'bg-[#F2FAF5] border-[#2E8555]/25',
    iconWrap: 'bg-[#2E8555]/14 text-[#236B43]',
    value: 'text-[#1E5C39]',
    topBar: 'bg-[#2E8555]',
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  tone = 'neutral',
}: StatsCardProps) {
  const style = TONE_STYLES[tone];

  return (
    <div
      className={`rounded-2xl border shadow-[var(--ht-shadow-sm)] transition-shadow hover:shadow-[var(--ht-shadow-md)] overflow-hidden ${style.card}`}
    >
      {/* Colored top accent bar */}
      <div className={`h-1 w-full ${style.topBar} opacity-70`} />
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#2B3439]/70 leading-snug">
            {title}
          </p>
          <p
            className={`font-en text-2xl sm:text-[26px] font-bold leading-tight mt-1 ${style.value}`}
          >
            {value}
          </p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${style.iconWrap}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
