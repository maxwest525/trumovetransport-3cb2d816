import { useEffect, useState, useMemo } from "react";
import LeadVendorShell from "@/components/layout/LeadVendorShell";
import { supabase } from "@/integrations/supabase/client";
import { Building2, DollarSign, TrendingUp, Users } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(221 83% 53%)", "hsl(262 83% 58%)",
];

const SOURCE_LABELS: Record<string, string> = {
  website: "Website", referral: "Referral", ppc: "PPC",
  walk_in: "Walk-in", phone: "Phone", other: "Other",
};

export default function LeadsDashboard() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [v, l] = await Promise.all([
        supabase.from("lead_vendors").select("*").order("created_at", { ascending: false }),
        supabase.from("leads").select("id, vendor_id, source, created_at"),
      ]);
      setVendors(v.data || []);
      setLeads(l.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const leadCounts = useMemo(() => {
    const c: Record<string, number> = {};
    leads.forEach((l) => { if (l.vendor_id) c[l.vendor_id] = (c[l.vendor_id] || 0) + 1; });
    return c;
  }, [leads]);

  const activeVendors = vendors.filter((v) => v.status === "active");
  const totalMonthlySpend = activeVendors.reduce((s, v) => s + (v.monthly_budget || 0), 0);
  const totalLeads = Object.values(leadCounts).reduce((s: number, c) => s + (c as number), 0);
  const avgCostPerLead = activeVendors.length > 0
    ? activeVendors.reduce((s, v) => s + (v.cost_per_lead || 0), 0) / activeVendors.length : 0;

  const chartData = useMemo(() => {
    const vendorsWithLeads = vendors.filter((v) => leadCounts[v.id] > 0);
    if (vendorsWithLeads.length === 0) return [];
    const now = new Date();
    const weeks: { label: string; start: Date; end: Date }[] = [];
    for (let i = 11; i >= 0; i--) {
      const end = new Date(now); end.setDate(end.getDate() - i * 7);
      const start = new Date(end); start.setDate(start.getDate() - 6);
      weeks.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, start, end });
    }
    return weeks.map((w) => {
      const row: Record<string, any> = { week: w.label };
      vendorsWithLeads.forEach((v) => {
        row[v.name] = leads.filter(
          (l) => l.vendor_id === v.id && new Date(l.created_at) >= w.start && new Date(l.created_at) <= w.end
        ).length;
      });
      return row;
    });
  }, [vendors, leads, leadCounts]);

  const chartVendorNames = useMemo(() => vendors.filter((v) => leadCounts[v.id] > 0).map((v) => v.name), [vendors, leadCounts]);

  const sourceChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => { counts[l.source] = (counts[l.source] || 0) + 1; });
    return Object.entries(counts).map(([s, c]) => ({ name: SOURCE_LABELS[s] || s, value: c })).sort((a, b) => b.value - a.value);
  }, [leads]);

  if (loading) return <LeadVendorShell><p className="text-sm text-muted-foreground text-center py-12">Loading...</p></LeadVendorShell>;

  return (
    <LeadVendorShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Lead Vendors Overview</h1>
          <p className="text-sm text-muted-foreground">KPIs and performance across all lead sources</p>
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
      </div>
    </LeadVendorShell>
  );
}
