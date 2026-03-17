import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Sun, Moon, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import AgentSidebar from "@/components/agent/AgentSidebar";

import { FloatingDialer } from "@/components/agent/FloatingDialer";
import MiniSoftphone from "@/components/dialer/MiniSoftphone";
import { setPortalContext } from "@/hooks/usePortalContext";

interface AgentShellProps {
  children: ReactNode | ((props: { openDialer: (number?: string) => void }) => ReactNode);
  breadcrumb?: string;
}

export default function AgentShell({ children, breadcrumb = "" }: AgentShellProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [dialerOpen, setDialerOpen] = useState(false);
  const [dialerPrefill, setDialerPrefill] = useState<string | undefined>();

  useEffect(() => {
    setPortalContext("agent");
    window.scrollTo(0, 0);
  }, []);

  // No longer auto-open floating dialer on dialer page — softphone is built-in

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AgentSidebar onDialerToggle={() => setDialerOpen(true)} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Agent Workspace{breadcrumb}</span>
          </div>
          <div className="flex items-center gap-2">
            
            <Link to="/agent-login" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Home className="w-4 h-4 text-muted-foreground" />
            </Link>
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
        <main className="flex-1 overflow-y-auto">
          {typeof children === "function" ? children({ openDialer: (num?: string) => { setDialerPrefill(num); setDialerOpen(true); } }) : children}
        </main>
      </div>
      <FloatingDialer open={dialerOpen} onOpenChange={setDialerOpen} prefillNumber={dialerPrefill} />
      <MiniSoftphone />
    </div>
  );
}
