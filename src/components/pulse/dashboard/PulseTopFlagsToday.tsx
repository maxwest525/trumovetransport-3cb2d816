import React from 'react';
import { Tag } from 'lucide-react';

interface PulseTopFlagsTodayProps {
  alerts: { keyword: string }[];
}

const PulseTopFlagsToday: React.FC<PulseTopFlagsTodayProps> = ({ alerts }) => {
  const topKeywords = React.useMemo(() => {
    const map: Record<string, number> = {};
    alerts.forEach(a => { map[a.keyword] = (map[a.keyword] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [alerts]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-secondary/30">
        <Tag className="w-3.5 h-3.5 text-compliance-review" />
        <span className="text-[11px] font-semibold">Top Flags Today</span>
      </div>
      <div className="flex-1 p-2.5 flex flex-wrap gap-1.5 content-start overflow-hidden">
        {topKeywords.length === 0 ? (
          <p className="text-[10px] text-muted-foreground text-center w-full py-4">No flags yet</p>
        ) : (
          topKeywords.map(([keyword, count]) => (
            <span key={keyword} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-[10px] font-medium text-foreground">
              <span className="truncate max-w-[100px]">{keyword}</span>
              <span className="text-[9px] font-bold text-destructive bg-destructive/15 px-1 rounded-full">{count}</span>
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default PulseTopFlagsToday;
