import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, Phone, Mail, MapPin, ChevronRight, Sparkles, UserPlus, FileText, Calendar, Truck } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalMoves: number;
  lifetimeValue: number;
  lastMove: string;
  status: "active" | "pending" | "completed";
}

interface PastMove {
  id: string;
  bookingRef: string;
  customerName: string;
  email: string;
  phone: string;
  originAddress: string;
  destAddress: string;
  moveDate: string;
  status: "completed" | "cancelled" | "in-progress";
  estimatedWeight: string;
}

// TODO: Replace with real DB queries
const searchCustomersFromDB = async (_query: string): Promise<Customer[]> => [];
const searchMovesFromDB = async (_query: string): Promise<PastMove[]> => [];

export interface ClientData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface ClientSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (client: ClientData) => void;
}

export function ClientSearchModal({ open, onClose, onSelect }: ClientSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [moveSearchQuery, setMoveSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pastMoves, setPastMoves] = useState<PastMove[]>([]);
  const [activeTab, setActiveTab] = useState("customers");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Enter a name, email, or phone to search");
      return;
    }
    const results = await searchCustomersFromDB(searchQuery);
    setCustomers(results);
    if (results.length === 0) {
      toast.info("No customers found");
    } else {
      toast.success(`Found ${results.length} customer(s)`);
    }
  };

  const handleMoveSearch = async () => {
    if (!moveSearchQuery.trim()) {
      toast.error("Enter a booking ref, name, or address to search");
      return;
    }
    const results = await searchMovesFromDB(moveSearchQuery);
    setPastMoves(results);
    if (results.length === 0) {
      toast.info("No past moves found");
    } else {
      toast.success(`Found ${results.length} move(s)`);
    }
  };

  const handleSelect = (customer: Customer) => {
    onSelect({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
    onClose();
    toast.success(`Imported ${customer.name}'s information`);
  };

  const handleMoveSelect = (move: PastMove, useOrigin: boolean) => {
    onSelect({
      name: move.customerName,
      email: move.email,
      phone: move.phone,
      address: useOrigin ? move.originAddress : move.destAddress,
    });
    onClose();
    toast.success(`Imported from ${move.bookingRef} (${useOrigin ? "origin" : "destination"})`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "in-progress":
        return "bg-primary/10 text-primary border-primary/30";
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "completed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="w-5 h-5 text-primary" />
            Import Client Information
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customers" className="gap-2">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="moves" className="gap-2">
              <FileText className="w-4 h-4" />
              Past Moves
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="flex-1 overflow-hidden flex flex-col mt-4 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search by name, email, or phone..."
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] max-h-[350px]">
              {customers.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Search for customers by name, email, or phone</p>
                </div>
              ) : (
                customers.map((customer) => (
                  <Card
                    key={customer.id}
                    className="cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/50"
                    onClick={() => handleSelect(customer)}
                  >
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{customer.name}</h3>
                            <Badge variant="outline" className={`text-[10px] ${getStatusColor(customer.status)}`}>
                              {customer.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{customer.address}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="moves" className="flex-1 overflow-hidden flex flex-col mt-4 space-y-4">
            {/* Move Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={moveSearchQuery}
                  onChange={(e) => setMoveSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleMoveSearch()}
                  placeholder="Search by booking ref, name, or address..."
                  className="pl-10"
                />
              </div>
              <Button onClick={handleMoveSearch} size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <Button onClick={loadAllMoveDemo} variant="outline" size="sm" className="gap-1">
                <Sparkles className="w-4 h-4" />
                Demo
              </Button>
            </div>

            {/* Past Moves List */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] max-h-[350px]">
              {pastMoves.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Search for past moves or load demo data</p>
                </div>
              ) : (
                pastMoves.map((move) => (
                  <Card key={move.id} className="transition-all hover:border-primary/50">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold">{move.bookingRef}</span>
                          <Badge variant="outline" className={`text-[10px] ${getStatusColor(move.status)}`}>
                            {move.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {move.moveDate}
                        </div>
                      </div>
                      <div className="text-sm font-medium mb-1">{move.customerName}</div>
                      <div className="text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {move.email}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8 gap-1"
                          onClick={() => handleMoveSelect(move, true)}
                        >
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          Use Origin
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8 gap-1"
                          onClick={() => handleMoveSelect(move, false)}
                        >
                          <MapPin className="w-3 h-3 text-red-500" />
                          Use Destination
                        </Button>
                      </div>
                      <div className="mt-2 text-[10px] text-muted-foreground grid grid-cols-2 gap-1">
                        <div className="truncate">From: {move.originAddress}</div>
                        <div className="truncate">To: {move.destAddress}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-center text-muted-foreground pt-2 border-t">
          {activeTab === "customers" 
            ? "Click a customer to import their information" 
            : "Choose origin or destination address from a past move"}
        </p>
      </DialogContent>
    </Dialog>
  );
}
