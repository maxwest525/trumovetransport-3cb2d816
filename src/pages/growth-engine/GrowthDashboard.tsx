import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import {
  TrendingUp, TrendingDown, Phone, FileText, AlertTriangle,
  DollarSign, MousePointerClick, Target, BarChart3, Zap,
  ArrowUpRight, ArrowDownRight, Activity, Globe, Users,
  CheckCircle, XCircle, Lightbulb, Clock, Star, Pause,
  Play, ChevronRight, RefreshCw, Ban, PhoneOff, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

/* ─── MOCK DATA ─── */

const ALERTS = [
  { text: "Google Ads pixel not firing on /thank-you page. Fix now or lose attribution.", type: "error", action: "Fix Tracking", href: "/marketing/tracking" },
  { text: "5 leads unworked > 2 min. Convoso queue backed up.", type: "warning", action: "Open Queue", href: "/marketing/leads" },
  { text: "3 missed paid calls in last 2 hours. Callback needed.", type: "warning", action: "View Calls", href: "/marketing/leads" },
];

const SOURCE_TO_SALE = [
  { source: "Google Search", leads: 234, cpl: "$22.40", contacted: 218, booked: 42, bookedRate: "18.0%", costPerBook: "$124", revenue: "$84,000", roas: "15.1x", verdict: "scale", speed: "8s" },
  { source: "Meta Ads", leads: 156, cpl: "$18.90", contacted: 128, booked: 18, bookedRate: "11.5%", costPerBook: "$164", revenue: "$36,000", roas: "12.2x", verdict: "scale", speed: "14s" },
  { source: "Google Maps", leads: 67, cpl: "$0", contacted: 61, booked: 12, bookedRate: "17.9%", costPerBook: "$0", revenue: "$24,000", roas: "—", verdict: "maintain", speed: "Direct" },
  { source: "Organic SEO", leads: 89, cpl: "$0", contacted: 78, booked: 14, bookedRate: "15.7%", costPerBook: "$0", revenue: "$28,000", roas: "—", verdict: "maintain", speed: "22s" },
  { source: "Referral", leads: 41, cpl: "$0", contacted: 39, booked: 11, bookedRate: "26.8%", costPerBook: "$0", revenue: "$22,000", roas: "—", verdict: "maintain", speed: "Direct" },
];

const PAGE_PERFORMANCE = [
  { page: "Long-Distance LP", views: 2840, leads: 221, conv: "7.8%", booked: 38, bookedRate: "17.2%", costPerBook: "$112", verdict: "scale" },
  { page: "Social Traffic LP", views: 1340, leads: 95, conv: "7.1%", booked: 11, bookedRate: "11.6%", costPerBook: "$148", verdict: "watch" },
  { page: "Free Quote LP", views: 1920, leads: 131, conv: "6.8%", booked: 16, bookedRate: "12.2%", costPerBook: "$138", verdict: "watch" },
  { page: "Homepage", views: 3200, leads: 67, conv: "2.1%", booked: 4, bookedRate: "6.0%", costPerBook: "$380", verdict: "pause" },
];

const KEYWORD_PERFORMANCE = [
  { keyword: "long distance movers", clicks: 1240, leads: 34, conv: "2.7%", cpc: "$3.80", booked: 8, costPerBook: "$161", verdict: "scale" },
  { keyword: "interstate moving company", clicks: 890, leads: 28, conv: "3.1%", cpc: "$4.20", booked: 7, costPerBook: "$162", verdict: "scale" },
  { keyword: "cross country movers", clicks: 760, leads: 22, conv: "2.9%", cpc: "$2.90", booked: 5, costPerBook: "$132", verdict: "scale" },
  { keyword: "movers near me", clicks: 2100, leads: 12, conv: "0.6%", cpc: "$5.10", booked: 1, costPerBook: "$1,071", verdict: "pause" },
  { keyword: "movers from FL to NY", clicks: 420, leads: 14, conv: "3.3%", cpc: "$4.80", booked: 4, costPerBook: "$144", verdict: "scale" },
];

const CAMPAIGN_PERFORMANCE = [
  { campaign: "Interstate CA", platform: "Google", spend: "$2,840", leads: 98, cpl: "$29", booked: 19, bookedRate: "19.4%", costPerBook: "$149", verdict: "scale" },
  { campaign: "FL Interstate", platform: "Meta", spend: "$1,420", leads: 82, cpl: "$17", booked: 9, bookedRate: "11.0%", costPerBook: "$158", verdict: "watch" },
  { campaign: "Interstate TX", platform: "Google", spend: "$1,980", leads: 74, cpl: "$27", booked: 14, bookedRate: "18.9%", costPerBook: "$141", verdict: "scale" },
  { campaign: "Retargeting National", platform: "Meta", spend: "$680", leads: 34, cpl: "$20", booked: 3, bookedRate: "8.8%", costPerBook: "$227", verdict: "watch" },
  { campaign: "Interstate NY", platform: "Google", spend: "$2,100", leads: 62, cpl: "$34", booked: 8, bookedRate: "12.9%", costPerBook: "$263", verdict: "cut" },
];

const RECOMMENDATIONS = [
  { text: "Speed-to-lead averaging 4.2 min. Target under 60s. Review Convoso queue priority.", priority: "high", action: "Fix Queue", href: "/marketing/automation" },
  { text: "'Movers near me' keyword: $1,071 per booked job. Pause or add negative keywords.", priority: "high", action: "Pause Keyword", href: "/marketing/tracking" },
  { text: "Homepage converting at 2.1%. Stop sending ad traffic there. Use Long-Distance LP instead.", priority: "high", action: "Fix Routing", href: "/marketing/landing-pages" },
  { text: "Meta CPL dropped 12% this week. Consider increasing budget $200/day on winning ad sets.", priority: "medium", action: "Scale Budget", href: "/marketing/campaigns" },
  { text: "Interstate NY campaign: $263 per booked job. Cut budget or pause.", priority: "medium", action: "Review", href: "/marketing/campaigns" },
];

const LEAD_HEALTH = [
  { label: "Duplicate Rate", value: "2.2%", status: "good" },
  { label: "Missed Call Rate", value: "5.1%", status: "warning" },
  { label: "Unreached Rate", value: "9.2%", status: "warning" },
  { label: "Junk/Suppressed", value: "3.6%", status: "good" },
  { label: "Webhook Errors", value: "0", status: "good" },
  { label: "Routing Failures", value: "2", status: "warning" },
];

const CONVERSION_METRICS = [
  { label: "Click to Form", rate: "7.0%", trend: "up" },
  { label: "Click to Call", rate: "3.2%", trend: "up" },
  { label: "Form to Booked", rate: "15.2%", trend: "stable" },
  { label: "Call to Booked", rate: "22.8%", trend: "up" },
  { label: "Source to Booked", rate: "1.1%", trend: "up" },
  { label: "Cost per Booked Job", rate: "$148", trend: "down" },
];

function VerdictBadge({ verdict }: { verdict: string }) {
  const styles: Record<string, string> = {
    scale: "bg-emerald-500/10 text-emerald-600",
    watch: "bg-amber-500/10 text-amber-600",
    maintain: "bg-blue-500/10 text-blue-600",
    pause: "bg-red-500/10 text-red-600",
    cut: "bg-red-500/10 text-red-600",
  };
  const icons: Record<string, typeof Play> = {
    scale: ArrowUpRight, watch: Clock, maintain: RefreshCw, pause: Pause, cut: XCircle,
  };
  const Icon = icons[verdict] || Clock;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", styles[verdict] || "bg-muted text-muted-foreground")}>
      <Icon className="w-2.5 h-2.5" />{verdict}
    </span>
  );
}

