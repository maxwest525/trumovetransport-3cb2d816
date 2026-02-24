import { useState, useEffect } from "react";
import ManagerShell from "@/components/layout/ManagerShell";
import { supabase } from "@/integrations/supabase/client";
import {
  Phone, PhoneIncoming, PhoneOff, Clock, Users, Headphones, MessageSquare, Volume2,
  TrendingUp, BarChart3, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

/* ── Types ── */
interface AgentLiveStatus {
  id: string;
  name: string;
  initials: string;
  status: "ready" | "on_call" | "wrap_up" | "not_ready";
  currentCallDuration?: number;
  customerName?: string;
}

interface TodayStats {
  totalDials: number;
  connects: number;
  totalTalkTime: number;
  avgHandleTime: number;
  dispositions: { label: string; count: number }[];
}

/* ── Mock agent statuses ── */
const MOCK_AGENTS: AgentLiveStatus[] = [
  { id: "a1", name: "Sarah Johnson", initials: "SJ", status: "on_call", currentCallDuration: 187, customerName: "Mike Reynolds" },
  { id: "a2", name: "David Park", initials: "DP", status: "ready" },
  { id: "a3", name: "Maria Garcia", initials: "MG", status: "wrap_up" },
  { id: "a4", name: "James Wilson", initials: "JW", status: "on_call", currentCallDuration: 42, customerName: "Lisa Chen" },
  { id: "a5", name: "Emily Davis", initials: "ED", status: "not_ready" },
  { id: "a6", name: "Robert Kim", initials: "RK", status: "ready" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; dotClass: string }> = {
  ready: { label: "Ready", color: "text-emerald-500", dotClass: "bg-emerald-500" },
  on_call: { label: "On Call", color: "text-amber-500", dotClass: "bg-amber-500 animate-pulse" },
  wrap_up: { label: "Wrap-Up", color: "text-blue-500", dotClass: "bg-blue-500" },
  not_ready: { label: "Not Ready", color: "text-muted-foreground", dotClass: "bg-muted-foreground" },
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatMinutes(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ManagerDialerMonitor() {
  const [agents, setAgents] = useState<AgentLiveStatus[]>(MOCK_AGENTS);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalDials: 0,
    connects: 0,
    totalTalkTime: 0,
    avgHandleTime: 0,
    dispositions: [],
  });
  const [loading, setLoading] = useState(true);

  // Tick call durations every second
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) =>
          a.status === "on_call" && a.currentCallDuration != null
            ? { ...a, currentCallDuration: a.currentCallDuration + 1 }
            : a
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch today's call stats from DB
  useEffect(() => {
    const fetchStats = async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: calls } = await supabase
        .from("calls")
        .select("id, outcome, duration_seconds, status, call_type")
        .gte("created_at", todayStart.toISOString());

      const allCalls = calls || [];
      const totalDials = allCalls.length;
      const connects = allCalls.filter((c) => c.status === "completed" || c.status === "active").length;
      const totalTalkTime = allCalls.reduce((s, c) => s + (c.duration_seconds || 0), 0);
      const avgHandleTime = connects > 0 ? Math.round(totalTalkTime / connects) : 0;

      // Disposition breakdown
      const dispMap: Record<string, number> = {};
      allCalls.forEach((c) => {
        const key = c.outcome || "No Disposition";
        dispMap[key] = (dispMap[key] || 0) + 1;
      });
      const dispositions = Object.entries(dispMap).map(([label, count]) => ({
        label: label.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        count,
      }));

      setTodayStats({ totalDials, connects, totalTalkTime, avgHandleTime, dispositions });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const onCall = agents.filter((a) => a.status === "on_call").length;
  const ready = agents.filter((a) => a.status === "ready").length;
  const wrapUp = agents.filter((a) => a.status === "wrap_up").length;

  const handleMonitor = (action: "listen" | "whisper" | "barge", agent: AgentLiveStatus) => {
    toast.info(`${action.charAt(0).toUpperCase() + action.slice(1)} mode activated for ${agent.name}`, {
      description: "This is a placeholder — telephony integration required.",
    });
  };

  return (
    <ManagerShell breadcrumb=" / Dialer Monitor">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Dialer Monitor</h1>
          <p className="text-sm text-muted-foreground">Live agent statuses, today's call metrics, and call monitoring controls.</p>
        </div>

        {/* ── Quick Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Total Dials", value: todayStats.totalDials, icon: Phone, sub: "Today" },
            { label: "Connects", value: todayStats.connects, icon: PhoneIncoming, sub: `${todayStats.totalDials > 0 ? Math.round((todayStats.connects / todayStats.totalDials) * 100) : 0}% rate` },
            { label: "Talk Time", value: formatMinutes(todayStats.totalTalkTime), icon: Clock, sub: "Total today" },
            { label: "Avg Handle", value: formatMinutes(todayStats.avgHandleTime), icon: TrendingUp, sub: "Per connected call" },
            { label: "Agents Online", value: `${onCall + ready + wrapUp}/${agents.length}`, icon: Users, sub: `${onCall} on call` },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{loading ? "—" : s.value}</div>
                <span className="text-[11px] text-muted-foreground">{s.sub}</span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── Live Agent Status ── */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" /> Live Agent Status
              </h2>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Ready ({ready})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> On Call ({onCall})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Wrap-Up ({wrapUp})</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {agents.map((agent) => {
                const cfg = STATUS_CONFIG[agent.status];
                return (
                  <div key={agent.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground">
                        {agent.initials}
                      </div>
                      <span className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card", cfg.dotClass)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{agent.name}</p>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-medium", cfg.color)}>{cfg.label}</span>
                        {agent.status === "on_call" && agent.customerName && (
                          <span className="text-xs text-muted-foreground">• {agent.customerName}</span>
                        )}
                      </div>
                    </div>
                    {agent.status === "on_call" && agent.currentCallDuration != null && (
                      <span className="text-xs font-mono text-amber-500 tabular-nums">
                        {formatDuration(agent.currentCallDuration)}
                      </span>
                    )}
                    {/* Monitor controls — only active for on_call agents */}
                    {agent.status === "on_call" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMonitor("listen", agent)}
                          title="Listen"
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Headphones className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMonitor("whisper", agent)}
                          title="Whisper"
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMonitor("barge", agent)}
                          title="Barge"
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Dispositions Breakdown ── */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" /> Dispositions Today
            </h2>
            {!loading && todayStats.dispositions.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={todayStats.dispositions} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : !loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <PhoneOff className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">No calls logged today</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-12">Loading…</p>
            )}
          </div>
        </div>
      </div>
    </ManagerShell>
  );
}
