import { Link } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import { ArrowLeft, ExternalLink, Globe, Palette, Layout, Sparkles } from "lucide-react";
import logoImg from "@/assets/logo.png";

const SITES = [
  {
    title: "TruMove Inc",
    description: "Primary company website — full branding, services, and lead capture.",
    href: "/site",
    icon: Globe,
    accent: "from-emerald-500/20 to-green-500/10",
    iconColor: "text-emerald-500",
    ring: "group-hover:ring-emerald-500/25",
    badge: "Live",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  {
    title: "Classic",
    description: "Original layout and design — legacy branding for returning visitors.",
    href: "/classic",
    icon: Layout,
    accent: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-500",
    ring: "group-hover:ring-blue-500/25",
    badge: "V1",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    title: "New Color TruMove",
    description: "Redesigned homepage with updated palette and modern aesthetic.",
    href: "/homepage-2",
    icon: Palette,
    accent: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-500",
    ring: "group-hover:ring-violet-500/25",
    badge: "Beta",
    badgeColor: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  },
];

export default function CustomerFacingSites() {
  return (
    <SiteShell centered backendMode hideHeader>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16 relative">

        {/* Back link */}
        <Link
          to="/"
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Workspace
        </Link>

        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-14 z-10">
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl" />
            <img src={logoImg} alt="TruMove" className="h-9 dark:invert relative" />
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] mb-3">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Site Manager
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Customer Facing Sites
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Preview, compare, and launch your public-facing website variants
            </p>
          </div>
        </div>

        {/* Site cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-[820px] z-10">
          {SITES.map((site) => {
            const Icon = site.icon;
            return (
              <a
                key={site.href}
                href={site.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 ring-2 ring-transparent ${site.ring} hover:border-border hover:shadow-[0_16px_48px_-12px_hsl(var(--foreground)/0.12)] transition-all duration-300 text-left overflow-hidden`}
              >
                {/* Gradient bg */}
                <div className={`absolute inset-0 bg-gradient-to-br ${site.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Top row: icon + badge */}
                <div className="relative flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-foreground/[0.05] border border-foreground/10 flex items-center justify-center group-hover:border-foreground/20 transition-colors">
                    <Icon className={`w-5 h-5 ${site.iconColor}`} />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${site.badgeColor}`}>
                    {site.badge}
                  </span>
                </div>

                {/* Title + description */}
                <div className="relative flex-1">
                  <h3 className="font-bold text-foreground text-sm mb-1.5">{site.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {site.description}
                  </p>
                </div>

                {/* CTA */}
                <div className="relative pt-2 border-t border-foreground/[0.06]">
                  <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-foreground/50 group-hover:text-foreground transition-colors">
                    Preview site
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        {/* Footer hint */}
        <p className="text-[10px] text-muted-foreground/60 mt-10 z-10">
          Sites open in a new tab — your workspace stays here
        </p>
      </div>
    </SiteShell>
  );
}
