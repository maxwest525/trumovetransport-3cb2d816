import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Sun, Moon, Bell, Search, LayoutDashboard, Users, Target, CalendarCheck, Headphones, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/manager/dashboard" },
  { label: "Team Pipeline", icon: Users, href: "/manager/dashboard", disabled: true },
  { label: "Estimates Oversight", icon: Target, href: "/manager/dashboard", disabled: true },
  { label: "Bookings Oversight", icon: CalendarCheck, href: "/manager/dashboard", disabled: true },
  { label: "Call Monitoring", icon: Headphones, href: "/manager/dashboard", disabled: true },
  { label: "Alerts", icon: AlertTriangle, href: "/manager/dashboard", disabled: true },
  { label: "Approvals", icon: CheckCircle, href: "/manager/dashboard", disabled: true },
  { label: "Reports", icon: BarChart3, href: "/manager/dashboard", disabled: true },
];

const STATS = [
  { label: "Team Revenue", value: "$156,400", change: "+18%" },
  { label: "Close Rate", value: "24%", change: "+3%" },
  { label: "Bookings SLA", value: "94%", sub: "On-time delivery" },
  { label: "At-Risk Bookings", value: "2", sub: "Need attention" },
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
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
        <div className="px-4 py-4 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background text-xs font-bold">G</span>
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight">TRUMOVE</span>
          <span className="text-[10px] text-muted-foreground ml-1">Manager</span>
        </div>
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href && !item.disabled;
            return item.disabled ? (
              <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground/50 cursor-not-allowed">
                <Icon className="w-4 h-4" /><span>{item.label}</span>
              </div>
            ) : (
              <Link key={item.label} to={item.href} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors", active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                <Icon className="w-4 h-4" /><span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-2 pb-4">
          <Link to="/agent-login" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Home className="w-4 h-4" /><span>Back to Roles</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <span className="text-sm text-muted-foreground">Management Workspace</span>
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search..." className="w-full h-8 pl-9 pr-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Home className="w-4 h-4 text-muted-foreground" /></Link>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: "hsl(142 71% 45%)" }} />
            </button>
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground ml-1">MW</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 max-w-[1400px] mx-auto w-full space-y-6">
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
        </main>
      </div>
    </div>
  );
}
