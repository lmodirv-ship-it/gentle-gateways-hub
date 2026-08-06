import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Globe,
  Users,
  ShoppingCart,
  CreditCard,
  Repeat,
  FileText,
  BarChart3,
  Bell,
  Settings,
  LifeBuoy,
  Package,
  Ticket,
  Wallet,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const main = [
  { title: "لوحة التحكم", url: "/dashboard", icon: LayoutDashboard },
  { title: "المواقع", url: "/sites", icon: Globe },
  { title: "التحليلات", url: "/analytics", icon: BarChart3 },
];

const commerce = [
  { title: "الطلبات", url: "/orders", icon: ShoppingCart },
  { title: "المنتجات", url: "/products", icon: Package },
  { title: "العملاء", url: "/customers", icon: Users },
  { title: "الاشتراكات", url: "/subscriptions", icon: Repeat },
];

const finance = [
  { title: "المدفوعات", url: "/payments", icon: CreditCard },
  { title: "الفواتير", url: "/invoices", icon: FileText },
  { title: "الكوبونات", url: "/coupons", icon: Ticket },
  { title: "المحفظة", url: "/wallet", icon: Wallet },
];

const system = [
  { title: "HN AI", url: "/hn-ai", icon: Sparkles },
  { title: "الإشعارات", url: "/notifications", icon: Bell },
  { title: "الدعم", url: "/support", icon: LifeBuoy },
  { title: "الإعدادات", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  const renderGroup = (label: string, items: typeof main) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = currentPath === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link to={item.url} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            HN
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">HN Groupe</span>
              <span className="text-xs text-muted-foreground">لوحة التحكم</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("عام", main)}
        {renderGroup("التجارة", commerce)}
        {renderGroup("المالية", finance)}
        {renderGroup("النظام", system)}
      </SidebarContent>
    </Sidebar>
  );
}
