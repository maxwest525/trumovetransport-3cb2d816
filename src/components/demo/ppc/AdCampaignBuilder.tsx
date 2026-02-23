import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Sparkles, RefreshCw, Layout, Eye } from "lucide-react";
import { BuildSelections } from "./AnalyticsBuilderPanel";
import { cn } from "@/lib/utils";
import { AutomationModeSelector } from "./AutomationModeSelector";
import { PlatformAdPreview } from "./AdPreviewMockups";

interface AdCampaignBuilderProps {
  selections: BuildSelections;
  onBack: () => void;
  onMatchLanding: (style: string) => void;
}

const PLATFORMS = [
  { id: 'fb-feed', label: 'Facebook Feed', group: 'Meta' },
  { id: 'fb-reels', label: 'Facebook Reels', group: 'Meta' },
  { id: 'ig-feed', label: 'Instagram Feed', group: 'Meta' },
  { id: 'ig-stories', label: 'Instagram Stories', group: 'Meta' },
  { id: 'ig-reels', label: 'Instagram Reels', group: 'Meta' },
  { id: 'tiktok', label: 'TikTok', group: 'TikTok' },
  { id: 'yt-shorts', label: 'YouTube Shorts', group: 'Google' },
  { id: 'google-search', label: 'Google Search', group: 'Google' },
  { id: 'google-pmax', label: 'Google PMax', group: 'Google' },
  { id: 'google-display', label: 'Google Display', group: 'Google' },
  { id: 'microsoft', label: 'Microsoft Ads', group: 'Microsoft' },
  { id: 'linkedin', label: 'LinkedIn', group: 'LinkedIn' },
  { id: 'x', label: 'X (Twitter)', group: 'X' },
  { id: 'pinterest', label: 'Pinterest', group: 'Pinterest' },
];

const LANDING_STYLES = [
  { id: 'editorial-dark', label: 'Editorial Dark' },
  { id: 'clean-split-light', label: 'Clean Split Light' },
  { id: 'enterprise-dark-form', label: 'Enterprise Dark Form' },
  { id: 'promo-dark-gradient', label: 'Promo Dark Gradient' },
  { id: 'corporate-light-video', label: 'Corporate Light Video' },
  { id: 'top10-listicle', label: 'Top 10 Listicle' },
];

