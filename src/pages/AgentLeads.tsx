import { useEffect, useState, useMemo } from "react";
import AgentShell from "@/components/layout/AgentShell";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Phone, Mail, MapPin, Calendar, Filter, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddLeadDealForm } from "@/components/pipeline/AddLeadDealForm";

interface Lead {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  move_date: string | null;
  origin_address: string | null;
  destination_address: string | null;
  estimated_value: number | null;
  tags: string[] | null;
  notes: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  contacted: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  qualified: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  lost: "bg-destructive/15 text-destructive",
};

const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  referral: "Referral",
  ppc: "PPC",
  walk_in: "Walk-in",
  phone: "Phone",
  other: "Other",
};

export default function AgentLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();

  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("id, created_at, first_name, last_name, email, phone, source, status, move_date, origin_address, destination_address, estimated_value, tags, notes")
      .order("created_at", { ascending: false });
    setLeads((data as Lead[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.origin_address?.toLowerCase().includes(q) ||
        l.destination_address?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      const matchesSource = sourceFilter === "all" || l.source === sourceFilter;
      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [leads, search, statusFilter, sourceFilter]);

  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
  }), [leads]);

  return (
    <AgentShell breadcrumb=" / Leads">
      <div className="px-4 py-6 max-w-[1400px] mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Leads</h1>
            <p className="text-sm text-muted-foreground">{stats.total} total leads</p>
          </div>
          <Button onClick={() => setAddOpen(true)} size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New Lead
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "New", value: stats.new, color: "text-blue-600 dark:text-blue-400" },
            { label: "Contacted", value: stats.contacted, color: "text-amber-600 dark:text-amber-400" },
            { label: "Qualified", value: stats.qualified, color: "text-emerald-600 dark:text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-3.5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-9">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="ppc">PPC</SelectItem>
              <SelectItem value="walk_in">Walk-in</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Leads Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Loading leads...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">No leads found</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setAddOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add your first lead
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Contact</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Source</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Move Date</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Value</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden xl:table-cell">Route</th>
                    <th className="px-4 py-2.5 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/agent/pipeline`)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{lead.first_name} {lead.last_name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {lead.email || lead.phone || "No contact"}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex flex-col gap-0.5">
                          {lead.email && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" /> {lead.email}
                            </span>
                          )}
                          {lead.phone && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" /> {lead.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{SOURCE_LABELS[lead.source] || lead.source}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={`text-[11px] ${STATUS_COLORS[lead.status] || ""}`}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {lead.move_date ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(lead.move_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {lead.estimated_value ? (
                          <span className="text-xs font-medium text-foreground">${lead.estimated_value.toLocaleString()}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        {(lead.origin_address || lead.destination_address) ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground max-w-[200px] truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {lead.origin_address && lead.destination_address
                              ? `${lead.origin_address.split(",")[0]} → ${lead.destination_address.split(",")[0]}`
                              : lead.origin_address || lead.destination_address}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AddLeadDealForm open={addOpen} onOpenChange={setAddOpen} onAdded={fetchLeads} />
      </div>
    </AgentShell>
  );
}
