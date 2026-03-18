import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { usePortalContext } from "@/hooks/usePortalContext";
import AgentShell from "@/components/layout/AgentShell";
import AdminShell from "@/components/layout/AdminShell";
import ManagerShell from "@/components/layout/ManagerShell";

interface AgentRow {
  id: string;
  name: string;
  isOnline: boolean;
  salesToday: number;
  salesWeek: number;
  callsToday: number;
  depositsToday: number;
  closedWon: number;
  closedLost: number;
  closerRate: number;
}

function startOfDay() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString();
}
function startOfWeek() {
  const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); return d.toISOString();
}

function LeaderboardContent() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"salesToday" | "closerRate" | "callsToday" | "depositsToday">("salesToday");

  useEffect(() => {
    async function fetchData() {
      const today = startOfDay();
      const week = startOfWeek();

      const [profilesRes, dealsRes, dealsTodayRes, callsRes] = await Promise.all([
        supabase.from("profiles").select("id, display_name, is_online"),
        supabase.from("deals").select("id, assigned_agent_id, stage, deal_value, actual_revenue"),
        supabase.from("deals").select("id, assigned_agent_id, stage, deal_value, actual_revenue").gte("created_at", today),
        supabase.from("calls").select("id, agent_id").gte("started_at", today),
      ]);

      const profiles = (profilesRes.data || []) as any[];
      const allDeals = (dealsRes.data || []) as any[];
      const todayDeals = (dealsTodayRes.data || []) as any[];
      const todayCalls = (callsRes.data || []) as any[];

      const rows: AgentRow[] = profiles.map((p) => {
        const agentDealsToday = todayDeals.filter((d: any) => d.assigned_agent_id === p.id);
        const agentDealsAll = allDeals.filter((d: any) => d.assigned_agent_id === p.id);

        const wonToday = agentDealsToday.filter((d: any) => d.stage === "closed_won");
        const salesToday = wonToday.reduce((s: number, d: any) => s + (d.actual_revenue || d.deal_value || 0), 0);

        // Week sales from allDeals (we don't have week filter here, but we use all for closer rate)
        const wonAll = agentDealsAll.filter((d: any) => d.stage === "closed_won");
        const lostAll = agentDealsAll.filter((d: any) => d.stage === "closed_lost");
        const totalClosed = wonAll.length + lostAll.length;

        const depositsToday = agentDealsToday.filter((d: any) => d.stage === "booked").length;
        const callsToday = todayCalls.filter((c: any) => c.agent_id === p.id).length;

        return {
          id: p.id,
          name: p.display_name || p.email || "Unknown",
          isOnline: p.is_online || false,
          salesToday,
          salesWeek: wonAll.reduce((s: number, d: any) => s + (d.actual_revenue || d.deal_value || 0), 0),
          callsToday,
          depositsToday,
          closedWon: wonAll.length,
          closedLost: lostAll.length,
          closerRate: totalClosed > 0 ? (wonAll.length / totalClosed) * 100 : 0,
        };
      });

      setAgents(rows);
      setLoading(false);
    }

    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, []);

  const sorted = [...agents].sort((a, b) => (b[sort] as number) - (a[sort] as number));
  const topAgentId = sorted.length > 0 ? sorted[0].id : null;

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-foreground">Leaderboard</h1>
        <div className="rounded-xl border border-border bg-card p-8 animate-pulse h-64" />
      </div>
    );
  }

  const sortOptions: { key: typeof sort; label: string }[] = [
    { key: "salesToday", label: "Sales" },
    { key: "depositsToday", label: "Deposits" },
    { key: "callsToday", label: "Calls" },
    { key: "closerRate", label: "Close Rate" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Leaderboard</h1>
          <p className="text-xs text-muted-foreground">Today's performance across the team</p>
        </div>
        <div className="flex gap-1">
          {sortOptions.map((o) => (
            <button
              key={o.key}
              onClick={() => setSort(o.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                sort === o.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-8">#</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Agent</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Sales Today</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Deposits</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Calls</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Close Rate</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Won / Lost</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((agent, i) => (
              <tr
                key={agent.id}
                className={`border-b border-border/50 last:border-0 transition-colors ${
                  agent.id === topAgentId ? "bg-primary/5" : "hover:bg-muted/20"
                }`}
              >
                <td className="px-4 py-2.5">
                  {i === 0 ? (
                    <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                  ) : (
                    <span className="text-muted-foreground">{i + 1}</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        agent.isOnline ? "bg-green-500" : "bg-muted-foreground/30"
                      }`}
                    />
                    <span className="font-medium text-foreground">{agent.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-foreground">
                  ${agent.salesToday.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right text-foreground">{agent.depositsToday}</td>
                <td className="px-4 py-2.5 text-right text-foreground">{agent.callsToday}</td>
                <td className="px-4 py-2.5 text-right">
                  <span className={agent.closerRate >= 50 ? "text-green-600" : agent.closerRate >= 25 ? "text-foreground" : "text-muted-foreground"}>
                    {agent.closerRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">
                  {agent.closedWon} / {agent.closedLost}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">No agents found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const portalContext = usePortalContext();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const content = <LeaderboardContent />;

  if (portalContext === "admin") {
    return <AdminShell breadcrumb=" / Leaderboard">{content}</AdminShell>;
  }
  if (portalContext === "manager") {
    return <ManagerShell breadcrumb=" / Leaderboard">{content}</ManagerShell>;
  }
  return <AgentShell breadcrumb=" / Leaderboard">{content}</AgentShell>;
}
