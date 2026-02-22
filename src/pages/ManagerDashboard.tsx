import { useEffect, useState } from "react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import ManagerShell from "@/components/layout/ManagerShell";
import { supabase } from "@/integrations/supabase/client";

const BOOKING_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

const STAGE_LABELS: Record<string, string> = {
  booked: "Booked",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  delivered: "Delivered",
  closed_won: "Completed",
  closed_lost: "Cancelled",
};

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, closeRate: 0, totalClosed: 0, atRisk: 0 });
  const [revenueTrend, setRevenueTrend] = useState<{ month: string; revenue: number }[]>([]);
  const [bookingsStatus, setBookingsStatus] = useState<{ status: string; count: number }[]>([]);
  const [team, setTeam] = useState<{ initials: string; name: string; bookings: string; revenue: string }[]>([]);
  const [pendingActivities, setPendingActivities] = useState<{ title: string; sub: string }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [dealsRes, profilesRes, activitiesRes] = await Promise.all([
        supabase.from("deals").select("id, stage, deal_value, actual_revenue, assigned_agent_id, created_at, updated_at, actual_close_date, leads(first_name, last_name)"),
        supabase.from("profiles").select("id, display_name, email"),
        supabase.from("activities").select("id, subject, description, type, is_done, due_date"),
      ]);

      const deals = (dealsRes.data as any[]) || [];
      const profiles = (profilesRes.data as any[]) || [];
      const activities = (activitiesRes.data as any[]) || [];

      // Stats
      const closedWon = deals.filter(d => d.stage === "closed_won");
      const closedLost = deals.filter(d => d.stage === "closed_lost");
      const totalClosed = closedWon.length + closedLost.length;
      const closeRate = totalClosed > 0 ? Math.round((closedWon.length / totalClosed) * 100) : 0;
      const totalRevenue = closedWon.reduce((s, d) => s + (d.actual_revenue || d.deal_value || 0), 0);
      const atRisk = deals.filter(d => d.stage === "follow_up").length;

      setStats({ revenue: totalRevenue, closeRate, totalClosed, atRisk });

      // Revenue trend (last 6 months)
      const monthlyRev: Record<string, number> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyRev[key] = 0;
      }
      closedWon.forEach(d => {
        const dt = new Date(d.actual_close_date || d.updated_at);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
        if (key in monthlyRev) monthlyRev[key] += d.actual_revenue || d.deal_value || 0;
      });
      setRevenueTrend(Object.entries(monthlyRev).map(([m, revenue]) => ({
        month: new Date(m + "-01").toLocaleDateString("en-US", { month: "short" }),
        revenue,
      })));

      // Bookings by status (operational stages)
      const opStages = ["booked", "dispatched", "in_transit", "delivered", "closed_won", "closed_lost"];
      const bStatus = opStages
        .map(s => ({ status: STAGE_LABELS[s] || s, count: deals.filter(d => d.stage === s).length }))
        .filter(d => d.count > 0);
      setBookingsStatus(bStatus);

      // Team performance
      const agentMap: Record<string, { name: string; bookings: number; revenue: number }> = {};
      deals.forEach(d => {
        if (!d.assigned_agent_id) return;
        if (!agentMap[d.assigned_agent_id]) {
          const p = profiles.find(p => p.id === d.assigned_agent_id);
          agentMap[d.assigned_agent_id] = { name: p?.display_name || p?.email || "Agent", bookings: 0, revenue: 0 };
        }
        if (d.stage === "closed_won") {
          agentMap[d.assigned_agent_id].bookings++;
          agentMap[d.assigned_agent_id].revenue += d.actual_revenue || d.deal_value || 0;
        }
      });
      const teamData = Object.values(agentMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(t => ({
          initials: t.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
          name: t.name,
          bookings: `${t.bookings} bookings closed`,
          revenue: `$${t.revenue.toLocaleString()}`,
        }));
      setTeam(teamData);

      // Pending activities as approvals/alerts
      const pending = activities
        .filter(a => !a.is_done)
        .sort((a, b) => (a.due_date || "z").localeCompare(b.due_date || "z"))
        .slice(0, 3)
        .map(a => ({ title: a.subject || "Pending task", sub: a.description || a.type?.replace("_", " ") || "" }));
      setPendingActivities(pending);

      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <ManagerShell>
        <p className="text-sm text-muted-foreground text-center py-12">Loading dashboard...</p>
      </ManagerShell>
    );
  }

  return (
    <ManagerShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-sm text-muted-foreground">Team performance and approvals overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Team Revenue", value: `$${stats.revenue.toLocaleString()}` },
            { label: "Close Rate", value: `${stats.closeRate}%`, sub: `${stats.totalClosed} total closed` },
            { label: "Active Deals", value: String(stats.totalClosed), sub: "All-time closed" },
            { label: "At-Risk Deals", value: String(stats.atRisk), sub: "In follow-up stage" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <div className="mt-2 text-2xl font-bold text-foreground">{s.value}</div>
              {s.sub && <span className="text-[11px] text-muted-foreground">{s.sub}</span>}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Team Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Deals by Status</h2>
            {bookingsStatus.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={bookingsStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4}>
                      {bookingsStatus.map((_, idx) => (
                        <Cell key={idx} fill={BOOKING_COLORS[idx % BOOKING_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
                  {bookingsStatus.map((d, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ background: BOOKING_COLORS[i % BOOKING_COLORS.length] }} />
                      {d.status}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-12">No deals yet</p>
            )}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Pending Tasks</h2>
            {pendingActivities.length > 0 ? pendingActivities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.sub}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground text-center py-6">No pending tasks</p>
            )}
          </div>
        </div>

        {/* Team Performance */}
        {team.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Team Performance</h2>
            {team.map((t, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground">{t.initials}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.bookings}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{t.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ManagerShell>
  );
}
