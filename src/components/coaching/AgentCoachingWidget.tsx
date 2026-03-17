import { useState, useEffect, useCallback } from "react";
import { 
  Headphones, ChevronDown, ChevronUp, AlertTriangle, 
  CheckCircle2, MessageSquare, Shield, Clock, X, Minimize2, Maximize2,
  Zap, Phone, PhoneOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CoachingChecklist } from "./CoachingChecklist";
import { TalkTrackCard } from "./TalkTrackCard";
import { KeywordPromptBanner } from "./KeywordPromptBanner";
import { useKeywordDetection } from "@/hooks/useKeywordDetection";
import { useCallTracking } from "@/hooks/useCallTracking";
import { toast } from "sonner";
import { 
  DEMO_CHECKLIST, 
  DEMO_TALK_TRACKS, 
  DEMO_COMPLIANCE_ALERTS,
  ComplianceAlert 
} from "./types";

interface AgentCoachingWidgetProps {
  customerName?: string;
  moveRoute?: string;
  callDuration?: string;
  onMinimize?: () => void;
  isMinimized?: boolean;
  enableKeywordDetection?: boolean;
}

export function AgentCoachingWidget({ 
  customerName = "John Anderson",
  moveRoute = "NYC → Miami",
  callDuration = "4:32",
  onMinimize,
  isMinimized = false,
  enableKeywordDetection = true
}: AgentCoachingWidgetProps) {
  const [activeTab, setActiveTab] = useState<'checklist' | 'scripts' | 'compliance' | 'live'>('live');
  const [alerts, setAlerts] = useState<ComplianceAlert[]>(DEMO_COMPLIANCE_ALERTS);
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [scriptsOpen, setScriptsOpen] = useState(true);
  const [simulatedInput, setSimulatedInput] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [callTimer, setCallTimer] = useState(0);

  const { 
    detectedKeywords, 
    highPriorityDetections, 
    detectKeywords, 
    dismissKeyword, 
    clearDetections 
  } = useKeywordDetection();

  const {
    currentCall,
    startCall,
    endCall,
    recordKeyword,
    recordTalkTrackUsed,
    logCoachingEvent
  } = useCallTracking();

  // Call timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = useCallback(async () => {
    setIsCallActive(true);
    setCallTimer(0);
    clearDetections();
    await startCall(customerName);
    toast.success("Call started", { description: `Customer: ${customerName}` });
  }, [customerName, startCall, clearDetections]);

  const handleEndCall = useCallback(async () => {
    setIsCallActive(false);
    await endCall('follow_up', 'Call ended by agent');
    toast.success("Call ended", { description: `Duration: ${formatTime(callTimer)}` });
  }, [endCall, callTimer]);

  // Simulate keyword detection from customer speech
  const handleSimulatedInput = useCallback((text: string) => {
    if (!enableKeywordDetection || !text.trim()) return;
    
    const newDetections = detectKeywords(text);
    
    // Record keywords and log events
    newDetections.forEach(async (detection) => {
      await recordKeyword(detection.matchedKeyword);
      if (currentCall) {
        await logCoachingEvent({
          call_id: currentCall.id,
          event_type: 'keyword_detected',
          keyword_detected: detection.matchedKeyword,
          prompt_shown: detection.talkTrack?.title,
          timestamp: new Date()
        });
      }
      
      if (detection.pattern.priority === 'high') {
        toast.warning(`🔥 Objection Detected: "${detection.matchedKeyword}"`, {
          description: `Suggested: ${detection.talkTrack?.title}`,
          duration: 5000
        });
      }
    });
  }, [enableKeywordDetection, detectKeywords, recordKeyword, currentCall, logCoachingEvent]);

  const handleTalkTrackUsed = useCallback(async (talkTrackId: string) => {
    await recordTalkTrackUsed(talkTrackId);
    if (currentCall) {
      await logCoachingEvent({
        call_id: currentCall.id,
        event_type: 'talk_track_used',
        talk_track_id: talkTrackId,
        agent_action: 'used_script',
        timestamp: new Date()
      });
    }
    toast.success("Talk track marked as used");
  }, [recordTalkTrackUsed, currentCall, logCoachingEvent]);

  const unacknowledgedAlerts = alerts.filter(a => !a.isAcknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(a => a.severity === 'critical');

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, isAcknowledged: true } : a
    ));
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onMinimize}
          className="h-12 px-4 rounded-full shadow-lg bg-primary hover:bg-primary/90 gap-2"
        >
          <Headphones className="w-5 h-5" />
          <span>Call Coach</span>
          {(criticalAlerts.length > 0 || highPriorityDetections.length > 0) && (
            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {criticalAlerts.length + highPriorityDetections.length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[600px]">
      {/* Header */}
      <div className={cn(
        "text-primary-foreground p-3 transition-colors",
        isCallActive ? "bg-green-600" : "bg-primary"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              {isCallActive ? (
                <Phone className="w-4 h-4 animate-pulse" />
              ) : (
                <Headphones className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="font-semibold text-sm">
                {isCallActive ? "Live Call" : "Call Coach"}
              </div>
              <div className="text-[10px] opacity-80">
                {isCallActive ? "Keyword detection active" : "Real-time guidance"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
              isCallActive ? "bg-white/30" : "bg-white/20"
            )}>
              <Clock className="w-3 h-3" />
              {isCallActive ? formatTime(callTimer) : callDuration}
            </div>
            {onMinimize && (
              <button onClick={onMinimize} className="p-1 hover:bg-white/20 rounded">
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Customer info */}
        <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between">
          <div className="text-xs">
            <span className="opacity-70">Customer: </span>
            <span className="font-medium">{customerName}</span>
          </div>
          <div className="text-xs opacity-70">{moveRoute}</div>
        </div>

        {/* Call controls */}
        <div className="mt-2 flex gap-2">
          {!isCallActive ? (
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 h-8 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={handleStartCall}
            >
              <Phone className="w-3 h-3 mr-1" />
              Start Call
            </Button>
          ) : (
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 h-8 text-xs"
              onClick={handleEndCall}
            >
              <PhoneOff className="w-3 h-3 mr-1" />
              End Call
            </Button>
          )}
        </div>
      </div>

      {/* High Priority Keyword Alerts */}
      {highPriorityDetections.length > 0 && (
        <div className="p-2 border-b bg-destructive/5">
          <KeywordPromptBanner
            detections={highPriorityDetections}
            onDismiss={dismissKeyword}
            onTalkTrackUsed={handleTalkTrackUsed}
          />
        </div>
      )}

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && highPriorityDetections.length === 0 && (
        <div className="bg-destructive/10 border-b border-destructive/30 px-3 py-2">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-medium flex-1">
              {criticalAlerts.length} compliance item{criticalAlerts.length > 1 ? 's' : ''} required
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b">
        {[
          { id: 'live', label: 'Live', icon: Zap, count: detectedKeywords.length },
          { id: 'checklist', label: 'Checklist', icon: CheckCircle2 },
          { id: 'scripts', label: 'Scripts', icon: MessageSquare },
          { id: 'compliance', label: 'Alerts', icon: Shield, count: unacknowledgedAlerts.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
              activeTab === tab.id 
                ? "text-primary border-b-2 border-primary bg-primary/5" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
            {tab.count && tab.count > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 p-0 flex items-center justify-center text-[10px]">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-3">
        {activeTab === 'live' && (
          <div className="space-y-3">
            {/* Keyword Simulation Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Simulate Customer Speech (for demo)
              </label>
              <div className="flex gap-2">
                <Input
                  value={simulatedInput}
                  onChange={(e) => setSimulatedInput(e.target.value)}
                  placeholder="e.g., 'That's too expensive'"
                  className="h-8 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSimulatedInput(simulatedInput);
                      setSimulatedInput("");
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => {
                    handleSimulatedInput(simulatedInput);
                    setSimulatedInput("");
                  }}
                >
                  <Zap className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Try: "too expensive", "need to think", "comparing quotes", "insurance"
              </p>
            </div>

            {/* All Detected Keywords */}
            {detectedKeywords.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-medium">Detected Keywords</div>
                <KeywordPromptBanner
                  detections={detectedKeywords}
                  onDismiss={dismissKeyword}
                  onTalkTrackUsed={handleTalkTrackUsed}
                />
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No keywords detected yet</p>
                <p className="text-[10px] mt-1">
                  {isCallActive 
                    ? "Listening for objections and opportunities..."
                    : "Start a call to begin detection"
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'checklist' && (
          <CoachingChecklist items={DEMO_CHECKLIST} />
        )}

        {activeTab === 'scripts' && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground mb-2">
              Click to expand talk tracks for common situations
            </div>
            {DEMO_TALK_TRACKS.map(track => (
              <TalkTrackCard key={track.id} track={track} />
            ))}
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-2">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border transition-all",
                  alert.isAcknowledged 
                    ? "bg-muted/50 border-muted opacity-60" 
                    : alert.severity === 'critical'
                      ? "bg-destructive/10 border-destructive/30"
                      : alert.severity === 'warning'
                        ? "bg-orange-500/10 border-orange-500/30"
                        : "bg-blue-500/10 border-blue-500/30"
                )}
              >
                {alert.isAcknowledged ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className={cn(
                    "w-4 h-4 flex-shrink-0",
                    alert.severity === 'critical' ? "text-destructive" :
                    alert.severity === 'warning' ? "text-orange-500" : "text-blue-500"
                  )} />
                )}
                <span className={cn(
                  "text-xs flex-1",
                  alert.isAcknowledged && "line-through"
                )}>
                  {alert.label}
                </span>
                {!alert.isAcknowledged && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    Done
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
