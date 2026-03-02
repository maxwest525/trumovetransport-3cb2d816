import AgentShell from "@/components/layout/AgentShell";
import { CarrierDashboard } from "@/components/agent/CarrierDashboard";
import { BOLSendTrack } from "@/components/agent/BOLSendTrack";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, FileText } from "lucide-react";

export default function AgentOperations() {
  return (
    <AgentShell breadcrumb=" / Bookings">
      {({ openDialer }) => (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <Tabs defaultValue="jobs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="jobs" className="gap-2">
                <Truck className="w-4 h-4" />Jobs
              </TabsTrigger>
              <TabsTrigger value="bol" className="gap-2">
                <FileText className="w-4 h-4" />Bill of Lading
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jobs">
              <CarrierDashboard onCallCarrier={openDialer} />
            </TabsContent>

            <TabsContent value="bol">
              <BOLSendTrack />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AgentShell>
  );
}
