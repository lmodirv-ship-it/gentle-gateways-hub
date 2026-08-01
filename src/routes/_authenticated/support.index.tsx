import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSiteQuery } from "@/hooks/use-site-query";
import { Page, PageHeader, Panel, StatusChip, DataState } from "@/components/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/support/")({
  head: () => ({
    meta: [
      { title: "الدعم — HN Groupe" },
      { name: "description", content: "تذاكر الدعم وحالتها وأولويتها." },
      { property: "og:title", content: "الدعم — HN Groupe" },
      { property: "og:description", content: "تذاكر الدعم وحالتها وأولويتها." },
    ],
  }),
  component: SupportPage,
});

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  last_message_at: string;
  customers: { name: string } | null;
};

function SupportPage() {
  const { data, error, isPending } = useSiteQuery<Ticket[]>(["tickets"], (siteId) =>
    supabase
      .from("support_tickets")
      .select("id, subject, status, priority, last_message_at, customers(name)")
      .eq("site_id", siteId)
      .order("last_message_at", { ascending: false }),
  );

  const open = (data ?? []).filter((t) => t.status === "open" || t.status === "pending").length;

  return (
    <Page>
      <PageHeader title="الدعم" description={`${open} تذكرة تحتاج ردًّا.`} />
      <Panel title="التذاكر">
        <DataState isPending={isPending} error={error} data={data} empty="لا توجد تذاكر">
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الموضوع</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>آخر رسالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      <Link to="/support/$id" params={{ id: t.id }} className="underline">
                        {t.subject}
                      </Link>
                    </TableCell>
                    <TableCell>{t.customers?.name ?? "—"}</TableCell>
                    <TableCell><StatusChip value={t.priority} /></TableCell>
                    <TableCell><StatusChip value={t.status} /></TableCell>
                    <TableCell className="text-xs">{dateTime(t.last_message_at)}</TableCell>
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
