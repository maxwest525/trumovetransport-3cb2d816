import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Send, Mail, MessageSquare, CheckCircle2,
  Clock, Eye, Loader2, CreditCard, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DocumentType = "estimate" | "ccach" | "bol";
type DeliveryMethod = "email" | "sms";
type SigningStatus = "not_sent" | "sent" | "delivered" | "opened" | "signing" | "completed";

interface DocumentRecord {
  id: string;
  type: DocumentType;
  refNumber: string;
  status: SigningStatus;
  sentAt?: Date;
  openedAt?: Date;
  completedAt?: Date;
  deliveryMethod: DeliveryMethod;
}

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  estimate: "Estimate Authorization",
  ccach: "CC/ACH Authorization",
  bol: "Bill of Lading",
};

const STATUS_CONFIG: Record<SigningStatus, { label: string; color: string; icon: typeof Clock }> = {
  not_sent: { label: "Not Sent", color: "bg-muted text-muted-foreground", icon: Clock },
  sent: { label: "Sent", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: Send },
  delivered: { label: "Delivered", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", icon: Mail },
  opened: { label: "Opened", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400", icon: Eye },
  signing: { label: "Signing...", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", icon: Loader2 },
  completed: { label: "Completed", color: "bg-primary/10 text-primary", icon: CheckCircle2 },
};

interface AgentESignTabProps {
  leadId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export function AgentESignTab({ leadId, customerName, customerEmail, customerPhone }: AgentESignTabProps) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newDoc, setNewDoc] = useState({
    type: "estimate" as DocumentType,
    deliveryMethod: "email" as DeliveryMethod,
  });

  // Load existing documents from DB
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("esign_documents")
          .select("*")
          .eq("lead_id", leadId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to load esign documents:", error);
        } else if (data) {
          setDocuments(data.map((row: any) => ({
            id: row.id,
            type: row.document_type as DocumentType,
            refNumber: row.ref_number,
            status: row.status as SigningStatus,
            sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
            openedAt: row.opened_at ? new Date(row.opened_at) : undefined,
            completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
            deliveryMethod: row.delivery_method as DeliveryMethod,
          })));
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadDocuments();
  }, [leadId]);

  const handleSendDocument = async () => {
    if (newDoc.deliveryMethod === "email" && !customerEmail) { toast.error("Customer has no email address"); return; }
    if (newDoc.deliveryMethod === "sms" && !customerPhone) { toast.error("Customer has no phone number"); return; }

    setIsSending(true);
    const prefixMap: Record<DocumentType, string> = { estimate: "EST", ccach: "CC", bol: "BOL" };
    const refNumber = `${prefixMap[newDoc.type]}-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    const signingUrl = `${window.location.origin}/esign/${refNumber}`;

    try {
      // Send the document via edge function
      const { error: sendError } = await supabase.functions.invoke("send-esign-document", {
        body: {
          documentType: newDoc.type, customerName, customerEmail, customerPhone,
          refNumber, deliveryMethod: newDoc.deliveryMethod, signingUrl,
        },
      });

      if (sendError) {
        toast.error("Failed to send document", { description: sendError.message });
        setIsSending(false);
        return;
      }

      // Persist to esign_documents table
      const { data: user } = await supabase.auth.getUser();
      const { data: insertedDoc, error: insertError } = await supabase
        .from("esign_documents")
        .insert({
          lead_id: leadId,
          document_type: newDoc.type,
          ref_number: refNumber,
          status: "sent",
          delivery_method: newDoc.deliveryMethod,
          sent_by: user?.user?.id || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to persist esign document:", insertError);
      }

      const newRecord: DocumentRecord = {
        id: insertedDoc?.id || `doc-${Date.now()}`,
        type: newDoc.type,
        refNumber,
        status: "sent",
        sentAt: new Date(),
        deliveryMethod: newDoc.deliveryMethod,
      };
      setDocuments(prev => [newRecord, ...prev]);

      const methodLabel = newDoc.deliveryMethod === "email" ? "email" : "SMS";
      toast.success(`${DOCUMENT_LABELS[newDoc.type]} sent via ${methodLabel}`);
    } catch {
      toast.error("Failed to send document");
    } finally {
      setIsSending(false);
    }
  };

  const viewDocument = (doc: DocumentRecord) => {
    navigate(`/agent/esign/view?type=${doc.type}&name=${encodeURIComponent(customerName)}&email=${encodeURIComponent(customerEmail)}&ref=${encodeURIComponent(doc.refNumber)}&leadId=${leadId}`);
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
      {/* Customer info summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-foreground/5 border border-border flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {customerEmail && <span>{customerEmail}</span>}
                  {customerEmail && customerPhone && <span> • </span>}
                  {customerPhone && <span>{customerPhone}</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs"><Clock className="w-3 h-3" />{pendingDocs.length} pending</Badge>
              <Badge variant="secondary" className="gap-1 text-xs"><CheckCircle2 className="w-3 h-3" />{completedDocs.length} completed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send" className="gap-2"><Send className="w-4 h-4" />Send</TabsTrigger>
          <TabsTrigger value="track" className="gap-2"><Eye className="w-4 h-4" />Track ({pendingDocs.length})</TabsTrigger>
          <TabsTrigger value="completed" className="gap-2"><CheckCircle2 className="w-4 h-4" />Completed ({completedDocs.length})</TabsTrigger>
        </TabsList>

        {/* SEND TAB */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Send className="w-5 h-5" />Send Document for Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["estimate", "ccach", "bol"] as DocumentType[]).map(type => (
                    <Button key={type} variant={newDoc.type === type ? "default" : "outline"} size="sm" className="gap-1.5 text-xs" onClick={() => setNewDoc(prev => ({ ...prev, type }))}>
                      <FileText className="w-3.5 h-3.5" />
                      {DOCUMENT_LABELS[type]}
                    </Button>
                  ))}
                </div>
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
                {isSending ? "Sending..." : `Send ${DOCUMENT_LABELS[newDoc.type]}`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRACK TAB */}
        <TabsContent value="track" className="space-y-3">
          {isLoading ? (
            <Card><CardContent className="p-8 text-center"><Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" /></CardContent></Card>
          ) : pendingDocs.length === 0 ? (
            <Card><CardContent className="p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground">No pending documents</p>
              <p className="text-xs text-muted-foreground">Send a document from the Send tab</p>
            </CardContent></Card>
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
                          <span className="font-medium text-sm">{DOCUMENT_LABELS[doc.type]}</span>
                          <Badge variant="outline" className="text-[10px]">{doc.refNumber}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Sent {formatTime(doc.sentAt)} via {doc.deliveryMethod.toUpperCase()}</p>
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
            })
          )}
        </TabsContent>

        {/* COMPLETED TAB */}
        <TabsContent value="completed" className="space-y-3">
          {completedDocs.length === 0 ? (
            <Card><CardContent className="p-8 text-center space-y-3">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground">No completed documents yet</p>
            </CardContent></Card>
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
                          <span className="font-medium text-sm">{DOCUMENT_LABELS[doc.type]}</span>
                          <Badge variant="outline" className="text-[10px]">{doc.refNumber}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Completed {formatTime(doc.completedAt)}</p>
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
