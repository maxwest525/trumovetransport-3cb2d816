import React, { useRef, useEffect, useState, useMemo } from 'react';
import { usePulse } from '@/hooks/usePulseStore';
import { ScoreRing } from './ScoreRing';
import { Waveform } from './Waveform';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Phone, User, Shield, AlertTriangle, Search, Play, Pause, SkipForward, Sparkles, Clock, MessageCircle } from 'lucide-react';
import { Moment, TranscriptLine } from '@/data/pulseTypes';

const momentColors: Record<string, string> = {
  disclosure: 'bg-compliance-pass/15 text-compliance-pass border-compliance-pass/30',
  verification: 'bg-primary/15 text-primary border-primary/30',
  objection: 'bg-compliance-review/15 text-compliance-review border-compliance-review/30',
  forbidden: 'bg-compliance-fail/15 text-compliance-fail border-compliance-fail/30',
  hold: 'bg-muted text-muted-foreground border-border',
  escalation: 'bg-compliance-fail/15 text-compliance-fail border-compliance-fail/30',
};

const highlightStyles: Record<string, string> = {
  forbidden: 'bg-compliance-fail/10 border-l-2 border-l-compliance-fail',
  required: 'bg-compliance-pass/8 border-l-2 border-l-compliance-pass',
  missed: 'bg-muted/50 border-l-2 border-l-muted-foreground italic opacity-70',
};

