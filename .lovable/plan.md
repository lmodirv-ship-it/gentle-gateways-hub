
# خطة تطوير HN Groupe Dashboard

## الوضع الحالي (ملخص الفحص)

**الموجود:**
- مسار وحيد `/` يعرض لوحة تحكم كاملة ببيانات وهمية (Mock).
- Sidebar فيه 15 رابطًا (sites, analytics, orders, products, customers, subscriptions, payments, invoices, coupons, wallet, hn-ai, notifications, support, settings) — **كلها روابط ميتة** بلا ملفات routes.
- جداول DB: `sites`, `payment_connections`, `revenue_snapshots`, `fx_rates`, `lovable_spend`, `user_roles` مع RLS جاهز.
- Lovable Cloud + Supabase موصولان، لكن **لا يوجد نظام تسجيل دخول** ولا صفحة `/auth`، ولا layout محمي `_authenticated/`.
- ستايل زجاجي أزرق مطبّق.

**الفجوات الحرجة:**
1. لا Auth → لا يمكن استخدام RLS ولا حماية أي شيء.
2. لا جداول لـ: profiles, customers, products, orders, order_items, subscriptions, invoices, coupons, wallet_transactions, support_tickets, notifications, ai_insights.
3. كل الأرقام في الواجهة مزيفة.
4. لا تكامل حقيقي مع أي مزوّد دفع رغم وجود جدول `payment_connections`.

---

## المراحل

### المرحلة 1 — الأساس: Auth + Multi-Site + الأدوار
- إنشاء `src/routes/auth.tsx` (Email/Password + Google) عبر Lovable Cloud.
- إنشاء layout محمي `src/routes/_authenticated/route.tsx` (managed).
- نقل لوحة التحكم `/` إلى `_authenticated/index.tsx`.
- جدول `profiles` (full_name, avatar_url, locale, active_site_id).
- Trigger `on_auth_user_created` يزرع profile + role='user' + site افتراضي.
- Site Switcher في الـHeader (بدل النص الثابت "hn-groupe.com") يعتمد على `sites` الحقيقي.
- Context للـ `activeSite` عبر React Query + localStorage.

### المرحلة 2 — نموذج البيانات التجاري
Migrations متتالية (كل جدول: GRANTs + RLS scoped إلى `site_id → sites.user_id`):
- `customers` (site_id, email, phone, name, avatar, lifetime_value, status, first_seen_at, last_purchase_at)
- `products` (site_id, name, sku, type[plan|service|template|physical], price, currency, stock, active)
- `orders` + `order_items` (status: paid/pending/failed/refunded, amount, currency, customer_id, provider_ref)
- `subscriptions` (customer_id, product_id, status: active/expiring/canceled/expired, current_period_end, renewal_price)
- `invoices` (order_id | subscription_id, number, status, due_at, paid_at, pdf_url)
- `coupons` (code, discount_type, value, usage_limit, used_count, expires_at)
- `wallet_transactions` (site_id, type: credit/debit/payout, amount, balance_after, reference)
- `support_tickets` + `ticket_messages`
- `notifications` (user_id, site_id, type, title, body, read_at)
- `ai_insights` (site_id, kind, severity, title, body, generated_at, dismissed_at)
- `product_reviews` (اختياري لعرض "المراجعات")
- Views للتجميعات: `v_daily_revenue`, `v_monthly_revenue`, `v_top_products`, `v_payment_split`, `v_kpi_today`.

### المرحلة 3 — الصفحات + ربط البيانات الحقيقية
كل مسار في الـSidebar يصبح route حقيقي تحت `_authenticated/`:
- `sites`, `analytics`, `orders`, `orders.$id`, `products`, `products.$id`, `customers`, `customers.$id`, `subscriptions`, `payments`, `invoices`, `coupons`, `wallet`, `hn-ai`, `notifications`, `support`, `support.$ticketId`, `settings` (+ tabs: profile, team, billing, integrations, security).
- استبدال كل Mock في `DashboardOverview` بـ `useSuspenseQuery` يستدعي `createServerFn` مع `requireSupabaseAuth`.
- Server functions تحت `src/lib/dashboard.functions.ts`, `orders.functions.ts` … إلخ.
- Skeletons + errorComponent + notFoundComponent لكل route.
- Realtime على `orders`, `notifications`, `support_tickets` عبر Supabase channels.

