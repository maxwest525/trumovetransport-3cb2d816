import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { cn } from "@/lib/utils";
import {
  Rocket, ChevronRight, Check, Phone, FileText, Eye, Target,
  Globe, MapPin, DollarSign, Tag, FileCheck, Megaphone,
  HelpCircle, ArrowLeft, ArrowRight, Sparkles, Zap, Star,
  Clock, Shield, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, BarChart3, ToggleLeft, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { id: "goal", label: "Goal", icon: Target },
  { id: "platform", label: "Platforms", icon: Globe },
  { id: "geo", label: "Geography", icon: MapPin },
  { id: "budget", label: "Budget", icon: DollarSign },
  { id: "keywords", label: "Keywords", icon: Tag },
  { id: "landing", label: "Landing Page", icon: FileText },
  { id: "review", label: "Review & Launch", icon: FileCheck },
];

const GOALS = [
  { id: "calls", label: "Phone Calls", desc: "Drive inbound calls from people searching for long-distance movers. Calls are attributed, then routed to Convoso for instant follow-up.", icon: Phone, recommended: true, tag: "Start here first" },
  { id: "forms", label: "Quote Forms", desc: "Capture lead details through a landing page form. Feeds into your instant-call workflow.", icon: FileText, recommended: true, tag: "Best for interstate movers" },
  { id: "retargeting", label: "Retargeting", desc: "Re-show ads to site visitors who didn't convert. Add after you have traffic flowing.", icon: Megaphone, recommended: false, tag: "Good for retargeting" },
  { id: "estimates", label: "Booked Estimates", desc: "Optimize for full booking completions. Requires a working funnel first.", icon: Target, recommended: false, tag: "Optional later" },
  { id: "awareness", label: "Brand Awareness", desc: "Increase visibility. Only useful when paired with other goals.", icon: Eye, recommended: false, tag: "Optional later" },
];

const PRESETS = [
  {
    id: "google_starter",
    name: "Google Search Only Starter",
    desc: "Get calls from people actively searching for long-distance movers. Start here if you have never run ads.",
    platforms: ["google_search"],
    difficulty: "Easy",
    speed: "Launch in 1 day",
    tag: "Start here first",
    recommended: true,
  },
  {
    id: "core_stack",
    name: "Google + Meta Core Stack",
    desc: "Capture high-intent search traffic on Google and build awareness on Meta. The standard setup for interstate moving lead gen.",
    platforms: ["google_search", "meta_fb"],
    difficulty: "Moderate",
    speed: "Launch in 2-3 days",
    tag: "Best for interstate movers",
    recommended: true,
  },
  {
    id: "retargeting_addon",
    name: "Retargeting Add-On",
    desc: "Re-engage visitors who left without converting. Only works after you have traffic from Google or Meta.",
    platforms: ["google_display", "meta_fb"],
    difficulty: "Easy",
    speed: "Launch in 1 day",
    tag: "Good for retargeting",
    recommended: false,
  },
];

const PLATFORMS = [
  { id: "google_search", label: "Google Search", desc: "Ads shown when people search for long-distance movers. Highest intent.", tag: "Highest intent", tier: "primary", difficulty: "Easy", pros: "Highest intent, proven ROI", cons: "Competitive CPCs in large metros" },
  { id: "meta_fb", label: "Facebook / Instagram", desc: "Visual ads targeting people likely to move long-distance. Great for awareness and retargeting.", tag: "Best reach", tier: "primary", difficulty: "Moderate", pros: "Low CPL, visual creative, retargeting", cons: "Lower intent than search" },
  { id: "google_pmax", label: "Performance Max", desc: "Google's AI-optimized campaign across Search, Display, YouTube, Maps.", tag: "AI Powered", tier: "secondary", difficulty: "Moderate", pros: "Broad reach, automated", cons: "Less control, needs data" },
  { id: "google_display", label: "Google Display", desc: "Banner ads for retargeting. Not for cold traffic.", tag: "Retargeting only", tier: "secondary", difficulty: "Easy", pros: "Very low CPC", cons: "Low intent cold" },
];

