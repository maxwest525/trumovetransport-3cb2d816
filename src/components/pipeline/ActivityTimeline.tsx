import { Activity } from "./types";
import { Phone, Mail, StickyNote, CalendarCheck, Users, MessageSquare, ArrowRightLeft } from "lucide-react";
import { format, parseISO } from "date-fns";

const ICON_MAP: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  note: StickyNote,
  follow_up: CalendarCheck,
  meeting: Users,
  text: MessageSquare,
  stage_change: ArrowRightLeft,
};

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (!activities.length) {
    return <p className="text-sm text-muted-foreground py-4 text-center">No activity yet</p>;
  }

  return (
    <div className="space-y-3">
      {activities.map((a) => {
        const Icon = ICON_MAP[a.type] || StickyNote;
        return (
          <div key={a.id} className="flex gap-3 items-start">
            <div className="mt-0.5 rounded-full bg-muted p-1.5">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{a.subject || a.type}</p>
              {a.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.description}</p>
              )}
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                {format(parseISO(a.created_at), "MMM d, h:mm a")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
