import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Phone, PhoneOff, Mic, MicOff, Pause, Play, Grid3X3,
  PhoneForwarded, Users, Circle, MessageSquare, Voicemail,
  Headphones, Volume2, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActiveCallInfo, CallState, Disposition } from "./types";
import { DISPOSITIONS } from "./types";
import { DialerProvider } from "./dialerProvider";

interface SoftphonePanelProps {
  onCallStateChange?: (state: CallState) => void;
}

const DIAL_KEYS = [
  "1", "2", "3",
  "4", "5", "6",
  "7", "8", "9",
  "*", "0", "#",
];

export default function SoftphonePanel({ onCallStateChange }: SoftphonePanelProps) {
  const [call, setCall] = useState<ActiveCallInfo | null>(null);
  const [dialInput, setDialInput] = useState("");
  const [showDialpad, setShowDialpad] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [disposition, setDisposition] = useState<string>("");
  const [wrapNotes, setWrapNotes] = useState("");

  // Listen to provider
  useEffect(() => {
    DialerProvider.onCallStateChange(setCall);
  }, []);

  // Timer
  useEffect(() => {
    if (call?.state === "active" || call?.state === "on_hold") {
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - call.startedAt) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    } else if (!call || call.state === "idle") {
      setElapsed(0);
    }
  }, [call?.state, call?.startedAt]);

  useEffect(() => {
    onCallStateChange?.(call?.state ?? "idle");
  }, [call?.state]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleDial = useCallback(() => {
    if (dialInput.trim()) {
      DialerProvider.startCall(dialInput.trim());
      setDialInput("");
    }
  }, [dialInput]);

  const handleHangup = () => DialerProvider.hangup();
  const handleMute = () => call && DialerProvider.mute(!call.isMuted);
  const handleHold = () => call && DialerProvider.hold(call.state !== "on_hold");
  const handleAnswer = () => DialerProvider.answer();

  const handleDispose = () => {
    DialerProvider.completeWrapUp();
    setDisposition("");
    setWrapNotes("");
  };

  const handleKeyPress = (key: string) => {
    setDialInput(prev => prev + key);
  };

  const isIdle = !call || call.state === "idle";
  const isRinging = call?.state === "ringing";
  const isActive = call?.state === "active";
  const isOnHold = call?.state === "on_hold";
  const isWrapUp = call?.state === "wrap_up";
  const isDialing = call?.state === "dialing" || call?.state === "connecting";
  const isInCall = isActive || isOnHold || isDialing || isRinging;

  const stateLabel: Record<string, string> = {
    idle: "Ready",
    dialing: "Dialing…",
    ringing: "Ringing…",
    connecting: "Connecting…",
    active: "Active Call",
    on_hold: "On Hold",
    wrap_up: "Wrap-Up",
  };

  const stateColor: Record<string, string> = {
    idle: "bg-muted text-muted-foreground",
    dialing: "bg-yellow-500/10 text-yellow-600",
    ringing: "bg-yellow-500/10 text-yellow-600 animate-pulse",
    connecting: "bg-yellow-500/10 text-yellow-600",
    active: "bg-green-500/10 text-green-600",
    on_hold: "bg-orange-500/10 text-orange-600",
    wrap_up: "bg-blue-500/10 text-blue-600",
  };

  const currentState = call?.state ?? "idle";

  return (
    <aside className="w-80 border-l border-border bg-card flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Softphone</span>
          </div>
          <Badge className={cn("text-[10px]", stateColor[currentState])}>
            {stateLabel[currentState]}
          </Badge>
        </div>
        {/* Recording indicator */}
        {isInCall && call?.isRecording && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-destructive">
            <Circle className="w-2 h-2 fill-current animate-pulse" />
            Recording
          </div>
        )}
      </div>

      {/* Call Info Area */}
      {isInCall && call && (
        <div className="p-4 border-b border-border text-center">
          <p className="text-base font-semibold text-foreground">
            {call.contactName || call.phoneNumber}
          </p>
          {call.contactName && (
            <p className="text-xs text-muted-foreground mt-0.5">{call.phoneNumber}</p>
          )}
          <p className={cn(
            "text-2xl font-mono font-bold mt-2",
            isOnHold ? "text-orange-500" : "text-foreground"
          )}>
            {formatTime(elapsed)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 capitalize">
            {call.direction} · {currentState.replace("_", " ")}
          </p>
        </div>
      )}

      {/* Wrap-Up UI */}
      {isWrapUp && (
        <div className="p-4 border-b border-border space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Disposition *</label>
            <Select value={disposition} onValueChange={setDisposition}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select outcome…" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {DISPOSITIONS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
            <Textarea
              placeholder="Call notes…"
              className="text-sm min-h-[60px] resize-none"
              value={wrapNotes}
              onChange={(e) => setWrapNotes(e.target.value)}
            />
          </div>
          <Button className="w-full" size="sm" disabled={!disposition} onClick={handleDispose}>
            Save & Ready
          </Button>
        </div>
      )}

      {/* Call Controls */}
      {isInCall && !isWrapUp && (
        <div className="p-4 border-b border-border">
          <div className="grid grid-cols-4 gap-2">
            <ControlButton icon={call?.isMuted ? MicOff : Mic} label={call?.isMuted ? "Unmute" : "Mute"} onClick={handleMute} active={call?.isMuted} />
            <ControlButton icon={isOnHold ? Play : Pause} label={isOnHold ? "Resume" : "Hold"} onClick={handleHold} active={isOnHold} />
            <ControlButton icon={Grid3X3} label="Keypad" onClick={() => setShowDialpad(!showDialpad)} active={showDialpad} />
            <ControlButton icon={Volume2} label="Speaker" onClick={() => {}} />
            <ControlButton icon={PhoneForwarded} label="Transfer" onClick={() => {}} />
            <ControlButton icon={Users} label="Conf" onClick={() => {}} />
            <ControlButton icon={Voicemail} label="VM Drop" onClick={() => {}} />
            <ControlButton icon={MessageSquare} label="SMS" onClick={() => {}} />
          </div>

          {/* Hang up / Answer */}
          <div className="mt-3 flex gap-2">
            {isRinging && call?.direction === "inbound" && (
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2" onClick={handleAnswer}>
                <Phone className="w-4 h-4" /> Answer
              </Button>
            )}
            <Button variant="destructive" className="flex-1 gap-2" onClick={handleHangup}>
              <PhoneOff className="w-4 h-4" /> End Call
            </Button>
          </div>
        </div>
      )}

      {/* Dial Pad */}
      {(isIdle || (isInCall && showDialpad && !isWrapUp)) && (
        <div className="p-4 flex-1 flex flex-col">
          {/* Number display */}
          <div className="mb-3">
            <input
              type="text"
              className="w-full text-center text-lg font-mono bg-transparent border-b border-border pb-2 text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Enter number"
              value={dialInput}
              onChange={(e) => setDialInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDial()}
            />
          </div>

          {/* Keypad grid */}
          <div className="grid grid-cols-3 gap-2">
            {DIAL_KEYS.map(key => (
              <button
                key={key}
                className="h-12 rounded-xl bg-muted hover:bg-muted/80 active:bg-primary/10 text-foreground font-semibold text-lg transition-all active:scale-95"
                onClick={() => handleKeyPress(key)}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Call button */}
          {isIdle && (
            <Button
              className="mt-4 w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white text-base font-semibold gap-2"
              onClick={handleDial}
              disabled={!dialInput.trim()}
            >
              <Phone className="w-5 h-5" />
              Call
            </Button>
          )}
        </div>
      )}

      {/* Quick actions footer */}
      {isIdle && (
        <div className="p-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Headset</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle className="w-2 h-2 fill-green-500 text-green-500" />
            <span className="text-[11px] text-muted-foreground">Connected</span>
          </div>
        </div>
      )}
    </aside>
  );
}

function ControlButton({ icon: Icon, label, onClick, active }: {
  icon: any; label: string; onClick: () => void; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
        active ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[10px]">{label}</span>
    </button>
  );
}
