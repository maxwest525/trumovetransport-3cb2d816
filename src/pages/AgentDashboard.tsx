import { useEffect } from "react";
import AgentSidebar from "@/components/agent/AgentSidebar";
import AgentDashboardContent from "@/components/agent/AgentDashboardContent";
import { Home, Sun, Moon, Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";

export default function AgentDashboard() {
  const { theme, setTheme } = useTheme();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AgentSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Agent Workspace</span>
          </div>
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-8 pl-9 pr-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Home className="w-4 h-4 text-muted-foreground" />
            </Link>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground ml-1">
              MW
            </div>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <AgentDashboardContent />
        </main>
      </div>
    </div>
  );
}
