import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LeadAttributionPanel from "@/components/crm/LeadAttributionPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, DollarSign,
  Weight, Tag, Clock, FileText, Truck, UserCheck, Camera, Sparkles, Package, X, Link2, Loader2,
  Ban, CheckCircle2, AlertCircle, Copy, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  origin_address: string | null;
  destination_address: string | null;
  move_date: string | null;
  estimated_weight: number | null;
  estimated_value: number | null;
  price_per_cuft: number | null;
  source: string;
  status: string;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assigned_agent_id: string | null;
}

interface Deal {
  id: string;
  stage: string;
  deal_value: number | null;
  expected_close_date: string | null;
  carrier_name: string | null;
  created_at: string;
}

interface ScanPhoto {
  id: string;
  photo_url: string;
  room_label: string | null;
  detected_boxes: Array<{ id?: number; name?: string; confidence?: number; x?: number; y?: number; width?: number; height?: number }>;
  item_count: number;
  created_at: string;
}

interface InventoryItem {
  id: string;
  item_name: string;
  room: string;
  quantity: number;
  cubic_feet: number;
  weight: number;
  source: string;
  source_photo_url: string | null;
  detection_box: { x: number; y: number; width: number; height: number } | null;
  confidence: number | null;
}

interface ResumeToken {
  id: string;
  token: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  verification_method: string | null;
  phone_last4: string | null;
  email_hint: string | null;
  failed_attempts: number | null;
  redeemed_ip: string | null;
  redeemed_user_agent: string | null;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  qualified: "bg-green-500/10 text-green-400 border-green-500/30",
  lost: "bg-red-500/10 text-red-400 border-red-500/30",
};

const sourceLabels: Record<string, string> = {
  website: "Website",
  referral: "Referral",
  ppc: "PPC",
  walk_in: "Walk-in",
  phone: "Phone",
  other: "Other",
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground break-all">{value}</p>
      </div>
    </div>
  );
}

