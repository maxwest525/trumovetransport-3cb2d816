import AgentShell from "@/components/layout/AgentShell";
import { CarrierDashboard } from "@/components/agent/CarrierDashboard";

export default function AgentOperations() {
  return (
    <AgentShell breadcrumb=" / Bookings">
      {({ openDialer }) => (
        <div className="p-6 max-w-5xl mx-auto">
          <CarrierDashboard onCallCarrier={openDialer} />
        </div>
      )}
    </AgentShell>
  );
}
