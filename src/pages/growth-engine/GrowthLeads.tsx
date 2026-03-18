import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Users, Phone, ClipboardList, CheckCircle2,
  XCircle, Clock, Search, Zap, Ban,
  PhoneCall, TrendingUp, AlertTriangle, ArrowUpRight
} from "lucide-react";
import { useState } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STATUS_CARDS = [
  { label: "Total Leads", value: 847, icon: Users, color: "text-primary", bg: "bg-primary/10" },
  { label: "In Queue", value: 23, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Attempted", value: 312, icon: PhoneCall, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Connected", value: 389, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  { label: "Not Reached", value: 78, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
  { label: "Duplicate", value: 19, icon: Ban, color: "text-muted-foreground", bg: "bg-muted" },
  { label: "Suppressed", value: 12, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  { label: "Booked", value: 14, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

const LEAD_STATUS_BY_SOURCE = [
  { source: "Google Search", total: 234, inQueue: 8, connected: 156, notReached: 32, booked: 42, bookedRate: "18.0%", avgSpeed: "8s" },
  { source: "Meta Ads", total: 156, inQueue: 6, connected: 98, notReached: 24, booked: 18, bookedRate: "11.5%", avgSpeed: "14s" },
  { source: "Meta Instant", total: 84, inQueue: 4, connected: 52, notReached: 18, booked: 6, bookedRate: "7.1%", avgSpeed: "6s" },
  { source: "Organic / SEO", total: 89, inQueue: 2, connected: 68, notReached: 8, booked: 14, bookedRate: "15.7%", avgSpeed: "22s" },
  { source: "Inbound Call", total: 67, inQueue: 3, connected: 54, notReached: 4, booked: 12, bookedRate: "17.9%", avgSpeed: "3s" },
];

const MOCK_LEADS = [
  { id: 1, name: "Maria Gonzalez", source: "Google", campaign: "Interstate CA", keyword: "long distance movers LA", page: "Quote Funnel", type: "Form", status: "Connected", quality: 92, speed: "8s", sale: "Booked" },
  { id: 2, name: "James Wilson", source: "Meta", campaign: "FL Interstate", keyword: "moving from miami", page: "Instant Form", type: "Form", status: "Connected", quality: 74, speed: "12s", sale: "Follow-up" },
  { id: 3, name: "Sarah Chen", source: "Google", campaign: "Interstate TX", keyword: "dallas to chicago movers", page: "Call Page", type: "Call", status: "Connected", quality: 88, speed: "3s", sale: "Booked" },
  { id: 4, name: "Robert Kim", source: "Google", campaign: "Interstate CA", keyword: "cross country moving cost", page: "Quote Funnel", type: "Form", status: "Attempted", quality: 65, speed: "45s", sale: "Pending" },
  { id: 5, name: "Lisa Anderson", source: "Meta", campaign: "Retargeting", keyword: null, page: "Instant Form", type: "Form", status: "Not Reached", quality: 41, speed: "2m 15s", sale: "Lost" },
  { id: 6, name: "Michael Torres", source: "Google", campaign: "Interstate NY", keyword: "NYC to florida movers", page: "Quote Funnel", type: "Form", status: "In Queue", quality: 78, speed: "—", sale: "Pending" },
  { id: 7, name: "Jennifer Martinez", source: "Google", campaign: "Interstate CA", keyword: "moving from SF", page: "Call Page", type: "Call", status: "Connected", quality: 95, speed: "5s", sale: "Booked" },
  { id: 8, name: "David Brown", source: "Meta", campaign: "FL Interstate", keyword: "interstate quote", page: "Instant Form", type: "Form", status: "Duplicate", quality: 0, speed: "—", sale: "Suppressed" },
  { id: 9, name: "Amanda Lee", source: "Google", campaign: "Interstate TX", keyword: "TX to CA movers", page: "Quote Funnel", type: "Form", status: "Connected", quality: 82, speed: "11s", sale: "Follow-up" },
  { id: 10, name: "Chris Patel", source: "Inbound", campaign: "Organic", keyword: null, page: "Homepage", type: "Call", status: "Connected", quality: 70, speed: "Direct", sale: "Booked" },
];

const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    "Connected": "bg-green-500/10 text-green-600", "Attempted": "bg-blue-500/10 text-blue-600",
    "In Queue": "bg-amber-500/10 text-amber-600", "Not Reached": "bg-orange-500/10 text-orange-600",
    "Duplicate": "bg-muted text-muted-foreground", "Suppressed": "bg-red-500/10 text-red-600",
  };
  return map[status] || "bg-muted text-muted-foreground";
};

const getSaleBadge = (sale: string) => {
  const map: Record<string, string> = {
    "Booked": "bg-emerald-500/10 text-emerald-600", "Follow-up": "bg-blue-500/10 text-blue-600",
    "Pending": "bg-amber-500/10 text-amber-600", "Lost": "bg-red-500/10 text-red-600",
    "Suppressed": "bg-muted text-muted-foreground",
  };
  return map[sale] || "bg-muted text-muted-foreground";
};

export default function GrowthLeads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = MOCK_LEADS.filter(lead => {
    if (searchTerm && !lead.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;
    if (statusFilter !== "all" && lead.status !== statusFilter) return false;
    if (typeFilter !== "all" && lead.type !== typeFilter) return false;
    return true;
  });

  return (
    <GrowthEngineShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Leads & Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Lead status by source, response speed, and booked outcomes.</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          {STATUS_CARDS.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-card rounded-xl border border-border p-3 text-center space-y-1">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center mx-auto", card.bg)}>
                  <Icon className={cn("w-3.5 h-3.5", card.color)} />
                </div>
                <p className="text-lg font-bold text-foreground">{card.value}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* Lead Status by Source */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Lead Status by Source</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-semibold">Source</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Total</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">In Queue</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Connected</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Not Reached</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Booked</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Book %</th>
                  <th className="text-right py-2 text-muted-foreground font-semibold">Avg Speed</th>
                </tr>
              </thead>
              <tbody>
                {LEAD_STATUS_BY_SOURCE.map(row => (
                  <tr key={row.source} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="py-2 font-medium text-foreground">{row.source}</td>
                    <td className="py-2 text-right text-foreground">{row.total}</td>
                    <td className="py-2 text-right text-foreground">{row.inQueue}</td>
                    <td className="py-2 text-right text-foreground">{row.connected}</td>
                    <td className="py-2 text-right text-foreground">{row.notReached}</td>
                    <td className="py-2 text-right font-semibold text-emerald-600">{row.booked}</td>
                    <td className="py-2 text-right text-foreground">{row.bookedRate}</td>
                    <td className="py-2 text-right text-foreground">{row.avgSpeed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search leads..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-8 text-xs pl-8" />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Google">Google</SelectItem>
              <SelectItem value="Meta">Meta</SelectItem>
              <SelectItem value="Inbound">Inbound</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="In Queue">In Queue</SelectItem>
              <SelectItem value="Attempted">Attempted</SelectItem>
              <SelectItem value="Connected">Connected</SelectItem>
              <SelectItem value="Not Reached">Not Reached</SelectItem>
              <SelectItem value="Duplicate">Duplicate</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Form">Form</SelectItem>
              <SelectItem value="Call">Call</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-[10px]">{filtered.length} leads</Badge>
        </div>

        {/* Lead Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Name</TableHead>
                <TableHead className="text-[10px]">Source</TableHead>
                <TableHead className="text-[10px]">Campaign</TableHead>
                <TableHead className="text-[10px]">Keyword</TableHead>
                <TableHead className="text-[10px]">Page</TableHead>
                <TableHead className="text-[10px]">Type</TableHead>
                <TableHead className="text-[10px]">Status</TableHead>
                <TableHead className="text-[10px]">Quality</TableHead>
                <TableHead className="text-[10px]">Speed</TableHead>
                <TableHead className="text-[10px]">Sale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(lead => (
                <TableRow key={lead.id}>
                  <TableCell className="text-xs font-medium">{lead.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{lead.source}</Badge></TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{lead.campaign}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground max-w-[140px] truncate">{lead.keyword || "—"}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{lead.page}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] gap-0.5">
                      {lead.type === "Call" ? <Phone className="w-2.5 h-2.5" /> : <ClipboardList className="w-2.5 h-2.5" />}
                      {lead.type}
                    </Badge>
                  </TableCell>
                  <TableCell><Badge className={cn("text-[10px] border-0", getStatusBadge(lead.status))}>{lead.status}</Badge></TableCell>
                  <TableCell>
                    <span className={cn("text-xs font-semibold",
                      lead.quality >= 80 ? 'text-green-600' : lead.quality >= 60 ? 'text-amber-600' : lead.quality > 0 ? 'text-red-500' : 'text-muted-foreground'
                    )}>{lead.quality > 0 ? lead.quality : "—"}</span>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-[11px]",
                      lead.speed === "—" ? 'text-muted-foreground' : lead.speed.includes('m') ? 'text-red-500 font-semibold' : 'text-green-600'
                    )}>{lead.speed}</span>
                  </TableCell>
                  <TableCell><Badge className={cn("text-[10px] border-0", getSaleBadge(lead.sale))}>{lead.sale}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </GrowthEngineShell>
  );
}
