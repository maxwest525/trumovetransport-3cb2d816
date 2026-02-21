import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Clock, Target } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  FunnelChart, Funnel, LabelList,
  LineChart, Line,
} from "recharts";
import { Deal, PipelineStage } from "./types";

const COLORS = ["#3b82f6", "#8b5cf6", "#6366f1", "#f59e0b", "#ef4444", "#10b981", "#14b8a6", "#06b6d4", "#22c55e", "#16a34a", "#dc2626"];

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
}

function MetricCard({ title, value, subtitle, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PipelineReports() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [d, s, l] = await Promise.all([
        supabase.from("deals" as any).select("*, leads(*)"),
        supabase.from("pipeline_stages" as any).select("*").order("display_order"),
        supabase.from("leads" as any).select("*"),
      ]);
      setDeals((d.data as any as Deal[]) || []);
      setStages((s.data as any as PipelineStage[]) || []);
      setLeads((l.data as any[]) || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground text-center py-8">Loading reports...</p>;

  // Metrics
  const totalPipelineValue = deals
    .filter((d) => !["closed_won", "closed_lost"].includes(d.stage))
    .reduce((s, d) => s + (d.deal_value || 0), 0);

  const closedWon = deals.filter((d) => d.stage === "closed_won");
  const closedLost = deals.filter((d) => d.stage === "closed_lost");
  const totalClosed = closedWon.length + closedLost.length;
  const conversionRate = totalClosed > 0 ? ((closedWon.length / totalClosed) * 100).toFixed(1) : "0";

  const revenueThisMonth = closedWon
    .filter((d) => {
      const dt = new Date(d.actual_close_date || d.updated_at);
      const now = new Date();
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    })
    .reduce((s, d) => s + (d.actual_revenue || d.deal_value || 0), 0);

  const avgCycleTime = closedWon.length > 0
    ? Math.round(
        closedWon.reduce((sum, d) => {
          const created = new Date(d.created_at).getTime();
          const closed = new Date(d.actual_close_date || d.updated_at).getTime();
          return sum + (closed - created) / (1000 * 60 * 60 * 24);
        }, 0) / closedWon.length
      )
    : 0;

  // Funnel data
  const funnelData = stages
    .filter((s) => !["closed_won", "closed_lost"].includes(s.stage_key))
    .map((s, i) => ({
      name: s.name,
      value: deals.filter((d) => d.stage === s.stage_key).length,
      fill: COLORS[i % COLORS.length],
    }))
    .filter((d) => d.value > 0);

  // Lead sources
  const sourceCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const src = l.source || "other";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });
  const sourceData = Object.entries(sourceCounts).map(([name, value], i) => ({
    name: name.replace("_", " "),
    value,
    fill: COLORS[i % COLORS.length],
  }));

  // Revenue by month (last 6 months)
  const monthlyRevenue: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyRevenue[key] = 0;
  }
  closedWon.forEach((d) => {
    const dt = new Date(d.actual_close_date || d.updated_at);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthlyRevenue) monthlyRevenue[key] += d.actual_revenue || d.deal_value || 0;
  });
  const revenueData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
    month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short" }),
    revenue,
  }));

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Pipeline Value" value={`$${totalPipelineValue.toLocaleString()}`} icon={DollarSign} />
        <MetricCard title="Win Rate" value={`${conversionRate}%`} subtitle={`${closedWon.length} won / ${totalClosed} closed`} icon={Target} />
        <MetricCard title="Avg Cycle Time" value={`${avgCycleTime}d`} subtitle="Lead to close" icon={Clock} />
        <MetricCard title="Revenue (Month)" value={`$${revenueThisMonth.toLocaleString()}`} icon={TrendingUp} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Funnel */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Deals by Stage</CardTitle></CardHeader>
          <CardContent>
            {funnelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {funnelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-12">No deals yet</p>
            )}
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Lead Sources</CardTitle></CardHeader>
          <CardContent>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-12">No leads yet</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Over Time */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Over Time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
