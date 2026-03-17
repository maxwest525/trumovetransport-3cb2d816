import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, UserPlus, CalendarCheck, Home, RotateCcw, Users, Phone, Mail, Kanban, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
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
  { label: "Dialer", icon: Phone, href: "/agent/dialer" },
  { label: "Bookings", icon: CalendarCheck, href: "/agent/operations" },
  { label: "Pulse Monitor", icon: Activity, href: "/agent/pulse" },
];

export default function AgentSidebar({ onDialerToggle }: AgentSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleResetPreference = () => {
    localStorage.removeItem("truemove_remembered_role");
    navigate("/");
  };

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
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
    </aside>
  );
}
