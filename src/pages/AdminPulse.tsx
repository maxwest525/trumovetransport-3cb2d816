import AdminShell from "@/components/layout/AdminShell";
import PulseManager from "@/pages/pulse/PulseManager";

export default function AdminPulse() {
  return (
    <AdminShell breadcrumb="/ Pulse Settings">
      <PulseManager embedded />
    </AdminShell>
  );
}
