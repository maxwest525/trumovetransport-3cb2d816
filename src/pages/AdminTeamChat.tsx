import AdminShell from "@/components/layout/AdminShell";
import AgentTeamChat from "@/pages/AgentTeamChat";

export default function AdminTeamChat() {
  return (
    <AdminShell breadcrumb="/ Team Chat">
      <AgentTeamChat embedded />
    </AdminShell>
  );
}
