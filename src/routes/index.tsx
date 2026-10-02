import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  CreditCard,
  Globe,
  Layers,
  Repeat,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingForms } from "@/components/landing-forms";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HN Groupe — منصة إدارة المواقع والإيرادات" },
      { name: "description", content: "منصة موحّدة لإدارة مواقعك ومبيعاتك واشتراكاتك ومدفوعاتك في مكان واحد." },
      { property: "og:title", content: "HN Groupe — منصة إدارة المواقع والإيرادات" },
      { property: "og:description", content: "منصة موحّدة لإدارة مواقعك ومبيعاتك واشتراكاتك ومدفوعاتك في مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: BarChart3,
    title: "تحليلات مركزية",
    description: "تتبّع الإيرادات والعملاء والمنتجات الأكثر مبيعًا من كل موقع في لوحة واحدة.",
  },
  {
    icon: CreditCard,
    title: "مدفوعات موحّدة",
    description: "أدرِج Stripe وPayPal وبواباتك المخصّصة مع فواتير تلقائية وتتبّع للمدفوعات.",
  },
  {
    icon: Repeat,
    title: "اشتراكات ذكية",
    description: "تتبّع الاشتراكات والتجديدات التلقائية مع تنبيهات قبل الاستحقاق.",
  },
  {
    icon: Sparkles,
    title: "رؤى HN AI",
    description: "توصيات مولّدة ذكيًا من بياناتك لزيادة الإيراد وتحسين قراراتك.",
  },
  {
    icon: Shield,
    title: "أدوار وأمان",
    description: "تحكم دقيق بالأدوار والوصول، مع سياسات RLS لحماية بيانات كل موقع.",
  },
  {
    icon: Globe,
    title: "إدارة المواقع",
    description: "أضف مواقعًا متعددة وبدّل بينها بسهولة مع عملات وإعدادات مستقلة.",
  },
];

const steps = [
  {
    step: "١",
    title: "أنشئ حسابك",
    description: "سجّل دخولك عبر Google أو البريد، وسيتم إنشاء موقع افتراضي لك تلقائيًا.",
  },
  {
    step: "٢",
    title: "اربط موقعك",
    description: "أضف نطاقك واختر العملة، ثم اربط بوابات الدفع التي تستخدمها.",
  },
  {
    step: "٣",
    title: "استورد بياناتك",
    description: "أدخل الطلبات والعملاء والمنتجات يدويًا أو عبر الربط بالقاعدة المحلية.",
  },
  {
    step: "٤",
    title: "راقب ونمّ",
    description: "تابع لوحة التحكم والتحليلات والرؤى الذكية لاتخاذ قرارات أسرع.",
  },
];

const gallery = [
  {
    title: "لوحة تحكم شاملة",
    subtitle: "إحصائيات يومية وشهرية",
    icon: Layers,
  },
  {
    title: "إدارة الطلبات",
    subtitle: "حالات السداد والشحن",
    icon: Zap,
  },
  {
    title: "العملاء والاشتراكات",
    subtitle: "قيمة العميل وتاريخه",
    icon: Users,
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
              HN
            </div>
            <span className="text-lg font-bold">HN Groupe</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <a href="#forms">تواصل معنا</a>
            </Button>
            <Button asChild>
              <Link to="/auth">تسجيل الدخول</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            منصة جديدة لإدارة المواقع والإيرادات
          </div>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            مواقعك، مبيعاتك، واشتراكاتك
            <span className="block text-primary">في لوحة تحكم واحدة</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            HN Groupe تمنحك رؤية موحّدة لكل مواقعك: إيرادات، طلبات، عملاء، مدفوعات، ورؤى ذكية
            تساعدك على النمو بسرعة.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/auth">ابدأ الآن</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">تسجيل الدخول</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">لماذا HN Groupe؟</h2>
            <p className="mt-2 text-muted-foreground">كل ما تحتاجه لإدارة مواقعك التجارية</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border border-border/50 bg-card/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">كيف تبدأ؟</h2>
            <p className="mt-2 text-muted-foreground">أربع خطوات بسيطة للانطلاق</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.title}
                className="relative rounded-2xl border border-border/50 bg-card/40 p-6 text-center backdrop-blur-sm"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {s.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">لمحة من المنصة</h2>
            <p className="mt-2 text-muted-foreground">واجهات نظيفة تركّز على قراراتك</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {gallery.map((g) => (
              <Card
                key={g.title}
                className="overflow-hidden border border-border/50 bg-card/60 backdrop-blur-sm"
              >
                <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-muted/30" />
                <CardContent className="pb-6">
                  <div className="-mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                    <g.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{g.title}</h3>
                  <p className="text-sm text-muted-foreground">{g.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-primary/30 bg-primary/10 p-10 text-center backdrop-blur-sm">
          <h2 className="text-2xl font-bold sm:text-3xl">جاهز لتوحيد إدارة مواقعك؟</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            أنشئ حسابك الآن وابدأ بمتابعة أداء مواقعك ومبيعاتك في مكان واحد.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link to="/auth">ابدأ مجانًا</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              HN
            </div>
            <span className="font-semibold">HN Groupe</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 HN Groupe. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
