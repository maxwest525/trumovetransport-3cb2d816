import SiteShell from "@/components/layout/SiteShell";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, FileText, Scale, AlertTriangle, Clock } from "lucide-react";

const COMING_SOON = [
  { icon: FileText, label: "FMCSA Filings", desc: "Federal filings & carrier authority" },
  { icon: ShieldCheck, label: "Licensing", desc: "State & federal license tracking" },
  { icon: Scale, label: "Insurance Audits", desc: "Policy verification & renewals" },
  { icon: AlertTriangle, label: "Violations", desc: "Safety alerts & violation logs" },
];

export default function ComplianceDashboard() {
  return (
    <SiteShell centered backendMode hideHeader>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Portal
        </Link>

        {/* Icon + Header */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-br from-sky-500/[0.08] to-indigo-500/[0.04] rounded-3xl blur-2xl" />
          <div className="relative w-14 h-14 rounded-2xl bg-sky-500/[0.08] border border-sky-500/15 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-sky-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Compliance</h1>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/[0.03] border border-foreground/[0.06] mb-8">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Coming Soon
          </span>
        </div>

        {/* Feature preview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-[640px]">
          {COMING_SOON.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2.5 rounded-2xl border border-border/60 bg-card p-5 text-center opacity-60"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/[0.06] border border-sky-500/10 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-sky-500/70" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SiteShell>
  );
}
