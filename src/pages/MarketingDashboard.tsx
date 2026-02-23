import { useState, useEffect, useRef, useCallback } from "react";
import MarketingShell from "@/components/layout/MarketingShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Sparkles, Target, BarChart3,
  Layout, RefreshCw, FlaskConical,
  Radio, Play, Pause, Mail, ArrowLeft, Home,
} from "lucide-react";
import { ABTest, ConversionEvent, FunnelStage, Stats } from "@/components/demo/ppc/types";
import { AnalyticsPrefillData } from "@/components/demo/ppc/UnifiedAnalyticsDashboard";
import { ABTestManager } from "@/components/demo/ppc/ABTestManager";
import { AILandingPageGenerator } from "@/components/demo/ppc/AILandingPageGenerator";
import { MarketingHubDashboard } from "@/components/demo/ppc/MarketingHubDashboard";
import { UnifiedAnalyticsDashboard } from "@/components/demo/ppc/UnifiedAnalyticsDashboard";
import { SimpleMarketingFlow } from "@/components/demo/ppc/SimpleMarketingFlow";
import { TrudyMarketingChat } from "@/components/demo/ppc/TrudyMarketingChat";
import { AutoBuildPage } from "@/components/demo/ppc/AutoBuildPage";
import { useMarketingPreferences } from "@/hooks/useMarketingPreferences";

const INITIAL_KEYWORDS = [
  { keyword: "long distance moving", volume: 12400, cpc: "$4.82", competition: "High", score: 92, trend: "up" },
  { keyword: "interstate movers near me", volume: 8200, cpc: "$5.15", competition: "High", score: 88, trend: "up" },
  { keyword: "cross country moving companies", volume: 6800, cpc: "$4.20", competition: "Medium", score: 85, trend: "stable" },
  { keyword: "affordable long distance movers", volume: 4500, cpc: "$3.90", competition: "Medium", score: 82, trend: "up" },
  { keyword: "best moving company reviews", volume: 3200, cpc: "$2.85", competition: "Low", score: 78, trend: "stable" },
  { keyword: "moving cost calculator", volume: 9100, cpc: "$2.40", competition: "Medium", score: 75, trend: "down" },
];

const INITIAL_ADS = [
  { id: 1, headline: "TruMove - AI-Powered Moving Quotes", description: "Get accurate quotes in 60 seconds. Compare verified movers. No hidden fees.", status: "active", clicks: 1247, impressions: 28450, ctr: 4.38, spend: 892.40, conversions: 34 },
  { id: 2, headline: "Compare Top Movers & Save 30%", description: "Trusted by 50,000+ families. Real-time tracking. Damage protection included.", status: "active", clicks: 892, impressions: 21340, ctr: 4.18, spend: 654.20, conversions: 28 },
  { id: 3, headline: "Free Moving Estimate in Minutes", description: "AI inventory scanner. Transparent pricing. Book online 24/7.", status: "paused", clicks: 234, impressions: 8920, ctr: 2.62, spend: 189.60, conversions: 8 },
];

const INITIAL_AB_TESTS: ABTest[] = [
  { id: 1, name: "Homepage Hero CTA", status: "running", startDate: "Jan 28", variants: [{ name: "Control", visitors: 4521, conversions: 312, rate: 6.9 }, { name: "Variant A", visitors: 4489, conversions: 387, rate: 8.6 }], winner: "Variant A", confidence: 94, lift: "+24.6%" },
  { id: 2, name: "Quote Form Layout", status: "running", startDate: "Jan 25", variants: [{ name: "Single Step", visitors: 3212, conversions: 198, rate: 6.2 }, { name: "Multi Step", visitors: 3198, conversions: 256, rate: 8.0 }], winner: "Multi Step", confidence: 89, lift: "+29.0%" },
  { id: 3, name: "Pricing Display", status: "completed", startDate: "Jan 15", variants: [{ name: "Range", visitors: 5840, conversions: 321, rate: 5.5 }, { name: "Starting At", visitors: 5812, conversions: 412, rate: 7.1 }], winner: "Starting At", confidence: 98, lift: "+28.4%" },
];

