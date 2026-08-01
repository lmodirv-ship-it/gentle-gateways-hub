import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSiteQuery } from "@/hooks/use-site-query";
import { Page, PageHeader, Panel, StatusChip, DataState } from "@/components/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { date, num } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/coupons")({
  head: () => ({
    meta: [
      { title: "الكوبونات — HN Groupe" },
      { name: "description", content: "أكواد الخصم ونسب الاستخدام وتواريخ الانتهاء." },
      { property: "og:title", content: "الكوبونات — HN Groupe" },
      { property: "og:description", content: "أكواد الخصم ونسب الاستخدام وتواريخ الانتهاء." },
    ],
  }),
  component: CouponsPage,
});

type Coupon = {
  id: string;
  code: string;
  discount_type: string;
  value: number;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
};

function CouponsPage() {
  const { data, error, isPending } = useSiteQuery<Coupon[]>(["coupons"], (siteId) =>
    supabase
      .from("coupons")
      .select("id, code, discount_type, value, usage_limit, used_count, active, expires_at")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false }),
  );

  return (
    <Page>
      <PageHeader title="الكوبونات" description="أكواد الخصم الخاصة بالموقع النشط." />
      <Panel title="قائمة الكوبونات">
        <DataState isPending={isPending} error={error} data={data} empty="لا توجد كوبونات">
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الخصم</TableHead>
                  <TableHead>الاستخدام</TableHead>
                  <TableHead>ينتهي</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((c) => {
                  const pct = c.usage_limit ? Math.min(100, (c.used_count / c.usage_limit) * 100) : 0;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono font-medium">{c.code}</TableCell>
                      <TableCell>
                        {c.discount_type === "percent" ? `${num(c.value)}%` : `${num(c.value)} ثابت`}
                      </TableCell>
                      <TableCell className="w-48">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            {num(c.used_count)} / {c.usage_limit ? num(c.usage_limit) : "∞"}
                          </p>
                          {c.usage_limit ? <Progress value={pct} className="h-1.5" /> : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{date(c.expires_at)}</TableCell>
                      <TableCell><StatusChip value={c.active ? "active" : "inactive"} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DataState>
      </Panel>
    </Page>
  );
}
