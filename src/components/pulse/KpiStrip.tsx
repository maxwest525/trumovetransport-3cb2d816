import React, { useMemo } from 'react';
import { usePulse } from '@/hooks/usePulseStore';
import { TrendingUp, ShieldCheck, Flag } from 'lucide-react';

export const KpiStrip: React.FC = () => {
  const { calls } = usePulse();

  const stats = useMemo(() => {
    const total = calls.length || 1;
    const avgScore = Math.round(calls.reduce((s, c) => s + c.overallScore, 0) / total);
    const passRate = Math.round((calls.filter(c => c.complianceStatus === 'pass').length / total) * 100);
    const totalFlags = calls.reduce((s, c) => s + c.flagCount, 0);
    const flagsPer100 = Math.round((totalFlags / total) * 100);

    const phraseCount: Record<string, number> = {};
    calls.forEach(c => c.flags.forEach(f => { phraseCount[f.phrase] = (phraseCount[f.phrase] || 0) + 1; }));
    const topPhrases = Object.entries(phraseCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { avgScore, passRate, flagsPer100, totalFlags, topPhrases };
  }, [calls]);

  return (
    <div className="h-10 border-t border-border/40 bg-background/80 backdrop-blur-xl flex items-center gap-6 px-4 overflow-x-auto scrollbar-thin">
      <Kpi icon={<TrendingUp className="w-3 h-3 text-primary" />} label="Avg Score" value={`${stats.avgScore}%`} />
      <Kpi icon={<ShieldCheck className="w-3 h-3 text-compliance-pass" />} label="Pass Rate" value={`${stats.passRate}%`} />
      <Kpi icon={<Flag className="w-3 h-3 text-compliance-fail" />} label="Flags/100" value={`${stats.flagsPer100}`} />
      <div className="h-5 w-px bg-border/40 shrink-0" />
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Top Flags:</span>
        {stats.topPhrases.map(([phrase, count], i) => (
          <span key={i} className="text-[9px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded-full whitespace-nowrap">
            {phrase.length > 20 ? phrase.slice(0, 20) + '…' : phrase} ({count})
          </span>
        ))}
        {stats.topPhrases.length === 0 && <span className="text-[9px] text-muted-foreground/50">None</span>}
      </div>
    </div>
  );
};

const Kpi: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-1.5 shrink-0">
    {icon}
    <span className="text-[9px] text-muted-foreground">{label}</span>
    <span className="text-xs font-semibold font-mono">{value}</span>
  </div>
);
