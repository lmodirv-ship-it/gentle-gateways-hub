import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSiteQuery } from "@/hooks/use-site-query";
import { Page, PageHeader, Panel, StatusChip, DataState } from "@/components/page";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { money, dateTime } from "@/lib/format";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({
    meta: [
      { title: "الطلبات — HN Groupe" },
      { name: "description", content: "متابعة طلبات موقعك وحالات الدفع والاسترجاع." },
      { property: "og:title", content: "الطلبات — HN Groupe" },
      { property: "og:description", content: "متابعة طلبات موقعك وحالات الدفع والاسترجاع." },
    ],
  }),
  component: OrdersPage,
});

type Order = {
  id: string;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  provider: string | null;
  placed_at: string;
  customers: { name: string } | null;
};

function OrdersPage() {
  const [q, setQ] = useState("");
  const { data, error, isPending } = useSiteQuery<Order[]>(["orders"], (siteId) =>
    supabase
      .from("orders")
      .select("id, reference, status, amount, currency, payment_method, provider, placed_at, customers(name)")
      .eq("site_id", siteId)
      .order("placed_at", { ascending: false })
      .limit(200),
  );

  const rows = (data ?? []).filter(
    (o) =>
      !q ||
      o.reference.toLowerCase().includes(q.toLowerCase()) ||
      (o.customers?.name ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Page>
      <PageHeader title="الطلبات" description="أحدث 200 طلب للموقع النشط." />
      <Panel
        action={
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث برقم الطلب أو العميل…"
            className="w-56"
          />
        }
        title="قائمة الطلبات"
      >
        <DataState isPending={isPending} error={error} data={rows} empty="لا توجد طلبات">
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المرجع</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الدفع</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.reference}</TableCell>
                    <TableCell>{o.customers?.name ?? "—"}</TableCell>
                    <TableCell className="font-medium">{money(o.amount, o.currency)}</TableCell>
                    <TableCell>
                      <StatusChip value={o.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {o.provider ?? "—"} / {o.payment_method ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">{dateTime(o.placed_at)}</TableCell>
                    <TableCell className="text-end">
                      <Button size="sm" variant="ghost" asChild>
                        <Link to="/orders/$id" params={{ id: o.id }}>
                          <ArrowLeft className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
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
