import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Home, LogOut, User, Settings, Bell, Sun, Moon, Monitor, Globe } from "lucide-react";
import logoImg from "@/assets/logo.png";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import NotificationsPanel from "./NotificationsPanel";

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
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    }
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-[1600px] px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Back to Website + Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link 
            to="/" 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all shrink-0"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Portal</span>
          </Link>
           <div className="w-px h-4 bg-border shrink-0" />
          <img src={logoImg} alt="TruMove" className="h-5 shrink-0" />
          <div className="w-px h-4 bg-border shrink-0" />
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
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
        </div>

        {/* Agent dropdown + notifications */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications popover */}
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
                <Bell className="w-4 h-4 text-muted-foreground" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] leading-none bg-destructive text-destructive-foreground border-2 border-card">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-auto bg-popover z-[100]" sideOffset={8}>
              <NotificationsPanel
                notifications={notifications}
                unreadCount={unreadCount}
                loading={loading}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDelete={deleteNotification}
                onClose={() => setNotifOpen(false)}
              />
            </PopoverContent>
          </Popover>

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
              <DropdownMenuItem onClick={() => navigate("/agent/profile")}>
                <Settings className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setNotifOpen(true)}>
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto text-[10px] h-5">{unreadCount}</Badge>
                )}
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
