import { useEffect, useState, useCallback } from "react";
import LeadVendorShell from "@/components/layout/LeadVendorShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus, Search, Building2, Pencil, Trash2, ChevronDown, ChevronRight,
  UserPlus, Users, DollarSign, TrendingUp, TrendingDown, Shield,
} from "lucide-react";

/* ─── Types ─── */
interface LeadVendor {
  id: string; name: string; contact_name: string | null; contact_email: string | null;
  contact_phone: string | null; website: string | null; vendor_type: string; status: string;
  cost_per_lead: number | null; monthly_budget: number | null;
  contract_start: string | null; contract_end: string | null; notes: string | null; created_at: string;
}
interface AgentProfile { id: string; display_name: string | null; email: string | null; }
interface Assignment { id: string; vendor_id: string; agent_id: string; is_active: boolean; max_cpa: number | null; }
interface AgentCpa { agent_id: string; vendor_id: string; leads: number; spend: number; revenue: number; cpa: number; }

const EMPTY_FORM = {
  name: "", contact_name: "", contact_email: "", contact_phone: "", website: "",
  vendor_type: "lead_provider", status: "active", cost_per_lead: "", monthly_budget: "",
  contract_start: "", contract_end: "", notes: "",
};

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  paused: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  inactive: "bg-muted text-muted-foreground",
};

const TYPE_LABEL: Record<string, string> = {
  lead_provider: "Provider", aggregator: "Aggregator", referral_partner: "Referral", ad_network: "Ad Network",
};