const GEO_MODES = [
  { id: "metro_origin", label: "Metro Origin Targeting", desc: "Target metro areas where people are moving FROM. This is how interstate movers generate leads in origin markets.", recommended: true, tag: "Best for interstate" },
  { id: "city_clusters", label: "City Clusters", desc: "Target specific cities or zip codes. Good for testing individual origin markets before scaling.", recommended: true, tag: "Test and learn" },
  { id: "state", label: "State / Multi-State", desc: "Target full states you are licensed to serve. Best for broad interstate coverage.", recommended: false, tag: "Broad reach" },
  { id: "local_radius", label: "Local Radius", desc: "Radius around a warehouse or office. Use this to target a specific metro origin market, not for local moves.", recommended: false, tag: "Focused origin area" },
];

const BUDGET_TIERS = [
  { id: "conservative", label: "Conservative", daily: 30, monthly: 900, leads: "1-3/day", desc: "Safe starting point. Enough to test keywords and get initial data.", tag: "Test first", color: "text-blue-500" },
  { id: "growth", label: "Growth", daily: 75, monthly: 2250, leads: "3-6/day", desc: "Compete in most markets. Good balance of cost and lead volume.", tag: "Best for interstate movers", color: "text-emerald-500" },
  { id: "aggressive", label: "Aggressive", daily: 150, monthly: 4500, leads: "6-12/day", desc: "Dominate your markets. Best with proven routing, pages, and team.", tag: "Scale mode", color: "text-amber-500" },
];

const KEYWORD_BUCKETS = [
  { bucket: "Long Distance / Interstate", keywords: ["long distance movers", "interstate moving company", "cross country movers"], volume: "18K/mo", competition: "High", recommended: true, note: "Your primary keyword group. Highest-value leads for interstate moves.", bestFor: "Google Search" },
  { bucket: "State-to-State Routes", keywords: ["movers from FL to NY", "California to Texas moving", "east coast movers"], volume: "12K/mo", competition: "Medium", recommended: true, note: "Route-specific searches. High intent, good for landing page matching.", bestFor: "Google Search" },
  { bucket: "Full Service / Packing", keywords: ["full service moving", "packing and moving", "white glove movers"], volume: "8K/mo", competition: "Medium", recommended: true, note: "Attracts higher-value customers willing to pay for full service.", bestFor: "Google Search" },
  { bucket: "Origin Metro Searches", keywords: ["movers near me", "moving company [city]", "best movers in [metro]"], volume: "22K/mo", competition: "High", note: "Broad metro-level searches. Many are local-move intent, so landing page must qualify for long-distance.", bestFor: "Google Search", recommended: false },
  { bucket: "Urgent / Last Minute", keywords: ["last minute movers", "same day moving", "emergency movers"], volume: "5K/mo", competition: "Low", note: "Niche. Good conversion when you can fulfill, but lower volume.", bestFor: "Google Search", recommended: false },
  { bucket: "Specialty", keywords: ["piano movers long distance", "antique movers", "gun safe shipping"], volume: "3K/mo", competition: "Low", note: "Low volume, narrow audience. Optional unless you specialize.", bestFor: "Niche", recommended: false },
  { bucket: "Auto Transport", keywords: ["car shipping with move", "auto transport interstate"], volume: "4K/mo", competition: "Medium", note: "Only relevant if you offer vehicle shipping as an add-on.", bestFor: "Niche", recommended: false },
];

const LANDING_PAGES = [
  { id: "longdist", name: "Long-Distance Movers LP", conv: "7.8%", status: "live", bestFor: "Best for Google Search", tier: "primary", reason: "Optimized for interstate moving searches. Shows licensing, insurance, route coverage, and a fast quote form. Your highest-converting page for paid search.", sections: "Hero, Trust Strip, Route Map, Reviews, Quote Form, Sticky CTA" },
  { id: "quote", name: "Free Quote LP", conv: "6.8%", status: "live", bestFor: "Best for higher quote quality", tier: "primary", reason: "Multi-step form captures origin, destination, move size, and date. Produces higher-quality leads with more detail for accurate quoting.", sections: "Hero, Price Preview, Trust Badges, Multi-Step Form, FAQ" },
  { id: "meta", name: "Social Traffic LP", conv: "7.1%", status: "live", bestFor: "Best for Meta", tier: "primary", reason: "Shorter page for social traffic. Visual, fast-loading, strong CTA above fold. Use for all Facebook and Instagram campaigns.", sections: "Visual Hero, Offer Strip, 3-Step Process, Reviews, Sticky Form" },
  { id: "call_first", name: "Call-First LP", conv: "9.2%", status: "live", bestFor: "Best for urgent leads", tier: "secondary", reason: "Minimal page with a prominent click-to-call button. Best for high-urgency searches and mobile traffic.", sections: "Hero with Phone CTA, Trust Strip, Reviews, Hours" },
  { id: "new", name: "+ Create New Landing Page", conv: "", status: "new", bestFor: "", tier: "secondary", reason: "", sections: "" },
];

