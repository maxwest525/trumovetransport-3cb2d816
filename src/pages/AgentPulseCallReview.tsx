import AgentShell from "@/components/layout/AgentShell";
import PulseCallReview from "@/pages/pulse/PulseCallReview";

export default function AgentPulseCallReview() {
  return (
    <AgentShell breadcrumb="/ Pulse / Call Review">
      <PulseCallReview embedded basePath="/agent/pulse" />
    </AgentShell>
  );
}
