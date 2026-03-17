import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, Medal, Award, TrendingUp, DollarSign, 
  Briefcase, Star, Crown, Target, ChevronUp, 
  ChevronDown, Minus, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCommissionBoardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AgentData = { id: number; name: string; avatar: string; deposits: number; jobs: number; premium: number; commission: number; conversionRate: number; trend: "up" | "down" | "same"; streak: number };

type SortKey = "deposits" | "jobs" | "commission";

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const rankIcon = (r: number) => r === 1 ? <Crown className="w-4 h-4 text-yellow-500" /> : r === 2 ? <Medal className="w-4 h-4 text-gray-400" /> : r === 3 ? <Award className="w-4 h-4 text-amber-600" /> : <span className="text-xs font-bold text-muted-foreground">{r}</span>;

export function AgentCommissionBoard({ open, onOpenChange }: AgentCommissionBoardProps) {
  const [sortKey, setSortKey] = useState<SortKey>("commission");
  const agents: AgentData[] = []; // TODO: fetch from DB
  const sorted = [...agents].sort((a, b) => b[sortKey] - a[sortKey]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Leaderboard
            </DialogTitle>
            <div className="flex gap-1">
              {([["deposits", "$", DollarSign], ["jobs", "#", Briefcase], ["commission", "Comm", Star]] as const).map(([key, label]) => (
                <Button key={key} variant={sortKey === key ? "default" : "ghost"} size="sm" className="h-7 text-xs" onClick={() => setSortKey(key)}>
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-1.5">
          {sorted.map((agent, i) => (
            <div key={agent.id} className={cn("flex items-center gap-3 p-2.5 rounded-lg border transition-colors", i < 3 ? "bg-muted/30" : "bg-background")}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0">{rankIcon(i + 1)}</div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary text-xs font-bold shrink-0">{agent.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  {agent.name}
                  {agent.streak >= 3 && <Flame className="w-3 h-3 text-orange-500" />}
                </div>
                <div className="text-[11px] text-muted-foreground">{agent.conversionRate}% conv</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{sortKey === "jobs" ? agent.jobs : fmt(agent[sortKey])}</div>
                <div className="flex items-center justify-end gap-0.5 text-[10px]">
                  {agent.trend === "up" && <ChevronUp className="w-3 h-3 text-green-500" />}
                  {agent.trend === "down" && <ChevronDown className="w-3 h-3 text-red-500" />}
                  {agent.trend === "same" && <Minus className="w-3 h-3 text-muted-foreground" />}
                  <span className="text-muted-foreground">{agent.trend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
