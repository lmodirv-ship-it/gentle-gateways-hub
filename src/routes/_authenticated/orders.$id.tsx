import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader, Panel, StatusChip, LoadingRows, ErrorState, EmptyState } from "@/components/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { money, dateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل الطلب — HN Groupe" },
      { name: "description", content: "تفاصيل الطلب وعناصره وحالة الدفع." },
      { property: "og:title", content: "تفاصيل الطلب — HN Groupe" },
      { property: "og:description", content: "تفاصيل الطلب وعناصره وحالة الدفع." },
    ],
  }),
  component: OrderDetail,
  errorComponent: ({ error }) => <ErrorState error={error} />,
  notFoundComponent: () => <EmptyState title="الطلب غير موجود" />,
});

function OrderDetail() {
  const { id } = Route.useParams();

  const { data, error, isPending } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, reference, status, amount, currency, payment_method, provider, provider_ref, placed_at, customers(id, name, email), order_items(id, name, quantity, unit_price)",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  if (isPending) return <Page><LoadingRows rows={5} /></Page>;
  if (error) return <Page><ErrorState error={error} /></Page>;
  if (!data) return <Page><EmptyState title="الطلب غير موجود" /></Page>;

  const items = data.order_items ?? [];

  return (
    <Page>
      <PageHeader
        title={`الطلب ${data.reference}`}
        description={dateTime(data.placed_at)}
        action={
          <Button variant="outline" asChild>
            <Link to="/orders">عودة للطلبات</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="ملخّص" className="lg:col-span-2">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="المبلغ" value={money(data.amount, data.currency)} />
            <Field label="الحالة" value={<StatusChip value={data.status} />} />
            <Field label="المزوّد" value={data.provider ?? "—"} />
            <Field label="طريقة الدفع" value={data.payment_method ?? "—"} />
            <Field label="مرجع المزوّد" value={data.provider_ref ?? "—"} />
          </dl>
        </Panel>

        <Panel title="العميل">
          {data.customers ? (
            <div className="space-y-1 text-sm">
              <Link to="/customers/$id" params={{ id: data.customers.id }} className="font-medium underline">
                {data.customers.name}
              </Link>
              <p className="text-muted-foreground">{data.customers.email ?? "—"}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">بدون عميل مرتبط</p>
          )}
        </Panel>
      </div>

      <Panel title="عناصر الطلب">
        {items.length === 0 ? (
          <EmptyState title="لا توجد عناصر" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>سعر الوحدة</TableHead>
                <TableHead>الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.name}</TableCell>
                  <TableCell>{it.quantity}</TableCell>
                  <TableCell>{money(it.unit_price, data.currency)}</TableCell>
                  <TableCell className="font-medium">{money(it.quantity * Number(it.unit_price), data.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </Page>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
