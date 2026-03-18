import { useState } from "react";
import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { cn } from "@/lib/utils";
import {
  Zap, Plus, ArrowRight, Clock, Moon, Sun, Phone,
  MessageSquare, Ban, Bell, CheckCircle2, MoreHorizontal,
  Activity, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "active" | "paused" | "draft";
  type: "routing" | "recovery" | "queue" | "alert";
}

const WORKFLOWS: Workflow[] = [
  { id: "1", name: "Form Lead → Convoso", trigger: "Form submitted", action: "Push to Convoso via webhook", status: "active", type: "routing" },
  { id: "2", name: "After-Hours → Queue + Text", trigger: "Lead outside 8a-8p", action: "Queue + auto-text", status: "active", type: "queue" },
  { id: "3", name: "Unreached → SMS Recovery", trigger: "3 failed call attempts", action: "SMS sequence", status: "active", type: "recovery" },
  { id: "4", name: "Missed Call → Callback", trigger: "Paid call unanswered", action: "Priority callback + text", status: "active", type: "routing" },
  { id: "5", name: "Duplicate → Suppress", trigger: "Matching phone/email", action: "Suppress from queue", status: "active", type: "alert" },
  { id: "6", name: "Unworked 2 Min → Alert", trigger: "Lead idle > 2 min", action: "Alert team lead", status: "active", type: "alert" },
];

const WEBHOOK_LOG = [
  { time: "2:34 PM", event: "form_submit", source: "Google Ads", dest: "Convoso", status: "ok", ms: 142 },
  { time: "2:33 PM", event: "form_submit", source: "Meta Ads", dest: "Convoso", status: "ok", ms: 198 },
  { time: "2:31 PM", event: "call_missed", source: "Convoso", dest: "Callback Queue", status: "ok", ms: 87 },
  { time: "2:28 PM", event: "duplicate", source: "System", dest: "Suppressed", status: "dup", ms: 23 },
  { time: "2:25 PM", event: "sms_recovery", source: "System", dest: "SMS", status: "sent", ms: 312 },
];

const TYPE_COLORS: Record<string, string> = {
  routing: "bg-blue-500/10 text-blue-600",
  recovery: "bg-amber-500/10 text-amber-600",
  queue: "bg-violet-500/10 text-violet-600",
  alert: "bg-red-500/10 text-red-600",
};

export default function GrowthRouting() {
  const [showLog, setShowLog] = useState(true);

  return (
    <GrowthEngineShell>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Routing & Automation</h1>
          <button
            onClick={() => toast.info("Workflow builder coming soon")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:opacity-90"
          >
            <Plus className="w-3 h-3" /> New Workflow
          </button>
        </div>

        {/* Lead flow visual */}
        <div className="bg-card rounded-lg border border-border px-3 py-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: "Ad Click", sub: "Google / Meta" },
              { label: "Page / Form", sub: "LP or Instant Form" },
              { label: "Attribution", sub: "UTM captured" },
              { label: "Webhook", sub: "Instant route" },
              { label: "Convoso", sub: "Agent dials", highlight: true },
              { label: "CRM Sync", sub: "GHL / Granot" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center gap-1.5">
                <div className={cn("px-2 py-1 rounded text-center", step.highlight ? "bg-emerald-500/10 ring-1 ring-emerald-500/20" : "bg-muted/50")}>
                  <span className={cn("text-[10px] font-semibold block", step.highlight ? "text-emerald-600" : "text-foreground")}>{step.label}</span>
                  <span className="text-[8px] text-muted-foreground">{step.sub}</span>
                </div>
                {i < arr.length - 1 && <ArrowRight className="w-2.5 h-2.5 text-muted-foreground shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Workflows table */}
        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <h2 className="text-[12px] font-bold text-foreground">Workflows</h2>
            <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded ml-auto">
              {WORKFLOWS.filter(w => w.status === "active").length} active
            </span>
          </div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Workflow", "Type", "Trigger", "Action", "Status", ""].map((h, i) => (
                  <th key={i} className={cn("py-1.5 px-2 text-[10px] text-muted-foreground font-semibold text-left")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WORKFLOWS.map(w => (
                <tr key={w.id} className="border-b border-border/30 hover:bg-muted/10">
                  <td className="py-2 px-2 font-medium text-foreground">{w.name}</td>
                  <td className="py-2 px-2">
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded capitalize", TYPE_COLORS[w.type])}>{w.type}</span>
                  </td>
                  <td className="py-2 px-2 text-muted-foreground text-[10px]">{w.trigger}</td>
                  <td className="py-2 px-2 text-muted-foreground text-[10px]">{w.action}</td>
                  <td className="py-2 px-2">
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                      w.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                    )}>{w.status}</span>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <button onClick={() => toast.info(`Edit ${w.name}`)} className="p-1 rounded hover:bg-muted">
                      <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Webhook log */}
        <div className="bg-card rounded-lg border border-border">
          <button
            onClick={() => setShowLog(!showLog)}
            className="w-full flex items-center justify-between px-3 py-2 border-b border-border hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <h2 className="text-[12px] font-bold text-foreground">Recent Events</h2>
            </div>
            {showLog ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
          </button>
          {showLog && (
            <div className="divide-y divide-border/30">
              {WEBHOOK_LOG.map((log, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono w-14">{log.time}</span>
                    <span className="font-medium text-foreground">{log.event}</span>
                    <span className="text-muted-foreground">{log.source} → {log.dest}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{log.ms}ms</span>
                    <span className={cn("font-bold px-1.5 py-0.5 rounded",
                      log.status === "ok" ? "bg-emerald-500/10 text-emerald-600" :
                      log.status === "sent" ? "bg-blue-500/10 text-blue-600" :
                      "bg-muted text-muted-foreground"
                    )}>{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hours config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-card rounded-lg border border-border p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-[12px] font-bold text-foreground">Business Hours</h3>
              <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded ml-auto">8 AM - 8 PM</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Leads route instantly to Convoso. Agent dials within seconds.</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Moon className="w-3.5 h-3.5 text-blue-500" />
              <h3 className="text-[12px] font-bold text-foreground">After Hours</h3>
              <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded ml-auto">8 PM - 8 AM</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Leads queued for morning. Auto-text sent immediately.</p>
          </div>
        </div>
      </div>
    </GrowthEngineShell>
  );
}
