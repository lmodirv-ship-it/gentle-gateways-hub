import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Bell,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  CreditCard,
  Database,
  FileText,
  Gauge,
  HardDrive,
  Mail,
  MessageSquare,
  Package,
  Plus,
  Receipt,
  RefreshCw,
  Repeat,
  Send,
  Server,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Ticket,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Webhook,
  XCircle,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── mock data ──────────────────────────────────────────────
const revenueDaily = [
  { d: "س", v: 1200 }, { d: "أ", v: 1800 }, { d: "ن", v: 1500 },
  { d: "ث", v: 2400 }, { d: "ر", v: 2100 }, { d: "خ", v: 2900 }, { d: "ج", v: 3400 },
];
const revenueMonthly = [
  { m: "ينا", v: 32000, p: 28000 }, { m: "فبر", v: 41000, p: 30000 },
  { m: "مار", v: 38000, p: 35000 }, { m: "أبر", v: 52000, p: 41000 },
  { m: "ماي", v: 61000, p: 47000 }, { m: "يون", v: 58000, p: 52000 },
  { m: "يول", v: 72000, p: 58000 },
];
const userGrowth = [
  { m: "ينا", u: 120 }, { m: "فبر", u: 210 }, { m: "مار", u: 340 },
  { m: "أبر", u: 480 }, { m: "ماي", u: 640 }, { m: "يون", u: 820 }, { m: "يول", u: 1050 },
];
const topProducts = [
  { name: "خطة Pro", sales: 340 }, { name: "خطة Business", sales: 260 },
  { name: "استشارة", sales: 180 }, { name: "قالب متجر", sales: 140 },
  { name: "قالب مطعم", sales: 90 },
];
const paymentSplit = [
  { name: "بطاقة", value: 52 }, { name: "PayPal", value: 21 },
  { name: "تحويل", value: 15 }, { name: "محفظة", value: 12 },
];
const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const recentOrders = [
  { id: "#10842", customer: "أحمد العلي", amount: 240, status: "مدفوع", date: "قبل دقيقتين" },
  { id: "#10841", customer: "سارة يوسف", amount: 89, status: "قيد المراجعة", date: "قبل 12 دقيقة" },
  { id: "#10840", customer: "محمد الطاهر", amount: 1200, status: "مدفوع", date: "قبل 34 دقيقة" },
  { id: "#10839", customer: "ليلى بنعيسى", amount: 45, status: "فشل", date: "قبل ساعة" },
  { id: "#10838", customer: "يوسف الإدريسي", amount: 320, status: "مدفوع", date: "قبل ساعتين" },
];

const alerts = [
  { icon: Clock, tone: "warning", title: "اشتراك سينتهي خلال 3 أيام", desc: "خطة Pro — عميل: سارة يوسف" },
  { icon: XCircle, tone: "destructive", title: "دفعة فشلت", desc: "بطاقة مرفوضة — 240$" },
  { icon: Receipt, tone: "warning", title: "فاتورة غير مدفوعة", desc: "#INV-0928 — منذ 5 أيام" },
  { icon: Webhook, tone: "destructive", title: "مشكلة في Webhook", desc: "HN-PAY — 3 محاولات فاشلة" },
  { icon: Sparkles, tone: "info", title: "تحديث جديد للنظام", desc: "v2.4.1 متاح" },
];

const systemStatus = [
  { label: "اتصال HN-PAY", icon: Zap, ok: true },
  { label: "قاعدة البيانات", icon: Database, ok: true },
  { label: "البريد الإلكتروني", icon: Mail, ok: true },
  { label: "Webhooks", icon: Webhook, ok: false },
  { label: "النسخ الاحتياطي", icon: HardDrive, ok: true },
];

const performance = [
  { label: "سرعة الموقع", value: 92, unit: "/100" },
  { label: "وقت الاستجابة", value: 74, unit: "142ms" },
  { label: "استهلاك التخزين", value: 46, unit: "23GB" },
  { label: "قاعدة البيانات", value: 61, unit: "6.1GB" },
  { label: "استهلاك API", value: 38, unit: "38k/يوم" },
];

const tasks = [
  { label: "طلبات تحتاج للمراجعة", count: 7, tone: "warning" as const },
  { label: "اشتراكات تنتظر التفعيل", count: 3, tone: "info" as const },
  { label: "تذاكر الدعم", count: 12, tone: "destructive" as const },
  { label: "مراجعات العملاء", count: 5, tone: "info" as const },
  { label: "فواتير غير مدفوعة", count: 4, tone: "warning" as const },
];

const calendar = [
  { day: "12", month: "يول", title: "تجديد خطة Pro", tag: "تجديد" },
  { day: "14", month: "يول", title: "حملة إعلانية — رمضان", tag: "حملة" },
  { day: "16", month: "يول", title: "اجتماع فريق المبيعات", tag: "اجتماع" },
  { day: "20", month: "يول", title: "انتهاء اشتراك Business", tag: "انتهاء" },
];