export default function GrowthCampaignBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>(["Long Distance / Interstate", "State-to-State Routes", "Full Service / Packing"]);
  const [budget, setBudget] = useState(75);
  const [budgetTier, setBudgetTier] = useState("growth");
  const [selectedPage, setSelectedPage] = useState<string | null>("longdist");
  const [geoRadius, setGeoRadius] = useState(25);
  const [geoMode, setGeoMode] = useState("metro_origin");

  const currentStep = STEPS[step];

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const toggleBucket = (name: string) => {
    setSelectedBuckets(prev => prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name]);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setSelectedPlatforms(preset.platforms);
  };

  const selectBudgetTier = (tier: typeof BUDGET_TIERS[0]) => {
    setBudgetTier(tier.id);
    setBudget(tier.daily);
  };

  const canNext = () => {
    if (step === 0) return !!selectedGoal;
    if (step === 1) return selectedPlatforms.length > 0;
    if (step === 4) return selectedBuckets.length > 0;
    if (step === 5) return !!selectedPage;
    return true;
  };

  const HELPER_TEXT: Record<number, string> = {
    0: "What should your ads achieve? Phone Calls and Quote Forms work best for interstate movers because leads route instantly to Convoso.",
    1: "Where should your ads run? Google Search is the best starting point. Pick a preset or select individually.",
    2: "Define your origin markets. Target metro areas where customers are moving FROM to generate long-distance leads.",
    3: "Set your daily budget. Start conservative, test, then scale winners. Budget alone won't fix bad targeting or weak pages.",
    4: "Pick keyword themes. These are the search terms people use when looking for long-distance movers.",
    5: "Pick the page visitors see after clicking your ad. A dedicated landing page converts 2-3x better than your homepage.",
    6: "Review everything. Make sure routing is ready so leads reach Convoso within seconds.",
  };

  const readinessChecks = [
    { label: "Tracking ready", ready: true, detail: "Google Ads + GA4 conversion events configured" },
    { label: "Landing page assigned", ready: !!selectedPage && selectedPage !== "new", detail: selectedPage ? LANDING_PAGES.find(p => p.id === selectedPage)?.name || "Not set" : "Not set" },
    { label: "Convoso routing connected", ready: true, detail: "Webhook configured for instant call queue" },
    { label: "CRM sync configured", ready: true, detail: "Leads sync to your system of record" },
    { label: "Backup follow-up configured", ready: false, detail: "Set up SMS recovery and escalation in Automation Center" },
  ];

  return (
    <GrowthEngineShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaign Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Launch a new interstate moving lead campaign step by step.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => i <= step && setStep(i)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap",
                  i === step ? "bg-primary text-primary-foreground" :
                  i < step ? "bg-primary/10 text-primary" :
                  "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                {s.label}
                {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground ml-1" />}
              </button>
            );
          })}
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          {/* Helper panel */}
          <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-[12px] text-muted-foreground">{HELPER_TEXT[step]}</p>
          </div>

          {/* GOAL SELECTION */}
          {step === 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">What is the main goal?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOALS.map(goal => {
                  const Icon = goal.icon;
                  return (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.id)}
                      className={cn(
                        "text-left p-4 rounded-xl border-2 transition-all",
                        selectedGoal === goal.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">{goal.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {goal.recommended && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">RECOMMENDED</span>
                        )}
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                          goal.tag === "Start here first" ? "bg-primary/10 text-primary" :
                          goal.tag === "Best for interstate movers" ? "bg-emerald-500/10 text-emerald-600" :
                          "bg-muted text-muted-foreground"
                        )}>{goal.tag}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground">{goal.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PLATFORM SELECTION */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Where should your ads run?</h2>

              {/* Presets */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Start Presets</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={cn(
                        "text-left p-4 rounded-xl border-2 transition-all",
                        JSON.stringify(selectedPlatforms.sort()) === JSON.stringify(preset.platforms.sort())
                          ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[12px] font-semibold text-foreground">{preset.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                          preset.recommended ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                        )}>{preset.tag}</span>
                        <span className="text-[9px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">{preset.difficulty}</span>
                        <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-bold">{preset.speed}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual platforms */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Or select individually</div>
                <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 mt-3">Primary (Recommended)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {PLATFORMS.filter(p => p.tier === "primary").map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={cn(
                        "text-left p-4 rounded-xl border-2 transition-all",
                        selectedPlatforms.includes(p.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
                        "ring-1 ring-primary/10"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">{p.label}</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">{p.tag}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mb-2">{p.desc}</p>
                      <div className="text-[10px] text-emerald-600">+ {p.pros}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">- {p.cons}</div>
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Other Channels (Optional Later)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PLATFORMS.filter(p => p.tier === "secondary").map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={cn(
                        "text-left p-3 rounded-xl border-2 transition-all opacity-70",
                        selectedPlatforms.includes(p.id) ? "border-primary bg-primary/5 opacity-100" : "border-border/60 hover:border-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-foreground">{p.label}</span>
                        {p.tag && <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-bold">{p.tag}</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GEOGRAPHY */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Where are your origin markets?</h2>
              <p className="text-[12px] text-muted-foreground">Target the metro areas where customers are moving FROM. You generate long-distance leads by advertising in origin markets.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GEO_MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setGeoMode(mode.id)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all",
                      geoMode === mode.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-foreground">{mode.label}</span>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                        mode.recommended ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                      )}>{mode.tag}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{mode.desc}</p>
                  </button>
                ))}
              </div>

              {geoMode === "metro_origin" && (
                <div className="bg-muted/30 rounded-xl p-5">
                  <p className="text-[12px] text-muted-foreground">Select the metro areas you want to target as origin markets (e.g., Miami, Dallas, Chicago). People in these areas searching for long-distance movers will see your ads.</p>
                  <div className="mt-3 bg-muted/50 rounded-lg p-4 text-center text-[12px] text-muted-foreground">Metro area selector would appear here</div>
                </div>
              )}

              {geoMode === "local_radius" && (
                <div className="bg-muted/30 rounded-xl p-5 space-y-3">
                  <label className="text-[12px] font-medium text-foreground">Origin Market Radius</label>
                  <input
                    type="range" min={5} max={100} value={geoRadius}
                    onChange={e => setGeoRadius(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="text-sm font-semibold text-foreground">{geoRadius} miles around your target metro</div>
                  <div className="bg-muted/50 rounded-xl p-6 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-[12px] text-muted-foreground">Map preview: {geoRadius}-mile radius</p>
                    </div>
                  </div>
                </div>
              )}

              {geoMode === "city_clusters" && (
                <div className="bg-muted/30 rounded-xl p-5">
                  <p className="text-[12px] text-muted-foreground">Enter cities or zip codes in your target origin markets. Good for testing specific metros before scaling.</p>
                  <div className="mt-3 bg-muted/50 rounded-lg p-4 text-center text-[12px] text-muted-foreground">City/zip input would appear here</div>
                </div>
              )}

              {geoMode === "state" && (
                <div className="bg-muted/30 rounded-xl p-5">
                  <p className="text-[12px] text-muted-foreground">Select states to target as origin markets. Best for broad interstate coverage when you serve many routes.</p>
                  <div className="mt-3 bg-muted/50 rounded-lg p-4 text-center text-[12px] text-muted-foreground">State selection map would appear here</div>
                </div>
              )}

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg px-4 py-3 flex items-start gap-3">
                <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-[11px] text-muted-foreground">
                  <strong className="text-foreground">Tip:</strong> Start with 2-3 metro origin markets. Test which convert best, then scale winners and turn off weak areas.
                </div>
              </div>
            </div>
          )}

          {/* BUDGET */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Daily ad budget</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUDGET_TIERS.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => selectBudgetTier(tier)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all",
                      budgetTier === tier.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-lg font-bold", tier.color)}>${tier.daily}</span>
                      <span className="text-[11px] text-muted-foreground">/day</span>
                    </div>
                    <div className="flex gap-1.5 mb-2">
                      <span className="text-[12px] font-semibold text-foreground">{tier.label}</span>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                        tier.tag === "Best for interstate movers" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                      )}>{tier.tag}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">{tier.desc}</p>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-foreground font-medium">Est. {tier.leads} leads</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">${tier.monthly.toLocaleString()}/month</div>
                  </button>
                ))}
              </div>

              {/* Custom slider */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Or set custom budget</div>
                <input
                  type="range" min={10} max={500} step={5} value={budget}
                  onChange={e => { setBudget(Number(e.target.value)); setBudgetTier(""); }}
                  className="w-full accent-primary"
                />
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">${budget}</div>
                    <div className="text-[11px] text-muted-foreground">Per Day</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">${(budget * 30).toLocaleString()}</div>
                    <div className="text-[11px] text-muted-foreground">Monthly</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-500">~{Math.max(1, Math.round(budget / 25))}</div>
                    <div className="text-[11px] text-muted-foreground">Est. Daily Leads</div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg px-4 py-3 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  <strong className="text-foreground">Important:</strong> Lead costs vary by market, season, and competition ($15-$80+). Start smaller, test, and scale what works.
                </p>
              </div>
            </div>
          )}

          {/* KEYWORDS */}
          {step === 4 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Keyword themes to target</h2>
              <div className="space-y-2">
                {KEYWORD_BUCKETS.map(b => (
                  <button
                    key={b.bucket}
                    onClick={() => toggleBucket(b.bucket)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all",
                      selectedBuckets.includes(b.bucket) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{b.bucket}</span>
                        {b.recommended && <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">RECOMMENDED</span>}
                        <span className="text-[9px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">{b.bestFor}</span>
                      </div>
                      <div className="flex gap-3 text-[11px] text-muted-foreground">
                        <span>{b.volume}</span>
                        <span>{b.competition} comp.</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{b.keywords.join(", ")}</p>
                    {b.note && <p className="text-[10px] text-muted-foreground/70 mt-1 italic">{b.note}</p>}
                  </button>
                ))}
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-3 flex items-start gap-3">
                <RefreshCw className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  <strong className="text-foreground">Test and scale:</strong> Start with recommended groups. After 2-4 weeks of data, turn off keywords that don't convert and increase budget on winners.
                </p>
              </div>
            </div>
          )}

          {/* LANDING PAGE */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Choose a landing page</h2>

              {/* Education block */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">What are these pages?</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <div>
                    <strong className="text-foreground">Landing page:</strong> A standalone page built to convert ad traffic. No navigation links. One goal: get the lead to call or fill out a form.
                  </div>
                  <div>
                    <strong className="text-foreground">Call-first page:</strong> Minimal page with a big click-to-call button. Best for mobile traffic and high-urgency searches.
                  </div>
                  <div>
                    <strong className="text-foreground">Quote form page:</strong> Multi-step form that captures move details (origin, destination, size, date). Produces higher-quality leads.
                  </div>
                  <div>
                    <strong className="text-foreground">Meta instant form:</strong> A form inside Facebook/Instagram (no landing page needed). Fast, but lower quality. Best for high-volume testing.
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic">For long-distance leads, dedicated landing pages typically convert 2-3x better than your homepage. Call-first pages convert highest on mobile.</p>
              </div>

              {/* Primary recommendations */}
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Recommended Pages</div>
              <div className="grid grid-cols-1 gap-3">
                {LANDING_PAGES.filter(p => p.tier === "primary").map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPage(p.id)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all",
                      selectedPage === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{p.name}</span>
                      {p.conv && <span className="text-[11px] text-emerald-600 font-medium">{p.conv} conv rate</span>}
                    </div>
                    <div className="flex gap-1.5 mb-2">
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                        p.bestFor.includes("Google") ? "bg-blue-500/10 text-blue-600" :
                        p.bestFor.includes("Meta") ? "bg-indigo-500/10 text-indigo-600" :
                        "bg-emerald-500/10 text-emerald-600"
                      )}>{p.bestFor}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{p.reason}</p>
                    {p.sections && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.sections.split(", ").map(s => (
                          <span key={s} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">{s}</span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-4 mb-1">Other Options</div>
              <div className="grid grid-cols-1 gap-3">
                {LANDING_PAGES.filter(p => p.tier === "secondary").map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPage(p.id)}
                    className={cn(
                      "text-left p-3 rounded-xl border-2 transition-all",
                      selectedPage === p.id ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/20",
                      p.status === "new" && "border-dashed"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-foreground">{p.name}</span>
                      {p.conv && <span className="text-[11px] text-emerald-600 font-medium">{p.conv} conv rate</span>}
                    </div>
                    {p.bestFor && <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-bold">{p.bestFor}</span>}
                    {p.reason && <p className="text-[11px] text-muted-foreground mt-1">{p.reason}</p>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* REVIEW */}
          {step === 6 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Review & Launch</h2>

              {/* Summary grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Goal</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{GOALS.find(g => g.id === selectedGoal)?.label || "Not set"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Platforms</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{selectedPlatforms.map(p => PLATFORMS.find(pl => pl.id === p)?.label).join(", ") || "None"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Origin Markets</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{GEO_MODES.find(m => m.id === geoMode)?.label}{geoMode === "local_radius" ? ` (${geoRadius} mi)` : ""}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Daily Budget</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">${budget}/day (${(budget*30).toLocaleString()}/mo)</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Keywords</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{selectedBuckets.join(", ") || "None"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Landing Page</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{LANDING_PAGES.find(p => p.id === selectedPage)?.name || "Not set"}</p>
                </div>
              </div>

              {/* Lead routing path */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Lead Routing Path</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px] font-medium text-foreground">
                  <span className="bg-muted rounded-md px-2.5 py-1.5">Ad Click</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="bg-muted rounded-md px-2.5 py-1.5">Landing Page</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="bg-muted rounded-md px-2.5 py-1.5">Form / Call</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="bg-muted rounded-md px-2.5 py-1.5">Attribution Capture</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="bg-muted rounded-md px-2.5 py-1.5">Webhook / Router</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="bg-emerald-500/10 text-emerald-600 rounded-md px-2.5 py-1.5 ring-1 ring-emerald-500/20">Convoso / CRM / Queue</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Leads are captured on your page, tagged with attribution, then routed via webhook to Convoso for instant agent contact.</p>
              </div>

              {/* Routing logic */}
              <div className="bg-card rounded-xl border border-border p-4">
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Lead Handling Rules</span>
                <div className="mt-3 space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                    <Clock className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[12px] font-semibold text-foreground">Business hours</div>
                      <p className="text-[11px] text-muted-foreground">Instant route to Convoso. First call within seconds.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                    <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[12px] font-semibold text-foreground">After hours</div>
                      <p className="text-[11px] text-muted-foreground">Queued for next calling block. Auto-text sent confirming receipt.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[12px] font-semibold text-foreground">If unreached</div>
                      <p className="text-[11px] text-muted-foreground">SMS recovery triggered. Escalation alert if no contact within threshold.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Readiness checklist */}
              <div className="bg-card rounded-xl border border-border p-4">
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Launch Readiness</span>
                <div className="mt-3 space-y-2">
                  {readinessChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {check.ready ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                      <div>
                        <span className="text-[12px] font-medium text-foreground">{check.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">{check.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evolution note */}
              <div className="bg-muted/30 border border-border/50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-foreground">This is your starting point, not your final setup</span>
                </div>
                <p className="text-[10px] text-muted-foreground">After launch, you can turn off weak keywords, remove underperforming pages, shift budget to winning markets, add new routes, and adjust routing logic based on real conversion data.</p>
              </div>

              <button
                onClick={() => {
                  navigate("/marketing/campaign-summary", {
                    state: {
                      campaign: {
                        name: `${GOALS.find(g => g.id === selectedGoal)?.label || "Interstate"} Campaign`,
                        goal: GOALS.find(g => g.id === selectedGoal)?.label || "Not set",
                        platforms: selectedPlatforms.map(p => PLATFORMS.find(pl => pl.id === p)?.label).join(", ") || "None",
                        geoMode: GEO_MODES.find(m => m.id === geoMode)?.label || "Not set",
                        budget,
                        keywords: selectedBuckets.join(", ") || "None",
                        landingPage: LANDING_PAGES.find(p => p.id === selectedPage)?.name || "Not set",
                      },
                    },
                  });
                }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                Launch Campaign
              </button>
            </div>
          )}
        </div>

        {/* Nav buttons */}
        {step < 6 && (
          <div className="flex justify-between">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(Math.min(6, step + 1))}
              disabled={!canNext()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 transition-all"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </GrowthEngineShell>
  );
}
