import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { 
   FileText, Send, Mail, MessageSquare, Monitor, CheckCircle2, 
   Clock, Eye, Loader2, Phone, Video, Users, AlertCircle,
   RefreshCw, ExternalLink, Sparkles, CreditCard
 } from "lucide-react";
 import { toast } from "sonner";
 import { cn } from "@/lib/utils";
 import { ClientSearchModal, type ClientData } from "./ClientSearchModal";
 import { CollectPaymentModal } from "./CollectPaymentModal";
 
 type DocumentType = "estimate" | "ccach" | "bol";
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
 
 // Demo documents
 const DEMO_DOCUMENTS: DocumentRecord[] = [
   {
     id: "doc-1",
     type: "estimate",
     refNumber: "EST-2026-4521",
     customerName: "Sarah Johnson",
     customerEmail: "sarah.johnson@email.com",
     customerPhone: "(555) 123-4567",
     status: "opened",
     sentAt: new Date(Date.now() - 1000 * 60 * 45),
     openedAt: new Date(Date.now() - 1000 * 60 * 5),
     deliveryMethod: "email",
   },
   {
     id: "doc-2",
     type: "ccach",
     refNumber: "CC-2026-8734",
     customerName: "Michael Chen",
     customerEmail: "m.chen@email.com",
     customerPhone: "(555) 987-6543",
     status: "sent",
     sentAt: new Date(Date.now() - 1000 * 60 * 120),
     deliveryMethod: "sms",
   },
   {
     id: "doc-3",
     type: "bol",
     refNumber: "BOL-2026-2156",
     customerName: "Emily Davis",
     customerEmail: "emily.d@email.com",
     customerPhone: "(555) 456-7890",
     status: "completed",
     sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
     openedAt: new Date(Date.now() - 1000 * 60 * 60 * 23),
     completedAt: new Date(Date.now() - 1000 * 60 * 60 * 22),
     deliveryMethod: "email",
   },
 ];
 
 export function ESignHub() {
   const [documents, setDocuments] = useState<DocumentRecord[]>(DEMO_DOCUMENTS);
   const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
   const [showClientSearch, setShowClientSearch] = useState(false);
   const [isSending, setIsSending] = useState(false);
   const [isScreensharing, setIsScreensharing] = useState(false);
   const [paymentOpen, setPaymentOpen] = useState(false);
   const [paymentPrefill, setPaymentPrefill] = useState<{ name: string; email: string; phone: string } | null>(null);
   
   // New document form
   const [newDoc, setNewDoc] = useState({
     type: "estimate" as DocumentType,
     customerName: "",
     customerEmail: "",
     customerPhone: "",
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
    if (!newDoc.customerName) {
      toast.error("Please enter customer name");
      return;
    }
    if (newDoc.deliveryMethod === "email" && !newDoc.customerEmail) {
      toast.error("Please enter customer email");
      return;
    }
    if (newDoc.deliveryMethod === "sms" && !newDoc.customerPhone) {
      toast.error("Please enter customer phone");
      return;
    }

    setIsSending(true);

    const refPrefix = newDoc.type === "estimate" ? "EST" : newDoc.type === "ccach" ? "CC" : "BOL";
    const refNumber = `${refPrefix}-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    
    // Generate a signing URL (in production, this would be a real e-sign provider URL)
    const signingUrl = `${window.location.origin}/esign/${refNumber}`;

    try {
      // Call edge function to send email/SMS
      const { data, error } = await supabase.functions.invoke('send-esign-document', {
        body: {
          documentType: newDoc.type,
          customerName: newDoc.customerName,
          customerEmail: newDoc.customerEmail,
          customerPhone: newDoc.customerPhone,
          refNumber,
          deliveryMethod: newDoc.deliveryMethod,
          signingUrl,
        },
      });

      if (error) {
        console.error("Error sending document:", error);
        toast.error("Failed to send document", {
          description: error.message || "Please try again",
        });
        setIsSending(false);
        return;
      }

      const newRecord: DocumentRecord = {
        id: `doc-${Date.now()}`,
        type: newDoc.type,
        refNumber,
        customerName: newDoc.customerName,
        customerEmail: newDoc.customerEmail,
        customerPhone: newDoc.customerPhone,
        status: "sent",
        sentAt: new Date(),
        deliveryMethod: newDoc.deliveryMethod,
      };

      setDocuments(prev => [newRecord, ...prev]);
      
      const methodLabel = newDoc.deliveryMethod === "email" ? "email" : "SMS";
      toast.success(`${DOCUMENT_LABELS[newDoc.type]} sent via ${methodLabel}`, {
        description: data?.method === "sms" 
          ? "SMS delivery simulated for demo" 
          : `Sent to ${newDoc.customerEmail}`,
      });
      
      // Reset form
      setNewDoc({
        type: "estimate",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        deliveryMethod: "email",
      });
    } catch (err) {
      console.error("Error sending document:", err);
      toast.error("Failed to send document");
    } finally {
      setIsSending(false);
    }
  };
 
   const handleResend = async (doc: DocumentRecord) => {
     toast.success(`Resent ${DOCUMENT_LABELS[doc.type]} to ${doc.customerName}`);
   };
 
   const startScreenshare = async (doc: DocumentRecord) => {
     setIsScreensharing(true);
     setSelectedDoc(doc);
     toast.success("Screen share session started", {
       description: `Assisting ${doc.customerName} with ${DOCUMENT_LABELS[doc.type]}`,
     });
   };
 
   const endScreenshare = () => {
     setIsScreensharing(false);
     setSelectedDoc(null);
     toast.info("Screen share session ended");
   };
 
   const simulateProgress = (docId: string) => {
     setDocuments(prev => prev.map(doc => {
       if (doc.id !== docId) return doc;
       
       const progressMap: Record<SigningStatus, SigningStatus> = {
         not_sent: "sent",
         sent: "delivered",
         delivered: "opened",
         opened: "signing",
         signing: "completed",
         completed: "completed",
       };
       
       const newStatus = progressMap[doc.status];
       return {
         ...doc,
         status: newStatus,
         ...(newStatus === "opened" && { openedAt: new Date() }),
         ...(newStatus === "completed" && { completedAt: new Date() }),
       };
     }));
   };
 
   const formatTime = (date?: Date) => {
     if (!date) return "—";
     const now = new Date();
     const diff = now.getTime() - date.getTime();
     const mins = Math.floor(diff / 60000);
     if (mins < 60) return `${mins}m ago`;
     const hours = Math.floor(mins / 60);
     if (hours < 24) return `${hours}h ago`;
     return date.toLocaleDateString();
   };
 
   const pendingDocs = documents.filter(d => d.status !== "completed");
   const completedDocs = documents.filter(d => d.status === "completed");
 
   return (
     <div className="space-y-6">
       <ClientSearchModal
         open={showClientSearch}
         onClose={() => setShowClientSearch(false)}
         onSelect={handleClientSelect}
       />
 
       <div className="flex items-center justify-between">
         <div>
           <h2 className="text-2xl font-bold flex items-center gap-2">
             <FileText className="w-6 h-6" />
             E-Sign Hub
           </h2>
           <p className="text-sm text-muted-foreground mt-1">
             Send, track, and assist customers with document signing
           </p>
         </div>
         <div className="flex items-center gap-2">
           <Badge variant="outline" className="gap-1">
             <Clock className="w-3 h-3" />
             {pendingDocs.length} pending
           </Badge>
           <Badge variant="secondary" className="gap-1">
             <CheckCircle2 className="w-3 h-3" />
             {completedDocs.length} completed
           </Badge>
         </div>
       </div>
 
       {/* Screenshare Banner */}
       {isScreensharing && selectedDoc && (
         <Card className="border-primary bg-primary/5">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                   <Monitor className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                   <p className="font-medium text-sm">Screen Share Active</p>
                   <p className="text-xs text-muted-foreground">
                     Assisting {selectedDoc.customerName} with {DOCUMENT_LABELS[selectedDoc.type]}
                   </p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                           <Badge className="bg-destructive text-destructive-foreground animate-pulse">LIVE</Badge>
                 <Button size="sm" variant="destructive" onClick={endScreenshare}>
                   End Session
                 </Button>
               </div>
             </div>
           </CardContent>
         </Card>
       )}
 
       <Tabs defaultValue="send" className="space-y-4">
         <TabsList className="grid w-full grid-cols-3">
           <TabsTrigger value="send" className="gap-2">
             <Send className="w-4 h-4" />
             Send Document
           </TabsTrigger>
           <TabsTrigger value="track" className="gap-2">
             <Eye className="w-4 h-4" />
             Track Status
           </TabsTrigger>
           <TabsTrigger value="completed" className="gap-2">
             <CheckCircle2 className="w-4 h-4" />
             Completed
           </TabsTrigger>
         </TabsList>
 
         {/* SEND DOCUMENT TAB */}
         <TabsContent value="send" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                 <Send className="w-5 h-5" />
                 Send Document for Signature
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               {/* Document Type Selection */}
               <div className="space-y-2">
                 <Label>Document Type</Label>
                 <div className="grid grid-cols-3 gap-2">
                   {(["estimate", "ccach", "bol"] as DocumentType[]).map(type => (
                     <Button
                       key={type}
                       variant={newDoc.type === type ? "default" : "outline"}
                       className="h-auto py-3 flex-col gap-1"
                       onClick={() => setNewDoc(prev => ({ ...prev, type }))}
                     >
                       <FileText className="w-4 h-4" />
                       <span className="text-xs">{DOCUMENT_LABELS[type]}</span>
                     </Button>
                   ))}
                 </div>
               </div>
 
               {/* Customer Info */}
               <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <Label>Customer Name</Label>
                     <Button
                       variant="ghost"
                       size="sm"
                       className="h-6 text-xs gap-1"
                       onClick={() => setShowClientSearch(true)}
                     >
                       <Users className="w-3 h-3" />
                       Import
                     </Button>
                   </div>
                   <Input
                     value={newDoc.customerName}
                     onChange={e => setNewDoc(prev => ({ ...prev, customerName: e.target.value }))}
                     placeholder="John Smith"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Email Address</Label>
                   <Input
                     type="email"
                     value={newDoc.customerEmail}
                     onChange={e => setNewDoc(prev => ({ ...prev, customerEmail: e.target.value }))}
                     placeholder="customer@email.com"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Phone Number</Label>
                   <Input
                     value={newDoc.customerPhone}
                     onChange={e => setNewDoc(prev => ({ ...prev, customerPhone: e.target.value }))}
                     placeholder="(555) 123-4567"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Delivery Method</Label>
                   <div className="flex gap-2">
                     <Button
                       variant={newDoc.deliveryMethod === "email" ? "default" : "outline"}
                       className="flex-1 gap-2"
                       onClick={() => setNewDoc(prev => ({ ...prev, deliveryMethod: "email" }))}
                     >
                       <Mail className="w-4 h-4" />
                       Email
                     </Button>
                     <Button
                       variant={newDoc.deliveryMethod === "sms" ? "default" : "outline"}
                       className="flex-1 gap-2"
                       onClick={() => setNewDoc(prev => ({ ...prev, deliveryMethod: "sms" }))}
                     >
                       <MessageSquare className="w-4 h-4" />
                       SMS
                     </Button>
                   </div>
                 </div>
               </div>
 
               {/* Send Button */}
               <Button
                 className="w-full gap-2"
                 size="lg"
                 onClick={handleSendDocument}
                 disabled={isSending}
               >
                 {isSending ? (
                   <Loader2 className="w-4 h-4 animate-spin" />
                 ) : (
                   <Send className="w-4 h-4" />
                 )}
                 {isSending ? "Sending..." : `Send ${DOCUMENT_LABELS[newDoc.type]}`}
               </Button>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* TRACK STATUS TAB */}
         <TabsContent value="track" className="space-y-4">
           {pendingDocs.length === 0 ? (
             <Card>
               <CardContent className="p-8 text-center">
                 <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                 <p className="text-muted-foreground">No pending documents</p>
               </CardContent>
             </Card>
           ) : (
             <div className="space-y-3">
               {pendingDocs.map(doc => {
                 const statusConfig = STATUS_CONFIG[doc.status];
                 const StatusIcon = statusConfig.icon;
                 
                 return (
                   <Card key={doc.id} className="overflow-hidden">
                     <CardContent className="p-4">
                       <div className="flex items-start justify-between gap-4">
                         {/* Document Info */}
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                             <span className="font-medium text-sm">{doc.customerName}</span>
                             <Badge variant="outline" className="text-[10px]">
                               {doc.refNumber}
                             </Badge>
                           </div>
                           <p className="text-xs text-muted-foreground mb-2">
                             {DOCUMENT_LABELS[doc.type]} • Sent {formatTime(doc.sentAt)} via {doc.deliveryMethod.toUpperCase()}
                           </p>
                           
                           {/* Status Badge */}
                           <Badge className={cn("gap-1", statusConfig.color)}>
                             <StatusIcon className={cn("w-3 h-3", doc.status === "signing" && "animate-spin")} />
                             {statusConfig.label}
                           </Badge>
                         </div>
 
                         {/* Actions */}
                         <div className="flex flex-col gap-2">
                           <Button
                             size="sm"
                             variant="outline"
                             className="gap-1.5 text-xs h-8"
                             onClick={() => handleResend(doc)}
                           >
                             <RefreshCw className="w-3 h-3" />
                             Resend
                           </Button>
                           
                           {(doc.status === "opened" || doc.status === "signing") && (
                             <Button
                               size="sm"
                               variant="outline"
                               className="gap-1.5 text-xs h-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                               onClick={() => startScreenshare(doc)}
                               disabled={isScreensharing}
                             >
                               <Monitor className="w-3 h-3" />
                               Assist
                             </Button>
                           )}
 
                           {/* Demo: Simulate Progress */}
                           <Button
                             size="sm"
                             variant="ghost"
                             className="gap-1.5 text-xs h-8"
                             onClick={() => simulateProgress(doc.id)}
                           >
                             <Sparkles className="w-3 h-3" />
                             Simulate
                           </Button>
                         </div>
                       </div>
 
                       {/* Progress Timeline */}
                       <div className="mt-4 pt-3 border-t border-border">
                         <div className="flex items-center justify-between gap-1">
                           {["sent", "delivered", "opened", "signing", "completed"].map((step, i) => {
                             const stepStatus = ["sent", "delivered", "opened", "signing", "completed"].indexOf(doc.status);
                             const thisStep = i;
                             const isActive = thisStep <= stepStatus;
                             const isCurrent = thisStep === stepStatus;
                             
                             return (
                               <div key={step} className="flex-1 flex items-center">
                                 <div className={cn(
                                   "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium",
                                   isActive 
                                     ? isCurrent 
                                       ? "bg-primary text-primary-foreground" 
                                       : "bg-foreground text-background"
                                     : "bg-muted text-muted-foreground"
                                 )}>
                                   {isActive && !isCurrent ? "✓" : i + 1}
                                 </div>
                                 {i < 4 && (
                                   <div className={cn(
                                     "flex-1 h-0.5 mx-1",
                                     thisStep < stepStatus ? "bg-foreground" : "bg-muted"
                                   )} />
                                 )}
                               </div>
                             );
                           })}
                         </div>
                         <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                           <span>Sent</span>
                           <span>Delivered</span>
                           <span>Opened</span>
                           <span>Signing</span>
                           <span>Done</span>
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
             <Card>
               <CardContent className="p-8 text-center">
                 <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                 <p className="text-muted-foreground">No completed documents yet</p>
               </CardContent>
             </Card>
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
                             <Badge variant="outline" className="text-[10px]">
                               {doc.refNumber}
                             </Badge>
                           </div>
                           <p className="text-xs text-muted-foreground">
                             {DOCUMENT_LABELS[doc.type]} • Completed {formatTime(doc.completedAt)}
                           </p>
                         </div>
                       </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="gap-1.5 text-xs h-8"
                            onClick={() => {
                              setPaymentPrefill({
                                name: doc.customerName,
                                email: doc.customerEmail,
                                phone: doc.customerPhone,
                              });
                              setPaymentOpen(true);
                            }}
                          >
                            <CreditCard className="w-3 h-3" />
                            Collect Payment
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                            <ExternalLink className="w-3 h-3" />
                            Download
                          </Button>
                        </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
           )}
         </TabsContent>
       </Tabs>

       <CollectPaymentModal
         open={paymentOpen}
         onOpenChange={setPaymentOpen}
         prefillCustomer={paymentPrefill}
       />
     </div>
   );
 }