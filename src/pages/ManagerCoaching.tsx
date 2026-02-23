import ManagerShell from "@/components/layout/ManagerShell";
import { ManagerCoachingDashboard } from "@/components/coaching/ManagerCoachingDashboard";

export default function ManagerCoaching() {
  return (
    <ManagerShell breadcrumb=" / Coaching & Monitoring">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Agent Coaching & Monitoring</h1>
          <p className="text-sm text-muted-foreground">Monitor live calls, coach agents in real-time, and track team performance.</p>
        </div>
        <ManagerCoachingDashboard isLiveMode />
      </div>
    </ManagerShell>
  );
}
