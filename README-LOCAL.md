# HN Groupe Dashboard — التشغيل المحلي

منصة إدارة إيرادات ومواقع (TanStack Start + React 19 + Tailwind v4 + Supabase).

## المتطلبات

- [Bun](https://bun.sh) ≥ 1.1
- [Docker](https://docs.docker.com/get-docker/) (يشغّل Postgres الخاص بـ Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)

## 1) قاعدة البيانات المحلية

```bash
bash scripts/setup-local.sh
```

السكربت يقوم بـ:
1. `supabase start` — يشغّل Postgres + Auth + Studio محليًا.
2. تطبيق كل الهجرات من `supabase/migrations/`.
3. تنفيذ `supabase/seed.sql` — يزرع مستخدمًا تجريبيًا ومواقع و60 يومًا من الطلبات والعملاء والاشتراكات والفواتير والكوبونات وحركات المحفظة وتذاكر الدعم ورؤى HN AI.

عناوين محلية بعد التشغيل:

| الخدمة | العنوان |
| --- | --- |
| Supabase API | http://127.0.0.1:54321 |
| Supabase Studio | http://127.0.0.1:54323 |
| Postgres | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| Adminer (اختياري) | http://127.0.0.1:8081 عبر `docker compose up -d` |

## 2) متغيرات البيئة

```bash
cp .env.example .env
```

ثم ضع في `.env` القيم التي طبعها `supabase start`:

```env
VITE_SUPABASE_URL="http://127.0.0.1:54321"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon key>"
SUPABASE_URL="http://127.0.0.1:54321"
SUPABASE_PUBLISHABLE_KEY="<anon key>"
SUPABASE_SERVICE_ROLE_KEY="<service_role key>"
```

## 3) تشغيل الواجهة

```bash
bun install
bun run dev      # http://localhost:8080
```

بناء للإنتاج:

```bash
bun run build
bun run start
```

## حساب التجربة

```
demo@hn-groupe.com
demo1234
```

## الصفحات المتاحة

| المسار | الوصف |
| --- | --- |
| `/auth` | تسجيل الدخول / إنشاء حساب (بريد + Google) |
| `/` | لوحة التحكم الرئيسية (KPIs + رسوم) |
| `/sites` | إدارة المواقع وتبديل الموقع النشط |
| `/analytics` | تحليلات الإيراد والزوار |
| `/orders`, `/orders/:id` | الطلبات وتفاصيل بنودها |
| `/products` | كتالوج المنتجات والمخزون |
| `/customers`, `/customers/:id` | العملاء وملفهم الكامل |
| `/subscriptions` | الاشتراكات و MRR التقديري |
| `/payments` | توزيع المدفوعات وبوابات الدفع |
| `/invoices` | الفواتير وحالات السداد |
| `/coupons` | أكواد الخصم ونسب الاستخدام |
| `/wallet` | الرصيد وحركات المحفظة |
| `/hn-ai` | رؤى ذكية قابلة للتجاهل |
| `/notifications` | الإشعارات وتحديدها كمقروءة |
| `/support`, `/support/:id` | تذاكر الدعم والرد عليها |
| `/settings` | الملف الشخصي، الموقع، بوابات الدفع، بيانات الاتصال بقاعدة البيانات |

## ملاحظات أمنية

- كل الجداول محمية بـ RLS مربوطة بـ `sites.user_id` عبر الدالة `public.owns_site(uuid)`.
- الأدوار في جدول `user_roles` منفصل؛ الإضافة والتعديل للمشرفين فقط، والمستخدم يقرأ دوره هو فقط.
- لا تضع `SUPABASE_SERVICE_ROLE_KEY` في أي ملف يُرسل للمتصفح — يُستخدم فقط داخل server functions.

## استكشاف الأخطاء

| المشكلة | الحل |
| --- | --- |
| `Missing Supabase environment variable(s)` | أكمل قيم `.env` ثم أعد `bun run dev` |
| لا توجد بيانات في الصفحات | سجّل الدخول بحساب التجربة، أو أعد تشغيل `supabase db reset` |
| المنفذ 8080 مشغول | `PORT=3000 bun run dev` |
| `supabase start` يفشل | تأكد أن Docker يعمل، ثم `supabase stop --no-backup` وأعد المحاولة |
