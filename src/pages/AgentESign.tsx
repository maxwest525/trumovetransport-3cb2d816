import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AgentShell from "@/components/layout/AgentShell";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Send, Mail, MessageSquare, CheckCircle2,
  Clock, Eye, Loader2, Users,
  ExternalLink, Sparkles, CreditCard, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ClientSearchModal, type ClientData } from "@/components/agent/ClientSearchModal";


type DocumentType = "estimate" | "ccach";
type DeliveryMethod = "email" | "sms";
type SigningStatus = "not_sent" | "sent" | "delivered" | "opened" | "signing" | "completed";

interface DocumentRecord {
  id: string;
  type: DocumentType;
  refNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: SigningStatus;
  sentAt?: Date;
  openedAt?: Date;
  completedAt?: Date;
  deliveryMethod: DeliveryMethod;
}

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  estimate: "Estimate Authorization",
  ccach: "CC/ACH Authorization",
};

const STATUS_CONFIG: Record<SigningStatus, { label: string; color: string; icon: typeof Clock }> = {
  not_sent: { label: "Not Sent", color: "bg-muted text-muted-foreground", icon: Clock },
  sent: { label: "Sent", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: Send },
  delivered: { label: "Delivered", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", icon: Mail },
  opened: { label: "Opened", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400", icon: Eye },
  signing: { label: "Signing...", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", icon: Loader2 },
  completed: { label: "Completed", color: "bg-primary/10 text-primary", icon: CheckCircle2 },
};

export default function AgentESign() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillName = searchParams.get("name") || "";
  const prefillEmail = searchParams.get("email") || "";
  const prefillPhone = searchParams.get("phone") || "";
  const leadId = searchParams.get("leadId") || "";

  const [leadData, setLeadData] = useState<{ name: string; email: string; phone: string } | null>(null);

  // Fetch lead data if leadId is provided but name/email are missing
  useEffect(() => {
    if (leadId && !prefillName) {
      supabase
        .from("leads")
        .select("first_name, last_name, email, phone")
        .eq("id", leadId)
        .single()
        .then(({ data }) => {
          if (data) {
            setLeadData({
              name: `${data.first_name} ${data.last_name}`.trim(),
              email: data.email || "",
              phone: data.phone || "",
            });
          }
        });
    }
  }, [leadId, prefillName]);

  const resolvedName = prefillName || leadData?.name || "";
  const resolvedEmail = prefillEmail || leadData?.email || "";
  const resolvedPhone = prefillPhone || leadData?.phone || "";

  // Only show documents for the current customer (matched by leadId context)
  const currentCustomerName = resolvedName || "Sarah Chen";
  const DEMO_DOCUMENTS: DocumentRecord[] = [
    {
      id: "demo-1", type: "estimate", refNumber: "EST-2026-0042",
      customerName: currentCustomerName, customerEmail: resolvedEmail || "sarah.chen@gmail.com",
      customerPhone: resolvedPhone || "(415) 555-7890", status: "opened",
      sentAt: new Date(Date.now() - 3600000), openedAt: new Date(Date.now() - 1800000),
      deliveryMethod: "email",
    },
    {
      id: "demo-2", type: "ccach", refNumber: "CC-2026-0039",
      customerName: currentCustomerName, customerEmail: resolvedEmail || "sarah.chen@gmail.com",
      customerPhone: resolvedPhone || "(415) 555-7890", status: "sent",
      sentAt: new Date(Date.now() - 7200000), deliveryMethod: "email",
    },
  ];

  const [documents, setDocuments] = useState<DocumentRecord[]>(DEMO_DOCUMENTS);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Update documents when lead data loads
  useEffect(() => {
    if (leadData) {
      setDocuments(prev => prev.map(doc => ({
        ...doc,
        customerName: leadData.name || doc.customerName,
        customerEmail: leadData.email || doc.customerEmail,
        customerPhone: leadData.phone || doc.customerPhone,
      })));
      setNewDoc(prev => ({
        ...prev,
        customerName: leadData.name || prev.customerName,
        customerEmail: leadData.email || prev.customerEmail,
        customerPhone: leadData.phone || prev.customerPhone,
      }));
    }
  }, [leadData]);

  const [newDoc, setNewDoc] = useState({
    type: "estimate" as DocumentType,
    customerName: resolvedName,
    customerEmail: resolvedEmail,
    customerPhone: resolvedPhone,
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

  const handleSendDocument = async () => {
    if (!newDoc.customerName) { toast.error("Please enter customer name"); return; }
    if (newDoc.deliveryMethod === "email" && !newDoc.customerEmail) { toast.error("Please enter customer email"); return; }
    if (newDoc.deliveryMethod === "sms" && !newDoc.customerPhone) { toast.error("Please enter customer phone"); return; }

    setIsSending(true);
    const estRef = `EST-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    const signingUrl = `${window.location.origin}/esign/${estRef}`;

    try {
      const { error } = await supabase.functions.invoke('send-esign-document', {
        body: {
          documentType: "estimate", customerName: newDoc.customerName,
          customerEmail: newDoc.customerEmail, customerPhone: newDoc.customerPhone,
          refNumber: estRef, deliveryMethod: newDoc.deliveryMethod, signingUrl,
        },
      });

      if (error) {
        toast.error("Failed to send document", { description: error.message || "Please try again" });
        setIsSending(false);
        return;
      }

      const methodLabel = newDoc.deliveryMethod === "email" ? "email" : "SMS";
      toast.success(`Documents sent via ${methodLabel}`, {
        description: `Estimate & CC/ACH Authorization sent to ${newDoc.customerName}`,
      });

      // Navigate directly to the e-sign preview
      navigate(`/agent/esign/view?type=estimate&name=${encodeURIComponent(newDoc.customerName)}&email=${encodeURIComponent(newDoc.customerEmail)}&ref=${encodeURIComponent(estRef)}`);
    } catch (err) {
      toast.error("Failed to send document");
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = (doc: DocumentRecord) => {
    toast.success(`Resent ${DOCUMENT_LABELS[doc.type]} to ${doc.customerName}`);
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

  const viewDocument = (doc: DocumentRecord) => {
    navigate(`/agent/esign/view?type=${doc.type}&name=${encodeURIComponent(doc.customerName)}&email=${encodeURIComponent(doc.customerEmail)}&ref=${encodeURIComponent(doc.refNumber)}`);
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

  const goToPayment = (doc: DocumentRecord) => {
    navigate(`/agent/payment?name=${encodeURIComponent(doc.customerName)}&email=${encodeURIComponent(doc.customerEmail)}&phone=${encodeURIComponent(doc.customerPhone)}&leadId=${leadId}`);
  };

  const pendingDocs = documents.filter(d => d.status !== "completed");
  const completedDocs = documents.filter(d => d.status === "completed");

  return (
    <AgentShell breadcrumb=" / E-Sign">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <ClientSearchModal open={showClientSearch} onClose={() => setShowClientSearch(false)} onSelect={handleClientSelect} />




        {/* Workflow breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-foreground font-medium">New Customer</span>
          <ArrowRight className="w-3 h-3" />
          <span className="text-primary font-semibold">E-Sign</span>
          <ArrowRight className="w-3 h-3" />
          <span>Payment</span>
          <ArrowRight className="w-3 h-3" />
          <span>My Customers</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              E-Sign Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Send, track, and assist customers with document signing</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />{pendingDocs.length} pending</Badge>
            <Badge variant="secondary" className="gap-1"><CheckCircle2 className="w-3 h-3" />{completedDocs.length} completed</Badge>
          </div>
        </div>


        <Tabs defaultValue="send" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send" className="gap-2"><Send className="w-4 h-4" />Send Document</TabsTrigger>
            <TabsTrigger value="track" className="gap-2"><Eye className="w-4 h-4" />Track Status</TabsTrigger>
            <TabsTrigger value="completed" className="gap-2"><CheckCircle2 className="w-4 h-4" />Completed</TabsTrigger>
          </TabsList>

          {/* SEND TAB */}
          <TabsContent value="send" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Send className="w-5 h-5" />Send Documents for Signature</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">Both Estimate Authorization and CC/ACH Authorization will be sent together.</p>

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

                <Button className="w-full gap-2" onClick={handleSendDocument} disabled={isSending}>
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSending ? "Sending..." : "Send & Open Preview"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TRACK TAB */}
          <TabsContent value="track" className="space-y-4">
            {pendingDocs.length === 0 ? (
              <Card><CardContent className="p-8 text-center space-y-3"><CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground/30" /><p className="text-muted-foreground">No pending documents right now</p><p className="text-xs text-muted-foreground">Send a document from the Send tab to track it here</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {pendingDocs.map(doc => {
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
                            <p className="text-xs text-muted-foreground mb-2">{DOCUMENT_LABELS[doc.type]} • Sent {formatTime(doc.sentAt)} via {doc.deliveryMethod.toUpperCase()}</p>
                            <Badge className={cn("gap-1", statusConfig.color)}>
                              <StatusIcon className={cn("w-3 h-3", doc.status === "signing" && "animate-spin")} />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => viewDocument(doc)}>
                              <Eye className="w-3 h-3" />View
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
                })}
              </div>
            )}
          </TabsContent>

          {/* COMPLETED TAB */}
          <TabsContent value="completed" className="space-y-4">
            {completedDocs.length === 0 ? (
              <Card><CardContent className="p-8 text-center space-y-3"><FileText className="w-12 h-12 mx-auto text-muted-foreground/30" /><p className="text-muted-foreground">No completed documents yet</p><p className="text-xs text-muted-foreground">Documents will appear here once customers finish signing</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {completedDocs.map(doc => (
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
                            <p className="text-xs text-muted-foreground">{DOCUMENT_LABELS[doc.type]} • Completed {formatTime(doc.completedAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => goToPayment(doc)}>
                            <CreditCard className="w-3 h-3" />Collect Payment
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={() => viewDocument(doc)}><Eye className="w-3 h-3" />View</Button>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8"><ExternalLink className="w-3 h-3" />Download</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AgentShell>
  );
}
