# خطة: قاعدة بيانات محلية + ربط الإعدادات وكل الصفحات + حزمة ZIP للتجربة على حاسوبك

## الهدف
تشغيل المنصة كاملة على حاسوبك بقاعدة بيانات محلية (بدون الحاجة للسحابة)، مع صفحة إعدادات تدير الاتصال والبيانات، وربط جميع صفحات الشريط الجانبي ببيانات حقيقية، ثم تسليم ملف ZIP + دليل بناء وتشغيل.

## الوضع الحالي (تم التحقق)
- المسارات الموجودة فعليًا: `__root.tsx`, `auth.tsx`, `_authenticated/route.tsx`, `_authenticated/index.tsx` فقط. باقي روابط الشريط الجانبي (orders, products, customers, subscriptions, payments, invoices, coupons, wallet, hn-ai, notifications, support, settings, sites, analytics) **لا تملك ملفات** — روابط ميتة.
- الجداول موجودة في القاعدة السحابية مع RLS وGRANTs: profiles, sites, customers, products, orders, order_items, subscriptions, invoices, coupons, wallet_transactions, support_tickets, ticket_messages, notifications, ai_insights, revenue_snapshots, fx_rates, payment_connections, user_roles.
- الاتصال حاليًا عبر متغيرات `.env` (VITE_SUPABASE_URL/KEY) — أي أن التبديل إلى قاعدة محلية ممكن بتغيير هذه المتغيرات فقط.
- لا يوجد مجلد `supabase/migrations` قابل للتشغيل محليًا حتى الآن (فقط `config.toml`).

## المراحل

### 1) قاعدة بيانات محلية قابلة للتشغيل
- إنشاء `supabase/migrations/0001_init.sql` يحتوي **كامل** المخطط: الـenums، الجداول، الفهارس، الـGRANTs، سياسات RLS، الدوال (`has_role`, `owns_site`, `handle_new_user`, `update_updated_at_column`)، والمشاهدات التجميعية.
- إنشاء `supabase/seed.sql` ببيانات تجريبية (مستخدم تجريبي + موقع + عملاء + منتجات + طلبات + اشتراكات + فواتير + كوبونات + محفظة + تذاكر + إشعارات + رؤى AI + سجلات إيرادات) حتى تظهر كل الصفحات ممتلئة دون سحابة.
- إضافة `docker-compose.yml` (Supabase local عبر `supabase start`، وبديل Postgres مفرد لمن لا يريد Supabase CLI).
- `.env.example` + `scripts/setup-local.sh` (تشغيل القاعدة، تطبيق الـmigration، تشغيل الـseed).

### 2) صفحة الإعدادات كمركز تحكم
`/settings` بتبويبات:
- **الحساب**: الاسم، الصورة، اللغة (تحديث `profiles`).
- **المواقع**: قائمة `sites`، إضافة/تعديل، اختيار الموقع النشط (`active_site_id`).
- **قاعدة البيانات / الاتصال**: عرض حالة الاتصال الحالي، الوضع (محلي/سحابي)، اختبار الاتصال، عدّاد صفوف كل جدول، وأزرار "تشغيل بيانات تجريبية" و"تصفير بيانات الموقع" (عبر server functions محمية).
- **المدفوعات**: إدارة `payment_connections` (المزوّد، الحالة، آخر مزامنة).
- **الأمان**: تغيير كلمة المرور، الأدوار من `user_roles`.

### 3) ربط جميع الصفحات
إنشاء كل صفحة تحت `_authenticated/` مربوطة بجدولها عبر `createServerFn` + `requireSupabaseAuth` + فلترة على الموقع النشط:
- `dashboard` (KPIs والرسوم من `revenue_snapshots` + `orders`)
- `sites`, `analytics`
- `orders` + `orders.$id` (مع `order_items`)
- `products` + `products.$id`
- `customers` + `customers.$id`
- `subscriptions`, `invoices`, `coupons`, `wallet`, `payments`
- `support` + `support.$id` (مع `ticket_messages`)
- `notifications`, `hn-ai` (من `ai_insights`)
- لكل صفحة: جدول/بطاقات + بحث + فرز + ترقيم + حالات فراغ + Skeleton + `errorComponent`.

### 4) الحزمة والتوثيق
- `README-LOCAL.md` بالعربية: المتطلبات (Node 20+/Bun، Docker، Supabase CLI)، خطوات التثبيت، تشغيل القاعدة، `bun install`, `bun run dev`, حساب الدخول التجريبي، وحل المشاكل الشائعة.
- توليد ZIP يستبعد `node_modules/.git/dist` ووضعه في مجلد المستندات لتنزيله مباشرة.

## تفاصيل تقنية
- ملف واحد للـmigration يعمل على Postgres 15+ داخل Supabase local؛ الأجزاء المرتبطة بـ`auth.users` تبقى كما هي لأن Supabase local يوفّر schema الـauth.
- كل استعلامات الصفحات في `src/lib/*.functions.ts` مع Zod validation، بلا استخدام مفتاح الخدمة في الواجهة.
- الوضع "محلي" مجرد تبديل `.env` — لا تغيير في الكود.
- البيانات التجريبية تُدرج عبر SQL في الـseed، لا عبر الواجهة.
