import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Sparkles, ArrowRight, ArrowLeft, CheckCircle2,
  FileText, Calculator, Users, MapPin, Award,
  Building2, Phone, Globe, Target, Loader2,
  Layout, MessageSquare, Star, Zap, Plus,
  DollarSign, Palette, Link, AlertTriangle, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickStartWizardProps {
  onComplete: (pageData: PageData) => void;
  onCancel: () => void;
  initialData?: Partial<PageData>;
}

export interface PageData {
  goal: string;
  businessName: string;
  location: string;
  phone: string;
  service: string;
  uniqueValue: string;
  // Ad automation requirements
  headline: string;
  description: string;
  cta: string;
  redirectUrl: string;
  dailyBudget: string;
  targetAudience: string;
  brandColor: string;
  logoUrl: string;
  // Tracking
  trackingPixel: string;
  conversionEvent: string;
}

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  conversionRate: string;
  recommended?: boolean;
  whyRecommended?: string;
}

const GOALS: GoalOption[] = [
  {
    id: 'quote',
    title: 'Get Quote Requests',
    description: 'Capture leads with a fast quote form',
    icon: FileText,
    color: '#7C3AED',
    conversionRate: '12.4%',
    recommended: true,
    whyRecommended: 'Highest conversion rate for moving services',
  },
  {
    id: 'compare',
    title: 'Compare Services',
    description: 'Show why you\'re better than competitors',
    icon: Award,
    color: '#10B981',
    conversionRate: '8.7%',
    whyRecommended: 'Best for competitive markets with many movers',
  },
  {
    id: 'calculator',
    title: 'Calculate Costs',
    description: 'Interactive pricing calculator',
    icon: Calculator,
    color: '#F59E0B',
    conversionRate: '15.8%',
    recommended: true,
    whyRecommended: 'Engages users & qualifies leads automatically',
  },
  {
    id: 'testimonials',
    title: 'Show Testimonials',
    description: 'Build trust with customer reviews',
    icon: Users,
    color: '#EC4899',
    conversionRate: '6.7%',
    whyRecommended: 'Best for building trust with new customers',
  },
  {
    id: 'local',
    title: 'Target Local Area',
    description: 'Location-specific landing page',
    icon: MapPin,
    color: '#3B82F6',
    conversionRate: '9.2%',
    whyRecommended: 'Great for local SEO and geo-targeted ads',
  },
  {
    id: 'custom',
    title: 'Start from Scratch',
    description: 'Build a completely custom page',
    icon: Plus,
    color: '#64748B',
    conversionRate: 'Varies',
  },
];

const SERVICE_OPTIONS = [
  'Long Distance Moving',
  'Local Moving', 
  'Commercial Moving',
  'Packing Services',
  'Storage Solutions',
  'Senior Moving',
  'Military/Relocation',
  'Custom',
];

const CTA_OPTIONS = [
  { label: 'Get Free Quote', recommended: true, reason: 'Highest CTR for moving' },
  { label: 'Calculate My Move', recommended: true, reason: 'Engages price-conscious users' },
  { label: 'Book Now', recommended: false, reason: 'Direct but lower conversion' },
  { label: 'Call Now', recommended: false, reason: 'Good for phone-first audiences' },
  { label: 'Learn More', recommended: false, reason: 'Lower intent, use for awareness' },
  { label: 'Custom', recommended: false, reason: '' },
];

const AUDIENCE_OPTIONS = [
  { label: 'Homeowners Moving', recommended: true, reason: 'Highest value leads' },
  { label: 'Renters Relocating', recommended: false, reason: 'Volume over value' },
  { label: 'Seniors Downsizing', recommended: true, reason: 'High-touch, premium service' },
  { label: 'Military Families', recommended: false, reason: 'Niche but loyal' },
  { label: 'Corporate/Business', recommended: false, reason: 'B2B opportunities' },
  { label: 'Custom', recommended: false, reason: '' },
];

// Minimum requirements for ad automation
const AD_REQUIREMENTS = {
  google: ['headline', 'description', 'redirectUrl', 'dailyBudget'],
  meta: ['headline', 'description', 'redirectUrl', 'dailyBudget', 'targetAudience'],
  tiktok: ['headline', 'description', 'redirectUrl', 'dailyBudget', 'targetAudience'],
};

