import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AgentShell from "@/components/layout/AgentShell";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Package, DollarSign,
  FileText, CreditCard, MessageSquare, PhoneCall, Clock, User,
  TrendingUp, CheckCircle2, Circle, AlertCircle, Send
} from "lucide-react";
import { DialerProvider } from "@/components/dialer/dialerProvider";
import { AgentESignTab } from "@/components/agent/AgentESignTab";

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  origin_address: string | null;
  destination_address: string | null;
  move_date: string | null;
  status: string;
  source: string;
  estimated_value: number | null;
  estimated_weight: number | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: string;
  type: string;
  subject: string | null;
  description: string | null;
  is_done: boolean;
  due_date: string | null;
  created_at: string;
}

interface Deal {
  id: string;
  stage: string;
  deal_value: number | null;
  expected_close_date: string | null;
  carrier_name: string | null;
  created_at: string;
  updated_at: string;
}

interface DealHistoryItem {
  id: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
}

export default function AgentCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealHistory, setDealHistory] = useState<DealHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerStatus, setCustomerStatus] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const [leadRes, actRes, dealRes] = await Promise.all([
        supabase.from("leads").select("*").eq("id", id).single(),
        supabase.from("activities").select("*").eq("lead_id", id).order("created_at", { ascending: false }).limit(20),
        supabase.from("deals").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
      ]);
      setLead(leadRes.data as Lead | null);
      setActivities((actRes.data as Activity[]) || []);
      const dealData = (dealRes.data as Deal[]) || [];
      setDeals(dealData);

      if (dealData.length > 0) {
        const { data: hist } = await supabase
          .from("deal_history")
          .select("*")
          .in("deal_id", dealData.map(d => d.id))
          .order("changed_at", { ascending: false })
          .limit(30);
        setDealHistory((hist as DealHistoryItem[]) || []);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const statusColor = (s: string) => {
    if (s === "qualified") return "bg-primary/10 text-primary";
    if (s === "contacted") return "bg-blue-500/10 text-blue-600";
    if (s === "lost") return "bg-destructive/10 text-destructive";
    return "bg-muted text-muted-foreground";
  };

  const stageLabel = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const activityIcon = (type: string) => {
    switch (type) {
      case "call": return <PhoneCall className="w-3.5 h-3.5" />;
      case "email": return <Mail className="w-3.5 h-3.5" />;
      case "meeting": return <Calendar className="w-3.5 h-3.5" />;
      case "note": return <FileText className="w-3.5 h-3.5" />;
      case "follow_up": return <Clock className="w-3.5 h-3.5" />;
      case "stage_change": return <TrendingUp className="w-3.5 h-3.5" />;
      default: return <Circle className="w-3.5 h-3.5" />;
    }
  };

  if (loading) {
    return (
      <AgentShell breadcrumb=" / Customer Detail">
        {() => (
          <div className="p-6 flex items-center justify-center min-h-[60vh]">
            <p className="text-sm text-muted-foreground">Loading customer...</p>
          </div>
        )}
      </AgentShell>
    );
  }

  if (!lead) {
    return (
      <AgentShell breadcrumb=" / Customer Detail">
        {() => (
          <div className="p-6 text-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">Customer not found</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/agent/customers")}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Customers
            </Button>
          </div>
        )}
      </AgentShell>
    );
  }

  const fullName = `${lead.first_name} ${lead.last_name}`;

  return (
    <AgentShell breadcrumb=" / Customer Detail">
      {() => (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate("/agent/customers")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-12 h-12 rounded-full bg-foreground/5 border border-border flex items-center justify-center">
                <span className="text-base font-semibold text-foreground">
                  {lead.first_name[0]}{lead.last_name[0]}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{fullName}</h1>
                  <Badge className={`text-[10px] capitalize ${statusColor(lead.status)}`}>{lead.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Added {new Date(lead.created_at).toLocaleDateString()} • Source: {lead.source}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Status Dropdown */}
              <Select value={customerStatus} onValueChange={setCustomerStatus}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {/* Empty for now — user will populate later */}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="gap-1.5 text-xs"
                onClick={() => navigate(`/agent/payment?name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(lead.email || "")}&phone=${encodeURIComponent(lead.phone || "")}&leadId=${lead.id}`)}>
                <CreditCard className="w-3 h-3" /> Payment
              </Button>
              {lead.phone && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs"
                  onClick={() => DialerProvider.startCall(lead.phone!, undefined, fullName)}>
                  <PhoneCall className="w-3 h-3" /> Call
                </Button>
              )}
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview" className="gap-1.5 text-xs">
                <User className="w-3.5 h-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="esign" className="gap-1.5 text-xs">
                <FileText className="w-3.5 h-3.5" /> E-Sign
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column: Contact & Move Info */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Contact Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4" /> Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {lead.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <a href={`mailto:${lead.email}`} className="hover:text-foreground transition-colors truncate">{lead.email}</a>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                      {!lead.email && !lead.phone && (
                        <p className="text-xs text-muted-foreground/60">No contact info available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Move Details */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Package className="w-4 h-4" /> Move Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {lead.origin_address && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">Origin</p>
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                            <span>{lead.origin_address}</span>
                          </div>
                        </div>
                      )}
                      {lead.destination_address && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">Destination</p>
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-destructive" />
                            <span>{lead.destination_address}</span>
                          </div>
                        </div>
                      )}
                      {lead.move_date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>Move Date: <span className="text-foreground font-medium">{new Date(lead.move_date).toLocaleDateString()}</span></span>
                        </div>
                      )}
                      {lead.estimated_value != null && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="w-3.5 h-3.5 shrink-0" />
                          <span>Est. Value: <span className="text-foreground font-medium">${lead.estimated_value.toLocaleString()}</span></span>
                        </div>
                      )}
                      {lead.estimated_weight != null && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Package className="w-3.5 h-3.5 shrink-0" />
                          <span>Est. Weight: <span className="text-foreground font-medium">{lead.estimated_weight.toLocaleString()} lbs</span></span>
                        </div>
                      )}
                      {!lead.origin_address && !lead.destination_address && !lead.move_date && (
                        <p className="text-xs text-muted-foreground/60">No move details available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Notes & Tags */}
                  {(lead.notes || (lead.tags && lead.tags.length > 0)) && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Notes & Tags</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {lead.tags && lead.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {lead.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">{tag}</Badge>
                            ))}
                          </div>
                        )}
                        {lead.notes && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right column: Activity & Deals */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Deals */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Deals ({deals.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {deals.length === 0 ? (
                        <p className="text-xs text-muted-foreground/60 text-center py-4">No deals linked to this customer yet</p>
                      ) : (
                        <div className="space-y-3">
                          {deals.map(deal => (
                            <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px] capitalize">{stageLabel(deal.stage)}</Badge>
                                  {deal.carrier_name && <span className="text-xs text-muted-foreground">• {deal.carrier_name}</span>}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Created {new Date(deal.created_at).toLocaleDateString()}
                                  {deal.expected_close_date && ` • Close by ${new Date(deal.expected_close_date).toLocaleDateString()}`}
                                </p>
                              </div>
                              {deal.deal_value != null && (
                                <span className="text-sm font-semibold">${deal.deal_value.toLocaleString()}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Deal History */}
                  {dealHistory.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Deal History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative pl-4 border-l border-border space-y-4">
                          {dealHistory.map(h => (
                            <div key={h.id} className="relative">
                              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-foreground/20 border-2 border-background" />
                              <div>
                                <p className="text-xs font-medium">
                                  {stageLabel(h.field_changed)} changed
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {h.old_value ? stageLabel(h.old_value) : "—"} → {h.new_value ? stageLabel(h.new_value) : "—"}
                                </p>
                                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                  {new Date(h.changed_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Activity Timeline */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Activity Timeline ({activities.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activities.length === 0 ? (
                        <p className="text-xs text-muted-foreground/60 text-center py-4">No activities recorded yet</p>
                      ) : (
                        <div className="relative pl-4 border-l border-border space-y-4">
                          {activities.map(a => (
                            <div key={a.id} className="relative">
                              <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-background ${a.is_done ? "bg-primary" : "bg-muted-foreground/30"}`} />
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground">{activityIcon(a.type)}</span>
                                    <p className="text-xs font-medium capitalize">{a.type.replace(/_/g, " ")}</p>
                                    {a.is_done && <CheckCircle2 className="w-3 h-3 text-primary" />}
                                  </div>
                                  {a.subject && <p className="text-xs text-foreground mt-0.5">{a.subject}</p>}
                                  {a.description && <p className="text-[11px] text-muted-foreground mt-0.5">{a.description}</p>}
                                </div>
                                <span className="text-[10px] text-muted-foreground/60 shrink-0 ml-3">
                                  {new Date(a.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* E-SIGN TAB */}
            <TabsContent value="esign">
              <AgentESignTab
                leadId={lead.id}
                customerName={fullName}
                customerEmail={lead.email || ""}
                customerPhone={lead.phone || ""}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AgentShell>
  );
}
