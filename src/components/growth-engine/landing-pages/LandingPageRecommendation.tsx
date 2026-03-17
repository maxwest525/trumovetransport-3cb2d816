import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, BarChart3, Phone, ClipboardList, Zap, Target } from "lucide-react";
import type { WizardSelections } from "@/pages/growth-engine/GrowthLandingPages";

type Recommendation = {
  best: string;
  backup: string;
  why: string;
  cta: string;
  routing: string;
  kpi: string;
};

function getRecommendation(s: WizardSelections): Recommendation {
  const src = s.trafficSource;
  const goal = s.goal;
  const style = s.leadStyle;
  const capture = s.capture;

  // Meta instant form path
  if (src === "meta" || capture === "instant") {
    return {
      best: "Meta Instant Form",
      backup: "Simple Quote Form LP",
      why: "Meta traffic converts best with in-app forms. No page load friction.",
      cta: "Get My Free Quote (auto-fill)",
      routing: "Instant form → attribution → webhook → Convoso",
      kpi: "Cost per lead, form completion rate",
    };
  }

  // Call-first path
  if (goal === "calls" || goal === "speed" || style === "urgent" || capture === "call") {
    return {
      best: "Call-First Landing Page",
      backup: "Full LP with dual CTA",
      why: "High-intent searchers ready to act. Fastest speed-to-lead for interstate moves.",
      cta: "Call Now for Free Quote (sticky button)",
      routing: "Call → CallRail attribution → webhook → Convoso",
      kpi: "Call rate, speed-to-answer, booked rate",
    };
  }

  // Quality / research path
  if (goal === "quality" || style === "researching" || style === "route") {
    return {
      best: "Quote Form Landing Page",
      backup: "Long-form Authority Page",
      why: "Captures detailed move info upfront. Filters casual browsers from serious movers.",
      cta: "Get My Interstate Moving Quote",
      routing: "Form submit → attribution → webhook → Convoso",
      kpi: "Form rate, lead quality score, close rate",
    };
  }

  // Form path
  if (goal === "forms" || capture === "form") {
    return {
      best: "Quote Form Landing Page",
      backup: "Call-First Landing Page",
      why: "Structured form captures origin, destination, move date. Better lead context for agents.",
      cta: "Get Your Free Quote",
      routing: "Form → attribution → webhook → Convoso queue",
      kpi: "Form completion rate, cost per qualified lead",
    };
  }

  // Retargeting
  if (src === "retargeting") {
    return {
      best: "Quote Form Landing Page",
      backup: "Call-First Landing Page",
      why: "Retargeted visitors already know you. A form page re-engages them with a clear next step.",
      cta: "Still planning your move? Get your quote.",
      routing: "Form → Convoso with retargeting tag",
      kpi: "Return visit conversion rate",
    };
  }

  // Default
  return {
    best: "Call-First Landing Page",
    backup: "Quote Form Landing Page",
    why: "Start with the highest-converting format for interstate leads from Google Search.",
    cta: "Call Now or Get a Free Quote",
    routing: "Call/Form → Convoso instant route",
    kpi: "Conversion rate, cost per lead",
  };
}

interface Props {
  selections: WizardSelections;
}

export default function LandingPageRecommendation({ selections }: Props) {
  const rec = getRecommendation(selections);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] font-medium">Step 2</Badge>
          <span className="text-sm font-semibold text-foreground">Recommended Setup</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Best */}
          <div className="p-3 rounded-lg bg-background border space-y-1.5">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">Best Page Type</span>
            </div>
            <p className="text-sm font-bold text-foreground">{rec.best}</p>
            <p className="text-xs text-muted-foreground">{rec.why}</p>
          </div>

          {/* Backup */}
          <div className="p-3 rounded-lg bg-background border space-y-1.5">
            <div className="flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Backup Option</span>
            </div>
            <p className="text-sm font-bold text-foreground">{rec.backup}</p>
          </div>

          {/* KPI */}
          <div className="p-3 rounded-lg bg-background border space-y-1.5">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Monitor First</span>
            </div>
            <p className="text-sm font-bold text-foreground">{rec.kpi}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline" className="text-[10px]">
            <Phone className="w-3 h-3 mr-1" />
            CTA: {rec.cta}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            <Target className="w-3 h-3 mr-1" />
            Route: {rec.routing}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
