import { useState } from "react";
import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { cn } from "@/lib/utils";
import {
  Rocket, ChevronRight, Check, Phone, FileText, Eye, Target,
  Globe, MapPin, DollarSign, Tag, FileCheck, Megaphone,
  HelpCircle, ArrowLeft, ArrowRight, Sparkles, Zap, Star,
  Clock, Shield, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, BarChart3,
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
  { id: "calls", label: "Phone Calls", desc: "Best for beginners. Drive inbound calls from people ready to get a quote. Leads route instantly to Convoso.", icon: Phone, recommended: true, tag: "Start here first" },
  { id: "forms", label: "Quote Forms", desc: "Capture lead info through a landing page form. Feeds directly into your instant-call workflow for fastest contact.", icon: FileText, recommended: true, tag: "Best for moving companies" },
  { id: "retargeting", label: "Retargeting", desc: "Show ads to people who visited your site but didn't convert. Best added after you have traffic flowing.", icon: Megaphone, recommended: false, tag: "Good for retargeting" },
  { id: "estimates", label: "Booked Estimates", desc: "Optimize for people who complete the full booking flow. Requires a working funnel first.", icon: Target, recommended: false, tag: "Optional later" },
  { id: "awareness", label: "Brand Awareness", desc: "Get your name in front of more people. Only useful when paired with other goals.", icon: Eye, recommended: false, tag: "Optional later" },
];

const PRESETS = [
  {
    id: "google_starter",
    name: "Google Search Only Starter",
    desc: "The fastest way to get calls from people actively searching for movers. Start here if you have never run ads.",
    platforms: ["google_search"],
    difficulty: "Easy",
    speed: "Launch in 1 day",
    tag: "Start here first",
    recommended: true,
  },
  {
    id: "core_stack",
    name: "Google + Meta Core Stack",
    desc: "Capture high-intent search traffic on Google and build awareness on Facebook/Instagram. The most common setup for growing moving companies.",
    platforms: ["google_search", "meta_fb"],
    difficulty: "Moderate",
    speed: "Launch in 2-3 days",
    tag: "Best for moving companies",
    recommended: true,
  },
  {
    id: "retargeting_addon",
    name: "Retargeting Add-On",
    desc: "Re-engage visitors who left without converting. Only works if you already have traffic from Google or Meta.",
    platforms: ["google_display", "meta_fb"],
    difficulty: "Easy",
    speed: "Launch in 1 day",
    tag: "Good for retargeting",
    recommended: false,
  },
];

const PLATFORMS = [
  { id: "google_search", label: "Google Search", desc: "Show ads when people search for movers. Highest intent traffic. This is where most moving leads come from.", tag: "Highest intent", tier: "primary", difficulty: "Easy", pros: "Highest intent, proven ROI for movers", cons: "Competitive CPCs in large metros" },
  { id: "meta_fb", label: "Facebook / Instagram", desc: "Reach movers on social media with visual ads and targeting. Great for awareness and retargeting.", tag: "Best reach", tier: "primary", difficulty: "Moderate", pros: "Low CPL, visual creative, retargeting", cons: "Lower intent than search" },
  { id: "google_pmax", label: "Performance Max", desc: "Google's AI-optimized campaign across Search, Display, YouTube, Maps.", tag: "AI Powered", tier: "secondary", difficulty: "Moderate", pros: "Broad reach, automated bidding", cons: "Less control, needs conversion data" },
  { id: "youtube", label: "YouTube", desc: "Video ads shown before or during YouTube content.", tag: "", tier: "secondary", difficulty: "Hard", pros: "Great for brand building", cons: "Requires video creative, lower intent" },
  { id: "google_display", label: "Google Display", desc: "Banner ads across millions of websites. Best for retargeting, not cold traffic.", tag: "", tier: "secondary", difficulty: "Easy", pros: "Very low CPC, retargeting", cons: "Low intent for cold traffic" },
  { id: "microsoft", label: "Microsoft Ads", desc: "Search ads on Bing. Lower competition, older demographic.", tag: "Low CPL", tier: "secondary", difficulty: "Easy", pros: "Lower CPCs, less competition", cons: "Smaller audience" },
  { id: "tiktok", label: "TikTok", desc: "Short-form video ads. Emerging channel, not proven for most movers yet.", tag: "Optional later", tier: "secondary", difficulty: "Hard", pros: "Low CPM, younger audience", cons: "Unproven for moving, needs video" },
];

