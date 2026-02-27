import SiteShell from "@/components/layout/SiteShell";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ComplianceDashboard() {
  return (
    <SiteShell centered backendMode hideHeader>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
        <Link
          to="/agent-login"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Workspace
        </Link>
        <h1 className="text-xl font-bold text-foreground mb-2">Compliance Dashboard</h1>
        <p className="text-sm text-muted-foreground">Coming soon — FMCSA filings, licensing, insurance audits, and regulatory tracking.</p>
      </div>
    </SiteShell>
  );
}