### المرحلة 4 — مزوّدات الدفع
- شاشة `settings/integrations` لربط: Stripe + PayPal + HN-PAY (مخصص).
- استعمال جدول `payment_connections` الموجود + Secrets عبر `add_secret`.
- Server routes ويبهوك تحت `src/routes/api/public/webhooks/{stripe,paypal,hn-pay}.ts` مع تحقّق التوقيع و`supabaseAdmin`.
- Cron (pg_cron) يومي: `revenue_snapshots` + تحديث `fx_rates`.
- تحويل عملة موحّد باستخدام `fx_rates`.

### المرحلة 5 — HN AI
- Route `/hn-ai` + بطاقات AI في لوحة التحكم مربوطة بجدول `ai_insights`.
- Server function `generateInsights` يستخدم Lovable AI Gateway (`LOVABLE_API_KEY`) على مقاييس آخر 30 يومًا:
  - كشف انخفاض إيرادات > 10%.
  - عملاء معرضون للـChurn (لا شراء منذ Xd + اشتراك ينتهي).
  - أفضل خدمة/منتج.
  - اقتراحات ترويج (كوبون، خصم سنوي).
- Cron كل 6 ساعات ينفّذ التوليد ويكتب النتائج.
- زر "Ask HN AI" في الـHeader (Chat drawer) يستخدم نفس Gateway مع Context خاص بالـsite النشط.

### المرحلة 6 — تجهيز الإنتاج
- Roles: admin/user + صفحات إدارية تحت `_authenticated/_admin/`.
- Rate limiting + input validation (Zod) في كل server fn.
- Empty states, i18n كامل RTL، Dark/Light toggle.
- تشغيل `supabase--linter` + `security--run_security_scan` وإصلاح النتائج.
- SEO: title/description لكل route + og:image ديناميكي للصفحات العامة (auth, marketing).
- E2E سريع بـPlaywright على تدفقات: تسجيل → إنشاء site → عرض لوحة.
- زر النشر.

---

## تفاصيل تقنية

```text
src/
├── routes/
│   ├── __root.tsx
│   ├── index.tsx                 → redirect إلى /auth أو لوحة التحكم
│   ├── auth.tsx                  (عام)
│   ├── _authenticated/
│   │   ├── route.tsx             (managed gate)
│   │   ├── index.tsx             (Dashboard)
│   │   ├── sites.tsx
│   │   ├── analytics.tsx
│   │   ├── orders.tsx / orders.$id.tsx
│   │   ├── products.tsx / products.$id.tsx
│   │   ├── customers.tsx / customers.$id.tsx
│   │   ├── subscriptions.tsx
│   │   ├── payments.tsx / invoices.tsx / coupons.tsx / wallet.tsx
│   │   ├── hn-ai.tsx
│   │   ├── notifications.tsx
│   │   ├── support.tsx / support.$id.tsx
│   │   ├── settings.tsx (+ settings.*.tsx tabs)
│   │   └── _admin/…              (RBAC)
│   └── api/public/webhooks/{stripe,paypal,hn-pay}.ts
├── lib/
│   ├── dashboard.functions.ts
│   ├── orders.functions.ts
│   ├── customers.functions.ts
│   ├── ai.functions.ts
│   └── site-context.tsx
└── components/… (glass-panel utility مستمر)
```

- كل server fn = `.middleware([requireSupabaseAuth])` + Zod validator + فلترة صريحة على `site_id` النشط.
- Charts تُغذّى من Views مجمّعة (أداء أعلى من الحساب في الواجهة).
- Realtime فقط على الجداول التي تحتاج تحديث فوري.

---

## ترتيب التنفيذ المقترح (فوري)

1. المرحلة 1 كاملة (Auth + protected layout + نقل الداشبورد).
2. المرحلة 2: migrations الأولى (customers, products, orders, subscriptions, invoices) + Views.
3. المرحلة 3: ربط الـKPIs والـCharts في `DashboardOverview` ببيانات حقيقية + إنشاء صفحات Orders/Products/Customers فعلية.
4. باقي الصفحات + Wallet + Coupons + Support + Notifications.
5. المدفوعات ثم HN AI ثم النشر.

هل أبدأ فورًا بالمرحلة 1؟
