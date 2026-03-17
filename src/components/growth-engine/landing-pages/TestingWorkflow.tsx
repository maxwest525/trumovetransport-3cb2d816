import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, TrendingUp, BarChart3, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    step: 1,
    label: "Launch 2 pages",
    desc: "Pick your best + backup from the selector above",
    icon: Play,
    status: "action",
  },
  {
    step: 2,
    label: "Send 50-100 clicks each",
    desc: "Run traffic evenly to both pages",
    icon: TrendingUp,
    status: "action",
  },
  {
    step: 3,
    label: "Compare results",
    desc: "Form rate, call rate, response speed, booked jobs",
    icon: BarChart3,
    status: "measure",
  },
  {
    step: 4,
    label: "Pause the weak page",
    desc: "Stop spending on the lower converter",
    icon: Pause,
    status: "optimize",
  },
  {
    step: 5,
    label: "Scale the winner",
    desc: "Increase budget on what actually converts",
    icon: CheckCircle2,
    status: "optimize",
  },
];

const statusColors: Record<string, string> = {
  action: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  measure: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  optimize: "bg-green-500/10 text-green-600 border-green-500/20",
};

const KILL_SIGNALS = [
  "Conversion rate below 3% after 200+ clicks",
  "Cost per lead 2x higher than the other page",
  "Leads rarely convert to booked jobs",
  "Bounce rate above 80%",
];

export default function TestingWorkflow() {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Test, Learn, Scale</span>
        </div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="flex items-center gap-2 flex-1">
                <div className={`flex-1 p-2.5 rounded-lg border ${statusColors[s.status]}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{s.step}. {s.label}</span>
                  </div>
                  <p className="text-[10px] opacity-80">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 hidden md:block" />
                )}
              </div>
            );
          })}
        </div>

        {/* Kill signals */}
        <div className="p-3 rounded-lg bg-muted/30 border space-y-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">When to kill a page</span>
          <div className="flex flex-wrap gap-1.5">
            {KILL_SIGNALS.map(s => (
              <Badge key={s} variant="outline" className="text-[10px] font-normal">{s}</Badge>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          Repeat this cycle as campaigns run. Remove losers, test new concepts, scale winners.
        </p>
      </CardContent>
    </Card>
  );
}
