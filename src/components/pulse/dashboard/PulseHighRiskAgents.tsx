import React from 'react';
import { AlertTriangle, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AgentRisk {
  name: string;
  count: number;
  worstSeverity: string;
}

interface PulseHighRiskAgentsProps {
  alerts: { agent_name: string; severity: string }[];
  onAgentClick?: (agentName: string) => void;
}

const SEVERITY_ORDER: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const SEVERITY_STYLE: Record<string, string> = {
  critical: 'bg-destructive/15 text-destructive border-destructive/30',
  high: 'bg-orange-500/15 text-orange-500 border-orange-500/30',
  medium: 'bg-compliance-review/15 text-compliance-review border-compliance-review/30',
  low: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const PulseHighRiskAgents: React.FC<PulseHighRiskAgentsProps> = ({ alerts, onAgentClick }) => {
  const agentRisks: AgentRisk[] = React.useMemo(() => {
    const map: Record<string, { count: number; worst: string }> = {};
    alerts.forEach(a => {
      if (!map[a.agent_name]) map[a.agent_name] = { count: 0, worst: 'low' };
      map[a.agent_name].count++;
      if ((SEVERITY_ORDER[a.severity] || 0) > (SEVERITY_ORDER[map[a.agent_name].worst] || 0)) {
        map[a.agent_name].worst = a.severity;
      }
    });
    return Object.entries(map)
      .map(([name, { count, worst }]) => ({ name, count, worstSeverity: worst }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [alerts]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-secondary/30">
        <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
        <span className="text-[11px] font-semibold">High-Risk Agents</span>
      </div>
      <ScrollArea className="flex-1 p-2">
        {agentRisks.length === 0 ? (
          <p className="text-[10px] text-muted-foreground text-center py-4">No flags yet</p>
        ) : (
          <div className="space-y-1.5">
            {agentRisks.map((agent, i) => (
              <button
                key={agent.name}
                onClick={() => onAgentClick?.(agent.name)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent/50 transition-colors text-left"
              >
                <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                <User className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-[11px] font-medium truncate flex-1">{agent.name}</span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${SEVERITY_STYLE[agent.worstSeverity] || SEVERITY_STYLE.low}`}>
                  {agent.worstSeverity}
                </span>
                <span className="text-[11px] font-bold tabular-nums text-foreground">{agent.count}</span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default PulseHighRiskAgents;
