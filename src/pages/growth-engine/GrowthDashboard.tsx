import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import {
  ArrowUpRight, ArrowDownRight, Activity, Globe,
  XCircle, AlertTriangle, Lightbulb, Clock, Pause,
  ChevronRight, Search, Zap, BarChart3, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const SYSTEM = [
  { label: "Google Ads", ok: true },
  { label: "Meta Ads", ok: true },
  { label: "Convoso", ok: true },
  { label: "GHL", ok: false },
  { label: "Webhooks", ok: true },
];

const ALERTS = [
  { text: "Pixel not firing on /thank-you. Fix now.", type: "error", href: "/marketing/integrations" },
  { text: "5 leads unworked > 2 min.", type: "warning", href: "/marketing/routing" },
];

const KPI = [
  { label: "Leads", value: "587", trend: "+12%", up: true },
  { label: "Booked", value: "97", trend: "+8%", up: true },
  { label: "Book Rate", value: "16.5%", trend: "+1.2pt", up: true },
  { label: "$/Booked", value: "$148", trend: "-$11", up: true },
  { label: "Revenue", value: "$194K", trend: "+14%", up: true },
  { label: "Speed", value: "4m 12s", trend: ">60s target", up: false },
];

const SOURCES = [
  { source: "Google Search", leads: 234, booked: 42, bookRate: "18.0%", cpb: "$124", verdict: "scale" },
  { source: "Meta Ads", leads: 156, booked: 18, bookRate: "11.5%", cpb: "$164", verdict: "scale" },
  { source: "Google Maps", leads: 67, booked: 12, bookRate: "17.9%", cpb: "$0", verdict: "maintain" },
  { source: "Organic SEO", leads: 89, booked: 14, bookRate: "15.7%", cpb: "$0", verdict: "maintain" },
  { source: "Referral", leads: 41, booked: 11, bookRate: "26.8%", cpb: "$0", verdict: "maintain" },
];

const ACTIONS = [
  { text: "Speed avg 4m. Target <60s. Fix queue.", pri: "high", href: "/marketing/routing" },
  { text: "'Movers near me': $1,071/book. Pause.", pri: "high", href: "/marketing/campaigns" },
  { text: "Homepage at 2.1% conv. Redirect traffic.", pri: "high", href: "/marketing/landing-pages" },
  { text: "Meta CPL down 12%. Scale budget.", pri: "med", href: "/marketing/campaigns" },
];

function V({ v }: { v: string }) {
  const s: Record<string, string> = {
    scale: "text-emerald-600 bg-emerald-500/10",
    maintain: "text-blue-600 bg-blue-500/10",
    watch: "text-amber-600 bg-amber-500/10",
    pause: "text-red-600 bg-red-500/10",
    cut: "text-red-600 bg-red-500/10",
  };
  return <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded", s[v])}>{v}</span>;
}

export default function GrowthDashboard() {
  return (
    <GrowthEngineShell>
      <div className="space-y-3">
        {/* Header + system health */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-1.5">
            {SYSTEM.map(s => (
              <span key={s.label} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <span className={cn("w-1.5 h-1.5 rounded-full", s.ok ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                {s.label}
              </span>
            ))}
            <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded ml-2">30d</span>
          </div>
        </div>

        {/* Alerts */}
        {ALERTS.map((a, i) => (
          <div key={i} className={cn(
            "flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px]",
            a.type === "error" ? "bg-red-500/5 text-red-600" : "bg-amber-500/5 text-amber-600"
          )}>
            <div className="flex items-center gap-2">
              {a.type === "error" ? <XCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {a.text}
            </div>
            <Link to={a.href} className="text-[9px] font-bold text-primary hover:underline">Fix</Link>
          </div>
        ))}

        {/* KPI strip */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-px bg-border rounded-lg overflow-hidden">
          {KPI.map(k => (
            <div key={k.label} className="bg-card px-3 py-2.5">
              <div className="text-[9px] text-muted-foreground">{k.label}</div>
              <div className="text-base font-bold text-foreground leading-tight">{k.value}</div>
              <div className={cn("text-[9px] flex items-center gap-0.5", k.up ? "text-emerald-600" : "text-red-500")}>
                {k.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                {k.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Source to Sale */}
        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <h2 className="text-[12px] font-bold text-foreground">Source to Sale</h2>
            </div>
          </div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Source","Leads","Booked","Book %","$/Book",""].map(h => (
                  <th key={h} className={cn("py-1.5 px-2 text-[10px] text-muted-foreground font-semibold", h === "Source" ? "text-left" : "text-right")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SOURCES.map(r => (
                <tr key={r.source} className="border-b border-border/30 hover:bg-muted/10">
                  <td className="py-1.5 px-2 font-medium text-foreground">{r.source}</td>
                  <td className="py-1.5 px-2 text-right text-foreground">{r.leads}</td>
                  <td className="py-1.5 px-2 text-right font-bold text-emerald-600">{r.booked}</td>
                  <td className="py-1.5 px-2 text-right text-foreground">{r.bookRate}</td>
                  <td className="py-1.5 px-2 text-right text-foreground">{r.cpb}</td>
                  <td className="py-1.5 px-2 text-right"><V v={r.verdict} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Queue + Actions side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 bg-card rounded-lg border border-border p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <h2 className="text-[12px] font-bold text-foreground">Queue Health</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "In Queue", value: "8" },
                { label: "Agents On", value: "3" },
                { label: "Callbacks", value: "5" },
                { label: "Contact %", value: "67%" },
                { label: "Missed Calls", value: "5.1%", warn: true },
                { label: "Unreached", value: "9.2%", warn: true },
              ].map(q => (
                <div key={q.label} className="bg-muted/30 rounded px-2 py-1.5">
                  <div className="text-[9px] text-muted-foreground">{q.label}</div>
                  <div className={cn("text-sm font-bold", (q as any).warn ? "text-amber-600" : "text-foreground")}>{q.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <h2 className="text-[12px] font-bold text-foreground">What to Do Next</h2>
            </div>
            <div className="divide-y divide-border/30">
              {ACTIONS.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", r.pri === "high" ? "bg-red-500" : "bg-amber-500")} />
                    <span className="text-[11px] text-foreground">{r.text}</span>
                  </div>
                  <Link to={r.href} className="text-[9px] font-bold text-primary hover:underline whitespace-nowrap ml-2">Go</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GrowthEngineShell>
  );
}
