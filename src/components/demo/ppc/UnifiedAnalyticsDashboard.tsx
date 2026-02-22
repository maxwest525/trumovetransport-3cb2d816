import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TrendingUp, TrendingDown, DollarSign, Users, Globe, Target,
  Smartphone, Monitor, MapPin, BarChart3, PieChart, Hash, Zap,
  CheckCircle2, AlertTriangle, Star, Search, Layout, FlaskConical,
  ArrowRight, MousePointer, Eye, Clock, Percent, Sparkles
} from "lucide-react";
import { BudgetAlerts } from "./BudgetAlerts";

// Animated number component for live mode
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0, liveMode = false }: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  liveMode?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!liveMode) {
      setDisplayValue(value);
      return;
    }

    // Random fluctuation every 2-4 seconds
    const interval = setInterval(() => {
      const fluctuation = (Math.random() - 0.5) * value * 0.05; // ±2.5%
      const newValue = value + fluctuation;
      setDisplayValue(newValue);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }, 2000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [value, liveMode]);

  return (
    <span className={`transition-all duration-300 ${isAnimating && liveMode ? 'text-primary scale-105' : ''}`}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}
 
export interface AnalyticsPrefillData {
  keywords: string[];
  locations: string[];
  audience: string;
  topKeyword: string;
  avgCPA: number;
  topLocation: string;
  // Track which fields came from analytics for visual indicators
  autoPopulatedFields: ('keywords' | 'locations' | 'audience' | 'headline')[];
}

interface UnifiedAnalyticsDashboardProps {
  onCreateLandingPage: (prefillData: AnalyticsPrefillData) => void;
  liveMode?: boolean;
}
 
 // Consolidated data
 const KEYWORDS_DATA = [
   { keyword: "ai moving estimate", clicks: 1847, ctr: 7.89, conversions: 289, cpa: 8.09, trend: 'up' as const, position: 1.2 },
   { keyword: "cross country movers near me", clicks: 3892, ctr: 5.78, conversions: 387, cpa: 18.40, trend: 'up' as const, position: 3.4 },
   { keyword: "long distance moving company", clicks: 4521, ctr: 5.06, conversions: 412, cpa: 20.01, trend: 'up' as const, position: 2.1 },
   { keyword: "moving cost calculator", clicks: 5124, ctr: 4.12, conversions: 298, cpa: 16.41, trend: 'stable' as const, position: 4.8 },
   { keyword: "furniture moving service", clicks: 2129, ctr: 4.66, conversions: 178, cpa: 22.36, trend: 'down' as const, position: 5.2 },
 ];
 
 const PLATFORM_DATA = [
   { platform: "Google Search", spend: 12450, conversions: 892, cpa: 13.96, roas: 4.2, trending: 'up' as const },
   { platform: "Google Display", spend: 4230, conversions: 234, cpa: 18.08, roas: 2.8, trending: 'stable' as const },
   { platform: "Meta (FB/IG)", spend: 6780, conversions: 412, cpa: 16.46, roas: 3.1, trending: 'up' as const },
   { platform: "Microsoft Ads", spend: 2340, conversions: 156, cpa: 15.00, roas: 3.4, trending: 'up' as const },
 ];
 
 const GEO_DATA = [
   { state: "California", city: "Los Angeles", conversions: 521, revenue: 78150, rate: 7.61 },
   { state: "Texas", city: "Houston", conversions: 398, revenue: 59700, rate: 7.60 },
   { state: "Florida", city: "Miami", conversions: 367, revenue: 55050, rate: 7.50 },
   { state: "New York", city: "NYC", conversions: 289, revenue: 43350, rate: 8.10 },
 ];
 
 const DEMO_DATA = [
   { segment: "Homeowners 35-54", percentage: 38, conversions: 812, aov: 3240, device: "Desktop" },
   { segment: "Young Professionals 25-34", percentage: 28, conversions: 492, aov: 2180, device: "Mobile" },
   { segment: "Retirees 55+", percentage: 18, conversions: 378, aov: 4120, device: "Desktop" },
   { segment: "Corporate Relocation", percentage: 4, conversions: 54, aov: 8900, device: "Desktop" },
 ];
 
 const SEO_SCORES = [
   { label: "Performance", score: 87, color: "hsl(var(--primary))" },
   { label: "Accessibility", score: 92, color: "#3B82F6" },
   { label: "Best Practices", score: 85, color: "#8B5CF6" },
   { label: "SEO", score: 94, color: "#F59E0B" },
 ];
 
 const AB_TESTS = [
   { name: "Homepage Hero CTA", status: "running", winner: "Variant A", lift: "+24.6%", confidence: 94 },
   { name: "Quote Form Layout", status: "running", winner: "Multi Step", lift: "+29.0%", confidence: 89 },
   { name: "Pricing Display", status: "completed", winner: "Starting At", lift: "+28.4%", confidence: 98 },
 ];
 
 const FUNNEL_DATA = [
   { stage: "Landing Views", count: 28450, rate: 100 },
   { stage: "Quote Started", count: 8234, rate: 28.9 },
   { stage: "Quote Completed", count: 2847, rate: 10.0 },
   { stage: "Booking Made", count: 847, rate: 3.0 },
 ];
 
