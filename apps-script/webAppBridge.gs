/**
 * HyperTeam Daily Orders — Google Apps Script Web App Bridge (Frontend-Direct)
 *
 * ترتيب الأعمدة الفعلي في الشيت (LTR بأعمدة I إلى P):
 *   I = تمّ التّسليم (Checkbox)
 *   J = تمّ الانتهاء (Checkbox)
 *   K = ملاحظات(باسوورد | رقم)
 *   L = اسم الجهاز
 *   M = الخدمة
 *   N = الطّلب
 *   O = اسم الطّالب
 *   P = رقم الطّلب (ثابت)
 *   I1:P1 = اسم الكوتش : ...
 */

const BRIDGE_SECRET_TOKEN = "hyperteam-change-me";
const COACH_HEADER_CELL = "I1";
const DATA_START_ROW = 3;
const MAX_ROWS = 30; // الصفوف 3 إلى 32
const CHECKBOX_RANGE = "I3:J32";
const TEXT_DATA_RANGE = "K3:O32";

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      service: "HyperTeam Daily Orders Bridge",
      timestamp: new Date().toISOString(),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * يستقبل الطلبات مباشرة من المتصفح (بصيغة text/plain JSON لتفادي CORS preflight)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ ok: false, error: "Empty request body" });
    }

    const payload = JSON.parse(e.postData.contents);

    if (BRIDGE_SECRET_TOKEN && payload.secret !== BRIDGE_SECRET_TOKEN) {
      return jsonResponse_({ ok: false, error: "Unauthorized: Invalid secret token" });
    }

    // الخيار 1: تصدير إلى Google Drive فقط (بدون أي تعديل على الشيت الأساسية)
    if (payload.action === "exportDriveOnly" || payload.exportOnly === true) {
      const exportResult = exportToDriveOnly_(payload);
      return jsonResponse_({
        ok: true,
        exported: true,
        fileId: exportResult.fileId,
        fileName: exportResult.fileName,
        folderPath: exportResult.folderPath,
      });
    }

    // الخيار 2: تفريغ في الشيت الأساسية (Google Sheet)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0];

    // 1. تحديث اسم الكوتش في الصف الأول (I1:P1)
    if (payload.coachName) {
      sheet.getRange(COACH_HEADER_CELL).setValue("اسم الكوتش : " + payload.coachName);
    }

    // 2. تفريغ النصوص وإعادة الـ Checkboxes إلى غير محدد (مع ضمان بقائها Checkboxes حقيقية)
    sheet.getRange(TEXT_DATA_RANGE).clearContent();
    const checkboxRange = sheet.getRange(CHECKBOX_RANGE);
    checkboxRange.insertCheckboxes();
    checkboxRange.uncheck();

    // 3. كتابة الطلبات بالترتيب المطابق لأعمدة الشيت (I → O)
    const orders = Array.isArray(payload.orders) ? payload.orders : [];
    const rowsToWrite = orders.slice(0, MAX_ROWS).map(function (order) {
      return [
        Boolean(order.isDelivered),       // Col I: تمّ التّسليم
        Boolean(order.isCompleted),       // Col J: تمّ الانتهاء
        order.notes || "",                // Col K: ملاحظات(باسوورد | رقم)
        order.deviceName || "",           // Col L: اسم الجهاز
        order.serviceType || "",          // Col M: الخدمة
        order.requestDetails || "",       // Col N: الطّلب
        order.studentName || "",          // Col O: اسم الطّالب
      ];
    });

    if (rowsToWrite.length > 0) {
      sheet
        .getRange(DATA_START_ROW, 9, rowsToWrite.length, 7) // Col 9 = I..O
        .setValues(rowsToWrite);
    }

    SpreadsheetApp.flush();

    // 4. تصدير الشيت إلى Drive إذا طُلب ذلك مع المزامنة
    var exported = false;
    if (payload.triggerExport === true) {
      exportSheetWithDate_(ss, payload.date);
      exported = true;
    }

    return jsonResponse_({
      ok: true,
      writtenRows: rowsToWrite.length,
      exported: exported,
    });
  } catch (err) {
    return jsonResponse_({
      ok: false,
      error: err && err.message ? err.message : String(err),
    });
  }
}

