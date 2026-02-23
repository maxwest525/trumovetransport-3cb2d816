import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Hash, MapPin, Users, Globe, Target, BarChart3,
  TrendingUp, TrendingDown, Sparkles, Zap, DollarSign,
  Smartphone, Monitor, FlaskConical, ArrowRight,
  ChevronDown, ChevronRight, AlertTriangle,
  CheckCircle2, Eye, EyeOff, Rocket, Star,
  Layout, MousePointer, Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Data ────────────────────────────────────────────────────────────────
const KEYWORDS = [
  { keyword: "ai moving estimate", clicks: 1847, ctr: 7.89, conversions: 289, cpa: 8.09, trend: "up" as const, position: 1.2, converting: true, reason: "340% YoY growth, lowest CPA at $8.09. Early-mover advantage." },
  { keyword: "cross country movers near me", clicks: 3892, ctr: 5.78, conversions: 387, cpa: 18.40, trend: "up" as const, position: 3.4, converting: true, reason: "'Near me' modifier signals immediate intent. 42% higher conv rate." },
  { keyword: "long distance moving company", clicks: 4521, ctr: 5.06, conversions: 412, cpa: 20.01, trend: "up" as const, position: 2.1, converting: true, reason: "Highest volume + strong conversions. Core brand keyword." },
  { keyword: "moving cost calculator", clicks: 5124, ctr: 4.12, conversions: 298, cpa: 16.41, trend: "stable" as const, position: 4.8, converting: true, reason: "Tool-based intent captures early funnel at low CPA." },
  { keyword: "furniture moving service", clicks: 2129, ctr: 4.66, conversions: 178, cpa: 22.36, trend: "down" as const, position: 5.2, converting: false, reason: "Declining trend, high CPA. Consider pausing." },
  { keyword: "cheap movers", clicks: 6234, ctr: 3.98, conversions: 245, cpa: 45.71, trend: "down" as const, position: 4.1, converting: false, reason: "Price-sensitive audience, CPA 2.3x average. Brand awareness only." },
  { keyword: "diy moving tips", clicks: 3420, ctr: 2.10, conversions: 42, cpa: 81.43, trend: "stable" as const, position: 6.3, converting: false, reason: "Informational intent, very low conversion rate (1.2%)." },
];

const GEO_DATA = [
  { state: "California", city: "Los Angeles", conversions: 521, revenue: 78150, rate: 7.61, converting: true, reason: "Highest volume market, strong revenue per conversion." },
  { state: "Texas", city: "Houston", conversions: 398, revenue: 59700, rate: 7.60, converting: true, reason: "Growing market with consistent conversion rates." },
  { state: "Florida", city: "Miami", conversions: 367, revenue: 55050, rate: 7.50, converting: true, reason: "Strong seasonal demand, high intent searches." },
  { state: "New York", city: "NYC", conversions: 289, revenue: 43350, rate: 8.10, converting: true, reason: "Highest conversion rate despite lower volume." },
  { state: "Arizona", city: "Phoenix", conversions: 167, revenue: 25050, rate: 5.82, converting: false, reason: "Below-average conv rate (5.82%). Market saturation." },
  { state: "Ohio", city: "Columbus", conversions: 45, revenue: 6750, rate: 3.20, converting: false, reason: "Low volume, 3.2% conv rate is 57% below average." },
];

const DEMOGRAPHICS = [
  { segment: "Homeowners 35-54", percentage: 38, conversions: 812, aov: 3240, device: "Desktop 62%", converting: true, reason: "Core audience. Highest conversion volume, strong AOV." },
  { segment: "Young Professionals 25-34", percentage: 28, conversions: 492, aov: 2180, device: "Mobile 71%", converting: true, reason: "Growing segment, mobile-first. 71% mobile usage." },
  { segment: "Retirees 55+", percentage: 18, conversions: 378, aov: 4120, device: "Desktop 78%", converting: true, reason: "Highest AOV at $4,120. Premium service seekers." },
  { segment: "Corporate Relocation", percentage: 4, conversions: 54, aov: 8900, device: "Desktop 91%", converting: true, reason: "$8,900 AOV — highest value per customer." },
  { segment: "First-time Movers 18-24", percentage: 12, conversions: 156, aov: 1450, device: "Mobile 89%", converting: false, reason: "Lowest AOV ($1,450), highest bounce rate (72%)." },
];

