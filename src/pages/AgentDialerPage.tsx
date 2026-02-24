import { useState } from "react";
import AgentShell from "@/components/layout/AgentShell";
import DialerSidebar from "@/components/dialer/DialerSidebar";
import ContactWorkspace from "@/components/dialer/ContactWorkspace";
import SoftphonePanel from "@/components/dialer/SoftphonePanel";
import { DialerProvider } from "@/components/dialer/dialerProvider";
import type { AgentCallStatus, CallState } from "@/components/dialer/types";

export default function AgentDialerPage() {
  const [agentStatus, setAgentStatus] = useState<AgentCallStatus>("not_ready");
  const [selectedQueue, setSelectedQueue] = useState("q1");
  const [selectedList, setSelectedList] = useState("l1");
  const [searchQuery, setSearchQuery] = useState("");
  const [callState, setCallState] = useState<CallState>("idle");

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

          {/* Center: Contact Workspace */}
          <ContactWorkspace onDial={handleDial} />

          {/* Right: Softphone */}
          <SoftphonePanel onCallStateChange={setCallState} />
        </div>
      )}
    </AgentShell>
  );
}
