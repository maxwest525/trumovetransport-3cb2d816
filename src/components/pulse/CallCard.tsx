import React, { useEffect, useState } from 'react';
import { Call } from '@/data/pulseTypes';
import { ScoreRing } from './ScoreRing';
import { Waveform } from './Waveform';
import { Flag, Clock } from 'lucide-react';

interface CallCardProps {
  call: Call;
  isSelected: boolean;
  onClick: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const CallCard: React.FC<CallCardProps> = ({ call, isSelected, onClick }) => {
  const [liveDuration, setLiveDuration] = useState(call.duration);

  useEffect(() => {
    if (call.status !== 'live') return;
    const interval = setInterval(() => setLiveDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [call.status]);

  const duration = call.status === 'live' ? liveDuration : call.duration;
  const compBadge = {
    pass: 'bg-compliance-pass/15 text-compliance-pass',
    review: 'bg-compliance-review/15 text-compliance-review',
    fail: 'bg-compliance-fail/15 text-compliance-fail',
  }[call.complianceStatus];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2.5 rounded-lg border-2 transition-all duration-200 shadow-sm ${
        isSelected
          ? 'border-primary/50 bg-primary/5 glow-primary'
          : 'border-foreground/20 bg-card/50 hover:bg-card/80 hover:border-foreground/30'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`w-8 h-8 rounded-full ${call.agent.color} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
          {call.agent.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-medium truncate">{call.agent.name}</span>
            <ScoreRing score={call.overallScore} size="sm" />
          </div>
          <div className="text-[10px] text-muted-foreground truncate">{call.customer.name}</div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {call.status === 'live' && <Waveform className="h-3" />}
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${compBadge}`}>
              {call.complianceStatus.toUpperCase()}
            </span>
            {call.flagCount > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] text-compliance-fail bg-compliance-fail/10 px-1.5 py-0.5 rounded-full">
                <Flag className="w-2.5 h-2.5" />{call.flagCount}
              </span>
            )}
            <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground font-mono">
              <Clock className="w-2.5 h-2.5" />{formatDuration(duration)}
            </span>
          </div>
          <div className="text-[9px] text-muted-foreground/60 mt-1 truncate">{call.campaign}</div>
        </div>
      </div>
    </button>
  );
};
