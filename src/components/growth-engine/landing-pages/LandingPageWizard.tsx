import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, ClipboardList, Zap, HelpCircle, Search, Target, Clock, DollarSign, Flame, BookOpen, MapPin, Globe } from "lucide-react";
import type { WizardSelections } from "@/pages/growth-engine/GrowthLandingPages";

const STEPS = [
  {
    key: "trafficSource" as const,
    label: "Traffic Source",
    options: [
      { value: "google", label: "Google Search", icon: Search },
      { value: "meta", label: "Meta Ads", icon: Target },
      { value: "retargeting", label: "Retargeting", icon: Globe },
    ],
  },
  {
    key: "goal" as const,
    label: "Primary Goal",
    options: [
      { value: "calls", label: "More Calls", icon: Phone },
      { value: "forms", label: "More Forms", icon: ClipboardList },
      { value: "quality", label: "Higher Quality", icon: Target },
      { value: "speed", label: "Faster Speed-to-Lead", icon: Zap },
    ],
  },
  {
    key: "leadStyle" as const,
    label: "Lead Style",
    options: [
      { value: "urgent", label: "Urgent", icon: Flame },
      { value: "researching", label: "Researching", icon: BookOpen },
      { value: "route", label: "Route-Specific", icon: MapPin },
      { value: "general", label: "General Quote", icon: Globe },
    ],
  },
  {
    key: "capture" as const,
    label: "Capture Method",
    options: [
      { value: "call", label: "Call-First", icon: Phone },
      { value: "form", label: "Quote Form", icon: ClipboardList },
      { value: "instant", label: "Meta Instant Form", icon: Zap },
      { value: "unsure", label: "Not Sure", icon: HelpCircle },
    ],
  },
];

interface Props {
  selections: WizardSelections;
  onSelect: (key: keyof WizardSelections, value: string) => void;
}

export default function LandingPageWizard({ selections, onSelect }: Props) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] font-medium">Step 1</Badge>
          <span className="text-sm font-semibold text-foreground">What are you building for?</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((step, i) => (
            <div key={step.key} className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">{step.label}</span>
              <div className="space-y-1.5">
                {step.options.map((opt) => {
                  const Icon = opt.icon;
                  const selected = selections[step.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => onSelect(step.key, opt.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all border ${
                        selected
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
