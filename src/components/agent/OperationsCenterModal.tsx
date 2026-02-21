import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Users, Mail, Headphones } from "lucide-react";
import { CarrierDashboard } from "./CarrierDashboard";
import { CustomerLookup } from "./CustomerLookup";
import { ClientMessaging } from "./ClientMessaging";
import { ManagerCoachingDashboard } from "@/components/coaching/ManagerCoachingDashboard";

interface OperationsCenterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OperationsCenterModal({ open, onOpenChange }: OperationsCenterModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold">Operations</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="carrier" className="flex-1 flex flex-col overflow-hidden">
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
          
          <div className="flex-1 overflow-y-auto mt-3">
            <TabsContent value="carrier" className="mt-0 h-full">
              <CarrierDashboard />
            </TabsContent>
            <TabsContent value="customer" className="mt-0 h-full">
              <CustomerLookup />
            </TabsContent>
            <TabsContent value="messaging" className="mt-0 h-full">
              <ClientMessaging />
            </TabsContent>
            <TabsContent value="coaching" className="mt-0 h-full">
              <ManagerCoachingDashboard isLiveMode={true} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
