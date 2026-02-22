import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ABTest } from "./types";
import { Trophy, Pause, ArrowRight, GripVertical } from "lucide-react";

interface DraggableABTestCardProps {
  test: ABTest;
  liveMode: boolean;
}

export function DraggableABTestCard({ test, liveMode }: DraggableABTestCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: test.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-xl border border-border bg-card ${liveMode ? "transition-all duration-500" : ""} ${isDragging ? "shadow-xl ring-2 ring-purple-500" : ""}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground">{test.name}</h4>
              <Badge 
                className="text-[10px]"
                style={{ 
                  background: test.status === "running" ? "#10B98120" : test.status === "paused" ? "#F59E0B20" : "#7C3AED20",
                  color: test.status === "running" ? "#10B981" : test.status === "paused" ? "#F59E0B" : "#7C3AED"
                }}
              >
                {test.status === "running" ? "Running" : test.status === "paused" ? "Paused" : "Completed"}
              </Badge>
              {test.confidence >= 95 && (
                <Badge className="text-[10px] gap-1" style={{ background: "#F59E0B20", color: "#F59E0B" }}>
                  <Trophy className="w-2.5 h-2.5" />
                  Winner Found
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">Started {test.startDate}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold" style={{ color: "#10B981" }}>{test.lift}</div>
          <div className="text-[10px] text-muted-foreground">Lift</div>
        </div>
      </div>

      {/* Variants Comparison */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {test.variants.map((variant, idx) => (
          <div 
            key={idx} 
            className={`p-3 rounded-lg border ${variant.name === test.winner ? "border-green-300 bg-green-50/50 dark:bg-green-950/20" : "border-border bg-muted/30"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">{variant.name}</span>
              {variant.name === test.winner && (
                <Trophy className="w-3 h-3 text-primary" />
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className={`text-sm font-bold text-foreground ${liveMode ? "transition-all duration-300" : ""}`}>{variant.visitors.toLocaleString()}</div>
                <div className="text-[9px] text-muted-foreground">Visitors</div>
              </div>
              <div>
                <div className={`text-sm font-bold text-foreground ${liveMode ? "transition-all duration-300" : ""}`}>{variant.conversions}</div>
                <div className="text-[9px] text-muted-foreground">Conversions</div>
              </div>
              <div>
                <div className={`text-sm font-bold ${liveMode ? "transition-all duration-300" : ""}`} style={{ color: variant.name === test.winner ? "#10B981" : "#64748B" }}>{variant.rate.toFixed(1)}%</div>
                <div className="text-[9px] text-muted-foreground">Rate</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confidence Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Statistical Confidence</span>
            <span className={`font-medium ${liveMode ? "transition-all duration-300" : ""}`} style={{ color: test.confidence >= 95 ? "#10B981" : "#F59E0B" }}>{test.confidence.toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div 
              className={`h-full rounded-full ${liveMode ? "transition-all duration-500" : ""}`}
              style={{ 
                width: `${test.confidence}%`,
                background: test.confidence >= 95 ? "#10B981" : test.confidence >= 80 ? "#F59E0B" : "#EF4444"
              }}
            />
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          {test.status === "running" ? (
            <>
              <Pause className="w-3 h-3" />
              Pause
            </>
          ) : (
            <>
              <ArrowRight className="w-3 h-3" />
              Apply Winner
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
