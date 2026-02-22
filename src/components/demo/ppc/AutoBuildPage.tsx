import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, CheckCircle2, Rocket, Loader2, Star,
  TrendingUp, Zap, ArrowRight, Target, Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoBuildPageProps {
  onBuild: (variationId: string) => void;
  onCancel: () => void;
}

const AI_VARIATIONS = [
  {
    id: "high-convert",
    title: "High-Converting Quote Funnel",
    description: "Optimized for maximum lead capture with urgency triggers, social proof, and a 2-step form",
    template: "quote-funnel",
    stats: { convRate: "15.8%", cpa: "$18.40", avgTime: "2m 12s" },
    tags: ["Best for Leads", "Urgency-Driven"],
    recommended: true,
    reasoning: "Based on your top-performing keywords and demographics, this template matches 87% of your converting audience.",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "calculator",
    title: "Interactive Cost Calculator",
    description: "Tool-first approach that captures leads through utility. Users engage longer and convert with higher intent.",
    template: "calculator",
    stats: { convRate: "12.4%", cpa: "$22.10", avgTime: "3m 45s" },
    tags: ["High Engagement", "Tool-Based"],
    recommended: false,
    reasoning: "Calculator pages show 3.2x longer session duration. Great for price-conscious segments (28% of your traffic).",
    color: "from-sky-500 to-blue-600",
  },
  {
    id: "social-proof",
    title: "Testimonial-Heavy Trust Page",
    description: "Social proof focused with video testimonials, review badges, and case study highlights.",
    template: "testimonial",
    stats: { convRate: "11.1%", cpa: "$24.80", avgTime: "2m 58s" },
    tags: ["Trust-Focused", "Video-Ready"],
    recommended: false,
    reasoning: "Users who interact with testimonials convert 2.3x more. Ideal for your 55+ audience segment (18% of traffic).",
    color: "from-amber-500 to-orange-600",
  },
];

export function AutoBuildPage({ onBuild, onCancel }: AutoBuildPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState(0);

  const buildSteps = [
    "Analyzing your data...",
    "Generating optimized copy...",
    "Building page structure...",
    "Adding trust elements...",
    "Finalizing your page...",
  ];

  const handleBuild = (id: string) => {
    setSelectedId(id);
    setIsBuilding(true);
    setBuildStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setBuildStep(step);
      if (step >= buildSteps.length) {
        clearInterval(interval);
        setTimeout(() => onBuild(id), 400);
      }
    }, 500);
  };

  if (isBuilding) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center">
            <Rocket className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-foreground">Building your page...</h2>
          <p className="text-sm text-muted-foreground">
            AI is creating your {AI_VARIATIONS.find(v => v.id === selectedId)?.title}
          </p>
        </div>
        <div className="w-full max-w-xs space-y-3">
          <Progress value={(buildStep / buildSteps.length) * 100} className="h-2" />
          <div className="space-y-1.5">
            {buildSteps.map((stepText, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 text-sm transition-all duration-300",
                  i < buildStep ? "text-primary" : i === buildStep ? "text-foreground" : "text-muted-foreground/40"
                )}
              >
                {i < buildStep ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : i === buildStep ? (
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20">
          <Rocket className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">AI Auto-Build</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">3 AI-Optimized Options</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Based on your analytics data, AI has selected the best-performing page variations. Pick one and we'll build it instantly.
        </p>
      </div>

      {/* 3 Variations */}
      <div className="space-y-4">
        {AI_VARIATIONS.map((variation) => (
          <Card
            key={variation.id}
            className={cn(
              "group cursor-pointer border-2 transition-all duration-200 hover:shadow-lg overflow-hidden relative",
              variation.recommended
                ? "border-primary/50 bg-gradient-to-r from-primary/5 to-transparent"
                : "border-transparent hover:border-border"
            )}
            onClick={() => handleBuild(variation.id)}
          >
            {variation.recommended && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-primary text-primary-foreground gap-1 text-xs">
                  <Star className="w-3 h-3" /> Recommended
                </Badge>
              </div>
            )}
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0",
                  variation.color
                )}>
                  {variation.id === "high-convert" && <Target className="w-6 h-6 text-white" />}
                  {variation.id === "calculator" && <Zap className="w-6 h-6 text-white" />}
                  {variation.id === "social-proof" && <Users className="w-6 h-6 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                    {variation.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{variation.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border text-center">
                  <p className="text-lg font-bold text-primary">{variation.stats.convRate}</p>
                  <p className="text-[10px] text-muted-foreground">Est. Conv. Rate</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border text-center">
                  <p className="text-lg font-bold text-foreground">{variation.stats.cpa}</p>
                  <p className="text-[10px] text-muted-foreground">Est. CPA</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border text-center">
                  <p className="text-lg font-bold text-foreground">{variation.stats.avgTime}</p>
                  <p className="text-[10px] text-muted-foreground">Avg. Session</p>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-primary flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{variation.reasoning}</span>
                </p>
              </div>

              {/* Tags + Build Button */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {variation.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 group-hover:translate-x-1 transition-transform"
                  style={variation.recommended
                    ? { background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)" }
                    : undefined
                  }
                  variant={variation.recommended ? "default" : "outline"}
                >
                  <Rocket className="w-3.5 h-3.5" />
                  Build This
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={onCancel} className="text-muted-foreground">
          ← Back to Hub
        </Button>
      </div>
    </div>
  );
}
