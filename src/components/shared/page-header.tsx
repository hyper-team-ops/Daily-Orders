import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
      <div className="flex items-start gap-3 min-w-0">
        {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#2B3439] leading-tight">
              {title}
            </h2>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-[#2B3439]/60 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
