import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AgentPerf {
  id: string;
  name: string;
  isOnline: boolean;
  salesToday: number;
  callsToday: number;
  depositsToday: number;
  closedWon: number;
  closedTotal: number;
  closerRate: number;
}

function startOfDay() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString();
}

export default function AgentBreakdownTable() {
  const [agents, setAgents] = useState<AgentPerf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const today = startOfDay();

      const [profilesRes, dealsTodayRes, dealsAllRes, callsRes] = await Promise.all([
        supabase.from("profiles").select("id, display_name, is_online"),
        supabase.from("deals").select("id, assigned_agent_id, stage, deal_value, actual_revenue").gte("created_at", today),
        supabase.from("deals").select("id, assigned_agent_id, stage"),
        supabase.from("calls").select("id, agent_id").gte("started_at", today),
      ]);

      const profiles = (profilesRes.data || []) as any[];
      const todayDeals = (dealsTodayRes.data || []) as any[];
      const allDeals = (dealsAllRes.data || []) as any[];
      const todayCalls = (callsRes.data || []) as any[];

      const rows: AgentPerf[] = profiles.map((p) => {
        const myToday = todayDeals.filter((d: any) => d.assigned_agent_id === p.id);
        const myAll = allDeals.filter((d: any) => d.assigned_agent_id === p.id);

        const wonToday = myToday.filter((d: any) => d.stage === "closed_won");
        const salesToday = wonToday.reduce((s: number, d: any) => s + (d.actual_revenue || d.deal_value || 0), 0);
        const depositsToday = myToday.filter((d: any) => d.stage === "booked").length;

        const wonAll = myAll.filter((d: any) => d.stage === "closed_won").length;
        const lostAll = myAll.filter((d: any) => d.stage === "closed_lost").length;
        const totalClosed = wonAll + lostAll;

        return {
          id: p.id,
          name: p.display_name || "Unknown",
          isOnline: p.is_online || false,
          salesToday,
          callsToday: todayCalls.filter((c: any) => c.agent_id === p.id).length,
          depositsToday,
          closedWon: wonAll,
          closedTotal: totalClosed,
          closerRate: totalClosed > 0 ? (wonAll / totalClosed) * 100 : 0,
        };
      });

      setAgents(rows.sort((a, b) => b.salesToday - a.salesToday));
      setLoading(false);
    }

    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="rounded-xl border border-border bg-card p-6 animate-pulse h-40" />;
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Agent Breakdown — Today</h2>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-2 font-medium text-muted-foreground">Agent</th>
            <th className="text-right px-4 py-2 font-medium text-muted-foreground">Sales</th>
            <th className="text-right px-4 py-2 font-medium text-muted-foreground">Deposits</th>
            <th className="text-right px-4 py-2 font-medium text-muted-foreground">Calls</th>
            <th className="text-right px-4 py-2 font-medium text-muted-foreground">Close Rate</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((a) => (
            <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.isOnline ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                  <span className="font-medium text-foreground">{a.name}</span>
                </div>
              </td>
              <td className="px-4 py-2 text-right font-semibold text-foreground">${a.salesToday.toLocaleString()}</td>
              <td className="px-4 py-2 text-right text-foreground">{a.depositsToday}</td>
              <td className="px-4 py-2 text-right text-foreground">{a.callsToday}</td>
              <td className="px-4 py-2 text-right">
                <span className={a.closerRate >= 50 ? "text-green-600" : a.closerRate >= 25 ? "text-foreground" : "text-muted-foreground"}>
                  {a.closerRate.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
          {agents.length === 0 && (
            <tr><td colSpan={5} className="text-center py-6 text-muted-foreground">No agents found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
