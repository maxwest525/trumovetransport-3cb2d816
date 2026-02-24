import { useState } from "react";
import AgentShell from "@/components/layout/AgentShell";
import DialerSidebar from "@/components/dialer/DialerSidebar";
import ContactWorkspace from "@/components/dialer/ContactWorkspace";
import SoftphonePanel from "@/components/dialer/SoftphonePanel";
import PowerDialerMode from "@/components/dialer/PowerDialerMode";
import CallLogView from "@/components/dialer/CallLogView";
import RecordingsLibrary from "@/components/dialer/RecordingsLibrary";
import ScheduledCallbacks from "@/components/dialer/ScheduledCallbacks";
import { DialerProvider } from "@/components/dialer/dialerProvider";
import { useDialerShortcuts } from "@/hooks/useDialerShortcuts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Zap, List, Disc, CalendarClock } from "lucide-react";
import type { AgentCallStatus, CallState } from "@/components/dialer/types";

export default function AgentDialerPage() {
  const [agentStatus, setAgentStatus] = useState<AgentCallStatus>("not_ready");
  const [selectedQueue, setSelectedQueue] = useState("q1");
  const [selectedList, setSelectedList] = useState("l1");
  const [searchQuery, setSearchQuery] = useState("");
  const [callState, setCallState] = useState<CallState>("idle");
  const [activeTab, setActiveTab] = useState("workspace");
  const [showDialpad, setShowDialpad] = useState(true);

  // Keyboard shortcuts: Space=mute, H=hold, D=dialpad, N=next
  useDialerShortcuts({
    onToggleDialpad: () => setShowDialpad((p) => !p),
    onNextContact: activeTab === "power" ? () => {} : undefined,
  });

  const handleDial = (phone: string, name?: string) => {
    DialerProvider.startCall(phone, undefined, name);
  };

  return (
    <AgentShell breadcrumb=" / Dialer">
      {() => (
        <div className="flex h-[calc(100vh-3rem)] overflow-hidden">
          {/* Left: Queues & Lists */}
          <DialerSidebar
            agentStatus={agentStatus}
            onStatusChange={setAgentStatus}
            selectedQueue={selectedQueue}
            onQueueChange={setSelectedQueue}
            selectedList={selectedList}
            onListChange={setSelectedList}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Center: Tabs for workspace / power dialer / call log */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="border-b border-border bg-card px-4 pt-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="h-9 bg-transparent gap-1 p-0">
                  <TabsTrigger value="workspace" className="text-xs gap-1.5 data-[state=active]:bg-muted rounded-b-none h-9 px-3">
                    <Phone className="w-3.5 h-3.5" /> Workspace
                  </TabsTrigger>
                  <TabsTrigger value="power" className="text-xs gap-1.5 data-[state=active]:bg-muted rounded-b-none h-9 px-3">
                    <Zap className="w-3.5 h-3.5" /> Power Dialer
                  </TabsTrigger>
                  <TabsTrigger value="log" className="text-xs gap-1.5 data-[state=active]:bg-muted rounded-b-none h-9 px-3">
                    <List className="w-3.5 h-3.5" /> Call Log
                  </TabsTrigger>
                  <TabsTrigger value="recordings" className="text-xs gap-1.5 data-[state=active]:bg-muted rounded-b-none h-9 px-3">
                    <Disc className="w-3.5 h-3.5" /> Recordings
                  </TabsTrigger>
                  <TabsTrigger value="callbacks" className="text-xs gap-1.5 data-[state=active]:bg-muted rounded-b-none h-9 px-3">
                    <CalendarClock className="w-3.5 h-3.5" /> Callbacks
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {activeTab === "workspace" && <ContactWorkspace onDial={handleDial} />}
            {activeTab === "power" && <PowerDialerMode callState={callState} />}
            {activeTab === "log" && <CallLogView />}
            {activeTab === "recordings" && <RecordingsLibrary />}
            {activeTab === "callbacks" && <ScheduledCallbacks />}
          </div>

          {/* Right: Softphone */}
          <SoftphonePanel onCallStateChange={setCallState} />
        </div>
      )}
    </AgentShell>
  );
}
