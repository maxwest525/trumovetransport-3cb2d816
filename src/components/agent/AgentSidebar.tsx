import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, FileText, CalendarCheck,
  Phone, FileSignature, MessageSquare, BarChart3, Home
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/agent/dashboard" },
  { label: "Leads", icon: Users, href: "/agent/pipeline" },
  { label: "Inventory", icon: Package, href: "/agent/dashboard", disabled: true },
  { label: "Estimates", icon: FileText, href: "/agent/dashboard", disabled: true },
  { label: "Bookings", icon: CalendarCheck, href: "/agent/dashboard", disabled: true },
  { label: "Calls", icon: Phone, href: "/agent/dashboard", disabled: true },
  { label: "Documents", icon: FileSignature, href: "/agent/dashboard", disabled: true },
  { label: "Tasks", icon: LayoutDashboard, href: "/agent/dashboard", disabled: true },
  { label: "Messages", icon: MessageSquare, href: "/agent/dashboard", disabled: true },
];

export default function AgentSidebar() {
  const location = useLocation();

  return (
    <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-4 py-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
          <span className="text-background text-xs font-bold">G</span>
        </div>
        <span className="text-sm font-bold text-foreground tracking-tight">TRUMOVE</span>
        <span className="text-[10px] text-muted-foreground ml-1">Agent</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.href && !item.disabled;
          return item.disabled ? (
            <div
              key={item.label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground/50 cursor-not-allowed"
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
          ) : (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
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
