import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Zap, Phone, MessageSquare, Clock, AlertTriangle,
  CheckCircle2, XCircle, HelpCircle, Lightbulb, Shield, Ban,
  PhoneCall, Bell, Timer, Sun, Moon, Activity
} from "lucide-react";

const WORKFLOWS = [
  {
    name: "New Form Lead → Attribution → Convoso Route",
    trigger: "Form submitted on any landing page",
    steps: ["Capture UTM + lead data", "Attribution tagged", "Deduplicate check", "Push to Convoso via webhook", "Agent dials within seconds"],
    status: "active",
    icon: Zap,
    priority: "primary",
  },
  {
    name: "After-Hours Lead → Queue + Auto-Text",
    trigger: "Lead arrives outside business hours",
    steps: ["Lead queued for next calling block", "Auto-text sent: 'We received your request, calling you first thing'", "Lead tagged as after-hours", "Priority queue for morning"],
    status: "active",
    icon: Moon,
    priority: "primary",
  },
  {
    name: "Unreached Lead → SMS Recovery",
    trigger: "3 call attempts with no answer",
    steps: ["SMS sent: 'We tried reaching you about your move'", "Wait 30 min", "Second SMS with quote page link", "Escalate to manager if no response in 24h"],
    status: "active",
    icon: MessageSquare,
    priority: "primary",
  },
  {
    name: "Missed Inbound Paid Call → Callback Queue",
    trigger: "Paid call from Google/Meta rings unanswered",
    steps: ["Instant alert to available agent", "Add to priority callback queue", "Auto-text: 'Sorry we missed your call, calling back now'", "Retry within 2 minutes"],
    status: "active",
    icon: PhoneCall,
    priority: "primary",
  },
  {
    name: "Duplicate Detected → Suppress and Tag",
    trigger: "Matching phone or email found in system",
    steps: ["Flag as duplicate", "Suppress from Convoso queue", "Tag with original lead source", "Log for reporting"],
    status: "active",
    icon: Ban,
    priority: "secondary",
  },
  {
    name: "Lead Not Worked in 2 Min → Alert",
    trigger: "Lead sits in queue past 2-minute threshold",
    steps: ["Alert sent to team lead", "Escalation counter starts", "If 5 min: alert to manager", "If 10 min: auto-reassign"],
    status: "active",
    icon: Bell,
    priority: "primary",
  },
];

const WEBHOOK_LOG = [
  { time: "2:34:12 PM", event: "form_submit", source: "Google Ads", dest: "Convoso", status: "success", ms: 142 },
  { time: "2:33:45 PM", event: "form_submit", source: "Meta Ads", dest: "Convoso", status: "success", ms: 198 },
  { time: "2:31:02 PM", event: "call_missed", source: "CallRail", dest: "Callback Queue", status: "success", ms: 87 },
  { time: "2:28:19 PM", event: "form_submit", source: "Google Ads", dest: "Convoso", status: "success", ms: 156 },
  { time: "2:25:44 PM", event: "duplicate_check", source: "System", dest: "Suppressed", status: "duplicate", ms: 23 },
  { time: "2:22:11 PM", event: "sms_recovery", source: "System", dest: "Twilio", status: "sent", ms: 312 },
  { time: "2:19:33 PM", event: "after_hours", source: "Meta Ads", dest: "Morning Queue", status: "queued", ms: 45 },
];

export default function GrowthAutomation() {
  return (
    <GrowthEngineShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Automation Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Speed-to-lead routing, recovery flows, and operational automation
          </p>
        </div>

        {/* What is automation */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">What does automation do here?</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Routes every lead to Convoso for instant dialing within seconds</li>
                  <li>• Handles after-hours leads, missed calls, and unreached contacts automatically</li>
                  <li>• Sends SMS recovery when calls fail, queues callbacks, and alerts your team</li>
                  <li>• Suppresses duplicates and escalates unworked leads before they go cold</li>
                </ul>
                <Badge variant="outline" className="text-[10px]">
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Goal: every lead gets contacted in under 60 seconds during business hours
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Flow Visual */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Your Lead Flow</h3>
            <div className="flex items-center gap-1.5 flex-wrap py-2">
              {[
                { label: "Traffic Source", sub: "Google / Meta" },
                { label: "Landing Page", sub: "Form / Call" },
                { label: "Attribution Capture", sub: "UTM + source" },
                { label: "Webhook / Router", sub: "Instant route" },
                { label: "Convoso", sub: "Agent dials" },
                { label: "CRM Sync", sub: "Record + track" },
                { label: "Backup Logic", sub: "SMS / Queue" },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center gap-1.5">
                  <div className={`px-2.5 py-1.5 rounded-lg text-center ${step.label === "Convoso" ? "bg-green-500/10 ring-1 ring-green-500/20" : "bg-muted"}`}>
                    <span className={`text-[11px] font-semibold block ${step.label === "Convoso" ? "text-green-600" : "text-foreground"}`}>{step.label}</span>
                    <span className="text-[9px] text-muted-foreground">{step.sub}</span>
                  </div>
                  {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Hours vs After Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="border-green-500/20">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-foreground">Business Hours</h3>
                <Badge variant="secondary" className="text-[10px]">8 AM - 8 PM</Badge>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                  Lead instantly pushed to Convoso
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                  Agent dials within seconds
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                  If no answer: auto-retry in 5 min
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                  If not worked in 2 min: alert fires
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-foreground">After Hours</h3>
                <Badge variant="secondary" className="text-[10px]">8 PM - 8 AM</Badge>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                  Lead queued for next calling block
                </li>
                <li className="flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-blue-500 shrink-0" />
                  Auto-text sent immediately
                </li>
                <li className="flex items-center gap-1.5">
                  <Timer className="w-3 h-3 text-blue-500 shrink-0" />
                  Priority position in morning queue
                </li>
                <li className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-blue-500 shrink-0" />
                  Tagged with after-hours flag for tracking
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Cards */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Active Workflows</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WORKFLOWS.map((wf) => {
              const Icon = wf.icon;
              return (
                <Card key={wf.name} className={wf.priority === 'primary' ? 'border-primary/20' : ''}>
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-xs font-semibold text-foreground">{wf.name}</span>
                      </div>
                      <Badge className="text-[10px] bg-green-500/10 text-green-600 border-0">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> {wf.status}
                      </Badge>
                    </div>
                    <div className="pl-9">
                      <p className="text-[10px] text-muted-foreground mb-1.5">Trigger: {wf.trigger}</p>
                      <ol className="space-y-0.5">
                        {wf.steps.map((step, i) => (
                          <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                            <span className="text-[9px] font-bold text-primary mt-0.5">{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Webhook Event Log */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Recent Webhook Events
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {WEBHOOK_LOG.map((log, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground font-mono w-[72px]">{log.time}</span>
                      <Badge variant="outline" className="text-[10px]">{log.event}</Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {log.source} → {log.dest}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{log.ms}ms</span>
                      <Badge className={`text-[10px] border-0 ${
                        log.status === 'success' ? 'bg-green-500/10 text-green-600' :
                        log.status === 'sent' ? 'bg-blue-500/10 text-blue-600' :
                        log.status === 'queued' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evolution note */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <span className="text-xs font-semibold text-foreground">This system evolves with your data</span>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• Adjust business hours as your team grows</li>
                  <li>• Change SMS templates based on response rates</li>
                  <li>• Add new workflows as you identify patterns</li>
                  <li>• Tighten escalation windows as speed improves</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </GrowthEngineShell>
  );
}
