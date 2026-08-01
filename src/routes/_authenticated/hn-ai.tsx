import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteQuery } from "@/hooks/use-site-query";
import { Page, PageHeader, Panel, StatusChip, DataState } from "@/components/page";
import { Button } from "@/components/ui/button";
import { dateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/hn-ai")({
  head: () => ({
    meta: [
      { title: "HN AI — رؤى ذكية" },
      { name: "description", content: "تحليلات ذكية لأداء موقعك واقتراحات لزيادة الإيراد." },
      { property: "og:title", content: "HN AI — رؤى ذكية" },
      { property: "og:description", content: "تحليلات ذكية لأداء موقعك واقتراحات لزيادة الإيراد." },
    ],
  }),
  component: HnAiPage,
});

type Insight = {
  id: string;
  kind: string;
  severity: string;
  title: string;
  body: string | null;
  generated_at: string;
  dismissed_at: string | null;
};

function HnAiPage() {
  const qc = useQueryClient();
  const { data, error, isPending } = useSiteQuery<Insight[]>(["ai-insights"], (siteId) =>
    supabase
      .from("ai_insights")
      .select("id, kind, severity, title, body, generated_at, dismissed_at")
      .eq("site_id", siteId)
      .is("dismissed_at", null)
      .order("generated_at", { ascending: false }),
  );

  const dismiss = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ai_insights")
        .update({ dismissed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-insights"] }),
  });

  return (
    <Page>
      <PageHeader title="HN AI" description="رؤى مولّدة من بيانات موقعك النشط." />
      <Panel title="الرؤى الحالية">
        <DataState isPending={isPending} error={error} data={data} empty="لا توجد رؤى حاليًا">
          {(list) => (
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((i) => (
                <div key={i.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <StatusChip value={i.severity} />
                    <Button variant="ghost" size="sm" onClick={() => dismiss.mutate(i.id)}>
                      تجاهل
                    </Button>
                  </div>
                  <p className="mt-2 font-semibold">{i.title}</p>
                  {i.body && <p className="mt-1 text-sm text-muted-foreground">{i.body}</p>}
                  <p className="mt-2 text-[11px] text-muted-foreground">{dateTime(i.generated_at)}</p>
                </div>
              ))}
            </div>
          )}
        </DataState>
      </Panel>
    </Page>
  );
}
