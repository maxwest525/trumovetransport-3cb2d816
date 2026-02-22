import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Sun, Moon, Bell, Search, LayoutDashboard, Users, Link2, Package, Globe, Sparkles, LineChart, Zap, ScrollText, RotateCcw, MoreHorizontal, ChevronDown, ChevronUp, Gauge } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "My KPIs", icon: Gauge, href: "/kpi" },
  { label: "Users & Roles", icon: Users, href: "/admin/dashboard", disabled: true },
  { label: "Integrations", icon: Link2, href: "/admin/dashboard", disabled: true },
  // Advanced
  { label: "Products & Pricing", icon: Package, href: "/admin/dashboard", disabled: true, advanced: true },
  { label: "Website Builder", icon: Globe, href: "/admin/dashboard", disabled: true, advanced: true },
  { label: "AI Marketing Suite", icon: Sparkles, href: "/admin/dashboard", disabled: true, advanced: true },
  { label: "Analytics Setup", icon: LineChart, href: "/admin/dashboard", disabled: true, advanced: true },
  { label: "Automations", icon: Zap, href: "/admin/dashboard", disabled: true, advanced: true },
  { label: "Audit Log", icon: ScrollText, href: "/admin/dashboard", disabled: true, advanced: true },
];

const STATS = [
  { label: "Total Users", value: "48", sub: "5 pending invites" },
  { label: "Active Sessions", value: "23" },
  { label: "Integrations", value: "0/4", sub: "Connected" },
  { label: "Automations", value: "3", sub: "Active" },
];

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

const USERS_BY_ROLE = [
  { role: "Admins", count: 3 },
  { role: "Managers", count: 8 },
  { role: "Agents", count: 35 },
  { role: "Demos", count: 2 },
];

export default function AdminDashboard() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleResetPreference = () => {
    localStorage.removeItem("truemove_remembered_role");
    navigate("/agent-login");
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
        <div className="px-4 py-4 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background text-xs font-bold">G</span>
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight">TRUMOVE</span>
          <span className="text-[10px] text-muted-foreground ml-1">Admin</span>
        </div>
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {NAV_ITEMS.filter(i => !i.advanced).map((item) => {
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

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 rounded-lg text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
            <span>More Tools</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
          </button>

          {showAdvanced && (
            <div className="space-y-0.5 pl-1 border-l-2 border-border/50 ml-4 animate-in fade-in slide-in-from-top-1 duration-200">
              {NAV_ITEMS.filter(i => i.advanced).map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground/50 cursor-not-allowed">
                    <Icon className="w-4 h-4" /><span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </nav>
        <div className="px-2 pb-4 space-y-0.5">
          <button onClick={handleResetPreference} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <RotateCcw className="w-4 h-4" /><span>Reset Preference</span>
          </button>
          <Link to="/agent-login" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Home className="w-4 h-4" /><span>Back to Roles</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <span className="text-sm text-muted-foreground">Admin Workspace</span>
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
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">System configuration and settings</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <div className="mt-2 text-2xl font-bold text-foreground">{s.value}</div>
                {s.sub && <span className="text-[11px] text-muted-foreground">{s.sub}</span>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Users by Role</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {USERS_BY_ROLE.map((u) => (
                <div key={u.role} className="rounded-lg border border-border p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{u.count}</div>
                  <div className="text-xs text-muted-foreground mt-1">{u.role}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