const SEO_SCORES = [
  { label: "Performance", score: 87 },
  { label: "Accessibility", score: 92 },
  { label: "Best Practices", score: 85 },
  { label: "SEO", score: 94 },
];

const PLATFORM_ROAS = [
  { platform: "Google Search", roas: 4.2, spend: 12450, converting: true, reason: "Best ROAS at 4.2x. Primary revenue driver." },
  { platform: "Meta (FB/IG)", roas: 3.1, spend: 6780, converting: true, reason: "Strong for awareness + retargeting." },
  { platform: "Microsoft Ads", roas: 3.4, spend: 2340, converting: true, reason: "Underutilized channel with strong ROAS." },
  { platform: "Google Display", roas: 2.8, spend: 4230, converting: false, reason: "Below 3x ROAS threshold. Consider reducing." },
  { platform: "TikTok Ads", roas: 1.9, spend: 3100, converting: false, reason: "1.9x ROAS — losing money after overhead." },
];

const FUNNEL_DATA = [
  { stage: "Landing Views", count: 28450, rate: 100 },
  { stage: "Quote Started", count: 8234, rate: 28.9 },
  { stage: "Quote Completed", count: 2847, rate: 10.0 },
  { stage: "Booking Made", count: 847, rate: 3.0 },
];

const AB_TESTS = [
  { name: "Homepage Hero CTA", winner: "Variant A", lift: "+24.6%", confidence: 94 },
  { name: "Quote Form Layout", winner: "Multi Step", lift: "+29.0%", confidence: 89 },
  { name: "Pricing Display", winner: "Starting At", lift: "+28.4%", confidence: 98 },
];

const ALERTS = [
  { type: "positive", message: "NYC conv rate 8.1% — recommend 25% budget increase" },
  { type: "warning", message: "TikTok ROAS dropped below 2x — consider pausing" },
  { type: "positive", message: "'ai moving estimate' CPA dropped 34% this week" },
];

// ── Types ───────────────────────────────────────────────────────────────
interface AnalyticsBuilderPanelProps {
  mode: "manual" | "auto";
  onBuild: (selections: BuildSelections) => void;
  onCancel: () => void;
}

export interface BuildSelections {
  keywords: string[];
  locations: string[];
  demographics: string[];
  platforms: string[];
  template: string;
}

