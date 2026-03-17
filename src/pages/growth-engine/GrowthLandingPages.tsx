import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone, ClipboardList, Globe, Star, ArrowRight,
  Lightbulb, CheckCircle2, BarChart3, Zap,
  Target, TrendingUp, Eye, ChevronDown, ChevronUp,
  Play, Pause, RotateCcw, ArrowUpRight
} from "lucide-react";
import { useState, useMemo } from "react";
import LandingPageWizard from "@/components/growth-engine/landing-pages/LandingPageWizard";
import LandingPageRecommendation from "@/components/growth-engine/landing-pages/LandingPageRecommendation";
import PageTypeCards from "@/components/growth-engine/landing-pages/PageTypeCards";
import MetaComparison from "@/components/growth-engine/landing-pages/MetaComparison";
import TestingWorkflow from "@/components/growth-engine/landing-pages/TestingWorkflow";

export type WizardSelections = {
  trafficSource: string | null;
  goal: string | null;
  leadStyle: string | null;
  capture: string | null;
};

export default function GrowthLandingPages() {
  const [selections, setSelections] = useState<WizardSelections>({
    trafficSource: null,
    goal: null,
    leadStyle: null,
    capture: null,
  });

  const updateSelection = (key: keyof WizardSelections, value: string) => {
    setSelections(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const hasSelections = Object.values(selections).some(Boolean);

  return (
    <GrowthEngineShell>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Landing Page Selector</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Choose the right page type for your interstate moving campaigns
          </p>
        </div>

        {/* Wizard */}
        <LandingPageWizard selections={selections} onSelect={updateSelection} />

        {/* Recommendation */}
        {hasSelections && <LandingPageRecommendation selections={selections} />}

        {/* Page Types */}
        <PageTypeCards />

        {/* Meta Comparison */}
        <MetaComparison />

        {/* Testing Workflow */}
        <TestingWorkflow />
      </div>
    </GrowthEngineShell>
  );
}
