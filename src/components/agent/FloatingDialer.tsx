import { useState, useCallback, useRef, useEffect } from "react";
import {
  Phone, X, Minus, Delete, PhoneCall, PhoneOff,
  Mic, MicOff, Volume2, VolumeX, Pause, Play,
  Grid3X3, User, GripHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingDialerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillNumber?: string;
}

const KEYS = [
  { label: "1", sub: "" },
  { label: "2", sub: "ABC" },
  { label: "3", sub: "DEF" },
  { label: "4", sub: "GHI" },
  { label: "5", sub: "JKL" },
  { label: "6", sub: "MNO" },
  { label: "7", sub: "PQRS" },
  { label: "8", sub: "TUV" },
  { label: "9", sub: "WXYZ" },
  { label: "*", sub: "" },
  { label: "0", sub: "+" },
  { label: "#", sub: "" },
];

export function FloatingDialer({ open, onOpenChange, prefillNumber }: FloatingDialerProps) {
  const [number, setNumber] = useState(prefillNumber || "");
  const [calling, setCalling] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [muted, setMuted] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [showKeypad, setShowKeypad] = useState(true);
  const [callSeconds, setCallSeconds] = useState(0);

  // Drag state
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Sync prefill number
  useEffect(() => {
    if (prefillNumber && !calling) {
      setNumber(prefillNumber);
    }
  }, [prefillNumber]);

  // Initialize position to bottom-right
  useEffect(() => {
    if (open && !initialized.current) {
      setPos({
        x: window.innerWidth - 296,
        y: window.innerHeight - 580,
      });
      initialized.current = true;
    }
  }, [open]);

  // Call timer
  useEffect(() => {
    if (!calling) {
      setCallSeconds(0);
      return;
    }
    const interval = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [calling]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleKey = useCallback((key: string) => {
    setNumber((prev) => prev + key);
  }, []);

  const handleDelete = useCallback(() => {
    setNumber((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setNumber("");
  }, []);

  const handleCall = () => {
    if (number.length > 0) {
      setCalling(true);
      setShowKeypad(false);
    }
  };

  const handleHangup = () => {
    setCalling(false);
    setMuted(false);
    setOnHold(false);
    setSpeaker(false);
    setShowKeypad(true);
  };

  // Drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 288, e.clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.current.y));
      setPos({ x: newX, y: newY });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  if (!open) return null;

  // Minimized pill
  if (minimized) {
    return (
      <div
        className="fixed z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        style={{ left: pos.x, top: pos.y }}
        onClick={() => setMinimized(false)}
      >
        {calling ? (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-primary/60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-xs font-medium text-foreground">{number || "On Call"}</span>
            <span className="text-[10px] text-muted-foreground">{formatTimer(callSeconds)}</span>
          </>
        ) : (
          <>
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">Dialer</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-50 w-72 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden",
        dragging && "select-none"
      )}
      style={{ left: pos.x, top: pos.y }}
    >
      {/* Draggable header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-border cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-3.5 h-3.5 text-muted-foreground/50" />
          <Phone className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-semibold text-foreground">Phone</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setMinimized(true)} className="p-1 rounded-md hover:bg-muted transition-colors">
            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => { onOpenChange(false); handleHangup(); }} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Number / call display */}
      <div className="px-4 pt-3 pb-2 text-center min-h-[3.5rem] flex flex-col items-center justify-center">
        {calling ? (
          <>
            <span className="text-base font-semibold text-foreground tracking-wider">{number}</span>
            <div className="flex items-center gap-2 mt-1">
              {onHold ? (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">On Hold</span>
              ) : (
                <span className="text-[11px] text-primary font-medium animate-pulse">Connected</span>
              )}
              <span className="text-[11px] text-muted-foreground font-mono">{formatTimer(callSeconds)}</span>
            </div>
          </>
        ) : (
          <>
            <span className={cn(
              "text-xl font-semibold tracking-wider transition-colors",
              number ? "text-foreground" : "text-muted-foreground/40"
            )}>
              {number || "Enter number"}
            </span>
            {number && (
              <button onClick={handleClear} className="text-[10px] text-muted-foreground hover:text-foreground mt-1 transition-colors">
                Clear
              </button>
            )}
          </>
        )}
      </div>

      {/* In-call controls */}
      {calling && (
        <div className="grid grid-cols-4 gap-1 px-4 pb-2">
          <button
            onClick={() => setMuted(!muted)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors",
              muted ? "bg-destructive/10 text-destructive" : "hover:bg-muted text-muted-foreground"
            )}
          >
            {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="text-[9px] font-medium">Mute</span>
          </button>
          <button
            onClick={() => setOnHold(!onHold)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors",
              onHold ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "hover:bg-muted text-muted-foreground"
            )}
          >
            {onHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="text-[9px] font-medium">Hold</span>
          </button>
          <button
            onClick={() => setSpeaker(!speaker)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors",
              speaker ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
            )}
          >
            {speaker ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[9px] font-medium">Speaker</span>
          </button>
          <button
            onClick={() => setShowKeypad(!showKeypad)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors",
              showKeypad ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
            )}
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="text-[9px] font-medium">Keypad</span>
          </button>
        </div>
      )}

      {/* Keypad */}
      {showKeypad && (
        <div className="grid grid-cols-3 gap-1 px-4 pb-2">
          {KEYS.map((key) => (
            <button
              key={key.label}
              onClick={() => handleKey(key.label)}
              className="flex flex-col items-center justify-center h-11 rounded-xl hover:bg-muted active:bg-muted/70 transition-colors"
            >
              <span className="text-lg font-semibold text-foreground leading-none">{key.label}</span>
              {key.sub && <span className="text-[8px] text-muted-foreground tracking-widest leading-none mt-0.5">{key.sub}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-center gap-3 px-4 pb-3 pt-1">
        {!calling ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={handleDelete}
              disabled={!number}
            >
              <Delete className="w-4 h-4" />
            </Button>
            <button
              className="h-13 w-13 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
              onClick={handleCall}
              disabled={!number}
              style={{ width: 52, height: 52 }}
            >
              <PhoneCall className="w-5 h-5" />
            </button>
            <div className="w-10" />
          </>
        ) : (
          <button
            className="rounded-full bg-destructive text-destructive-foreground shadow-md flex items-center justify-center hover:opacity-90 transition-opacity"
            onClick={handleHangup}
            style={{ width: 52, height: 52 }}
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