const customers = [
  { name: "أحمد العلي", last: "خطة Pro — 240$", value: "2,340$", status: "نشط" },
  { name: "سارة يوسف", last: "استشارة — 120$", value: "890$", status: "نشط" },
  { name: "محمد الطاهر", last: "قالب متجر — 1,200$", value: "5,120$", status: "منتهي" },
  { name: "ليلى بنعيسى", last: "خطة Basic — 29$", value: "410$", status: "نشط" },
];

const messages = [
  { name: "دعم — Ali", msg: "الفاتورة #INV-0928 لم تُدفع بعد.", time: "قبل 4د" },
  { name: "تعليق — Sara", msg: "المنتج ممتاز! شكراً لكم.", time: "قبل 1س" },
  { name: "تنبيه داخلي", msg: "المخزون منخفض على قالب مطعم.", time: "قبل 3س" },
];

const aiInsights = [
  { icon: TrendingDown, tone: "destructive", text: "الإيرادات انخفضت هذا الأسبوع بنسبة 12%." },
  { icon: Star, tone: "info", text: "أكثر خدمة مبيعاً: استشارة HN AI." },
  { icon: Users, tone: "warning", text: "17 عميلاً معرّض لإلغاء الاشتراك خلال 30 يوماً." },
  { icon: Sparkles, tone: "info", text: "اقتراح: خصم 10% للاشتراك السنوي لزيادة التجديد." },
];

