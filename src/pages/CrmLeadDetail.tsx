import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LeadAttributionPanel from "@/components/crm/LeadAttributionPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, DollarSign,
  Weight, Tag, Clock, FileText, Truck, UserCheck
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
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

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
      const [leadRes, dealsRes] = await Promise.all([
        supabase.from("leads").select("*").eq("id", leadId).single(),
        supabase.from("deals").select("id, stage, deal_value, expected_close_date, carrier_name, created_at").eq("lead_id", leadId),
      ]);

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
    </div>
  );
}