export default function GrowthDashboard() {
  return (
    <GrowthEngineShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Growth Dashboard</h1>
            <p className="text-sm text-muted-foreground">What is working. What is not. What to do next.</p>
          </div>
          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-full">Last 30 days</span>
        </div>

        {/* Alerts */}
        {ALERTS.length > 0 && (
          <div className="space-y-1.5">
            {ALERTS.map((alert, i) => (
              <div key={i} className={cn(
                "flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm",
                alert.type === "error" ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/20"
              )}>
                <div className="flex items-center gap-2.5">
                  {alert.type === "error" ? <XCircle className="w-4 h-4 text-red-500 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                  <span className={cn("text-[12px]", alert.type === "error" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400")}>{alert.text}</span>
                </div>
                <Link to={alert.href} className="text-[10px] font-bold text-primary hover:underline whitespace-nowrap ml-3">{alert.action}</Link>
              </div>
            ))}
          </div>
        )}

        {/* Top row: Speed-to-lead + Queue + Conversion rates */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">Speed-to-Lead</h2>
            </div>
            <div className="text-3xl font-bold text-amber-500">4m 12s</div>
            <p className="text-[11px] text-muted-foreground mt-1">Avg time from lead event to first call</p>
            <div className="mt-3 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
              <p className="text-[10px] text-red-600 font-semibold">Too slow. Target: under 60s. Fix Convoso queue priority.</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-semibold text-foreground">Convoso Queue</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-lg font-bold text-foreground">8</div><div className="text-[10px] text-muted-foreground">In Queue</div></div>
              <div><div className="text-lg font-bold text-emerald-500">3</div><div className="text-[10px] text-muted-foreground">Agents Active</div></div>
              <div><div className="text-lg font-bold text-amber-500">5</div><div className="text-[10px] text-muted-foreground">Callbacks</div></div>
              <div><div className="text-lg font-bold text-foreground">67%</div><div className="text-[10px] text-muted-foreground">Contact Rate</div></div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Conversion Rates</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CONVERSION_METRICS.map(m => (
                <div key={m.label} className="bg-muted/30 rounded-lg p-2">
                  <div className="text-[9px] text-muted-foreground">{m.label}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-foreground">{m.rate}</span>
                    {m.trend === "up" && <ArrowUpRight className="w-2.5 h-2.5 text-emerald-500" />}
                    {m.trend === "down" && <ArrowDownRight className="w-2.5 h-2.5 text-emerald-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Source to Sale table */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Source to Sale</h2>
              <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">KEY TABLE</span>
            </div>
            <Link to="/marketing/leads" className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-0.5">View leads <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-semibold">Source</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Leads</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">CPL</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Speed</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Contacted</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Booked</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Book %</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">$/Booked</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Revenue</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {SOURCE_TO_SALE.map(row => (
                  <tr key={row.source} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="py-2 font-medium text-foreground">{row.source}</td>
                    <td className="py-2 text-right text-foreground">{row.leads}</td>
                    <td className="py-2 text-right text-foreground">{row.cpl}</td>
                    <td className="py-2 text-right text-foreground">{row.speed}</td>
                    <td className="py-2 text-right text-foreground">{row.contacted}</td>
                    <td className="py-2 text-right font-semibold text-emerald-600">{row.booked}</td>
                    <td className="py-2 text-right text-foreground">{row.bookedRate}</td>
                    <td className="py-2 text-right text-foreground">{row.costPerBook}</td>
                    <td className="py-2 text-right text-foreground">{row.revenue}</td>
                    <td className="py-2 text-right"><VerdictBadge verdict={row.verdict} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Campaign Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-semibold">Campaign</th>
                  <th className="text-left py-2 text-muted-foreground font-semibold">Platform</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Spend</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Leads</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">CPL</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Booked</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Book %</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">$/Booked</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {CAMPAIGN_PERFORMANCE.map(row => (
                  <tr key={row.campaign} className={cn(
                    "border-b border-border/50 hover:bg-muted/20",
                    row.verdict === "cut" && "bg-red-500/3"
                  )}>
                    <td className="py-2 font-medium text-foreground">{row.campaign}</td>
                    <td className="py-2 text-muted-foreground">{row.platform}</td>
                    <td className="py-2 text-right text-foreground">{row.spend}</td>
                    <td className="py-2 text-right text-foreground">{row.leads}</td>
                    <td className="py-2 text-right text-foreground">{row.cpl}</td>
                    <td className="py-2 text-right font-semibold text-emerald-600">{row.booked}</td>
                    <td className="py-2 text-right text-foreground">{row.bookedRate}</td>
                    <td className="py-2 text-right text-foreground">{row.costPerBook}</td>
                    <td className="py-2 text-right"><VerdictBadge verdict={row.verdict} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page + Keyword side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Page Performance */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Page to Sale</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-semibold">Page</th>
                    <th className="text-right py-2 text-muted-foreground font-semibold">Conv %</th>
                    <th className="text-right py-2 text-muted-foreground font-semibold">Booked</th>
                    <th className="text-right py-2 text-muted-foreground font-semibold">Book %</th>
                    <th className="text-right py-2 text-muted-foreground font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {PAGE_PERFORMANCE.map(row => (
                    <tr key={row.page} className={cn("border-b border-border/50", row.verdict === "pause" && "bg-red-500/3")}>
                      <td className="py-2 font-medium text-foreground">{row.page}</td>
                      <td className="py-2 text-right text-foreground">{row.conv}</td>
                      <td className="py-2 text-right font-semibold text-emerald-600">{row.booked}</td>
                      <td className="py-2 text-right text-foreground">{row.bookedRate}</td>
                      <td className="py-2 text-right"><VerdictBadge verdict={row.verdict} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Keyword Performance */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Keyword to Sale</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-semibold">Keyword</th>
                    <th className="text-right py-2 text-muted-foreground font-semibold">Conv %</th>
                    <th className="text-right py-2 text-muted-foreground font-semibold">Booked</th>
                    <th className="text-right py-2 text-muted-foreground font-semibold">$/Booked</th>
                    <th className="text-right py-2 text-muted-foreground font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {KEYWORD_PERFORMANCE.map(row => (
                    <tr key={row.keyword} className={cn("border-b border-border/50", row.verdict === "pause" && "bg-red-500/3")}>
                      <td className="py-2 font-medium text-foreground">{row.keyword}</td>
                      <td className="py-2 text-right text-foreground">{row.conv}</td>
                      <td className="py-2 text-right font-semibold text-emerald-600">{row.booked}</td>
                      <td className="py-2 text-right text-foreground">{row.costPerBook}</td>
                      <td className="py-2 text-right"><VerdictBadge verdict={row.verdict} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lead Health + Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Lead Health */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Lead Health</h2>
            </div>
            <div className="space-y-2">
              {LEAD_HEALTH.map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-[12px] text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[12px] font-semibold", item.status === "good" ? "text-emerald-600" : "text-amber-600")}>{item.value}</span>
                    <span className={cn("w-2 h-2 rounded-full", item.status === "good" ? "bg-emerald-500" : "bg-amber-500")} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-3 bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">What to Do Next</h2>
            </div>
            <div className="space-y-2">
              {RECOMMENDATIONS.map((rec, i) => (
                <div key={i} className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  rec.priority === "high" ? "bg-primary/5 border-primary/15" : "bg-muted/30 border-border/50"
                )}>
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", rec.priority === "high" ? "bg-red-500" : "bg-amber-500")} />
                    <span className="text-[12px] text-foreground">{rec.text}</span>
                  </div>
                  <Link to={rec.href} className="text-[10px] font-bold text-primary hover:underline whitespace-nowrap ml-3">{rec.action}</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GrowthEngineShell>
  );
}
