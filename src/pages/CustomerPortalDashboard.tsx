import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CustomerPortalShell from "@/components/layout/CustomerPortalShell";
import { Loader2, CheckCircle2, Circle, Upload, Send, FileText, Truck, Package, MapPin, PenTool, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEAL_STAGES = [
  { key: "new_lead", label: "Lead Received", icon: Circle },
  { key: "contacted", label: "Contacted", icon: Circle },
  { key: "qualified", label: "Qualified", icon: Circle },
  { key: "estimate_sent", label: "Estimate Sent", icon: FileText },
  { key: "follow_up", label: "Follow Up", icon: Circle },
  { key: "booked", label: "Booked", icon: CheckCircle2 },
  { key: "dispatched", label: "Dispatched", icon: Truck },
  { key: "in_transit", label: "In Transit", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: Package },
  { key: "closed_won", label: "Complete", icon: CheckCircle2 },
];

export default function CustomerPortalDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tracker");
  const [portalAccess, setPortalAccess] = useState<any>(null);
  const [deal, setDeal] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [esignDocs, setEsignDocs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/portal", { replace: true }); return; }
      const uid = session.user.id;
      setUserId(uid);

      // Fetch portal access
      const { data: access } = await supabase
        .from("customer_portal_access")
        .select("*")
        .eq("user_id", uid)
        .limit(1)
        .maybeSingle();

      if (!access) {
        setLoading(false);
        return;
      }
      setPortalAccess(access);

      // Fetch deal + lead
      let dealLeadId: string | null = null;
      if (access.deal_id) {
        const { data: d } = await supabase.from("deals").select("*").eq("id", access.deal_id).maybeSingle();
        setDeal(d);
        dealLeadId = d?.lead_id || null;
        if (d?.lead_id) {
          const { data: l } = await supabase.from("leads").select("*").eq("id", d.lead_id).maybeSingle();
          setLead(l);
        }
      } else if (access.lead_id) {
        const { data: l } = await supabase.from("leads").select("*").eq("id", access.lead_id).maybeSingle();
        setLead(l);
      }

      // Fetch messages
      const { data: msgs } = await supabase
        .from("customer_messages")
        .select("*")
        .eq("portal_access_id", access.id)
        .order("created_at", { ascending: true });
      setMessages(msgs ?? []);

      // List documents
      const { data: files } = await supabase.storage.from("customer-documents").list(uid);
      setDocuments(files ?? []);

      // Fetch e-sign documents linked to lead
      const linkedLeadId = access.lead_id || dealLeadId;
      if (linkedLeadId) {
        const { data: esigns } = await supabase
          .from("esign_documents")
          .select("*")
          .eq("lead_id", linkedLeadId)
          .order("created_at", { ascending: false });
        setEsignDocs(esigns ?? []);
      }

      setLoading(false);
    };
    init();
  }, [navigate]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !portalAccess || !userId) return;
    setSendingMsg(true);
    const { error } = await supabase.from("customer_messages").insert({
      portal_access_id: portalAccess.id,
      sender_type: "customer",
      sender_id: userId,
      content: newMessage.trim(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMessages((prev) => [...prev, { sender_type: "customer", content: newMessage.trim(), created_at: new Date().toISOString() }]);
      setNewMessage("");
    }
    setSendingMsg(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    const path = `${userId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("customer-documents").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Uploaded", description: file.name });
      const { data: files } = await supabase.storage.from("customer-documents").list(userId);
      setDocuments(files ?? []);
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const customerName = lead ? `${lead.first_name} ${lead.last_name}` : undefined;

  return (
    <CustomerPortalShell activeTab={activeTab} onTabChange={setActiveTab} customerName={customerName}>
      {!portalAccess ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">No active move found</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Your account isn't linked to a move yet. Please contact your moving agent for portal access.
          </p>
        </div>
      ) : (
        <>
          {/* MOVE TRACKER */}
          {activeTab === "tracker" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Move Status</h2>
                <p className="text-sm text-muted-foreground">Track your move progress in real time.</p>
              </div>
              {lead && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground mb-1">From</p>
                    <p className="text-sm font-medium text-foreground">{lead.origin_address || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground mb-1">To</p>
                    <p className="text-sm font-medium text-foreground">{lead.destination_address || "—"}</p>
                  </div>
                </div>
              )}
              <div className="relative">
                {DEAL_STAGES.map((stage, i) => {
                  const stageIndex = DEAL_STAGES.findIndex((s) => s.key === deal?.stage);
                  const isPast = i <= stageIndex;
                  const isCurrent = i === stageIndex;
                  const Icon = stage.icon;
                  return (
                    <div key={stage.key} className="flex items-start gap-3 mb-1 last:mb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          isCurrent ? "bg-primary text-primary-foreground" : isPast ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        {i < DEAL_STAGES.length - 1 && (
                          <div className={`w-0.5 h-6 ${isPast ? "bg-primary/30" : "bg-border"}`} />
                        )}
                      </div>
                      <div className="pt-1">
                        <p className={`text-sm font-medium ${isCurrent ? "text-primary" : isPast ? "text-foreground" : "text-muted-foreground"}`}>
                          {stage.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUOTE */}
          {activeTab === "quote" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Quote Summary</h2>
                <p className="text-sm text-muted-foreground">Your estimated move cost.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Deal Value</span>
                  <span className="text-lg font-bold text-foreground">${deal?.deal_value?.toLocaleString() ?? "—"}</span>
                </div>
                {lead?.move_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Move Date</span>
                    <span className="text-sm font-medium text-foreground">{new Date(lead.move_date).toLocaleDateString()}</span>
                  </div>
                )}
                {lead?.estimated_weight && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estimated Weight</span>
                    <span className="text-sm font-medium text-foreground">{lead.estimated_weight.toLocaleString()} lbs</span>
                  </div>
                )}
                {deal?.carrier_name && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Carrier</span>
                    <span className="text-sm font-medium text-foreground">{deal.carrier_name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Stage</span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">
                    {deal?.stage?.replace(/_/g, " ") ?? "—"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* E-SIGNS */}
          {activeTab === "esigns" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Signed Documents</h2>
                <p className="text-sm text-muted-foreground">View the status of documents sent for your signature.</p>
              </div>
              {esignDocs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <PenTool className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  No e-sign documents yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {esignDocs.map((doc) => {
                    const isCompleted = doc.status === "completed";
                    const docLabels: Record<string, string> = {
                      estimate: "Estimate Authorization",
                      ccach: "CC/ACH Authorization",
                      bol: "Bill of Lading",
                    };
                    return (
                      <div key={doc.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                              isCompleted ? "bg-primary/10" : "bg-amber-500/10"
                            }`}>
                              {isCompleted
                                ? <CheckCircle2 className="w-4 h-4 text-primary" />
                                : <Clock className="w-4 h-4 text-amber-600" />
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {docLabels[doc.document_type] || doc.document_type}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Ref: {doc.ref_number}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                              isCompleted
                                ? "bg-primary/10 text-primary"
                                : "bg-amber-500/10 text-amber-600"
                            }`}>
                              {isCompleted ? "Signed" : doc.status === "sent" ? "Awaiting Signature" : doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </span>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {isCompleted && doc.completed_at
                                ? `Signed ${new Date(doc.completed_at).toLocaleDateString()}`
                                : doc.sent_at
                                  ? `Sent ${new Date(doc.sent_at).toLocaleDateString()}`
                                  : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Documents</h2>
                  <p className="text-sm text-muted-foreground">Upload photos, inventory lists, or insurance docs.</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload
                </button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              </div>
              {documents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No documents uploaded yet.</div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.name} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate flex-1">{doc.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MESSAGES */}
          {activeTab === "messages" && (
            <div className="space-y-4 flex flex-col h-[calc(100vh-220px)]">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Messages</h2>
                <p className="text-sm text-muted-foreground">Chat with your moving agent.</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-sm">No messages yet. Start a conversation!</div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender_type === "customer" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                      msg.sender_type === "customer"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}>
                      {msg.content}
                      <p className="text-[10px] opacity-60 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={sendMessage}
                  disabled={sendingMsg || !newMessage.trim()}
                  className="h-11 w-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </CustomerPortalShell>
  );
}