const GEO_MODES = [
  { id: "local_radius", label: "Local Radius", desc: "Target a radius around your office or warehouse. Best for local movers who serve a metro area.", recommended: true, tag: "Most common" },
  { id: "city_clusters", label: "City Clusters", desc: "Target multiple cities or zip codes. Good for movers who serve specific towns or neighborhoods.", recommended: false, tag: "Precise targeting" },
  { id: "state", label: "State / Region", desc: "Target one or more full states. Best for long-distance or interstate movers.", recommended: false, tag: "Long distance" },
  { id: "origin_area", label: "Origin-Focused Service Area", desc: "Target where customers are moving FROM, not where they're going. Best for outbound relocations.", recommended: false, tag: "Advanced" },
];

const BUDGET_TIERS = [
  { id: "conservative", label: "Conservative", daily: 30, monthly: 900, leads: "1-3/day", desc: "Safe starting point. Enough to test keywords and get initial data. Best when you are just getting started.", tag: "Safe start", color: "text-blue-500" },
  { id: "growth", label: "Growth", daily: 75, monthly: 2250, leads: "3-6/day", desc: "Enough budget to compete in most markets. Good balance of cost and lead volume.", tag: "Best for moving companies", color: "text-emerald-500" },
  { id: "aggressive", label: "Aggressive", daily: 150, monthly: 4500, leads: "6-12/day", desc: "Dominate your market. Best when you have Convoso routing, good landing pages, and a trained team.", tag: "Scale mode", color: "text-amber-500" },
];

const KEYWORD_BUCKETS = [
  { bucket: "Local Movers", keywords: ["movers near me", "local moving company", "moving help nearby"], volume: "22K/mo", competition: "High", recommended: true, note: "Best for Google Search. Highest volume, highest intent.", bestFor: "Google Search" },
  { bucket: "Long Distance", keywords: ["long distance movers", "interstate moving company", "cross country movers"], volume: "18K/mo", competition: "High", recommended: true, note: "Strong for Google Search. High ticket value leads.", bestFor: "Google Search" },
  { bucket: "Full Service", keywords: ["full service moving", "packing and moving", "white glove movers"], volume: "8K/mo", competition: "Medium", recommended: true, note: "Good qualifier. Attracts customers willing to pay more.", bestFor: "Google Search" },
  { bucket: "Urgent/Last Minute", keywords: ["last minute movers", "same day moving", "emergency movers"], volume: "5K/mo", competition: "Low", note: "Niche but high urgency. Good conversion rates when you can fulfill.", bestFor: "Google Search", recommended: false },
  { bucket: "Specialty", keywords: ["piano movers", "antique movers", "gun safe movers"], volume: "3K/mo", competition: "Low", note: "Usually weaker. Low volume, narrow audience. Optional unless you specialize.", bestFor: "Niche", recommended: false },
  { bucket: "Storage", keywords: ["moving and storage", "storage with movers"], volume: "6K/mo", competition: "Medium", note: "Optional add-on. Only useful if you offer storage services.", bestFor: "Google Search", recommended: false },
  { bucket: "Auto Transport", keywords: ["car shipping", "auto transport with move"], volume: "4K/mo", competition: "Medium", note: "Optional. Only relevant if you offer vehicle shipping.", bestFor: "Niche", recommended: false },
];

const LANDING_PAGES = [
  { id: "local", name: "Local Movers LP", conv: "8.2%", status: "live", bestFor: "Best for Google Search", tier: "primary", reason: "Optimized for 'movers near me' searches. Shows local trust signals, reviews, and a fast quote form. This is the highest-converting page for paid search traffic.", sections: "Hero, Trust Strip, Reviews, Service Area Map, Quote Form, Sticky CTA" },
  { id: "quote", name: "Free Quote LP", conv: "6.8%", status: "live", bestFor: "Best for higher quote quality", tier: "primary", reason: "Designed for leads who want pricing. Multi-step form captures move details for accurate quoting. Produces higher-quality leads with more information.", sections: "Hero, Price Calculator Preview, Trust Badges, Multi-Step Form, FAQ" },
  { id: "meta", name: "Social Traffic LP", conv: "7.1%", status: "live", bestFor: "Best for Meta", tier: "primary", reason: "Shorter page designed for social traffic with lower intent. Visual, fast-loading, strong CTA above fold. Use this for all Facebook and Instagram campaigns.", sections: "Visual Hero, Offer Strip, 3-Step Process, Reviews, Sticky Form" },
  { id: "longdist", name: "Long Distance LP", conv: "5.4%", status: "live", bestFor: "Best for urgent leads", tier: "secondary", reason: "Built for interstate searches. Highlights licensing, insurance, and cross-state logistics. Only needed if you run long-distance campaigns.", sections: "Hero, Route Map, Licensing Badges, Full-Value Protection, Form, Testimonials" },
  { id: "new", name: "+ Create New Landing Page", conv: "", status: "new", bestFor: "", tier: "secondary", reason: "", sections: "" },
];

