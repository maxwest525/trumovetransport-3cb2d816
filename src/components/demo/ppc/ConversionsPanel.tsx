import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ConversionEvent, FunnelStage } from "./types";
import { generateConversionPDF } from "./pdfExport";
import { toast } from "sonner";
import {
  Target, Percent, Timer, DollarSign, Activity,
  Plus, Eye, FileDown, Mail, Share2
} from "lucide-react";

interface ConversionsPanelProps {
  events: ConversionEvent[];
  funnel: FunnelStage[];
  liveMode: boolean;
  onEmailExport: () => void;
}

export function ConversionsPanel({ events, funnel, liveMode, onEmailExport }: ConversionsPanelProps) {
  const handleExportPDF = () => {
    const generatedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    
    const totalConversions = events.reduce((acc, e) => acc + e.count, 0);
    const totalValue = events.reduce((acc, e) => acc + parseFloat(e.value.replace("$", "")) * e.count, 0);
    
    generateConversionPDF({
      events,
      funnel,
      stats: {
        totalConversions,
        conversionRate: "3.2%",
        avgTimeToConvert: "4.2 days",
        totalValue: `$${(totalValue / 1000).toFixed(0)}K`
      },
      generatedDate
    });
    toast.success("PDF report downloaded!");
  };

  const handleShare = () => {
    const shareUrl = `https://trumove.ai/reports/conversions/${Date.now()}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Shareable link copied to clipboard!");
  };

  const totalConversions = events.reduce((acc, e) => acc + e.count, 0);
  const totalValue = events.reduce((acc, e) => acc + parseFloat(e.value.replace("$", "")) * e.count, 0);

  return (
    <div className="space-y-4">
      {/* Export Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Conversion Analytics</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={handleExportPDF}
          >
            <FileDown className="w-3 h-3" />
            Export PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={onEmailExport}
          >
            <Mail className="w-3 h-3" />
            Email Report
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={handleShare}
          >
            <Share2 className="w-3 h-3" />
            Share Link
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Conversions", value: totalConversions.toLocaleString(), icon: Target, color: "#7C3AED" },
          { label: "Conversion Rate", value: "3.2%", icon: Percent, color: "#10B981" },
          { label: "Avg. Time to Convert", value: "4.2 days", icon: Timer, color: "#EC4899" },
          { label: "Total Value", value: `$${(totalValue / 1000).toFixed(0)}K`, icon: DollarSign, color: "#F59E0B" },
        ].map((stat) => (
          <div key={stat.label} className={`p-4 rounded-xl border border-border bg-card ${liveMode ? "transition-all duration-500" : ""}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <div className={`text-2xl font-bold text-foreground ${liveMode ? "transition-all duration-300" : ""}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Conversion Funnel */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Conversion Funnel</h3>
          <div className="flex gap-2 items-center">
            {liveMode && (
              <Badge className="gap-1 text-[10px]" style={{ background: "#EF444420", color: "#EF4444" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </Badge>
            )}
            <Badge variant="secondary">Last 30 days</Badge>
          </div>
        </div>
        <div className="space-y-2">
          {funnel.map((stage, i) => (
            <div key={stage.stage} className="flex items-center gap-3">
              <div className="w-32 text-xs text-muted-foreground truncate">{stage.stage}</div>
              <div className="flex-1 h-8 rounded-lg overflow-hidden bg-muted relative">
                <div 
                  className={`h-full rounded-lg flex items-center justify-end px-2 ${liveMode ? "transition-all duration-500" : ""}`}
                  style={{ 
                    width: `${Math.max(stage.rate, 5)}%`,
                    background: `linear-gradient(90deg, #7C3AED ${100 - stage.rate}%, #A855F7 100%)`,
                    minWidth: "60px"
                  }}
                >
                  <span className={`text-xs font-bold text-white ${liveMode ? "transition-all duration-300" : ""}`}>{stage.count.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-16 text-right">
                <span className="text-xs font-medium" style={{ color: "#7C3AED" }}>{stage.rate.toFixed(1)}%</span>
              </div>
              {i < funnel.length - 1 && (
                <div className="w-16 text-right">
                  <span className="text-[10px] text-red-500">
                    -{((1 - (funnel[i + 1].count / stage.count)) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Events */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#F8FAFC" }}>
          <span className="font-semibold text-sm text-foreground">Conversion Events</span>
          <Button variant="ghost" size="sm" className="gap-1">
            <Plus className="w-3 h-3" />
            Add Event
          </Button>
        </div>
        <div className="divide-y divide-border">
          {events.map((event, i) => (
            <div key={i} className={`px-4 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors ${liveMode ? "transition-all duration-500" : ""}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#7C3AED20" }}>
                <Activity className="w-4 h-4" style={{ color: "#7C3AED" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">{event.event}</div>
                <div className="text-xs text-muted-foreground">Source: {event.source}</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold text-foreground ${liveMode ? "transition-all duration-300" : ""}`}>{event.count}</div>
                <div className="text-[10px] text-primary">{event.trend}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium" style={{ color: "#7C3AED" }}>{event.value}</div>
                <div className="text-[10px] text-muted-foreground">Avg. Value</div>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Attribution */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <h4 className="font-semibold text-sm mb-3 text-foreground">Top Converting Sources</h4>
          <div className="space-y-2">
            {[
              { source: "Google Ads", conversions: 412, rate: "4.2%" },
              { source: "Organic Search", conversions: 328, rate: "3.8%" },
              { source: "Direct", conversions: 245, rate: "3.1%" },
              { source: "Facebook", conversions: 156, rate: "2.4%" },
            ].map((item) => (
              <div key={item.source} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item.source}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{item.conversions}</span>
                  <Badge variant="secondary" className="text-[10px]">{item.rate}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <h4 className="font-semibold text-sm mb-3 text-foreground">Conversion Path</h4>
          <div className="space-y-2">
            {[
              { path: "Ad → Quote → Book", count: 234, percent: 42 },
              { path: "Organic → Blog → Quote", count: 156, percent: 28 },
              { path: "Direct → Quote", count: 112, percent: 20 },
              { path: "Social → Landing → Quote", count: 56, percent: 10 },
            ].map((item) => (
              <div key={item.path}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground truncate">{item.path}</span>
                  <span className="font-medium text-foreground">{item.count}</span>
                </div>
                <Progress value={item.percent} className="h-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
