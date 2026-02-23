import { useEffect, useState } from "react";
import AgentShell from "@/components/layout/AgentShell";
import { supabase } from "@/integrations/supabase/client";
import { Users, Mail, Phone, MapPin, Calendar, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  origin_address: string | null;
  destination_address: string | null;
  move_date: string | null;
  status: string;
  created_at: string;
}

export default function AgentCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, first_name, last_name, email, phone, origin_address, destination_address, move_date, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      setCustomers((data as Customer[]) || []);
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.phone || "").includes(q);
  });

  const statusColor = (s: string) => {
    if (s === "qualified") return "bg-primary/10 text-primary";
    if (s === "contacted") return "bg-blue-500/10 text-blue-600";
    if (s === "lost") return "bg-destructive/10 text-destructive";
    return "bg-muted text-muted-foreground";
  };

  return (
    <AgentShell breadcrumb=" / My Customers">
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              My Customers
            </h1>
            <p className="text-sm text-muted-foreground">{customers.length} total customers</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="pl-9" />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading customers...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {search ? "No customers match your search" : "No customers yet. Create one to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/agent/esign?leadId=${c.id}&name=${encodeURIComponent(c.first_name + " " + c.last_name)}&email=${encodeURIComponent(c.email || "")}&phone=${encodeURIComponent(c.phone || "")}`)}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {c.first_name[0]}{c.last_name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{c.first_name} {c.last_name}</p>
                    <Badge className={`text-[10px] capitalize ${statusColor(c.status)}`}>{c.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                    {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                    {c.move_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(c.move_date).toLocaleDateString()}</span>}
                  </div>
                  {(c.origin_address || c.destination_address) && (
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {c.origin_address || "—"} → {c.destination_address || "—"}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </AgentShell>
  );
}
