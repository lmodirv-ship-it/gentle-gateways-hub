import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader, Panel, StatusChip, DataState } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { date } from "@/lib/format";
import { toast } from "sonner";
import { ExternalLink, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/sites")({
  head: () => ({
    meta: [
      { title: "المواقع — HN Groupe" },
      { name: "description", content: "إدارة مواقعك المرتبطة بحسابك وخططها وحالتها." },
      { property: "og:title", content: "المواقع — HN Groupe" },
      { property: "og:description", content: "إدارة مواقعك المرتبطة بحسابك وخططها وحالتها." },
    ],
  }),
  component: SitesPage,
});

type SiteRow = {
  id: string;
  name: string;
  domain: string;
  status: string | null;
  plan: string;
  plan_expires_at: string | null;
  currency: string | null;
  created_at: string | null;
};

function SitesPage() {
  const qc = useQueryClient();
  const { data, error, isPending } = useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sites")
        .select("id, name, domain, status, plan, plan_expires_at, currency, created_at")
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as SiteRow[];
    },
  });

  const activate = useMutation({
    mutationFn: async (siteId: string) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("غير مسجّل");
      const { error } = await supabase.from("profiles").update({ active_site_id: siteId }).eq("id", u.user.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("تم تعيين الموقع النشط");
      qc.invalidateQueries({ queryKey: ["account"] });
    },
    onError: (e: Error) => toast.error("تعذّر التعيين", { description: e.message }),
  });

  return (
    <Page>
      <PageHeader title="المواقع" description="كل المواقع المرتبطة بحسابك." />
      <Panel>
        <DataState isPending={isPending} error={error} data={data} empty="لا توجد مواقع بعد">
          {(rows) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الدومين</TableHead>
                  <TableHead>الخطة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تنتهي</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="font-mono text-xs">{s.domain}</TableCell>
                    <TableCell>{s.plan}</TableCell>
                    <TableCell>
                      <StatusChip value={s.status} />
                    </TableCell>
                    <TableCell>{date(s.plan_expires_at)}</TableCell>
                    <TableCell className="space-x-1 text-end">
                      <Button size="sm" variant="ghost" onClick={() => activate.mutate(s.id)}>
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={`https://${s.domain}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
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
