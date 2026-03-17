import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, ClipboardList, Zap, Globe, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const PAGE_TYPES = [
  {
    name: "Call-First LP",
    icon: Phone,
    bestFor: "Google Search",
    quality: "High",
    speed: "Fastest",
    useWhen: "Searcher is ready to book now",
    cta: "Click-to-call, sticky button",
    sections: ["Hero + phone CTA", "Trust badges", "Routes", "Reviews", "Sticky call"],
    recommended: true,
    color: "blue",
  },
  {
    name: "Quote Form LP",
    icon: ClipboardList,
    bestFor: "Higher Quality",
    quality: "Highest",
    speed: "Medium",
    useWhen: "You want detailed lead info upfront",
    cta: "Multi-step or single-step form",
    sections: ["Hero + form", "Trust badges", "3-step process", "Route map", "Reviews", "FAQ"],
    recommended: true,
    color: "green",
  },
  {
    name: "Meta Instant Form",
    icon: Zap,
    bestFor: "Meta Traffic",
    quality: "Lower",
    speed: "Fastest",
    useWhen: "Max volume, lowest friction, cheap testing",
    cta: "In-app auto-fill form",
    sections: ["Intro card", "Auto-fill fields", "Custom Qs", "Thank you screen"],
    recommended: true,
    color: "purple",
  },
  {
    name: "Full Authority LP",
    icon: Globe,
    bestFor: "Expensive Keywords",
    quality: "High",
    speed: "Slow",
    useWhen: "Competitive routes, need to maximize every click",
    cta: "Dual CTA (call + form)",
    sections: ["Hero", "Trust strip", "Pricing guidance", "Reviews carousel", "FAQ", "Sticky bar"],
    recommended: false,
    color: "amber",
  },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-600" },
  green: { bg: "bg-green-500/10", text: "text-green-600" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-600" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-600" },
};

export default function PageTypeCards() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? PAGE_TYPES : PAGE_TYPES.filter(t => t.recommended);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Page Types</span>
        <Button
          variant="ghost" size="sm" className="h-7 text-xs gap-1"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showAll ? "Show Top 3" : "Show All"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {visible.map((type) => {
          const Icon = type.icon;
          const c = colorMap[type.color];
          return (
            <Card key={type.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-md ${c.bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                  </div>
                  <span className="text-sm font-bold text-foreground">{type.name}</span>
                  {type.recommended && (
                    <Star className="w-3 h-3 text-amber-500 ml-auto" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Best for</span>
                    <p className="font-medium text-foreground">{type.bestFor}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quality</span>
                    <p className="font-medium text-foreground">{type.quality}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Speed</span>
                    <p className="font-medium text-foreground">{type.speed}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CTA</span>
                    <p className="font-medium text-foreground">{type.cta}</p>
                  </div>
                </div>

                <div className="pt-1 border-t">
                  <span className="text-[10px] text-muted-foreground">Use when: </span>
                  <span className="text-[10px] font-medium text-foreground">{type.useWhen}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {type.sections.map(s => (
                    <Badge key={s} variant="outline" className="text-[9px] font-normal py-0">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
