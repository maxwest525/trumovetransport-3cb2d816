import { useEffect, useState } from "react";
import AgentShell from "@/components/layout/AgentShell";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneForwarded,
  Play, Pause, Clock, Calendar, RotateCcw, User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CallRecord {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  call_type: string | null;
  started_at: string | null;
  duration_seconds: number | null;
  outcome: string | null;
  status: string | null;
  notes: string | null;
}

const formatDuration = (s: number | null) => {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const formatTime = (dateStr: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
};

const callTypeIcon = (type: string | null, status: string | null) => {
  if (status === "missed") return PhoneMissed;
  if (status === "transferred") return PhoneForwarded;
  if (type === "outbound") return PhoneOutgoing;
  return PhoneIncoming;
};

export default function AgentDialerPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalls = async () => {
      const { data } = await supabase
        .from("calls")
        .select("id, customer_name, customer_phone, call_type, started_at, duration_seconds, outcome, status, notes")
        .order("started_at", { ascending: false })
        .limit(100);
      setCalls((data as CallRecord[]) || []);
      setLoading(false);
    };
    fetchCalls();
  }, []);

  const allCalls = calls;
  const missedCalls = calls.filter((c) => c.status === "missed");
  const completedCalls = calls.filter((c) => c.status === "completed");

  const togglePlay = (id: string) => {
    setPlayingId((prev) => (prev === id ? null : id));
  };

  const CallRow = ({ call }: { call: CallRecord }) => {
    const Icon = callTypeIcon(call.call_type, call.status);
    const isMissed = call.status === "missed";
    const isPlaying = playingId === call.id;
    const isCompleted = call.status === "completed";

    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors group">
        {/* Call type icon */}
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
          isMissed ? "bg-destructive/10" : "bg-primary/10"
        )}>
          <Icon className={cn("w-4 h-4", isMissed ? "text-destructive" : "text-primary")} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">
              {call.customer_name || "Unknown"}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] capitalize",
                isMissed && "bg-destructive/10 text-destructive",
                call.status === "completed" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              )}
            >
              {call.status || "unknown"}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
            <span>{call.customer_phone || "No number"}</span>
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {formatDuration(call.duration_seconds)}
            </span>
            <span>{formatTime(call.started_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Play recording (only for completed calls) */}
          {isCompleted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => togglePlay(call.id)}
              title={isPlaying ? "Pause recording" : "Play recording"}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Play className="w-3.5 h-3.5 text-primary ml-0.5" />
              )}
            </Button>
          )}

          {/* Redial */}
          {call.customer_phone && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              title={`Call ${call.customer_phone}`}
            >
              <Phone className="w-3.5 h-3.5 text-foreground" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="rounded-xl border border-dashed border-border p-12 text-center">
      <Phone className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  const CallList = ({ items, emptyMsg }: { items: CallRecord[]; emptyMsg: string }) => (
    items.length === 0 ? (
      <EmptyState message={emptyMsg} />
    ) : (
      <div className="space-y-1.5">
        {items.map((call) => (
          <CallRow key={call.id} call={call} />
        ))}
      </div>
    )
  );

  return (
    <AgentShell breadcrumb=" / Dialer">
      {({ openDialer }) => (
        <div className="p-6 max-w-3xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Dialer</h1>
              <p className="text-sm text-muted-foreground">Call history, recordings & redial</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={openDialer} size="sm" className="gap-1.5 text-xs">
                <Phone className="w-3.5 h-3.5" />
                Quick Dial
              </Button>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span>{calls.length} calls</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs">
                <PhoneMissed className="w-3.5 h-3.5" />
                <span>{missedCalls.length} missed</span>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-12">Loading call history...</p>
          ) : (
            <Tabs defaultValue="all" className="flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="gap-1.5 text-xs">
                  <Phone className="h-3.5 w-3.5" />
                  All Calls
                </TabsTrigger>
                <TabsTrigger value="missed" className="gap-1.5 text-xs">
                  <PhoneMissed className="h-3.5 w-3.5" />
                  Missed
                  {missedCalls.length > 0 && (
                    <Badge variant="destructive" className="text-[9px] h-4 px-1 ml-1">
                      {missedCalls.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="recordings" className="gap-1.5 text-xs">
                  <Play className="h-3.5 w-3.5" />
                  Recordings
                </TabsTrigger>
              </TabsList>

              <div className="mt-3">
                <TabsContent value="all" className="mt-0">
                  <CallList items={allCalls} emptyMsg="No calls yet. Your call history will appear here." />
                </TabsContent>
                <TabsContent value="missed" className="mt-0">
                  <CallList items={missedCalls} emptyMsg="No missed calls. You're all caught up!" />
                </TabsContent>
                <TabsContent value="recordings" className="mt-0">
                  <CallList items={completedCalls} emptyMsg="No recordings yet. Completed calls will appear here." />
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      )}
    </AgentShell>
  );
}