// ── Component ───────────────────────────────────────────────────────────
export function AnalyticsBuilderPanel({ mode, onBuild, onCancel }: AnalyticsBuilderPanelProps) {
  const convertingKeywords = KEYWORDS.filter(k => k.converting);
  const nonConvertingKeywords = KEYWORDS.filter(k => !k.converting);
  const convertingGeo = GEO_DATA.filter(g => g.converting);
  const nonConvertingGeo = GEO_DATA.filter(g => !g.converting);
  const convertingDemo = DEMOGRAPHICS.filter(d => d.converting);
  const nonConvertingDemo = DEMOGRAPHICS.filter(d => !d.converting);
  const convertingPlatforms = PLATFORM_ROAS.filter(p => p.converting);
  const nonConvertingPlatforms = PLATFORM_ROAS.filter(p => !p.converting);

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    mode === "auto" ? convertingKeywords.map(k => k.keyword) : []
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    mode === "auto" ? convertingGeo.map(g => `${g.city}, ${g.state}`) : []
  );
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>(
    mode === "auto" ? convertingDemo.map(d => d.segment) : []
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    mode === "auto" ? convertingPlatforms.map(p => p.platform) : []
  );
  const [showNonConverting, setShowNonConverting] = useState(false);
  const [showNonConvertingKeywords, setShowNonConvertingKeywords] = useState(false);
  const [showNonConvertingGeo, setShowNonConvertingGeo] = useState(false);
  const [showNonConvertingDemo, setShowNonConvertingDemo] = useState(false);
  const [showNonConvertingPlatforms, setShowNonConvertingPlatforms] = useState(false);

  const toggle = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const totalSelected = selectedKeywords.length + selectedLocations.length + selectedDemographics.length + selectedPlatforms.length;

  const handleBuild = () => {
    const template = selectedKeywords.some(k => k.includes("calculator")) ? "calculator"
      : selectedLocations.length > 0 && selectedLocations.length <= 2 ? "local-seo"
      : "quote-funnel";
    onBuild({ keywords: selectedKeywords, locations: selectedLocations, demographics: selectedDemographics, platforms: selectedPlatforms, template });
  };

  // ── Auto mode: compact summary view ──────────────────────────────────
  if (mode === "auto") {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-500/20">
            <Rocket className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">AI Auto-Build</span>
          </div>
          <h2 className="text-lg font-bold text-foreground">Here's What We'll Build</h2>
          <p className="text-xs text-muted-foreground">AI analyzed your data and picked the highest-performing configuration.</p>
        </div>

        {/* KPI Strip - compact */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Spend", value: "$25.8K", color: "text-sky-500" },
            { label: "Conv.", value: "1,694", color: "text-pink-500" },
            { label: "CPA", value: "$15.23", color: "text-amber-500" },
            { label: "ROAS", value: "3.5x", color: "text-cyan-500" },
          ].map(s => (
            <div key={s.label} className="p-2 rounded-lg bg-muted/50 border border-border/50 text-center">
              <p className={cn("text-sm font-bold", s.color)}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Compact selected summary */}
        <Card className="border-border">
          <CardContent className="p-4 space-y-3">
            {/* Keywords */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Hash className="w-3.5 h-3.5 text-amber-500" />
                Keywords
                <Badge variant="outline" className="text-[9px] h-4 ml-auto">{convertingKeywords.length} selected</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {convertingKeywords.map(kw => (
                  <div key={kw.keyword} className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/5 border border-primary/20 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-foreground font-medium">{kw.keyword}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-primary">{kw.ctr}% CTR</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">${kw.cpa}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Locations
                <Badge variant="outline" className="text-[9px] h-4 ml-auto">{convertingGeo.length} selected</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {convertingGeo.map(loc => (
                  <div key={loc.city} className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/5 border border-primary/20 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-foreground font-medium">{loc.city}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-primary">{loc.rate}%</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">${(loc.revenue / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audiences */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                Audiences
                <Badge variant="outline" className="text-[9px] h-4 ml-auto">{convertingDemo.length} selected</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {convertingDemo.map(d => (
                  <div key={d.segment} className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/5 border border-primary/20 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-foreground font-medium">{d.segment}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-primary">${d.aov} AOV</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
                Platforms
                <Badge variant="outline" className="text-[9px] h-4 ml-auto">{convertingPlatforms.length} selected</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {convertingPlatforms.map(p => (
                  <div key={p.platform} className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/5 border border-primary/20 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-foreground font-medium">{p.platform}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-primary">{p.roas}x</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Reasoning */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" /> Why These Options
          </div>
          {ALERTS.map((alert, i) => (
            <div key={i} className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] border",
              alert.type === "positive" ? "bg-primary/5 border-primary/20 text-primary" : "bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400"
            )}>
              {alert.type === "positive" ? <TrendingUp className="w-3 h-3 shrink-0" /> : <AlertTriangle className="w-3 h-3 shrink-0" />}
              <span>{alert.message}</span>
            </div>
          ))}
        </div>

        {/* Non-converting collapsed */}
        <Collapsible open={showNonConverting} onOpenChange={setShowNonConverting}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full justify-center py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-dashed border-border hover:border-foreground/30">
            {showNonConverting ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showNonConverting ? "Hide Non-Converting" : "Show Non-Converting"}
            <Badge variant="outline" className="text-[9px] h-4 text-muted-foreground">
              {nonConvertingKeywords.length + nonConvertingGeo.length + nonConvertingDemo.length + nonConvertingPlatforms.length}
            </Badge>
            <ChevronDown className={cn("w-3 h-3 transition-transform", showNonConverting && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="p-3 rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 space-y-1.5">
              {[...nonConvertingKeywords.map(k => ({ label: k.keyword, stat: `$${k.cpa} CPA`, reason: k.reason })),
                ...nonConvertingGeo.map(g => ({ label: `${g.city}, ${g.state}`, stat: `${g.rate}%`, reason: g.reason })),
                ...nonConvertingDemo.map(d => ({ label: d.segment, stat: `$${d.aov} AOV`, reason: d.reason })),
                ...nonConvertingPlatforms.map(p => ({ label: p.platform, stat: `${p.roas}x ROAS`, reason: p.reason })),
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="font-medium">{item.label}</span>
                  <span className="text-amber-600 dark:text-amber-400">{item.stat}</span>
                  <span className="hidden sm:inline text-muted-foreground/70">— {item.reason}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Build button */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
            ← Back
          </Button>
          <Button
            onClick={handleBuild}
            className="flex-1 gap-2 h-11 shadow-lg shadow-primary/20 text-sm"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #A855F7 50%, #EC4899 100%)" }}
          >
            <Rocket className="w-4 h-4" />
            Build It Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Manual mode: full interactive grid ──────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-gradient-to-r from-sky-500/10 to-blue-500/10 border-sky-500/20">
          <Layout className="w-4 h-4 text-sky-500" />
          <span className="text-sm font-medium text-sky-600 dark:text-sky-400">Build Manual</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Select Your Optimization Data</h2>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto">
          Choose keywords, locations, audiences, and platforms. We'll build a page optimized for your selections.
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Spend", value: "$25.8K", icon: DollarSign, color: "text-sky-500" },
          { label: "Conversions", value: "1,694", icon: Target, color: "text-pink-500" },
          { label: "Avg CPA", value: "$15.23", icon: Percent, color: "text-amber-500" },
          { label: "ROAS", value: "3.5x", icon: TrendingUp, color: "text-cyan-500" },
        ].map(s => (
          <div key={s.label} className="p-2 rounded-lg bg-muted/50 border border-border/50 text-center">
            <s.icon className={cn("w-4 h-4 mx-auto mb-1", s.color)} />
            <p className={cn("text-sm font-bold", s.color)}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
          {/* ── Keywords ─────────────────────────────────────── */}
          <Card className="border-border">
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-amber-500" />
                  Keywords
                </CardTitle>
                <Badge variant="outline" className="text-[9px] h-4 gap-1 border-primary/50 text-primary">
                  {selectedKeywords.length} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {convertingKeywords.map(kw => (
                <SelectableRow
                  key={kw.keyword}
                  selected={selectedKeywords.includes(kw.keyword)}
                  onToggle={() => toggle(selectedKeywords, kw.keyword, setSelectedKeywords)}
                  label={kw.keyword}
                  badge={`${kw.ctr}% CTR`}
                  secondBadge={`$${kw.cpa} CPA`}
                  trend={kw.trend}
                />
              ))}
              {nonConvertingKeywords.length > 0 && (
                <Collapsible open={showNonConvertingKeywords} onOpenChange={setShowNonConvertingKeywords}>
                  <CollapsibleTrigger className="flex items-center gap-1.5 w-full justify-center py-1.5 mt-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded border border-dashed border-border hover:border-foreground/30">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    {showNonConvertingKeywords ? "Hide" : "Show"} {nonConvertingKeywords.length} non-converting
                    <ChevronDown className={cn("w-3 h-3 transition-transform", showNonConvertingKeywords && "rotate-180")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1">
                    {nonConvertingKeywords.map(kw => (
                      <SelectableRow
                        key={kw.keyword}
                        selected={selectedKeywords.includes(kw.keyword)}
                        onToggle={() => toggle(selectedKeywords, kw.keyword, setSelectedKeywords)}
                        label={kw.keyword}
                        badge={`$${kw.cpa} CPA`}
                        trend={kw.trend}
                        reason={kw.reason}
                        dimmed
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>

          {/* ── Locations ────────────────────────────────────── */}
          <Card className="border-border">
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Geographic Targets
                </CardTitle>
                <Badge variant="outline" className="text-[9px] h-4 gap-1 border-primary/50 text-primary">
                  {selectedLocations.length} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {convertingGeo.map(loc => {
                const locStr = `${loc.city}, ${loc.state}`;
                return (
                  <SelectableRow
                    key={locStr}
                    selected={selectedLocations.includes(locStr)}
                    onToggle={() => toggle(selectedLocations, locStr, setSelectedLocations)}
                    label={loc.city}
                    sublabel={loc.state}
                    badge={`${loc.rate}% conv`}
                    secondBadge={`$${(loc.revenue / 1000).toFixed(0)}K rev`}
                  />
                );
              })}
              {nonConvertingGeo.length > 0 && (
                <Collapsible open={showNonConvertingGeo} onOpenChange={setShowNonConvertingGeo}>
                  <CollapsibleTrigger className="flex items-center gap-1.5 w-full justify-center py-1.5 mt-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded border border-dashed border-border hover:border-foreground/30">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    {showNonConvertingGeo ? "Hide" : "Show"} {nonConvertingGeo.length} non-converting
                    <ChevronDown className={cn("w-3 h-3 transition-transform", showNonConvertingGeo && "rotate-180")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1">
                    {nonConvertingGeo.map(loc => {
                      const locStr = `${loc.city}, ${loc.state}`;
                      return (
                        <SelectableRow
                          key={locStr}
                          selected={selectedLocations.includes(locStr)}
                          onToggle={() => toggle(selectedLocations, locStr, setSelectedLocations)}
                          label={loc.city}
                          sublabel={loc.state}
                          badge={`${loc.rate}% conv`}
                          reason={loc.reason}
                          dimmed
                        />
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>

          {/* ── Demographics ─────────────────────────────────── */}
          <Card className="border-border">
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  Audience Segments
                </CardTitle>
                <Badge variant="outline" className="text-[9px] h-4 gap-1 border-primary/50 text-primary">
                  {selectedDemographics.length} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {convertingDemo.map(demo => (
                <SelectableRow
                  key={demo.segment}
                  selected={selectedDemographics.includes(demo.segment)}
                  onToggle={() => toggle(selectedDemographics, demo.segment, setSelectedDemographics)}
                  label={demo.segment}
                  badge={`$${demo.aov} AOV`}
                  secondBadge={demo.device}
                  icon={demo.device.includes("Mobile") ? <Smartphone className="w-3 h-3 text-muted-foreground" /> : <Monitor className="w-3 h-3 text-muted-foreground" />}
                />
              ))}
              {nonConvertingDemo.length > 0 && (
                <Collapsible open={showNonConvertingDemo} onOpenChange={setShowNonConvertingDemo}>
                  <CollapsibleTrigger className="flex items-center gap-1.5 w-full justify-center py-1.5 mt-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded border border-dashed border-border hover:border-foreground/30">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    {showNonConvertingDemo ? "Hide" : "Show"} {nonConvertingDemo.length} non-converting
                    <ChevronDown className={cn("w-3 h-3 transition-transform", showNonConvertingDemo && "rotate-180")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1">
                    {nonConvertingDemo.map(d => (
                      <SelectableRow
                        key={d.segment}
                        selected={selectedDemographics.includes(d.segment)}
                        onToggle={() => toggle(selectedDemographics, d.segment, setSelectedDemographics)}
                        label={d.segment}
                        badge={`$${d.aov} AOV`}
                        reason={d.reason}
                        dimmed
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>

          {/* ── Platform ROAS ────────────────────────────────── */}
          <Card className="border-border">
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
                  Platform ROAS
                </CardTitle>
                <Badge variant="outline" className="text-[9px] h-4 gap-1 border-primary/50 text-primary">
                  {selectedPlatforms.length} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {convertingPlatforms.map(p => (
                <SelectableRow
                  key={p.platform}
                  selected={selectedPlatforms.includes(p.platform)}
                  onToggle={() => toggle(selectedPlatforms, p.platform, setSelectedPlatforms)}
                  label={p.platform}
                  badge={`${p.roas}x ROAS`}
                  secondBadge={`$${(p.spend / 1000).toFixed(1)}K`}
                  badgeVariant={p.roas >= 3.5 ? "default" : "secondary"}
                />
              ))}
              {nonConvertingPlatforms.length > 0 && (
                <Collapsible open={showNonConvertingPlatforms} onOpenChange={setShowNonConvertingPlatforms}>
                  <CollapsibleTrigger className="flex items-center gap-1.5 w-full justify-center py-1.5 mt-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded border border-dashed border-border hover:border-foreground/30">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    {showNonConvertingPlatforms ? "Hide" : "Show"} {nonConvertingPlatforms.length} non-converting
                    <ChevronDown className={cn("w-3 h-3 transition-transform", showNonConvertingPlatforms && "rotate-180")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1">
                    {nonConvertingPlatforms.map(p => (
                      <SelectableRow
                        key={p.platform}
                        selected={selectedPlatforms.includes(p.platform)}
                        onToggle={() => toggle(selectedPlatforms, p.platform, setSelectedPlatforms)}
                        label={p.platform}
                        badge={`${p.roas}x ROAS`}
                        reason={p.reason}
                        dimmed
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>

          {/* ── SEO + A/B Tests ──────────────────────────────── */}
          <Card className="border-border">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                SEO & A/B Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div className="space-y-1.5">
                {SEO_SCORES.map(s => (
                  <div key={s.label} className="space-y-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium text-foreground">{s.score}</span>
                    </div>
                    <Progress value={s.score} className="h-1" />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <FlaskConical className="w-3 h-3" /> A/B Test Wins
                </div>
                {AB_TESTS.map(t => (
                  <div key={t.name} className="flex items-center justify-between text-xs py-1">
                    <span className="text-muted-foreground">{t.name}</span>
                    <span className="text-primary font-medium">{t.lift}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Conversion Funnel ────────────────────────────── */}
          <Card className="border-border">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-2">
              {FUNNEL_DATA.map((stage, i) => (
                <div key={stage.stage} className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{stage.stage}</span>
                    <span className="font-medium">{stage.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${stage.rate}%`,
                        background: "hsl(var(--primary))",
                        opacity: 1 - i * 0.15,
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-violet-500" /> AI Recommendations
                </div>
                <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary">
                  <span className="font-bold">↑</span> Increase NYC budget 25% (8.1% conv rate)
                </div>
                <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                  <span className="font-bold">→</span> Shift TikTok spend to Google (1.9x vs 4.2x ROAS)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Build Action Bar */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-fuchsia-500/5 to-pink-500/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-pink-500/5" />
        <CardContent className="p-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {totalSelected} data points selected
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1"><Hash className="w-3 h-3 text-amber-500" /> {selectedKeywords.length} keywords</span>
                <span className="text-muted-foreground/50">•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-rose-500" /> {selectedLocations.length} locations</span>
                <span className="text-muted-foreground/50">•</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-indigo-500" /> {selectedDemographics.length} audiences</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
              ← Back
            </Button>
            <Button
              onClick={handleBuild}
              disabled={totalSelected === 0}
              className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #A855F7 50%, #EC4899 100%)" }}
            >
              <Sparkles className="w-4 h-4" />
              Generate Page
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Selectable Row Sub-Component ────────────────────────────────────────
function SelectableRow({
  selected,
  onToggle,
  label,
  sublabel,
  badge,
  secondBadge,
  trend,
  reason,
  icon,
  badgeVariant = "outline",
  dimmed = false,
}: {
  selected: boolean;
  onToggle: () => void;
  label: string;
  sublabel?: string;
  badge: string;
  secondBadge?: string;
  trend?: "up" | "down" | "stable";
  reason?: string;
  icon?: React.ReactNode;
  badgeVariant?: "default" | "outline" | "secondary";
  dimmed?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border transition-all cursor-pointer",
        selected ? "border-primary/50 bg-primary/5" : "border-transparent hover:bg-muted/50",
        dimmed && !selected && "opacity-60"
      )}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between py-1.5 px-2">
        <div className="flex items-center gap-2 min-w-0">
          <Checkbox checked={selected} className="pointer-events-none h-3.5 w-3.5" />
          <span className={cn("text-xs font-medium truncate", selected && "text-primary")}>{label}</span>
          {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
          {icon}
          {trend === "up" && <TrendingUp className="w-3 h-3 text-primary shrink-0" />}
          {trend === "down" && <TrendingDown className="w-3 h-3 text-destructive shrink-0" />}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant={badgeVariant as any} className="text-[9px] h-4">{badge}</Badge>
          {secondBadge && (
            <Badge className="text-[9px] h-4 bg-primary/10 text-primary border-0">{secondBadge}</Badge>
          )}
        </div>
      </div>
      {reason && (
        <div className="px-2 pb-1.5">
          <p className="text-[10px] text-muted-foreground flex items-start gap-1">
            <Sparkles className="w-2.5 h-2.5 shrink-0 mt-0.5 text-primary" />
            {reason}
          </p>
        </div>
      )}
    </div>
  );
}
