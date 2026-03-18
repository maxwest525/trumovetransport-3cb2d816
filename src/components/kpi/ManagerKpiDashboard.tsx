import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, DollarSign, Target, TrendingUp, Phone, UserCheck, Banknote, BarChart3 } from "lucide-react";
import AgentBreakdownTable from "./AgentBreakdownTable";

interface FloorStats {
  agentsOnline: number;
  totalAgents: number;
  salesToday: number;
  salesThisWeek: number;
  depositsToday: number;
  depositsWeek: number;
  leadsToday: number;
  leadsWeek: number;
  closedToday: number;
  closedWeek: number;
  totalClosedDeals: number;
  totalDealsWorked: number;
  callsToday: number;
  avgCostPerLead: number;
  avgCostPerAcquisition: number;
}

function startOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfWeek() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function ManagerKpiDashboard() {
  const [stats, setStats] = useState<FloorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const REFRESH_MS = 30_000;
    let interval: ReturnType<typeof setInterval>;
    async function fetchData() {
      const today = startOfDay();
      const week = startOfWeek();

      const [
        profilesRes,
        onlineRes,
        dealsAllRes,
        dealsTodayRes,
        dealsWeekRes,
        leadsAllRes,
        leadsTodayRes,
        leadsWeekRes,
        callsTodayRes,
        vendorsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_online", true),
        supabase.from("deals").select("id, stage, deal_value, actual_revenue, actual_close_date, updated_at"),
        supabase.from("deals").select("id, stage, deal_value, actual_revenue").gte("created_at", today),
        supabase.from("deals").select("id, stage, deal_value, actual_revenue").gte("created_at", week),
        supabase.from("leads").select("id, vendor_id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", week),
        supabase.from("calls").select("id", { count: "exact", head: true }).gte("started_at", today),
        supabase.from("lead_vendors").select("cost_per_lead, monthly_budget").eq("status", "active"),
      ]);

      const allDeals = (dealsAllRes.data || []) as any[];
      const todayDeals = (dealsTodayRes.data || []) as any[];
      const weekDeals = (dealsWeekRes.data || []) as any[];

      const closedWonToday = todayDeals.filter(d => d.stage === "closed_won");
      const closedWonWeek = weekDeals.filter(d => d.stage === "closed_won");

      const salesToday = closedWonToday.reduce((s: number, d: any) => s + (d.actual_revenue || d.deal_value || 0), 0);
      const salesWeek = closedWonWeek.reduce((s: number, d: any) => s + (d.actual_revenue || d.deal_value || 0), 0);

      // Deposits = deals with stage "booked" (deposit collected to book the move)
      const depositsToday = todayDeals.filter(d => d.stage === "booked").length;
      const depositsWeek = weekDeals.filter(d => d.stage === "booked").length;

      // Closer rate = closed_won / (closed_won + closed_lost) all time
      const totalWon = allDeals.filter(d => d.stage === "closed_won").length;
      const totalLost = allDeals.filter(d => d.stage === "closed_lost").length;
      const totalClosed = totalWon + totalLost;

      // CPL from vendors
      const vendors = (vendorsRes.data || []) as any[];
      const avgCPL = vendors.length > 0
        ? vendors.reduce((s: number, v: any) => s + (v.cost_per_lead || 0), 0) / vendors.length
        : 0;

      // CPA = total vendor spend / closed_won
      const totalSpend = vendors.reduce((s: number, v: any) => s + (v.monthly_budget || 0), 0);
      const avgCPA = totalWon > 0 ? totalSpend / totalWon : 0;

      setStats({
        agentsOnline: onlineRes.count || 0,
        totalAgents: profilesRes.count || 0,
        salesToday,
        salesThisWeek: salesWeek,
        depositsToday,
        depositsWeek,
        leadsToday: leadsTodayRes.count || 0,
        leadsWeek: leadsWeekRes.count || 0,
        closedToday: closedWonToday.length,
        closedWeek: closedWonWeek.length,
        totalClosedDeals: totalClosed,
        totalDealsWorked: totalWon,
        callsToday: callsTodayRes.count || 0,
        avgCostPerLead: avgCPL,
        avgCostPerAcquisition: avgCPA,
      });
      setLoading(false);
    }
    fetchData();
    interval = setInterval(fetchData, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-foreground">Sales Floor</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  const closerRate = stats!.totalClosedDeals > 0
    ? ((stats!.totalDealsWorked / stats!.totalClosedDeals) * 100).toFixed(1)
    : "0.0";

  const kpis = [
    {
      label: "Agents Online",
      value: `${stats!.agentsOnline}`,
      sub: `of ${stats!.totalAgents} total`,
      icon: UserCheck,
      highlight: stats!.agentsOnline > 0,
    },
    {
      label: "Sales Today",
      value: `$${stats!.salesToday.toLocaleString()}`,
      sub: `${stats!.closedToday} closed`,
      icon: DollarSign,
    },
    {
      label: "Sales This Week",
      value: `$${stats!.salesThisWeek.toLocaleString()}`,
      sub: `${stats!.closedWeek} closed`,
      icon: TrendingUp,
    },
    {
      label: "Deposits Collected",
      value: `${stats!.depositsToday}`,
      sub: `${stats!.depositsWeek} this week`,
      icon: Banknote,
    },
    {
      label: "New Leads Today",
      value: `${stats!.leadsToday}`,
      sub: `${stats!.leadsWeek} this week`,
      icon: Users,
    },
    {
      label: "Calls Today",
      value: `${stats!.callsToday}`,
      sub: "Inbound + outbound",
      icon: Phone,
    },
    {
      label: "Closer Rate",
      value: `${closerRate}%`,
      sub: `${stats!.totalDealsWorked} won / ${stats!.totalClosedDeals} closed`,
      icon: Target,
    },
    {
      label: "CPL / CPA",
      value: `$${stats!.avgCostPerLead.toFixed(0)}`,
      sub: `CPA $${stats!.avgCostPerAcquisition.toFixed(0)}`,
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Sales Floor</h1>
        <p className="text-xs text-muted-foreground">Live performance snapshot</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className={`rounded-xl border bg-card p-4 ${
                k.highlight ? "border-primary/40 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{k.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{k.value}</div>
              {k.sub && <span className="text-[10px] text-muted-foreground">{k.sub}</span>}
            </div>
          );
        })}
      </div>

      <AgentBreakdownTable />
    </div>
  );
}
