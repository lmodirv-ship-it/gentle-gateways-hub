import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Page, PageHeader, Panel, StatusChip, LoadingRows, ErrorState, EmptyState } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { dateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/support/$id")({
  head: () => ({
    meta: [
      { title: "تذكرة الدعم — HN Groupe" },
      { name: "description", content: "محادثة تذكرة الدعم والرد عليها." },
      { property: "og:title", content: "تذكرة الدعم — HN Groupe" },
      { property: "og:description", content: "محادثة تذكرة الدعم والرد عليها." },
    ],
  }),
  component: TicketDetail,
  errorComponent: ({ error }) => <ErrorState error={error} />,
  notFoundComponent: () => <EmptyState title="التذكرة غير موجودة" />,
});

function TicketDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [body, setBody] = useState("");

  const { data, error, isPending } = useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const [t, m] = await Promise.all([
        supabase
          .from("support_tickets")
          .select("id, subject, status, priority, last_message_at, customers(name)")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("ticket_messages")
          .select("id, author, body, created_at")
          .eq("ticket_id", id)
          .order("created_at", { ascending: true }),
      ]);
      if (t.error) throw new Error(t.error.message);
      return { ticket: t.data, messages: m.data ?? [] };
    },
  });

  const reply = useMutation({
    mutationFn: async (text: string) => {
      const { error: e1 } = await supabase.from("ticket_messages").insert({ ticket_id: id, author: "agent", body: text });
      if (e1) throw new Error(e1.message);
      await supabase.from("support_tickets").update({ last_message_at: new Date().toISOString(), status: "pending" }).eq("id", id);
    },
    onSuccess: () => {
      setBody("");
      toast.success("تم إرسال الرد");
      qc.invalidateQueries({ queryKey: ["ticket", id] });
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isPending) return <Page><LoadingRows rows={5} /></Page>;
  if (error) return <Page><ErrorState error={error} /></Page>;
  if (!data?.ticket) return <Page><EmptyState title="التذكرة غير موجودة" /></Page>;

  const t = data.ticket;

  return (
    <Page>
      <PageHeader
        title={t.subject}
        description={t.customers?.name ?? undefined}
        action={
          <div className="flex items-center gap-2">
            <StatusChip value={t.priority} />
            <StatusChip value={t.status} />
            <Button variant="outline" asChild>
              <Link to="/support">عودة</Link>
            </Button>
          </div>
        }
      />

      <Panel title="المحادثة">
        <div className="space-y-3">
          {data.messages.length === 0 && <EmptyState title="لا توجد رسائل" />}
          {data.messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[80%] rounded-xl border p-3 text-sm",
                m.author === "agent" ? "ms-auto bg-primary/10" : "bg-muted",
              )}
            >
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {m.author === "agent" ? "فريق الدعم" : "العميل"} • {dateTime(m.created_at)}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="الرد">
        <div className="space-y-3">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="اكتب ردك…" />
          <Button disabled={!body.trim() || reply.isPending} onClick={() => reply.mutate(body.trim())}>
            {reply.isPending ? "جارٍ الإرسال…" : "إرسال"}
          </Button>
        </div>
      </Panel>
    </Page>
  );
}
