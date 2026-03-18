import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { cn } from "@/lib/utils";
import {
  FileText, ArrowUpRight, ArrowDownRight, Pause, Play,
  Clock, XCircle, CheckCircle2, AlertTriangle, Zap,
  Phone, ClipboardList, Globe
} from "lucide-react";
import { Link } from "react-router-dom";

const PAGE_DATA = [
  { name: "Long-Distance Movers LP", views: 2840, leads: 221, conv: "7.8%", calls: 34, forms: 187, booked: 38, bookedRate: "17.2%", costPerBook: "$112", speed: "8s", status: "live", verdict: "scale" },
  { name: "Social Traffic LP", views: 1340, leads: 95, conv: "7.1%", calls: 8, forms: 87, booked: 11, bookedRate: "11.6%", costPerBook: "$148", speed: "12s", status: "live", verdict: "watch" },
  { name: "Free Quote LP", views: 1920, leads: 131, conv: "6.8%", calls: 21, forms: 110, booked: 16, bookedRate: "12.2%", costPerBook: "$138", speed: "14s", status: "live", verdict: "watch" },
  { name: "Call-First LP", views: 680, leads: 63, conv: "9.2%", calls: 59, forms: 4, booked: 14, bookedRate: "22.2%", costPerBook: "$98", speed: "3s", status: "live", verdict: "scale" },
  { name: "Meta Instant Form", views: 0, leads: 84, conv: "5.5%", calls: 0, forms: 84, booked: 6, bookedRate: "7.1%", costPerBook: "$210", speed: "6s", status: "live", verdict: "watch" },
  { name: "Homepage", views: 3200, leads: 67, conv: "2.1%", calls: 12, forms: 55, booked: 4, bookedRate: "6.0%", costPerBook: "$380", speed: "45s", status: "live", verdict: "pause" },
];

const AB_TESTS = [
  { name: "Long-Distance LP vs Call-First LP", metric: "Booked Rate", a: "17.2%", b: "22.2%", winner: "Call-First LP", confidence: "92%", status: "running" },
  { name: "Quote LP: Short Form vs Multi-Step", metric: "Lead Quality", a: "65 avg", b: "82 avg", winner: "Multi-Step", confidence: "88%", status: "concluded" },
];

function VerdictBadge({ verdict }: { verdict: string }) {
  const styles: Record<string, string> = { scale: "bg-emerald-500/10 text-emerald-600", watch: "bg-amber-500/10 text-amber-600", pause: "bg-red-500/10 text-red-600" };
  const icons: Record<string, typeof Play> = { scale: ArrowUpRight, watch: Clock, pause: Pause };
  const Icon = icons[verdict] || Clock;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", styles[verdict])}>
      <Icon className="w-2.5 h-2.5" />{verdict}
    </span>
  );
}

export default function GrowthLandingPages() {
  return (
    <GrowthEngineShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Landing Pages</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Page performance, conversion rates, and A/B test results.</p>
          </div>
          <Link to="/marketing/campaigns" className="text-[11px] font-semibold text-primary hover:underline">+ Launch New Page</Link>
        </div>

        {/* Page Performance Table */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Page Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-semibold">Page</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Views</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Leads</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Conv %</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Calls</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Forms</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Booked</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Book %</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">$/Booked</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Speed</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {PAGE_DATA.map(row => (
                  <tr key={row.name} className={cn("border-b border-border/50 hover:bg-muted/20", row.verdict === "pause" && "bg-red-500/3")}>
                    <td className="py-2.5 font-medium text-foreground">{row.name}</td>
                    <td className="py-2.5 text-right text-foreground">{row.views > 0 ? row.views.toLocaleString() : "N/A"}</td>
                    <td className="py-2.5 text-right text-foreground">{row.leads}</td>
                    <td className="py-2.5 text-right text-foreground">{row.conv}</td>
                    <td className="py-2.5 text-right text-foreground">{row.calls}</td>
                    <td className="py-2.5 text-right text-foreground">{row.forms}</td>
                    <td className="py-2.5 text-right font-semibold text-emerald-600">{row.booked}</td>
                    <td className="py-2.5 text-right text-foreground">{row.bookedRate}</td>
                    <td className="py-2.5 text-right text-foreground">{row.costPerBook}</td>
                    <td className="py-2.5 text-right text-foreground">{row.speed}</td>
                    <td className="py-2.5 text-right"><VerdictBadge verdict={row.verdict} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* A/B Tests */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">A/B Tests</h2>
          <div className="space-y-3">
            {AB_TESTS.map(test => (
              <div key={test.name} className="border border-border/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold text-foreground">{test.name}</span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                    test.status === "running" ? "bg-blue-500/10 text-blue-600" : "bg-emerald-500/10 text-emerald-600"
                  )}>{test.status}</span>
                </div>
                <div className="grid grid-cols-4 gap-3 text-[11px]">
                  <div><span className="text-muted-foreground">Metric:</span> <span className="font-medium text-foreground">{test.metric}</span></div>
                  <div><span className="text-muted-foreground">Variant A:</span> <span className="font-medium text-foreground">{test.a}</span></div>
                  <div><span className="text-muted-foreground">Variant B:</span> <span className="font-medium text-foreground">{test.b}</span></div>
                  <div><span className="text-muted-foreground">Winner:</span> <span className="font-semibold text-emerald-600">{test.winner}</span> <span className="text-muted-foreground">({test.confidence})</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick signals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-[12px] font-semibold text-foreground">Pause These</span>
            </div>
            {PAGE_DATA.filter(p => p.verdict === "pause").map(p => (
              <div key={p.name} className="text-[11px] text-muted-foreground py-1">
                <span className="font-medium text-foreground">{p.name}</span>: {p.conv} conv, {p.bookedRate} booked, {p.costPerBook}/book
              </div>
            ))}
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              <span className="text-[12px] font-semibold text-foreground">Scale These</span>
            </div>
            {PAGE_DATA.filter(p => p.verdict === "scale").map(p => (
              <div key={p.name} className="text-[11px] text-muted-foreground py-1">
                <span className="font-medium text-foreground">{p.name}</span>: {p.conv} conv, {p.bookedRate} booked, {p.costPerBook}/book
              </div>
            ))}
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-[12px] font-semibold text-foreground">Watch These</span>
            </div>
            {PAGE_DATA.filter(p => p.verdict === "watch").map(p => (
              <div key={p.name} className="text-[11px] text-muted-foreground py-1">
                <span className="font-medium text-foreground">{p.name}</span>: {p.conv} conv, {p.bookedRate} booked
              </div>
            ))}
          </div>
        </div>
      </div>
    </GrowthEngineShell>
  );
}
