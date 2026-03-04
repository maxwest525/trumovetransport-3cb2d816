import { useState, useEffect } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, Shield, Clock, Globe, User, Filter } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AuditEvent = {
  id: string;
  ref_number: string;
  event_type: string;
  document_type: string;
  customer_name: string;
  customer_email: string | null;
  signer_ip_address: string | null;
  user_agent: string | null;
  consent_given: boolean | null;
  document_hash: string | null;
  created_at: string;
};

const EVENT_COLORS: Record<string, string> = {
  document_opened: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  consent_given: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  document_signed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  document_sent: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

export default function AdminESignAudit() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("esign_audit_trail")
        .select("id, ref_number, event_type, document_type, customer_name, customer_email, signer_ip_address, user_agent, consent_given, document_hash, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (!error && data) setEvents(data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = events.filter((e) => {
    const matchesSearch =
      !search ||
      e.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      e.ref_number.toLowerCase().includes(search.toLowerCase()) ||
      (e.customer_email?.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "all" || e.event_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const eventTypes = [...new Set(events.map((e) => e.event_type))];

  return (
    <AdminShell>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" /> E-Sign Audit Trail
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete log of all signing events for compliance
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ref #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {eventTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: events.length, icon: FileText },
            { label: "Unique Customers", value: new Set(events.map((e) => e.customer_name)).size, icon: User },
            { label: "Documents Signed", value: events.filter((e) => e.event_type === "document_signed").length, icon: Shield },
            { label: "Consents Given", value: events.filter((e) => e.consent_given).length, icon: Clock },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </div>
              <p className="text-2xl font-bold">{loading ? "—" : s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left p-3 font-medium">Timestamp</th>
                  <th className="text-left p-3 font-medium">Ref #</th>
                  <th className="text-left p-3 font-medium">Customer</th>
                  <th className="text-left p-3 font-medium">Event</th>
                  <th className="text-left p-3 font-medium">Document</th>
                  <th className="text-left p-3 font-medium">IP Address</th>
                  <th className="text-left p-3 font-medium">Consent</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="p-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No audit events found
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr key={e.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {format(new Date(e.created_at), "MMM d, yyyy h:mm a")}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs">{e.ref_number}</td>
                      <td className="p-3">
                        <div className="font-medium">{e.customer_name}</div>
                        {e.customer_email && (
                          <div className="text-xs text-muted-foreground">{e.customer_email}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className={EVENT_COLORS[e.event_type] || ""}>
                          {e.event_type.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="p-3 capitalize">{e.document_type.replace(/_/g, " ")}</td>
                      <td className="p-3">
                        {e.signer_ip_address ? (
                          <div className="flex items-center gap-1.5 text-xs font-mono">
                            <Globe className="w-3 h-3 text-muted-foreground" />
                            {e.signer_ip_address}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        {e.consent_given ? (
                          <Badge variant="outline" className="text-green-600 border-green-300 text-xs">Yes</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
