import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSiteQuery } from "@/hooks/use-site-query";
import { Page, PageHeader, Panel, StatusChip, DataState } from "@/components/page";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money, num } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({
    meta: [
      { title: "المنتجات — HN Groupe" },
      { name: "description", content: "كتالوج منتجاتك وخدماتك وقوالبك وأسعارها." },
      { property: "og:title", content: "المنتجات — HN Groupe" },
      { property: "og:description", content: "كتالوج منتجاتك وخدماتك وقوالبك وأسعارها." },
    ],
  }),
  component: ProductsPage,
});

type Product = {
  id: string;
  name: string;
  sku: string | null;
  type: string;
  price: number;
  currency: string;
  stock: number | null;
  active: boolean;
};

function ProductsPage() {
  const [q, setQ] = useState("");
  const { data, error, isPending } = useSiteQuery<Product[]>(["products"], (siteId) =>
    supabase
      .from("products")
      .select("id, name, sku, type, price, currency, stock, active")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false }),
  );

  const rows = (data ?? []).filter((p) => !q || p.name.includes(q) || (p.sku ?? "").toLowerCase().includes(q.toLowerCase()));

  return (
    <Page>
      <PageHeader title="المنتجات" description="ما تبيعه على الموقع النشط." />
      <Panel
        title="الكتالوج"
        action={<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو SKU…" className="w-56" />}
      >
        <DataState isPending={isPending} error={error} data={rows} empty="لا توجد منتجات">
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>المخزون</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-mono text-xs">{p.sku ?? "—"}</TableCell>
                    <TableCell>
                      <StatusChip value={p.type} />
                    </TableCell>
                    <TableCell>{money(p.price, p.currency)}</TableCell>
                    <TableCell>{p.stock === null ? "∞" : num(p.stock)}</TableCell>
                    <TableCell>
                      <StatusChip value={p.active ? "active" : "inactive"} />
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
