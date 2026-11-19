import type { DayRecord, SyncResult } from '@/types/order';
import { storageService } from './storage.service';

export const syncService = {
  /**
   * Sends the day's orders directly from localhost to the Google Apps Script Web App Bridge
   * using text/plain Content-Type to avoid CORS preflight failures against script.google.com.
   */
  async syncDayToGoogleSheet(
    dateKey: string,
    triggerExport = false,
  ): Promise<SyncResult> {
    const config = storageService.getSyncConfig();
    if (!config.webhookUrl) {
      throw new Error(
        'رابط Apps Script غير مضبوط بعد. أضفه في إعدادات المزامنة أو داخل ملف .env',
      );
    }

    const day = storageService.getDay(dateKey);

    const payload = {
      secret: config.secretToken,
      date: day.date,
      coachName: day.coachName ?? '',
      triggerExport,
      orders: day.orders.map((order) => ({
        orderNumber: order.orderNumber,
        studentName: order.studentName,
        requestDetails: order.requestDetails,
        serviceType: order.serviceTypes.join(', '),
        deviceName: order.deviceName ?? '',
        notes: order.notes ?? '',
        isCompleted: order.isCompleted,
        isDelivered: order.isDelivered,
      })),
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const rawText = await response.text();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      if (!response.ok) {
        throw new Error(`فشل الاتصال بـ Google Sheet (HTTP ${response.status})`);
      }
    }

    if (!response.ok || parsed.ok === false) {
      const msg =
        typeof parsed.error === 'string'
          ? parsed.error
          : `فشلت المزامنة (HTTP ${response.status})`;
      throw new Error(msg);
    }

    const updated = storageService.markSynced(
      day.date,
      Boolean(triggerExport && parsed.exported !== false),
    );

    return {
      success: true,
      date: updated.date,
      ordersCount: updated.orders.length,
      exportedToDrive: updated.exportedToDrive,
      syncedAt: updated.syncedAt ?? new Date().toISOString(),
      message: triggerExport
        ? 'تم تفريغ الطلبات في الشيت الأساسية وتصدير ملف Excel إلى Google Drive بنجاح'
        : 'تم تفريغ الطلبات في الشيت الأساسية (I3:O32) بنجاح',
    };
  },

  /**
   * Builds an RTL Excel (.xlsx) workbook object for the given day.
   */
  async buildDayWorkbook(day: DayRecord) {
    const XLSX = await import('xlsx');
    const rows: (string | number)[][] = [
      [`اسم الكوتش : ${day.coachName || 'غير محدد'}`],
      [
        'رقم الطّلب',
        'اسم الطّالب',
        'الطّلب',
        'الخدمة',
        'اسم الجهاز',
        'ملاحظات(باسوورد | رقم)',
        'تمّ الانتهاء',
        'تمّ التّسليم',
      ],
    ];

    const totalRows = Math.max(30, day.orders.length);
    for (let i = 0; i < totalRows; i++) {
      const order = day.orders[i];
      rows.push([
        i + 1,
        order ? order.studentName : '',
        order ? order.requestDetails : '',
        order ? order.serviceTypes.join(', ') : '',
        order ? (order.deviceName ?? '') : '',
        order ? (order.notes ?? '') : '',
        order ? (order.isCompleted ? 'نعم' : 'لا') : '',
        order ? (order.isDelivered ? 'نعم' : 'لا') : '',
      ]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 24 },
      { wch: 32 },
      { wch: 22 },
      { wch: 22 },
      { wch: 30 },
      { wch: 14 },
      { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    workbook.Workbook = { Views: [{ RTL: true }] };
    XLSX.utils.book_append_sheet(workbook, worksheet, `طلبات ${day.date}`);
    return { XLSX, workbook };
  },

  /**
   * Generates and downloads a local RTL Excel (.xlsx) file directly in the browser (lazy-loaded).
   */
  async downloadDayExcel(day: DayRecord): Promise<void> {
    const { XLSX, workbook } = await this.buildDayWorkbook(day);
    XLSX.writeFile(workbook, `HyperTeam-${day.date}.xlsx`);
  },

  /**
   * Generates base64 string of the day's Excel file.
   */
  async generateDayExcelBase64(day: DayRecord): Promise<string> {
    const { XLSX, workbook } = await this.buildDayWorkbook(day);
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
  },

  /**
   * Exports the day's Excel file directly to Google Drive (Statistics folder)
   * WITHOUT touching or modifying the main Google Sheet.
   */
  async exportDayToDriveOnly(dateKey: string): Promise<SyncResult> {
    const config = storageService.getSyncConfig();
    if (!config.webhookUrl) {
      throw new Error(
        'رابط Apps Script غير مضبوط بعد. أضفه في إعدادات المزامنة أو داخل ملف .env',
      );
    }

    const day = storageService.getDay(dateKey);
    const fileBase64 = await this.generateDayExcelBase64(day);

    const payload = {
      secret: config.secretToken,
      date: day.date,
      action: 'exportDriveOnly',
      exportOnly: true,
      fileName: `${day.date}.xlsx`,
      fileBase64,
      coachName: day.coachName ?? '',
      orders: day.orders.map((order) => ({
        orderNumber: order.orderNumber,
        studentName: order.studentName,
        requestDetails: order.requestDetails,
        serviceType: order.serviceTypes.join(', '),
        deviceName: order.deviceName ?? '',
        notes: order.notes ?? '',
        isCompleted: order.isCompleted,
        isDelivered: order.isDelivered,
      })),
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const rawText = await response.text();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      if (!response.ok) {
        throw new Error(
          `فشل الاتصال بـ Google Apps Script (HTTP ${response.status})`,
        );
      }
    }

    if (!response.ok || parsed.ok === false) {
      const msg =
        typeof parsed.error === 'string'
          ? parsed.error
          : `فشل التصدير إلى Drive (HTTP ${response.status})`;
      throw new Error(msg);
    }

    const updated = storageService.markSynced(day.date, true);

    return {
      success: true,
      date: updated.date,
      ordersCount: updated.orders.length,
      exportedToDrive: true,
      syncedAt: updated.syncedAt ?? new Date().toISOString(),
      message: `تم تصدير ملف ${day.date}.xlsx إلى Google Drive بنجاح (بدون المساس بالشيت)`,
    };
  },
};