export function QuickStartWizard({ onComplete, onCancel, initialData }: QuickStartWizardProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customService, setCustomService] = useState("");
  const [customCta, setCustomCta] = useState("");
  const [customAudience, setCustomAudience] = useState("");
  
  const [pageData, setPageData] = useState<PageData>({
    goal: initialData?.goal || '',
    businessName: initialData?.businessName || 'TruMove',
    location: initialData?.location || '',
    phone: initialData?.phone || '',
    service: initialData?.service || '',
    uniqueValue: initialData?.uniqueValue || '',
    headline: initialData?.headline || '',
    description: initialData?.description || '',
    cta: initialData?.cta || '',
    redirectUrl: initialData?.redirectUrl || '',
    dailyBudget: initialData?.dailyBudget || '$50',
    targetAudience: initialData?.targetAudience || '',
    brandColor: initialData?.brandColor || '#7C3AED',
    logoUrl: initialData?.logoUrl || '',
    trackingPixel: initialData?.trackingPixel || '',
    conversionEvent: initialData?.conversionEvent || 'lead_submit',
  });

  const [generationStep, setGenerationStep] = useState(0);
  const generationSteps = [
    'Analyzing your requirements...',
    'Writing compelling headlines...',
    'Generating ad copy variations...',
    'Optimizing for conversions...',
    'Preparing platform assets...',
    'Finalizing your campaign...',
  ];

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      setGenerationStep(currentStep);
      
      if (currentStep >= generationSteps.length) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete(pageData);
        }, 500);
      }
    }, 600);
  };

  // Check if all required fields for ad automation are filled
  const getCompletionStatus = () => {
    const required = ['headline', 'description', 'redirectUrl', 'dailyBudget', 'businessName', 'location'];
    const filled = required.filter(field => pageData[field as keyof PageData]);
    return { filled: filled.length, total: required.length, percent: (filled.length / required.length) * 100 };
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!pageData.goal;
      case 2: return !!pageData.businessName && !!pageData.location && !!pageData.service;
      case 3: return !!pageData.headline && !!pageData.description && !!pageData.cta;
      case 4: return !!pageData.redirectUrl;
      default: return false;
    }
  };

  const completionStatus = getCompletionStatus();

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-white animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Creating your campaign...</h2>
          <p className="text-muted-foreground">AI is preparing assets for all platforms</p>
        </div>

        <div className="w-full max-w-xs space-y-4">
          <Progress value={(generationStep / generationSteps.length) * 100} className="h-2" />
          <div className="space-y-2">
            {generationSteps.map((stepText, i) => (
              <div 
                key={i}
                className={cn(
                  "flex items-center gap-2 text-sm transition-all duration-300",
                  i < generationStep ? 'text-primary' : i === generationStep ? 'text-foreground' : 'text-muted-foreground/50'
                )}
              >
                {i < generationStep ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : i === generationStep ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                )}
                {stepText}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Step {step} of {totalSteps}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Zap className="w-3 h-3" />
              Quick Create
            </Badge>
            <Badge 
              variant={completionStatus.percent === 100 ? "default" : "outline"} 
              className={cn(
                "gap-1",
                completionStatus.percent === 100 && "bg-green-500"
              )}
            >
              <CheckCircle2 className="w-3 h-3" />
              {completionStatus.filled}/{completionStatus.total} Required
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step 1: Choose Goal */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">What's your landing page for?</h2>
            <p className="text-muted-foreground">Choose a template or start from scratch</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {GOALS.map((goal) => (
              <Card
                key={goal.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 relative overflow-hidden",
                  pageData.goal === goal.id
                    ? 'border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-2 border-transparent hover:border-primary/30'
                )}
                onClick={() => setPageData(prev => ({ ...prev, goal: goal.id }))}
              >
                {goal.recommended && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                    RECOMMENDED
                  </div>
                )}
                <CardContent className="p-4 flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${goal.color}20` }}
                  >
                    <goal.icon className="w-6 h-6" style={{ color: goal.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                    {goal.whyRecommended && (
                      <p className="text-xs text-primary mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        {goal.whyRecommended}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {goal.id !== 'custom' && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ background: `${goal.color}15`, color: goal.color }}
                      >
                        {goal.conversionRate} avg
                      </Badge>
                    )}
                  </div>
                  {pageData.goal === goal.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Business Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">Business Details</h2>
            <p className="text-muted-foreground">Required for ad automation on all platforms</p>
          </div>

          <Card className="border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Business Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Your Company Name"
                    value={pageData.businessName}
                    onChange={(e) => setPageData(prev => ({ ...prev, businessName: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone
                  </Label>
                  <Input
                    placeholder="1-800-XXX-XXXX"
                    value={pageData.phone}
                    onChange={(e) => setPageData(prev => ({ ...prev, phone: e.target.value }))}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Target Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g., California, Los Angeles, or Nationwide"
                  value={pageData.location}
                  onChange={(e) => setPageData(prev => ({ ...prev, location: e.target.value }))}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Used for geo-targeting on Google, Meta, and TikTok</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  Main Service <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_OPTIONS.map((service) => (
                    <Badge
                      key={service}
                      variant={pageData.service === service || (service === 'Custom' && customService) ? 'default' : 'outline'}
                      className="cursor-pointer py-2 px-3 text-sm transition-all hover:scale-105"
                      onClick={() => {
                        if (service === 'Custom') {
                          setPageData(prev => ({ ...prev, service: customService || 'Custom' }));
                        } else {
                          setPageData(prev => ({ ...prev, service }));
                          setCustomService("");
                        }
                      }}
                    >
                      {service}
                    </Badge>
                  ))}
                </div>
                {(pageData.service === 'Custom' || customService) && (
                  <Input
                    placeholder="Enter your custom service..."
                    value={customService}
                    onChange={(e) => {
                      setCustomService(e.target.value);
                      setPageData(prev => ({ ...prev, service: e.target.value || 'Custom' }));
                    }}
                    className="mt-2 h-10"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    Brand Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={pageData.brandColor}
                      onChange={(e) => setPageData(prev => ({ ...prev, brandColor: e.target.value }))}
                      className="w-14 h-11 p-1 cursor-pointer"
                    />
                    <Input
                      value={pageData.brandColor}
                      onChange={(e) => setPageData(prev => ({ ...prev, brandColor: e.target.value }))}
                      className="h-11 flex-1"
                      placeholder="#7C3AED"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Logo URL
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={pageData.logoUrl}
                    onChange={(e) => setPageData(prev => ({ ...prev, logoUrl: e.target.value }))}
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Ad Copy - Select or Create */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">Ad Copy & CTA</h2>
            <p className="text-muted-foreground">Select recommended or write your own</p>
          </div>

          <Card className="border-2 border-primary/20">
            <CardContent className="p-6 space-y-5">
              {/* Headline */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Headline <span className="text-destructive">*</span>
                  <Badge variant="outline" className="text-[10px] ml-auto">Max 30 chars for Google</Badge>
                </Label>
                
                <div className="grid grid-cols-1 gap-2 mb-2">
                  {[
                    { text: `${pageData.businessName} - ${pageData.location} Movers`, recommended: true, reason: 'Local + brand recognition' },
                    { text: 'Get Your Free Moving Quote Today', recommended: true, reason: 'Action-oriented, high CTR' },
                    { text: `Trusted ${pageData.service} Experts`, recommended: false, reason: 'Service-focused' },
                  ].map((option, i) => (
                    <button
                      key={i}
                      onClick={() => setPageData(prev => ({ ...prev, headline: option.text }))}
                      className={cn(
                        "p-3 rounded-lg border-2 text-left transition-all",
                        pageData.headline === option.text
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{option.text}</span>
                        {option.recommended && (
                          <Badge variant="secondary" className="text-[9px]">Recommended</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{option.reason}</span>
                    </button>
                  ))}
                </div>
                
                <div className="relative">
                  <Input
                    placeholder="Or write your own headline..."
                    value={pageData.headline}
                    onChange={(e) => setPageData(prev => ({ ...prev, headline: e.target.value }))}
                    className="h-11 pr-16"
                    maxLength={60}
                  />
                  <span className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 text-xs",
                    pageData.headline.length > 30 ? "text-orange-500" : "text-muted-foreground"
                  )}>
                    {pageData.headline.length}/60
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <FileText className="w-4 h-4 text-primary" />
                  Description <span className="text-destructive">*</span>
                  <Badge variant="outline" className="text-[10px] ml-auto">Max 90 chars for Google</Badge>
                </Label>
                
                <div className="grid grid-cols-1 gap-2 mb-2">
                  {[
                    { text: 'Get accurate quotes in 60 seconds. Compare verified movers. No hidden fees.', recommended: true, reason: 'Feature + trust focused' },
                    { text: `Professional ${pageData.service} with transparent pricing. Free estimates!`, recommended: false, reason: 'Service + offer focused' },
                  ].map((option, i) => (
                    <button
                      key={i}
                      onClick={() => setPageData(prev => ({ ...prev, description: option.text }))}
                      className={cn(
                        "p-3 rounded-lg border-2 text-left transition-all",
                        pageData.description === option.text
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{option.text}</span>
                        {option.recommended && (
                          <Badge variant="secondary" className="text-[9px] ml-2 shrink-0">Recommended</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{option.reason}</span>
                    </button>
                  ))}
                </div>
                
                <div className="relative">
                  <Textarea
                    placeholder="Or write your own description..."
                    value={pageData.description}
                    onChange={(e) => setPageData(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[80px] pr-16"
                    maxLength={150}
                  />
                  <span className={cn(
                    "absolute right-3 bottom-3 text-xs",
                    pageData.description.length > 90 ? "text-orange-500" : "text-muted-foreground"
                  )}>
                    {pageData.description.length}/150
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <Zap className="w-4 h-4 text-primary" />
                  Call to Action <span className="text-destructive">*</span>
                </Label>
                
                <div className="flex flex-wrap gap-2">
                  {CTA_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        if (option.label === 'Custom') {
                          setPageData(prev => ({ ...prev, cta: customCta || '' }));
                        } else {
                          setPageData(prev => ({ ...prev, cta: option.label }));
                          setCustomCta("");
                        }
                      }}
                      className={cn(
                        "relative px-4 py-2 rounded-lg border-2 transition-all text-sm",
                        pageData.cta === option.label || (option.label === 'Custom' && customCta && pageData.cta === customCta)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {option.recommended && (
                        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-primary" />
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {(pageData.cta === '' || customCta || !CTA_OPTIONS.find(o => o.label === pageData.cta)) && (
                  <Input
                    placeholder="Enter your custom CTA..."
                    value={customCta}
                    onChange={(e) => {
                      setCustomCta(e.target.value);
                      setPageData(prev => ({ ...prev, cta: e.target.value }));
                    }}
                    className="h-10"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Targeting & Budget */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">Targeting & Budget</h2>
            <p className="text-muted-foreground">Required for ad automation</p>
          </div>

          <Card className="border-2 border-primary/20">
            <CardContent className="p-6 space-y-5">
              {/* Redirect URL */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-primary" />
                  Redirect URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="https://yourwebsite.com/thank-you"
                  value={pageData.redirectUrl}
                  onChange={(e) => setPageData(prev => ({ ...prev, redirectUrl: e.target.value }))}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Where users go after submitting the form (required for conversion tracking)
                </p>
              </div>

              {/* Daily Budget */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Daily Budget
                </Label>
                <div className="flex flex-wrap gap-2">
                  {['$25', '$50', '$100', '$250', '$500', 'Custom'].map((budget) => (
                    <button
                      key={budget}
                      onClick={() => setPageData(prev => ({ ...prev, dailyBudget: budget }))}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium",
                        pageData.dailyBudget === budget
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                        budget === '$50' && "ring-2 ring-primary/20"
                      )}
                    >
                      {budget}
                      {budget === '$50' && <span className="text-[9px] ml-1 text-primary">Recommended</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Target Audience
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {AUDIENCE_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        if (option.label === 'Custom') {
                          setPageData(prev => ({ ...prev, targetAudience: customAudience || '' }));
                        } else {
                          setPageData(prev => ({ ...prev, targetAudience: option.label }));
                          setCustomAudience("");
                        }
                      }}
                      className={cn(
                        "p-3 rounded-lg border-2 text-left transition-all",
                        pageData.targetAudience === option.label || (option.label === 'Custom' && customAudience)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{option.label}</span>
                        {option.recommended && (
                          <Badge variant="secondary" className="text-[9px]">★</Badge>
                        )}
                      </div>
                      {option.reason && (
                        <span className="text-xs text-muted-foreground">{option.reason}</span>
                      )}
                    </button>
                  ))}
                </div>
                {(pageData.targetAudience === '' || customAudience) && (
                  <Input
                    placeholder="Describe your target audience..."
                    value={customAudience}
                    onChange={(e) => {
                      setCustomAudience(e.target.value);
                      setPageData(prev => ({ ...prev, targetAudience: e.target.value }));
                    }}
                    className="h-10 mt-2"
                  />
                )}
              </div>

              {/* Optional Tracking */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  Tracking Pixel ID (optional)
                </Label>
                <Input
                  placeholder="e.g., Facebook Pixel ID, Google Tag ID"
                  value={pageData.trackingPixel}
                  onChange={(e) => setPageData(prev => ({ ...prev, trackingPixel: e.target.value }))}
                  className="h-10"
                />
              </div>

              {/* Completion Status */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-3 mt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {completionStatus.percent === 100 ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                  Ad Automation Readiness
                </div>
                <Progress value={completionStatus.percent} className="h-2" />
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className={cn("w-3 h-3", pageData.headline ? "text-primary" : "text-muted-foreground")} />
                    <span className={pageData.headline ? "" : "text-muted-foreground"}>Headline</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className={cn("w-3 h-3", pageData.description ? "text-primary" : "text-muted-foreground")} />
                    <span className={pageData.description ? "" : "text-muted-foreground"}>Description</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className={cn("w-3 h-3", pageData.redirectUrl ? "text-primary" : "text-muted-foreground")} />
                    <span className={pageData.redirectUrl ? "" : "text-muted-foreground"}>Redirect URL</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          className="flex-1 gap-2"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button 
          className="flex-1 gap-2"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' }}
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {step === totalSteps ? (
            <>
              <Sparkles className="w-4 h-4" />
              Create Campaign
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
