import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Home, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { toast } from "@/hooks/use-toast";

interface Crumb {
  label: string;
  href?: string;
}

interface AgentTopBarProps {
  crumbs: Crumb[];
  onLogout?: () => void;
}

export default function AgentTopBar({ crumbs, onLogout }: AgentTopBarProps) {
  const navigate = useNavigate();
  const { displayName, isLoggedIn } = useAgentProfile();

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    }
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/agent-login");
  };

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-[1600px] px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight className="w-3 h-3 shrink-0" />
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-foreground transition-colors truncate">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium truncate">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Agent info + Logout */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">{displayName}</span>
          </div>
          {isLoggedIn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
