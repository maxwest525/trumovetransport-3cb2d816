import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { useLocation } from "react-router-dom";
import { Construction, HelpCircle } from "lucide-react";

const PAGE_INFO: Record<string, { title: string; description: string; hint: string }> = {
  "/marketing/landing-pages": {
    title: "Landing Pages",
    description: "Manage your high-converting landing pages, run A/B tests, and assign pages to campaigns.",
    hint: "A landing page is the page people see after clicking your ad. Using a dedicated landing page instead of your homepage typically doubles your conversion rate.",
  },
  "/marketing/seo": {
    title: "SEO Hub",
    description: "Keyword opportunities, local SEO checklist, blog planner, backlinks, and content calendar.",
    hint: "SEO (Search Engine Optimization) helps your website show up in Google search results without paying for ads. It takes time but delivers the best long-term ROI.",
  },
  "/marketing/ad-copy": {
    title: "Ad Copy Studio",
    description: "Generate, organize, and test ad copy for Google, Meta, YouTube, and more.",
    hint: "Good ad copy is the difference between wasting money and printing money. This tool helps you write compelling headlines and descriptions that get clicks.",
  },
  "/marketing/tracking": {
    title: "Tracking & Attribution",
    description: "UTM builder, conversion events, pixel health, call tracking, and attribution models.",
    hint: "Tracking tells you exactly which ads and keywords are bringing you leads. Without it, you're flying blind and can't optimize your spend.",
  },
  "/marketing/leads": {
    title: "Leads & Pipeline",
    description: "View incoming leads with source attribution, quality scoring, and pipeline stages.",
    hint: "Not all leads are equal. This view helps you see where your best leads come from so you can spend more on what works.",
  },
  "/marketing/reviews": {
    title: "Reviews & Reputation",
    description: "Review request automation, response templates, rating trends, and reputation scoring.",
    hint: "Online reviews directly impact your Google ranking and conversion rates. Companies with 50+ reviews get 2x more leads.",
  },
  "/marketing/automation": {
    title: "Automation Center",
    description: "Speed-to-lead routing, missed-call recovery, after-hours queuing, duplicate suppression, escalation alerts, and webhook flows.",
    hint: "Automation supports your instant-call workflow. Example: a form lead is routed to Convoso within seconds. If not reached, SMS fires automatically. If after hours, the lead queues for the next calling block with an auto-text sent immediately.",
  },
  "/marketing/competitors": {
    title: "Competitor Intel",
    description: "Competitor domains, keyword overlap, ad angles, content gaps, and market positioning.",
    hint: "Understanding what your competitors do well (and poorly) helps you find opportunities they're missing.",
  },
  "/marketing/settings": {
    title: "Settings",
    description: "Brand settings, team roles, campaign defaults, webhook endpoints, and notification preferences.",
    hint: "Configure your Growth Engine defaults so every new campaign starts with the right settings.",
  },
};

export default function GrowthStubPage() {
  const location = useLocation();
  const info = PAGE_INFO[location.pathname] || {
    title: "Coming Soon",
    description: "This section is being built.",
    hint: "Check back soon for updates.",
  };

  return (
    <GrowthEngineShell>
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Construction className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{info.title}</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{info.description}</p>
        </div>
        <div className="bg-primary/5 border border-primary/10 rounded-xl px-5 py-4 text-left max-w-md mx-auto flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">What this does</span>
            <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{info.hint}</p>
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground">Building this section next. Stay tuned.</div>
      </div>
    </GrowthEngineShell>
  );
}
