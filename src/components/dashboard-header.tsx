import { Bell, ExternalLink, Search, Settings2, User, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";

const statusLabels: Record<string, string> = {
  active: "نشط",
  maintenance: "صيانة",
  suspended: "موقوف",
  pending_payment: "بانتظار الدفع",
};

export function DashboardHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useAccount();

  const site = data?.activeSite;
  const name = data?.profile?.full_name ?? data?.user?.email ?? "";
  const initials = (name || "HN").slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger />

      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/60 font-bold text-primary-foreground">
          HN
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">{site?.domain ?? "—"}</span>
            {site?.status && (
              <Badge variant="secondary" className="h-5 text-[10px]">
                <span className="me-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {statusLabels[site.status] ?? site.status}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>خطة {site?.plan ?? "—"}</span>
            {site?.plan_expires_at && (
              <>
                <span>•</span>
                <span>تنتهي {new Date(site.plan_expires_at).toLocaleDateString("ar")}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-4 hidden max-w-md flex-1 md:block">
        <div className="relative">
          <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="ابحث عن عميل، طلب، فاتورة…" className="ps-3 pe-9" />
        </div>
      </div>

      <div className="ms-auto flex items-center gap-1">
        {site?.domain && (
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <a href={`https://${site.domain}`} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">فتح الموقع</span>
            </a>
          </Button>
        )}
        <Button variant="ghost" size="icon" aria-label="إعدادات سريعة">
          <Settings2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative" aria-label="إشعارات">
          <Bell className="h-4 w-4" />
          <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                {data?.profile?.avatar_url && <AvatarImage src={data.profile.avatar_url} alt={name} />}
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">{name || "حسابي"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="me-2 h-4 w-4" /> الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings2 className="me-2 h-4 w-4" /> الإعدادات
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onSelect={handleSignOut}>
              <LogOut className="me-2 h-4 w-4" /> تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
