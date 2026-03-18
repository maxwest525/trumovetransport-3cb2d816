import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2, AlertTriangle, XCircle, Link2,
  Copy, Globe, Activity, ArrowUpRight, ArrowDownRight,
  Phone, FileText, Clock, Zap
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PIXEL_HEALTH = [
  { name: "Google Ads Tag", status: "active", lastFired: "2 min ago", events: 847 },
  { name: "Meta Pixel", status: "active", lastFired: "5 min ago", events: 1203 },
  { name: "GA4", status: "active", lastFired: "1 min ago", events: 3241 },
  { name: "CallRail", status: "warning", lastFired: "3 hours ago", events: 156 },
  { name: "Search Console", status: "active", lastFired: "1 hour ago", events: null },
];

const ATTRIBUTION_BY_SOURCE = [
  { source: "Google Search", firstTouch: 234, lastTouch: 218, assisted: 42, bookedFirstTouch: 42, bookedLastTouch: 38 },
  { source: "Meta Ads", firstTouch: 156, lastTouch: 172, assisted: 28, bookedFirstTouch: 18, bookedLastTouch: 22 },
  { source: "Organic", firstTouch: 89, lastTouch: 67, assisted: 34, bookedFirstTouch: 14, bookedLastTouch: 11 },
  { source: "Referral", firstTouch: 41, lastTouch: 38, assisted: 8, bookedFirstTouch: 11, bookedLastTouch: 10 },
  { source: "Direct", firstTouch: 67, lastTouch: 92, assisted: 0, bookedFirstTouch: 12, bookedLastTouch: 16 },
];

const CONVERSION_EVENTS = [
  { event: "Form Submit", source: "Google Search", count: 184, lastSeen: "3 min ago", status: "active" },
  { event: "Phone Call", source: "CallRail", count: 234, lastSeen: "8 min ago", status: "active" },
  { event: "Form Submit", source: "Meta Pixel", count: 112, lastSeen: "12 min ago", status: "active" },
  { event: "Quote Started", source: "GA4", count: 567, lastSeen: "1 min ago", status: "active" },
  { event: "Lead Event", source: "Meta CAPI", count: 98, lastSeen: "15 min ago", status: "active" },
  { event: "Thank You Page", source: "Google Ads", count: 0, lastSeen: "Never", status: "error" },
];

const WEBHOOK_LOG = [
  { time: "2:34 PM", event: "Form Submit", source: "Google", destination: "Convoso", status: "success", latency: "0.8s" },
  { time: "2:31 PM", event: "Phone Call", source: "CallRail", destination: "CRM", status: "success", latency: "1.2s" },
  { time: "2:28 PM", event: "Form Submit", source: "Meta", destination: "Convoso", status: "success", latency: "0.6s" },
  { time: "2:22 PM", event: "Form Submit", source: "Google", destination: "Convoso", status: "failed", latency: "timeout" },
  { time: "2:18 PM", event: "Instant Form", source: "Meta", destination: "Convoso", status: "success", latency: "0.4s" },
];

const RESPONSE_SPEED_BY_SOURCE = [
  { source: "Google Search", avgSpeed: "8s", median: "5s", p90: "22s", status: "good" },
  { source: "Meta Ads", avgSpeed: "14s", median: "10s", p90: "45s", status: "ok" },
  { source: "Meta Instant Form", avgSpeed: "6s", median: "4s", p90: "12s", status: "good" },
  { source: "Organic", avgSpeed: "22s", median: "18s", p90: "1m 40s", status: "ok" },
  { source: "CallRail Inbound", avgSpeed: "3s", median: "2s", p90: "8s", status: "good" },
];

