import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSiteQuery } from "@/hooks/use-site-query";
import { Page, PageHeader, Panel, ErrorState, LoadingRows } from "@/components/page";
import { money, num } from "@/lib/format";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "التحليلات — HN Groupe" },
      { name: "description", content: "تحليل الإيرادات والزيارات والطلبات لآخر 60 يومًا." },
      { property: "og:title", content: "التحليلات — HN Groupe" },
      { property: "og:description", content: "تحليل الإيرادات والزيارات والطلبات لآخر 60 يومًا." },
    ],
  }),
  component: AnalyticsPage,
});

type Snap = {
  snapshot_date: string;
  gross: number | null;
  net: number | null;
  refunds: number | null;
  orders_count: number;
  visitors: number;
};

function AnalyticsPage() {
  const { data, error, isPending } = useSiteQuery<Snap[]>(["analytics"], (siteId) =>
    supabase
      .from("revenue_snapshots")
      .select("snapshot_date, gross, net, refunds, orders_count, visitors")
      .eq("site_id", siteId)
      .order("snapshot_date", { ascending: true })
      .limit(90),
  );

  const rows = (data ?? []).map((r) => ({
    ...r,
    label: new Date(r.snapshot_date).toLocaleDateString("ar", { month: "short", day: "numeric" }),
  }));

  const totalGross = rows.reduce((s, r) => s + Number(r.gross ?? 0), 0);
  const totalNet = rows.reduce((s, r) => s + Number(r.net ?? 0), 0);
  const totalVisitors = rows.reduce((s, r) => s + r.visitors, 0);
  const totalOrders = rows.reduce((s, r) => s + r.orders_count, 0);

  return (
    <Page>
      <PageHeader title="التحليلات" description="أداء الموقع النشط عبر الزمن." />

      {isPending ? (
        <LoadingRows rows={4} />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="إجمالي الإيرادات" value={money(totalGross)} />
            <Kpi label="الصافي" value={money(totalNet)} />
            <Kpi label="الزيارات" value={num(totalVisitors)} />
            <Kpi label="الطلبات" value={num(totalOrders)} />
          </div>

          <Panel title="الإيرادات (إجمالي / صافي)">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="gross" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.18} />
                  <Area type="monotone" dataKey="net" stroke="hsl(var(--muted-foreground))" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="الزيارات والطلبات">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders_count" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </>
      )}
    </Page>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
