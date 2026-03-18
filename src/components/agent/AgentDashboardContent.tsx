import { useEffect, useState } from "react";
import { Eye, CheckSquare, FileText, CalendarCheck, ChevronRight, DollarSign, TrendingUp, Users, Clock, Wrench } from "lucide-react";
import AgentToolLauncherModal from "./AgentToolLauncherModal";
import AgentToolWorkspace from "./AgentToolWorkspace";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const PIPELINE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

interface TaskItem {
  id: string;
  subject: string | null;
  description: string | null;
  due_date: string | null;
  type: string;
}

export default function AgentDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    newLeadsToday: 0, tasksDue: 0, tasksOverdue: 0, activeEstimates: 0, bookingsThisWeek: 0,
    totalRevenue: 0, conversionRate: 0, totalCustomers: 0, avgResponseTime: 0,
  });
  const [weeklyLeads, setWeeklyLeads] = useState<{ day: string; leads: number; booked: number }[]>([]);
  const [pipelineData, setPipelineData] = useState<{ stage: string; count: number }[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [launcherOpen, setLauncherOpen] = useState(() => !sessionStorage.getItem("agent_launcher_shown"));
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1).toISOString();

      const [leadsRes, dealsRes, activitiesRes, stagesRes] = await Promise.all([
        supabase.from("leads").select("id, created_at, first_name, last_name, status"),
        supabase.from("deals").select("id, stage, lead_id, created_at, deal_value, actual_revenue, leads(first_name, last_name)"),
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

      // KPI stats
      const totalRevenue = deals.reduce((sum, d) => sum + (d.actual_revenue || d.deal_value || 0), 0);
      const closedWon = deals.filter(d => d.stage === "closed_won").length;
      const conversionRate = leads.length > 0 ? Math.round((closedWon / leads.length) * 100) : 0;
      const totalCustomers = leads.length;

      setStats({
        newLeadsToday, tasksDue, tasksOverdue, activeEstimates, bookingsThisWeek,
        totalRevenue, conversionRate, totalCustomers, avgResponseTime: 0,
      });

      // Weekly leads
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weekly: Record<string, { leads: number; booked: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        weekly[dayNames[d.getDay()]] = { leads: 0, booked: 0 };
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

      // Pending tasks
      const pending = activities
        .filter(a => !a.is_done)
        .sort((a, b) => (a.due_date || a.created_at).localeCompare(b.due_date || b.created_at))
        .slice(0, 8);
      setTasks(pending);

      setLoading(false);
    };
    fetchData();
  }, []);

  const toggleTask = async (taskId: string) => {
    await supabase.from("activities").update({ is_done: true, completed_at: new Date().toISOString() }).eq("id", taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setStats(prev => ({ ...prev, tasksDue: prev.tasksDue - 1 }));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <p className="text-sm text-muted-foreground text-center py-12">Loading dashboard...</p>
      </div>
    );
  }

  const KPI_STATS = [
    { label: "New Leads Today", value: String(stats.newLeadsToday), icon: Eye },
    { label: "Tasks Due", value: String(stats.tasksDue), sub: stats.tasksOverdue > 0 ? `${stats.tasksOverdue} overdue` : undefined, icon: CheckSquare },
    { label: "Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign },
    { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp },
    { label: "Total Customers", value: String(stats.totalCustomers), icon: Users },
    { label: "Bookings This Week", value: String(stats.bookingsThisWeek), icon: CalendarCheck },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <AgentToolLauncherModal open={launcherOpen} onOpenChange={setLauncherOpen} onLaunchWorkspace={() => setWorkspaceOpen(true)} />
      <AgentToolWorkspace open={workspaceOpen} onClose={() => setWorkspaceOpen(false)} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here's what needs your attention today.</p>
        </div>
        <button
          onClick={() => setLauncherOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
        >
          <Wrench className="h-3.5 w-3.5" />
          My Tools
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPI_STATS.map((s) => {
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

      {/* Charts + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Leads Chart */}
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

        {/* Pipeline Breakdown */}
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

      {/* Tasks */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">My Tasks</h2>
          <span className="text-xs text-muted-foreground">{tasks.length} pending</span>
        </div>
        <div className="space-y-0">
          {tasks.length > 0 ? tasks.map((t) => {
            const isOverdue = t.due_date && new Date(t.due_date) < new Date();
            return (
              <div key={t.id} className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors group">
                <button
                  onClick={() => toggleTask(t.id)}
                  className="w-4 h-4 rounded border border-border shrink-0 hover:border-primary hover:bg-primary/10 transition-colors"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.subject || "Untitled task"}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.description || t.type?.replace("_", " ") || ""}</p>
                </div>
                {t.due_date && (
                  <span className={`text-[11px] shrink-0 flex items-center gap-1 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                    <Clock className="w-3 h-3" />
                    {new Date(t.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            );
          }) : (
            <p className="text-xs text-muted-foreground text-center py-6">No pending tasks 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
}
