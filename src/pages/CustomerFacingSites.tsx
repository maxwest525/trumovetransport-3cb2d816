import { Link } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import { ArrowRight, ExternalLink, Globe } from "lucide-react";
import logoImg from "@/assets/logo.png";

const SITES = [
  {
    title: "TruMove Inc",
    description: "Primary company website with full branding and services.",
    href: "/",
  },
  {
    title: "Classic",
    description: "Original TruMove website layout and design.",
    href: "/classic",
  },
  {
    title: "New Color TruMove",
    description: "Redesigned homepage with updated branding and colors.",
    href: "/homepage-2",
  },
];

export default function CustomerFacingSites() {
  return (
    <SiteShell centered backendMode hideHeader>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16 relative">
        <Link
          to="/agent-login"
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          Back to Workspace
        </Link>

        <div className="flex flex-col items-center gap-3 mb-12 z-10">
          <img src={logoImg} alt="TruMove" className="h-8 dark:invert" />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Customer Facing Sites
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Select a site to preview
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-[720px] z-10">
          {SITES.map((site) => (
            <a
              key={site.href}
              href={site.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 ring-2 ring-transparent hover:ring-muted-foreground/20 hover:border-border hover:shadow-[0_12px_40px_-12px_hsl(var(--foreground)/0.15)] transition-all duration-300 text-left overflow-hidden"
            >
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center group-hover:border-foreground/20 transition-colors">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-foreground text-sm">{site.title}</h3>
              </div>
              <p className="relative text-[11px] text-muted-foreground leading-relaxed flex-1">
                {site.description}
              </p>
              <div className="relative mt-auto pt-1">
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-foreground/60 group-hover:text-foreground transition-colors">
                  Open site <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
