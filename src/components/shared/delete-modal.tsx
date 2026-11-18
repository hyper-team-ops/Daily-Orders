import { AlertTriangle, X } from 'lucide-react';

interface DeleteModalProps {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteModal({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: DeleteModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-[#2B3439]/65 backdrop-blur-[3px]"
        onClick={onCancel}
      />
      <div className="animate-modal-enter relative z-10 w-full max-w-md bg-white rounded-3xl shadow-[var(--ht-shadow-modal)] border border-[#2B3439]/12 overflow-hidden">
        <div className="px-6 py-4 bg-[#FCEBEB] border-b border-[#E8B7BC] flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[#8A222E]">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-heading text-base font-extrabold">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-[#8A222E]/10 text-[#8A222E] cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-[#2B3439]/80 leading-relaxed">
            {description}
          </p>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm font-heading font-bold bg-[#FBF6EE] text-[#2B3439]/80 hover:bg-[#F7E8D2] transition cursor-pointer"
            >
              تراجع
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-5 py-2 rounded-xl text-sm font-heading font-bold bg-[#B53A48] hover:bg-[#962836] text-white shadow-xs transition cursor-pointer"
            >
              نعم، احذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
