import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader, Panel, StatusChip, LoadingRows, ErrorState, EmptyState } from "@/components/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { money, date, dateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/customers/$id")({
  head: () => ({
    meta: [
      { title: "ملف العميل — HN Groupe" },
      { name: "description", content: "ملف العميل: الطلبات والاشتراكات والقيمة الدائمة." },
      { property: "og:title", content: "ملف العميل — HN Groupe" },
      { property: "og:description", content: "ملف العميل: الطلبات والاشتراكات والقيمة الدائمة." },
    ],
  }),
  component: CustomerDetail,
  errorComponent: ({ error }) => <ErrorState error={error} />,
  notFoundComponent: () => <EmptyState title="العميل غير موجود" />,
});

function CustomerDetail() {
  const { id } = Route.useParams();

  const { data, error, isPending } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const [c, o, s] = await Promise.all([
        supabase
          .from("customers")
          .select("id, name, email, phone, country, status, lifetime_value, first_seen_at, last_purchase_at")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("orders")
          .select("id, reference, status, amount, currency, placed_at")
          .eq("customer_id", id)
          .order("placed_at", { ascending: false })
          .limit(20),
        supabase
          .from("subscriptions")
          .select("id, plan_name, status, renewal_price, currency, current_period_end")
          .eq("customer_id", id),
      ]);
      if (c.error) throw new Error(c.error.message);
      return { customer: c.data, orders: o.data ?? [], subs: s.data ?? [] };
    },
  });

  if (isPending) return <Page><LoadingRows rows={5} /></Page>;
  if (error) return <Page><ErrorState error={error} /></Page>;
  if (!data?.customer) return <Page><EmptyState title="العميل غير موجود" /></Page>;

  const c = data.customer;

  return (
    <Page>
      <PageHeader
        title={c.name}
        description={c.email ?? undefined}
        action={
          <Button variant="outline" asChild>
            <Link to="/customers">عودة للعملاء</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="القيمة الدائمة" value={money(c.lifetime_value)} />
        <Stat label="الحالة" value={<StatusChip value={c.status} />} />
        <Stat label="أول ظهور" value={date(c.first_seen_at)} />
        <Stat label="آخر شراء" value={date(c.last_purchase_at)} />
      </div>

      <Panel title="الطلبات">
        {data.orders.length === 0 ? (
          <EmptyState title="لا توجد طلبات" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المرجع</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link to="/orders/$id" params={{ id: o.id }} className="font-mono text-xs underline">
                      {o.reference}
                    </Link>
                  </TableCell>
                  <TableCell>{money(o.amount, o.currency)}</TableCell>
                  <TableCell><StatusChip value={o.status} /></TableCell>
                  <TableCell className="text-xs">{dateTime(o.placed_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>

      <Panel title="الاشتراكات">
        {data.subs.length === 0 ? (
          <EmptyState title="لا توجد اشتراكات" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الخطة</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>نهاية الفترة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.subs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.plan_name}</TableCell>
                  <TableCell>{money(s.renewal_price, s.currency)}</TableCell>
                  <TableCell><StatusChip value={s.status} /></TableCell>
                  <TableCell className="text-xs">{date(s.current_period_end)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