export const CenterPanel: React.FC = () => {
  const { calls, selectedCallId, isLoading, coachMode, toggleCoachMode, replayState, setReplayState } = usePulse();
  const call = calls.find(c => c.id === selectedCallId);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [transcriptSearch, setTranscriptSearch] = useState('');

  useEffect(() => {
    if (!replayState.isPlaying || !call) return;
    const timer = setInterval(() => {
      setReplayState({
        currentIndex: replayState.currentIndex >= call.transcript.length - 1
          ? 0 : replayState.currentIndex + 1,
        isPlaying: replayState.currentIndex < call.transcript.length - 1,
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [replayState.isPlaying, replayState.currentIndex, call, setReplayState]);

  useEffect(() => {
    if (!replayState.isPlaying) return;
    const el = document.getElementById(`tl-${replayState.currentIndex}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [replayState.currentIndex, replayState.isPlaying]);

  const filteredTranscript = useMemo(() => {
    if (!call) return [];
    if (!transcriptSearch) return call.transcript;
    const q = transcriptSearch.toLowerCase();
    return call.transcript.filter(l => l.text.toLowerCase().includes(q));
  }, [call, transcriptSearch]);

  if (!selectedCallId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <Phone className="w-12 h-12 opacity-20" />
        <p className="text-sm font-medium">No call selected</p>
        <p className="text-xs opacity-60">Select a call from the queue to view details</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-fade-in">
        <div className="flex gap-3"><Skeleton className="h-16 flex-1" /><Skeleton className="h-16 flex-1" /></div>
        <div className="flex gap-4 justify-center"><Skeleton className="h-20 w-20 rounded-full" /><Skeleton className="h-20 w-20 rounded-full" /><Skeleton className="h-20 w-20 rounded-full" /></div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!call) return null;

  const scrollToLine = (lineId: string) => {
    const idx = call.transcript.findIndex(l => l.id === lineId);
    if (idx >= 0) {
      const el = document.getElementById(`tl-${idx}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-auto p-4 gap-4 scrollbar-thin animate-fade-in">
      <div className="flex gap-3 flex-wrap">
        <div className="glass-subtle flex items-center gap-2.5 px-3 py-2 flex-1 min-w-[160px]">
          <User className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-medium truncate">{call.customer.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{call.customer.phone}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{call.customer.policyId}</div>
          </div>
        </div>
        <div className="glass-subtle flex items-center gap-2.5 px-3 py-2 flex-1 min-w-[160px]">
          <div className={`w-7 h-7 rounded-full ${call.agent.color} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
            {call.agent.initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate">{call.agent.name}</div>
            <div className="text-[10px] text-muted-foreground">{call.agent.team}</div>
          </div>
        </div>
        <div className="flex items-center">
          {call.status === 'live' ? (
            <span className="flex items-center gap-1.5 text-[10px] font-semibold bg-compliance-pass/15 text-compliance-pass px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-compliance-pass animate-pulse-live" />LIVE
            </span>
          ) : (
            <span className="text-[10px] font-medium bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">
              Completed
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 py-2">
        <ScoreRing score={call.overallScore} size="lg" label="Overall" />
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <ScoreRing score={call.scriptAdherence} size="sm" label="Script" />
            <ScoreRing score={call.disclosureCompletion} size="sm" label="Disclosure" />
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  call.riskLevel >= 60 ? 'bg-compliance-fail' : call.riskLevel >= 30 ? 'bg-compliance-review' : 'bg-compliance-pass'
                }`}
                style={{ width: `${call.riskLevel}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{call.riskLevel}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground w-12">Agent</span>
        <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden flex">
          <div className="h-full bg-primary/60 rounded-l-full transition-all" style={{ width: `${call.talkRatio.agent}%` }} />
          <div className="h-full bg-muted-foreground/30 rounded-r-full transition-all" style={{ width: `${call.talkRatio.customer}%` }} />
        </div>
        <span className="text-[10px] text-muted-foreground w-14 text-right">Customer</span>
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground font-mono px-12">
        <span>{call.talkRatio.agent}%</span><span>{call.talkRatio.customer}%</span>
      </div>

      <div>
        <div className="text-[10px] text-muted-foreground font-medium mb-2 uppercase tracking-wider">Moments</div>
        <div className="flex flex-wrap gap-1.5">
          {call.moments.map(m => (
            <button
              key={m.id}
              onClick={() => scrollToLine(m.transcriptLineId)}
              className={`text-[9px] px-2 py-1 rounded-full border font-medium transition-colors hover:opacity-80 ${momentColors[m.type] || ''}`}
            >
              <span className="font-mono mr-1">{m.timestamp}</span>
              {m.label}
            </button>
          ))}
          {call.moments.length === 0 && (
            <span className="text-[10px] text-muted-foreground/50">No moments detected</span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Transcript</div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={transcriptSearch}
                onChange={e => setTranscriptSearch(e.target.value)}
                className="h-6 pl-6 pr-2 text-[10px] bg-secondary/60 border border-border/30 rounded-md w-32 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-muted-foreground">Coach</span>
              <Switch checked={coachMode} onCheckedChange={toggleCoachMode} className="scale-75" />
            </div>
          </div>
        </div>

        <div ref={transcriptRef} className="flex-1 overflow-auto space-y-0.5 scrollbar-thin rounded-lg border-2 border-foreground/20 bg-secondary/20 p-2 shadow-sm">
          {filteredTranscript.map((line, idx) => (
            <div
              key={line.id}
              id={`tl-${idx}`}
              className={`flex gap-2 px-2 py-1.5 rounded-md text-[11px] transition-all ${
                highlightStyles[line.highlight || ''] || ''
              } ${replayState.isPlaying && replayState.currentIndex === idx ? 'ring-1 ring-primary/50 bg-primary/5' : ''}`}
            >
              <span className="font-mono text-muted-foreground shrink-0 w-10 text-[10px]">{line.timestamp}</span>
              <span className={`shrink-0 w-14 text-[10px] font-medium ${
                line.speaker === 'agent' ? 'text-primary' : line.speaker === 'customer' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {line.speaker === 'agent' ? 'Agent' : line.speaker === 'customer' ? 'Customer' : ''}
              </span>
              <span className="flex-1">
                {line.tooltipText ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">{line.text}</span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-xs">
                      {line.tooltipText}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  line.text
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-2 p-2 glass-subtle">
          <button
            onClick={() => setReplayState({ isPlaying: !replayState.isPlaying })}
            className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            {replayState.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: call.transcript.length > 0 ? `${(replayState.currentIndex / (call.transcript.length - 1)) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {replayState.currentIndex + 1}/{call.transcript.length}
          </span>
        </div>
      </div>

      {coachMode && (
        <div className="glass border-primary/20 p-3 animate-scale-in">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Coach Suggestions</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="p-2 bg-primary/5 rounded-md border border-primary/10">
              <div className="font-medium mb-0.5">Suggested response:</div>
              <div className="text-muted-foreground">"I understand your concern about the premium increase. Let me walk you through some options that could help reduce your costs while maintaining your coverage."</div>
            </div>
            <div className="p-2 bg-primary/5 rounded-md border border-primary/10">
              <div className="font-medium mb-0.5">Reminder:</div>
              <div className="text-muted-foreground">Ask about bundling opportunities — customer has single policy.</div>
            </div>
            <div className="p-2 bg-compliance-review/5 rounded-md border border-compliance-review/10">
              <div className="font-medium mb-0.5 text-compliance-review">⚠ Compliance note:</div>
              <div className="text-muted-foreground">Avoid making comparison claims about competitors. Use factual policy details only.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
