import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneForwarded,
  Play, Pause, Clock, Search, Edit3, Calendar, ExternalLink,
  ChevronDown, Filter, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DialerProvider } from "./dialerProvider";

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
  agent_id: string | null;
}

const OUTCOMES = ["booked", "follow_up", "lost", "no_answer", "callback_scheduled"];

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
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString();
};

const callTypeIcon = (type: string | null, status: string | null) => {
  if (status === "missed") return PhoneMissed;
  if (status === "transferred") return PhoneForwarded;
  if (type === "outbound") return PhoneOutgoing;
  return PhoneIncoming;
};

export default function CallLogView() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDirection, setFilterDirection] = useState<string>("all");
  const [filterOutcome, setFilterOutcome] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editOutcome, setEditOutcome] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCalls = async () => {
      const { data } = await supabase
        .from("calls")
        .select("id, customer_name, customer_phone, call_type, started_at, duration_seconds, outcome, status, notes, agent_id")
        .order("started_at", { ascending: false })
        .limit(200);
      setCalls((data as CallRecord[]) || []);
      setLoading(false);
    };
    fetchCalls();
  }, []);

  const filtered = calls.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !(c.customer_name?.toLowerCase().includes(q)) &&
        !(c.customer_phone?.toLowerCase().includes(q)) &&
        !(c.notes?.toLowerCase().includes(q))
      ) return false;
    }
    if (filterDirection !== "all" && c.call_type !== filterDirection) return false;
    if (filterOutcome !== "all" && c.outcome !== filterOutcome) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    return true;
  });

  const handleSaveEdit = async (callId: string) => {
    await supabase
      .from("calls")
      .update({ outcome: (editOutcome || null) as any, notes: editNotes || null })
      .eq("id", callId);

    setCalls(prev => prev.map(c =>
      c.id === callId ? { ...c, outcome: editOutcome || null, notes: editNotes || null } : c
    ));
    setEditingId(null);
  };

  const handleRedial = (phone: string, name?: string) => {
    DialerProvider.startCall(phone, undefined, name || undefined);
  };

  const hasActiveFilters = filterDirection !== "all" || filterOutcome !== "all" || filterStatus !== "all";

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Call Log</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} calls</p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name, number, notes…"
            className="pl-8 h-9 text-sm bg-background"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          className="gap-1.5 h-9"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {hasActiveFilters && (
            <Badge className="text-[9px] h-4 px-1 ml-0.5 bg-background/20 text-primary-foreground">!</Badge>
          )}
        </Button>
      </div>

      {/* Filter row */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterDirection} onValueChange={setFilterDirection}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Direction" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All Directions</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
              <SelectItem value="outbound">Outbound</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterOutcome} onValueChange={setFilterOutcome}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Outcome" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All Outcomes</SelectItem>
              {OUTCOMES.map(o => (
                <SelectItem key={o} value={o} className="capitalize">{o.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="transferred">Transferred</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1 text-muted-foreground"
              onClick={() => { setFilterDirection("all"); setFilterOutcome("all"); setFilterStatus("all"); }}
            >
              <X className="w-3 h-3" /> Clear
            </Button>
          )}
        </div>
      )}

      {/* Call list */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Phone className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No calls match your filters.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(call => {
            const Icon = callTypeIcon(call.call_type, call.status);
            const isMissed = call.status === "missed";
            const isEditing = editingId === call.id;
            const isPlaying = playingId === call.id;

            return (
              <div key={call.id} className="rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3 p-3">
                  {/* Icon */}
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
                      {call.outcome && (
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {call.outcome.replace("_", " ")}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {call.call_type || "inbound"}
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
                    {call.notes && !isEditing && (
                      <p className="text-[11px] text-muted-foreground mt-1 truncate max-w-md">{call.notes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {call.status === "completed" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                        onClick={() => setPlayingId(isPlaying ? null : call.id)}>
                        {isPlaying ? <Pause className="w-3.5 h-3.5 text-primary" /> : <Play className="w-3.5 h-3.5 text-primary" />}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                      onClick={() => {
                        if (isEditing) { setEditingId(null); }
                        else { setEditingId(call.id); setEditOutcome(call.outcome || ""); setEditNotes(call.notes || ""); }
                      }}>
                      <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    {call.customer_phone && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                        onClick={() => handleRedial(call.customer_phone!, call.customer_name || undefined)}>
                        <Phone className="w-3.5 h-3.5 text-foreground" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Inline edit */}
                {isEditing && (
                  <div className="px-3 pb-3 pt-0 flex items-end gap-2 border-t border-border mt-0 pt-3">
                    <div className="flex-1 space-y-2">
                      <Select value={editOutcome} onValueChange={setEditOutcome}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Disposition" /></SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          {OUTCOMES.map(o => (
                            <SelectItem key={o} value={o} className="capitalize">{o.replace("_", " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Notes…"
                        className="h-8 text-xs"
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" className="h-8 text-xs" onClick={() => handleSaveEdit(call.id)}>Save</Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
