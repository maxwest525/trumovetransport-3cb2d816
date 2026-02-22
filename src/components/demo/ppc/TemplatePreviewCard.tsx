import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { 
  FileText, Calculator, Users, MapPin, Award, Layers,
  CheckCircle2, TrendingUp, Sparkles, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string;
  conversion: string;
  style: string;
}

interface TemplatePreviewCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// Template preview content (simulated)
const TEMPLATE_PREVIEWS: Record<string, {
  heroText: string;
  subText: string;
  features: string[];
  color: string;
  icon: React.ElementType;
}> = {
  "quote-funnel": {
    heroText: "Get Your Free Moving Quote in 60 Seconds",
    subText: "Join 50,000+ families who saved an average of $847",
    features: ["Urgency timer", "Trust badges", "3-field form"],
    color: "#22C55E",
    icon: FileText,
  },
  "comparison": {
    heroText: "See How We Compare to Other Movers",
    subText: "Side-by-side pricing & service comparison",
    features: ["Comparison table", "Checkmark grid", "Winner badge"],
    color: "#3B82F6",
    icon: Award,
  },
  "calculator": {
    heroText: "Calculate Your Moving Cost Instantly",
    subText: "AI-powered estimates in under 2 minutes",
    features: ["Interactive form", "Live price update", "Room selector"],
    color: "#F59E0B",
    icon: Calculator,
  },
  "testimonial": {
    heroText: "See Why 50,000+ Families Trust Us",
    subText: "Real stories from real customers",
    features: ["Video testimonials", "Star ratings", "Before/after"],
    color: "#EC4899",
    icon: Users,
  },
  "local-seo": {
    heroText: "[City]'s #1 Rated Moving Company",
    subText: "Serving [Area] for over 15 years",
    features: ["City name injection", "Local reviews", "Map embed"],
    color: "#8B5CF6",
    icon: MapPin,
  },
  "long-form": {
    heroText: "Everything You Need to Know About Moving",
    subText: "Complete guide + exclusive offer",
    features: ["FAQ accordion", "Sticky CTA", "Social proof"],
    color: "#EF4444",
    icon: Layers,
  },
};

export function TemplatePreviewCard({ template, isSelected, onSelect }: TemplatePreviewCardProps) {
  const preview = TEMPLATE_PREVIEWS[template.id] || TEMPLATE_PREVIEWS["quote-funnel"];
  const IconComponent = preview.icon;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Card
          className={cn(
            "cursor-pointer transition-all duration-200 relative overflow-hidden",
            isSelected
              ? "border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10"
              : "border-2 border-transparent hover:border-primary/30"
          )}
          onClick={() => onSelect(template.id)}
        >
          <CardContent className="p-4 flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${preview.color}20` }}
            >
              <IconComponent className="w-5 h-5" style={{ color: preview.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground">{template.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
            </div>
            <div className="text-right shrink-0">
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{ background: `${preview.color}15`, color: preview.color }}
              >
                {template.conversion}
              </Badge>
            </div>
            {isSelected && (
              <CheckCircle2 className="w-5 h-5 text-primary absolute top-2 right-2" />
            )}
          </CardContent>
        </Card>
      </HoverCardTrigger>

      <HoverCardContent 
        side="right" 
        align="start" 
        className="w-80 p-0 overflow-hidden"
        sideOffset={12}
      >
        {/* Preview Header */}
        <div 
          className="p-4 text-white"
          style={{ background: `linear-gradient(135deg, ${preview.color} 0%, ${preview.color}CC 100%)` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <IconComponent className="w-5 h-5" />
            <span className="font-bold text-sm">{template.name}</span>
          </div>
          <p className="text-xs text-white/80">{template.style}</p>
        </div>

        {/* Mock Page Preview */}
        <div className="bg-muted/30 p-3">
          <div className="bg-background rounded-lg border border-border overflow-hidden">
            {/* Mini hero section */}
            <div 
              className="p-3 text-center"
              style={{ background: `linear-gradient(180deg, ${preview.color}10 0%, transparent 100%)` }}
            >
              <h4 className="font-bold text-xs text-foreground leading-tight mb-1">
                {preview.heroText}
              </h4>
              <p className="text-[10px] text-muted-foreground">
                {preview.subText}
              </p>
              <button 
                className="mt-2 px-3 py-1 rounded text-[10px] font-bold text-white"
                style={{ background: preview.color }}
              >
                Get Quote →
              </button>
            </div>

            {/* Feature indicators */}
            <div className="p-2 border-t border-border">
              <div className="flex flex-wrap gap-1">
                {preview.features.map((feature, i) => (
                  <span 
                    key={i}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats footer */}
        <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span>Avg conversion: <strong className="text-foreground">{template.conversion}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary">
            <Sparkles className="w-3 h-3" />
            <span>AI optimized</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
