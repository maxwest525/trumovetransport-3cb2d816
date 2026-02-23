import AgentShell from "@/components/layout/AgentShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Users, Mail, Headphones } from "lucide-react";
import { CarrierDashboard } from "@/components/agent/CarrierDashboard";
import { CustomerLookup } from "@/components/agent/CustomerLookup";
import { ClientMessaging } from "@/components/agent/ClientMessaging";
import { ManagerCoachingDashboard } from "@/components/coaching/ManagerCoachingDashboard";

export default function AgentOperations() {
  return (
    <AgentShell breadcrumb=" / Operations">
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Operations</h1>

        <Tabs defaultValue="carrier" className="flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="carrier" className="gap-1.5 text-xs">
              <Truck className="h-3.5 w-3.5" />
              Carriers
            </TabsTrigger>
            <TabsTrigger value="customer" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="messaging" className="gap-1.5 text-xs">
              <Mail className="h-3.5 w-3.5" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="coaching" className="gap-1.5 text-xs">
              <Headphones className="h-3.5 w-3.5" />
              Coaching
            </TabsTrigger>
          </TabsList>

          <div className="mt-3">
            <TabsContent value="carrier" className="mt-0">
              <CarrierDashboard />
            </TabsContent>
            <TabsContent value="customer" className="mt-0">
              <CustomerLookup />
            </TabsContent>
            <TabsContent value="messaging" className="mt-0">
              <ClientMessaging />
            </TabsContent>
            <TabsContent value="coaching" className="mt-0">
              <ManagerCoachingDashboard isLiveMode={true} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AgentShell>
  );
}