export default function CrmLeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [scanPhotos, setScanPhotos] = useState<ScanPhoto[]>([]);
  // Customer-defined folder names from the AI room scan. Persisted on the lead
  // row by save-scan-room so agents see the same folder structure the customer
  // built, including empty folders that have no photos yet.
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [photoViewer, setPhotoViewer] = useState<ScanPhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [generatingResumeLink, setGeneratingResumeLink] = useState(false);
  const [resumeTokens, setResumeTokens] = useState<ResumeToken[]>([]);
  const [revokingTokenId, setRevokingTokenId] = useState<string | null>(null);
  const [extendingTokenId, setExtendingTokenId] = useState<string | null>(null);

  // Push out an active resume link's expiration so customers who need more time
  // can still finish their scan without us having to mint (and verify) a brand
  // new token. Default extension is 24 hours, capped at 168h total lifetime so
  // a stale link can't live forever.
  const handleExtendResumeLink = async (token: ResumeToken, addHours = 24) => {
    const MAX_TOTAL_HOURS = 168; // 7 days, matches create-scan-resume-link cap
    const createdMs = new Date(token.created_at).getTime();
    const currentExpiresMs = new Date(token.expires_at).getTime();
    const maxAllowedMs = createdMs + MAX_TOTAL_HOURS * 60 * 60 * 1000;
    const requestedMs = currentExpiresMs + addHours * 60 * 60 * 1000;
    const newExpiresMs = Math.min(requestedMs, maxAllowedMs);

    if (newExpiresMs <= currentExpiresMs) {
      toast.warning("This link is already at the 7-day maximum lifetime");
      return;
    }

    setExtendingTokenId(token.id);
    // Only extend links that are still active (not used/revoked). The
    // .is("used_at", null) guard prevents racing with a revoke.
    const { error } = await supabase
      .from("scan_resume_tokens")
      .update({ expires_at: new Date(newExpiresMs).toISOString() })
      .eq("id", token.id)
      .is("used_at", null);
    setExtendingTokenId(null);

    if (error) {
      toast.error("Could not extend link: " + error.message);
      return;
    }
    const cappedAtMax = newExpiresMs === maxAllowedMs && requestedMs > maxAllowedMs;
    toast.success(`Resume link extended by ${addHours}h`, {
      description: cappedAtMax
        ? `Capped at the 7-day maximum lifetime. New expiry: ${new Date(newExpiresMs).toLocaleString()}`
        : `New expiry: ${new Date(newExpiresMs).toLocaleString()}`,
    });
    fetchResumeTokens();
  };

  const fetchResumeTokens = async () => {
    if (!leadId) return;
    const { data } = await supabase
      .from("scan_resume_tokens")
      .select(
        "id, token, created_at, expires_at, used_at, verification_method, phone_last4, email_hint, failed_attempts, redeemed_ip, redeemed_user_agent",
      )
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    if (data) setResumeTokens(data as ResumeToken[]);
  };

  const handleSendResumeLink = async (deliveryMethod: "copy" | "email" = "copy") => {
    if (!leadId) return;
    // Block email delivery early when the lead has no email on file so the agent
    // gets immediate feedback instead of waiting for the function round-trip.
    if (deliveryMethod === "email" && !lead?.email) {
      toast.error("This lead has no email on file");
      return;
    }
    setGeneratingResumeLink(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-scan-resume-link", {
        body: {
          leadId,
          deliveryMethod,
          // Send the public site URL so the email link points at the customer-facing domain
          siteUrl: window.location.origin,
        },
      });
      if (error || !data?.token) {
        toast.error(data?.error || error?.message || "Could not create resume link");
        return;
      }
      const url = data.resumeUrl || `${window.location.origin}/scan-room?resume=${data.token}`;
      // Tell the agent which challenge the customer will see so they can
      // walk them through it on the phone if needed.
      const challengeCopy =
        data.verificationMethod === "phone_last4"
          ? "Customer will be asked for the last 4 digits of their phone."
          : data.verificationMethod === "email"
          ? "Customer will be asked to confirm the email on file."
          : "Customer will be asked to verify their identity.";

      if (deliveryMethod === "email") {
        if (data.emailDelivered) {
          toast.success(`Resume link emailed to ${data.recipientEmail}`, {
            description: `${challengeCopy} Single-use link expires in 24 hours.`,
          });
        } else {
          // Token was created but email failed — fall back to clipboard so the link isn't lost
          try {
            await navigator.clipboard.writeText(url);
          } catch { /* clipboard may be blocked; link is still in toast */ }
          toast.warning("Email could not be sent", {
            description: data.emailError
              ? `${data.emailError}. Link copied to clipboard instead.`
              : "Link copied to clipboard instead.",
          });
        }
      } else {
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Resume link copied to clipboard", {
            description: `${challengeCopy} Single-use link expires in 24 hours.`,
          });
        } catch {
          toast.success("Resume link created", { description: url });
        }
      }
      // Refresh the list so the new token appears immediately
      fetchResumeTokens();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create resume link");
    } finally {
      setGeneratingResumeLink(false);
    }
  };

  const handleCopyResumeLink = async (token: string) => {
    const url = `${window.location.origin}/scan-room?resume=${token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Resume link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleRevokeResumeLink = async (tokenId: string) => {
    setRevokingTokenId(tokenId);
    // Marking used_at flips the link to revoked so redemption is blocked
    const { error } = await supabase
      .from("scan_resume_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenId)
      .is("used_at", null);
    setRevokingTokenId(null);
    if (error) {
      toast.error("Could not revoke link: " + error.message);
      return;
    }
    toast.success("Resume link revoked");
    fetchResumeTokens();
  };


  const handleClaimLead = async () => {
    if (!lead || !leadId) return;
    setClaiming(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to claim a lead.");
      setClaiming(false);
      return;
    }
    const { error } = await supabase
      .from("leads")
      .update({ assigned_agent_id: user.id, status: "contacted" as any })
      .eq("id", leadId);
    if (error) {
      toast.error("Failed to claim lead: " + error.message);
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, email")
        .eq("id", user.id)
        .single();
      setAgentName(profile?.display_name || profile?.email || "You");
      setLead({ ...lead, assigned_agent_id: user.id, status: "contacted" });
      toast.success("Lead claimed successfully!");
    }
    setClaiming(false);
  };

  useEffect(() => {
    if (!leadId) return;

    async function fetchData() {
      const [leadRes, dealsRes, photosRes, inventoryRes, tokensRes] = await Promise.all([
        supabase.from("leads").select("*").eq("id", leadId).single(),
        supabase.from("deals").select("id, stage, deal_value, expected_close_date, carrier_name, created_at").eq("lead_id", leadId),
        supabase.from("lead_scan_photos").select("*").eq("lead_id", leadId).order("created_at", { ascending: true }),
        supabase.from("lead_inventory").select("*").eq("lead_id", leadId).order("created_at", { ascending: true }),
        supabase.from("scan_resume_tokens").select("id, token, created_at, expires_at, used_at").eq("lead_id", leadId).order("created_at", { ascending: false }),
      ]);
      if (tokensRes.data) setResumeTokens(tokensRes.data as ResumeToken[]);

      if (leadRes.data) {
        setLead(leadRes.data as Lead);
        if (leadRes.data.assigned_agent_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, email")
            .eq("id", leadRes.data.assigned_agent_id)
            .single();
          if (profile) setAgentName(profile.display_name || profile.email || null);
        }
      }
      if (dealsRes.data) setDeals(dealsRes.data as Deal[]);
      if (photosRes.data) setScanPhotos(photosRes.data as unknown as ScanPhoto[]);
      if (inventoryRes.data) setInventory(inventoryRes.data as unknown as InventoryItem[]);
      setLoading(false);
    }

    fetchData();
  }, [leadId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Lead not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const stageLabels: Record<string, string> = {
    new_lead: "New Lead", contacted: "Contacted", qualified: "Qualified",
    estimate_sent: "Estimate Sent", follow_up: "Follow Up", booked: "Booked",
    dispatched: "Dispatched", in_transit: "In Transit", delivered: "Delivered",
    closed_won: "Won", closed_lost: "Lost",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">
              {lead.first_name} {lead.last_name}
            </h1>
            <p className="text-xs text-muted-foreground">
              Lead created {new Date(lead.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge variant="outline" className={statusColors[lead.status] || ""}>
            {lead.status.toUpperCase()}
          </Badge>
          {!lead.assigned_agent_id && (
            <Button
              size="sm"
              onClick={handleClaimLead}
              disabled={claiming}
              className="gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              {claiming ? "Claiming..." : "Claim Lead"}
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Contact + Move Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={lead.email} />
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={lead.phone} />
                <InfoRow icon={<Tag className="w-4 h-4" />} label="Source" value={sourceLabels[lead.source] || lead.source} />
                <InfoRow icon={<User className="w-4 h-4" />} label="Assigned Agent" value={agentName} />
              </CardContent>
            </Card>

            {/* Move Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Move Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Origin" value={lead.origin_address} />
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Destination" value={lead.destination_address} />
                <InfoRow icon={<Calendar className="w-4 h-4" />} label="Move Date" value={lead.move_date ? new Date(lead.move_date).toLocaleDateString() : null} />
                <InfoRow icon={<Weight className="w-4 h-4" />} label="Est. Weight" value={lead.estimated_weight ? `${lead.estimated_weight.toLocaleString()} lbs` : null} />
                <InfoRow icon={<DollarSign className="w-4 h-4" />} label="Est. Value" value={lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : null} />
                <InfoRow icon={<DollarSign className="w-4 h-4" />} label="Price/CuFt" value={lead.price_per_cuft ? `$${lead.price_per_cuft}` : null} />
              </CardContent>
            </Card>

            {/* Notes */}
            {lead.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {lead.tags && lead.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Deals */}
            {deals.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Pipeline Deals ({deals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {deals.map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
                        <div>
                          <Badge variant="outline" className="text-xs mb-1">
                            {stageLabels[deal.stage] || deal.stage}
                          </Badge>
                          {deal.carrier_name && (
                            <p className="text-xs text-muted-foreground mt-1">Carrier: {deal.carrier_name}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {deal.deal_value != null && (
                            <p className="text-sm font-bold text-foreground">${deal.deal_value.toLocaleString()}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(deal.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Room Scan - Photos */}
            {scanPhotos.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Camera className="w-4 h-4 text-primary" />
                      AI Room Scan Photos ({scanPhotos.length})
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleSendResumeLink("email")}
                        disabled={generatingResumeLink || !lead?.email}
                        className="h-8 text-xs gap-1.5"
                        title={
                          lead?.email
                            ? `Email a one-time resume link to ${lead.email}`
                            : "Lead has no email on file"
                        }
                      >
                        {generatingResumeLink ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5" />
                        )}
                        Email resume link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendResumeLink("copy")}
                        disabled={generatingResumeLink}
                        className="h-8 text-xs gap-1.5"
                        title="Generate a one-time link and copy it to your clipboard"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        Copy link
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {scanPhotos.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => setPhotoViewer(photo)}
                        className="group relative rounded-lg overflow-hidden border border-border/50 hover:border-primary transition-colors"
                      >
                        <img src={photo.photo_url} alt={photo.room_label || "Scan"} className="w-full h-28 object-cover" />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors" />
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-foreground/70 text-background flex items-center justify-between">
                          <span className="text-[10px] font-semibold truncate">{photo.room_label || "Room"}</span>
                          <span className="text-[10px] flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" />{photo.item_count}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Resume link history — agents can audit and revoke any active link */}
                  {resumeTokens.length > 0 && (
                    <div className="pt-4 border-t border-border/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                          Resume Links ({resumeTokens.length})
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {resumeTokens.map((t) => {
                          const now = Date.now();
                          const expired = new Date(t.expires_at).getTime() < now;
                          const used = !!t.used_at;
                          // Status: revoked/used > expired > active
                          const status = used ? "revoked" : expired ? "expired" : "active";
                          const statusStyles = {
                            active: "text-green-400 bg-green-500/10 border-green-500/30",
                            expired: "text-muted-foreground bg-muted/40 border-border",
                            revoked: "text-red-400 bg-red-500/10 border-red-500/30",
                          }[status];
                          const StatusIcon = status === "active" ? CheckCircle2 : status === "expired" ? AlertCircle : Ban;

                          // Human-readable verification challenge so the agent
                          // knows what to coach the customer through.
                          const verifyLabel =
                            t.verification_method === "phone_last4"
                              ? `Phone ••${t.phone_last4 ?? "??"}`
                              : t.verification_method === "email"
                              ? `Email: ${t.email_hint ?? "on file"}`
                              : "Verification on file";

                          return (
                            <div
                              key={t.id}
                              className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-border/50 bg-muted/20 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`${statusStyles} gap-1 capitalize text-[10px] py-0`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {status}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] py-0 gap-1 text-muted-foreground border-border">
                                  {verifyLabel}
                                </Badge>
                                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-0.5">
                                  <span className="text-muted-foreground truncate">
                                    <span className="text-foreground/70">Created:</span> {new Date(t.created_at).toLocaleString()}
                                  </span>
                                  <span className="text-muted-foreground truncate">
                                    <span className="text-foreground/70">Expires:</span> {new Date(t.expires_at).toLocaleString()}
                                  </span>
                                  <span className="text-muted-foreground truncate">
                                    <span className="text-foreground/70">Used:</span> {t.used_at ? new Date(t.used_at).toLocaleString() : "—"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {status === "active" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleCopyResumeLink(t.token)}
                                        className="h-7 px-2 text-[11px] gap-1"
                                        title="Copy link"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleExtendResumeLink(t, 24)}
                                        disabled={extendingTokenId === t.id}
                                        className="h-7 px-2 text-[11px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
                                        title="Push this link's expiration out by 24 hours (capped at 7 days total)"
                                      >
                                        {extendingTokenId === t.id ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <>
                                            <RefreshCw className="w-3 h-3" />
                                            +24h
                                          </>
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRevokeResumeLink(t.id)}
                                        disabled={revokingTokenId === t.id}
                                        className="h-7 px-2 text-[11px] gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        title="Revoke link"
                                      >
                                        {revokingTokenId === t.id ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <>
                                            <Ban className="w-3 h-3" />
                                            Revoke
                                          </>
                                        )}
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Audit row — only shown once the link has been redeemed */}
                              {(t.redeemed_ip || t.redeemed_user_agent || (t.failed_attempts ?? 0) > 0) && (
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 pl-1 text-[10px] text-muted-foreground border-t border-border/30 pt-1.5">
                                  {t.redeemed_ip && (
                                    <span><span className="text-foreground/60">IP:</span> {t.redeemed_ip}</span>
                                  )}
                                  {t.redeemed_user_agent && (
                                    <span className="truncate max-w-[260px]" title={t.redeemed_user_agent}>
                                      <span className="text-foreground/60">Device:</span> {t.redeemed_user_agent}
                                    </span>
                                  )}
                                  {(t.failed_attempts ?? 0) > 0 && (
                                    <span className="text-amber-400">
                                      {t.failed_attempts} failed verification {t.failed_attempts === 1 ? "attempt" : "attempts"}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Inventory (AI + Manual) */}
            {inventory.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Inventory ({inventory.length})
                    <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                      {inventory.filter(i => i.source === 'ai-scan').length} AI / {inventory.filter(i => i.source !== 'ai-scan').length} Manual
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/50">
                          <th className="text-left py-2 font-semibold">Item</th>
                          <th className="text-left py-2 font-semibold">Room</th>
                          <th className="text-center py-2 font-semibold">Qty</th>
                          <th className="text-right py-2 font-semibold">Wt</th>
                          <th className="text-right py-2 font-semibold">CuFt</th>
                          <th className="text-right py-2 font-semibold">Conf</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((item) => {
                          const isAi = item.source === 'ai-scan';
                          return (
                            <tr key={item.id} className="border-b border-border/30 last:border-0">
                              <td className="py-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-medium text-foreground">{item.item_name}</span>
                                  {isAi ? (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 text-primary px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none">
                                      <Sparkles className="w-2.5 h-2.5" />AI
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none">
                                      Manual
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 text-muted-foreground">{item.room}</td>
                              <td className="py-2 text-center">{item.quantity}</td>
                              <td className="py-2 text-right">{item.weight}</td>
                              <td className="py-2 text-right">{item.cubic_feet}</td>
                              <td className="py-2 text-right">
                                {item.confidence != null ? (
                                  <span className={`text-[10px] font-bold ${item.confidence >= 85 ? 'text-primary' : item.confidence >= 65 ? 'text-amber-500' : 'text-destructive'}`}>
                                    {item.confidence}%
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - Attribution Panel */}
          <div className="space-y-6">
            <LeadAttributionPanel leadId={leadId!} />

            {/* Timestamps */}
            <Card>
              <CardContent className="pt-4 space-y-0">
                <InfoRow icon={<Clock className="w-4 h-4" />} label="Created" value={new Date(lead.created_at).toLocaleString()} />
                <InfoRow icon={<Clock className="w-4 h-4" />} label="Last Updated" value={new Date(lead.updated_at).toLocaleString()} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Photo viewer modal with detection overlays */}
      {photoViewer && (
        <div
          className="fixed inset-0 z-[100] bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPhotoViewer(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-background rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Scan Source</p>
                <h3 className="text-sm font-semibold text-foreground">{photoViewer.room_label || "Room"}</h3>
              </div>
              <button onClick={() => setPhotoViewer(null)} className="rounded-full p-1.5 hover:bg-muted" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative bg-muted">
              <img src={photoViewer.photo_url} alt={photoViewer.room_label || "Scan"} className="w-full max-h-[70vh] object-contain" />
              {photoViewer.detected_boxes?.map((box, i) => {
                if (box.x == null || box.y == null || box.width == null || box.height == null) return null;
                return (
                  <div
                    key={i}
                    className="absolute pointer-events-none border-2 border-primary rounded"
                    style={{
                      top: `${box.y * 100}%`,
                      left: `${box.x * 100}%`,
                      width: `${box.width * 100}%`,
                      height: `${box.height * 100}%`,
                    }}
                  >
                    {box.name && (
                      <span className="absolute -top-6 left-0 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap">
                        {box.name}{box.confidence != null ? ` ${box.confidence}%` : ''}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
              {photoViewer.item_count} items detected in this photo
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
