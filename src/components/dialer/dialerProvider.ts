/**
 * DialerProvider — abstraction layer for telephony integration.
 * Replace the simulated methods with a real SIP/VoIP SDK
 * (Twilio, RingCentral, GoTo, etc.) when ready.
 */

import type { ActiveCallInfo, AgentStatusInfo, CallState } from "./types";

type CallStateCallback = (call: ActiveCallInfo | null) => void;

let _listener: CallStateCallback | null = null;
let _currentCall: ActiveCallInfo | null = null;
let _timer: ReturnType<typeof setInterval> | null = null;

function notify() {
  _listener?.(_currentCall ? { ..._currentCall } : null);
}

export const DialerProvider = {
  /** Subscribe to call state changes */
  onCallStateChange(cb: CallStateCallback) {
    _listener = cb;
  },

  /** Initiate an outbound call (simulated) */
  async startCall(phoneNumber: string, contactId?: string, contactName?: string): Promise<string> {
    const id = crypto.randomUUID();
    _currentCall = {
      id,
      contactName: contactName ?? null,
      phoneNumber,
      direction: "outbound",
      state: "dialing",
      startedAt: Date.now(),
      isMuted: false,
      isRecording: true,
    };
    notify();

    // Simulate dialing → ringing → active
    setTimeout(() => {
      if (_currentCall?.id === id) {
        _currentCall.state = "ringing";
        notify();
      }
    }, 1200);
    setTimeout(() => {
      if (_currentCall?.id === id) {
        _currentCall.state = "active";
        _currentCall.startedAt = Date.now();
        notify();
      }
    }, 3000);

    return id;
  },

  /** Hang up the current call */
  async hangup(): Promise<void> {
    if (!_currentCall) return;
    _currentCall.state = "wrap_up";
    notify();
  },

  /** Complete wrap-up and go idle */
  async completeWrapUp(): Promise<void> {
    _currentCall = null;
    notify();
  },

  /** Toggle mute */
  async mute(enabled: boolean): Promise<void> {
    if (!_currentCall) return;
    _currentCall.isMuted = enabled;
    notify();
  },

  /** Toggle hold */
  async hold(enabled: boolean): Promise<void> {
    if (!_currentCall) return;
    if (enabled) {
      _currentCall.state = "on_hold";
      _currentCall.holdStartedAt = Date.now();
    } else {
      _currentCall.state = "active";
      _currentCall.holdStartedAt = undefined;
    }
    notify();
  },

  /** Transfer call (placeholder) */
  async transfer(targetNumber: string): Promise<void> {
    console.log("[DialerProvider] Transfer to", targetNumber);
    _currentCall = null;
    notify();
  },

  /** Simulate an inbound call */
  simulateInbound(phoneNumber: string, contactName?: string) {
    const id = crypto.randomUUID();
    _currentCall = {
      id,
      contactName: contactName ?? null,
      phoneNumber,
      direction: "inbound",
      state: "ringing",
      startedAt: Date.now(),
      isMuted: false,
      isRecording: true,
    };
    notify();
  },

  /** Answer inbound */
  async answer(): Promise<void> {
    if (_currentCall?.state === "ringing" && _currentCall.direction === "inbound") {
      _currentCall.state = "active";
      _currentCall.startedAt = Date.now();
      notify();
    }
  },

  /** Get mock live agent statuses */
  async getLiveAgentStatuses(): Promise<AgentStatusInfo[]> {
    return [
      { agentId: "1", agentName: "Sarah K.", status: "on_call", lastChangeAt: new Date().toISOString(), currentCallDuration: 142 },
      { agentId: "2", agentName: "Mike R.", status: "ready", lastChangeAt: new Date().toISOString() },
      { agentId: "3", agentName: "Jen P.", status: "wrap_up", lastChangeAt: new Date().toISOString() },
      { agentId: "4", agentName: "Tom B.", status: "not_ready", lastChangeAt: new Date().toISOString() },
    ];
  },

  getCurrentCall(): ActiveCallInfo | null {
    return _currentCall ? { ..._currentCall } : null;
  },
};
