import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminShell from "@/components/layout/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { subDays, format, startOfDay, subMonths, endOfMonth, startOfMonth } from "date-fns";
import { ArrowRight, TrendingUp, TrendingDown, Users, CheckCircle2, Activity } from "lucide-react";



const ROLE_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];
const ROLE_LABELS: Record<string, string> = { owner: "Owners", admin: "Admins", manager: "Managers", agent: "Agents" };
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Custom tooltip wrapper
const TooltipCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-border bg-card shadow-lg p-3 min-w-[180px] text-xs">
    {children}
  </div>
);

// Activity bar chart tooltip
const ActivityTooltip = ({ active, payload, label, onNavigate }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload[0]?.value ?? 0;
  const completed = payload[1]?.value ?? 0;
  const pending = total - completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <TooltipCard>
      <p className="font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground"><Activity className="w-3 h-3" /> Total</span>
          <span className="font-medium text-foreground">{total}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle2 className="w-3 h-3" /> Completed</span>
          <span className="font-medium text-foreground">{completed}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-muted-foreground">Pending</span>
          <span className="font-medium text-foreground">{pending}</span>
        </div>
        <div className="border-t border-border pt-1.5 mt-1">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Completion rate</span>
            <span className={`font-semibold ${rate >= 70 ? 'text-green-600 dark:text-green-400' : rate >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>{rate}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted mt-1">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${rate}%` }} />
          </div>
        </div>
      </div>
      <button
        onClick={() => onNavigate?.()}
        className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline w-full"
      >
        View all activities <ArrowRight className="w-3 h-3" />
      </button>
    </TooltipCard>
  );
};

// Role pie chart tooltip
const RoleTooltip = ({ active, payload, totalUsers, onNavigate }: any) => {
  if (!active || !payload?.length) return null;
  const { role, count } = payload[0].payload;
  const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
  return (
    <TooltipCard>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: payload[0].payload.fill }} />
        <span className="font-semibold text-foreground">{role}</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Count</span>
          <span className="font-medium text-foreground">{count}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Share</span>
          <span className="font-medium text-foreground">{pct}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Total users</span>
          <span className="font-medium text-muted-foreground">{totalUsers}</span>
        </div>
      </div>
      <button
        onClick={() => onNavigate?.()}
        className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline w-full"
      >
        Manage users & roles <ArrowRight className="w-3 h-3" />
      </button>
    </TooltipCard>
  );
};

// Growth line chart tooltip
const GrowthTooltip = ({ active, payload, label, growthData }: any) => {
  if (!active || !payload?.length) return null;
  const current = payload[0]?.value ?? 0;
  const idx = growthData?.findIndex((d: any) => d.month === label) ?? -1;
  const prev = idx > 0 ? growthData[idx - 1].users : null;
  const diff = prev != null ? current - prev : null;
  const pctChange = prev != null && prev > 0 ? Math.round((diff! / prev) * 100) : null;
  return (
    <TooltipCard>
      <p className="font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground"><Users className="w-3 h-3" /> Total users</span>
          <span className="font-bold text-foreground">{current}</span>
        </div>
        {diff != null && (
          <>
            <div className="flex justify-between items-center gap-4">
              <span className="text-muted-foreground">New this month</span>
              <span className="font-medium text-foreground">+{diff}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-muted-foreground">Growth</span>
              <span className={`flex items-center gap-0.5 font-semibold ${pctChange! >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                {pctChange! >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {pctChange}%
              </span>
            </div>
          </>
        )}
      </div>
    </TooltipCard>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ label: string; value: string; sub?: string }[]>([
    { label: "Total Users", value: "–" },
    { label: "Active Sessions", value: "–" },
    { label: "Open Tickets", value: "–" },
  ]);
  const [roleData, setRoleData] = useState<{ role: string; count: number; fill: string }[]>([]);
  const [activityData, setActivityData] = useState<{ day: string; total: number; completed: number }[]>([]);
  const [growthData, setGrowthData] = useState<{ month: string; users: number }[]>([]);
  const [totalUserCount, setTotalUserCount] = useState(0);

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
      setTotalUserCount(totalUsers);
      setStats([
        { label: "Total Users", value: String(totalUsers) },
        { label: "Active Sessions", value: String(onlineCount) },
        { label: "Open Tickets", value: String(tickets.length) },
      ]);

      // Roles pie
      const roleCounts: Record<string, number> = {};
      roles.forEach((r) => {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      });
      setRoleData(
        Object.entries(roleCounts).map(([role, count], i) => ({
          role: ROLE_LABELS[role] || role,
          count,
          fill: ROLE_COLORS[i % ROLE_COLORS.length],
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
      const ordered = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      setActivityData(ordered.map((d) => ({ day: d, total: dayMap[d].total, completed: dayMap[d].completed })));

      // Growth
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
                  <Tooltip content={<ActivityTooltip onNavigate={() => navigate("/agent/pipeline")} />} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
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
                      {roleData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} className="cursor-pointer" />
                      ))}
                    </Pie>
                    <Tooltip content={<RoleTooltip totalUsers={totalUserCount} onNavigate={() => navigate("/admin/dashboard")} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-1">
                  {roleData.map((u) => (
                    <div key={u.role} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: u.fill }} />
                      <span className="text-[11px] text-muted-foreground">{u.role} ({u.count})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Growth */}
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
                <Tooltip content={<GrowthTooltip growthData={growthData} />} cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--card))" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
