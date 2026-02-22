import { useEffect, useState } from "react";
import { Eye, CheckSquare, FileText, CalendarCheck, ChevronRight } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const PIPELINE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export default function AgentDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ newLeadsToday: 0, tasksDue: 0, tasksOverdue: 0, activeEstimates: 0, bookingsThisWeek: 0 });
  const [weeklyLeads, setWeeklyLeads] = useState<{ day: string; leads: number; booked: number }[]>([]);
  const [pipelineData, setPipelineData] = useState<{ stage: string; count: number }[]>([]);
  const [nextActions, setNextActions] = useState<{ title: string; sub: string; icon: React.ElementType }[]>([]);
  const [clientActivity, setClientActivity] = useState<{ name: string; action: string; time: string }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1).toISOString();

      const [leadsRes, dealsRes, activitiesRes, stagesRes] = await Promise.all([
        supabase.from("leads").select("id, created_at, first_name, last_name, status"),
        supabase.from("deals").select("id, stage, lead_id, created_at, deal_value, leads(first_name, last_name)"),
        supabase.from("activities").select("id, subject, description, type, due_date, is_done, created_at"),
        supabase.from("pipeline_stages").select("*").order("display_order"),
      ]);

      const leads = (leadsRes.data as any[]) || [];
      const deals = (dealsRes.data as any[]) || [];
      const activities = (activitiesRes.data as any[]) || [];
      const stages = (stagesRes.data as any[]) || [];

      // Stats
      const newLeadsToday = leads.filter(l => l.created_at >= todayStart).length;
      const tasksDue = activities.filter(a => !a.is_done && a.due_date).length;
      const tasksOverdue = activities.filter(a => !a.is_done && a.due_date && new Date(a.due_date) < now).length;
      const activeEstimates = deals.filter(d => d.stage === "estimate_sent").length;
      const bookingsThisWeek = deals.filter(d => d.stage === "booked" && d.created_at >= weekStart).length;

      setStats({ newLeadsToday, tasksDue, tasksOverdue, activeEstimates, bookingsThisWeek });

      // Weekly leads (last 7 days)
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weekly: Record<string, { leads: number; booked: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = dayNames[d.getDay()];
        weekly[key] = { leads: 0, booked: 0 };
      }
      leads.forEach(l => {
        const d = new Date(l.created_at);
        const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 7) {
          const key = dayNames[d.getDay()];
          if (weekly[key]) weekly[key].leads++;
        }
      });
      deals.forEach(d => {
        const dt = new Date(d.created_at);
        const diff = Math.floor((now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 7 && d.stage === "booked") {
          const key = dayNames[dt.getDay()];
          if (weekly[key]) weekly[key].booked++;
        }
      });
      setWeeklyLeads(Object.entries(weekly).map(([day, v]) => ({ day, ...v })));

      // Pipeline breakdown
      const activeStages = stages.filter(s => !["closed_won", "closed_lost"].includes(s.stage_key));
      const pipeline = activeStages.map(s => ({
        stage: s.name,
        count: deals.filter(d => d.stage === s.stage_key).length,
      })).filter(d => d.count > 0);
      setPipelineData(pipeline);

      // Next actions: pending activities
      const pending = activities
        .filter(a => !a.is_done)
        .sort((a, b) => (a.due_date || a.created_at).localeCompare(b.due_date || b.created_at))
        .slice(0, 5)
        .map(a => ({
          title: a.subject || "Untitled task",
          sub: a.description || a.type?.replace("_", " ") || "",
          icon: a.type === "meeting" ? CalendarCheck : a.type === "call" ? Eye : FileText,
        }));
      setNextActions(pending);

      // Client activity: recent completed activities
      const recent = activities
        .filter(a => a.is_done)
        .sort((a, b) => (b.completed_at || b.created_at).localeCompare(a.completed_at || a.created_at))
        .slice(0, 4)
        .map(a => {
          const mins = Math.floor((now.getTime() - new Date(a.created_at).getTime()) / 60000);
          const time = mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.floor(mins / 60)} hours ago` : `${Math.floor(mins / 1440)}d ago`;
          return { name: a.subject || "Activity", action: a.type?.replace("_", " ") || "", time };
        });
      setClientActivity(recent);

      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <p className="text-sm text-muted-foreground text-center py-12">Loading dashboard...</p>
      </div>
    );
  }

  const STATS = [
    { label: "New Leads Today", value: String(stats.newLeadsToday), icon: Eye },
    { label: "Tasks Due", value: String(stats.tasksDue), sub: stats.tasksOverdue > 0 ? `${stats.tasksOverdue} overdue` : undefined, icon: CheckSquare },
    { label: "Active Estimates", value: String(stats.activeEstimates), icon: FileText },
    { label: "Bookings This Week", value: String(stats.bookingsThisWeek), icon: CalendarCheck },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here's what needs your attention today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <Icon className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground">{s.value}</div>
              {s.sub && <span className="text-[11px] text-muted-foreground">{s.sub}</span>}
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Weekly Leads</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyLeads}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Leads" />
              <Bar dataKey="booked" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Booked" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Pipeline Breakdown</h2>
          {pipelineData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pipelineData} dataKey="count" nameKey="stage" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4}>
                    {pipelineData.map((_, idx) => (
                      <Cell key={idx} fill={PIPELINE_COLORS[idx % PIPELINE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
                {pipelineData.map((d, i) => (
                  <span key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: PIPELINE_COLORS[i % PIPELINE_COLORS.length] }} />
                    {d.stage}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-12">No active deals</p>
          )}
        </div>
      </div>

      {/* Two-column: Next Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Next Actions</h2>
          </div>
          <div className="space-y-0">
            {nextActions.length > 0 ? nextActions.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group">
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                </div>
              );
            }) : (
              <p className="text-xs text-muted-foreground text-center py-6">No pending actions</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h2>
          <div className="space-y-0">
            {clientActivity.length > 0 ? clientActivity.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.action}</p>
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">{c.time}</span>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground text-center py-6">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
