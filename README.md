# نظام إدارة العيادة — Kadina / RaaCare

منصة حجز وإدارة عيادة: حجز أونلاين، استفسارات، مواعيد، حملات إعلانية، ولوحة تحكم للموظفين.

## التشغيل المحلي

```bash
npm install
npm run dev
```

| الصفحة | الرابط المحلي |
|--------|---------------|
| الصفحة الرئيسية | http://localhost:3000 |
| حجز العملاء | http://localhost:3000/book |
| تسجيل الدخول | http://localhost:3000/login |
| لوحة التحكم | http://localhost:3000/dashboard |

**التطوير:** الحساب الافتراضي `admin` / `admin123` يُنشأ تلقائياً عند أول تشغيل.

## النشر على Hostinger

راجع **[HOSTINGER.md](./HOSTINGER.md)** — دليل مخصص لـ Hostinger.

```bash
npm run prepare:hostinger
# ارفع hostinger-upload.zip إلى hPanel
```

## النشر على VPS / WordPress

راجع **[DEPLOYMENT.md](./DEPLOYMENT.md)** للتفاصيل الكاملة.

### الخطوات السريعة

1. انسخ `env.example` إلى `.env.production` واملأ:
   - `AUTH_SECRET` — `openssl rand -hex 32`
   - `NEXT_PUBLIC_APP_URL` — مثل `https://book.yourclinic.com`
   - `INITIAL_ADMIN_PASSWORD` — كلمة مرور أول دخول (10+ أحرف)
2. `npm ci && npm run build`
3. شغّل بـ PM2: `pm2 start deploy/ecosystem.config.cjs`
4. اضبط Nginx (انظر `deploy/nginx-wordpress.conf.example`)
5. اربط من WordPress زر الحجز إلى `{NEXT_PUBLIC_APP_URL}/book`

## التقنيات

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
- JSON file database (`data/db.json`)

## ملاحظات الإنتاج

- احفظ نسخة احتياطية من `data/db.json` يومياً
- غيّر كلمة مرور الأدمن بعد أول دخول
- روابط الحملات تُبنى من `NEXT_PUBLIC_APP_URL` — تأكد من ضبطه قبل نسخ الروابط
