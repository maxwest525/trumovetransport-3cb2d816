import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, UserPlus, CalendarCheck, Users, Phone, Mail, Kanban, Activity, Trophy, ExternalLink, Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  beta?: boolean;
}

interface AgentSidebarProps {
  onDialerToggle?: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/agent/dashboard" },
  { label: "New Lead", icon: UserPlus, href: "/agent/new-customer" },
  { label: "My Customers", icon: Users, href: "/agent/customers" },
  { label: "Pipeline", icon: Kanban, href: "/agent/pipeline" },
  { label: "Customer Chat", icon: Mail, href: "/agent/messages" },
  { label: "Dialer", icon: Phone, href: "/agent/dialer", beta: true },
  { label: "Bookings", icon: CalendarCheck, href: "/agent/operations" },
  { label: "Pulse Monitor", icon: Activity, href: "/agent/pulse" },
  { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
];

export default function AgentSidebar({ onDialerToggle }: AgentSidebarProps) {
  const location = useLocation();

  return (
    <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
      <div className="px-4 py-4 flex items-center gap-2">
        <img src={logoImg} alt="TruMove" className="h-6" />
        <span className="text-[10px] text-muted-foreground ml-1">CRM</span>
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
                item.beta && "opacity-40 pointer-events-none",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              tabIndex={item.beta ? -1 : undefined}
              aria-disabled={item.beta}
              onClick={item.beta ? (e) => e.preventDefault() : undefined}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.beta && (
                <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Beta</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-4 space-y-0.5">
        <a
          href="https://granot.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Monitor className="w-4 h-4" />
          <span>Granot CRM</span>
          <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
        </a>
        <a
          href="https://convoso.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span>Convoso Dialer</span>
          <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
        </a>
      </div>
    </aside>
  );
}
