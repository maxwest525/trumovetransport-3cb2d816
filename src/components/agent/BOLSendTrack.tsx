import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Send, Mail, MessageSquare, CheckCircle2,
  Clock, Eye, Loader2, Users, ExternalLink, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ClientSearchModal, type ClientData } from "@/components/agent/ClientSearchModal";

type DeliveryMethod = "email" | "sms";
type SigningStatus = "not_sent" | "sent" | "delivered" | "opened" | "signing" | "completed";

interface BOLRecord {
  id: string;
  refNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: SigningStatus;
  sentAt?: Date;
  openedAt?: Date;
  completedAt?: Date;
  deliveryMethod: DeliveryMethod;
  jobId?: string;
}

const STATUS_CONFIG: Record<SigningStatus, { label: string; color: string; icon: typeof Clock }> = {
  not_sent: { label: "Not Sent", color: "bg-muted text-muted-foreground", icon: Clock },
  sent: { label: "Sent", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: Send },
  delivered: { label: "Delivered", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", icon: Mail },
  opened: { label: "Opened", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400", icon: Eye },
  signing: { label: "Signing...", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", icon: Loader2 },
  completed: { label: "Completed", color: "bg-primary/10 text-primary", icon: CheckCircle2 },
};

interface BOLSendTrackProps {
  prefillName?: string;
  prefillEmail?: string;
  prefillPhone?: string;
  jobId?: string;
}

export function BOLSendTrack({ prefillName = "", prefillEmail = "", prefillPhone = "", jobId }: BOLSendTrackProps) {
  const DEMO_BOLS: BOLRecord[] = [
    {
      id: "bol-demo-1", refNumber: "BOL-2026-0018",
      customerName: "Ana Rodriguez", customerEmail: "ana.r@yahoo.com",
      customerPhone: "(305) 555-9012", status: "sent",
      sentAt: new Date(Date.now() - 7200000), deliveryMethod: "email",
    },
    {
      id: "bol-demo-2", refNumber: "BOL-2026-0015",
      customerName: "Robert Garcia", customerEmail: "rgarcia@gmail.com",
      customerPhone: "(555) 666-7777", status: "completed",
      sentAt: new Date(Date.now() - 172800000), openedAt: new Date(Date.now() - 169200000),
      completedAt: new Date(Date.now() - 162000000), deliveryMethod: "email",
    },
  ];

  const [documents, setDocuments] = useState<BOLRecord[]>(DEMO_BOLS);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [newDoc, setNewDoc] = useState({
    customerName: prefillName,
    customerEmail: prefillEmail,
    customerPhone: prefillPhone,
    deliveryMethod: "email" as DeliveryMethod,
  });

  const handleClientSelect = (client: ClientData) => {
    setNewDoc(prev => ({
      ...prev,
      customerName: client.name,
      customerEmail: client.email || "",
      customerPhone: client.phone || "",
    }));
  };

  const handleSend = async () => {
    if (!newDoc.customerName) { toast.error("Please enter customer name"); return; }
    if (newDoc.deliveryMethod === "email" && !newDoc.customerEmail) { toast.error("Please enter customer email"); return; }
    if (newDoc.deliveryMethod === "sms" && !newDoc.customerPhone) { toast.error("Please enter customer phone"); return; }

    setIsSending(true);
    const refNumber = `BOL-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    const signingUrl = `${window.location.origin}/esign/${refNumber}`;

    try {
      const { data, error } = await supabase.functions.invoke('send-esign-document', {
        body: {
          documentType: "bol", customerName: newDoc.customerName,
          customerEmail: newDoc.customerEmail, customerPhone: newDoc.customerPhone,
          refNumber, deliveryMethod: newDoc.deliveryMethod, signingUrl,
        },
      });

      if (error) {
        toast.error("Failed to send BOL", { description: error.message || "Please try again" });
        setIsSending(false);
        return;
      }

      const newRecord: BOLRecord = {
        id: `bol-${Date.now()}`, refNumber,
        customerName: newDoc.customerName, customerEmail: newDoc.customerEmail,
        customerPhone: newDoc.customerPhone, status: "sent", sentAt: new Date(),
        deliveryMethod: newDoc.deliveryMethod, jobId,
      };
      setDocuments(prev => [newRecord, ...prev]);

      const methodLabel = newDoc.deliveryMethod === "email" ? "email" : "SMS";
      toast.success(`Bill of Lading sent via ${methodLabel}`, {
        description: data?.method === "sms" ? "SMS delivery simulated for demo" : `Sent to ${newDoc.customerEmail}`,
      });
    } catch {
      toast.error("Failed to send Bill of Lading");
    } finally {
      setIsSending(false);
    }
  };

  const simulateProgress = (docId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      const progressMap: Record<SigningStatus, SigningStatus> = {
        not_sent: "sent", sent: "delivered", delivered: "opened",
        opened: "signing", signing: "completed", completed: "completed",
      };
      const newStatus = progressMap[doc.status];
      return {
        ...doc, status: newStatus,
        ...(newStatus === "opened" && { openedAt: new Date() }),
        ...(newStatus === "completed" && { completedAt: new Date() }),
      };
    }));
  };

  const viewDocument = (doc: BOLRecord) => {
    toast.info(`Viewing BOL ${doc.refNumber}`, { description: "BOL document preview coming soon" });
  };

  const formatTime = (date?: Date) => {
    if (!date) return "—";
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const pendingDocs = documents.filter(d => d.status !== "completed");
  const completedDocs = documents.filter(d => d.status === "completed");

  return (
    <div className="space-y-4">
      <ClientSearchModal open={showClientSearch} onClose={() => setShowClientSearch(false)} onSelect={handleClientSelect} />

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send" className="gap-2"><Send className="w-4 h-4" />Send BOL</TabsTrigger>
          <TabsTrigger value="track" className="gap-2"><Eye className="w-4 h-4" />Track ({pendingDocs.length})</TabsTrigger>
          <TabsTrigger value="completed" className="gap-2"><CheckCircle2 className="w-4 h-4" />Completed ({completedDocs.length})</TabsTrigger>
        </TabsList>

        {/* SEND TAB */}
        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Send className="w-5 h-5" />Send Bill of Lading for Signature</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Customer Name</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setShowClientSearch(true)}>
                      <Users className="w-3 h-3" />Import
                    </Button>
                  </div>
                  <Input value={newDoc.customerName} onChange={e => setNewDoc(prev => ({ ...prev, customerName: e.target.value }))} placeholder="John Smith" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" value={newDoc.customerEmail} onChange={e => setNewDoc(prev => ({ ...prev, customerEmail: e.target.value }))} placeholder="customer@email.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={newDoc.customerPhone} onChange={e => setNewDoc(prev => ({ ...prev, customerPhone: e.target.value }))} placeholder="(555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Method</Label>
                  <div className="flex gap-2">
                    <Button variant={newDoc.deliveryMethod === "email" ? "default" : "outline"} size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => setNewDoc(prev => ({ ...prev, deliveryMethod: "email" }))}><Mail className="w-3.5 h-3.5" />Email</Button>
                    <Button variant={newDoc.deliveryMethod === "sms" ? "default" : "outline"} size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => setNewDoc(prev => ({ ...prev, deliveryMethod: "sms" }))}><MessageSquare className="w-3.5 h-3.5" />SMS</Button>
                  </div>
                </div>
              </div>
              <Button className="w-full gap-2" onClick={handleSend} disabled={isSending}>
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSending ? "Sending..." : "Send Bill of Lading"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRACK TAB */}
        <TabsContent value="track" className="space-y-3">
          {pendingDocs.length === 0 ? (
            <Card><CardContent className="p-8 text-center space-y-3"><CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground/30" /><p className="text-muted-foreground">No pending BOLs</p></CardContent></Card>
          ) : (
            pendingDocs.map(doc => {
              const statusConfig = STATUS_CONFIG[doc.status];
              const StatusIcon = statusConfig.icon;
              return (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{doc.customerName}</span>
                          <Badge variant="outline" className="text-[10px]">{doc.refNumber}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Bill of Lading • Sent {formatTime(doc.sentAt)} via {doc.deliveryMethod.toUpperCase()}</p>
                        <Badge className={cn("gap-1", statusConfig.color)}>
                          <StatusIcon className={cn("w-3 h-3", doc.status === "signing" && "animate-spin")} />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => viewDocument(doc)}>
                          <Eye className="w-3 h-3" />View
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-8" onClick={() => simulateProgress(doc.id)}>
                          <Sparkles className="w-3 h-3" />Simulate
                        </Button>
                      </div>
                    </div>
                    {/* Progress Timeline */}
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex items-center justify-between gap-1">
                        {["sent", "delivered", "opened", "signing", "completed"].map((step, i) => {
                          const stepStatus = ["sent", "delivered", "opened", "signing", "completed"].indexOf(doc.status);
                          const isActive = i <= stepStatus;
                          const isCurrent = i === stepStatus;
                          return (
                            <div key={step} className="flex-1 flex items-center">
                              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium", isActive ? isCurrent ? "bg-primary text-primary-foreground" : "bg-foreground text-background" : "bg-muted text-muted-foreground")}>
                                {isActive && !isCurrent ? "✓" : i + 1}
                              </div>
                              {i < 4 && <div className={cn("flex-1 h-0.5 mx-1", i < stepStatus ? "bg-foreground" : "bg-muted")} />}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                        <span>Sent</span><span>Delivered</span><span>Opened</span><span>Signing</span><span>Done</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* COMPLETED TAB */}
        <TabsContent value="completed" className="space-y-3">
          {completedDocs.length === 0 ? (
            <Card><CardContent className="p-8 text-center space-y-3"><FileText className="w-12 h-12 mx-auto text-muted-foreground/30" /><p className="text-muted-foreground">No completed BOLs yet</p></CardContent></Card>
          ) : (
            completedDocs.map(doc => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{doc.customerName}</span>
                          <Badge variant="outline" className="text-[10px]">{doc.refNumber}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Bill of Lading • Completed {formatTime(doc.completedAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={() => viewDocument(doc)}><Eye className="w-3 h-3" />View</Button>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8"><ExternalLink className="w-3 h-3" />Download</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
