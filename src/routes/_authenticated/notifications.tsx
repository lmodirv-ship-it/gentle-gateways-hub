import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader, Panel, DataState } from "@/components/page";
import { Button } from "@/components/ui/button";
import { dateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "الإشعارات — HN Groupe" },
      { name: "description", content: "تنبيهات النظام والطلبات والاشتراكات." },
      { property: "og:title", content: "الإشعارات — HN Groupe" },
      { property: "og:description", content: "تنبيهات النظام والطلبات والاشتراكات." },
    ],
  }),
  component: NotificationsPage,
});

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

function NotificationsPage() {
  const qc = useQueryClient();

  const { data, error, isPending } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, body, link, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return (data ?? []) as Notif[];
    },
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = (data ?? []).filter((n) => !n.read_at).length;

  return (
    <Page>
      <PageHeader
        title="الإشعارات"
        description={`${unread} غير مقروء`}
        action={
          <Button variant="outline" disabled={unread === 0 || markAll.isPending} onClick={() => markAll.mutate()}>
            تحديد الكل كمقروء
          </Button>
        }
      />
      <Panel title="الأحدث">
        <DataState isPending={isPending} error={error} data={data} empty="لا توجد إشعارات">
          {(list) => (
            <div className="divide-y">
              {list.map((n) => (
                <div key={n.id} className={cn("flex gap-3 py-3", !n.read_at && "bg-primary/5")}>
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read_at ? "bg-muted" : "bg-primary")} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 text-[11px] text-muted-foreground">{dateTime(n.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DataState>
      </Panel>
    </Page>
  );
}
