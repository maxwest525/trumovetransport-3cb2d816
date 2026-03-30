import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Search, ChevronRight, Users, ArrowLeft, Clock
} from "lucide-react";

interface LeadRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  origin_address: string | null;
  destination_address: string | null;
  assigned_agent_id: string | null;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes}m ${totalSeconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

function ClaimTimer({ createdAt, claimed }: { createdAt: string; claimed: boolean }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (claimed) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [claimed]);

  const elapsed = now - new Date(createdAt).getTime();
  const label = formatElapsed(elapsed);
  const isUrgent = elapsed > 5 * 60 * 1000; // >5 min
  const isCritical = elapsed > 15 * 60 * 1000; // >15 min

  if (claimed) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-green-400">
        <Clock className="w-3 h-3" /> Claimed
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono tabular-nums ${
      isCritical ? "text-red-400 animate-pulse" : isUrgent ? "text-yellow-400" : "text-muted-foreground"
    }`}>
      <Clock className="w-3 h-3" /> {label}
    </span>
  );
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  qualified: "bg-green-500/10 text-green-400 border-green-500/30",
  lost: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function CrmLeads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchLeads() {
      const { data } = await supabase
        .from("leads")
        .select("id, first_name, last_name, email, phone, source, status, tags, created_at, updated_at, origin_address, destination_address, assigned_agent_id")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) setLeads(data as LeadRow[]);
      setLoading(false);
    }
    fetchLeads();
  }, []);

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.phone?.includes(q);
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["all", "new", "contacted", "qualified", "lost"];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Incoming Leads</h1>
          <Badge variant="secondary" className="ml-auto">{filtered.length}</Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {statuses.map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className="capitalize text-xs shrink-0"
              >
                {s === "all" ? "All" : s}
              </Button>
            ))}
          </div>
        </div>

        {/* Lead list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No leads found.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((lead) => (
              <button
                key={lead.id}
                onClick={() => navigate(`/crm/leads/${lead.id}`)}
                className="w-full text-left p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/40 transition-colors flex items-center gap-4 group"
              >
                {/* Avatar circle */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {lead.first_name[0]}{lead.last_name[0]}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {lead.first_name} {lead.last_name}
                    </p>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[lead.status] || ""}`}>
                      {lead.status}
                    </Badge>
                    {lead.tags?.includes("anonymous") && (
                      <Badge variant="secondary" className="text-[10px]">Cookie Lead</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {lead.email || lead.phone || "No contact info"}
                    {lead.origin_address && ` · ${lead.origin_address}`}
                  </p>
                </div>

                {/* Date + arrow */}
                <div className="text-right shrink-0 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