function generateCopy(platform: string, selections: BuildSelections) {
  const kw = selections.keywords[0] || 'long distance moving';
  const loc = selections.locations[0]?.split(',')[0] || 'your area';
  const audience = selections.demographics[0] || 'homeowners';

  const copies: Record<string, { headlines: string[]; descriptions: string[]; cta: string }> = {
    'Google': {
      headlines: [
        `${kw.replace(/\b\w/g, c => c.toUpperCase())} | AI Quotes in 60s`,
        `Top-Rated Movers in ${loc} — Save 30%`,
        `Compare Verified Movers — Free Estimates`,
      ],
      descriptions: [
        `Get instant AI-powered moving quotes. Trusted by 50,000+ ${audience}. Licensed & insured movers across 48 states. Book online 24/7.`,
        `Real-time tracking, full-value protection, transparent pricing. See why ${audience} choose TruMove for ${kw}.`,
      ],
      cta: 'Get Free Quote',
    },
    'Meta': {
      headlines: [
        `Moving to ${loc}? Get AI-Powered Quotes 🚛`,
        `${loc}'s #1 Rated Moving Company`,
        `Save 30% on ${kw.replace(/\b\w/g, c => c.toUpperCase())}`,
      ],
      descriptions: [
        `Stop overpaying for your move! Our AI estimates are 95% accurate. Join 50,000+ happy ${audience} who saved with TruMove. 🏠➡️🏡`,
        `Free instant quotes · Real-time GPS tracking · Full protection · Rated 4.9/5 stars`,
      ],
      cta: 'Get Your Quote →',
    },
    'TikTok': {
      headlines: [
        `POV: You found the BEST movers 📦`,
        `Moving hack: AI quotes in 60 seconds`,
        `Why ${audience} are switching to TruMove`,
      ],
      descriptions: [
        `Stop stressing about your move. TruMove's AI gives you accurate quotes instantly. No hidden fees, real-time tracking, and movers you can actually trust. 🚛✨`,
      ],
      cta: 'Try It Free',
    },
    'LinkedIn': {
      headlines: [
        `Streamline Corporate Relocations with AI`,
        `TruMove: Enterprise Moving Solutions for ${loc}`,
      ],
      descriptions: [
        `Reduce relocation costs by 30% with AI-powered moving quotes. Trusted by Fortune 500 companies. Guaranteed timelines, full-value protection, dedicated account management.`,
      ],
      cta: 'Request Demo',
    },
    'Microsoft': {
      headlines: [
        `${kw.replace(/\b\w/g, c => c.toUpperCase())} — Instant AI Quotes`,
        `Trusted Movers in ${loc} | Save Up to 30%`,
        `Licensed & Insured — Free Moving Estimates`,
      ],
      descriptions: [
        `Get accurate AI-powered moving quotes in under 60 seconds. Compare verified, FMCSA-licensed movers across 48 states. Full-value protection included.`,
        `Join 50,000+ ${audience} who trust TruMove. Real-time shipment tracking, transparent pricing, no hidden fees. Book your move online today.`,
      ],
      cta: 'Get Your Estimate',
    },
    'Pinterest': {
      headlines: [
        `Your Dream Move Starts Here ✨`,
        `Moving Checklist: AI Does the Heavy Lifting`,
        `Plan Your ${loc} Move the Smart Way`,
      ],
      descriptions: [
        `Planning a big move? Let TruMove's AI handle the quotes while you focus on designing your new space. Accurate estimates, vetted movers, and real-time tracking — all in one place. 📦🏡`,
        `Save this for your next move! Compare top-rated movers, get instant pricing, and track your shipment from pickup to delivery.`,
      ],
      cta: 'Save & Get Quote',
    },
    'X': {
      headlines: [
        `Moving soon? Skip the call-around 📱`,
        `AI moving quotes in 60s — no cap`,
        `${loc} movers ranked by real reviews`,
      ],
      descriptions: [
        `TruMove just quoted my entire cross-country move in under a minute. 50K+ moves completed, 4.9★ rating, real-time GPS tracking. Why is everyone still calling around for quotes?`,
      ],
      cta: 'Get Quoted →',
    },
  };

  // Find matching group
  const p = PLATFORMS.find(pl => pl.id === platform);
  const group = p?.group || 'Meta';
  return copies[group] || copies['Meta'];
}

