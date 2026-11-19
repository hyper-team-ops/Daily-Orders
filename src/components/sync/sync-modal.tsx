import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CloudUpload,
  FileSpreadsheet,
  FolderUp,
  Loader2,
  Save,
  Settings2,
} from 'lucide-react';
import { FormDialog } from '@/components/shared/form-dialog';
import { formatArabicDate, formatTime } from '@/lib/date';
import { scheduleLiveSheetSync } from '@/services/live-sheet-sync';
import { storageService } from '@/services/storage.service';
import { syncService } from '@/services/sync.service';
import type { DayRecord } from '@/types/order';

interface SyncModalProps {
  open: boolean;
  onClose: () => void;
  day: DayRecord;
  onSynced: (updatedDay: DayRecord) => void;
}

export function SyncModal({ open, onClose, day, onSynced }: SyncModalProps) {
  const initialConfig = storageService.getSyncConfig();
  const [webhookUrl, setWebhookUrl] = useState(initialConfig.webhookUrl);
  const [secretToken, setSecretToken] = useState(initialConfig.secretToken);
  const [autoTriggerExport, setAutoTriggerExport] = useState(
    initialConfig.autoTriggerExport,
  );
  const [showSettings, setShowSettings] = useState(!initialConfig.webhookUrl);

  useEffect(() => {
    if (!open) return;
    const latest = storageService.getSyncConfig();
    setWebhookUrl(latest.webhookUrl);
    setSecretToken(latest.secretToken);
    setAutoTriggerExport(latest.autoTriggerExport);
    setShowSettings(!latest.webhookUrl);
  }, [open]);

  const [loadingAction, setLoadingAction] = useState<'sheet' | 'export' | null>(
    null,
  );
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const isConfigured = Boolean(webhookUrl.trim());

  const handleSaveSettings = () => {
    const saved = storageService.saveSyncConfig({
      webhookUrl,
      secretToken,
      autoTriggerExport,
    });
    if (saved.webhookUrl && day.orders.length > 0) {
      scheduleLiveSheetSync(day.date);
    }
    setFeedback({
      type: 'success',
      message: 'تم حفظ إعدادات الربط مع Google Sheet بنجاح',
    });
    setShowSettings(false);
  };

  const handleSync = async (triggerExport: boolean) => {
    storageService.saveSyncConfig({
      webhookUrl,
      secretToken,
      autoTriggerExport,
    });
    setFeedback(null);
    setLoadingAction(triggerExport ? 'export' : 'sheet');
    try {
      const res = await syncService.syncDayToGoogleSheet(
        day.date,
        triggerExport,
      );
      onSynced(storageService.getDay(day.date));
      setFeedback({ type: 'success', message: res.message });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'فشلت عملية المزامنة',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={() => {
        setFeedback(null);
        onClose();
      }}
      title="المزامنة والتفريغ في الشيت"
      subtitle={formatArabicDate(day.date)}
      icon={
        <div className="w-9 h-9 rounded-full bg-[#E2A425] text-[#2B3439] flex items-center justify-center shrink-0">
          <CloudUpload className="w-4 h-4 stroke-[2.5]" />
        </div>
      }
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Status Summary */}
        <div className="p-4 rounded-2xl bg-[#FBF6EE] border border-[#2B3439]/10 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#2B3439]/70 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D27728]" />
              التفريغ التلقائي اليومي:
            </span>
            <span className="font-heading font-bold text-[#2B3439]">
              الساعة 3:00 عصراً (الأحد – الخميس)
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[#2B3439]/70">حالة الربط مع الشيت:</span>
            <div className="flex items-center gap-2">
              {isConfigured ? (
                <span className="inline-flex items-center gap-1 font-heading font-bold text-[#1E6B40]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  متصل
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-heading font-bold text-[#D27728]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  أضف رابط Apps Script
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowSettings((prev) => !prev)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-[#2B3439]/12 hover:bg-[#F7E8D2] text-[11px] font-heading font-bold text-[#2B3439] cursor-pointer"
              >
                <Settings2 className="w-3 h-3" />
                <span>{showSettings ? 'إخفاء' : 'إعدادات'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#2B3439]/70">عدد الطلبات في هذا اليوم:</span>
            <span className="font-heading font-bold text-[#2B3439]">
              {day.orders.length} طلب
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#2B3439]/70">آخر تفريغ لهذا اليوم:</span>
            <span className="font-heading font-bold text-[#2B3439]">
              {day.syncedAt ? formatTime(day.syncedAt) : 'لم يتم بعد'}
            </span>
          </div>
        </div>

        {/* Inline Webhook Settings */}
        {showSettings && (
          <div className="p-4 rounded-2xl bg-white border border-[#E2A425]/60 space-y-3">
            <div>
              <label
                htmlFor="gas-url"
                className="block text-xs font-heading font-bold text-[#2B3439] mb-1"
              >
                رابط Apps Script Web App
              </label>
              <input
                id="gas-url"
                type="url"
                dir="ltr"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full h-10 px-3 rounded-xl border border-[#2B3439]/18 bg-[#FBF6EE]/70 focus:bg-white focus:border-[#E2A425] focus:outline-none text-xs font-en"
              />
            </div>

            <div>
              <label
                htmlFor="gas-secret"
                className="block text-xs font-heading font-bold text-[#2B3439] mb-1"
              >
                المفتاح السري (BRIDGE_SECRET_TOKEN)
              </label>
              <input
                id="gas-secret"
                type="text"
                dir="ltr"
                value={secretToken}
                onChange={(e) => setSecretToken(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#2B3439]/18 bg-[#FBF6EE]/70 focus:bg-white focus:border-[#E2A425] focus:outline-none text-xs font-en"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-[#2B3439]/80 cursor-pointer">
              <input
                type="checkbox"
                checked={autoTriggerExport}
                onChange={(e) => setAutoTriggerExport(e.target.checked)}
                className="accent-[#E2A425] w-4 h-4"
              />
              <span>
                عند الساعة 3:00 عصراً: تصدير ملف Excel إلى Drive مباشرة أيضاً
                (اختياري)
              </span>
            </label>

            <button
              type="button"
              onClick={handleSaveSettings}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2B3439] hover:bg-[#364147] text-[#F7E8D2] text-xs font-heading font-bold cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#E2A425]" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        )}

        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-sm font-medium border flex items-start gap-2 ${
              feedback.type === 'success'
                ? 'bg-[#E6F6EC] border-[#BBE5CB] text-[#1E6B40]'
                : 'bg-[#FCEBEB] border-[#E8B7BC] text-[#8A222E]'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Action 1: Flush to Main Google Sheet */}
        <button
          type="button"
          disabled={loadingAction !== null || !isConfigured}
          onClick={() => handleSync(false)}
          className="w-full p-4 rounded-2xl border-2 border-[#E2A425] bg-[#F7E8D2]/70 hover:bg-[#F7E8D2] transition text-right flex items-center justify-between gap-3 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E2A425] text-[#2B3439] flex items-center justify-center shrink-0">
              {loadingAction === 'sheet' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CloudUpload className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="font-heading text-sm font-bold text-[#2B3439]">
                تفريغ في الشيت الأساسية الآن (Google Sheet)
              </p>
              <p className="text-xs text-[#2B3439]/75">
                يكتب اسم الكوتش (H1) وجميع الطلبات في النطاق I3:O32
              </p>
            </div>
          </div>
        </button>

        {/* Action 2: Flush + Export to Drive */}
        <button
          type="button"
          disabled={loadingAction !== null || !isConfigured}
          onClick={() => handleSync(true)}
          className="w-full p-4 rounded-2xl border-2 border-[#2B3439]/15 hover:border-[#E2A425] bg-white hover:bg-[#FBF6EE] transition text-right flex items-center justify-between gap-3 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F7E8D2] text-[#D27728] flex items-center justify-center shrink-0">
              {loadingAction === 'export' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FolderUp className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="font-heading text-sm font-bold text-[#2B3439]">
                تفريغ في الشيت + تصدير فوري إلى Drive
              </p>
              <p className="text-xs text-[#2B3439]/65">
                يكتب الطلبات ثم يرفع {day.date}.xlsx إلى Statistics في Drive
              </p>
            </div>
          </div>
        </button>

        {/* Action 3: Local Offline Excel Download */}
        <button
          type="button"
          onClick={() => void syncService.downloadDayExcel(day)}
          className="w-full p-4 rounded-2xl border-2 border-[#2B3439]/20 hover:border-[#2B3439] bg-[#2B3439] hover:bg-[#364147] transition text-right flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E2A425] text-[#2B3439] flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading text-sm font-bold text-[#F7E8D2]">
                تنزيل ملف Excel محلياً (.xlsx)
              </p>
              <p className="text-xs text-[#F7E8D2]/75">
                يعمل بدون إنترنت — ملف RTL مطابق لترتيب أعمدة الشيت
              </p>
            </div>
          </div>
        </button>
      </div>
    </FormDialog>
  );
}
