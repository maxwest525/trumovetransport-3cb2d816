import ManagerShell from "@/components/layout/ManagerShell";
import PulseDashboard from "@/pages/pulse/PulseDashboard";

export default function ManagerPulse() {
  return (
    <ManagerShell breadcrumb="/ Pulse Dashboard">
      <PulseDashboard embedded basePath="/manager/pulse" />
    </ManagerShell>
  );
}
