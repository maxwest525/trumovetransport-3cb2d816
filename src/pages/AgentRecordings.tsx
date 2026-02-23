import { useEffect, useState } from "react";
import AgentShell from "@/components/layout/AgentShell";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Play, Clock, Calendar } from "lucide-react";

interface CallRecord {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  started_at: string | null;
  duration_seconds: number | null;
  outcome: string | null;
  notes: string | null;
}

export default function AgentRecordings() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      const { data } = await supabase
        .from("calls")
        .select("id, customer_name, customer_phone, started_at, duration_seconds, outcome, notes")
        .eq("status", "completed")
        .order("started_at", { ascending: false })
        .limit(50);
      setCalls((data as CallRecord[]) || []);
      setLoading(false);
    };
    fetchCalls();
  }, []);

  const formatDuration = (s: number | null) => {
    if (!s) return "—";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <AgentShell breadcrumb=" / Recordings">
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Call Recordings</h1>
          <p className="text-sm text-muted-foreground">Listen to your completed calls.</p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading recordings...</p>
        ) : calls.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Mic className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recordings yet. Completed calls will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {calls.map((call) => (
              <div key={call.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors">
                <button className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors">
                  <Play className="w-4 h-4 text-primary ml-0.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {call.customer_name || "Unknown Caller"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {call.customer_phone || "No phone"}
                    {call.outcome && <span className="ml-2 capitalize">· {call.outcome.replace("_", " ")}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(call.duration_seconds)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {call.started_at ? new Date(call.started_at).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AgentShell>
  );
}
