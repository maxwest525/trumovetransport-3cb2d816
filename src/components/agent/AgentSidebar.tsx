import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, FileText, CalendarCheck,
  Phone, FileSignature, MessageSquare, CheckSquare, Home, RotateCcw,
  ChevronDown, ChevronUp, MoreHorizontal, Gauge
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarAction = "workspace" | "operations" | "coaching" | "messaging";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  action?: SidebarAction;
  badge?: number;
  advanced?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/agent/dashboard" },
  { label: "My KPIs", icon: Gauge, href: "/kpi" },
  { label: "Leads", icon: Users, href: "/agent/pipeline" },
  { label: "Bookings", icon: CalendarCheck, action: "operations" },
  { label: "Messages", icon: MessageSquare, action: "messaging", badge: 5 },
  // Advanced tools
  { label: "Inventory", icon: Package, action: "workspace", advanced: true },
  { label: "Estimates", icon: FileText, action: "workspace", advanced: true },
  { label: "Calls", icon: Phone, action: "workspace", advanced: true },
  { label: "Documents", icon: FileSignature, action: "workspace", advanced: true },
  { label: "Tasks", icon: CheckSquare, action: "coaching", badge: 2, advanced: true },
];

interface AgentSidebarProps {
  onAction?: (action: SidebarAction) => void;
}

export default function AgentSidebar({ onAction }: AgentSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleResetPreference = () => {
    localStorage.removeItem("truemove_remembered_role");
    navigate("/agent-login");
  };

  const essentialItems = NAV_ITEMS.filter(i => !i.advanced);
  const advancedItems = NAV_ITEMS.filter(i => i.advanced);

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const badge = item.badge ? (
      <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-semibold bg-foreground text-background leading-none px-1">
        {item.badge}
      </span>
    ) : null;

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
          {active ? (
            item.badge ? <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-semibold bg-background text-foreground leading-none px-1">{item.badge}</span> : null
          ) : badge}
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
        {badge}
      </button>
    );
  };

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
        {/* Essential items */}
        {essentialItems.map(renderItem)}

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 rounded-lg text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>More Tools</span>
          {showAdvanced ? (
            <ChevronUp className="w-3 h-3 ml-auto" />
          ) : (
            <ChevronDown className="w-3 h-3 ml-auto" />
          )}
        </button>

        {/* Advanced items */}
        {showAdvanced && (
          <div className="space-y-0.5 pl-1 border-l-2 border-border/50 ml-4 animate-in fade-in slide-in-from-top-1 duration-200">
            {advancedItems.map(renderItem)}
          </div>
        )}
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
