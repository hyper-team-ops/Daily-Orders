import type { RefObject } from 'react';
import { Search, X } from 'lucide-react';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  searchInputRef,
}: SearchFilterBarProps) {
  return (
    <div className="bg-white p-2 rounded-2xl border border-[#2B3439]/10 shadow-[var(--ht-shadow-sm)]">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-[#2B3439]/45 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث باسم الطالب، الطلب، أو الجهاز... (Ctrl+K)"
          aria-label="بحث في الطلبات"
          className="w-full pr-11 pl-10 py-2.5 sm:py-3 text-sm rounded-xl bg-[#FBF6EE]/70 focus:bg-white border border-[#2B3439]/10 focus:border-[#E2A425] focus:ring-2 focus:ring-[#E2A425]/20 focus:outline-none transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2B3439]/45 hover:text-[#2B3439] p-1 rounded-lg hover:bg-black/5 cursor-pointer"
            aria-label="مسح البحث"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
