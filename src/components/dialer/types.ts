export interface DialerContact {
  id: string;
  name: string;
  phones: string[];
  email: string | null;
  timezone: string | null;
  tags: string[];
  flags: {
    dnc: boolean;
    tcpaBlocked: boolean;
    wrongNumber: boolean;
    doNotText: boolean;
  };
  ownerAgentId: string | null;
  leadSource: string | null;
  state: string | null;
}

export interface DialerCall {
  id: string;
  contactId: string | null;
  agentId: string | null;
  direction: "inbound" | "outbound";
  startedAt: string;
  endedAt: string | null;
  duration: number;
  talkTime: number;
  holdTime: number;
  outcome: string | null;
  notes: string | null;
  recordingUrl: string | null;
  campaignId: string | null;
  listId: string | null;
  followUpAt: string | null;
  tags: string[];
  contactName: string | null;
  contactPhone: string | null;
}

export interface DialerRecording {
  id: string;
  callId: string;
  url: string;
  createdAt: string;
  agentId: string | null;
  agentName: string | null;
  contactName: string | null;
  duration: number;
  outcome: string | null;
}

export interface Campaign {
  id: string;
  name: string;
}

export interface DialList {
  id: string;
  name: string;
  campaignId: string | null;
  contactCount: number;
}

export type AgentCallStatus = "ready" | "not_ready" | "on_call" | "wrap_up" | "ringing";

export interface AgentStatusInfo {
  agentId: string;
  agentName: string;
  status: AgentCallStatus;
  lastChangeAt: string;
  currentCallDuration?: number;
}

export type CallState = "idle" | "dialing" | "ringing" | "connecting" | "active" | "on_hold" | "wrap_up";

export interface ActiveCallInfo {
  id: string;
  contactName: string | null;
  phoneNumber: string;
  direction: "inbound" | "outbound";
  state: CallState;
  startedAt: number;
  holdStartedAt?: number;
  isMuted: boolean;
  isRecording: boolean;
}

export interface Queue {
  id: string;
  name: string;
  type: string;
}

export const DISPOSITIONS = [
  "Booked",
  "Follow Up",
  "No Answer",
  "Voicemail",
  "Not Interested",
  "Wrong Number",
  "Callback Scheduled",
  "DNC Request",
  "Lost",
] as const;

export type Disposition = (typeof DISPOSITIONS)[number];
