import { useState } from "react";
import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { cn } from "@/lib/utils";
import {
  Rocket, ChevronRight, Check, Phone, FileText, Eye, Target,
  Globe, MapPin, DollarSign, Tag, FileCheck, Megaphone,
  HelpCircle, ArrowLeft, ArrowRight, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { id: "goal", label: "Goal", icon: Target },
  { id: "platform", label: "Platforms", icon: Globe },
  { id: "geo", label: "Geography", icon: MapPin },
  { id: "budget", label: "Budget", icon: DollarSign },
  { id: "keywords", label: "Keywords", icon: Tag },
  { id: "landing", label: "Landing Page", icon: FileText },
  { id: "review", label: "Review", icon: FileCheck },
];

const GOALS = [
  { id: "calls", label: "Phone Calls", desc: "Best for beginners. Drive inbound calls from people ready to get a quote.", icon: Phone, recommended: true },
  { id: "forms", label: "Quote Forms", desc: "Capture lead info through a landing page form. Great for follow-up.", icon: FileText, recommended: true },
  { id: "estimates", label: "Booked Estimates", desc: "Optimize for people who complete the full booking flow.", icon: Target, recommended: false },
  { id: "awareness", label: "Brand Awareness", desc: "Get your name in front of more people. Best when paired with other goals.", icon: Eye, recommended: false },
  { id: "retargeting", label: "Retargeting", desc: "Show ads to people who already visited your site but didn't convert.", icon: Megaphone, recommended: false },
];

const PLATFORMS = [
  { id: "google_search", label: "Google Search", desc: "Show ads when people search for movers. Highest intent.", tag: "Highest ROI" },
  { id: "google_pmax", label: "Performance Max", desc: "Google's AI-optimized campaign across Search, Display, YouTube, Maps.", tag: "AI Powered" },
  { id: "meta_fb", label: "Facebook / Instagram", desc: "Reach movers on social media with visual ads and targeting.", tag: "Best Reach" },
  { id: "youtube", label: "YouTube", desc: "Video ads shown before or during YouTube content.", tag: "" },
  { id: "google_display", label: "Google Display", desc: "Banner ads across millions of websites.", tag: "" },
  { id: "tiktok", label: "TikTok", desc: "Short-form video ads for younger demographics.", tag: "Emerging" },
  { id: "microsoft", label: "Microsoft Ads", desc: "Search ads on Bing. Lower competition, older demographic.", tag: "Low CPL" },
];

const KEYWORD_BUCKETS = [
  { bucket: "Local Movers", keywords: ["movers near me", "local moving company", "moving help nearby"], volume: "22K/mo", competition: "High", recommended: true },
  { bucket: "Long Distance", keywords: ["long distance movers", "interstate moving company", "cross country movers"], volume: "18K/mo", competition: "High", recommended: true },
  { bucket: "Full Service", keywords: ["full service moving", "packing and moving", "white glove movers"], volume: "8K/mo", competition: "Medium", recommended: true },
  { bucket: "Urgent/Last Minute", keywords: ["last minute movers", "same day moving", "emergency movers"], volume: "5K/mo", competition: "Low", recommended: false },
  { bucket: "Specialty", keywords: ["piano movers", "antique movers", "gun safe movers"], volume: "3K/mo", competition: "Low", recommended: false },
  { bucket: "Storage", keywords: ["moving and storage", "storage with movers"], volume: "6K/mo", competition: "Medium", recommended: false },
  { bucket: "Auto Transport", keywords: ["car shipping", "auto transport with move"], volume: "4K/mo", competition: "Medium", recommended: false },
];

const LANDING_PAGES = [
  { id: "local", name: "Local Movers LP", conv: "8.2%", status: "live" },
  { id: "quote", name: "Free Quote LP", conv: "6.8%", status: "live" },
  { id: "longdist", name: "Long Distance LP", conv: "5.4%", status: "live" },
  { id: "new", name: "+ Create New Landing Page", conv: "", status: "new" },
];

