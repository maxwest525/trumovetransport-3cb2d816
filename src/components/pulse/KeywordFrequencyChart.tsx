import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

interface Alert {
  id: string;
  entry: { id: string; pattern: string; type: string };
  matched: string;
  context: string;
  timestamp: Date;
}

interface Props {
  alerts: Alert[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--compliance-pass))',
  'hsl(var(--compliance-review))',
  'hsl(var(--compliance-fail))',
  'hsl(270, 60%, 55%)',
  'hsl(210, 70%, 55%)',
  'hsl(340, 70%, 55%)',
  'hsl(60, 70%, 45%)',
];

export const KeywordFrequencyChart: React.FC<Props> = ({ alerts }) => {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    alerts.forEach(a => {
      const key = a.entry.pattern;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [alerts]);

  if (!alerts.length) {
    return (
      <div className="rounded-xl border border-border bg-card/50 p-4 text-center py-8">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground">Detection analytics will appear here once keywords are detected.</p>
      </div>
    );
  }

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4 space-y-4">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        Detection Analytics
      </h2>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Keyword Frequency</p>
        <div className="space-y-1.5">
          {chartData.map((item, i) => (
            <div key={item.pattern} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-24 truncate text-right">{item.pattern}</span>
              <div className="flex-1 h-4 bg-secondary/30 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{
                    width: `${(item.count / maxCount) * 100}%`,
                    backgroundColor: COLORS[i % COLORS.length],
                    opacity: 0.8,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
