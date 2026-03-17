export interface Agent {
  id: string;
  name: string;
  initials: string;
  team: string;
  color: string;
}

export interface Customer {
  name: string;
  phone: string;
  policyId: string;
}

export type ComplianceStatus = 'pass' | 'review' | 'fail';
export type CallStatus = 'live' | 'completed' | 'on-hold';
export type FlagSeverity = 'high' | 'medium' | 'low';

export interface TranscriptLine {
  id: string;
  timestamp: string;
  speaker: 'agent' | 'customer' | 'system';
  text: string;
  highlight?: 'forbidden' | 'required' | 'missed';
  tooltipText?: string;
}

export interface Flag {
  id: string;
  severity: FlagSeverity;
  timestamp: string;
  phrase: string;
  recommendation: string;
  transcriptLineId: string;
}

export interface Moment {
  id: string;
  timestamp: string;
  type: 'objection' | 'disclosure' | 'forbidden' | 'hold' | 'verification' | 'escalation';
  label: string;
  transcriptLineId: string;
}

export interface ScorecardCategory {
  id: string;
  name: string;
  weight: number;
  score: number;
  maxScore: number;
  evidenceLineId?: string;
}

export interface CoachingTask {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  tags: string[];
}

export interface Rule {
  id: string;
  phrase: string;
  severity: FlagSeverity;
  action: 'flag' | 'auto-fail' | 'alert';
  scope: string;
  enabled: boolean;
}

export interface Call {
  id: string;
  agent: Agent;
  customer: Customer;
  status: CallStatus;
  campaign: string;
  duration: number;
  startTime: string;
  overallScore: number;
  scriptAdherence: number;
  disclosureCompletion: number;
  riskLevel: number;
  complianceStatus: ComplianceStatus;
  talkRatio: { agent: number; customer: number };
  transcript: TranscriptLine[];
  flags: Flag[];
  moments: Moment[];
  scorecard: ScorecardCategory[];
  flagCount: number;
}

export interface FilterState {
  campaigns: string[];
  teams: string[];
  compliance: ComplianceStatus[];
}

export interface ReplayState {
  isPlaying: boolean;
  currentIndex: number;
}
