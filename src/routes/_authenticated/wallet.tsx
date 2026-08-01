import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSiteQuery } from "@/hooks/use-site-query";
import { Page, PageHeader, Panel, StatusChip, DataState } from "@/components/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money, dateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({
    meta: [
      { title: "المحفظة — HN Groupe" },
      { name: "description", content: "حركات المحفظة: الإيداعات والعمولات والتحويلات." },
      { property: "og:title", content: "المحفظة — HN Groupe" },
      { property: "og:description", content: "حركات المحفظة: الإيداعات والعمولات والتحويلات." },
    ],
  }),
  component: WalletPage,
});

type Tx = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  balance_after: number | null;
  reference: string | null;
  description: string | null;
  created_at: string;
};

function WalletPage() {
  const { data, error, isPending } = useSiteQuery<Tx[]>(["wallet"], (siteId) =>
    supabase
      .from("wallet_transactions")
      .select("id, type, amount, currency, balance_after, reference, description, created_at")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(100),
  );

  const rows = data ?? [];
  const balance = rows.length > 0 ? rows[0].balance_after : 0;
  const inflow = rows.filter((r) => Number(r.amount) > 0).reduce((s, r) => s + Number(r.amount), 0);
  const outflow = rows.filter((r) => Number(r.amount) < 0).reduce((s, r) => s + Number(r.amount), 0);

  return (
    <Page>
      <PageHeader title="المحفظة" description="حركة الأموال في الموقع النشط." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Box label="الرصيد الحالي" value={money(balance)} />
        <Box label="إجمالي الداخل" value={money(inflow)} />
        <Box label="إجمالي الخارج" value={money(Math.abs(outflow))} />
      </div>

      <Panel title="آخر الحركات">
        <DataState isPending={isPending} error={error} data={rows} empty="لا توجد حركات">
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>النوع</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الرصيد بعدها</TableHead>
                  <TableHead>المرجع</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell><StatusChip value={t.type} /></TableCell>
                    <TableCell className={Number(t.amount) < 0 ? "font-medium text-destructive" : "font-medium text-emerald-600"}>
                      {money(t.amount, t.currency)}
                    </TableCell>
                    <TableCell>{money(t.balance_after, t.currency)}</TableCell>
                    <TableCell className="font-mono text-xs">{t.reference ?? "—"}</TableCell>
                    <TableCell className="text-xs">{t.description ?? "—"}</TableCell>
                    <TableCell className="text-xs">{dateTime(t.created_at)}</TableCell>
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

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
