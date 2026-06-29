# نشر التطبيق مع WordPress

هذا التطبيق **Next.js** وليس WordPress. يعمل بجانب موقع WordPress (الموقع التسويقي) على نفس السيرفر أو على سابدومين.

## البنية المُوصى بها

| الخدمة | الرابط | الوظيفة |
|--------|--------|---------|
| WordPress | `https://yourclinic.com` | الموقع التسويقي، المقالات، الصفحات |
| هذا التطبيق | `https://book.yourclinic.com` | الحجز، الصفحة الرئيسية، لوحة التحكم |

اربط من WordPress:
- زر «احجز الآن» → `https://book.yourclinic.com/book`
- رابط لوحة الموظفين → `https://book.yourclinic.com/login`

---

## 1. متطلبات السيرفر

- Node.js 20+
- npm
- PM2 (لتشغيل التطبيق في الخلفية)
- Nginx + SSL (Let's Encrypt)
- مساحة دائمة لمجلد `data/` (قاعدة البيانات JSON)

---

## 2. إعداد البيئة

```bash
cp env.example .env.production
```

عدّل `.env.production`:

```env
AUTH_SECRET=<openssl rand -hex 32>
NEXT_PUBLIC_APP_URL=https://book.yourclinic.com
INITIAL_ADMIN_PASSWORD=<كلمة مرور قوية 10+ أحرف>
NODE_ENV=production
```

**مهم:**
- `NEXT_PUBLIC_APP_URL` يجب أن يطابق الرابط العام **بدون** `/ في النهاية
- روابط الحملات الإعلانية تُبنى من هذا الرابط تلقائياً
- `INITIAL_ADMIN_PASSWORD` مطلوب فقط عند **أول تشغيل** (قبل إنشاء `data/db.json`)

---

## 3. البناء والتشغيل

```bash
npm ci
npm run build
```

تشغيل بـ PM2:

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

تأكد أن مجلد `data/` موجود وقابل للكتابة:

```bash
mkdir -p data
chmod 750 data
```

---

## 4. Nginx

انسخ `deploy/nginx-wordpress.conf.example` وعدّل الدومين والشهادات.

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 5. الروابط بعد النشر

| الصفحة | المسار |
|--------|--------|
| الصفحة الرئيسية | `/` |
| حجز العملاء | `/book` |
| تسجيل الدخول | `/login` |
| لوحة التحكم | `/dashboard` |
| روابط الحملات | `/c/{campaignId}` |

كل الروابط داخل التطبيق **مسارات داخلية** (`/book`, `/api/...`) — لا تحتاج تعديل عند تغيير الدومين إذا ضبطت `NEXT_PUBLIC_APP_URL`.

---

## 6. إعدادات العيادة

بعد أول دخول كأدمن:
1. غيّر كلمة مرور الأدمن من الشريط الجانبي
2. من **إدارة العيادة** حدّث: الاسم، الشعار، الهاتف، الواتساب، الخدمات
3. من **تتبع الحملات** انسخ روابط الإعلانات (تستخدم الدومين من `NEXT_PUBLIC_APP_URL`)

---

## 7. الحماية المُفعّلة

- JWT مع `AUTH_SECRET` إلزامي في الإنتاج
- كوكي الجلسة: `httpOnly`, `secure`, `SameSite=lax`
- إبطال الجلسات عند تغيير كلمة المرور
- صلاحيات أدمن على API الإعدادات والحملات
- حد محاولات تسجيل الدخول والحجز
- رؤوس أمان (HSTS, X-Frame-Options, nosniff)
- منع التحويل المفتوح بعد تسجيل الدخول
- الشعار: صور مرفوعة فقط (بدون روابط خارجية)

---

## 8. النسخ الاحتياطي

احفظ نسخة يومية من:

```
data/db.json
```

---

## 9. استضافة WordPress فقط (بدون Node)

إذا كان الاستضافة **لا تدعم Node.js** (مثل استضافة WordPress مشتركة):
- انشر Next.js على **Vercel** أو **VPS** منفصل
- اربط السابدومين `book.yourclinic.com` إلى Vercel
- WordPress يبقى على `yourclinic.com`

---

## 10. التطوير المحلي

```bash
npm install
npm run dev
```

التطوير: `http://localhost:3000` — لا حاجة لـ `NEXT_PUBLIC_APP_URL` محلياً.
