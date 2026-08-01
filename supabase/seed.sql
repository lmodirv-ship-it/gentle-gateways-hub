-- ============================================================
-- HN Groupe — بيانات تجريبية للتشغيل المحلي
-- تُنفَّذ تلقائيًا مع `supabase start` / `supabase db reset`
-- حساب الدخول:  demo@hn-groupe.com  /  demo1234
-- ============================================================

DO $$
DECLARE
  v_user uuid := '0a1b2c3d-0000-4000-8000-000000000001';
  v_site uuid;
  v_c1 uuid; v_c2 uuid; v_c3 uuid; v_c4 uuid;
  v_p1 uuid; v_p2 uuid; v_p3 uuid;
  v_o uuid; v_t uuid;
  d int;
BEGIN
  -- مستخدم تجريبي (الـtrigger handle_new_user ينشئ profile + role + site)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user) THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) VALUES (
      v_user, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'demo@hn-groupe.com', crypt('demo1234', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"مستخدم HN التجريبي"}'::jsonb, now(), now()
    );

    INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user, v_user::text, 'email',
            json_build_object('sub', v_user::text, 'email', 'demo@hn-groupe.com')::jsonb,
            now(), now(), now());
  END IF;

  SELECT id INTO v_site FROM public.sites WHERE user_id = v_user ORDER BY created_at LIMIT 1;
  IF v_site IS NULL THEN
    INSERT INTO public.sites (user_id, name, domain, status, plan, plan_expires_at, currency)
    VALUES (v_user, 'الموقع التجريبي', 'demo.hn-groupe.com', 'active', 'Business', (now() + interval '90 days')::date, 'USD')
    RETURNING id INTO v_site;
    UPDATE public.profiles SET active_site_id = v_site WHERE id = v_user;
  END IF;

  -- موقع ثانٍ لتجربة مبدّل المواقع
  INSERT INTO public.sites (user_id, name, domain, status, plan, plan_expires_at, currency)
  SELECT v_user, 'متجر الأدوات', 'tools.hn-groupe.com', 'maintenance', 'Starter', (now() + interval '20 days')::date, 'EUR'
  WHERE NOT EXISTS (SELECT 1 FROM public.sites WHERE user_id = v_user AND domain = 'tools.hn-groupe.com');

  IF EXISTS (SELECT 1 FROM public.customers WHERE site_id = v_site) THEN RETURN; END IF;

  -- أسعار الصرف
  INSERT INTO public.fx_rates (base_currency, target_currency, rate, rate_date) VALUES
    ('USD','EUR',0.92,current_date), ('USD','MAD',10.05,current_date), ('USD','USD',1,current_date)
  ON CONFLICT DO NOTHING;

  -- العملاء
  INSERT INTO public.customers (site_id, name, email, phone, country, status, lifetime_value, first_seen_at, last_purchase_at)
  VALUES (v_site,'أحمد بن علي','ahmed@example.com','+212600000001','MA','active',1840, now()-interval '210 days', now()-interval '4 days')
  RETURNING id INTO v_c1;
  INSERT INTO public.customers (site_id, name, email, phone, country, status, lifetime_value, first_seen_at, last_purchase_at)
  VALUES (v_site,'Sara Meyer','sara@example.com','+4915100000','DE','active',920, now()-interval '120 days', now()-interval '11 days')
  RETURNING id INTO v_c2;
  INSERT INTO public.customers (site_id, name, email, phone, country, status, lifetime_value, first_seen_at, last_purchase_at)
  VALUES (v_site,'John Carter','john@example.com','+1202000000','US','inactive',260, now()-interval '340 days', now()-interval '150 days')
  RETURNING id INTO v_c3;
  INSERT INTO public.customers (site_id, name, email, phone, country, status, lifetime_value, first_seen_at)
  VALUES (v_site,'ليلى الحسني','laila@example.com','+212600000009','MA','lead',0, now()-interval '6 days')
  RETURNING id INTO v_c4;

  -- المنتجات
  INSERT INTO public.products (site_id, name, sku, description, type, price, currency, stock, active)
  VALUES (v_site,'خطة Business السنوية','PLAN-BUS-Y','استضافة + دعم أولوية','plan',480,'USD',NULL,true) RETURNING id INTO v_p1;
  INSERT INTO public.products (site_id, name, sku, description, type, price, currency, stock, active)
  VALUES (v_site,'تصميم هوية بصرية','SRV-BRAND','شعار + دليل استخدام','service',350,'USD',NULL,true) RETURNING id INTO v_p2;
  INSERT INTO public.products (site_id, name, sku, description, type, price, currency, stock, active)
  VALUES (v_site,'قالب متجر إلكتروني','TPL-SHOP','قالب جاهز قابل للتخصيص','template',89,'USD',120,true) RETURNING id INTO v_p3;

  -- الطلبات + عناصرها + الفواتير + الإيرادات اليومية
  FOR d IN 0..59 LOOP
    INSERT INTO public.orders (site_id, customer_id, reference, status, amount, currency, payment_method, provider, placed_at)
    VALUES (
      v_site,
      CASE d % 4 WHEN 0 THEN v_c1 WHEN 1 THEN v_c2 WHEN 2 THEN v_c3 ELSE v_c4 END,
      'HN-' || to_char(current_date - d, 'YYYYMMDD') || '-' || lpad(d::text, 3, '0'),
      (CASE WHEN d % 11 = 0 THEN 'pending' WHEN d % 17 = 0 THEN 'refunded' ELSE 'paid' END)::order_status,
      round((80 + (d * 13 % 420))::numeric, 2), 'USD',
      CASE d % 3 WHEN 0 THEN 'card' WHEN 1 THEN 'paypal' ELSE 'bank_transfer' END,
      CASE d % 3 WHEN 0 THEN 'stripe' WHEN 1 THEN 'paypal' ELSE 'hn-pay' END,
      now() - (d || ' days')::interval
    ) RETURNING id INTO v_o;

    INSERT INTO public.order_items (order_id, product_id, name, quantity, unit_price)
    VALUES (v_o, CASE d % 3 WHEN 0 THEN v_p1 WHEN 1 THEN v_p2 ELSE v_p3 END,
            CASE d % 3 WHEN 0 THEN 'خطة Business السنوية' WHEN 1 THEN 'تصميم هوية بصرية' ELSE 'قالب متجر إلكتروني' END,
            1 + (d % 2), round((80 + (d * 13 % 420))::numeric, 2));

    INSERT INTO public.invoices (site_id, customer_id, order_id, number, status, amount, currency, due_at, paid_at)
    VALUES (v_site,
            CASE d % 4 WHEN 0 THEN v_c1 WHEN 1 THEN v_c2 WHEN 2 THEN v_c3 ELSE v_c4 END,
            v_o, 'INV-' || to_char(current_date - d, 'YYYYMM') || '-' || lpad(d::text, 4, '0'),
            (CASE WHEN d % 11 = 0 THEN 'open' WHEN d % 17 = 0 THEN 'void' ELSE 'paid' END)::invoice_status,
            round((80 + (d * 13 % 420))::numeric, 2), 'USD',
            (current_date - d + 14), CASE WHEN d % 11 = 0 THEN NULL ELSE now() - (d || ' days')::interval END);

    INSERT INTO public.revenue_snapshots (site_id, snapshot_date, gross, net, refunds, currency, orders_count, visitors)
    VALUES (v_site, current_date - d,
            round((300 + (d * 47 % 900))::numeric, 2),
            round((260 + (d * 41 % 800))::numeric, 2),
            round((d % 7 * 12)::numeric, 2), 'USD',
            3 + (d % 9), 120 + (d * 17 % 600))
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- الاشتراكات
  INSERT INTO public.subscriptions (site_id, customer_id, product_id, plan_name, status, renewal_price, currency, billing_interval, started_at, current_period_end) VALUES
    (v_site, v_c1, v_p1, 'Business سنوي', 'active',   480,'USD','year',  now()-interval '200 days', now()+interval '160 days'),
    (v_site, v_c2, v_p1, 'Business شهري', 'active',    49,'USD','month', now()-interval '90 days',  now()+interval '9 days'),
    (v_site, v_c3, v_p1, 'Starter شهري',  'past_due',  19,'USD','month', now()-interval '300 days', now()-interval '3 days'),
    (v_site, v_c4, v_p2, 'دعم مميز',       'trialing', 29,'USD','month', now()-interval '5 days',   now()+interval '9 days');

  -- الكوبونات
  INSERT INTO public.coupons (site_id, code, discount_type, value, usage_limit, used_count, active, expires_at) VALUES
    (v_site,'WELCOME10','percent',10,500,132,true, now()+interval '60 days'),
    (v_site,'HN50','fixed',50,100,18,true, now()+interval '15 days'),
    (v_site,'OLD2024','percent',25,50,50,false, now()-interval '40 days');

  -- المحفظة
  INSERT INTO public.wallet_transactions (site_id, type, amount, currency, balance_after, reference, description, created_at) VALUES
    (v_site,'credit',1200,'USD',1200,'TRX-1001','تحصيل مبيعات الأسبوع', now()-interval '20 days'),
    (v_site,'fee',-36,'USD',1164,'TRX-1002','عمولة بوابة الدفع', now()-interval '19 days'),
    (v_site,'payout',-800,'USD',364,'TRX-1003','تحويل بنكي', now()-interval '12 days'),
    (v_site,'credit',940,'USD',1304,'TRX-1004','تحصيل مبيعات', now()-interval '5 days'),
    (v_site,'refund',-89,'USD',1215,'TRX-1005','استرجاع طلب', now()-interval '2 days');

  -- الدعم
  INSERT INTO public.support_tickets (site_id, customer_id, subject, status, priority, last_message_at)
  VALUES (v_site, v_c1, 'الدومين لا يعمل بعد الربط', 'open', 'high', now()-interval '2 hours') RETURNING id INTO v_t;
  INSERT INTO public.ticket_messages (ticket_id, author, body, created_at) VALUES
    (v_t,'customer','ربطت الدومين لكن الموقع لا يظهر.', now()-interval '5 hours'),
    (v_t,'agent','تم تحديث سجلات DNS، يرجى الانتظار حتى 30 دقيقة.', now()-interval '2 hours');

  INSERT INTO public.support_tickets (site_id, customer_id, subject, status, priority, last_message_at)
  VALUES (v_site, v_c2, 'طلب فاتورة بصيغة PDF', 'pending', 'normal', now()-interval '1 day') RETURNING id INTO v_t;
  INSERT INTO public.ticket_messages (ticket_id, author, body) VALUES (v_t,'customer','أحتاج فاتورة الشهر الماضي.');

  INSERT INTO public.support_tickets (site_id, customer_id, subject, status, priority, last_message_at)
  VALUES (v_site, v_c3, 'إلغاء الاشتراك', 'resolved', 'low', now()-interval '9 days') RETURNING id INTO v_t;
  INSERT INTO public.ticket_messages (ticket_id, author, body) VALUES (v_t,'agent','تم الإلغاء بنجاح.');

  -- الإشعارات
  INSERT INTO public.notifications (user_id, site_id, type, title, body, link) VALUES
    (v_user, v_site, 'order', 'طلب جديد', 'تم استلام طلب بقيمة 320 USD', '/orders'),
    (v_user, v_site, 'invoice', 'فاتورة متأخرة', 'فاتورة INV-000012 لم تُدفع', '/invoices'),
    (v_user, v_site, 'system', 'اكتمل النسخ الاحتياطي', 'نسخة يومية جاهزة', NULL);

  -- رؤى HN AI
  INSERT INTO public.ai_insights (site_id, kind, severity, title, body, metric, generated_at) VALUES
    (v_site,'revenue_drop','warning','انخفاض في إيرادات آخر 7 أيام','الإيرادات أقل بنسبة 12% مقارنة بالأسبوع السابق. راجع حملات الترويج.','{"change":-12,"window":"7d"}',now()),
    (v_site,'churn_risk','critical','3 عملاء معرضون للمغادرة','اشتراكات تنتهي خلال 10 أيام دون تجديد تلقائي.','{"count":3}',now()),
    (v_site,'top_product','success','أفضل منتج: خطة Business السنوية','ساهمت بـ 41% من إجمالي الإيرادات.','{"share":41}',now()),
    (v_site,'promo_idea','info','اقتراح: خصم سنوي 15%','تحويل المشتركين الشهريين إلى سنوي يرفع القيمة الدائمة.','{"expected_uplift":8}',now());

  -- اتصالات الدفع
  INSERT INTO public.payment_connections (site_id, provider, status, config, last_sync_at) VALUES
    (v_site,'stripe','connected','{"mode":"test"}', now()-interval '1 hour'),
    (v_site,'paypal','disconnected','{}', NULL),
    (v_site,'hn-pay','connected','{"mode":"live"}', now()-interval '3 hours');

  -- مصروف Lovable
  INSERT INTO public.lovable_spend (user_id, year, month, amount, currency, notes) VALUES
    (v_user, extract(year from current_date)::int, extract(month from current_date)::int, 25, 'USD', 'اشتراك شهري');
END $$;
