import { createFileRoute } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardOverview } from "@/components/dashboard-overview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — HN Groupe" },
      { name: "description", content: "نظرة عامة على مبيعات وعملاء وأداء موقعك." },
      { property: "og:title", content: "لوحة التحكم — HN Groupe" },
      { property: "og:description", content: "نظرة عامة على مبيعات وعملاء وأداء موقعك." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1">
            <DashboardOverview />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
