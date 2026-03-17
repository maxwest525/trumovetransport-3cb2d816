import React, { useMemo } from 'react';
import { usePulse } from '@/hooks/usePulseStore';
import { CallCard } from './CallCard';
import { RiskHeatmap } from './RiskHeatmap';
import { Phone, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const segments = [
  { id: 'live', label: 'Live' },
  { id: 'today', label: 'Today' },
  { id: 'qa-review', label: 'QA Review' },
  { id: 'high-risk', label: 'High Risk' },
  { id: 'heatmap', label: 'Heatmap' },
];

const campaignChips = ['Medicare Advantage', 'Auto Insurance Renewal', 'Life Insurance Upsell', 'Home Insurance Quote'];

export const LeftPanel: React.FC = () => {
  const { calls, selectedCallId, selectCall, activeSegment, setActiveSegment, searchQuery, filters, toggleFilter } = usePulse();

  const filtered = useMemo(() => {
    let result = calls;
    if (activeSegment === 'live') result = result.filter(c => c.status === 'live');
    else if (activeSegment === 'qa-review') result = result.filter(c => c.complianceStatus === 'review');
    else if (activeSegment === 'high-risk') result = result.filter(c => c.riskLevel >= 60 || c.complianceStatus === 'fail');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.customer.name.toLowerCase().includes(q) ||
        c.customer.phone.includes(q) ||
        c.customer.policyId.toLowerCase().includes(q) ||
        c.agent.name.toLowerCase().includes(q)
      );
    }

    if (filters.campaigns.length) result = result.filter(c => filters.campaigns.includes(c.campaign));
    if (filters.teams.length) result = result.filter(c => filters.teams.includes(c.agent.team));
    if (filters.compliance.length) result = result.filter(c => filters.compliance.includes(c.complianceStatus));

    return result;
  }, [calls, activeSegment, searchQuery, filters]);

  if (activeSegment === 'heatmap') {
    return (
      <aside className="flex flex-col h-full border-r border-border/40">
        <SegmentControl active={activeSegment} onChange={setActiveSegment} />
        <div className="flex-1 overflow-auto p-3 scrollbar-thin">
          <RiskHeatmap />
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col h-full border-r border-border/40">
      <SegmentControl active={activeSegment} onChange={setActiveSegment} />
      <div className="px-3 pb-2 flex flex-wrap gap-1">
        {campaignChips.map(c => (
          <button
            key={c}
            onClick={() => toggleFilter('campaigns', c)}
            className={`text-[9px] px-2 py-0.5 rounded-full border transition-colors ${
              filters.campaigns.includes(c)
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border/40 text-muted-foreground hover:border-border'
            }`}
          >
            {c.split(' ')[0]}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto px-2 pb-2 space-y-1.5 scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Filter className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">No calls match filters</p>
          </div>
        ) : (
          filtered.map(call => (
            <CallCard
              key={call.id}
              call={call}
              isSelected={selectedCallId === call.id}
              onClick={() => selectCall(call.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
};

const SegmentControl: React.FC<{ active: string; onChange: (s: string) => void }> = ({ active, onChange }) => (
  <div className="flex gap-0.5 p-2 mx-2 mt-2 mb-1 bg-secondary/50 rounded-lg">
    {segments.map(s => (
      <button
        key={s.id}
        onClick={() => onChange(s.id)}
        className={`flex-1 text-[10px] font-medium py-1.5 rounded-md transition-all ${
          active === s.id
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {s.label}
      </button>
    ))}
  </div>
);
