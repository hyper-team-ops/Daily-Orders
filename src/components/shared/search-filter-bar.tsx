import type { RefObject } from 'react';
import { Search, X } from 'lucide-react';
import { SERVICE_OPTIONS, SERVICE_STYLE } from '@/lib/service-styles';
import type { ServiceType } from '@/types/order';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedService: ServiceType | 'ALL';
  onServiceChange: (service: ServiceType | 'ALL') => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedService,
  onServiceChange,
  searchInputRef,
}: SearchFilterBarProps) {
  return (
    <div className="bg-white p-3.5 rounded-2xl border border-[#2B3439]/10 shadow-[var(--ht-shadow-sm)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      <div className="relative flex-1 lg:max-w-md">
        <Search className="w-4 h-4 text-[#2B3439]/45 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث باسم الطالب، الطلب، أو الجهاز... (Ctrl+K)"
          aria-label="بحث في الطلبات"
          className="w-full pr-10 pl-9 py-2.5 text-sm rounded-xl bg-[#FBF6EE] border border-[#2B3439]/10 focus:bg-white focus:border-[#E2A425] focus:ring-2 focus:ring-[#E2A425]/25 focus:outline-none transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B3439]/45 hover:text-[#2B3439] cursor-pointer"
            aria-label="مسح البحث"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onServiceChange('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold border transition cursor-pointer ${
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
              onClick={() => onServiceChange(service)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-heading font-bold border transition cursor-pointer ${
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
  );
}
