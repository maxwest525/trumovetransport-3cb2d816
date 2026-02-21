import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Home, LogOut, User, Settings, Bell, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";

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
  const { displayName, email, isLoggedIn } = useAgentProfile();
  const { theme, setTheme } = useTheme();

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

        {/* Agent dropdown + notifications */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications bell */}
          <Button
            variant="ghost"
            size="sm"
            className="relative h-8 w-8 p-0"
            onClick={() => toast({ title: "No new notifications" })}
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] leading-none bg-destructive text-destructive-foreground border-2 border-card">
              3
            </Badge>
          </Button>

          {/* Agent dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-sm h-8">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="font-medium text-foreground max-w-[120px] truncate">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover z-[100]">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">{displayName}</p>
                  {email && <p className="text-xs text-muted-foreground truncate">{email}</p>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast({ title: "Profile settings coming soon" })}>
                <Settings className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "Notifications panel coming soon" })}>
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                <Badge variant="secondary" className="ml-auto text-[10px] h-5">3</Badge>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {theme === "dark" ? (
                    <Moon className="w-4 h-4 mr-2" />
                  ) : theme === "light" ? (
                    <Sun className="w-4 h-4 mr-2" />
                  ) : (
                    <Monitor className="w-4 h-4 mr-2" />
                  )}
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-popover z-[110]">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                    {theme === "light" && <span className="ml-auto text-xs text-primary">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                    {theme === "dark" && <span className="ml-auto text-xs text-primary">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="w-4 h-4 mr-2" />
                    System
                    {theme === "system" && <span className="ml-auto text-xs text-primary">✓</span>}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              {isLoggedIn && (
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
