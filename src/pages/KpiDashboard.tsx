import { useEffect } from "react";
import AgentSidebar, { type SidebarAction } from "@/components/agent/AgentSidebar";
import { useState } from "react";
import { Home, Sun, Moon, Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import CustomKpiDashboard from "@/components/kpi/CustomKpiDashboard";
import { CombinedWorkspaceModal } from "@/components/agent/CombinedWorkspaceModal";
import { OperationsCenterModal } from "@/components/agent/OperationsCenterModal";
import { CoachingSummaryModal } from "@/components/coaching/CoachingSummaryModal";
import { InternalMessagingModal } from "@/components/messaging/InternalMessagingModal";

export default function KpiDashboard() {
  const { theme, setTheme } = useTheme();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [coachingOpen, setCoachingOpen] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleAction = (action: SidebarAction) => {
    if (action === "workspace") setWorkspaceOpen(true);
    else if (action === "operations") setOperationsOpen(true);
    else if (action === "coaching") setCoachingOpen(true);
    else if (action === "messaging") setMessagingOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AgentSidebar onAction={handleAction} />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <span className="text-sm text-muted-foreground">KPI Dashboard</span>
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
        <main className="flex-1 overflow-y-auto">
          <CustomKpiDashboard />
        </main>
      </div>

      <CombinedWorkspaceModal open={workspaceOpen} onOpenChange={setWorkspaceOpen} />
      <OperationsCenterModal open={operationsOpen} onOpenChange={setOperationsOpen} />
      <CoachingSummaryModal open={coachingOpen} onOpenChange={setCoachingOpen} />
      <InternalMessagingModal open={messagingOpen} onOpenChange={setMessagingOpen} />
    </div>
  );
}
