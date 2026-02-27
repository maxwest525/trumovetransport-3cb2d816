import { useEffect, useState, useMemo } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus, Search, Building2, DollarSign, TrendingUp, Users, Phone,
  Mail, Globe, MoreVertical, Pencil, Trash2, ExternalLink,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LeadVendor {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  vendor_type: string;
  status: string;
  cost_per_lead: number | null;
  monthly_budget: number | null;
  contract_start: string | null;
  contract_end: string | null;
  notes: string | null;
  created_at: string;
}

const EMPTY_FORM = {
  name: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  website: "",
  vendor_type: "lead_provider",
  status: "active",
  cost_per_lead: "",
  monthly_budget: "",
  contract_start: "",
  contract_end: "",
  notes: "",
};

export default function AdminLeadVendors() {
  const [vendors, setVendors] = useState<LeadVendor[]>([]);
  const [leadCounts, setLeadCounts] = useState<Record<string, number>>({});
  const [leadsRaw, setLeadsRaw] = useState<{ vendor_id: string | null; created_at: string; source: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchData = async () => {
    setLoading(true);
    const [vendorsRes, leadsRes] = await Promise.all([
      supabase.from("lead_vendors").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("id, vendor_id, source, created_at"),
    ]);
    setVendors((vendorsRes.data as LeadVendor[]) || []);

    const allLeads = (leadsRes.data as any[]) || [];
    setLeadsRaw(allLeads);

    // Count leads per vendor
    const counts: Record<string, number> = {};
    allLeads.forEach((l) => {
      if (l.vendor_id) counts[l.vendor_id] = (counts[l.vendor_id] || 0) + 1;
    });
    setLeadCounts(counts);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const activeVendors = vendors.filter((v) => v.status === "active");
  const totalMonthlySpend = activeVendors.reduce((s, v) => s + (v.monthly_budget || 0), 0);
  const totalLeads = Object.values(leadCounts).reduce((s, c) => s + c, 0);
  const avgCostPerLead = activeVendors.length > 0
    ? activeVendors.reduce((s, v) => s + (v.cost_per_lead || 0), 0) / activeVendors.length
    : 0;

  // Chart data: leads per vendor per week (last 12 weeks)
  const CHART_COLORS = [
    "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
    "hsl(var(--chart-4))", "hsl(221 83% 53%)", "hsl(262 83% 58%)",
  ];

  const chartData = useMemo(() => {
    const vendorsWithLeads = vendors.filter((v) => leadCounts[v.id] > 0);
    if (vendorsWithLeads.length === 0) return [];

    const now = new Date();
    const weeks: { label: string; start: Date; end: Date }[] = [];
    for (let i = 11; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      const label = `${start.getMonth() + 1}/${start.getDate()}`;
      weeks.push({ label, start, end });
    }

    return weeks.map((w) => {
      const row: Record<string, any> = { week: w.label };
      vendorsWithLeads.forEach((v) => {
        row[v.name] = leadsRaw.filter(
          (l) => l.vendor_id === v.id && new Date(l.created_at) >= w.start && new Date(l.created_at) <= w.end
        ).length;
      });
      return row;
    });
  }, [vendors, leadsRaw, leadCounts]);

  const chartVendorNames = useMemo(() => {
    return vendors.filter((v) => leadCounts[v.id] > 0).map((v) => v.name);
  }, [vendors, leadCounts]);

  const SOURCE_LABELS: Record<string, string> = {
    website: "Website", referral: "Referral", ppc: "PPC",
    walk_in: "Walk-in", phone: "Phone", other: "Other",
  };

  const sourceChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    leadsRaw.forEach((l) => {
      counts[l.source] = (counts[l.source] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([source, count]) => ({ name: SOURCE_LABELS[source] || source, value: count }))
      .sort((a, b) => b.value - a.value);
  }, [leadsRaw]);

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    return !q || v.name.toLowerCase().includes(q) || v.contact_name?.toLowerCase().includes(q) || v.contact_email?.toLowerCase().includes(q);
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (v: LeadVendor) => {
    setEditingId(v.id);
    setForm({
      name: v.name,
      contact_name: v.contact_name || "",
      contact_email: v.contact_email || "",
      contact_phone: v.contact_phone || "",
      website: v.website || "",
      vendor_type: v.vendor_type,
      status: v.status,
      cost_per_lead: v.cost_per_lead?.toString() || "",
      monthly_budget: v.monthly_budget?.toString() || "",
      contract_start: v.contract_start || "",
      contract_end: v.contract_end || "",
      notes: v.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Vendor name is required"); return; }
    const payload = {
      name: form.name,
      contact_name: form.contact_name || null,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      website: form.website || null,
      vendor_type: form.vendor_type,
      status: form.status,
      cost_per_lead: form.cost_per_lead ? Number(form.cost_per_lead) : 0,
      monthly_budget: form.monthly_budget ? Number(form.monthly_budget) : 0,
      contract_start: form.contract_start || null,
      contract_end: form.contract_end || null,
      notes: form.notes || null,
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

  const STATUS_STYLE: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    paused: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    inactive: "bg-muted text-muted-foreground",
  };

  return (
    <AdminShell breadcrumb=" / Lead Vendors">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Lead Vendors</h1>
            <p className="text-sm text-muted-foreground">Manage 3rd-party lead sources, budgets & performance</p>
          </div>
          <Button onClick={openAdd} size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Vendor
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Active Vendors", value: String(activeVendors.length), icon: Building2 },
            { label: "Monthly Spend", value: `$${totalMonthlySpend.toLocaleString()}`, icon: DollarSign },
            { label: "Total Leads Sourced", value: String(totalLeads), icon: Users },
            { label: "Avg Cost / Lead", value: `$${avgCostPerLead.toFixed(2)}`, icon: TrendingUp },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <Icon className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <div className="mt-2 text-2xl font-bold text-foreground">{s.value}</div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Vendor Performance Bar Chart */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-3">Leads by Vendor (Last 12 Weeks)</h2>
            {chartData.length > 0 && chartVendorNames.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {chartVendorNames.map((name, i) => (
                    <Bar key={name} dataKey={name} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[3, 3, 0, 0]} stackId="vendors" />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-16">No vendor-linked leads yet</p>
            )}
          </div>

          {/* Source Breakdown Pie Chart */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-3">Lead Source Breakdown</h2>
            {sourceChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={sourceChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3}>
                      {sourceChartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
                  {sourceChartData.map((d, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      {d.name} ({d.value})
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-16">No leads yet</p>
            )}
          </div>
        </div>
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>

        {/* Vendor Cards */}
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading vendors...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No vendors found</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={openAdd}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add your first vendor
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((v) => (
              <div key={v.id} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{v.name}</h3>
                    {v.contact_name && <p className="text-xs text-muted-foreground mt-0.5">{v.contact_name}</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className={`text-[11px] ${STATUS_STYLE[v.status] || ""}`}>
                      {v.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-muted transition-colors">
                          <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(v)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(v.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {v.contact_email && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> {v.contact_email}
                    </span>
                  )}
                  {v.contact_phone && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {v.contact_phone}
                    </span>
                  )}
                  {v.website && (
                    <a href={v.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Globe className="h-3 w-3" /> Website <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Cost/Lead</p>
                    <p className="text-sm font-semibold text-foreground">${v.cost_per_lead?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Monthly Budget</p>
                    <p className="text-sm font-semibold text-foreground">${v.monthly_budget?.toLocaleString() || "0"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Leads Sourced</p>
                    <p className="text-sm font-semibold text-foreground">{leadCounts[v.id] || 0}</p>
                  </div>
                </div>

                {/* Contract dates */}
                {(v.contract_start || v.contract_end) && (
                  <p className="text-[11px] text-muted-foreground">
                    Contract: {v.contract_start ? new Date(v.contract_start).toLocaleDateString() : "—"} → {v.contract_end ? new Date(v.contract_end).toLocaleDateString() : "Ongoing"}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <Label className="text-xs">Vendor Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. MovingLeads.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Contact Name</Label>
                  <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Contact Email</Label>
                  <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Contact Phone</Label>
                  <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Website</Label>
                  <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Vendor Type</Label>
                  <Select value={form.vendor_type} onValueChange={(v) => setForm({ ...form, vendor_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead_provider">Lead Provider</SelectItem>
                      <SelectItem value="aggregator">Aggregator</SelectItem>
                      <SelectItem value="referral_partner">Referral Partner</SelectItem>
                      <SelectItem value="ad_network">Ad Network</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Cost per Lead ($)</Label>
                  <Input type="number" value={form.cost_per_lead} onChange={(e) => setForm({ ...form, cost_per_lead: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Monthly Budget ($)</Label>
                  <Input type="number" value={form.monthly_budget} onChange={(e) => setForm({ ...form, monthly_budget: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Contract Start</Label>
                  <Input type="date" value={form.contract_start} onChange={(e) => setForm({ ...form, contract_start: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Contract End</Label>
                  <Input type="date" value={form.contract_end} onChange={(e) => setForm({ ...form, contract_end: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>{editingId ? "Save Changes" : "Add Vendor"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminShell>
  );
}
