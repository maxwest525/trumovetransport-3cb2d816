import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Sun, Moon, Bell, LayoutDashboard, Users, Link2, Package, Globe, Sparkles, LineChart, Zap, ScrollText, RotateCcw, MoreHorizontal, ChevronDown, ChevronUp, Gauge } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import AdminUsersRoles from "./AdminUsersRoles";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "My KPIs", icon: Gauge, href: "/kpi" },
  { label: "Users & Roles", icon: Users, href: "/admin/users" },
  { label: "Integrations", icon: Link2, href: "/admin/integrations" },
  // Advanced
  { label: "Products & Pricing", icon: Package, href: "/admin/dashboard", advanced: true },
  { label: "Website Builder", icon: Globe, href: "/admin/dashboard", advanced: true },
  { label: "AI Marketing Suite", icon: Sparkles, href: "/admin/dashboard", advanced: true },
  { label: "Analytics Setup", icon: LineChart, href: "/admin/dashboard", advanced: true },
  { label: "Automations", icon: Zap, href: "/admin/dashboard", advanced: true },
  { label: "Audit Log", icon: ScrollText, href: "/admin/dashboard", advanced: true },
];

export default function AdminUsersPage() {
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
            const active = location.pathname === item.href;
            return (
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
                const active = location.pathname === item.href;
                return (
                  <Link key={item.label} to={item.href} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors", active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                    <Icon className="w-4 h-4" /><span>{item.label}</span>
                  </Link>
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
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
              <Globe className="w-3.5 h-3.5" />
              <span>Website</span>
            </Link>
            <div className="w-px h-4 bg-border" />
            <Link to="/agent-login" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Portal</span>
            </Link>
            <span className="text-xs text-muted-foreground">/ Admin / Users</span>
          </div>
          <div className="flex items-center gap-2">
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

        <main className="flex-1 overflow-y-auto p-6 max-w-[1400px] mx-auto w-full">
          <AdminUsersRoles />
        </main>
      </div>
    </div>
  );
}
