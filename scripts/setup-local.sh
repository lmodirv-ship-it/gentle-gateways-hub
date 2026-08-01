#!/usr/bin/env bash
# ============================================================
# HN Groupe — تجهيز البيئة المحلية
# الاستخدام:  bash scripts/setup-local.sh
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> فحص المتطلبات"
command -v docker >/dev/null || { echo "Docker غير مثبّت — ثبّت Docker Desktop أولًا."; exit 1; }
command -v supabase >/dev/null || { echo "Supabase CLI غير مثبّت. نفّذ: npm i -g supabase   (أو brew install supabase/tap/supabase)"; exit 1; }

PKG="npm"
if command -v bun >/dev/null; then PKG="bun"; fi

echo "==> تثبيت الحزم ($PKG)"
if [ "$PKG" = "bun" ]; then bun install; else npm install; fi

echo "==> تشغيل قاعدة البيانات المحلية (Supabase)"
supabase start

echo "==> تطبيق المخطط والبيانات التجريبية"
supabase db reset --no-seed=false || supabase db reset

echo ""
echo "==> انسخ المفاتيح التالية إلى ملف .env"
supabase status

cat <<'EOF'

------------------------------------------------------------
1) أنشئ ملف .env  (انسخ .env.example) وضع فيه:
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=<anon key من الأعلى>
   SUPABASE_URL=http://127.0.0.1:54321
   SUPABASE_PUBLISHABLE_KEY=<anon key>
   SUPABASE_SERVICE_ROLE_KEY=<service_role key>

2) شغّل التطبيق:   bun run dev   (أو npm run dev)
3) افتح:           http://localhost:8080
4) سجّل الدخول:    demo@hn-groupe.com / demo1234
------------------------------------------------------------
EOF
