import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Phone, PhoneOff, Mic, MicOff, Pause, Play, Maximize2, Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DialerProvider } from "./dialerProvider";
import type { ActiveCallInfo } from "./types";

/**
 * Compact floating softphone that appears when an active call exists
 * and the user is NOT on /agent/dialer.
 */
export default function MiniSoftphone() {
  const [call, setCall] = useState<ActiveCallInfo | null>(DialerProvider.getCurrentCall());
  const [elapsed, setElapsed] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    DialerProvider.onCallStateChange(setCall);
  }, []);

  useEffect(() => {
    if (call?.state === "active" || call?.state === "on_hold") {
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - call.startedAt) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
    if (!call) setElapsed(0);
  }, [call?.state, call?.startedAt]);

  // Don't show on dialer page or when no active call
  const isOnDialer = location.pathname === "/agent/dialer";
  const hasActiveCall = call && call.state !== "idle" && call.state !== "wrap_up";
  if (isOnDialer || !hasActiveCall) return null;

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const isHold = call.state === "on_hold";

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
      {/* Header */}
      <div className={cn(
        "px-4 py-2 flex items-center justify-between",
        isHold ? "bg-orange-500/10" : "bg-green-500/10"
      )}>
        <div className="flex items-center gap-2">
          <Circle className={cn("w-2 h-2 fill-current", isHold ? "text-orange-500" : "text-green-500 animate-pulse")} />
          <span className="text-xs font-medium text-foreground">
            {call.state === "ringing" ? "Ringing…" : call.state === "dialing" ? "Dialing…" : isHold ? "On Hold" : "Active Call"}
          </span>
        </div>
        <span className={cn("text-sm font-mono font-semibold", isHold ? "text-orange-600" : "text-foreground")}>
          {fmt(elapsed)}
        </span>
      </div>

      {/* Contact Info */}
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-foreground truncate">
          {call.contactName || call.phoneNumber}
        </p>
        {call.contactName && (
          <p className="text-xs text-muted-foreground">{call.phoneNumber}</p>
        )}
        {call.isRecording && (
          <div className="flex items-center gap-1 mt-1 text-[10px] text-destructive">
            <Circle className="w-1.5 h-1.5 fill-current animate-pulse" /> Recording
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => DialerProvider.mute(!call.isMuted)}
        >
          {call.isMuted ? <MicOff className="w-3.5 h-3.5 text-destructive" /> : <Mic className="w-3.5 h-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => DialerProvider.hold(call.state !== "on_hold")}
        >
          {isHold ? <Play className="w-3.5 h-3.5 text-orange-500" /> : <Pause className="w-3.5 h-3.5" />}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1 h-8 gap-1 text-xs"
          onClick={() => DialerProvider.hangup()}
        >
          <PhoneOff className="w-3.5 h-3.5" /> End
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => navigate("/agent/dialer")}
          title="Open full dialer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