export default function GrowthCampaignBuilder() {
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>(["Local Movers", "Long Distance", "Full Service"]);
  const [budget, setBudget] = useState(75);
  const [budgetTier, setBudgetTier] = useState("growth");
  const [selectedPage, setSelectedPage] = useState<string | null>("local");
  const [geoRadius, setGeoRadius] = useState(25);
  const [geoMode, setGeoMode] = useState("local_radius");

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
    0: "Choose what you want your ads to achieve. 'Phone Calls' and 'Quote Forms' are the most effective for moving companies because those leads route instantly into Convoso for callback.",
    1: "Select which advertising platforms to run on. Google Search is the best place to start for movers. You can also pick a preset below.",
    2: "Define where your ads will show. Most movers start with a local radius around their office and expand later.",
    3: "Set your daily ad budget. Start conservative, then scale what works. Budget alone does not fix bad targeting or bad landing pages.",
    4: "Choose keyword themes to target. These are the search terms people use when looking for movers. We pre-selected the highest-performing groups.",
    5: "Pick the page people will see after clicking your ad. A dedicated landing page converts 2-3x better than your homepage.",
    6: "Review everything before launch. Make sure your lead routing is ready so new leads reach Convoso within seconds.",
  };

  // Readiness checklist for review step
  const readinessChecks = [
    { label: "Tracking ready", ready: true, detail: "Google Ads and GA4 conversion events configured" },
    { label: "Landing page assigned", ready: !!selectedPage && selectedPage !== "new", detail: selectedPage ? LANDING_PAGES.find(p => p.id === selectedPage)?.name || "Not set" : "Not set" },
    { label: "Convoso routing connected", ready: true, detail: "Webhook configured for instant call queue" },
    { label: "CRM sync configured", ready: true, detail: "Leads will sync to your system of record" },
    { label: "Backup follow-up configured", ready: false, detail: "Set up SMS recovery and escalation rules in Automation Center" },
  ];

  return (
    <GrowthEngineShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaign Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Launch a new marketing campaign step by step. No experience needed.
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

        {/* Step content */}
        <div className="bg-card rounded-xl border border-border p-6">
          {/* Helper panel */}
          <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">What this does</span>
              <p className="text-[12px] text-muted-foreground mt-0.5">{HELPER_TEXT[step]}</p>
            </div>
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
                          goal.tag === "Best for moving companies" ? "bg-emerald-500/10 text-emerald-600" :
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

                {/* Primary */}
                <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 mt-3">Primary Platforms (Recommended)</div>
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
                      <div className="flex gap-3 text-[10px]">
                        <span className="text-emerald-600">+ {p.pros}</span>
                      </div>
                      <div className="flex gap-3 text-[10px] mt-0.5">
                        <span className="text-muted-foreground">- {p.cons}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-bold">{p.difficulty}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Secondary */}
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Other Channels (Optional Later)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PLATFORMS.filter(p => p.tier === "secondary").map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={cn(
                        "text-left p-3 rounded-xl border-2 transition-all opacity-80",
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
              <h2 className="text-lg font-semibold text-foreground">Where do you service?</h2>

              {/* Geo mode selector */}
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

              {/* Radius slider (shown for local_radius) */}
              {geoMode === "local_radius" && (
                <div className="bg-muted/30 rounded-xl p-5 space-y-3">
                  <label className="text-[12px] font-medium text-foreground">Service Area Radius</label>
                  <input
                    type="range" min={5} max={200} value={geoRadius}
                    onChange={e => setGeoRadius(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="text-sm font-semibold text-foreground">{geoRadius} miles from your office</div>
                  <div className="bg-muted/50 rounded-xl p-6 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-[12px] text-muted-foreground">Map preview would show your {geoRadius}-mile radius here</p>
                    </div>
                  </div>
                </div>
              )}

              {geoMode === "city_clusters" && (
                <div className="bg-muted/30 rounded-xl p-5">
                  <p className="text-[12px] text-muted-foreground">Enter the cities or zip codes you want to target. You can add up to 20 locations per campaign.</p>
                  <div className="mt-3 bg-muted/50 rounded-lg p-4 text-center text-[12px] text-muted-foreground">City/zip input would appear here</div>
                </div>
              )}

              {geoMode === "state" && (
                <div className="bg-muted/30 rounded-xl p-5">
                  <p className="text-[12px] text-muted-foreground">Select states where you are licensed to operate. Best for long-distance and interstate movers.</p>
                  <div className="mt-3 bg-muted/50 rounded-lg p-4 text-center text-[12px] text-muted-foreground">State selection map would appear here</div>
                </div>
              )}

              {geoMode === "origin_area" && (
                <div className="bg-muted/30 rounded-xl p-5">
                  <p className="text-[12px] text-muted-foreground">Target areas where customers are moving FROM. Useful for outbound relocation markets like military bases or college towns.</p>
                  <div className="mt-3 bg-muted/50 rounded-lg p-4 text-center text-[12px] text-muted-foreground">Origin area selector would appear here</div>
                </div>
              )}

              {/* Helper */}
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg px-4 py-3 flex items-start gap-3">
                <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  <strong className="text-foreground">When to use local radius vs broader:</strong> Start with a tight radius (15-30 miles) around your office if you only do local moves. Expand to state or multi-state if you handle long-distance. You can always widen later once you see which areas convert best.
                </p>
              </div>
            </div>
          )}

          {/* BUDGET */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Daily ad budget</h2>

              {/* Budget tiers */}
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
                        tier.tag === "Best for moving companies" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
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
                    <div className="text-[11px] text-muted-foreground">Monthly Estimate</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-500">~{Math.max(1, Math.round(budget / 25))}</div>
                    <div className="text-[11px] text-muted-foreground">Est. Daily Leads</div>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg px-4 py-3 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    <strong className="text-foreground">Important:</strong> Lead estimates vary by market, season, and competition. Budget alone does not fix bad targeting or bad landing pages. Start smaller, test, and scale what works. Real cost per lead can range from $15 to $80+ depending on your metro area.
                  </p>
                </div>
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
            </div>
          )}

          {/* LANDING PAGE */}
          {step === 5 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Choose a landing page</h2>

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
                      {p.conv && <span className="text-[11px] text-emerald-600 font-medium">{p.conv} conversion rate</span>}
                    </div>
                    <div className="flex gap-1.5 mb-2">
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                        p.bestFor.includes("Google") ? "bg-blue-500/10 text-blue-600" :
                        p.bestFor.includes("Meta") ? "bg-indigo-500/10 text-indigo-600" :
                        "bg-emerald-500/10 text-emerald-600"
                      )}>{p.bestFor}</span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">RECOMMENDED</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">{p.reason}</p>
                    {p.sections && (
                      <div className="flex flex-wrap gap-1">
                        {p.sections.split(", ").map(s => (
                          <span key={s} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">{s}</span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Secondary */}
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
                      {p.conv && <span className="text-[11px] text-emerald-600 font-medium">{p.conv} conversion rate</span>}
                    </div>
                    {p.bestFor && (
                      <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-bold">{p.bestFor}</span>
                    )}
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
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Goal</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{GOALS.find(g => g.id === selectedGoal)?.label || "Not set"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Platforms</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{selectedPlatforms.map(p => PLATFORMS.find(pl => pl.id === p)?.label).join(", ") || "None"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Geography</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{GEO_MODES.find(m => m.id === geoMode)?.label}{geoMode === "local_radius" ? ` (${geoRadius} mi)` : ""}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Daily Budget</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">${budget}/day (${(budget*30).toLocaleString()}/mo)</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Keywords</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{selectedBuckets.join(", ") || "None"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Landing Page</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{LANDING_PAGES.find(p => p.id === selectedPage)?.name || "Not set"}</p>
                </div>
              </div>

              {/* Lead routing path */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Lead Routing Path</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px] font-medium text-foreground">
                  <span className="bg-muted rounded-md px-2.5 py-1.5">Ad / Traffic Source</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="bg-muted rounded-md px-2.5 py-1.5">Landing Page</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="bg-muted rounded-md px-2.5 py-1.5">Attribution Capture</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="bg-muted rounded-md px-2.5 py-1.5">Webhook / Router</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="bg-emerald-500/10 text-emerald-600 rounded-md px-2.5 py-1.5 ring-1 ring-emerald-500/20">Convoso Instant Call</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="bg-muted rounded-md px-2.5 py-1.5">CRM Sync</span>
                </div>
              </div>

              {/* Routing logic by scenario */}
              <div className="bg-card rounded-xl border border-border p-4">
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">How Leads Are Handled</span>
                <div className="mt-3 space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                    <Clock className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[12px] font-semibold text-foreground">During business hours</div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Lead routes instantly to Convoso. First call attempt within seconds of form submission or inbound call.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                    <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[12px] font-semibold text-foreground">After hours</div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Lead queued for next available calling block. Auto-text sent immediately confirming receipt and next steps.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[12px] font-semibold text-foreground">If unreached</div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">SMS recovery triggered after failed attempts. Escalation alert created if no contact within threshold. Lead stays in callback queue.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Readiness checklist */}
              <div className="bg-card rounded-xl border border-border p-4">
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Launch Readiness</span>
                <div className="mt-3 space-y-2.5">
                  {readinessChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {check.ready ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <div>
                        <span className="text-[12px] font-medium text-foreground">{check.label}</span>
                        <p className="text-[10px] text-muted-foreground">{check.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => toast.success("Campaign created! Leads will route to Convoso instantly when connected.")}
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
