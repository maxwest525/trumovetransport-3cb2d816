import ManagerShell from "@/components/layout/ManagerShell";
import AgentTeamChat from "@/pages/AgentTeamChat";

export default function ManagerTeamChat() {
  return (
    <ManagerShell breadcrumb="/ Team Chat">
      <AgentTeamChat embedded />
    </ManagerShell>
  );
}
