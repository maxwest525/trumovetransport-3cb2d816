import AgentShell from "@/components/layout/AgentShell";
import PulseAgent from "@/pages/pulse/PulseAgent";

export default function AgentPulse() {
  return (
    <AgentShell breadcrumb="/ Pulse Monitor">
      <PulseAgent embedded />
    </AgentShell>
  );
}
