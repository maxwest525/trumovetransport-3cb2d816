 import { useState } from "react";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
 import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import {
   TrendingUp, TrendingDown, DollarSign, Users, Globe, Target,
   Smartphone, Monitor, MapPin, BarChart3, PieChart, Hash, Zap,
  CheckCircle2, AlertTriangle, ArrowRight, ExternalLink, Star,
   Sparkles, Building2, Phone, Link2, ArrowRightLeft
 } from "lucide-react";
 
 interface KeywordData {
   keyword: string;
   clicks: number;
   impressions: number;
   ctr: number;
   conversions: number;
   cpa: number;
   trend: 'up' | 'down' | 'stable';
   recommendation: string;
 }
 
 interface PlatformData {
   platform: string;
   spend: number;
   conversions: number;
   cpa: number;
   roas: number;
   trending: 'up' | 'down' | 'stable';
 }
 
 interface GeographicData {
   state: string;
   city: string;
   conversions: number;
   revenue: number;
   convRate: number;
 }
 
 interface DemographicData {
   segment: string;
   percentage: number;
   conversions: number;
   avgOrderValue: number;
   device: string;
 }
 
 // Best performing mock data
 const BEST_KEYWORDS: KeywordData[] = [
   { keyword: "ai moving estimate", clicks: 1847, impressions: 23400, ctr: 7.89, conversions: 289, cpa: 8.09, trend: 'up', recommendation: "🏆 TOP PERFORMER - 340% YoY growth, lowest CPA. Increase budget 50%" },
   { keyword: "cross country movers near me", clicks: 3892, impressions: 67340, ctr: 5.78, conversions: 387, cpa: 18.40, trend: 'up', recommendation: "Local intent signals immediate need. 42% higher conversion rate" },
   { keyword: "long distance moving company", clicks: 4521, impressions: 89420, ctr: 5.06, conversions: 412, cpa: 20.01, trend: 'up', recommendation: "High intent + low competition. Users 3.2x more likely to convert" },
   { keyword: "moving cost calculator", clicks: 5124, impressions: 124500, ctr: 4.12, conversions: 298, cpa: 16.41, trend: 'stable', recommendation: "Tool-based intent captures early funnel. Create dedicated calculator page" },
   { keyword: "furniture moving service", clicks: 2129, impressions: 45670, ctr: 4.66, conversions: 178, cpa: 22.36, trend: 'stable', recommendation: "Specific service intent. Users often bundle with full-service moves" },
 ];
 
 const BEST_PLATFORMS: PlatformData[] = [
   { platform: "Google Search", spend: 12450, conversions: 892, cpa: 13.96, roas: 4.2, trending: 'up' },
   { platform: "Google Display", spend: 4230, conversions: 234, cpa: 18.08, roas: 2.8, trending: 'stable' },
   { platform: "Meta (Facebook/IG)", spend: 6780, conversions: 412, cpa: 16.46, roas: 3.1, trending: 'up' },
   { platform: "Microsoft Ads", spend: 2340, conversions: 156, cpa: 15.00, roas: 3.4, trending: 'up' },
   { platform: "TikTok", spend: 1890, conversions: 89, cpa: 21.24, roas: 1.9, trending: 'down' },
 ];
 
 const BEST_LOCATIONS: GeographicData[] = [
   { state: "California", city: "Los Angeles", conversions: 521, revenue: 78150, convRate: 7.61 },
   { state: "Texas", city: "Houston", conversions: 398, revenue: 59700, convRate: 7.60 },
   { state: "Florida", city: "Miami", conversions: 367, revenue: 55050, convRate: 7.50 },
   { state: "New York", city: "NYC", conversions: 289, revenue: 43350, convRate: 8.10 },
   { state: "Arizona", city: "Phoenix", conversions: 167, revenue: 25050, convRate: 7.82 },
 ];
 
const LOCATION_OPTIONS = [
  { value: "los-angeles", label: "Los Angeles, CA", convRate: 7.61 },
  { value: "houston", label: "Houston, TX", convRate: 7.60 },
  { value: "miami", label: "Miami, FL", convRate: 7.50 },
  { value: "nyc", label: "New York City, NY", convRate: 8.10 },
  { value: "phoenix", label: "Phoenix, AZ", convRate: 7.82 },
  { value: "chicago", label: "Chicago, IL", convRate: 7.20 },
  { value: "dallas", label: "Dallas, TX", convRate: 7.45 },
  { value: "atlanta", label: "Atlanta, GA", convRate: 7.30 },
  { value: "seattle", label: "Seattle, WA", convRate: 7.15 },
  { value: "denver", label: "Denver, CO", convRate: 7.55 },
];

