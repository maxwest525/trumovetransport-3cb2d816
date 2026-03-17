import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Call, CoachingTask, Rule, FilterState, ReplayState } from '@/data/pulseTypes';

interface PulseContextType {
  calls: Call[];
  selectedCallId: string | null;
  activeSegment: string;
  rightTab: string;
  searchQuery: string;
  filters: FilterState;
  coachMode: boolean;
  apiConnected: boolean;
  coachingTasks: CoachingTask[];
  rules: Rule[];
  replayState: ReplayState;
  isLoading: boolean;
  selectCall: (id: string | null) => void;
  setActiveSegment: (s: string) => void;
  setRightTab: (t: string) => void;
  setSearchQuery: (q: string) => void;
  setFilters: (f: FilterState) => void;
  toggleFilter: (key: keyof FilterState, value: string) => void;
  toggleCoachMode: () => void;
  toggleApiConnected: () => void;
  updateScore: (callId: string, categoryId: string, score: number) => void;
  addCoachingTask: (task: CoachingTask) => void;
  updateCoachingTaskStatus: (taskId: string, status: CoachingTask['status']) => void;
  toggleRule: (ruleId: string) => void;
  addRule: (rule: Rule) => void;
  setReplayState: (s: Partial<ReplayState>) => void;
}

const PulseContext = createContext<PulseContextType | null>(null);

export const usePulse = () => {
  const ctx = useContext(PulseContext);
  if (!ctx) throw new Error('usePulse must be used within PulseProvider');
  return ctx;
};

export const PulseProvider = ({ children }: { children: ReactNode }) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState('live');
  const [rightTab, setRightTab] = useState('flags');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ campaigns: [], teams: [], compliance: [] });
  const [coachMode, setCoachMode] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);
  const [coachingTasks, setCoachingTasks] = useState<CoachingTask[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [replayState, setReplayStateRaw] = useState<ReplayState>({ isPlaying: false, currentIndex: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const selectCall = useCallback((id: string | null) => {
    setIsLoading(true);
    setSelectedCallId(id);
    setReplayStateRaw({ isPlaying: false, currentIndex: 0 });
    setTimeout(() => setIsLoading(false), 350);
  }, []);

  const toggleFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const arr = prev[key] as string[];
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  }, []);

  const updateScore = useCallback((callId: string, categoryId: string, score: number) => {
    setCalls(prev => prev.map(c => {
      if (c.id !== callId) return c;
      const scorecard = c.scorecard.map(s => s.id === categoryId ? { ...s, score } : s);
      const totalW = scorecard.reduce((sum, s) => sum + (s.score / s.maxScore) * s.weight, 0);
      const totalWt = scorecard.reduce((sum, s) => sum + s.weight, 0);
      return { ...c, scorecard, overallScore: Math.round((totalW / totalWt) * 100) };
    }));
  }, []);

  return (
    <PulseContext.Provider value={{
      calls, selectedCallId, activeSegment, rightTab, searchQuery, filters,
      coachMode, apiConnected, coachingTasks, rules, replayState, isLoading,
      selectCall,
      setActiveSegment,
      setRightTab,
      setSearchQuery,
      setFilters,
      toggleFilter,
      toggleCoachMode: () => setCoachMode(p => !p),
      toggleApiConnected: () => setApiConnected(p => !p),
      updateScore,
      addCoachingTask: (t) => setCoachingTasks(p => [t, ...p]),
      updateCoachingTaskStatus: (id, status) => setCoachingTasks(p => p.map(t => t.id === id ? { ...t, status } : t)),
      toggleRule: (id) => setRules(p => p.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)),
      addRule: (r) => setRules(p => [...p, r]),
      setReplayState: (s) => setReplayStateRaw(p => ({ ...p, ...s })),
    }}>
      {children}
    </PulseContext.Provider>
  );
};
