import { useEffect, useState, useMemo } from "react";
import LeadVendorShell from "@/components/layout/LeadVendorShell";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(221 83% 53%)", "hsl(262 83% 58%)",
];

const SOURCE_LABELS: Record<string, string> = {
  website: "Website", referral: "Referral", ppc: "PPC",
  walk_in: "Walk-in", phone: "Phone", other: "Other",
};

export default function LeadsPerformance() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [v, l] = await Promise.all([
        supabase.from("lead_vendors").select("*"),
        supabase.from("leads").select("id, vendor_id, source, created_at, estimated_value"),
      ]);
      setVendors(v.data || []);
      setLeads(l.data || []);
      setLoading(false);
    };
    fetchAll();
  }, [refreshKey]);

  const leadCounts = useMemo(() => {
    const c: Record<string, number> = {};
    leads.forEach((l) => { if (l.vendor_id) c[l.vendor_id] = (c[l.vendor_id] || 0) + 1; });
    return c;
  }, [leads]);

  // Weekly lead volume trend (all leads)
  const weeklyTrend = useMemo(() => {
    const now = new Date();
    const weeks: { label: string; start: Date; end: Date }[] = [];
    for (let i = 11; i >= 0; i--) {
      const end = new Date(now); end.setDate(end.getDate() - i * 7);
      const start = new Date(end); start.setDate(start.getDate() - 6);
      weeks.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, start, end });
    }
    return weeks.map((w) => ({
      week: w.label,
      leads: leads.filter((l) => new Date(l.created_at) >= w.start && new Date(l.created_at) <= w.end).length,
    }));
  }, [leads]);

  // Vendor comparison bar chart
  const vendorComparison = useMemo(() => {
    return vendors
      .filter((v) => leadCounts[v.id] > 0)
      .map((v) => ({
        name: v.name,
        leads: leadCounts[v.id] || 0,
        cost: (v.cost_per_lead || 0) * (leadCounts[v.id] || 0),
        budget: v.monthly_budget || 0,
      }))
      .sort((a, b) => b.leads - a.leads);
  }, [vendors, leadCounts]);

  // Source breakdown
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => { counts[l.source] = (counts[l.source] || 0) + 1; });
    return Object.entries(counts).map(([s, c]) => ({ name: SOURCE_LABELS[s] || s, value: c })).sort((a, b) => b.value - a.value);
  }, [leads]);

  // Cost efficiency per vendor
  const costEfficiency = useMemo(() => {
    return vendors
      .filter((v) => v.status === "active" && (leadCounts[v.id] || 0) > 0)
      .map((v) => ({
        name: v.name,
        costPerLead: v.cost_per_lead || 0,
        leadsGenerated: leadCounts[v.id] || 0,
        totalSpend: (v.cost_per_lead || 0) * (leadCounts[v.id] || 0),
      }))
      .sort((a, b) => a.costPerLead - b.costPerLead);
  }, [vendors, leadCounts]);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  if (loading) return <LeadVendorShell breadcrumb=" / Performance"><p className="text-sm text-muted-foreground text-center py-12">Loading...</p></LeadVendorShell>;

  return (
    <LeadVendorShell breadcrumb=" / Performance" onRefresh={handleRefresh}>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Performance Analytics</h1>
          <p className="text-sm text-muted-foreground">Deep dive into lead source performance and cost efficiency</p>
        </div>

        {/* Lead Volume Trend */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-3">Weekly Lead Volume (Last 12 Weeks)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
              <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Vendor Comparison */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-3">Vendor Comparison</h2>
            {vendorComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={vendorComparison} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                  <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-16">No vendor data</p>
            )}
          </div>

          {/* Source Breakdown */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-3">Source Breakdown</h2>
            {sourceData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                      {sourceData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
                  {sourceData.map((d, i) => (
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

        {/* Cost Efficiency Table */}
        {costEfficiency.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-3">Cost Efficiency by Vendor</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Vendor</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Cost/Lead</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Leads</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Total Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {costEfficiency.map((v) => (
                    <tr key={v.name} className="border-b border-border last:border-0">
                      <td className="px-3 py-2.5 font-medium text-foreground">{v.name}</td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground">${v.costPerLead.toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground">{v.leadsGenerated}</td>
                      <td className="px-3 py-2.5 text-right text-foreground font-medium">${v.totalSpend.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </LeadVendorShell>
  );
}
