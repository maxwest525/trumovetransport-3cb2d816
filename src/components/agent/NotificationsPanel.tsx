import { useNavigate } from "react-router-dom";
import { Notification } from "@/hooks/useNotifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Kanban,
  Ticket,
  Bell,
  Info,
  X,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const typeConfig: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  deal_update: { icon: Kanban, color: "text-blue-500", label: "Deal" },
  ticket_assignment: { icon: Ticket, color: "text-amber-500", label: "Ticket" },
  system: { icon: Info, color: "text-primary", label: "System" },
  info: { icon: Bell, color: "text-muted-foreground", label: "Info" },
};

interface NotificationsPanelProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}

export default function NotificationsPanel({
  notifications,
  unreadCount,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose,
}: NotificationsPanelProps) {
  const navigate = useNavigate();

  const handleClick = (n: Notification) => {
    if (!n.is_read) onMarkAsRead(n.id);
    if (n.link) {
      navigate(n.link);
      onClose?.();
    }
  };

  return (
    <div className="w-80 sm:w-96">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-foreground" />
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={onMarkAllAsRead}>
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      <ScrollArea className="max-h-[400px]">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig.info;
              const Icon = cfg.icon;

              return (
                <div
                  key={n.id}
                  className={`group flex gap-3 px-4 py-3 border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !n.is_read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleClick(n)}
                >
                  <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${!n.is_read ? "font-semibold text-foreground" : "text-foreground/80"}`}>
                        {n.title}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </span>
                      {n.link && <ExternalLink className="w-3 h-3 text-muted-foreground/50" />}
                      {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
