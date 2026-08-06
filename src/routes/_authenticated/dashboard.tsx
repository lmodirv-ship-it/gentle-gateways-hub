import { createFileRoute } from "@tanstack/react-router";
import { DashboardOverview } from "@/components/dashboard-overview";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — HN Groupe" },
      { name: "description", content: "نظرة عامة على مبيعات وعملاء وأداء موقعك." },
      { property: "og:title", content: "لوحة التحكم — HN Groupe" },
      { property: "og:description", content: "نظرة عامة على مبيعات وعملاء وأداء موقعك." },
    ],
  }),
  component: () => <DashboardOverview />,
});