const INITIAL_CONVERSION_EVENTS: ConversionEvent[] = [
  { event: "Quote Requested", count: 847, trend: "+12%", value: "$42.35", source: "Google Ads" },
  { event: "Phone Call", count: 234, trend: "+8%", value: "$68.20", source: "Direct" },
  { event: "Form Submitted", count: 1203, trend: "+18%", value: "$28.50", source: "Organic" },
  { event: "Chat Started", count: 456, trend: "+24%", value: "$15.80", source: "Facebook" },
  { event: "Booking Completed", count: 89, trend: "+6%", value: "$285.00", source: "Google Ads" },
];

const INITIAL_FUNNEL_STAGES: FunnelStage[] = [
  { stage: "Landing Page Views", count: 28450, rate: 100 },
  { stage: "Quote Started", count: 8234, rate: 28.9 },
  { stage: "Inventory Added", count: 4521, rate: 15.9 },
  { stage: "Quote Completed", count: 2847, rate: 10.0 },
  { stage: "Booking Made", count: 847, rate: 3.0 },
];

const INITIAL_STATS: Stats = { totalSpend: 1736, clicks: 2373, conversions: 70, costPerConv: 24.80 };

export default function MarketingDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewMode, setViewMode] = useState<'hub' | 'quickcreate' | 'detail' | 'trudy-chat' | 'auto-build'>('hub');
  const [quickCreateType, setQuickCreateType] = useState<'ad' | 'landing' | 'campaign' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoOpenFullScreen, setAutoOpenFullScreen] = useState(false);
  const { preferences, completeTour, isReturningUser } = useMarketingPreferences();
  const [liveMode, setLiveMode] = useState(false);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [ads, setAds] = useState(INITIAL_ADS);
  const [abTests, setAbTests] = useState(INITIAL_AB_TESTS);
  const [conversionEvents, setConversionEvents] = useState(INITIAL_CONVERSION_EVENTS);
  const [funnelStages, setFunnelStages] = useState(INITIAL_FUNNEL_STAGES);
  const [chartData, setChartData] = useState([35, 45, 30, 60, 75, 55, 80, 65, 90, 70, 85, 95, 75, 88]);
  const [landingPagePrefill, setLandingPagePrefill] = useState<AnalyticsPrefillData | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [exportEmail, setExportEmail] = useState("");
  const [exportType, setExportType] = useState<"abtest" | "conversions">("abtest");
  const [isExporting, setIsExporting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToTop(); }, [viewMode, activeTab, scrollToTop]);

  // Live mode simulation
  useEffect(() => {
    if (!liveMode) return;
    const interval = setInterval(() => {
      setStats(prev => ({ totalSpend: prev.totalSpend + Math.random() * 5, clicks: prev.clicks + Math.floor(Math.random() * 3), conversions: prev.conversions + (Math.random() > 0.7 ? 1 : 0), costPerConv: prev.totalSpend / prev.conversions }));
      setAds(prev => prev.map(ad => ad.status === "active" ? { ...ad, clicks: ad.clicks + Math.floor(Math.random() * 2), impressions: ad.impressions + Math.floor(Math.random() * 15), spend: ad.spend + Math.random() * 2, conversions: ad.conversions + (Math.random() > 0.85 ? 1 : 0) } : ad));
      setAbTests(prev => prev.map(test => test.status === "running" ? { ...test, variants: test.variants.map(v => ({ ...v, visitors: v.visitors + Math.floor(Math.random() * 3), conversions: v.conversions + (Math.random() > 0.9 ? 1 : 0), rate: parseFloat(((v.conversions / v.visitors) * 100).toFixed(1)) })), confidence: Math.min(99, test.confidence + (Math.random() > 0.8 ? 0.1 : 0)) } : test));
      setConversionEvents(prev => prev.map(event => ({ ...event, count: event.count + (Math.random() > 0.7 ? 1 : 0) })));
      setFunnelStages(prev => prev.map((stage, i) => ({ ...stage, count: stage.count + (i === 0 ? Math.floor(Math.random() * 5) : (Math.random() > 0.8 ? 1 : 0)) })));
      setChartData(prev => [...prev.slice(1), Math.floor(Math.random() * 40) + 60]);
    }, 2000);
    return () => clearInterval(interval);
  }, [liveMode]);

  const handleGenerateContent = () => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 2000); };
  const handleEmailExport = async () => {
    if (!exportEmail) { toast.error("Please enter an email address"); return; }
    setIsExporting(true); await new Promise(r => setTimeout(r, 2000)); setIsExporting(false); setShowEmailModal(false); setExportEmail(""); toast.success(`Report sent to ${exportEmail}!`);
  };
  const openEmailModal = (type: "abtest" | "conversions") => { setExportType(type); setShowEmailModal(true); };
  const handleQuickCreate = (type: 'ad' | 'landing' | 'campaign') => { 
    if (type === 'landing') {
      // Skip SimpleMarketingFlow for landing pages - go directly to generator
      setViewMode('detail');
      setActiveTab('landing');
      return;
    }
    setQuickCreateType(type); 
    setViewMode('quickcreate'); 
  };
  const handleFlowComplete = (result: { type: string; data: any }) => { setViewMode('detail'); if (result.type === 'landing') setActiveTab('landing'); else if (result.type === 'ad' || result.type === 'campaign') setActiveTab('ads'); };

  const handleNavigate = (section: string) => {
    if (section === 'trudy-chat') { setViewMode('trudy-chat'); }
    else if (section === 'auto-build') { setViewMode('auto-build'); }
    else if (section === 'ai-create' || section === 'landing') { 
      // Go directly to landing page generator - no intermediate flow
      setViewMode('detail'); 
      setActiveTab('landing'); 
    }
    else if (section === 'performance') { setViewMode('detail'); setActiveTab('analytics'); }
    else if (section === 'abtest') { setViewMode('detail'); setActiveTab('abtest'); }
    else if (section === 'keywords' || section === 'seo') { setViewMode('detail'); setActiveTab('analytics'); }
    else if (section === 'campaigns') { setViewMode('detail'); setActiveTab('ads'); }
    else { setViewMode('detail'); setActiveTab(section === 'dashboard' ? 'analytics' : section); }
  };

  const handleAutoBuild = (variationId: string) => {
    // Auto-build: go directly to landing page generator which handles its own full-screen open
    setLandingPagePrefill({
      topKeyword: 'long distance moving company',
      topLocation: 'California',
      audience: 'Homeowners 35-54 (Desktop 62%)',
      locations: ['California', 'Texas', 'Florida'],
      keywords: ['long distance moving', 'cross country movers', 'moving quotes'],
      avgCPA: 24.80,
      autoPopulatedFields: ['keywords', 'locations', 'audience', 'headline'],
    });
    setAutoOpenFullScreen(true);
    setViewMode('detail');
    setActiveTab('landing');
  };

  return (
    <MarketingShell>
      <div className="space-y-4">
        {/* Top bar with controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {viewMode !== 'hub' && (
              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setViewMode('hub')}>
                <ArrowLeft className="w-3 h-3" /> Back to Hub
              </Button>
            )}
            <h1 className="text-xl font-bold text-foreground">
              {viewMode === 'hub' ? 'AI Marketing Suite' : viewMode === 'trudy-chat' ? 'Ask Trudy' : viewMode === 'quickcreate' ? 'Quick Create' : 'Marketing Tools'}
            </h1>
          </div>
          <button
            onClick={() => setLiveMode(!liveMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              liveMode ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:border-foreground/30"
            }`}
          >
            <Radio className={`w-3 h-3 ${liveMode ? "animate-pulse" : ""}`} />
            {liveMode ? "Live" : "Static"}
          </button>
        </div>

        {/* Detail view tabs */}
        {viewMode === 'detail' && (
          <div className="flex gap-1 overflow-x-auto pb-1">
            {[
              { id: "analytics", label: "All Analytics", icon: BarChart3 },
              { id: "ads", label: "Google Ads", icon: Target },
              { id: "landing", label: "Landing Pages", icon: Layout },
              { id: "abtest", label: "A/B Tests", icon: FlaskConical },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Email Export Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card rounded-xl p-6 w-96 shadow-xl border border-border">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Email Report</h3>
              <Input type="email" placeholder="Enter email address..." value={exportEmail} onChange={(e) => setExportEmail(e.target.value)} className="mb-4" />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowEmailModal(false)}>Cancel</Button>
                <Button onClick={handleEmailExport} disabled={isExporting}>
                  {isExporting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Mail className="w-4 h-4 mr-2" />Send Report</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hub View */}
        {viewMode === 'hub' && (
          <MarketingHubDashboard
            onNavigate={handleNavigate}
            onQuickCreate={handleQuickCreate}
            liveMode={liveMode}
            stats={{ totalSpend: Math.round(stats.totalSpend), conversions: stats.conversions, activePages: 4, testsRunning: abTests.filter(t => t.status === 'running').length }}
          />
        )}

        {/* Trudy Chat View */}
        {viewMode === 'trudy-chat' && (
          <div className="min-h-[500px]">
            <TrudyMarketingChat onNavigate={handleNavigate} onCreateLandingPage={() => handleQuickCreate('landing')} />
          </div>
        )}

        {/* Quick Create Flow */}
        {viewMode === 'quickcreate' && (
          <SimpleMarketingFlow onComplete={handleFlowComplete} onCancel={() => setViewMode('hub')} />
        )}

        {/* Auto-Build Flow */}
        {viewMode === 'auto-build' && (
          <AutoBuildPage onBuild={handleAutoBuild} onCancel={() => setViewMode('hub')} />
        )}

        {/* Detail View */}
        {viewMode === 'detail' && (
          <div>
            {activeTab === "analytics" && (
              <UnifiedAnalyticsDashboard onCreateLandingPage={(prefillData) => { setLandingPagePrefill(prefillData); setActiveTab("landing"); }} liveMode={liveMode} />
            )}

            {activeTab === "ads" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Active Campaigns</h3>
                  <Button size="sm" className="gap-2"><Sparkles className="w-4 h-4" />Generate New Ad</Button>
                </div>
                <div className="space-y-3">
                  {ads.map((ad) => (
                    <div key={ad.id} className={`p-4 rounded-xl border border-border bg-card ${liveMode ? "transition-all duration-500" : ""}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{ad.headline}</h4>
                            <Badge variant={ad.status === "active" ? "default" : "secondary"} className="text-[10px]">{ad.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{ad.description}</p>
                        </div>
                        <Button variant="ghost" size="sm">{ad.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-3 border-t border-border">
                        <div><div className="text-lg font-bold text-foreground">{ad.clicks.toLocaleString()}</div><div className="text-[10px] text-muted-foreground uppercase">Clicks</div></div>
                        <div><div className="text-lg font-bold text-foreground">{ad.impressions.toLocaleString()}</div><div className="text-[10px] text-muted-foreground uppercase">Impressions</div></div>
                        <div><div className="text-lg font-bold text-primary">{((ad.clicks / ad.impressions) * 100).toFixed(2)}%</div><div className="text-[10px] text-muted-foreground uppercase">CTR</div></div>
                        <div><div className="text-lg font-bold text-foreground">${ad.spend.toFixed(2)}</div><div className="text-[10px] text-muted-foreground uppercase">Spend</div></div>
                        <div><div className="text-lg font-bold text-foreground">{ad.conversions}</div><div className="text-[10px] text-muted-foreground uppercase">Conversions</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "landing" && (
              <AILandingPageGenerator isGenerating={isGenerating} onGenerate={handleGenerateContent} prefillData={landingPagePrefill} autoOpenFullScreen={autoOpenFullScreen} />
            )}

            {activeTab === "abtest" && (
              <ABTestManager tests={abTests} setTests={setAbTests} liveMode={liveMode} onEmailExport={() => openEmailModal("abtest")} />
            )}
          </div>
        )}
      </div>
    </MarketingShell>
  );
}
