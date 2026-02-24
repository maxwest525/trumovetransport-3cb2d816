import { useState } from "react";
import AgentShell from "@/components/layout/AgentShell";
import DialerSidebar from "@/components/dialer/DialerSidebar";
import ContactWorkspace from "@/components/dialer/ContactWorkspace";
import SoftphonePanel from "@/components/dialer/SoftphonePanel";
import PowerDialerMode from "@/components/dialer/PowerDialerMode";
import CallLogView from "@/components/dialer/CallLogView";
import { DialerProvider } from "@/components/dialer/dialerProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Zap, List } from "lucide-react";
import type { AgentCallStatus, CallState } from "@/components/dialer/types";

export default function AgentDialerPage() {
  const [agentStatus, setAgentStatus] = useState<AgentCallStatus>("not_ready");
  const [selectedQueue, setSelectedQueue] = useState("q1");
  const [selectedList, setSelectedList] = useState("l1");
  const [searchQuery, setSearchQuery] = useState("");
  const [callState, setCallState] = useState<CallState>("idle");
  const [activeTab, setActiveTab] = useState("workspace");

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
                  <TabsTrigger value="workspace" className="text-xs gap-1.5 data-[state=active]:bg-muted rounded-b-none h-9 px-4">
                    <Phone className="w-3.5 h-3.5" /> Workspace
                  </TabsTrigger>
                  <TabsTrigger value="power" className="text-xs gap-1.5 data-[state=active]:bg-muted rounded-b-none h-9 px-4">
                    <Zap className="w-3.5 h-3.5" /> Power Dialer
                  </TabsTrigger>
                  <TabsTrigger value="log" className="text-xs gap-1.5 data-[state=active]:bg-muted rounded-b-none h-9 px-4">
                    <List className="w-3.5 h-3.5" /> Call Log
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {activeTab === "workspace" && <ContactWorkspace onDial={handleDial} />}
            {activeTab === "power" && <PowerDialerMode callState={callState} />}
            {activeTab === "log" && <CallLogView />}
          </div>

          {/* Right: Softphone */}
          <SoftphonePanel onCallStateChange={setCallState} />
        </div>
      )}
    </AgentShell>
  );
}
