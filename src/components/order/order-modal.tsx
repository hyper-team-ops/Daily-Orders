import { Pencil, Plus } from 'lucide-react';
import { FormDialog } from '@/components/shared/form-dialog';
import type { DayRecord, Order } from '@/types/order';
import { OrderForm } from './order-form';

interface OrderModalProps {
  open: boolean;
  dateKey: string;
  entity?: Order | null;
  onClose: () => void;
  onSuccess: (updatedDay: DayRecord) => void;
}

export function OrderModal({
  open,
  dateKey,
  entity,
  onClose,
  onSuccess,
}: OrderModalProps) {
  const isEdit = Boolean(entity);

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={isEdit ? `تعديل الطلب #${entity?.orderNumber}` : 'إضافة طلب جديد'}
      subtitle={dateKey}
      maxWidthClass="max-w-[560px]"
      icon={
        <div className="w-9 h-9 rounded-full bg-[#E2A425] text-[#2B3439] flex items-center justify-center shrink-0 shadow-xs">
          {isEdit ? (
            <Pencil className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <Plus className="w-5 h-5 stroke-[2.75]" />
          )}
        </div>
      }
    >
      <OrderForm
        key={entity?.id ?? 'new'}
        dateKey={dateKey}
        entity={entity}
        onSuccess={(updatedDay) => {
          onSuccess(updatedDay);
          onClose();
        }}
        onCancel={onClose}
      />
    </FormDialog>
  );
}
