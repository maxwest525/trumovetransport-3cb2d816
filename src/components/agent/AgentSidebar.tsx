import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, FileText, CalendarCheck,
  Phone, FileSignature, MessageSquare, CheckSquare, Home
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarAction = "workspace" | "operations" | "coaching" | "messaging";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  action?: SidebarAction;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/agent/dashboard" },
  { label: "Leads", icon: Users, href: "/agent/pipeline" },
  { label: "Inventory", icon: Package, action: "workspace" },
  { label: "Estimates", icon: FileText, action: "workspace" },
  { label: "Bookings", icon: CalendarCheck, action: "operations" },
  { label: "Calls", icon: Phone, action: "workspace" },
  { label: "Documents", icon: FileSignature, action: "workspace" },
  { label: "Tasks", icon: CheckSquare, action: "coaching" },
  { label: "Messages", icon: MessageSquare, action: "messaging" },
];

interface AgentSidebarProps {
  onAction?: (action: SidebarAction) => void;
}

export default function AgentSidebar({ onAction }: AgentSidebarProps) {
  const location = useLocation();

  return (
    <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
      <div className="px-4 py-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
          <span className="text-background text-xs font-bold">G</span>
        </div>
        <span className="text-sm font-bold text-foreground tracking-tight">TRUMOVE</span>
        <span className="text-[10px] text-muted-foreground ml-1">Agent</span>
      </div>

      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (item.href) {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => item.action && onAction?.(item.action)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-2 pb-4">
        <Link
          to="/agent-login"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to Roles</span>
        </Link>
      </div>
    </aside>
  );
}