export default function GrowthCampaignBuilder() {
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>(["Local Movers", "Long Distance", "Full Service"]);
  const [budget, setBudget] = useState(50);
  const [selectedPage, setSelectedPage] = useState<string | null>("local");
  const [geoRadius, setGeoRadius] = useState(25);

  const currentStep = STEPS[step];

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const toggleBucket = (name: string) => {
    setSelectedBuckets(prev => prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name]);
  };

  const canNext = () => {
    if (step === 0) return !!selectedGoal;
    if (step === 1) return selectedPlatforms.length > 0;
    if (step === 4) return selectedBuckets.length > 0;
    if (step === 5) return !!selectedPage;
    return true;
  };

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
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {step === 0 && "Choose what you want your ads to achieve. 'Phone Calls' is the most popular for moving companies because callers are ready to book."}
                {step === 1 && "Select which advertising platforms to run your campaign on. Google Search is the best place to start because people are actively searching for movers."}
                {step === 2 && "Define where your ads will show. Set the areas you service so you only pay for relevant clicks."}
                {step === 3 && "Set how much you want to spend per day. We recommend starting with $50-100/day and scaling up what works."}
                {step === 4 && "Choose keyword themes to target. These are the search terms people use when looking for movers. We pre-selected the best ones."}
                {step === 5 && "Pick the page people will see after clicking your ad. A dedicated landing page converts 2-3x better than your homepage."}
                {step === 6 && "Review everything before launch. You can always come back and adjust."}
              </p>
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
                        {goal.recommended && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">RECOMMENDED</span>
                        )}
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
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Where should your ads run?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all",
                      selectedPlatforms.includes(p.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{p.label}</span>
                      {p.tag && (
                        <span className="text-[9px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">{p.tag}</span>
                      )}
                    </div>
                    <p className="text-[12px] text-muted-foreground">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GEOGRAPHY */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Where do you service?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-foreground">Service Area Radius</label>
                  <input
                    type="range" min={5} max={200} value={geoRadius}
                    onChange={e => setGeoRadius(Number(e.target.value))}
                    className="w-full mt-2 accent-primary"
                  />
                  <div className="text-sm font-semibold text-foreground mt-1">{geoRadius} miles from your office</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-6 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-[12px] text-muted-foreground">Map preview would show your {geoRadius}-mile radius here</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BUDGET */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Daily ad budget</h2>
              <input
                type="range" min={10} max={500} step={10} value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">${budget}</div>
                  <div className="text-[11px] text-muted-foreground">Per Day</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">${(budget * 30).toLocaleString()}</div>
                  <div className="text-[11px] text-muted-foreground">Monthly Estimate</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-500">~{Math.round(budget / 25)}</div>
                  <div className="text-[11px] text-muted-foreground">Est. Daily Leads</div>
                </div>
              </div>
              <div className="flex gap-2">
                {[25, 50, 100, 200].map(v => (
                  <button key={v} onClick={() => setBudget(v)} className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                    budget === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/30"
                  )}>${v}/day</button>
                ))}
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
                      </div>
                      <div className="flex gap-3 text-[11px] text-muted-foreground">
                        <span>{b.volume}</span>
                        <span>{b.competition} comp.</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{b.keywords.join(", ")}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LANDING PAGE */}
          {step === 5 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Choose a landing page</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LANDING_PAGES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPage(p.id)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all",
                      selectedPage === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
                      p.status === "new" && "border-dashed"
                    )}
                  >
                    <span className="text-sm font-semibold text-foreground">{p.name}</span>
                    {p.conv && <p className="text-[12px] text-muted-foreground mt-0.5">Conversion rate: {p.conv}</p>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* REVIEW */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Review your campaign</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Goal</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{GOALS.find(g => g.id === selectedGoal)?.label || "Not set"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Platforms</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{selectedPlatforms.map(p => PLATFORMS.find(pl => pl.id === p)?.label).join(", ") || "None"}</p>
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
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Geo Radius</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{geoRadius} miles</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Landing Page</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{LANDING_PAGES.find(p => p.id === selectedPage)?.name || "Not set"}</p>
                </div>
              </div>
              <button
                onClick={() => toast.success("Campaign created! Integrations will sync when connected.")}
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
