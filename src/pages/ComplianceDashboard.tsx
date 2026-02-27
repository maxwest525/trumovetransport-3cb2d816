import SiteShell from "@/components/layout/SiteShell";

export default function ComplianceDashboard() {
  return (
    <SiteShell centered backendMode hideHeader>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
        <h1 className="text-xl font-bold text-foreground mb-2">Compliance Dashboard</h1>
        <p className="text-sm text-muted-foreground">Coming soon — FMCSA filings, licensing, insurance audits, and regulatory tracking.</p>
      </div>
    </SiteShell>
  );
}
