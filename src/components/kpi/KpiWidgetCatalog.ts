import { DollarSign, TrendingUp, Clock, Target, Users, CalendarCheck, Phone, FileText, BarChart3, Eye, CheckSquare, Truck, Package } from "lucide-react";

export interface KpiWidgetDef {
  id: string;
  label: string;
  icon: any;
  category: "revenue" | "pipeline" | "operations" | "team";
  defaultValue: string;
  defaultSub?: string;
}

export const KPI_WIDGETS: KpiWidgetDef[] = [
  { id: "pipeline_value", label: "Pipeline Value", icon: DollarSign, category: "revenue", defaultValue: "$0" },
  { id: "revenue_month", label: "Revenue This Month", icon: TrendingUp, category: "revenue", defaultValue: "$0" },
  { id: "win_rate", label: "Win Rate", icon: Target, category: "pipeline", defaultValue: "0%", defaultSub: "0 won / 0 closed" },
  { id: "avg_cycle_time", label: "Avg Cycle Time", icon: Clock, category: "pipeline", defaultValue: "0d", defaultSub: "Lead to close" },
  { id: "new_leads", label: "New Leads Today", icon: Eye, category: "pipeline", defaultValue: "0" },
  { id: "active_deals", label: "Active Deals", icon: FileText, category: "pipeline", defaultValue: "0" },
  { id: "tasks_due", label: "Tasks Due", icon: CheckSquare, category: "operations", defaultValue: "0" },
  { id: "bookings_week", label: "Bookings This Week", icon: CalendarCheck, category: "operations", defaultValue: "0" },
  { id: "calls_today", label: "Calls Today", icon: Phone, category: "operations", defaultValue: "0" },
  { id: "dispatched", label: "Dispatched", icon: Truck, category: "operations", defaultValue: "0" },
  { id: "in_transit", label: "In Transit", icon: Package, category: "operations", defaultValue: "0" },
  { id: "team_members", label: "Team Members", icon: Users, category: "team", defaultValue: "0" },
  { id: "close_rate_team", label: "Team Close Rate", icon: BarChart3, category: "team", defaultValue: "0%" },
];

export const DEFAULT_WIDGET_IDS = ["pipeline_value", "revenue_month", "win_rate", "new_leads"];