export function AdCampaignBuilder({ selections, onBack, onMatchLanding }: AdCampaignBuilderProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['fb-feed', 'ig-feed', 'google-search']);
  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [matchStyle, setMatchStyle] = useState('');
  const [showPreviews, setShowPreviews] = useState(true);

  const toggle = (id: string) => {
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => { setIsGenerating(false); setGenerated(true); }, 1500);
  };

  // Group selected platforms
  const groups = PLATFORMS.filter(p => selectedPlatforms.includes(p.id)).reduce((acc, p) => {
    if (!acc[p.group]) acc[p.group] = [];
    acc[p.group].push(p);
    return acc;
  }, {} as Record<string, typeof PLATFORMS>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Button>
        <AutomationModeSelector />
      </div>

      {/* Platform Selection */}
      <Card className="border-border">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Select Platforms</h3>
            <Badge variant="outline" className="text-[10px]">{selectedPlatforms.length} selected</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {PLATFORMS.map(p => (
              <label key={p.id} className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors",
                selectedPlatforms.includes(p.id) ? 'border-foreground/30 bg-muted' : 'border-border hover:border-foreground/20'
              )}>
                <Checkbox checked={selectedPlatforms.includes(p.id)} onCheckedChange={() => toggle(p.id)} />
                <span className="font-medium text-foreground">{p.label}</span>
              </label>
            ))}
          </div>

          <Button onClick={handleGenerate} disabled={selectedPlatforms.length === 0 || isGenerating} className="w-full gap-2">
            {isGenerating ? <><RefreshCw className="w-4 h-4 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4" />Generate Copy Preview</>}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Copy */}
      {generated && (
        <div className="space-y-5">
          {/* KPI Summary Boxes — like the reference image stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Keywords', value: selections.keywords.length.toString(), sub: selections.keywords[0] || '—', color: 'from-violet-500 to-purple-600' },
              { label: 'Regions', value: selections.locations.length.toString(), sub: selections.locations[0]?.split(',')[0] || '—', color: 'from-sky-500 to-blue-600' },
              { label: 'Platforms', value: selectedPlatforms.length.toString(), sub: `${Object.keys(groups).length} groups`, color: 'from-emerald-500 to-teal-600' },
              { label: 'Audience', value: selections.demographics.length.toString(), sub: selections.demographics[0] || '—', color: 'from-amber-500 to-orange-600' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <div className={cn("w-6 h-6 rounded-md bg-gradient-to-br flex items-center justify-center", stat.color)}>
                    <span className="text-[10px] font-bold text-white">{stat.value}</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground truncate">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Preview toggle */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Generated Ad Copy</h3>
            <button
              onClick={() => setShowPreviews(!showPreviews)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                showPreviews ? 'bg-foreground text-background border-foreground' : 'text-muted-foreground border-border hover:border-foreground/30'
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              {showPreviews ? 'Previews On' : 'Previews Off'}
            </button>
          </div>

          {/* Platform Groups — box grid layout */}
          {Object.entries(groups).map(([group, platforms]) => {
            const copy = generateCopy(platforms[0].id, selections);
            return (
              <Card key={group} className="border-border overflow-hidden">
                <CardContent className="p-0">
                  {/* Group header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                    <h4 className="text-sm font-semibold text-foreground">{group}</h4>
                    <div className="flex gap-1 flex-wrap">
                      {platforms.map(p => <Badge key={p.id} variant="secondary" className="text-[10px]">{p.label}</Badge>)}
                    </div>
                  </div>

                  {/* Headline boxes — horizontal grid */}
                  <div className="p-4 space-y-3">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Headlines</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {copy.headlines.map((h, i) => (
                        <div key={i} className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase">H{i + 1}</div>
                          <div className="text-sm font-semibold text-foreground leading-snug">{h}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description boxes */}
                  <div className="px-4 pb-4 space-y-3">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Descriptions</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {copy.descriptions.map((d, i) => (
                        <div key={i} className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase">D{i + 1}</div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{d}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA box */}
                  <div className="px-4 pb-4">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-2.5">
                      <span className="text-[9px] font-semibold text-muted-foreground uppercase">CTA</span>
                      <Badge className="text-xs">{copy.cta}</Badge>
                    </div>
                  </div>

                  {/* Visual Ad Previews */}
                  {showPreviews && (
                    <div className="border-t border-border p-4">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ad Preview Mockups</div>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {platforms.map(p => (
                          <div key={p.id} className="shrink-0">
                            <div className="text-[10px] font-medium text-muted-foreground mb-2 text-center">{p.label}</div>
                            <div className="rounded-lg overflow-hidden shadow-sm border border-border/50">
                              <PlatformAdPreview platformId={p.id} copy={copy} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Match Landing Style */}
          <Card className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-foreground">Match Landing Page Style</h4>
              </div>
              <div className="flex gap-2 flex-wrap">
                {LANDING_STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setMatchStyle(s.id); onMatchLanding(s.id); }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      matchStyle === s.id ? 'bg-foreground text-background border-foreground' : 'text-muted-foreground border-border hover:border-foreground/30'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {matchStyle && (
                <p className="text-xs text-muted-foreground">Landing page will use the <span className="font-semibold text-foreground">{LANDING_STYLES.find(s => s.id === matchStyle)?.label}</span> template when visitors click your ads.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
