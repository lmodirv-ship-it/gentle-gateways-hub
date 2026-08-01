import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSiteQuery } from "@/hooks/use-site-query";
import { Page, PageHeader, Panel, StatusChip, DataState } from "@/components/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money, date } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/invoices")({
  head: () => ({
    meta: [
      { title: "الفواتير — HN Groupe" },
      { name: "description", content: "فواتير موقعك وحالات السداد والاستحقاق." },
      { property: "og:title", content: "الفواتير — HN Groupe" },
      { property: "og:description", content: "فواتير موقعك وحالات السداد والاستحقاق." },
    ],
  }),
  component: InvoicesPage,
});

type Invoice = {
  id: string;
  number: string;
  status: string;
  amount: number;
  currency: string;
  due_at: string | null;
  paid_at: string | null;
  customers: { name: string } | null;
};

function InvoicesPage() {
  const { data, error, isPending } = useSiteQuery<Invoice[]>(["invoices"], (siteId) =>
    supabase
      .from("invoices")
      .select("id, number, status, amount, currency, due_at, paid_at, customers(name)")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(200),
  );

  const unpaid = (data ?? []).filter((i) => i.status === "open" || i.status === "overdue");
  const unpaidTotal = unpaid.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <Page>
      <PageHeader title="الفواتير" description={`غير مدفوعة: ${unpaid.length} بقيمة ${money(unpaidTotal)}`} />
      <Panel title="كل الفواتير">
        <DataState isPending={isPending} error={error} data={data} empty="لا توجد فواتير">
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الرقم</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الاستحقاق</TableHead>
                  <TableHead>الدفع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-xs">{i.number}</TableCell>
                    <TableCell>{i.customers?.name ?? "—"}</TableCell>
                    <TableCell className="font-medium">{money(i.amount, i.currency)}</TableCell>
                    <TableCell><StatusChip value={i.status} /></TableCell>
                    <TableCell className="text-xs">{date(i.due_at)}</TableCell>
                    <TableCell className="text-xs">{date(i.paid_at)}</TableCell>
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
