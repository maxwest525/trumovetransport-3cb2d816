import React, { useMemo } from 'react';
import { usePulse } from '@/hooks/usePulseStore';

const riskCategories = ['Guarantee Language', 'Pressure Tactics', 'Absolute Claims', 'Missing Disclosure', 'Long Holds', 'Competitor Mentions'];

export const RiskHeatmap: React.FC = () => {
  const { calls, selectCall, setActiveSegment } = usePulse();

  const agents = useMemo(() => {
    const agentMap = new Map<string, { id: string; name: string; initials: string; color: string }>();
    calls.forEach(c => {
      if (!agentMap.has(c.agent.id)) {
        agentMap.set(c.agent.id, c.agent);
      }
    });
    return Array.from(agentMap.values());
  }, [calls]);

  const matrix = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    agents.forEach(a => {
      m[a.id] = {};
      riskCategories.forEach(cat => {
        const agentCalls = calls.filter(c => c.agent.id === a.id);
        const flagCount = agentCalls.reduce((s, c) => s + c.flagCount, 0);
        const catIndex = riskCategories.indexOf(cat);
        const hash = (a.id.charCodeAt(1) * 13 + catIndex * 7) % 6;
        m[a.id][cat] = Math.min(5, Math.max(0, hash + (flagCount > 3 ? 2 : 0)));
      });
    });
    return m;
  }, [agents, calls]);

  const cellColor = (intensity: number) => {
    if (intensity === 0) return 'bg-secondary/30';
    if (intensity <= 1) return 'bg-compliance-pass/20';
    if (intensity <= 2) return 'bg-compliance-review/20';
    if (intensity <= 3) return 'bg-compliance-review/40';
    if (intensity <= 4) return 'bg-compliance-fail/30';
    return 'bg-compliance-fail/50';
  };

  const handleCellClick = (agentId: string) => {
    const agentCalls = calls.filter(c => c.agent.id === agentId);
    if (agentCalls.length > 0) {
      selectCall(agentCalls[0].id);
      setActiveSegment('today');
    }
  };

  if (agents.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="text-xs font-semibold mb-3">Risk Heatmap</div>
        <p className="text-xs text-muted-foreground text-center py-4">No data available yet</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="text-xs font-semibold mb-3">Risk Heatmap</div>
      <div className="overflow-auto">
        <table className="text-[9px] w-full">
          <thead>
            <tr>
              <th className="text-left p-1.5 text-muted-foreground font-medium">Agent</th>
              {riskCategories.map(cat => (
                <th key={cat} className="p-1.5 text-muted-foreground font-medium text-center" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', maxWidth: 30, height: 80 }}>
                  {cat}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent.id}>
                <td className="p-1.5 font-medium text-[10px] whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full ${agent.color} flex items-center justify-center text-[8px] text-white font-bold`}>
                      {agent.initials}
                    </div>
                    {agent.name.split(' ')[0]}
                  </div>
                </td>
                {riskCategories.map(cat => (
                  <td key={cat} className="p-0.5">
                    <button
                      onClick={() => handleCellClick(agent.id)}
                      className={`w-full h-6 rounded-sm ${cellColor(matrix[agent.id][cat])} hover:ring-1 hover:ring-primary/50 transition-all`}
                      title={`${agent.name} × ${cat}: ${matrix[agent.id][cat]}/5`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 mt-3 text-[9px] text-muted-foreground">
        <span>Low</span>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`w-4 h-3 rounded-sm ${cellColor(i)}`} />
          ))}
        </div>
        <span>High</span>
      </div>
    </div>
  );
};
