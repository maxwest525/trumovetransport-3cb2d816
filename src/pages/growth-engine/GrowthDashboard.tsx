import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import {
  TrendingUp, TrendingDown, Phone, FileText, AlertTriangle,
  DollarSign, MousePointerClick, Target, BarChart3, Zap,
  ArrowUpRight, ArrowDownRight, Activity, Globe, Megaphone,
  Search, Users, Eye, CheckCircle, XCircle, Lightbulb,
  Clock, Star, Shield, ChevronRight, Server, Database,
  RefreshCw, ToggleLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATS = [
  { label: "Leads Today", value: "23", change: "+18%", up: true, icon: Users, color: "text-emerald-500" },
  { label: "Leads This Week", value: "142", change: "+12%", up: true, icon: TrendingUp, color: "text-blue-500" },
  { label: "Leads This Month", value: "587", change: "+8%", up: true, icon: BarChart3, color: "text-violet-500" },
  { label: "Avg Cost Per Lead", value: "$24.80", change: "-6%", up: true, icon: DollarSign, color: "text-amber-500" },
];

const CHANNEL_SCORES = [
  { name: "Google Ads", leads: 234, cpl: "$22.40", conv: "4.8%", score: 92, trend: "up" as const, primary: true },
  { name: "Meta Ads", leads: 156, cpl: "$18.90", conv: "3.2%", score: 78, trend: "up" as const, primary: true },
  { name: "Organic SEO", leads: 89, cpl: "$0", conv: "6.1%", score: 85, trend: "stable" as const, primary: false },
  { name: "Google Maps", leads: 67, cpl: "$0", conv: "8.3%", score: 88, trend: "up" as const, primary: false },
  { name: "Referral", leads: 41, cpl: "$0", conv: "12.5%", score: 95, trend: "stable" as const, primary: false },
];

const FUNNEL_STAGES = [
  { label: "Ad Clicks", count: 8420, pct: 100, color: "bg-blue-500" },
  { label: "LP Views", count: 6234, pct: 74, color: "bg-indigo-500" },
  { label: "Form / Call", count: 587, pct: 7, color: "bg-violet-500" },
  { label: "Qualified", count: 342, pct: 4.1, color: "bg-purple-500" },
  { label: "Estimate Sent", count: 198, pct: 2.4, color: "bg-fuchsia-500" },
  { label: "Booked", count: 89, pct: 1.1, color: "bg-pink-500" },
];

const TOP_KEYWORDS = [
  { keyword: "long distance movers", clicks: 1240, conv: 34, cpc: "$3.80" },
  { keyword: "interstate moving company", clicks: 890, conv: 28, cpc: "$4.20" },
  { keyword: "cross country movers", clicks: 760, conv: 22, cpc: "$2.90" },
  { keyword: "full service movers", clicks: 540, conv: 18, cpc: "$5.10" },
  { keyword: "movers from FL to NY", clicks: 420, conv: 14, cpc: "$4.80" },
];

const TOP_PAGES = [
  { name: "Long-Distance LP", views: 2840, conv: "7.8%", trend: "up" },
  { name: "Free Quote LP", views: 1920, conv: "6.8%", trend: "up" },
  { name: "Social Traffic LP", views: 1340, conv: "7.1%", trend: "stable" },
  { name: "Homepage", views: 3200, conv: "2.1%", trend: "down" },
];

const AI_RECS = [
  { text: "Speed-to-lead averaging 4.2 min. Target under 60s. Review Convoso queue priority.", priority: "high", action: "Review Queue" },
  { text: "Meta CPL dropped 12% this week. Consider increasing budget $200/day on winners.", priority: "high", action: "Scale Budget" },
  { text: "'Cross country movers' keyword converting at 6.2%. Increase bid and budget.", priority: "medium", action: "Adjust Bid" },
  { text: "Homepage gets 3,200 views but only 2.1% conversion. Send ad traffic to dedicated LPs instead.", priority: "medium", action: "Fix Routing" },
  { text: "23 leads hit after-hours queue last night. Review calling block schedule.", priority: "medium", action: "Set Hours" },
];

const ALERTS = [
  { text: "Google Ads pixel not firing on /thank-you page", type: "error" },
  { text: "5 leads not worked within 2 min. Check Convoso queue.", type: "warning" },
  { text: "3 missed calls from paid leads in 2 hours", type: "warning" },
];

const PRIORITIES = [
  { label: "5 unworked leads in Convoso queue", status: "urgent", action: "Open Queue" },
  { label: "Fix tracking pixel on thank-you page", status: "urgent", action: "Fix Tracking" },
  { label: "3 missed paid calls need callbacks", status: "action", action: "View Calls" },
  { label: "Scale Meta budget on winning ad sets", status: "opportunity", action: "Scale Now" },
];

const LEAD_STATUSES = [
  { label: "New", count: 12, color: "bg-blue-500", desc: "Just arrived" },
  { label: "In Queue", count: 8, color: "bg-indigo-500", desc: "In Convoso" },
  { label: "Attempted", count: 15, color: "bg-violet-500", desc: "Called, no answer" },
  { label: "Connected", count: 67, color: "bg-emerald-500", desc: "Spoke with lead" },
  { label: "Not Reached", count: 34, color: "bg-amber-500", desc: "Multiple attempts" },
  { label: "Escalated", count: 3, color: "bg-red-500", desc: "Needs attention" },
];

const CONVERSION_METRICS = [
  { label: "Click to Form", rate: "7.0%", trend: "up" },
  { label: "Click to Call", rate: "3.2%", trend: "up" },
  { label: "Form to Sale", rate: "15.2%", trend: "stable" },
  { label: "Call to Sale", rate: "22.8%", trend: "up" },
  { label: "LP to Sale", rate: "1.6%", trend: "stable" },
  { label: "Source to Sale", rate: "1.1%", trend: "up" },
];

function StatCard({ stat }: { stat: typeof STATS[0] }) {
  const Icon = stat.icon;
  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <Icon className={cn("w-5 h-5", stat.color)} />
        <span className={cn(
          "text-[11px] font-semibold flex items-center gap-0.5",
          stat.up ? "text-emerald-500" : "text-red-500"
        )}>
          {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {stat.change}
        </span>
      </div>
      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
    </div>
  );
}

export default function GrowthDashboard() {
  return (
    <GrowthEngineShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Growth Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Interstate moving lead generation at a glance.</p>
        </div>

        {/* Alerts */}
        {ALERTS.length > 0 && (
          <div className="space-y-2">
            {ALERTS.map((alert, i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm",
                alert.type === "error" ? "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400" : "bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400"
              )}>
                {alert.type === "error" ? <XCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{alert.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Top Priorities + Speed-to-Lead + System Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">Top Priorities Today</h2>
              <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">START HERE</span>
            </div>
            <div className="space-y-2">
              {PRIORITIES.map((p, i) => (
                <div key={i} className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  p.status === "urgent" ? "bg-red-500/5 border-red-500/15" :
                  p.status === "action" ? "bg-amber-500/5 border-amber-500/15" :
                  "bg-emerald-500/5 border-emerald-500/15"
                )}>
                  <div className="flex items-center gap-2.5">
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      p.status === "urgent" ? "bg-red-500" : p.status === "action" ? "bg-amber-500" : "bg-emerald-500"
                    )} />
                    <span className="text-[12px] font-medium text-foreground">{p.label}</span>
                  </div>
                  <button className="text-[10px] font-semibold text-primary hover:underline whitespace-nowrap">{p.action}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-foreground">Speed-to-Lead</h2>
              </div>
              <div className="text-3xl font-bold text-amber-500">4m 12s</div>
              <p className="text-[11px] text-muted-foreground mt-1">Avg time: form submit to first call</p>
              <div className="mt-3 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2">
                <p className="text-[10px] text-amber-600 font-medium">Target: under 60s. Review queue priority.</p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-semibold text-foreground">Convoso Queue</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-lg font-bold text-foreground">8</div>
                  <div className="text-[10px] text-muted-foreground">In Queue</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-500">3</div>
                  <div className="text-[10px] text-muted-foreground">Agents Active</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-500">5</div>
                  <div className="text-[10px] text-muted-foreground">Callbacks</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">67%</div>
                  <div className="text-[10px] text-muted-foreground">Contact Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Architecture */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">System Architecture</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3">
              <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Primary Dialer</div>
              <div className="text-[13px] font-semibold text-foreground">Convoso</div>
              <span className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
              </span>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-3">
              <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1">System of Record</div>
              <div className="text-[13px] font-semibold text-foreground">Not configured</div>
              <span className="text-[10px] text-muted-foreground">Set up in Integrations</span>
            </div>
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Backup Sync</div>
              <div className="text-[13px] font-semibold text-muted-foreground">None</div>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map(stat => <StatCard key={stat.label} stat={stat} />)}
        </div>

        {/* Conversion Metrics + Lead Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Conversion metrics */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Conversion Funnel</h2>
              <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-bold">WHAT'S CONVERTING</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CONVERSION_METRICS.map(m => (
                <div key={m.label} className="bg-muted/30 rounded-lg p-3">
                  <div className="text-[10px] text-muted-foreground mb-1">{m.label}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-foreground">{m.rate}</span>
                    {m.trend === "up" && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                    {m.trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Status */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Lead Status</h2>
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">This month</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LEAD_STATUSES.map(s => (
                <div key={s.label} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", s.color)} />
                    <span className="text-[11px] font-semibold text-foreground">{s.label}</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">{s.count}</div>
                  <div className="text-[9px] text-muted-foreground">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Funnel + Channel scores */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-1">Traffic to Booked Funnel</h2>
            <p className="text-[11px] text-muted-foreground mb-3">Last 30 days</p>
            <div className="space-y-2">
              {FUNNEL_STAGES.map((stage) => (
                <div key={stage.label} className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground w-24 shrink-0 text-right">{stage.label}</span>
                  <div className="flex-1 h-7 bg-muted/50 rounded-lg overflow-hidden relative">
                    <div className={cn("h-full rounded-lg", stage.color)} style={{ width: `${Math.max(stage.pct, 3)}%` }} />
                    <span className="absolute inset-0 flex items-center px-3 text-[11px] font-semibold text-foreground">{stage.count.toLocaleString()}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground w-10 text-right">{stage.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-1">Channel Scorecard</h2>
            <p className="text-[11px] text-muted-foreground mb-3">Performance by source</p>
            <div className="space-y-2">
              {CHANNEL_SCORES.map(ch => (
                <div key={ch.name} className={cn("flex items-center gap-3 p-2 rounded-lg", ch.primary && "bg-primary/3")}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-medium text-foreground truncate">{ch.name}</span>
                        {ch.primary && <span className="text-[8px] bg-primary/10 text-primary px-1 py-0.5 rounded font-bold">PRIMARY</span>}
                      </div>
                      <div className={cn(
                        "w-8 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
                        ch.score >= 90 ? "bg-emerald-500/10 text-emerald-600" : ch.score >= 75 ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"
                      )}>{ch.score}</div>
                    </div>
                    <div className="flex gap-4 mt-1 text-[10px] text-muted-foreground">
                      <span>{ch.leads} leads</span>
                      <span>CPL: {ch.cpl}</span>
                      <span>Conv: {ch.conv}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-foreground">Call Leads</h2>
            </div>
            <div className="text-3xl font-bold text-foreground">234</div>
            <p className="text-[11px] text-muted-foreground mt-1">This month | Avg duration: 3m 42s</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-emerald-500/5 rounded-lg p-2">
                <span className="text-muted-foreground">Connected</span>
                <div className="text-foreground font-semibold">67</div>
              </div>
              <div className="bg-indigo-500/5 rounded-lg p-2">
                <span className="text-muted-foreground">In Queue</span>
                <div className="text-foreground font-semibold">89</div>
              </div>
              <div className="bg-amber-500/5 rounded-lg p-2">
                <span className="text-muted-foreground">Not Reached</span>
                <div className="text-amber-500 font-semibold">34</div>
              </div>
              <div className="bg-red-500/5 rounded-lg p-2">
                <span className="text-muted-foreground">Missed</span>
                <div className="text-red-500 font-semibold">12</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-semibold text-foreground">Form Leads</h2>
            </div>
            <div className="text-3xl font-bold text-foreground">353</div>
            <p className="text-[11px] text-muted-foreground mt-1">This month | Avg response: 4m 18s</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-emerald-500/5 rounded-lg p-2">
                <span className="text-muted-foreground">Qualified</span>
                <div className="text-foreground font-semibold">198</div>
              </div>
              <div className="bg-indigo-500/5 rounded-lg p-2">
                <span className="text-muted-foreground">In Queue</span>
                <div className="text-foreground font-semibold">112</div>
              </div>
              <div className="bg-amber-500/5 rounded-lg p-2">
                <span className="text-muted-foreground">Attempted</span>
                <div className="text-amber-500 font-semibold">43</div>
              </div>
              <div className="bg-red-500/5 rounded-lg p-2">
                <span className="text-muted-foreground">Junk</span>
                <div className="text-red-500 font-semibold">18</div>
              </div>
            </div>
          </div>
        </div>

        {/* Keywords + Pages + AI Recs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-1">Top Keywords</h2>
            <p className="text-[11px] text-muted-foreground mb-3">Best performing search terms</p>
            <div className="space-y-2">
              {TOP_KEYWORDS.map(kw => (
                <div key={kw.keyword} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div>
                    <span className="text-[12px] font-medium text-foreground">{kw.keyword}</span>
                    <div className="text-[10px] text-muted-foreground">{kw.clicks} clicks | CPC: {kw.cpc}</div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-500">{kw.conv} conv</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-1">Landing Page Performance</h2>
            <p className="text-[11px] text-muted-foreground mb-3">Conv rate by page</p>
            <div className="space-y-2">
              {TOP_PAGES.map(page => (
                <div key={page.name} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div>
                    <span className="text-[12px] font-medium text-foreground">{page.name}</span>
                    <div className="text-[10px] text-muted-foreground">{page.views.toLocaleString()} views</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] font-semibold text-foreground">{page.conv}</span>
                    <div className="flex items-center justify-end">
                      {page.trend === "up" && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                      {page.trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">Recommendations</h2>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">What to do next</p>
            <div className="space-y-2">
              {AI_RECS.map((rec, i) => (
                <div key={i} className={cn(
                  "p-3 rounded-lg border text-[12px] leading-relaxed",
                  rec.priority === "high" ? "bg-primary/5 border-primary/20 text-foreground" : "bg-muted/50 border-border/50 text-muted-foreground"
                )}>
                  <p>{rec.text}</p>
                  <button className="text-[10px] font-semibold text-primary mt-1.5 hover:underline">{rec.action} &rarr;</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Evolution note */}
        <div className="bg-muted/30 border border-border/50 rounded-xl px-4 py-3 flex items-start gap-3">
          <RefreshCw className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <span className="text-[11px] font-semibold text-foreground">This dashboard evolves with your data</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">As campaigns run, turn off weak keywords, shift budget to winning markets, remove underperforming pages, and adjust routing based on real conversion feedback.</p>
          </div>
        </div>
      </div>
    </GrowthEngineShell>
  );
}
