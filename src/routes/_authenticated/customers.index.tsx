import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSiteQuery } from "@/hooks/use-site-query";
import { Page, PageHeader, Panel, StatusChip, DataState } from "@/components/page";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money, date } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/customers/")({
  head: () => ({
    meta: [
      { title: "العملاء — HN Groupe" },
      { name: "description", content: "قاعدة عملائك وقيمتهم الدائمة وآخر عملية شراء." },
      { property: "og:title", content: "العملاء — HN Groupe" },
      { property: "og:description", content: "قاعدة عملائك وقيمتهم الدائمة وآخر عملية شراء." },
    ],
  }),
  component: CustomersPage,
});

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  status: string;
  lifetime_value: number;
  last_purchase_at: string | null;
};

function CustomersPage() {
  const [q, setQ] = useState("");
  const { data, error, isPending } = useSiteQuery<Customer[]>(["customers"], (siteId) =>
    supabase
      .from("customers")
      .select("id, name, email, phone, country, status, lifetime_value, last_purchase_at")
      .eq("site_id", siteId)
      .order("lifetime_value", { ascending: false })
      .limit(200),
  );

  const rows = (data ?? []).filter(
    (c) => !q || c.name.includes(q) || (c.email ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Page>
      <PageHeader title="العملاء" description="أعلى العملاء قيمةً أولًا." />
      <Panel
        title="قائمة العملاء"
        action={<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو البريد…" className="w-56" />}
      >
        <DataState isPending={isPending} error={error} data={rows} empty="لا يوجد عملاء">
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>البلد</TableHead>
                  <TableHead>القيمة الدائمة</TableHead>
                  <TableHead>آخر شراء</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link to="/customers/$id" params={{ id: c.id }} className="underline">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs">{c.email ?? "—"}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{c.phone ?? "—"}</TableCell>
                    <TableCell>{c.country ?? "—"}</TableCell>
                    <TableCell className="font-medium">{money(c.lifetime_value)}</TableCell>
                    <TableCell className="text-xs">{date(c.last_purchase_at)}</TableCell>
                    <TableCell>
                      <StatusChip value={c.status} />
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