export default function GrowthTracking() {
  const [utmSource, setUtmSource] = useState("google");
  const [utmMedium, setUtmMedium] = useState("cpc");
  const [utmCampaign, setUtmCampaign] = useState("interstate-moving-ca");
  const [utmTerm, setUtmTerm] = useState("long distance movers");
  const [baseUrl, setBaseUrl] = useState("https://yourdomain.com/quote");

  const utmUrl = `${baseUrl}?utm_source=${encodeURIComponent(utmSource)}&utm_medium=${encodeURIComponent(utmMedium)}&utm_campaign=${encodeURIComponent(utmCampaign)}${utmTerm ? `&utm_term=${encodeURIComponent(utmTerm)}` : ''}`;

  const copyUtm = () => {
    navigator.clipboard.writeText(utmUrl);
    toast.success("UTM URL copied");
  };

  return (
    <GrowthEngineShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tracking & Attribution</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Pixel health, conversion events, attribution comparison, and routing verification.</p>
        </div>

        {/* Pixel Health */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Pixel & Event Health</h2>
          <div className="space-y-1.5">
            {PIXEL_HEALTH.map(p => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className={cn("w-2 h-2 rounded-full", p.status === "active" ? "bg-emerald-500" : p.status === "warning" ? "bg-amber-500" : "bg-red-500")} />
                  <span className="text-[12px] font-medium text-foreground">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>Last: {p.lastFired}</span>
                  {p.events !== null && <Badge variant="secondary" className="text-[10px]">{p.events.toLocaleString()}</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Events Log */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Conversion Events</h2>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-semibold">Event</th>
                <th className="text-left py-2 text-muted-foreground font-semibold">Source</th>
                <th className="text-right py-2 text-muted-foreground font-semibold">Count (30d)</th>
                <th className="text-right py-2 text-muted-foreground font-semibold">Last Seen</th>
                <th className="text-right py-2 text-muted-foreground font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {CONVERSION_EVENTS.map((e, i) => (
                <tr key={i} className={cn("border-b border-border/50", e.status === "error" && "bg-red-500/3")}>
                  <td className="py-2 font-medium text-foreground">{e.event}</td>
                  <td className="py-2 text-muted-foreground">{e.source}</td>
                  <td className="py-2 text-right text-foreground">{e.count}</td>
                  <td className="py-2 text-right text-muted-foreground">{e.lastSeen}</td>
                  <td className="py-2 text-right">
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                      e.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                    )}>
                      {e.status === "active" ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Attribution comparison + Response speed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Attribution Comparison</h2>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-semibold">Source</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">First Touch</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Last Touch</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Assisted</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Booked (FT)</th>
                </tr>
              </thead>
              <tbody>
                {ATTRIBUTION_BY_SOURCE.map(row => (
                  <tr key={row.source} className="border-b border-border/50">
                    <td className="py-2 font-medium text-foreground">{row.source}</td>
                    <td className="py-2 text-right text-foreground">{row.firstTouch}</td>
                    <td className="py-2 text-right text-foreground">{row.lastTouch}</td>
                    <td className="py-2 text-right text-muted-foreground">{row.assisted}</td>
                    <td className="py-2 text-right font-semibold text-emerald-600">{row.bookedFirstTouch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Response Speed by Source</h2>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-semibold">Source</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Avg</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Median</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">P90</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {RESPONSE_SPEED_BY_SOURCE.map(row => (
                  <tr key={row.source} className="border-b border-border/50">
                    <td className="py-2 font-medium text-foreground">{row.source}</td>
                    <td className="py-2 text-right text-foreground">{row.avgSpeed}</td>
                    <td className="py-2 text-right text-foreground">{row.median}</td>
                    <td className="py-2 text-right text-muted-foreground">{row.p90}</td>
                    <td className="py-2 text-right">
                      <span className={cn("w-2 h-2 rounded-full inline-block", row.status === "good" ? "bg-emerald-500" : "bg-amber-500")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Webhook Log */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Webhook / Routing Log</h2>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-semibold">Time</th>
                <th className="text-left py-2 text-muted-foreground font-semibold">Event</th>
                <th className="text-left py-2 text-muted-foreground font-semibold">Source</th>
                <th className="text-left py-2 text-muted-foreground font-semibold">Destination</th>
                <th className="text-right py-2 text-muted-foreground font-semibold">Latency</th>
                <th className="text-right py-2 text-muted-foreground font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {WEBHOOK_LOG.map((row, i) => (
                <tr key={i} className={cn("border-b border-border/50", row.status === "failed" && "bg-red-500/3")}>
                  <td className="py-2 text-muted-foreground">{row.time}</td>
                  <td className="py-2 font-medium text-foreground">{row.event}</td>
                  <td className="py-2 text-foreground">{row.source}</td>
                  <td className="py-2 text-foreground">{row.destination}</td>
                  <td className="py-2 text-right text-foreground">{row.latency}</td>
                  <td className="py-2 text-right">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                      row.status === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                    )}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* UTM Builder */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-primary" /> UTM Builder
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase">Base URL</label>
              <Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase">Source</label>
              <Input value={utmSource} onChange={e => setUtmSource(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase">Medium</label>
              <Input value={utmMedium} onChange={e => setUtmMedium(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase">Campaign</label>
              <Input value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-medium text-muted-foreground uppercase">Term</label>
              <Input value={utmTerm} onChange={e => setUtmTerm(e.target.value)} className="h-8 text-xs" />
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted mt-3">
            <code className="text-[10px] text-muted-foreground flex-1 truncate">{utmUrl}</code>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 shrink-0" onClick={copyUtm}>
              <Copy className="w-3 h-3" /> Copy
            </Button>
          </div>
        </div>
      </div>
    </GrowthEngineShell>
  );
}
