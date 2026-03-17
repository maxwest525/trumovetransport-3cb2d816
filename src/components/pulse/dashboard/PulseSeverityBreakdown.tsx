import React from 'react';
import { BarChart3 } from 'lucide-react';

interface PulseSeverityBreakdownProps {
  counts: { critical: number; high: number; medium: number; low: number };
}

const BARS: { key: keyof PulseSeverityBreakdownProps['counts']; label: string; color: string }[] = [
  { key: 'critical', label: 'Critical', color: 'bg-destructive' },
  { key: 'high', label: 'High', color: 'bg-orange-500' },
  { key: 'medium', label: 'Medium', color: 'bg-compliance-review' },
  { key: 'low', label: 'Low', color: 'bg-muted-foreground/40' },
];

const PulseSeverityBreakdown: React.FC<PulseSeverityBreakdownProps> = ({ counts }) => {
  const total = Math.max(1, counts.critical + counts.high + counts.medium + counts.low);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-secondary/30">
        <BarChart3 className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] font-semibold">Severity Breakdown</span>
      </div>
      <div className="flex-1 p-3 flex flex-col justify-center gap-2">
        <div className="h-5 w-full rounded-full overflow-hidden flex bg-muted/30">
          {BARS.map(b => {
            const pct = (counts[b.key] / total) * 100;
            if (pct === 0) return null;
            return <div key={b.key} className={`${b.color} transition-all duration-500`} style={{ width: `${pct}%` }} title={`${b.label}: ${counts[b.key]}`} />;
          })}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {BARS.map(b => (
            <div key={b.key} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${b.color} shrink-0`} />
              <span className="text-[10px] text-muted-foreground">{b.label}</span>
              <span className="text-[10px] font-bold ml-auto tabular-nums">{counts[b.key]}</span>
            </div>
          ))}
        </div>
        <div className="text-center">
          <span className="text-[10px] text-muted-foreground">Total: </span>
          <span className="text-xs font-bold">{total}</span>
        </div>
      </div>
    </div>
  );
};

export default PulseSeverityBreakdown;
