import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone, Clock, CalendarClock, AlertCircle, ChevronRight,
  RotateCcw, User, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DialerProvider } from "./dialerProvider";

interface ScheduledCallback {
  id: string;
  contactName: string;
  contactPhone: string;
  scheduledAt: string;
  notes: string;
  attempts: number;
  lastOutcome: string;
  priority: "high" | "medium" | "low";
}

const now = new Date();
const h = (offset: number) => new Date(now.getTime() + offset * 3600000).toISOString();
const m = (offset: number) => new Date(now.getTime() + offset * 60000).toISOString();

const MOCK_CALLBACKS: ScheduledCallback[] = [
  { id: "cb1", contactName: "Jessica Martinez", contactPhone: "+1 (555) 234-5678", scheduledAt: m(-30), notes: "Interested in 2BR estimate", attempts: 1, lastOutcome: "Follow Up", priority: "high" },
  { id: "cb2", contactName: "Robert Chen", contactPhone: "+1 (555) 345-6789", scheduledAt: m(-5), notes: "Call back after 2pm", attempts: 2, lastOutcome: "No Answer", priority: "high" },
  { id: "cb3", contactName: "Amara Johnson", contactPhone: "+1 (555) 678-9012", scheduledAt: m(15), notes: "Wants final quote", attempts: 1, lastOutcome: "Callback Scheduled", priority: "medium" },
  { id: "cb4", contactName: "David Park", contactPhone: "+1 (555) 789-0123", scheduledAt: h(1), notes: "Discuss insurance options", attempts: 0, lastOutcome: "New Lead", priority: "medium" },
  { id: "cb5", contactName: "Sarah Thompson", contactPhone: "+1 (555) 890-1234", scheduledAt: h(3), notes: "Follow up on estimate sent", attempts: 3, lastOutcome: "Not Interested", priority: "low" },
  { id: "cb6", contactName: "Maria Santos", contactPhone: "+1 (555) 456-7890", scheduledAt: h(5), notes: "Rescheduled from yesterday", attempts: 2, lastOutcome: "Voicemail", priority: "medium" },
  { id: "cb7", contactName: "Li Wei", contactPhone: "+1 (555) 901-2345", scheduledAt: new Date(now.getTime() + 86400000).toISOString(), notes: "Morning call preferred", attempts: 0, lastOutcome: "New Lead", priority: "low" },
];

const fmtCallbackTime = (iso: string) => {
  const d = new Date(iso);
  const diff = d.getTime() - now.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < -60) return `${Math.abs(Math.floor(mins / 60))}h overdue`;
  if (mins < 0) return `${Math.abs(mins)}m overdue`;
  if (mins === 0) return "Due now";
  if (mins < 60) return `In ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `In ${hrs}h`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const isDueOrOverdue = (iso: string) => new Date(iso).getTime() <= now.getTime();
const isUpcoming = (iso: string) => {
  const d = new Date(iso);
  const diff = d.getTime() - now.getTime();
  return diff > 0 && diff <= 3600000; // within 1 hour
};

export default function ScheduledCallbacks() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "due" | "upcoming" | "later">("all");

  const callbacks = MOCK_CALLBACKS.filter(cb => !completedIds.has(cb.id));
  const dueCount = callbacks.filter(cb => isDueOrOverdue(cb.scheduledAt)).length;

  const filtered = callbacks.filter(cb => {
    if (filter === "due") return isDueOrOverdue(cb.scheduledAt);
    if (filter === "upcoming") return isUpcoming(cb.scheduledAt);
    if (filter === "later") return !isDueOrOverdue(cb.scheduledAt) && !isUpcoming(cb.scheduledAt);
    return true;
  });

  // Sort: overdue first, then by time
  const sorted = [...filtered].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const handleCall = (cb: ScheduledCallback) => {
    DialerProvider.startCall(cb.contactPhone, cb.id, cb.contactName);
  };

  const handleComplete = (id: string) => {
    setCompletedIds(prev => new Set(prev).add(id));
  };

  const priorityColor: Record<string, string> = {
    high: "text-destructive bg-destructive/10",
    medium: "text-orange-600 bg-orange-500/10",
    low: "text-muted-foreground bg-muted",
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" /> Scheduled Callbacks
          </h2>
          <p className="text-xs text-muted-foreground">
            {callbacks.length} pending · {dueCount} due now
          </p>
        </div>
        {dueCount > 0 && (
          <Badge variant="destructive" className="gap-1 animate-pulse">
            <AlertCircle className="w-3 h-3" /> {dueCount} overdue
          </Badge>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2">
        {(["all", "due", "upcoming", "later"] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className="text-xs h-8 capitalize"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "due" ? `Due Now (${dueCount})` : f === "upcoming" ? "Next Hour" : "Later"}
          </Button>
        ))}
      </div>

      {/* Callbacks list */}
      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-500/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {filter === "due" ? "No overdue callbacks. You're on track!" : "No callbacks scheduled."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(cb => {
            const due = isDueOrOverdue(cb.scheduledAt);
            const upcoming = isUpcoming(cb.scheduledAt);

            return (
              <div
                key={cb.id}
                className={cn(
                  "rounded-xl border bg-card transition-all",
                  due ? "border-destructive/30 bg-destructive/[0.02]" : upcoming ? "border-orange-400/30" : "border-border hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3 p-3">
                  {/* Time indicator */}
                  <div className={cn(
                    "w-16 text-center shrink-0 rounded-lg py-1.5 px-2",
                    due ? "bg-destructive/10" : upcoming ? "bg-orange-500/10" : "bg-muted"
                  )}>
                    <p className={cn(
                      "text-xs font-semibold",
                      due ? "text-destructive" : upcoming ? "text-orange-600" : "text-muted-foreground"
                    )}>
                      {fmtCallbackTime(cb.scheduledAt)}
                    </p>
                  </div>

                  {/* Contact info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{cb.contactName}</span>
                      <Badge className={cn("text-[10px] capitalize", priorityColor[cb.priority])}>
                        {cb.priority}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{cb.contactPhone}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{cb.notes}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span>{cb.attempts} attempts</span>
                      <span>Last: {cb.lastOutcome}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      className={cn("gap-1.5 h-8 text-xs", due && "bg-destructive hover:bg-destructive/90 text-destructive-foreground")}
                      onClick={() => handleCall(cb)}
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Now
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 flex-1" title="Reschedule">
                        <RotateCcw className="w-3 h-3" /> Reschedule
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={() => handleComplete(cb.id)} title="Mark done">
                        <CheckCircle2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
