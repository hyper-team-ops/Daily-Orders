# HyperTeam — نظام الطلبات اليومية (نسخة خفيفة بدون Backend)

واجهة ويب فائقة الخفّة (React + Vite + Tailwind v4 فقط — بدون Backend وبدون قاعدة بيانات وبدون وضع داكن) لإدارة طلبات الطلاب اليومية في مكتب **HyperTeam** عبر `localhost`، مع حفظ محلي فوري في المتصفح وتفريغ تلقائي يومياً **الساعة 3:00 عصراً** (الأحد–الخميس) إلى شيت **HyperTeam Daily Entry** الأساسية (`H1` + `I3:O32`).

---

## التشغيل السريع (أمر واحد فقط)

```powershell
cd d:\HyperTeam\Operations\daily-orders-app
pnpm install
pnpm dev
```
أو بالنقر المزدوج على `start-app.bat` ثم فتح:
* **http://localhost:5173**

---

## ربط التفريغ التلقائي الساعة 3:00 عصراً بالشيت الأساسية

1. افتح شيت **HyperTeam Daily Entry** ← **Extensions** ← **Apps Script**.
2. أضف ملفاً باسم `webAppBridge.gs` والصق محتوى `apps-script/webAppBridge.gs`.
3. اضغط **Deploy** ← **New deployment** ← اختر **Web app** (`Execute as: Me`، `Who has access: Anyone`) وانسخ الرابط.
4. الصق الرابط إما داخل `.env` (`VITE_GAS_WEBHOOK_URL`) أو مباشرة داخل التطبيق من زر **مزامنة وتصدير ← إعدادات**.

* عند وصول الساعة **3:00 عصراً** (الأحد–الخميس) والصفحة مفتوحة على `localhost`، يقوم التطبيق تلقائياً بتفريغ طلبات اليوم واسم الكوتش في الشيت الأساسية (`I3:O32` + `H1`)، كما يمكنك التفريغ يدوياً أو تنزيل ملف `.xlsx` محلياً في أي وقت.

---

## تعديل أسماء الكوتشات

جميع أسماء الكوتشات العشرة محفوظة في ملف واحد بسيط:
`src/config/coaches.ts`