export function UnifiedAnalyticsDashboard({ onCreateLandingPage, liveMode }: UnifiedAnalyticsDashboardProps) {
  // Totals
  const totalSpend = PLATFORM_DATA.reduce((sum, p) => sum + p.spend, 0);
  const totalConversions = PLATFORM_DATA.reduce((sum, p) => sum + p.conversions, 0);
  const avgCPA = totalSpend / totalConversions;
  const avgROAS = PLATFORM_DATA.reduce((sum, p) => sum + p.roas, 0) / PLATFORM_DATA.length;
  const totalClicks = KEYWORDS_DATA.reduce((sum, k) => sum + k.clicks, 0);
  const avgCTR = KEYWORDS_DATA.reduce((sum, k) => sum + k.ctr, 0) / KEYWORDS_DATA.length;

  // Selection state for keywords and locations
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    KEYWORDS_DATA.filter(k => k.trend === 'up').map(k => k.keyword)
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    GEO_DATA.slice(0, 3).map(g => `${g.city}, ${g.state}`)
  );

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword) 
        : [...prev, keyword]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location) 
        : [...prev, location]
    );
  };

  // Build prefill data from analytics with selected items
  const handleCreateLandingPage = () => {
    const topSelectedKeyword = KEYWORDS_DATA
      .filter(k => selectedKeywords.includes(k.keyword))
      .sort((a, b) => b.conversions - a.conversions)[0]?.keyword || selectedKeywords[0] || "";
    
    const prefillData: AnalyticsPrefillData = {
      keywords: selectedKeywords,
      locations: selectedLocations,
      audience: DEMO_DATA.sort((a, b) => b.conversions - a.conversions)[0]?.segment || "Homeowners",
      topKeyword: topSelectedKeyword,
      avgCPA: avgCPA,
      topLocation: selectedLocations[0] || `${GEO_DATA[0]?.city}, ${GEO_DATA[0]?.state}`,
      autoPopulatedFields: ['keywords', 'locations', 'audience', 'headline'],
    };
    onCreateLandingPage(prefillData);
  };
 
  // Live mode animation states
  const [liveClickCount, setLiveClickCount] = useState(0);

  useEffect(() => {
    if (!liveMode) return;
    
    const clickInterval = setInterval(() => {
      setLiveClickCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 1500);

    return () => clearInterval(clickInterval);
  }, [liveMode]);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Live Mode Indicator */}
        {liveMode && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/30 w-fit animate-pulse">
            <span className="w-2 h-2 rounded-full bg-destructive animate-ping" />
            <span className="text-xs font-medium text-destructive">LIVE DATA</span>
            <span className="text-xs text-muted-foreground">+{liveClickCount} clicks this session</span>
          </div>
        )}

        {/* Budget & Performance Alerts */}
        <BudgetAlerts liveMode={liveMode} />

        {/* KPI Strip - 8 Key Metrics */}
        <div className="grid grid-cols-8 gap-2">
          {[
            { label: "Spend", value: totalSpend / 1000, prefix: "$", suffix: "K", decimals: 1, icon: DollarSign, color: "text-primary" },
            { label: "Clicks", value: totalClicks, icon: MousePointer, color: "text-blue-500" },
            { label: "CTR", value: avgCTR, suffix: "%", decimals: 1, icon: Percent, color: "text-purple-500" },
            { label: "Conversions", value: totalConversions, icon: Target, color: "text-pink-500" },
            { label: "CPA", value: avgCPA, prefix: "$", decimals: 0, icon: DollarSign, color: "text-amber-500" },
            { label: "ROAS", value: avgROAS, suffix: "x", decimals: 1, icon: TrendingUp, color: "text-primary" },
            { label: "SEO Score", value: 87, icon: Globe, color: "text-blue-500" },
            { label: "A/B Lifts", value: 27, prefix: "+", suffix: "%", icon: FlaskConical, color: "text-pink-500" },
          ].map((stat, idx) => (
            <div 
              key={stat.label} 
              className={`p-2 rounded-lg bg-muted/50 border border-border text-center transition-all duration-300 ${liveMode ? 'hover:border-primary/50' : ''}`}
              style={{ animationDelay: liveMode ? `${idx * 100}ms` : '0ms' }}
            >
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color} ${liveMode ? 'animate-pulse' : ''}`} />
              <p className="text-sm font-bold text-foreground">
                <AnimatedNumber 
                  value={stat.value} 
                  prefix={stat.prefix} 
                  suffix={stat.suffix} 
                  decimals={stat.decimals || 0}
                  liveMode={liveMode}
                />
              </p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
 
         {/* Main Grid - 3 Columns */}
         <div className="grid grid-cols-3 gap-4">
           {/* Column 1: Keywords + SEO */}
           <div className="space-y-4">
            {/* Top Keywords - Selectable */}
            <Card className="border-border">
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-amber-500" />
                    Top Keywords
                    {liveMode && <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />}
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px] h-4 gap-1 border-primary/50 text-primary">
                    <Sparkles className="w-2.5 h-2.5" />
                    {selectedKeywords.length} selected
                  </Badge>
                </div>
              </CardHeader>
               <CardContent className="px-3 pb-3 space-y-1.5">
                 {KEYWORDS_DATA.slice(0, 5).map((kw, i) => {
                   const isSelected = selectedKeywords.includes(kw.keyword);
                   return (
                     <div 
                       key={i} 
                       className={`flex items-center justify-between py-1.5 px-2 rounded-md border transition-all duration-300 cursor-pointer ${
                         isSelected 
                           ? 'border-primary/50 bg-primary/5' 
                           : 'border-transparent hover:bg-muted/50'
                       } ${liveMode ? 'hover:bg-primary/5' : ''}`}
                       onClick={() => toggleKeyword(kw.keyword)}
                     >
                       <div className="flex items-center gap-2 min-w-0">
                         <Checkbox 
                           checked={isSelected} 
                           className="pointer-events-none h-3.5 w-3.5"
                         />
                         <span className={`text-xs font-medium truncate ${isSelected ? 'text-primary' : ''}`}>
                           {kw.keyword}
                         </span>
                         {kw.trend === 'up' && <TrendingUp className={`w-3 h-3 text-primary shrink-0 ${liveMode ? 'animate-pulse' : ''}`} />}
                         {kw.trend === 'down' && <TrendingDown className="w-3 h-3 text-destructive shrink-0" />}
                       </div>
                       <div className="flex items-center gap-2 shrink-0">
                         <Badge variant="outline" className="text-[9px] h-4">
                           {liveMode ? (
                             <AnimatedNumber value={kw.ctr} suffix="% CTR" decimals={2} liveMode={liveMode} />
                           ) : (
                             `${kw.ctr}% CTR`
                           )}
                         </Badge>
                         <Badge className="text-[9px] h-4 bg-primary/10 text-primary border-0">
                           {liveMode ? (
                             <AnimatedNumber value={kw.cpa} prefix="$" decimals={2} liveMode={liveMode} />
                           ) : (
                             `$${kw.cpa}`
                           )}
                         </Badge>
                       </div>
                     </div>
                   );
                 })}
               </CardContent>
            </Card>
 
             {/* SEO Scores */}
             <Card className="border-border">
               <CardHeader className="pb-2 pt-3 px-3">
                 <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                   <Globe className="w-3.5 h-3.5 text-blue-500" />
                   SEO Scores
                 </CardTitle>
               </CardHeader>
               <CardContent className="px-3 pb-3 space-y-2">
                 {SEO_SCORES.map((item) => (
                   <div key={item.label} className="space-y-1">
                     <div className="flex justify-between text-xs">
                       <span className="text-muted-foreground">{item.label}</span>
                       <span className="font-medium" style={{ color: item.color }}>{item.score}</span>
                     </div>
                     <Progress value={item.score} className="h-1.5" />
                   </div>
                 ))}
               </CardContent>
             </Card>
 
             {/* SEO Issues Quick List */}
             <Card className="border-border">
               <CardHeader className="pb-2 pt-3 px-3">
                 <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                   <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                   SEO Issues
                 </CardTitle>
               </CardHeader>
               <CardContent className="px-3 pb-3 space-y-1.5">
                 <div className="flex items-center gap-2 text-xs">
                   <span className="w-2 h-2 rounded-full bg-red-500" />
                   <span className="text-muted-foreground">Missing meta on /services</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs">
                   <span className="w-2 h-2 rounded-full bg-amber-500" />
                   <span className="text-muted-foreground">H1 too long (72 chars)</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs">
                   <span className="w-2 h-2 rounded-full bg-amber-500" />
                   <span className="text-muted-foreground">3 images missing alt</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                    <span className="text-muted-foreground">SSL + Mobile OK</span>
                 </div>
               </CardContent>
             </Card>
           </div>
 
           {/* Column 2: Platforms + A/B Tests */}
           <div className="space-y-4">
             {/* Platform Performance */}
             <Card className="border-border">
               <CardHeader className="pb-2 pt-3 px-3">
                 <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                   <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
                   Platform ROAS
                   {liveMode && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                 </CardTitle>
               </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  {PLATFORM_DATA.map((p, idx) => (
                    <div 
                      key={p.platform} 
                      className={`flex items-center justify-between py-1.5 border-b border-border last:border-0 transition-all duration-300 ${liveMode ? 'hover:bg-muted/50' : ''}`}
                      style={{ animationDelay: liveMode ? `${idx * 150}ms` : '0ms' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{p.platform}</span>
                        {p.trending === 'up' && <TrendingUp className={`w-3 h-3 text-primary ${liveMode ? 'animate-bounce' : ''}`} />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {liveMode ? (
                            <AnimatedNumber value={p.spend / 1000} prefix="$" suffix="K" decimals={1} liveMode={liveMode} />
                          ) : (
                            `$${(p.spend / 1000).toFixed(1)}K`
                          )}
                        </span>
                        <Badge variant={p.roas >= 3.5 ? 'default' : p.roas >= 2.5 ? 'secondary' : 'destructive'} className="text-[9px] h-4">
                          {liveMode ? (
                            <AnimatedNumber value={p.roas} suffix="x" decimals={1} liveMode={liveMode} />
                          ) : (
                            `${p.roas}x`
                          )}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
             </Card>
 
             {/* A/B Tests */}
             <Card className="border-border">
               <CardHeader className="pb-2 pt-3 px-3">
                 <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                   <FlaskConical className="w-3.5 h-3.5 text-pink-500" />
                   A/B Test Results
                 </CardTitle>
               </CardHeader>
               <CardContent className="px-3 pb-3 space-y-2">
                 {AB_TESTS.map((test) => (
                   <div key={test.name} className="p-2 rounded-lg bg-muted/50 space-y-1">
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-medium">{test.name}</span>
                       <Badge variant={test.status === 'running' ? 'default' : 'secondary'} className="text-[9px] h-4">
                         {test.status}
                       </Badge>
                     </div>
                     <div className="flex items-center justify-between text-[10px]">
                       <span className="text-muted-foreground">Winner: {test.winner}</span>
                       <span className="text-primary font-medium">{test.lift}</span>
                     </div>
                     <Progress value={test.confidence} className="h-1" />
                     <span className="text-[9px] text-muted-foreground">{test.confidence}% confidence</span>
                   </div>
                 ))}
               </CardContent>
             </Card>
 
             {/* Conversion Funnel */}
             <Card className="border-border">
               <CardHeader className="pb-2 pt-3 px-3">
                 <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                   <Target className="w-3.5 h-3.5 text-primary" />
                   Conversion Funnel
                 </CardTitle>
               </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  {FUNNEL_DATA.map((stage, i) => (
                    <div key={stage.stage} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{stage.stage}</span>
                        <span className="font-medium">
                          {liveMode ? (
                            <AnimatedNumber value={stage.count} liveMode={liveMode} />
                          ) : (
                            stage.count.toLocaleString()
                          )}
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${liveMode ? 'animate-pulse' : ''}`}
                          style={{ 
                            width: `${stage.rate}%`,
                            background: `linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)`,
                            opacity: 1 - (i * 0.15)
                          }}
                        />
                        {liveMode && i === 0 && (
                          <div 
                            className="absolute top-0 left-0 h-full w-1 bg-white/50 animate-[shimmer_2s_infinite]"
                            style={{ 
                              animation: 'shimmer 2s infinite',
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                            }}
                          />
                        )}
                      </div>
                      <span className="text-[9px] text-muted-foreground">{stage.rate}%</span>
                    </div>
                  ))}
                </CardContent>
             </Card>
           </div>
 
           {/* Column 3: Geo + Demographics */}
           <div className="space-y-4">
            {/* Geographic Performance - Selectable */}
            <Card className="border-border">
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-destructive" />
                    Top Locations
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px] h-4 gap-1 border-primary/50 text-primary">
                    <Sparkles className="w-2.5 h-2.5" />
                    {selectedLocations.length} selected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-1.5">
                {GEO_DATA.map((loc) => {
                  const locationString = `${loc.city}, ${loc.state}`;
                  const isSelected = selectedLocations.includes(locationString);
                  return (
                    <div 
                      key={loc.city} 
                      className={`flex items-center justify-between py-1.5 px-2 rounded-md border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-primary/50 bg-primary/5' 
                          : 'border-transparent hover:bg-muted/50'
                      }`}
                      onClick={() => toggleLocation(locationString)}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={isSelected} 
                          className="pointer-events-none h-3.5 w-3.5"
                        />
                        <span className={`text-xs font-medium ${isSelected ? 'text-primary' : ''}`}>{loc.city}</span>
                        <span className="text-[10px] text-muted-foreground">{loc.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{loc.conversions}</span>
                        <Badge variant="outline" className="text-[9px] h-4">{loc.rate}%</Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
 
             {/* Demographics */}
             <Card className="border-border">
               <CardHeader className="pb-2 pt-3 px-3">
                 <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                   <Users className="w-3.5 h-3.5 text-indigo-500" />
                   Demographics
                 </CardTitle>
               </CardHeader>
               <CardContent className="px-3 pb-3 space-y-2">
                 {DEMO_DATA.map((demo) => (
                   <div key={demo.segment} className="p-2 rounded-lg bg-muted/50 space-y-1">
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-medium">{demo.segment}</span>
                       <Badge className="text-[9px] h-4 bg-primary/10 text-primary">${demo.aov}</Badge>
                     </div>
                     <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                       <span>{demo.percentage}% of traffic</span>
                       <div className="flex items-center gap-1">
                         {demo.device === "Mobile" ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                         {demo.device}
                       </div>
                     </div>
                   </div>
                 ))}
               </CardContent>
             </Card>
 
             {/* AI Recommendations */}
             <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
               <CardHeader className="pb-2 pt-3 px-3">
                 <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                   <Zap className="w-3.5 h-3.5 text-primary" />
                   AI Recommendations
                 </CardTitle>
               </CardHeader>
               <CardContent className="px-3 pb-3 space-y-2 text-xs">
                 <div className="p-2 rounded bg-background/50">
                   <span className="text-primary">↑</span> Increase NYC budget 25% (8.1% conv rate)
                 </div>
                 <div className="p-2 rounded bg-background/50">
                   <span className="text-amber-600">→</span> Shift TikTok spend to Google (1.9x vs 4.2x ROAS)
                 </div>
                 <div className="p-2 rounded bg-background/50">
                   <span className="text-blue-600">+</span> Add B2B targeting ($8,900 AOV segment)
                 </div>
               </CardContent>
             </Card>
           </div>
         </div>
 
        {/* Action Bar */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-transparent to-pink-500/5">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Ready to create your landing page?</p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {selectedKeywords.length} keywords
                  </span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {selectedLocations.length} locations
                  </span>
                  <span className="text-muted-foreground/50">•</span>
                  <span>Auto-fill enabled</span>
                </p>
              </div>
            </div>
           <Button 
             onClick={handleCreateLandingPage} 
             className="gap-2" 
             style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)" }}
             disabled={selectedKeywords.length === 0 && selectedLocations.length === 0}
           >
             <Layout className="w-4 h-4" />
             Create with Selected Data
             <ArrowRight className="w-4 h-4" />
           </Button>
          </CardContent>
        </Card>
       </div>
     </ScrollArea>
   );
 }