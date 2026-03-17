import ManagerShell from "@/components/layout/ManagerShell";
import PulseCallReview from "@/pages/pulse/PulseCallReview";

export default function ManagerPulseCallReview() {
  return (
    <ManagerShell breadcrumb="/ Pulse / Call Review">
      <PulseCallReview embedded basePath="/manager/pulse" />
    </ManagerShell>
  );
}
