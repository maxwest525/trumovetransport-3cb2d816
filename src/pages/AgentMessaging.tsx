import AgentShell from "@/components/layout/AgentShell";
import { ClientMessaging } from "@/components/agent/ClientMessaging";

export default function AgentMessaging() {
  return (
    <AgentShell breadcrumb=" / Customer Comms">
      <div className="p-4">
        <ClientMessaging />
      </div>
    </AgentShell>
  );
}
