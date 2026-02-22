import { useState, useEffect } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { subDays, format, startOfDay, subMonths, endOfMonth, startOfMonth } from "date-fns";

const QUICK_SETUP = [
  { title: "Add new user", sub: "Invite team members" },
  { title: "Connect DashClicks", sub: "Set up API integration" },
  { title: "Configure analytics", sub: "Connect tracking pixels" },
];

const INTEGRATIONS = [
  { name: "DashClicks", status: "disconnected" },
  { name: "Google Analytics", status: "disconnected" },
  { name: "Meta Pixel", status: "disconnected" },
  { name: "Stripe", status: "disconnected" },
];

const ROLE_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];
const ROLE_LABELS: Record<string, string> = { owner: "Owners", admin: "Admins", manager: "Managers", agent: "Agents" };
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Total Users", value: "–" },
    { label: "Active Sessions", value: "–" },
    { label: "Integrations", value: "0/4", sub: "Connected" },
    { label: "Open Tickets", value: "–" },
  ]);
  const [roleData, setRoleData] = useState<{ role: string; count: number }[]>([]);
  const [activityData, setActivityData] = useState<{ day: string; total: number; completed: number }[]>([]);
  const [growthData, setGrowthData] = useState<{ month: string; users: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      const sevenDaysAgo = subDays(startOfDay(new Date()), 6).toISOString();

      const [profilesRes, rolesRes, activitiesRes, ticketsRes] = await Promise.all([
        supabase.from("profiles").select("id, created_at, is_online"),
        supabase.from("user_roles").select("role"),
        supabase.from("activities").select("created_at, is_done").gte("created_at", sevenDaysAgo),
        supabase.from("support_tickets").select("id").eq("status", "open"),
      ]);

      const profiles = profilesRes.data ?? [];
      const roles = rolesRes.data ?? [];
      const activities = activitiesRes.data ?? [];
      const tickets = ticketsRes.data ?? [];

      // Stats
      const totalUsers = profiles.length;
      const onlineCount = profiles.filter((p) => p.is_online).length;
      setStats([
        { label: "Total Users", value: String(totalUsers) },
        { label: "Active Sessions", value: String(onlineCount) },
        { label: "Integrations", value: "0/4", sub: "Connected" },
        { label: "Open Tickets", value: String(tickets.length) },
      ]);

      // Roles pie
      const roleCounts: Record<string, number> = {};
      roles.forEach((r) => {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      });
      setRoleData(
        Object.entries(roleCounts).map(([role, count]) => ({
          role: ROLE_LABELS[role] || role,
          count,
        }))
      );

      // Weekly activity
      const dayMap: Record<string, { total: number; completed: number }> = {};
      DAY_NAMES.forEach((d) => (dayMap[d] = { total: 0, completed: 0 }));
      activities.forEach((a) => {
        const dayName = DAY_NAMES[new Date(a.created_at).getDay()];
        dayMap[dayName].total++;
        if (a.is_done) dayMap[dayName].completed++;
      });
      // Order starting from Mon
      const ordered = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      setActivityData(ordered.map((d) => ({ day: d, total: dayMap[d].total, completed: dayMap[d].completed })));

      // Growth (cumulative by month, last 6 months)
      const now = new Date();
      const months: { month: string; users: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const m = subMonths(now, i);
        const end = endOfMonth(m);
        const count = profiles.filter((p) => p.created_at && new Date(p.created_at) <= end).length;
        months.push({ month: format(startOfMonth(m), "MMM"), users: count });
      }
      setGrowthData(months);

      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">System configuration and settings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <div className="mt-2 text-2xl font-bold text-foreground">{s.value}</div>
              )}
              {s.sub && <span className="text-[11px] text-muted-foreground">{s.sub}</span>}
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Activity bar chart */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">Weekly Activity</h2>
            {loading ? (
              <Skeleton className="h-[180px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={activityData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={30} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Total" />
                  <Bar dataKey="completed" fill="hsl(var(--muted-foreground) / 0.3)" radius={[3, 3, 0, 0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Users by role pie */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-2">Users by Role</h2>
            {loading ? (
              <Skeleton className="h-[140px] w-full" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={roleData} dataKey="count" nameKey="role" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3}>
                      {roleData.map((_, i) => (
                        <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-1">
                  {roleData.map((u, i) => (
                    <div key={u.role} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: ROLE_COLORS[i % ROLE_COLORS.length] }} />
                      <span className="text-[11px] text-muted-foreground">{u.role} ({u.count})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Growth + Quick Setup + Integrations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Growth line chart */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">User Growth</h2>
            {loading ? (
              <Skeleton className="h-[140px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={30} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick Setup */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Quick Setup</h2>
            {QUICK_SETUP.map((q, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{q.title}</p>
                  <p className="text-xs text-muted-foreground">{q.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Integrations */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Integrations</h2>
            {INTEGRATIONS.map((int, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <span className="text-sm text-foreground">{int.name}</span>
                </div>
                <span className="text-[11px] text-muted-foreground border border-border rounded px-2 py-0.5">{int.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
