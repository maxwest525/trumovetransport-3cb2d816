import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import ManagerShell from "@/components/layout/ManagerShell";

const STATS = [
  { label: "Team Revenue", value: "$156,400", change: "+18%" },
  { label: "Close Rate", value: "24%", change: "+3%" },
  { label: "Bookings SLA", value: "94%", sub: "On-time delivery" },
  { label: "At-Risk Bookings", value: "2", sub: "Need attention" },
];

const REVENUE_TREND = [
  { month: "Sep", revenue: 98000 },
  { month: "Oct", revenue: 112000 },
  { month: "Nov", revenue: 105000 },
  { month: "Dec", revenue: 128000 },
  { month: "Jan", revenue: 142000 },
  { month: "Feb", revenue: 156400 },
];

const BOOKINGS_STATUS = [
  { status: "Completed", count: 18 },
  { status: "In Progress", count: 6 },
  { status: "Scheduled", count: 4 },
  { status: "Cancelled", count: 2 },
];

const BOOKING_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

const APPROVALS = [
  { title: "Estimate override — Agent Alex ($7.50/CF)", sub: "Above standard rate, needs approval" },
  { title: "Booking reschedule — Williams move", sub: "Customer requested new date" },
  { title: "Marketing spend increase — Meta Ads", sub: "$1,200 over weekly cap" },
];

const ALERTS = [
  { title: "Booking BK-1052 delayed — crew reassignment needed", time: "1 hour ago", urgent: true },
  { title: "Agent Jessica has 3 unsigned estimates older than 5 days", time: "2 hours ago", urgent: false },
  { title: "Daily call volume down 20% from last week", time: "3 hours ago", urgent: false },
];

const TEAM = [
  { initials: "AM", name: "Alex Martinez", bookings: "8 bookings closed", revenue: "$48,200", change: "+15%" },
  { initials: "JL", name: "Jessica Lee", bookings: "6 bookings closed", revenue: "$38,500", change: "-8%" },
  { initials: "DC", name: "David Chen", bookings: "5 bookings closed", revenue: "$32,100", change: "+12%" },
];

export default function ManagerDashboard() {
  return (
    <ManagerShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-sm text-muted-foreground">Team performance and approvals overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <div className="mt-2 text-2xl font-bold text-foreground">{s.value}</div>
              {s.change && <span className="text-[11px]" style={{ color: "hsl(142 71% 45%)" }}>{s.change}</span>}
              {s.sub && <span className="text-[11px] text-muted-foreground">{s.sub}</span>}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Team Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={REVENUE_TREND}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Bookings by Status</h2>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={BOOKINGS_STATUS} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4}>
                  {BOOKINGS_STATUS.map((_, idx) => (
                    <Cell key={idx} fill={BOOKING_COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
              {BOOKINGS_STATUS.map((d, i) => (
                <span key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ background: BOOKING_COLORS[i] }} />
                  {d.status}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Approvals + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Approvals Waiting</h2>
              <button className="text-xs text-muted-foreground hover:text-foreground">View all</button>
            </div>
            {APPROVALS.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Active Alerts</h2>
              <button className="text-xs text-muted-foreground hover:text-foreground">View all</button>
            </div>
            {ALERTS.map((a, i) => (
              <div key={i} className={cn("py-3 px-3 rounded-lg mb-1", a.urgent ? "bg-destructive/10 border border-destructive/20" : "")}>
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Performance */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Team Performance</h2>
            <button className="text-xs text-muted-foreground hover:text-foreground">View pipelines</button>
          </div>
          {TEAM.map((t, i) => (
            <div key={i} className="flex items-center gap-3 py-3 px-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground">{t.initials}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.bookings}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{t.revenue}</p>
                <p className="text-[11px]" style={{ color: "hsl(142 71% 45%)" }}>{t.change}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ManagerShell>
  );
}
