import { useState, type FormEvent } from 'react';
import {
  Check,
  FileText,
  KeyRound,
  Laptop,
  Layers,
  Plus,
  Save,
  User,
} from 'lucide-react';
import { SERVICE_OPTIONS, SERVICE_STYLE } from '@/lib/service-styles';
import { storageService } from '@/services/storage.service';
import type { DayRecord, Order, ServiceType } from '@/types/order';

interface OrderFormProps {
  dateKey: string;
  entity?: Order | null;
  onSuccess: (updatedDay: DayRecord) => void;
  onCancel: () => void;
}

export function OrderForm({
  dateKey,
  entity,
  onSuccess,
  onCancel,
}: OrderFormProps) {
  const isEdit = Boolean(entity);

  const [studentName, setStudentName] = useState(entity?.studentName ?? '');
  const [requestDetails, setRequestDetails] = useState(
    entity?.requestDetails ?? '',
  );
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>(
    entity?.serviceTypes?.length ? [...entity.serviceTypes] : ['برامج'],
  );
  const [deviceName, setDeviceName] = useState(entity?.deviceName ?? '');
  const [notes, setNotes] = useState(entity?.notes ?? '');
  const [isCompleted, setIsCompleted] = useState(entity?.isCompleted ?? false);
  const [isDelivered, setIsDelivered] = useState(entity?.isDelivered ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleService = (service: ServiceType) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((item) => item !== service)
        : [...prev, service],
    );
  };

  const toggleDelivered = () => {
    setIsDelivered((prev) => {
      const next = !prev;
      if (next) setIsCompleted(true);
      return next;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!studentName.trim()) {
      nextErrors.studentName = 'يرجى إدخال اسم الطالب';
    }
    if (!requestDetails.trim()) {
      nextErrors.requestDetails = 'يرجى إدخال تفاصيل الطلب';
    }
    if (!deviceName.trim()) {
      nextErrors.deviceName = 'يرجى إدخال اسم الجهاز';
    }
    if (selectedServices.length === 0) {
      nextErrors.serviceTypes = 'يرجى اختيار خدمة واحدة على الأقل';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    const updatedDay = entity
      ? storageService.updateOrder(dateKey, entity.id, {
          studentName: studentName.trim(),
          requestDetails: requestDetails.trim(),
          serviceTypes: selectedServices,
          deviceName: deviceName.trim() || null,
          notes: notes.trim() || null,
          isCompleted: isDelivered ? true : isCompleted,
          isDelivered,
        })
      : storageService.createOrder(dateKey, {
          studentName: studentName.trim(),
          requestDetails: requestDetails.trim(),
          serviceTypes: selectedServices,
          deviceName: deviceName.trim() || null,
          notes: notes.trim() || null,
        });

    onSuccess(updatedDay);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
      {Object.keys(errors).length > 0 && (
        <div className="p-3 rounded-xl bg-[#FCEBEB] border border-[#E8B7BC] text-[#8A222E] text-xs sm:text-sm font-semibold">
          يرجى تعبئة الحقول المطلوبة بشكل صحيح
        </div>
      )}

      {/* 1. Student Name */}
      <div>
        <label
          htmlFor="order-studentName"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-heading font-bold text-[#2B3439] mb-1.5"
        >
          <User className="w-4 h-4 text-[#D27728]" />
          <span>اسم الطالب</span>
          <span className="text-[#D27728]">*</span>
        </label>
        <input
          id="order-studentName"
          type="text"
          autoFocus
          required
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="مثال: محمد الأحمد"
          className="w-full h-11 px-3.5 rounded-xl border border-[#2B3439]/18 bg-[#FBF6EE]/65 focus:bg-white focus:border-[#E2A425] focus:ring-2 focus:ring-[#E2A425]/30 focus:outline-none text-sm transition"
        />
        {errors.studentName && (
          <p className="text-xs text-[#A65314] font-semibold mt-1">
            {errors.studentName}
          </p>
        )}
      </div>

      {/* 2. Multi-Select Service Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-xs sm:text-sm font-heading font-bold text-[#2B3439]">
            <Layers className="w-4 h-4 text-[#D27728]" />
            <span>الخدمة</span>
            <span className="text-[#D27728]">*</span>
          </span>
          <span className="text-[11px] font-medium text-[#2B3439]/55">
            يمكن اختيار أكثر من خدمة ({selectedServices.length})
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {SERVICE_OPTIONS.map((service) => {
            const style = SERVICE_STYLE[service];
            const Icon = style.icon;
            const active = selectedServices.includes(service);
            return (
              <button
                key={service}
                type="button"
                aria-pressed={active}
                onClick={() => toggleService(service)}
                className={`relative rounded-xl border-2 px-3 py-3 transition-all duration-150 cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center ${
                  active
                    ? `${style.cardSelected} shadow-xs`
                    : `${style.cardBg} opacity-85 hover:opacity-100 hover:shadow-2xs`
                }`}
              >
                <span
                  className={`absolute top-2 left-2 w-4 h-4 rounded-full flex items-center justify-center transition ${
                    active
                      ? 'bg-[#D27728] text-white'
                      : 'border border-current/25 bg-white/70'
                  }`}
                >
                  {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
                <Icon className={`w-5 h-5 ${style.iconColor}`} />
                <span className="font-heading text-xs sm:text-sm font-bold leading-tight">
                  {service}
                </span>
              </button>
            );
          })}
        </div>
        {errors.serviceTypes && (
          <p className="text-xs text-[#A65314] font-semibold mt-1">
            {errors.serviceTypes}
          </p>
        )}
      </div>

      {/* 3. Request Details */}
      <div>
        <label
          htmlFor="order-requestDetails"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-heading font-bold text-[#2B3439] mb-1.5"
        >
          <FileText className="w-4 h-4 text-[#D27728]" />
          <span>الطلب</span>
          <span className="text-[#D27728]">*</span>
        </label>
        <textarea
          id="order-requestDetails"
          required
          rows={2}
          value={requestDetails}
          onChange={(e) => setRequestDetails(e.target.value)}
          placeholder="مثال: Windows 11 + VS Code + Office"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#2B3439]/18 bg-[#FBF6EE]/65 focus:bg-white focus:border-[#E2A425] focus:ring-2 focus:ring-[#E2A425]/30 focus:outline-none text-sm transition resize-none"
        />
        {errors.requestDetails && (
          <p className="text-xs text-[#A65314] font-semibold mt-1">
            {errors.requestDetails}
          </p>
        )}
      </div>

      {/* 4 & 5. Device Name + Optional Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="order-deviceName"
            className="flex items-center gap-1.5 text-xs font-heading font-bold text-[#2B3439] mb-1.5"
          >
            <Laptop className="w-3.5 h-3.5 text-[#D27728]" />
            <span>اسم الجهاز</span>
            <span className="text-[#D27728]">*</span>
            <span className="text-[11px] font-normal text-[#2B3439]/50">
              (نوع اللابتوب)
            </span>
          </label>
          <input
            id="order-deviceName"
            type="text"
            required
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="مثال: HP Victus / Lenovo IdeaPad"
            className="w-full h-11 px-3.5 rounded-xl border border-[#2B3439]/18 bg-[#FBF6EE]/65 focus:bg-white focus:border-[#E2A425] focus:ring-2 focus:ring-[#E2A425]/30 focus:outline-none text-sm transition"
          />
          {errors.deviceName && (
            <p className="text-xs text-[#A65314] font-semibold mt-1">
              {errors.deviceName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="order-notes"
            className="flex items-center gap-1.5 text-xs font-heading font-bold text-[#2B3439] mb-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#2B3439]/70" />
            <span>ملاحظات (باسوورد | رقم)</span>
            <span className="text-[11px] font-normal text-[#D27728]">
              (اختياري)
            </span>
          </label>
          <input
            id="order-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="كلمة سر الجهاز أو رقم هاتف الطالب إن وجد..."
            className="w-full h-11 px-3.5 rounded-xl border border-[#2B3439]/18 bg-[#FBF6EE]/65 focus:bg-white focus:border-[#E2A425] focus:ring-2 focus:ring-[#E2A425]/30 focus:outline-none text-sm transition"
          />
        </div>
      </div>

      {/* Status toggles when Editing */}
      {isEdit && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsCompleted((prev) => !prev)}
            className={`flex items-center justify-between p-3 rounded-xl border-2 transition cursor-pointer ${
              isCompleted
                ? 'bg-[#FDF3DC] border-[#E2A425] text-[#2B3439]'
                : 'bg-[#FBF6EE] border-[#2B3439]/15 text-[#2B3439]/75'
            }`}
          >
            <span className="text-sm font-heading font-bold">تمّ الانتهاء</span>
            <span
              className={`w-5 h-5 rounded-md flex items-center justify-center ${
                isCompleted
                  ? 'bg-[#E2A425] text-[#2B3439]'
                  : 'border-2 border-[#2B3439]/30 bg-white'
              }`}
            >
              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleDelivered}
            className={`flex items-center justify-between p-3 rounded-xl border-2 transition cursor-pointer ${
              isDelivered
                ? 'bg-[#E6F6EC] border-[#2E8555] text-[#1E5C39]'
                : 'bg-[#FBF6EE] border-[#2B3439]/15 text-[#2B3439]/75'
            }`}
          >
            <span className="text-sm font-heading font-bold">تمّ التّسليم</span>
            <span
              className={`w-5 h-5 rounded-md flex items-center justify-center ${
                isDelivered
                  ? 'bg-[#2E8555] text-white'
                  : 'border-2 border-[#2B3439]/30 bg-white'
              }`}
            >
              {isDelivered && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </span>
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="pt-3 border-t border-[#2B3439]/10 flex items-center justify-start gap-2.5">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 px-6 h-11 rounded-xl text-sm font-heading font-bold bg-[#E2A425] hover:bg-[#D27728] text-[#2B3439] hover:text-white shadow-sm transition cursor-pointer"
        >
          {isEdit ? (
            <Save className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>{isEdit ? 'حفظ التعديلات' : 'إضافة الطلب'}</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-5 h-11 rounded-xl text-sm font-heading font-bold bg-[#FBF6EE] hover:bg-[#F7E8D2] text-[#2B3439]/80 border border-[#2B3439]/10 transition cursor-pointer"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
