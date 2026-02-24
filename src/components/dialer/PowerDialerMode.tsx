import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Zap, Play, Pause, SkipForward, Phone, Shield, ShieldAlert,
  Clock, User, Tag, ChevronRight, Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DialerProvider } from "./dialerProvider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ActiveCallInfo, CallState } from "./types";

interface PowerDialerContact {
  id: string;
  name: string;
  phone: string;
  attempts: number;
  lastOutcome: string | null;
  tags: string[];
  dnc: boolean;
  tcpaBlocked: boolean;
}

const MOCK_LIST: PowerDialerContact[] = [
  { id: "p1", name: "Jessica Martinez", phone: "+1 (555) 234-5678", attempts: 1, lastOutcome: "No Answer", tags: ["Hot Lead"], dnc: false, tcpaBlocked: false },
  { id: "p2", name: "Robert Chen", phone: "+1 (555) 345-6789", attempts: 0, lastOutcome: null, tags: ["New"], dnc: false, tcpaBlocked: false },
  { id: "p3", name: "Maria Santos", phone: "+1 (555) 456-7890", attempts: 2, lastOutcome: "Voicemail", tags: ["Follow-up"], dnc: false, tcpaBlocked: false },
  { id: "p4", name: "James Wilson", phone: "+1 (555) 567-8901", attempts: 0, lastOutcome: null, tags: [], dnc: true, tcpaBlocked: false },
  { id: "p5", name: "Amara Johnson", phone: "+1 (555) 678-9012", attempts: 1, lastOutcome: "Callback Scheduled", tags: ["Residential"], dnc: false, tcpaBlocked: false },
  { id: "p6", name: "David Park", phone: "+1 (555) 789-0123", attempts: 0, lastOutcome: null, tags: ["Commercial"], dnc: false, tcpaBlocked: true },
  { id: "p7", name: "Sarah Thompson", phone: "+1 (555) 890-1234", attempts: 3, lastOutcome: "Not Interested", tags: [], dnc: false, tcpaBlocked: false },
];

interface PowerDialerModeProps {
  callState: CallState;
}

export default function PowerDialerMode({ callState }: PowerDialerModeProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoStart, setAutoStart] = useState(true);
  const [delaySeconds, setDelaySeconds] = useState(3);
  const [skipDnc, setSkipDnc] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  const filteredList = skipDnc
    ? MOCK_LIST.filter(c => !c.dnc && !c.tcpaBlocked)
    : MOCK_LIST;

  const current = filteredList[currentIndex];
  const next = filteredList[currentIndex + 1];
  const progress = filteredList.length > 0 ? ((currentIndex + 1) / filteredList.length) * 100 : 0;

  // Auto-advance after wrap-up completes
  useEffect(() => {
    if (isRunning && callState === "idle" && autoStart && currentIndex < filteredList.length - 1) {
      setCountdown(delaySeconds);
    }
  }, [callState, isRunning]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown < 0) return;
    if (countdown === 0) {
      setCountdown(null);
      handleDialCurrent();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c !== null ? c - 1 : null), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleStart = () => {
    setIsRunning(true);
    setCurrentIndex(0);
    handleDialAt(0);
  };

  const handleStop = () => {
    setIsRunning(false);
    setCountdown(null);
  };

  const handleDialAt = (idx: number) => {
    const contact = filteredList[idx];
    if (contact && !contact.dnc && !contact.tcpaBlocked) {
      DialerProvider.startCall(contact.phone, contact.id, contact.name);
    }
  };

  const handleDialCurrent = () => handleDialAt(currentIndex);

  const handleSkip = () => {
    setCountdown(null);
    if (currentIndex < filteredList.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (isRunning && callState === "idle") {
        handleDialAt(nextIdx);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // When disposition is done (callState goes idle), advance
  useEffect(() => {
    if (isRunning && callState === "idle" && !autoStart) {
      handleNext();
    }
  }, [callState]);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Power Dialer</h2>
            <p className="text-xs text-muted-foreground">
              {filteredList.length} contacts · {currentIndex + 1} of {filteredList.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button className="gap-2" onClick={handleStart}>
              <Play className="w-4 h-4" /> Start Dialing
            </Button>
          ) : (
            <Button variant="destructive" className="gap-2" onClick={handleStop}>
              <Pause className="w-4 h-4" /> Stop
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="flex items-center justify-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <Clock className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            Next call in <span className="text-xl font-bold text-primary">{countdown}</span>s
          </span>
          <Button variant="outline" size="sm" onClick={handleSkip} className="ml-2 gap-1">
            <SkipForward className="w-3.5 h-3.5" /> Skip
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCountdown(null)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Current Contact Card */}
      {current && (
        <Card className={cn("border-2", isRunning ? "border-primary/30" : "border-border")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-[10px]">CURRENT</Badge>
              <Badge variant="outline" className="text-[10px] gap-1">
                <Phone className="w-3 h-3" /> Attempts: {current.attempts}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{current.name}</p>
                <p className="text-sm text-muted-foreground">{current.phone}</p>
              </div>
              {current.dnc && <Badge variant="destructive" className="text-[10px] gap-1"><ShieldAlert className="w-3 h-3" />DNC</Badge>}
              {current.tcpaBlocked && <Badge variant="destructive" className="text-[10px] gap-1"><Shield className="w-3 h-3" />TCPA</Badge>}
            </div>
            {current.lastOutcome && (
              <p className="text-xs text-muted-foreground mt-2">
                Last outcome: <span className="font-medium text-foreground">{current.lastOutcome}</span>
              </p>
            )}
            <div className="mt-2 flex items-center gap-1.5">
              {current.tags.map(t => (
                <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
              ))}
            </div>
            {!isRunning && callState === "idle" && (
              <Button className="mt-3 gap-2" size="sm" onClick={handleDialCurrent} disabled={current.dnc || current.tcpaBlocked}>
                <Phone className="w-3.5 h-3.5" /> Dial Now
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Up */}
      {next && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
          <Badge variant="outline" className="text-[9px] shrink-0">NEXT</Badge>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{next.name}</p>
            <p className="text-xs text-muted-foreground">{next.phone}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSkip}>
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Queue list */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Queue</p>
        {filteredList.map((contact, i) => (
          <div
            key={contact.id}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              i === currentIndex ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50",
              i < currentIndex && "opacity-50"
            )}
          >
            <span className="w-5 text-[11px] text-muted-foreground text-center">{i + 1}</span>
            <span className="flex-1 truncate text-foreground">{contact.name}</span>
            <span className="text-xs text-muted-foreground">{contact.attempts}×</span>
            {contact.dnc && <ShieldAlert className="w-3.5 h-3.5 text-destructive" />}
            {i === currentIndex && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
          </div>
        ))}
      </div>

      {/* Settings */}
      <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-xs text-muted-foreground gap-2">
            <span className="flex items-center gap-1.5"><Settings2 className="w-3.5 h-3.5" />Power Dialer Settings</span>
            <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", settingsOpen && "rotate-90")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Auto-start next call</span>
              <Switch checked={autoStart} onCheckedChange={setAutoStart} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Delay between calls</span>
              <Input
                type="number"
                min={0}
                max={30}
                value={delaySeconds}
                onChange={e => setDelaySeconds(Number(e.target.value))}
                className="w-16 h-8 text-sm text-center"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Skip DNC / TCPA blocked</span>
              <Switch checked={skipDnc} onCheckedChange={setSkipDnc} />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
