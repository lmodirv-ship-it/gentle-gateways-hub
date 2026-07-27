import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ActiveSite = {
  id: string;
  name: string;
  domain: string;
  status: string | null;
  plan: string;
  plan_expires_at: string | null;
  currency: string | null;
};

export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, active_site_id")
        .eq("id", user.id)
        .maybeSingle();

      const { data: sites } = await supabase
        .from("sites")
        .select("id, name, domain, status, plan, plan_expires_at, currency")
        .order("created_at", { ascending: true });

      const list = (sites ?? []) as ActiveSite[];
      const activeSite =
        list.find((s) => s.id === profile?.active_site_id) ?? list[0] ?? null;

      return { user, profile, sites: list, activeSite };
    },
    staleTime: 60_000,
  });
}
