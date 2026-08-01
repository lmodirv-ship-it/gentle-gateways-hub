import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";
import { useSiteQuery } from "@/hooks/use-site-query";
import { Page, PageHeader, Panel, StatusChip, DataState, LoadingRows } from "@/components/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — HN Groupe" },
      { name: "description", content: "إدارة الحساب والمواقع وبوابات الدفع وقاعدة البيانات." },
      { property: "og:title", content: "الإعدادات — HN Groupe" },
      { property: "og:description", content: "إدارة الحساب والمواقع وبوابات الدفع وقاعدة البيانات." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <Page>
      <PageHeader title="الإعدادات" description="مركز التحكم في الحساب والمواقع والتكاملات." />
      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="site">الموقع النشط</TabsTrigger>
          <TabsTrigger value="integrations">بوابات الدفع</TabsTrigger>
          <TabsTrigger value="database">قاعدة البيانات</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="site" className="mt-4">
          <SiteTab />
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
          <IntegrationsTab />
        </TabsContent>
        <TabsContent value="database" className="mt-4">
          <DatabaseTab />
        </TabsContent>
      </Tabs>
    </Page>
  );
}

function ProfileTab() {
  const qc = useQueryClient();
  const { data, isPending } = useAccount();
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (data?.profile) {
      setFullName(data.profile.full_name ?? "");
      setAvatar(data.profile.avatar_url ?? "");
    }
  }, [data?.profile]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data?.user) throw new Error("لا توجد جلسة");
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName || null, avatar_url: avatar || null })
        .eq("id", data.user.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("تم حفظ الملف الشخصي");
      qc.invalidateQueries({ queryKey: ["account"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isPending) return <Panel title="الملف الشخصي"><LoadingRows rows={3} /></Panel>;

  return (
    <Panel title="الملف الشخصي" description={data?.user?.email ?? undefined}>
      <div className="grid gap-4 sm:max-w-lg">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">الاسم الكامل</Label>
          <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="avatar">رابط الصورة</Label>
          <Input id="avatar" dir="ltr" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
        </div>
        <Button className="w-fit" disabled={save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? "جارٍ الحفظ…" : "حفظ"}
        </Button>
      </div>
    </Panel>
  );
}

function SiteTab() {
  const qc = useQueryClient();
  const { data, isPending } = useAccount();
  const site = data?.activeSite;
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    if (site) {
      setName(site.name);
      setDomain(site.domain);
      setCurrency(site.currency ?? "USD");
    }
  }, [site]);

  const save = useMutation({
    mutationFn: async () => {
      if (!site) throw new Error("لا يوجد موقع نشط");
      const { error } = await supabase.from("sites").update({ name, domain, currency }).eq("id", site.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("تم تحديث الموقع");
      qc.invalidateQueries({ queryKey: ["account"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const switchSite = useMutation({
    mutationFn: async (siteId: string) => {
      if (!data?.user) throw new Error("لا توجد جلسة");
      const { error } = await supabase.from("profiles").update({ active_site_id: siteId }).eq("id", data.user.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("تم تبديل الموقع النشط");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isPending) return <Panel title="الموقع النشط"><LoadingRows rows={3} /></Panel>;

  return (
    <div className="space-y-4">
      <Panel title="الموقع النشط">
        <div className="grid gap-4 sm:max-w-lg">
          <div className="space-y-1.5">
            <Label>اختيار الموقع</Label>
            <Select value={site?.id ?? ""} onValueChange={(v) => switchSite.mutate(v)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر موقعًا" />
              </SelectTrigger>
              <SelectContent>
                {(data?.sites ?? []).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {s.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="site_name">اسم الموقع</Label>
            <Input id="site_name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="site_domain">النطاق</Label>
            <Input id="site_domain" dir="ltr" value={domain} onChange={(e) => setDomain(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>العملة</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["USD", "EUR", "MAD", "SAR", "AED"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-fit" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "جارٍ الحفظ…" : "حفظ التغييرات"}
          </Button>
        </div>
      </Panel>
    </div>
  );
}

type Conn = {
  id: string;
  provider: string;
  status: string | null;
  secret_name: string | null;
  last_sync_at: string | null;
  last_error: string | null;
};

function IntegrationsTab() {
  const qc = useQueryClient();
  const { data, error, isPending, siteId } = useSiteQuery<Conn[]>(["payment-connections"], (sid) =>
    supabase
      .from("payment_connections")
      .select("id, provider, status, secret_name, last_sync_at, last_error")
      .eq("site_id", sid),
  );

  const [provider, setProvider] = useState("stripe");

  const add = useMutation({
    mutationFn: async () => {
      if (!siteId) throw new Error("لا يوجد موقع نشط");
      const { error } = await supabase
        .from("payment_connections")
        .insert({ site_id: siteId, provider, status: "disconnected" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("تمت إضافة البوابة");
      qc.invalidateQueries({ queryKey: ["payment-connections"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payment_connections").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-connections"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Panel
      title="بوابات الدفع"
      action={
        <div className="flex items-center gap-2">
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["stripe", "paypal", "hn-pay", "cmi", "wise"].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" disabled={add.isPending} onClick={() => add.mutate()}>
            إضافة
          </Button>
        </div>
      }
    >
      <DataState isPending={isPending} error={error} data={data} empty="لا توجد بوابات مرتبطة">
        {(list) => (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المزوّد</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>اسم السر</TableHead>
                <TableHead>آخر مزامنة</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium uppercase">{c.provider}</TableCell>
                  <TableCell><StatusChip value={c.status} /></TableCell>
                  <TableCell className="font-mono text-xs">{c.secret_name ?? "—"}</TableCell>
                  <TableCell className="text-xs">{dateTime(c.last_sync_at)}</TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove.mutate(c.id)}>
                      حذف
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataState>
    </Panel>
  );
}

function DatabaseTab() {
  const url = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
  const isLocal = Boolean(url && (url.includes("localhost") || url.includes("127.0.0.1")));

  const rows: [string, string][] = [
    ["عنوان API", url ?? "—"],
    ["البيئة", isLocal ? "محلية (Supabase CLI)" : "سحابية (Lovable Cloud)"],
    ["Postgres محلي", "postgresql://postgres:postgres@127.0.0.1:54322/postgres"],
    ["Supabase Studio محلي", "http://127.0.0.1:54323"],
    ["حساب التجربة", "demo@hn-groupe.com / demo1234"],
  ];

  return (
    <div className="space-y-4">
      <Panel title="اتصال قاعدة البيانات" description="القيم تُقرأ من ملف .env في جذر المشروع.">
        <Table>
          <TableBody>
            {rows.map(([k, v]) => (
              <TableRow key={k}>
                <TableCell className="w-48 text-muted-foreground">{k}</TableCell>
                <TableCell dir="ltr" className="break-all font-mono text-xs">{v}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Panel title="تشغيل محلي بخطوتين">
        <ol className="list-decimal space-y-2 pe-5 text-sm text-muted-foreground">
          <li><code dir="ltr">bash scripts/setup-local.sh</code> — يشغّل Supabase محليًا ويطبّق المخطط والبيانات التجريبية.</li>
          <li><code dir="ltr">bun install &amp;&amp; bun run dev</code> — يشغّل الواجهة على المنفذ 8080.</li>
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          التفاصيل الكاملة موجودة في ملف <code dir="ltr">README-LOCAL.md</code>.
        </p>
      </Panel>
    </div>
  );
}
