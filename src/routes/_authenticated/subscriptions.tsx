import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSiteQuery } from "@/hooks/use-site-query";
import { Page, PageHeader, Panel, StatusChip, DataState } from "@/components/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money, date } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/subscriptions")({
  head: () => ({
    meta: [
      { title: "الاشتراكات — HN Groupe" },
      { name: "description", content: "الاشتراكات النشطة والمتأخرة وتواريخ التجديد." },
      { property: "og:title", content: "الاشتراكات — HN Groupe" },
      { property: "og:description", content: "الاشتراكات النشطة والمتأخرة وتواريخ التجديد." },
    ],
  }),
  component: SubscriptionsPage,
});

type Sub = {
  id: string;
  plan_name: string;
  status: string;
  renewal_price: number;
  currency: string;
  billing_interval: string;
  started_at: string;
  current_period_end: string | null;
  customers: { id: string; name: string } | null;
};

function SubscriptionsPage() {
  const { data, error, isPending } = useSiteQuery<Sub[]>(["subscriptions"], (siteId) =>
    supabase
      .from("subscriptions")
      .select("id, plan_name, status, renewal_price, currency, billing_interval, started_at, current_period_end, customers(id, name)")
      .eq("site_id", siteId)
      .order("current_period_end", { ascending: true }),
  );

  const mrr = (data ?? [])
    .filter((s) => s.status === "active" || s.status === "trialing")
    .reduce((sum, s) => sum + Number(s.renewal_price) / (s.billing_interval === "year" ? 12 : 1), 0);

  return (
    <Page>
      <PageHeader title="الاشتراكات" description={`الإيراد الشهري المتكرر التقديري: ${money(mrr)}`} />
      <Panel title="كل الاشتراكات">
        <DataState isPending={isPending} error={error} data={data} empty="لا توجد اشتراكات">
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الخطة</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الدورة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>نهاية الفترة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.plan_name}</TableCell>
                    <TableCell>{s.customers?.name ?? "—"}</TableCell>
                    <TableCell>{money(s.renewal_price, s.currency)}</TableCell>
                    <TableCell>{s.billing_interval === "year" ? "سنوي" : "شهري"}</TableCell>
                    <TableCell><StatusChip value={s.status} /></TableCell>
                    <TableCell className="text-xs">{date(s.current_period_end)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataState>
      </Panel>
    </Page>
  );
}
