import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePortalStats() {
  const [stats, setStats] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [profilesRes, leadsRes, dealsRes, vendorsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("deals").select("id", { count: "exact", head: true }),
        supabase.from("lead_vendors").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);

      const result: Record<string, string> = {};
      if (profilesRes.count != null) result.admin = `${profilesRes.count} users`;
      if (leadsRes.count != null) result.agent = `${leadsRes.count} new leads`;
      if (dealsRes.count != null) result.manager = `${dealsRes.count} deals`;
      if (vendorsRes.count != null) result.leads = `${vendorsRes.count} vendors`;

      setStats(result);
      setLoading(false);
    }

    fetchStats();
  }, []);

  return { stats, loading };
}