/**
 * تصدير ملف Excel إلى Drive في مجلد Statistics/Year/Month دون تعديل الشيت الأساسية
 */
function exportToDriveOnly_(payload) {
  const ROOT_FOLDER_NAME = "Statistics";
  const timeZone = Session.getScriptTimeZone();
  const targetDate = payload.date
    ? new Date(payload.date + "T12:00:00")
    : new Date();

  const yearString = Utilities.formatDate(targetDate, timeZone, "yyyy");
  const monthString = Utilities.formatDate(targetDate, timeZone, "MMMM");
  const dateStamp = payload.date || Utilities.formatDate(targetDate, timeZone, "yyyy-MM-dd");
  const fileName = payload.fileName || (dateStamp + ".xlsx");

  const rootFolder = bridgeGetOrCreateFolder_(DriveApp.getRootFolder(), ROOT_FOLDER_NAME);
  const yearFolder = bridgeGetOrCreateFolder_(rootFolder, yearString);
  const monthFolder = bridgeGetOrCreateFolder_(yearFolder, monthString);

  var createdFile;
  if (payload.fileBase64) {
    // ملف Excel تم إنشاؤه بالمتصفح وتحويله إلى Base64
    const bytes = Utilities.base64Decode(payload.fileBase64);
    const blob = Utilities.newBlob(
      bytes,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileName
    );
    createdFile = monthFolder.createFile(blob);
  } else {
    // كحل احتياطي: تصدير نسخة من الشيت دون تفريغها
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetId = ss.getId();
    const exportUrl = "https://docs.google.com/spreadsheets/d/" + sheetId + "/export?format=xlsx";
    const response = UrlFetchApp.fetch(exportUrl, {
      method: "get",
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true,
    });
    if (response.getResponseCode() !== 200) {
      throw new Error("Failed to export spreadsheet. HTTP Status: " + response.getResponseCode());
    }
    const blob = response.getBlob().setName(fileName);
    createdFile = monthFolder.createFile(blob);
  }

  return {
    fileId: createdFile.getId(),
    fileName: fileName,
    folderPath: ROOT_FOLDER_NAME + "/" + yearString + "/" + monthString,
  };
}

function exportSheetWithDate_(ss, customDateStr) {
  const ROOT_FOLDER_NAME = "Statistics";
  const sheetId = ss.getId();
  const timeZone = Session.getScriptTimeZone();

  const targetDate = customDateStr
    ? new Date(customDateStr + "T12:00:00")
    : new Date();

  const yearString = Utilities.formatDate(targetDate, timeZone, "yyyy");
  const monthString = Utilities.formatDate(targetDate, timeZone, "MMMM");
  const dateStamp = customDateStr || Utilities.formatDate(targetDate, timeZone, "yyyy-MM-dd");

  const rootFolder = bridgeGetOrCreateFolder_(DriveApp.getRootFolder(), ROOT_FOLDER_NAME);
  const yearFolder = bridgeGetOrCreateFolder_(rootFolder, yearString);
  const monthFolder = bridgeGetOrCreateFolder_(yearFolder, monthString);

  const exportUrl = "https://docs.google.com/spreadsheets/d/" + sheetId + "/export?format=xlsx";
  const response = UrlFetchApp.fetch(exportUrl, {
    method: "get",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() !== 200) {
    throw new Error("Failed to export spreadsheet. HTTP Status: " + response.getResponseCode());
  }

  const fileName = dateStamp + ".xlsx";
  const blob = response.getBlob().setName(fileName);
  monthFolder.createFile(blob);
  SpreadsheetApp.flush();
}

function bridgeGetOrCreateFolder_(parentFolder, folderName) {
  const folders = parentFolder.getFolders();
  while (folders.hasNext()) {
    const folder = folders.next();
    if (folder.getName().toLowerCase() === folderName.toLowerCase()) {
      return folder;
    }
  }
  return parentFolder.createFolder(folderName);
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