export default function LeadsVendors() {
  const [vendors, setVendors] = useState<LeadVendor[]>([]);
  const [leadCounts, setLeadCounts] = useState<Record<string, number>>({});
  const [vendorRevenue, setVendorRevenue] = useState<Record<string, number>>({});
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [agentCpas, setAgentCpas] = useState<AgentCpa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignVendorId, setAssignVendorId] = useState<string | null>(null);
  const [assignAgentId, setAssignAgentId] = useState("");
  const [assignMaxCpa, setAssignMaxCpa] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [vendorsRes, leadsRes, dealsRes, assignRes, profilesRes, rolesRes] = await Promise.all([
      supabase.from("lead_vendors").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("id, vendor_id, assigned_agent_id"),
      supabase.from("deals").select("lead_id, actual_revenue, deal_value"),
      supabase.from("vendor_agent_assignments").select("*"),
      supabase.from("profiles").select("id, display_name, email"),
      supabase.from("user_roles").select("user_id, role").eq("role", "agent"),
    ]);

    setVendors((vendorsRes.data as LeadVendor[]) || []);
    setAssignments((assignRes.data as Assignment[]) || []);

    // Only show users with agent role
    const agentUserIds = new Set((rolesRes.data || []).map((r: any) => r.user_id));
    setAgents(((profilesRes.data as AgentProfile[]) || []).filter(p => agentUserIds.has(p.id)));

    const leads = (leadsRes.data as any[]) || [];
    const counts: Record<string, number> = {};
    const leadVendorMap: Record<string, string> = {};
    const leadAgentMap: Record<string, string> = {};
    leads.forEach((l) => {
      if (l.vendor_id) {
        counts[l.vendor_id] = (counts[l.vendor_id] || 0) + 1;
        leadVendorMap[l.id] = l.vendor_id;
        if (l.assigned_agent_id) leadAgentMap[l.id] = l.assigned_agent_id;
      }
    });
    setLeadCounts(counts);

    const deals = (dealsRes.data as any[]) || [];
    const rev: Record<string, number> = {};
    // Per-agent per-vendor CPA tracking
    const agentVendorLeads: Record<string, Record<string, number>> = {};
    const agentVendorRevenue: Record<string, Record<string, number>> = {};

    // Count leads per agent per vendor
    leads.forEach((l) => {
      if (l.vendor_id && l.assigned_agent_id) {
        const key = l.assigned_agent_id;
        if (!agentVendorLeads[key]) agentVendorLeads[key] = {};
        agentVendorLeads[key][l.vendor_id] = (agentVendorLeads[key][l.vendor_id] || 0) + 1;
      }
    });

    deals.forEach((d) => {
      const vid = leadVendorMap[d.lead_id];
      const aid = leadAgentMap[d.lead_id];
      const amount = d.actual_revenue || d.deal_value || 0;
      if (vid) rev[vid] = (rev[vid] || 0) + amount;
      if (vid && aid) {
        if (!agentVendorRevenue[aid]) agentVendorRevenue[aid] = {};
        agentVendorRevenue[aid][vid] = (agentVendorRevenue[aid][vid] || 0) + amount;
      }
    });
    setVendorRevenue(rev);

    // Build CPA list
    const cpas: AgentCpa[] = [];
    const allVendors = (vendorsRes.data as LeadVendor[]) || [];
    const vendorCplMap: Record<string, number> = {};
    allVendors.forEach(v => { vendorCplMap[v.id] = v.cost_per_lead || 0; });

    Object.entries(agentVendorLeads).forEach(([agentId, vendorLeadMap]) => {
      Object.entries(vendorLeadMap).forEach(([vendorId, leadCount]) => {
        const spend = leadCount * (vendorCplMap[vendorId] || 0);
        const revenue = agentVendorRevenue[agentId]?.[vendorId] || 0;
        const cpa = leadCount > 0 ? spend / leadCount : 0;
        cpas.push({ agent_id: agentId, vendor_id: vendorId, leads: leadCount, spend, revenue, cpa });
      });
    });
    setAgentCpas(cpas);

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    return !q || v.name.toLowerCase().includes(q) || v.contact_name?.toLowerCase().includes(q);
  });

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (v: LeadVendor) => {
    setEditingId(v.id);
    setForm({
      name: v.name, contact_name: v.contact_name || "", contact_email: v.contact_email || "",
      contact_phone: v.contact_phone || "", website: v.website || "", vendor_type: v.vendor_type,
      status: v.status, cost_per_lead: v.cost_per_lead?.toString() || "",
      monthly_budget: v.monthly_budget?.toString() || "", contract_start: v.contract_start || "",
      contract_end: v.contract_end || "", notes: v.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Vendor name is required"); return; }
    const payload = {
      name: form.name, contact_name: form.contact_name || null, contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null, website: form.website || null, vendor_type: form.vendor_type,
      status: form.status, cost_per_lead: form.cost_per_lead ? Number(form.cost_per_lead) : 0,
      monthly_budget: form.monthly_budget ? Number(form.monthly_budget) : 0,
      contract_start: form.contract_start || null, contract_end: form.contract_end || null, notes: form.notes || null,
    };
    if (editingId) {
      const { error } = await supabase.from("lead_vendors").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("Vendor updated");
    } else {
      const { error } = await supabase.from("lead_vendors").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Vendor added");
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("lead_vendors").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Vendor removed");
    fetchData();
  };

  /* ─── Agent routing ─── */
  const openAssignDialog = (vendorId: string) => {
    setAssignVendorId(vendorId);
    setAssignAgentId("");
    setAssignMaxCpa("");
    setAssignDialogOpen(true);
  };

  const handleAssignAgent = async () => {
    if (!assignAgentId || !assignVendorId) return;
    const { error } = await supabase.from("vendor_agent_assignments").insert({
      vendor_id: assignVendorId,
      agent_id: assignAgentId,
      is_active: true,
      max_cpa: assignMaxCpa ? Number(assignMaxCpa) : null,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Agent assigned");
    setAssignDialogOpen(false);
    fetchData();
  };

  const toggleAssignment = async (assignmentId: string, currentActive: boolean) => {
    const { error } = await supabase.from("vendor_agent_assignments")
      .update({ is_active: !currentActive } as any).eq("id", assignmentId);
    if (error) { toast.error(error.message); return; }
    toast.success(!currentActive ? "Agent activated" : "Agent cut off");
    fetchData();
  };

  const removeAssignment = async (assignmentId: string) => {
    const { error } = await supabase.from("vendor_agent_assignments").delete().eq("id", assignmentId);
    if (error) { toast.error(error.message); return; }
    toast.success("Assignment removed");
    fetchData();
  };

  const getAgentName = (id: string) => {
    const a = agents.find(a => a.id === id);
    return a?.display_name || a?.email || id.slice(0, 8);
  };

  const getAgentCpa = (agentId: string, vendorId: string) =>
    agentCpas.find(c => c.agent_id === agentId && c.vendor_id === vendorId);

  const vendorAssignments = (vendorId: string) =>
    assignments.filter(a => a.vendor_id === vendorId);

  // Agents not yet assigned to this vendor
  const availableAgents = (vendorId: string) => {
    const assigned = new Set(vendorAssignments(vendorId).map(a => a.agent_id));
    return agents.filter(a => !assigned.has(a.id));
  };

  return (
    <LeadVendorShell breadcrumb=" / Vendors" onRefresh={fetchData}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Vendors</h1>
          <Button onClick={openAdd} size="sm" className="gap-1.5 h-8">
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>

        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No vendors</p>
            <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" onClick={openAdd}>
              <Plus className="h-3 w-3 mr-1" /> Add vendor
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((v) => {
              const isExpanded = expandedVendor === v.id;
              const assigns = vendorAssignments(v.id);
              const revenue = vendorRevenue[v.id] || 0;
              const spend = v.monthly_budget || 0;
              const roi = spend > 0 ? ((revenue - spend) / spend * 100) : 0;

              return (
                <div key={v.id} className="rounded-lg border border-border bg-card overflow-hidden">
                  {/* Vendor row */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedVendor(isExpanded ? null : v.id)}
                  >
                    {isExpanded
                      ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    }

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground truncate">{v.name}</span>
                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${STATUS_STYLE[v.status] || ""}`}>{v.status}</Badge>
                        <span className="text-[10px] text-muted-foreground">{TYPE_LABEL[v.vendor_type] || v.vendor_type}</span>
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="hidden sm:flex items-center gap-5 text-xs shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">CPL</p>
                        <p className="font-semibold text-foreground">${v.cost_per_lead?.toFixed(2) || "0"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Leads</p>
                        <p className="font-semibold text-foreground">{leadCounts[v.id] || 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Revenue</p>
                        <p className="font-semibold text-foreground">${revenue.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">ROI</p>
                        <p className={`font-semibold ${roi > 0 ? "text-emerald-600 dark:text-emerald-400" : roi < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                          {spend > 0 ? `${roi.toFixed(0)}%` : "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{assigns.length}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEdit(v)} className="p-1.5 rounded hover:bg-muted transition-colors">
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded hover:bg-muted transition-colors">
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded: Agent routing */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-3">
                      {/* Mobile stats */}
                      <div className="grid grid-cols-4 gap-3 sm:hidden text-xs">
                        <div><p className="text-[10px] text-muted-foreground">CPL</p><p className="font-semibold">${v.cost_per_lead?.toFixed(2) || "0"}</p></div>
                        <div><p className="text-[10px] text-muted-foreground">Leads</p><p className="font-semibold">{leadCounts[v.id] || 0}</p></div>
                        <div><p className="text-[10px] text-muted-foreground">Revenue</p><p className="font-semibold">${revenue.toLocaleString()}</p></div>
                        <div><p className="text-[10px] text-muted-foreground">ROI</p><p className={`font-semibold ${roi > 0 ? "text-emerald-600 dark:text-emerald-400" : roi < 0 ? "text-destructive" : "text-muted-foreground"}`}>{spend > 0 ? `${roi.toFixed(0)}%` : "—"}</p></div>
                      </div>

                      {/* Vendor details */}
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
                        {v.contact_name && <span>Contact: {v.contact_name}</span>}
                        {v.contact_email && <span>{v.contact_email}</span>}
                        {v.contact_phone && <span>{v.contact_phone}</span>}
                        {v.monthly_budget && <span>Budget: ${v.monthly_budget.toLocaleString()}/mo</span>}
                        {v.contract_start && <span>Contract: {new Date(v.contract_start).toLocaleDateString()} → {v.contract_end ? new Date(v.contract_end).toLocaleDateString() : "Ongoing"}</span>}
                      </div>

                      {/* Agent Routing Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <Shield className="h-3.5 w-3.5" />
                            Agent Routing
                          </div>
                          <Button size="sm" variant="outline" className="h-6 text-[11px] gap-1" onClick={() => openAssignDialog(v.id)}>
                            <UserPlus className="h-3 w-3" /> Assign
                          </Button>
                        </div>

                        {assigns.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground italic">No agents assigned — leads from this vendor won't be routed.</p>
                        ) : (
                          <div className="space-y-1">
                            {assigns.map((a) => {
                              const cpaData = getAgentCpa(a.agent_id, v.id);
                              const overCpa = a.max_cpa && cpaData && cpaData.cpa > a.max_cpa;
                              return (
                                <div key={a.id} className={`flex items-center gap-3 rounded-md border px-3 py-2 text-xs transition-colors ${
                                  !a.is_active ? "border-border bg-muted/50 opacity-60" : overCpa ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
                                }`}>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-foreground truncate">{getAgentName(a.agent_id)}</span>
                                      {!a.is_active && <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-muted">Cut off</Badge>}
                                      {overCpa && a.is_active && (
                                        <Badge variant="destructive" className="text-[9px] px-1 py-0 gap-0.5">
                                          <TrendingUp className="h-2.5 w-2.5" /> Over CPA
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Agent CPA stats */}
                                  <div className="hidden sm:flex items-center gap-4 text-[11px] shrink-0">
                                    <div className="text-right">
                                      <span className="text-muted-foreground">Leads: </span>
                                      <span className="font-medium">{cpaData?.leads || 0}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-muted-foreground">CPA: </span>
                                      <span className={`font-medium ${overCpa ? "text-destructive" : "text-foreground"}`}>
                                        ${cpaData?.cpa.toFixed(2) || "0.00"}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-muted-foreground">Rev: </span>
                                      <span className="font-medium">${(cpaData?.revenue || 0).toLocaleString()}</span>
                                    </div>
                                    {a.max_cpa && (
                                      <div className="text-right">
                                        <span className="text-muted-foreground">Max: </span>
                                        <span className="font-medium">${a.max_cpa.toFixed(2)}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Toggle & remove */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Switch
                                      checked={a.is_active}
                                      onCheckedChange={() => toggleAssignment(a.id, a.is_active)}
                                      className="scale-75 origin-right"
                                    />
                                    <button onClick={() => removeAssignment(a.id)} className="p-1 rounded hover:bg-muted transition-colors">
                                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Vendor Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="text-sm">{editingId ? "Edit Vendor" : "Add Vendor"}</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. MovingLeads.com" className="h-8 text-xs" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Contact</Label><Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className="h-8 text-xs" /></div>
                <div><Label className="text-xs">Email</Label><Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="h-8 text-xs" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Phone</Label><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="h-8 text-xs" /></div>
                <div><Label className="text-xs">Website</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" className="h-8 text-xs" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="paused">Paused</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Type</Label>
                  <Select value={form.vendor_type} onValueChange={(v) => setForm({ ...form, vendor_type: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="lead_provider">Lead Provider</SelectItem><SelectItem value="aggregator">Aggregator</SelectItem><SelectItem value="referral_partner">Referral</SelectItem><SelectItem value="ad_network">Ad Network</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Cost/Lead ($)</Label><Input type="number" value={form.cost_per_lead} onChange={(e) => setForm({ ...form, cost_per_lead: e.target.value })} className="h-8 text-xs" /></div>
                <div><Label className="text-xs">Monthly Budget ($)</Label><Input type="number" value={form.monthly_budget} onChange={(e) => setForm({ ...form, monthly_budget: e.target.value })} className="h-8 text-xs" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Contract Start</Label><Input type="date" value={form.contract_start} onChange={(e) => setForm({ ...form, contract_start: e.target.value })} className="h-8 text-xs" /></div>
                <div><Label className="text-xs">Contract End</Label><Input type="date" value={form.contract_end} onChange={(e) => setForm({ ...form, contract_end: e.target.value })} className="h-8 text-xs" /></div>
              </div>
              <div><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="text-xs" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button size="sm" className="h-7 text-xs" onClick={handleSave}>{editingId ? "Save" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Agent Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-sm">Assign Agent</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Agent</Label>
                <Select value={assignAgentId} onValueChange={setAssignAgentId}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select agent..." /></SelectTrigger>
                  <SelectContent>
                    {availableAgents(assignVendorId || "").map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.display_name || a.email || a.id.slice(0, 8)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Max CPA Threshold ($)</Label>
                <Input type="number" value={assignMaxCpa} onChange={(e) => setAssignMaxCpa(e.target.value)} placeholder="Optional — auto cut-off" className="h-8 text-xs" />
                <p className="text-[10px] text-muted-foreground mt-1">Agent will be flagged if their CPA exceeds this.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
              <Button size="sm" className="h-7 text-xs" onClick={handleAssignAgent} disabled={!assignAgentId}>Assign</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </LeadVendorShell>
  );
}
