import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidthClass?: string;
}

export function FormDialog({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidthClass = 'max-w-[560px]',
}: FormDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-[#2B3439]/65 backdrop-blur-[3px] transition-opacity"
        onClick={onClose}
      />
      <div
        className={`animate-modal-enter relative z-10 w-full ${maxWidthClass} bg-white rounded-3xl shadow-[var(--ht-shadow-modal)] border border-[#2B3439]/12 overflow-hidden max-h-[92vh] flex flex-col`}
      >
        <div className="bg-[#2B3439] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b-[3px] border-[#E2A425] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {icon}
            <div className="min-w-0">
              <h2 className="font-heading text-base sm:text-lg font-extrabold leading-tight truncate text-white">
                {title}
              </h2>
              {subtitle && (
                <p
                  className="text-[11px] text-[#F7E8D2]/75 font-en mt-0.5 truncate"
                  dir="ltr"
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/12 text-[#F7E8D2]/80 hover:text-white transition cursor-pointer shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
