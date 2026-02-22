import AccountingShell from "@/components/layout/AccountingShell";
import {
  FileText, CreditCard, TrendingDown, Users, BarChart3,
  DollarSign, Receipt, Globe, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

const TOOLS = [
  { title: "Invoices", description: "Create, send, and track invoices", icon: FileText },
  { title: "Payments", description: "Track incoming and outgoing payments", icon: CreditCard },
  { title: "Expenses", description: "Log and categorize business expenses", icon: TrendingDown },
  { title: "Payroll", description: "Manage employee payroll and deductions", icon: Users },
  { title: "Revenue Reports", description: "Financial summaries and revenue trends", icon: BarChart3 },
  { title: "Overhead & Costs", description: "Breakdown of overhead and operating costs", icon: DollarSign },
  { title: "Lead Costs", description: "Cost-per-lead analysis across channels", icon: Receipt },
  { title: "Subscriptions", description: "Track software and service subscriptions", icon: Receipt },
  { title: "QuickBooks", description: "Connect and sync with QuickBooks", icon: Globe },
];

export default function AccountingDashboard() {
  return (
    <AccountingShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Accounting</h1>
          <p className="text-sm text-muted-foreground mt-1">Financial management and reporting</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.title}
                onClick={() => toast.info(`${tool.title} coming soon`)}
                className="group text-left p-5 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-foreground/10 transition-colors">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{tool.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AccountingShell>
  );
}
