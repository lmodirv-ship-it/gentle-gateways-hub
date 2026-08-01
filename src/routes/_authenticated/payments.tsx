import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSiteQuery } from "@/hooks/use-site-query";
import { Page, PageHeader, Panel, StatusChip, DataState } from "@/components/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money, dateTime, num } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({
    meta: [
      { title: "المدفوعات — HN Groupe" },
      { name: "description", content: "توزيع المدفوعات بين المزوّدين وحالة الربط." },
      { property: "og:title", content: "المدفوعات — HN Groupe" },
      { property: "og:description", content: "توزيع المدفوعات بين المزوّدين وحالة الربط." },
    ],
  }),
  component: PaymentsPage,
});

type Row = { provider: string | null; amount: number; currency: string; status: string; placed_at: string; reference: string };
type Conn = { id: string; provider: string; status: string | null; last_sync_at: string | null; last_error: string | null };

function PaymentsPage() {
  const payments = useSiteQuery<Row[]>(["payments"], (siteId) =>
    supabase
      .from("orders")
      .select("provider, amount, currency, status, placed_at, reference")
      .eq("site_id", siteId)
      .eq("status", "paid")
      .order("placed_at", { ascending: false })
      .limit(100),
  );

  const conns = useSiteQuery<Conn[]>(["payment-connections"], (siteId) =>
    supabase
      .from("payment_connections")
      .select("id, provider, status, last_sync_at, last_error")
      .eq("site_id", siteId),
  );

  const split = new Map<string, { total: number; count: number }>();
  for (const p of payments.data ?? []) {
    const key = p.provider ?? "غير محدد";
    const cur = split.get(key) ?? { total: 0, count: 0 };
    cur.total += Number(p.amount);
    cur.count += 1;
    split.set(key, cur);
  }

  return (
    <Page>
      <PageHeader title="المدفوعات" description="آخر 100 عملية دفع ناجحة." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...split.entries()].map(([provider, v]) => (
          <div key={provider} className="rounded-xl border bg-card p-4">
            <p className="text-xs uppercase text-muted-foreground">{provider}</p>
            <p className="mt-1 text-2xl font-bold">{money(v.total)}</p>
            <p className="text-xs text-muted-foreground">{num(v.count)} عملية</p>
          </div>
        ))}
      </div>

      <Panel title="بوابات الدفع المرتبطة">
        <DataState isPending={conns.isPending} error={conns.error} data={conns.data} empty="لا توجد بوابات مرتبطة">
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المزوّد</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>آخر مزامنة</TableHead>
                  <TableHead>آخر خطأ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium uppercase">{c.provider}</TableCell>
                    <TableCell><StatusChip value={c.status} /></TableCell>
                    <TableCell className="text-xs">{dateTime(c.last_sync_at)}</TableCell>
                    <TableCell className="text-xs text-destructive">{c.last_error ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataState>
      </Panel>

      <Panel title="آخر العمليات">
        <DataState isPending={payments.isPending} error={payments.error} data={payments.data} empty="لا توجد عمليات دفع">
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المرجع</TableHead>
                  <TableHead>المزوّد</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => (
                  <TableRow key={p.reference}>
                    <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                    <TableCell className="uppercase">{p.provider ?? "—"}</TableCell>
                    <TableCell className="font-medium">{money(p.amount, p.currency)}</TableCell>
                    <TableCell className="text-xs">{dateTime(p.placed_at)}</TableCell>
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