// ─── helpers ────────────────────────────────────────────────
type Tone = "info" | "warning" | "destructive" | "success";
const toneClasses: Record<Tone, string> = {
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

function Kpi({
  label, value, icon: Icon, delta, positive = true,
}: { label: string; value: string; icon: any; delta?: string; positive?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
        {delta && (
          <div className={`mt-1 flex items-center gap-1 text-xs ${positive ? "text-emerald-600" : "text-destructive"}`}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function statusBadge(status: string) {
  if (status === "مدفوع" || status === "نشط") return <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">{status}</Badge>;
  if (status === "فشل") return <Badge variant="destructive">{status}</Badge>;
  if (status === "منتهي") return <Badge variant="secondary">{status}</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

// ─── main ───────────────────────────────────────────────────
export function DashboardOverview() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* KPI Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم</h1>
            <p className="text-sm text-muted-foreground">نظرة عامة على أداء موقعك اليوم</p>
          </div>
          <TabsList>
            <TabsTrigger value="activity"><Activity className="me-1 h-4 w-4" />النشاط</TabsTrigger>
            <TabsTrigger value="sales"><Banknote className="me-1 h-4 w-4" />المبيعات</TabsTrigger>
            <TabsTrigger value="subs"><Repeat className="me-1 h-4 w-4" />الاشتراكات</TabsTrigger>
            <TabsTrigger value="pay"><CreditCard className="me-1 h-4 w-4" />المدفوعات</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="activity" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Kpi label="الزوار اليوم" value="4,821" icon={Users} delta="+12.4%" />
          <Kpi label="المستخدمون النشطون" value="1,204" icon={Activity} delta="+3.1%" />
          <Kpi label="عملاء جدد" value="63" icon={UserPlus} delta="+8" />
          <Kpi label="طلبات جديدة" value="128" icon={ShoppingCart} delta="+21" />
          <Kpi label="اشتراكات جديدة" value="19" icon={Repeat} delta="+4" />
        </TabsContent>
        <TabsContent value="sales" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Kpi label="مبيعات اليوم" value="3,240$" icon={Banknote} delta="+18%" />
          <Kpi label="مبيعات الشهر" value="72,410$" icon={TrendingUp} delta="+24%" />
          <Kpi label="الإيرادات السنوية" value="612,900$" icon={BarChart3} delta="+11%" />
          <Kpi label="متوسط قيمة الطلب" value="184$" icon={ShoppingBag} delta="-2%" positive={false} />
          <Kpi label="الأرباح الصافية" value="41,220$" icon={BadgeCheck} delta="+9%" />
        </TabsContent>
        <TabsContent value="subs" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="اشتراكات نشطة" value="842" icon={CheckCircle2} delta="+3%" />
          <Kpi label="اشتراكات منتهية" value="47" icon={XCircle} delta="-5%" positive={false} />
          <Kpi label="ستنتهي قريباً" value="23" icon={Clock} delta="خلال 7 أيام" />
          <Kpi label="معدل التجديد" value="87%" icon={Repeat} delta="+2%" />
        </TabsContent>
        <TabsContent value="pay" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="مدفوعات ناجحة" value="1,942" icon={CheckCircle2} delta="+6%" />
          <Kpi label="مدفوعات فاشلة" value="34" icon={XCircle} delta="-12%" positive={false} />
          <Kpi label="مبالغ مسترجعة" value="1,120$" icon={RefreshCw} delta="-3%" positive={false} />
          <Kpi label="الإيراد الأعلى" value="بطاقة 52%" icon={CreditCard} />
        </TabsContent>
      </Tabs>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>الإيرادات</CardTitle>
              <CardDescription>مقارنة الأشهر السابقة</CardDescription>
            </div>
            <Tabs defaultValue="month">
              <TabsList>
                <TabsTrigger value="day">يومي</TabsTrigger>
                <TabsTrigger value="month">شهري</TabsTrigger>
                <TabsTrigger value="year">سنوي</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueMonthly}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="v" name="هذا العام" stroke="var(--chart-1)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="p" name="العام السابق" stroke="var(--chart-2)" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع وسائل الدفع</CardTitle>
            <CardDescription>نسبة الاستخدام</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {paymentSplit.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {paymentSplit.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: pieColors[i] }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ms-auto font-medium">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>نمو المستخدمين</CardTitle>
            <CardDescription>آخر 7 أشهر</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="u" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الإيرادات اليومية</CardTitle>
            <CardDescription>هذا الأسبوع</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueDaily}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="v" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أفضل المنتجات</CardTitle>
            <CardDescription>حسب عدد المبيعات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.map((p, i) => {
              const max = topProducts[0].sales;
              return (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{i + 1}. {p.name}</span>
                    <span className="text-muted-foreground">{p.sales}</span>
                  </div>
                  <Progress value={(p.sales / max) * 100} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* HN AI Insights */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>HN AI</CardTitle>
              <CardDescription>رؤى ذكية عن أدائك</CardDescription>
            </div>
          </div>
          <Badge variant="secondary">تجريبي</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {aiInsights.map((a, i) => (
            <div key={i} className={`rounded-lg border p-3 ${toneClasses[a.tone as Tone]}`}>
              <a.icon className="mb-2 h-4 w-4" />
              <p className="text-sm">{a.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent activity + Alerts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>آخر النشاط</CardTitle>
              <CardDescription>الطلبات، الدفعات، الاشتراكات</CardDescription>
            </div>
            <Button variant="outline" size="sm">عرض الكل</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الوقت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell>{o.customer}</TableCell>
                    <TableCell>{o.amount}$</TableCell>
                    <TableCell>{statusBadge(o.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{o.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>التنبيهات</CardTitle>
              <CardDescription>{alerts.length} تنبيه نشط</CardDescription>
            </div>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-lg border p-3 ${toneClasses[a.tone as Tone]}`}>
                <a.icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs opacity-80">{a.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>اختصارات سريعة</CardTitle>
          <CardDescription>أنشئ عمليات جديدة بنقرة واحدة</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { icon: UserPlus, label: "إضافة عميل" },
            { icon: Package, label: "إنشاء منتج" },
            { icon: Repeat, label: "إنشاء خطة" },
            { icon: Send, label: "إرسال فاتورة" },
            { icon: Ticket, label: "إنشاء كوبون" },
            { icon: CreditCard, label: "صفحة دفع" },
            { icon: Users, label: "إضافة موظف" },
          ].map((a) => (
            <Button key={a.label} variant="outline" className="h-20 flex-col gap-2">
              <a.icon className="h-5 w-5" />
              <span className="text-xs">{a.label}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Stats + system + performance */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات الموقع</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            {[
              { l: "مستخدمون", v: "12,480" }, { l: "منتجات", v: "342" },
              { l: "خدمات", v: "27" }, { l: "مقالات", v: "184" },
              { l: "ملفات", v: "2,910" }, { l: "طلبات", v: "8,204" },
              { l: "رسائل", v: "1,320" }, { l: "تقييمات", v: "946" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">{s.l}</div>
                <div className="mt-1 text-lg font-bold">{s.v}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>حالة النظام</CardTitle>
            <CardDescription>آخر مزامنة: قبل 3 دقائق • v2.4.0</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {systemStatus.map((s) => (
              <div key={s.label} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{s.label}</span>
                </div>
                {s.ok ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">
                    <CheckCircle2 className="me-1 h-3 w-3" />يعمل
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle className="me-1 h-3 w-3" />مشكلة
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أداء الموقع</CardTitle>
            <CardDescription>مراقبة الموارد</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {performance.map((p) => (
              <div key={p.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{p.label}</span>
                  <span className="font-medium">{p.unit}</span>
                </div>
                <Progress value={p.value} className="h-2" />
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Gauge className="h-4 w-4" />
              الأداء العام: ممتاز
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks + Calendar + Customers */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>المهام</CardTitle>
            <CardDescription>عناصر تحتاج إلى إجراء</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.map((t) => (
              <div key={t.label} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{t.label}</span>
                <Badge className={toneClasses[t.tone]}>{t.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>التقويم</CardTitle>
              <CardDescription>الأحداث القادمة</CardDescription>
            </div>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {calendar.map((e, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-2">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-muted">
                  <span className="text-lg font-bold leading-none">{e.day}</span>
                  <span className="text-[10px] text-muted-foreground">{e.month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{e.title}</div>
                  <Badge variant="outline" className="mt-1 text-[10px]">{e.tag}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آخر العملاء</CardTitle>
            <CardDescription>أعلى قيمة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {customers.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{c.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium">{c.name}</span>
                    {statusBadge(c.status)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{c.last}</span>
                    <span className="font-medium text-foreground">{c.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>الرسائل</CardTitle>
            <CardDescription>دعم، تعليقات، تنبيهات داخلية</CardDescription>
          </div>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {messages.map((m, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                  <Avatar className="h-8 w-8"><AvatarFallback>{m.name.slice(0, 2)}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{m.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
