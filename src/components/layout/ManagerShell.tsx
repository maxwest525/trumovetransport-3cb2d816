import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Sun, Moon, Bell, LayoutDashboard,
  Target, AlertTriangle, CheckCircle, BarChart3,
  RotateCcw, Gauge, Globe,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { setPortalContext } from "@/hooks/usePortalContext";


const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/manager/dashboard" },
  { label: "My KPIs", icon: Gauge, href: "/kpi" },
];

const ADVANCED_ITEMS: { label: string; icon: typeof Target; badge?: number; href?: string }[] = [
  { label: "Estimates Oversight", icon: Target },
  { label: "Alerts", icon: AlertTriangle, badge: 3 },
  { label: "Approvals", icon: CheckCircle, badge: 2 },
  { label: "Reports", icon: BarChart3 },
];

interface ManagerShellProps {
  children: ReactNode;
  breadcrumb?: string;
}

export default function ManagerShell({ children, breadcrumb = "" }: ManagerShellProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdvanced] = useState(true);

  useEffect(() => {
    setPortalContext("manager");
    window.scrollTo(0, 0);
  }, []);

  const handleResetPreference = () => {
    localStorage.removeItem("truemove_remembered_role");
    navigate("/agent-login");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
        <div className="px-4 py-4 flex items-center gap-2">
          <img src={logoImg} alt="TruMove" className="h-6" />
          <span className="text-[10px] text-muted-foreground ml-1">Manager</span>
        </div>

        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" /><span>{item.label}</span>
              </Link>
            );
          })}

          

          {ADVANCED_ITEMS.map((item) => {
            const Icon = item.icon;
            if (item.href) {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" /><span>{item.label}</span>
                  {item.badge ? <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-semibold bg-foreground text-background leading-none px-1">{item.badge}</span> : null}
                </Link>
              );
            }
            return (
              <button
                key={item.label}
                onClick={() => toast.info(`${item.label} coming soon`)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Icon className="w-4 h-4" /><span>{item.label}</span>
                {item.badge ? <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-semibold bg-foreground text-background leading-none px-1">{item.badge}</span> : null}
              </button>
            );
          })}
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

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/agent-login" className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
              <Globe className="w-3.5 h-3.5" /><span>Portal</span>
            </Link>
            <span className="text-xs text-muted-foreground">/ Management{breadcrumb}</span>
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
          {children}
        </main>
      </div>
    </div>
  );
}
