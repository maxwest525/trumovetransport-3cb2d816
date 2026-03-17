import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Phone, PhoneOff, Mic, MicOff, Pause, Play, Maximize2, Minimize2,
  Circle, ChevronUp, ChevronDown, Hash, Users, PhoneForwarded,
  Volume2, VolumeX, UserPlus, Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DialerProvider } from "./dialerProvider";
import type { ActiveCallInfo } from "./types";

const DIALPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

export default function MiniSoftphone() {
  const [call, setCall] = useState<ActiveCallInfo | null>(DialerProvider.getCurrentCall());
  const [elapsed, setElapsed] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [fullView, setFullView] = useState(false);
  const [showDialpad, setShowDialpad] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const location = useLocation();

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

  const isOnDialer = location.pathname === "/agent/dialer";
  const hasActiveCall = call && call.state !== "idle" && call.state !== "wrap_up";
  if (isOnDialer || !hasActiveCall) return null;

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const isHold = call.state === "on_hold";

  return (
    <>
      {/* ── Desktop floating card (sm+) ── */}
      <div className={cn(
        "fixed bottom-4 right-4 z-50 rounded-2xl border border-border bg-card shadow-xl overflow-hidden hidden sm:block transition-all duration-200",
        fullView ? "w-80" : "w-72"
      )}>
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

        {/* Primary Controls */}
        <div className="px-4 pb-2 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => DialerProvider.mute(!call.isMuted)} title={call.isMuted ? "Unmute" : "Mute"}>
            {call.isMuted ? <MicOff className="w-3.5 h-3.5 text-destructive" /> : <Mic className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => DialerProvider.hold(call.state !== "on_hold")} title={isHold ? "Resume" : "Hold"}>
            {isHold ? <Play className="w-3.5 h-3.5 text-orange-500" /> : <Pause className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="destructive" size="sm" className="flex-1 h-8 gap-1 text-xs" onClick={() => DialerProvider.hangup()}>
            <PhoneOff className="w-3.5 h-3.5" /> End
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => { setFullView(!fullView); setShowDialpad(false); }}
            title={fullView ? "Collapse" : "Expand"}
          >
            {fullView ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>

        {/* ── Expanded full-view features ── */}
        {fullView && (
          <div className="border-t border-border">
            {/* Feature toolbar */}
            <div className="px-3 py-2 flex items-center justify-around">
              <button
                onClick={() => setShowDialpad(!showDialpad)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors text-[10px]",
                  showDialpad ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Hash className="w-4 h-4" />
                <span>Keypad</span>
              </button>
              <button
                onClick={() => setSpeakerOn(!speakerOn)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors text-[10px]",
                  speakerOn ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {speakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>Speaker</span>
              </button>
              <button className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-[10px]">
                <PhoneForwarded className="w-4 h-4" />
                <span>Transfer</span>
              </button>
              <button className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-[10px]">
                <Users className="w-4 h-4" />
                <span>Conference</span>
              </button>
              <button className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-[10px]">
                <UserPlus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Dialpad */}
            {showDialpad && (
              <div className="px-6 pb-3">
                <div className="grid grid-cols-3 gap-1.5">
                  {DIALPAD.flat().map((key) => (
                    <button
                      key={key}
                      className="h-10 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-semibold transition-colors active:scale-95"
                      onClick={() => {/* DTMF tone */}}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Call quality / info bar */}
            <div className="px-4 py-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>HD Voice</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Space: Mute</span>
                <span>H: Hold</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile bottom sheet (< sm) ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 sm:hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 border-t border-border bg-card",
            isHold ? "bg-orange-500/5" : "bg-green-500/5"
          )}
        >
          <div className="flex items-center gap-2">
            <Circle className={cn("w-2 h-2 fill-current", isHold ? "text-orange-500" : "text-green-500 animate-pulse")} />
            <span className="text-sm font-medium text-foreground truncate max-w-[140px]">
              {call.contactName || call.phoneNumber}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn("text-sm font-mono font-semibold", isHold ? "text-orange-600" : "text-foreground")}>
              {fmt(elapsed)}
            </span>
            {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {expanded && (
          <div className="bg-card border-t border-border px-4 pb-5 pt-3 space-y-3">
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">{call.contactName || call.phoneNumber}</p>
              {call.contactName && <p className="text-xs text-muted-foreground">{call.phoneNumber}</p>}
              {call.isRecording && (
                <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-destructive">
                  <Circle className="w-1.5 h-1.5 fill-current animate-pulse" /> Recording
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="icon" className={cn("h-12 w-12 rounded-full", call.isMuted && "bg-destructive/10")} onClick={() => DialerProvider.mute(!call.isMuted)}>
                {call.isMuted ? <MicOff className="w-5 h-5 text-destructive" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" className={cn("h-12 w-12 rounded-full", isHold && "bg-orange-500/10")} onClick={() => DialerProvider.hold(call.state !== "on_hold")}>
                {isHold ? <Play className="w-5 h-5 text-orange-500" /> : <Pause className="w-5 h-5" />}
              </Button>
              <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full" onClick={() => DialerProvider.hangup()}>
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile feature row */}
            <div className="flex items-center justify-center gap-6 pt-1">
              <button onClick={() => setShowDialpad(!showDialpad)} className={cn("flex flex-col items-center gap-0.5 text-[10px]", showDialpad ? "text-primary" : "text-muted-foreground")}>
                <Hash className="w-4 h-4" />
                <span>Keypad</span>
              </button>
              <button className="flex flex-col items-center gap-0.5 text-[10px] text-muted-foreground">
                <PhoneForwarded className="w-4 h-4" />
                <span>Transfer</span>
              </button>
              <button onClick={() => setSpeakerOn(!speakerOn)} className={cn("flex flex-col items-center gap-0.5 text-[10px]", speakerOn ? "text-primary" : "text-muted-foreground")}>
                {speakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>Speaker</span>
              </button>
            </div>

            {showDialpad && (
              <div className="grid grid-cols-3 gap-1.5 px-6">
                {DIALPAD.flat().map((key) => (
                  <button
                    key={key}
                    className="h-12 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-base font-semibold transition-colors active:scale-95"
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <span>Space: Mute</span>
              <span>H: Hold</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
