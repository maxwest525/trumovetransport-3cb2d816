import { useEffect, useState, useCallback, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Sun, Moon, Bell, Globe, LayoutDashboard, Building2,
  RotateCcw, Menu, X, BarChart3,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { setPortalContext } from "@/hooks/usePortalContext";
import { useIsMobile } from "@/hooks/use-mobile";

import logoImg from "@/assets/logo.png";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/leads/dashboard" },
  { label: "Vendors", icon: Building2, href: "/leads/vendors" },
  { label: "Performance", icon: BarChart3, href: "/leads/performance" },
];

interface LeadVendorShellProps {
  children: ReactNode;
  breadcrumb?: string;
}

export default function LeadVendorShell({ children, breadcrumb = "" }: LeadVendorShellProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setPortalContext("admin");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleResetPreference = () => {
    localStorage.removeItem("truemove_remembered_role");
    navigate("/");
  };

  const sidebarContent = (
    <>
      <div className="px-4 py-4 flex items-center gap-2">
        <img src={logoImg} alt="TruMove" className="h-6" />
        <span className="text-[10px] text-muted-foreground ml-1">Leads</span>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1 rounded-lg hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
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
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-4 space-y-0.5">
        <button
          onClick={handleResetPreference}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Preference</span>
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to Roles</span>
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {!isMobile && (
        <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
          {sidebarContent}
        </aside>
      )}

      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-52 z-50 bg-card border-r border-border flex flex-col">
            {sidebarContent}
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-3 sm:px-4 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <Menu className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <Link
              to="/"
              className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all shrink-0"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Portal</span>
            </Link>
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">/ Lead Vendors{breadcrumb}</span>
          </div>
          <div className="flex items-center gap-3">
            
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground ml-1">MW</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
