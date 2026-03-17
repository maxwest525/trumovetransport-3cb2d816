import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Phone, PhoneOff, Mic, MicOff, Pause, Play, Maximize2, Minimize2,
  Circle, ChevronUp, ChevronDown, Hash, Users, PhoneForwarded,
  Volume2, VolumeX, UserPlus, GripHorizontal, ExternalLink, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DialerProvider } from "./dialerProvider";
import type { ActiveCallInfo } from "./types";
import { supabase } from "@/integrations/supabase/client";

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
  const [matchedLead, setMatchedLead] = useState<{ id: string; name: string } | null>(null);
  const [dialNumber, setDialNumber] = useState("");
  const [idleShowDialpad, setIdleShowDialpad] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Drag state
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  }, [dragging]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
    dragRef.current = null;
  }, []);

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

  // Try to match phone number to a lead
  useEffect(() => {
    if (!call?.phoneNumber) {
      setMatchedLead(null);
      return;
    }
    const digits = call.phoneNumber.replace(/\D/g, "").slice(-10);
    if (digits.length < 7) return;

    supabase
      .from("leads")
      .select("id, first_name, last_name, phone")
      .or(`phone.ilike.%${digits}%`)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMatchedLead({ id: data[0].id, name: `${data[0].first_name} ${data[0].last_name}` });
        } else {
          setMatchedLead(null);
        }
      });
  }, [call?.phoneNumber]);

  const isOnDialer = location.pathname === "/agent/dialer";
  const hasActiveCall = call && call.state !== "idle" && call.state !== "wrap_up";

  const handleDialKey = (key: string) => {
    setDialNumber(prev => prev + key);
  };

  const handleStartCall = () => {
    if (!dialNumber.trim()) return;
    DialerProvider.startCall(dialNumber.trim());
    setDialNumber("");
  };

  // ── Idle / Ready state (no active call) ──
  if (!hasActiveCall) {
    return (
      <div
        ref={cardRef}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        className="fixed bottom-4 right-4 z-50 rounded-2xl border border-border bg-card shadow-xl overflow-hidden hidden sm:block w-72"
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="flex items-center justify-center py-1 cursor-grab active:cursor-grabbing select-none"
        >
          <GripHorizontal className="w-4 h-4 text-muted-foreground/40" />
        </div>
        <div className="px-4 pb-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground">Ready</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-[10px] text-muted-foreground"
              onClick={() => navigate("/agent/new-customer")}
            >
              <Plus className="w-3 h-3 mr-1" /> New Lead
            </Button>
          </div>

          {/* Number display */}
          <div className="relative">
            <input
              type="tel"
              value={dialNumber}
              onChange={e => setDialNumber(e.target.value)}
              placeholder="Enter number..."
              className="w-full h-10 rounded-lg bg-muted border-0 text-center text-base font-mono font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              onKeyDown={e => { if (e.key === "Enter") handleStartCall(); }}
            />
          </div>

          {/* Dialpad */}
          {idleShowDialpad && (
            <div className="grid grid-cols-3 gap-1">
              {DIALPAD.flat().map((key) => (
                <button
                  key={key}
                  className="h-9 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-semibold transition-colors active:scale-95"
                  onClick={() => handleDialKey(key)}
                >
                  {key}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-[10px]"
              onClick={() => setIdleShowDialpad(!idleShowDialpad)}
            >
              <Hash className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 gap-1.5 text-xs"
              disabled={!dialNumber.trim()}
              onClick={handleStartCall}
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </Button>
            {dialNumber && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-[10px] text-muted-foreground"
                onClick={() => setDialNumber("")}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop floating card (sm+) ── */}
      <div
        ref={cardRef}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        className={cn(
          "fixed bottom-4 right-4 z-50 rounded-2xl border border-border bg-card shadow-xl overflow-hidden hidden sm:block transition-shadow",
          fullView ? "w-[340px]" : "w-80",
          dragging && "shadow-2xl"
        )}
      >
        {/* Drag handle */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="flex items-center justify-center py-1 cursor-grab active:cursor-grabbing select-none"
        >
          <GripHorizontal className="w-4 h-4 text-muted-foreground/40" />
        </div>
        {/* Header */}
        <div className={cn(
          "px-4 py-2 flex items-center justify-between",
          isHold ? "bg-orange-500/10" : "bg-green-500/10"
        )}>
          <div className="flex items-center gap-2">
            <Circle className={cn("w-2 h-2 fill-current", isHold ? "text-orange-500" : "text-green-500 animate-pulse")} />
            <span className="text-xs font-medium text-foreground">
              {call!.state === "ringing" ? "Ringing…" : call!.state === "dialing" ? "Dialing…" : isHold ? "On Hold" : "Active Call"}
            </span>
          </div>
          <span className={cn("text-sm font-mono font-semibold", isHold ? "text-orange-600" : "text-foreground")}>
            {fmt(elapsed)}
          </span>
        </div>

        {/* Contact Info */}
        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-foreground truncate">
            {call!.contactName || call!.phoneNumber}
          </p>
          {call!.contactName && (
            <p className="text-xs text-muted-foreground">{call!.phoneNumber}</p>
          )}
          {call!.isRecording && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-destructive">
              <Circle className="w-1.5 h-1.5 fill-current animate-pulse" /> Recording
            </div>
          )}

          {/* Customer link / New Lead */}
          <div className="mt-2 flex gap-1.5">
            {matchedLead ? (
              <button
                onClick={() => navigate(`/agent/customers/${matchedLead.id}`)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {matchedLead.name}
              </button>
            ) : (
              <button
                onClick={() => navigate("/agent/new-customer")}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground text-[10px] font-medium hover:bg-muted/80 transition-colors"
              >
                <Plus className="w-3 h-3" />
                New Lead
              </button>
            )}
          </div>
        </div>

        {/* Primary Controls */}
        <div className="px-4 pb-2 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => DialerProvider.mute(!call!.isMuted)} title={call!.isMuted ? "Unmute" : "Mute"}>
            {call!.isMuted ? <MicOff className="w-3.5 h-3.5 text-destructive" /> : <Mic className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => DialerProvider.hold(call!.state !== "on_hold")} title={isHold ? "Resume" : "Hold"}>
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
              {call!.contactName || call!.phoneNumber}
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
              <p className="text-base font-semibold text-foreground">{call!.contactName || call!.phoneNumber}</p>
              {call!.contactName && <p className="text-xs text-muted-foreground">{call!.phoneNumber}</p>}
              {call!.isRecording && (
                <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-destructive">
                  <Circle className="w-1.5 h-1.5 fill-current animate-pulse" /> Recording
                </div>
              )}
              {/* Customer link / New Lead - Mobile */}
              <div className="mt-2 flex justify-center gap-1.5">
                {matchedLead ? (
                  <button
                    onClick={() => navigate(`/agent/customers/${matchedLead.id}`)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[11px] font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {matchedLead.name}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/agent/new-customer")}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-[11px] font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    New Lead
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="icon" className={cn("h-12 w-12 rounded-full", call!.isMuted && "bg-destructive/10")} onClick={() => DialerProvider.mute(!call!.isMuted)}>
                {call!.isMuted ? <MicOff className="w-5 h-5 text-destructive" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" className={cn("h-12 w-12 rounded-full", isHold && "bg-orange-500/10")} onClick={() => DialerProvider.hold(call!.state !== "on_hold")}>
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
