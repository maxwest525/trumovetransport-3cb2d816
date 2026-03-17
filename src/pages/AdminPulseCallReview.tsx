import AdminShell from "@/components/layout/AdminShell";
import PulseCallReview from "@/pages/pulse/PulseCallReview";

export default function AdminPulseCallReview() {
  return (
    <AdminShell breadcrumb="/ Pulse / Call Review">
      <PulseCallReview embedded basePath="/admin/pulse" />
    </AdminShell>
  );
}
