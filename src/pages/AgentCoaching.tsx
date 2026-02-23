import AgentShell from "@/components/layout/AgentShell";
import { AdminCoachingSummary } from "@/components/coaching/AdminCoachingSummary";

export default function AgentCoaching() {
  return (
    <AgentShell breadcrumb=" / Coaching">
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Team Performance</h1>
        <AdminCoachingSummary isLiveMode={true} />
      </div>
    </AgentShell>
  );
}
