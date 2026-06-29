# نشر على Hostinger — دليل تفصيلي

## ⚠️ خطأ شائع: «إطار عمل غير مدعوم»

يظهر هذا الخطأ إذا كان **`package.json` داخل مجلد فرعي** في الـ zip.

### ❌ خطأ (ما فعلته)
```
ملف.zip
  └── .hostinger-staging/     ← مجلد داخل الـ zip
        └── package.json      ← Hostinger لا يجده!
        └── src/
```

### ✅ صحيح
```
hostinger-upload.zip
  ├── package.json            ← مباشرة في جذر الـ zip
  ├── next.config.mjs
  ├── src/
  └── data/
```

**لا تضغط المجلد يدوياً.** شغّل `npm run prepare:hostinger` وارفع **`hostinger-upload.zip`** فقط.

---

## ⚠️ مهم — لا ترفع في File Manager داخل `public_html`

الصورة التي تظهر `public_html` و `DO_NOT_UPLOAD_HERE` هي **لاستضافة WordPress/PHP فقط**.

مشروعك **Next.js** يحتاج **Node.js Web Apps** — مسار مختلف تماماً.

| ❌ خطأ | ✅ صحيح |
|--------|---------|
| File Manager → public_html | hPanel → **Websites → Add Website → Node.js Apps** |
| رفع ملفات يدوياً وفك الضغط | رفع **hostinger-upload.zip** من شاشة Node.js |

---

## المتطلبات

- خطة Hostinger **Business** أو **Cloud** (تدعم Node.js)
- الملف **`hostinger-upload.zip`** من مجلد المشروع
- ملف **`HOSTINGER-ENV.txt`** (احفظه عندك — لا تنشره)

---

## الخطوة 1 — تجهيز الملف المضغوط (على جهازك)

```bash
npm run prepare:hostinger
```

ينشئ:
- `hostinger-upload.zip` — **فقط الملفات الضرورية** (src, data, scripts, package.json...)
- `HOSTINGER-ENV.txt` — مفتاح AUTH_SECRET وإعدادات البيئة

**ما يُستبعد من الـ zip:** node_modules, .next, .git, ملفات التوثيق, deploy

---

## الخطوة 2 — إنشاء موقع Node.js في hPanel

1. ادخل **hPanel** → **Websites**
2. **Add Website**
3. اختر **Node.js Apps** (وليس WordPress)
4. اختر **Upload your files**
5. ارفع **`hostinger-upload.zip`**
6. انتظر حتى يرفع الملف

---

## الخطوة 3 — إعدادات البناء (Build Settings)

| الحقل | القيمة بالضبط |
|-------|---------------|
| **Framework** | Next.js |
| **Node.js version** | **20** |
| **Install command** | `npm ci` |
| **Build command** | `npm run build` |
| **Start command** | `npm run start:hostinger` |
| **Root directory** | `/` (فارغ أو جذر المشروع) |

---

## الخطوة 4 — متغيرات البيئة (Environment Variables)

من **HOSTINGER-ENV.txt** أضف في hPanel:

| المتغير | القيمة |
|---------|--------|
| `AUTH_SECRET` | انسخ من HOSTINGER-ENV.txt |
| `NEXT_PUBLIC_APP_URL` | `https://دومينك.com` (بدون / في النهاية) |
| `NODE_ENV` | `production` |

---

## الخطوة 5 — Deploy

1. اضغط **Deploy**
2. انتظر 5–10 دقائق
3. إذا نجح → افتح رابط الموقع

---

## الخطوة 6 — ربط الدومين

1. من إعدادات الموقع → **Domains**
2. اربط دومينك أو سابدومين
3. عدّل `NEXT_PUBLIC_APP_URL` ليطابق الدومين
4. **Deploy** مرة أخرى

---

## الروابط بعد النشر

| الصفحة | الرابط |
|--------|--------|
| الرئيسية | `/` |
| الحجز | `/book` |
| دخول الموظفين (سري) | `/staff-portal` |
| لوحة التحكم | `/dashboard` |

---

## حل خطأ EACCES (فشل البناء)

إذا ظهر: `Cannot read directory src/app/api/appointments — EACCES`

**السبب:** صلاحيات ملفات خاطئة في الـ zip من Windows.

**الحل:**
1. على جهازك شغّل من جديد: `npm run prepare:hostinger`
2. ارفع **`hostinger-upload.zip` الجديد** (تم إصلاح الصلاحيات)
3. **احذف** الموقع القديم في hPanel وأنشئ Node.js App جديد
4. لا تستخدم File Manager لرفع الملفات يدوياً

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| Build failed EACCES | أعد `npm run prepare:hostinger` وارفع zip جديد |
| 502 Bad Gateway | Start command: `npm run start:hostinger` |
| صفحة بيضاء | تحقق من `AUTH_SECRET` و `NODE_ENV=production` |
| بيانات فارغة | تأكد أن `data/db.json` داخل الـ zip |
| `/login` لا يعمل | الدخول من `/staff-portal` فقط |

---

## تحديث الموقع لاحقاً

```bash
npm run prepare:hostinger
```

ارفع zip جديد → Deploy. **احفظ نسخة من data/db.json** قبل كل تحديث.
