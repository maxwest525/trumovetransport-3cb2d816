import { Link } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import { ArrowRight } from "lucide-react";

export default function Demo() {
  return (
    <SiteShell centered>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Agent Login — Compare</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Click either card to view that version. Then come back here and tell me what to change.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
          <Link
            to="/agent-login-old"
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">Old Version</span>
            <span className="text-sm text-muted-foreground text-center">Pre-overhaul agent login</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-2" />
          </Link>

          <Link
            to="/"
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">New Version</span>
            <span className="text-sm text-muted-foreground text-center">Current overhauled login</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-2" />
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