const AUDIENCE_OPTIONS = [
  { value: "homeowners-35-54", label: "Homeowners 35-54", aov: 3240 },
  { value: "young-professionals", label: "Young Professionals 25-34", aov: 2180 },
  { value: "retirees", label: "Retirees 55+", aov: 4120 },
  { value: "corporate-relocation", label: "Corporate Relocation", aov: 8900 },
  { value: "military-families", label: "Military Families", aov: 2850 },
  { value: "first-time-movers", label: "First-Time Movers", aov: 1950 },
  { value: "luxury-movers", label: "Luxury/High-Value Moves", aov: 12400 },
  { value: "senior-downsizing", label: "Senior Downsizing", aov: 3680 },
];

 const BEST_DEMOGRAPHICS: DemographicData[] = [
   { segment: "Homeowners 35-54", percentage: 38, conversions: 812, avgOrderValue: 3240, device: "Desktop 62%" },
   { segment: "Young Professionals 25-34", percentage: 28, conversions: 492, avgOrderValue: 2180, device: "Mobile 71%" },
   { segment: "Retirees 55+", percentage: 18, conversions: 378, avgOrderValue: 4120, device: "Desktop 78%" },
   { segment: "Corporate Relocation", percentage: 4, conversions: 54, avgOrderValue: 8900, device: "Desktop 91%" },
 ];
 
 interface MarketingAnalyticsDashboardProps {
   onProceedToCreate: () => void;
 }
 
 export function MarketingAnalyticsDashboard({ onProceedToCreate }: MarketingAnalyticsDashboardProps) {
   const [activeTab, setActiveTab] = useState<'keywords' | 'platforms' | 'geo' | 'demo' | 'seo'>('keywords');
  
  // Business inputs with AI-recommended defaults
  const [businessName, setBusinessName] = useState("TruMove");
  const [serviceType, setServiceType] = useState("Long-Distance Moving, Local Moving, Packing Services");
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["los-angeles", "houston", "miami", "nyc", "phoenix"]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(["homeowners-35-54", "young-professionals"]);
  const [dailyBudget, setDailyBudget] = useState("150");
  const [phoneNumber, setPhoneNumber] = useState("1-800-TRUMOVE");
  const [redirectUrl, setRedirectUrl] = useState("trumove.com/quote");
  
  // Platform selections based on best performers
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    googleSearch: true,
    googleDisplay: true,
    meta: true,
    microsoft: true,
    tiktok: false,
  });
  
  // Keyword selections
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([
    "ai moving estimate",
    "cross country movers near me",
    "long distance moving company",
    "moving cost calculator",
  ]);
 
   const totalSpend = BEST_PLATFORMS.reduce((sum, p) => sum + p.spend, 0);
   const totalConversions = BEST_PLATFORMS.reduce((sum, p) => sum + p.conversions, 0);
   const avgCPA = totalSpend / totalConversions;
   const avgROAS = BEST_PLATFORMS.reduce((sum, p) => sum + p.roas, 0) / BEST_PLATFORMS.length;
  
  const toggleKeyword = (kw: string) => {
    setSelectedKeywords(prev => 
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
    );
  };
 
   return (
     <div className="space-y-6">
      {/* Business Info Section - AI Pre-filled */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Your Business Profile
            <Badge className="ml-2 bg-primary/20 text-primary border-primary/30">AI Pre-filled from Top Performers</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                Business Name
              </label>
              <Input 
                value={businessName} 
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your company name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                Phone Number
              </label>
              <Input 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="1-800-XXX-XXXX"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Services Offered</label>
            <Textarea 
              value={serviceType} 
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="What services do you offer?"
              className="min-h-[60px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
                Redirect URL
              </label>
              <Input 
                value={redirectUrl} 
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="yoursite.com/landing-page"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                Daily Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input 
                  value={dailyBudget} 
                  onChange={(e) => setDailyBudget(e.target.value)}
                  className="pl-7"
                  type="number"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommended Targeting */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Recommended Locations
                <Badge variant="secondary" className="text-[10px]">Based on 7.8% avg conv rate</Badge>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedLocations(LOCATION_OPTIONS.map(l => l.value))}
                  className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedLocations([])}
                  className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors font-medium"
                >
                  Clear
                </button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 min-h-[60px] p-2 border rounded-md bg-background">
              {LOCATION_OPTIONS.map((loc) => {
                const isSelected = selectedLocations.includes(loc.value);
                return (
                  <Badge
                    key={loc.value}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${isSelected ? '' : 'opacity-60 hover:opacity-100'}`}
                    onClick={() => {
                      setSelectedLocations(prev => 
                        isSelected ? prev.filter(l => l !== loc.value) : [...prev, loc.value]
                      );
                    }}
                  >
                    {loc.label}
                    {isSelected && <span className="ml-1 text-[10px]">({loc.convRate}%)</span>}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 NYC has highest conv rate (8.10%) - consider increasing budget
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Recommended Audience
                <Badge variant="secondary" className="text-[10px]">$3,240 avg order value</Badge>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedAudiences(AUDIENCE_OPTIONS.map(a => a.value))}
                  className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedAudiences([])}
                  className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors font-medium"
                >
                  Clear
                </button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 min-h-[60px] p-2 border rounded-md bg-background">
              {AUDIENCE_OPTIONS.map((aud) => {
                const isSelected = selectedAudiences.includes(aud.value);
                return (
                  <Badge
                    key={aud.value}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${isSelected ? '' : 'opacity-60 hover:opacity-100'}`}
                    onClick={() => {
                      setSelectedAudiences(prev => 
                        isSelected ? prev.filter(a => a !== aud.value) : [...prev, aud.value]
                      );
                    }}
                  >
                    {aud.label}
                    {isSelected && <span className="ml-1 text-[10px]">(${aud.aov.toLocaleString()})</span>}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Corporate Relocation has $8,900 AOV - add B2B targeting
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Selection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Ad Platforms
            <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px]">AI Optimized</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {[
              { key: 'googleSearch', label: 'Google Search', roas: 4.2, recommended: true },
              { key: 'googleDisplay', label: 'Display', roas: 2.8, recommended: true },
              { key: 'meta', label: 'Meta (FB/IG)', roas: 3.1, recommended: true },
              { key: 'microsoft', label: 'Microsoft', roas: 3.4, recommended: true },
              { key: 'tiktok', label: 'TikTok', roas: 1.9, recommended: false },
            ].map(platform => (
              <div 
                key={platform.key}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedPlatforms[platform.key as keyof typeof selectedPlatforms]
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/30'
                } ${!platform.recommended ? 'opacity-60' : ''}`}
                onClick={() => setSelectedPlatforms(prev => ({
                  ...prev,
                  [platform.key]: !prev[platform.key as keyof typeof selectedPlatforms]
                }))}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Checkbox 
                    checked={selectedPlatforms[platform.key as keyof typeof selectedPlatforms]}
                    className="pointer-events-none"
                  />
                  <span className="text-xs font-medium">{platform.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={platform.roas >= 3 ? 'default' : 'destructive'} 
                    className="text-[10px]"
                  >
                    {platform.roas}x ROAS
                  </Badge>
                  {!platform.recommended && (
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            TikTok has low ROAS (1.9x) - not recommended until creative refresh
          </p>
        </CardContent>
      </Card>

       {/* Header Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-3">
             <div className="flex items-center justify-between">
               <div>
                <p className="text-xs text-muted-foreground">Historical Spend</p>
                <p className="text-xl font-bold">${totalSpend.toLocaleString()}</p>
               </div>
              <DollarSign className="w-6 h-6 text-primary" />
             </div>
           </CardContent>
         </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-3">
             <div className="flex items-center justify-between">
               <div>
                <p className="text-xs text-muted-foreground">Conversions</p>
                <p className="text-xl font-bold">{totalConversions.toLocaleString()}</p>
               </div>
              <Users className="w-6 h-6 text-blue-500" />
             </div>
           </CardContent>
         </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-3">
             <div className="flex items-center justify-between">
               <div>
                <p className="text-xs text-muted-foreground">Avg. CPA</p>
                <p className="text-xl font-bold">${avgCPA.toFixed(2)}</p>
               </div>
              <Target className="w-6 h-6 text-purple-500" />
             </div>
           </CardContent>
         </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-3">
             <div className="flex items-center justify-between">
               <div>
                <p className="text-xs text-muted-foreground">Avg. ROAS</p>
                <p className="text-xl font-bold">{avgROAS.toFixed(1)}x</p>
               </div>
              <TrendingUp className="w-6 h-6 text-amber-500" />
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Tabs */}
      <div className="flex items-center gap-1 border-b pb-2">
         {[
           { id: 'keywords', label: 'Keywords', icon: Hash },
           { id: 'platforms', label: 'Platforms', icon: BarChart3 },
           { id: 'geo', label: 'Geographic', icon: Globe },
           { id: 'demo', label: 'Demographics', icon: Users },
           { id: 'seo', label: 'SEO Insights', icon: Target },
         ].map(tab => (
           <Button
             key={tab.id}
             variant={activeTab === tab.id ? 'default' : 'ghost'}
             size="sm"
             onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="gap-1 text-xs h-8"
           >
            <tab.icon className="w-3 h-3" />
             {tab.label}
           </Button>
         ))}
       </div>
 
       {/* Tab Content */}
      <ScrollArea className="h-[260px]">
         {activeTab === 'keywords' && (
          <div className="space-y-2">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold flex items-center gap-2">
                 <Star className="w-4 h-4 text-amber-500" />
                Select Keywords for Campaign
               </h3>
              <Badge className="bg-primary/10 text-primary border-primary/30">{selectedKeywords.length} selected</Badge>
             </div>
             {BEST_KEYWORDS.map((kw, i) => (
              <Card 
                key={i} 
                className={`cursor-pointer transition-all ${
                  selectedKeywords.includes(kw.keyword) 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-muted-foreground/30'
                } ${i === 0 ? 'ring-2 ring-amber-500/30' : ''}`}
                onClick={() => toggleKeyword(kw.keyword)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                     <div className="flex items-center gap-2">
                      <Checkbox checked={selectedKeywords.includes(kw.keyword)} className="pointer-events-none" />
                       {i === 0 && <Badge className="bg-amber-500 text-white">🏆 #1</Badge>}
                       <span className="font-medium">{kw.keyword}</span>
                       {kw.trend === 'up' && <TrendingUp className="w-4 h-4 text-primary" />}
                       {kw.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                     </div>
                     <Badge variant="outline" className="text-xs">${kw.cpa.toFixed(2)} CPA</Badge>
                   </div>
                  <div className="grid grid-cols-4 gap-4 text-xs ml-6 mb-1">
                     <div><span className="text-muted-foreground">Clicks:</span> {kw.clicks.toLocaleString()}</div>
                     <div><span className="text-muted-foreground">CTR:</span> {kw.ctr.toFixed(2)}%</div>
                     <div><span className="text-muted-foreground">Conv:</span> {kw.conversions}</div>
                     <div><span className="text-muted-foreground">Impr:</span> {kw.impressions.toLocaleString()}</div>
                   </div>
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 ml-6">{kw.recommendation}</p>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
 
         {activeTab === 'platforms' && (
           <div className="space-y-3">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold flex items-center gap-2">
                 <BarChart3 className="w-4 h-4 text-blue-500" />
                 Platform Performance
               </h3>
               <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">By ROAS</Badge>
             </div>
             {BEST_PLATFORMS.sort((a, b) => b.roas - a.roas).map((p, i) => (
               <Card key={i} className={p.roas >= 4 ? 'border-primary/50 bg-primary/5' : p.roas < 2 ? 'border-red-500/30 bg-red-500/5' : ''}>
                 <CardContent className="p-4">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                       <span className="font-medium">{p.platform}</span>
                       {p.trending === 'up' && <TrendingUp className="w-4 h-4 text-primary" />}
                       {p.trending === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                     </div>
                     <div className="flex items-center gap-2">
                       <Badge variant={p.roas >= 3 ? 'default' : 'destructive'}>{p.roas}x ROAS</Badge>
                       {p.roas < 2 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                     </div>
                   </div>
                   <div className="grid grid-cols-3 gap-4 text-sm">
                     <div><span className="text-muted-foreground">Spend:</span> ${p.spend.toLocaleString()}</div>
                     <div><span className="text-muted-foreground">Conversions:</span> {p.conversions}</div>
                     <div><span className="text-muted-foreground">CPA:</span> ${p.cpa.toFixed(2)}</div>
                   </div>
                 </CardContent>
               </Card>
             ))}
             <div className="mt-4 p-4 bg-muted/30 rounded-lg">
               <p className="text-sm font-medium mb-1">💡 AI Recommendation:</p>
               <p className="text-sm text-muted-foreground">Shift 20% of TikTok budget to Google Search for better ROAS. Consider pausing TikTok until creative refresh.</p>
             </div>
           </div>
         )}
 
         {activeTab === 'geo' && (
           <div className="space-y-3">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold flex items-center gap-2">
                 <Globe className="w-4 h-4 text-primary" />
                 Top Performing Locations
               </h3>
               <Badge className="bg-primary/10 text-primary border-primary/30">By Revenue</Badge>
             </div>
             {BEST_LOCATIONS.map((loc, i) => (
               <Card key={i}>
                 <CardContent className="p-4">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-muted-foreground" />
                       <span className="font-medium">{loc.state}</span>
                       <span className="text-sm text-muted-foreground">({loc.city})</span>
                     </div>
                     <Badge variant="outline">${loc.revenue.toLocaleString()} revenue</Badge>
                   </div>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                     <div><span className="text-muted-foreground">Conversions:</span> {loc.conversions}</div>
                     <div><span className="text-muted-foreground">Conv Rate:</span> {loc.convRate}%</div>
                   </div>
                 </CardContent>
               </Card>
             ))}
             <div className="mt-4 p-4 bg-muted/30 rounded-lg">
               <p className="text-sm font-medium mb-1">💡 AI Recommendation:</p>
               <p className="text-sm text-muted-foreground">New York has highest conv rate (8.10%) but lower volume. Increase geo-targeting budget 25% for NYC metro.</p>
             </div>
           </div>
         )}
 
         {activeTab === 'demo' && (
           <div className="space-y-3">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold flex items-center gap-2">
                 <Users className="w-4 h-4 text-purple-500" />
                 Best Converting Demographics
               </h3>
               <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30">By AOV</Badge>
             </div>
             {BEST_DEMOGRAPHICS.map((demo, i) => (
               <Card key={i}>
                 <CardContent className="p-4">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                       <span className="font-medium">{demo.segment}</span>
                       <Badge variant="secondary" className="text-xs">{demo.percentage}% of traffic</Badge>
                     </div>
                     <Badge className="bg-primary/10 text-primary">${demo.avgOrderValue.toLocaleString()} AOV</Badge>
                   </div>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                     <div><span className="text-muted-foreground">Conversions:</span> {demo.conversions}</div>
                     <div className="flex items-center gap-1">
                       {demo.device.includes('Mobile') ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                       <span className="text-muted-foreground">{demo.device}</span>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ))}
             <div className="mt-4 p-4 bg-muted/30 rounded-lg">
               <p className="text-sm font-medium mb-1">💡 AI Recommendation:</p>
               <p className="text-sm text-muted-foreground">Corporate Relocation segment has $8,900 AOV (highest). Create dedicated B2B landing page with case studies.</p>
             </div>
           </div>
         )}
 
         {activeTab === 'seo' && (
           <div className="space-y-4">
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-base flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4 text-primary" />
                   SEO Opportunities
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                   <p className="font-medium text-sm">"ai moving estimate" - Position 1.2</p>
                   <p className="text-xs text-muted-foreground">Emerging keyword with 340% YoY growth. Create pillar content page.</p>
                 </div>
                 <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                   <p className="font-medium text-sm">"moving cost calculator [city]" - Low competition</p>
                   <p className="text-xs text-muted-foreground">Create city-specific calculator pages for local SEO boost.</p>
                 </div>
                 <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                   <p className="font-medium text-sm">"cross country moving tips 2025" - Featured snippet opportunity</p>
                   <p className="text-xs text-muted-foreground">Create comprehensive guide to capture featured snippet.</p>
                 </div>
               </CardContent>
             </Card>
 
             {/* Domain Purchase CTA */}
             <Card className="border-primary/30 bg-primary/5">
               <CardContent className="p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <h4 className="font-semibold mb-1">Need a Domain?</h4>
                     <p className="text-sm text-muted-foreground">Register your landing page domain</p>
                   </div>
                   <Button variant="outline" size="sm" className="gap-1.5" asChild>
                     <a href="https://www.godaddy.com/domains" target="_blank" rel="noopener noreferrer">
                       Buy Domain <ExternalLink className="w-3.5 h-3.5" />
                     </a>
                   </Button>
                 </div>
               </CardContent>
             </Card>
           </div>
         )}
       </ScrollArea>
 
       {/* Action Button */}
       <div className="pt-4 border-t">
        <Button onClick={onProceedToCreate} className="w-full gap-2" size="lg" disabled={selectedKeywords.length === 0}>
           <Zap className="w-4 h-4" />
          Create Landing Page with These Settings
           <ArrowRight className="w-4 h-4" />
         </Button>
         <p className="text-xs text-center text-muted-foreground mt-2">
          {selectedKeywords.length} keywords • {Object.values(selectedPlatforms).filter(Boolean).length} platforms • {selectedLocations.length} locations
         </p>
       </div>
     </div>
   );
 }