import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Globe, Lightbulb } from "lucide-react";
import { useState } from "react";

type Tab = "instant" | "landing";

export default function MetaComparison() {
  const [tab, setTab] = useState<Tab>("instant");

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <span className="text-sm font-semibold text-foreground">Meta: Instant Form vs Landing Page?</span>

        <div className="flex gap-1 p-0.5 bg-muted/50 rounded-md w-fit">
          <button
            onClick={() => setTab("instant")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              tab === "instant" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="w-3 h-3 inline mr-1" />Instant Form
          </button>
          <button
            onClick={() => setTab("landing")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              tab === "landing" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-3 h-3 inline mr-1" />Landing Page
          </button>
        </div>

        {tab === "instant" ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              {[
                { label: "Volume", value: "Highest" },
                { label: "Cost/Lead", value: "Lowest" },
                { label: "Quality", value: "Lower" },
                { label: "Best When", value: "Speed-to-lead < 60s" },
              ].map(item => (
                <div key={item.label} className="p-2 rounded bg-purple-500/5 border border-purple-500/10">
                  <span className="text-muted-foreground">{item.label}</span>
                  <p className="font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• Auto-fills name, email, phone from profile</li>
              <li>• User never leaves Facebook/Instagram</li>
              <li>• Must route to Convoso instantly for best results</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              {[
                { label: "Volume", value: "Medium" },
                { label: "Cost/Lead", value: "Higher" },
                { label: "Quality", value: "Higher" },
                { label: "Best When", value: "Retargeting or filtering" },
              ].map(item => (
                <div key={item.label} className="p-2 rounded bg-blue-500/5 border border-blue-500/10">
                  <span className="text-muted-foreground">{item.label}</span>
                  <p className="font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• Visitor reads trust signals, reviews, route info before submitting</li>
              <li>• Filters non-serious browsers</li>
              <li>• Better for retargeting campaigns</li>
            </ul>
          </div>
        )}

        <Badge variant="outline" className="text-[10px]">
          <Lightbulb className="w-3 h-3 mr-1" />
          Start with instant forms for volume, then test LP for quality
        </Badge>
      </CardContent>
    </Card>
  );
}
