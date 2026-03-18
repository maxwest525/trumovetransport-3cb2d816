import { useState } from "react";
import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { cn } from "@/lib/utils";
import {
  Check, X, RefreshCw, Settings,
  Plug, Clock, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  role: string;
  group: string;
  description: string;
  connected: boolean;
  lastSync?: string;
  status?: "healthy" | "warning" | "error";
  tag?: string;
}

const INTEGRATION_GROUPS = [
  { id: "traffic", label: "Traffic Sources", desc: "Where paid leads come from" },
  { id: "routing", label: "Lead Routing & Follow-up", desc: "Get leads to agents fast" },
  { id: "research", label: "Research & Support", desc: "Competitive intel and data" },
  { id: "crm", label: "CRM / System of Record", desc: "Where lead data lives" },
];

const INTEGRATIONS: Integration[] = [
  // Traffic
  { id: "google_ads", name: "Google Ads", role: "Primary traffic source", group: "traffic", description: "High-intent search campaigns for interstate moving leads. Keyword, campaign, and conversion data.", connected: true, lastSync: "2 min ago", status: "healthy", tag: "Primary" },
  { id: "meta_ads", name: "Meta Ads", role: "Primary traffic source", group: "traffic", description: "Facebook and Instagram ad performance, instant forms, retargeting, and creative metrics.", connected: true, lastSync: "5 min ago", status: "healthy", tag: "Primary" },

  // Routing
  { id: "convoso", name: "Convoso", role: "Dialer / queue / callback", group: "routing", description: "Instant-call engine. Leads route here via webhook for immediate dial attempts, callback handling, and queue management.", connected: true, lastSync: "Live", status: "healthy", tag: "Essential" },
  { id: "webhooks", name: "Custom Webhooks", role: "Event routing", group: "routing", description: "Send or receive lead events via webhook endpoints. Powers the routing between forms, Convoso, and CRM.", connected: true, lastSync: "Just now", status: "healthy", tag: "Essential" },

  // Research
  { id: "semrush", name: "SEMrush", role: "Keyword & competitor research", group: "research", description: "Keyword rankings, competitor ad spend, backlink analysis. Used for research, not as a traffic source.", connected: false, tag: "Research" },
  { id: "firecrawl", name: "Firecrawl", role: "Page scraping & monitoring", group: "research", description: "Scrape competitor landing pages, monitor changes, extract page structures for analysis.", connected: false, tag: "Research" },
  { id: "ga4", name: "Google Analytics (GA4)", role: "Site analytics", group: "research", description: "Website traffic, behavior flows, and conversion funnels.", connected: true, lastSync: "1 min ago", status: "healthy" },
  { id: "gsc", name: "Search Console", role: "Organic search data", group: "research", description: "Organic impressions, clicks, CTR, and keyword positions.", connected: true, lastSync: "1 hr ago", status: "healthy" },

  // CRM
  { id: "ghl", name: "GoHighLevel (GHL)", role: "CRM / sequences / reporting", group: "crm", description: "Lead management, follow-up sequences, pipeline reporting. Can serve as primary CRM or backup sync.", connected: false, tag: "Recommended" },
  { id: "granot", name: "Granot CRM", role: "System of record", group: "crm", description: "Moving-specific CRM. Sync lead records, move details, and disposition history.", connected: false, tag: "Optional" },
  { id: "custom_crm", name: "Custom CRM / API", role: "Flexible integration", group: "crm", description: "Connect any CRM via REST API. Map fields and configure sync rules.", connected: false, tag: "Flexible" },
];

const OPTIONAL_LATER: Integration[] = [
  { id: "dashclicks", name: "DashClicks", role: "White-label management", group: "routing", description: "Agency campaign management and fulfillment.", connected: false, tag: "Optional" },
  { id: "zapier", name: "Zapier", role: "Automation glue", group: "routing", description: "Connect tools with automated workflows.", connected: false, tag: "Optional" },
  { id: "make", name: "Make (Integromat)", role: "Advanced automation", group: "routing", description: "Multi-step automation builder.", connected: false, tag: "Optional" },
];

function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <div className={cn(
      "bg-card rounded-xl border p-4 transition-all hover:shadow-md",
      integration.connected ? "border-emerald-500/20" : "border-border"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            integration.connected ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
          )}>
            <Plug className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">{integration.name}</span>
              {integration.tag && (
                <span className={cn(
                  "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full",
                  integration.tag === "Primary" ? "bg-primary/10 text-primary" :
                  integration.tag === "Essential" ? "bg-emerald-500/10 text-emerald-600" :
                  integration.tag === "Research" ? "bg-violet-500/10 text-violet-600" :
                  integration.tag === "Recommended" ? "bg-blue-500/10 text-blue-600" :
                  "bg-muted text-muted-foreground"
                )}>{integration.tag}</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{integration.role}</span>
          </div>
        </div>
        {integration.connected ? (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
            <Check className="w-3 h-3" /> Connected
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <X className="w-3 h-3" /> Off
          </span>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground mb-3">{integration.description}</p>

      {integration.lastSync && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
          <Clock className="w-3 h-3" />
          Sync: {integration.lastSync}
        </div>
      )}

      <div className="flex gap-2">
        {integration.connected ? (
          <>
            <button
              onClick={() => toast.info(`Testing ${integration.name}...`)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Test
            </button>
            <button
              onClick={() => toast.info(`Configure ${integration.name}`)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              <Settings className="w-3 h-3" /> Configure
            </button>
          </>
        ) : (
          <button
            onClick={() => toast.success(`${integration.name} setup wizard opened`)}
            className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plug className="w-3 h-3" /> Connect
          </button>
        )}
      </div>
    </div>
  );
}

export default function GrowthIntegrations() {
  const [showOptional, setShowOptional] = useState(false);
  const connectedCount = INTEGRATIONS.filter(i => i.connected).length;

  return (
    <GrowthEngineShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Integrations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your tool stack. {connectedCount}/{INTEGRATIONS.length} connected.
          </p>
        </div>

        {/* Grouped integrations */}
        {INTEGRATION_GROUPS.map(group => {
          const items = INTEGRATIONS.filter(i => i.group === group.id);
          if (items.length === 0) return null;
          const connected = items.filter(i => i.connected).length;
          return (
            <div key={group.id}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
                <span className="text-[10px] text-muted-foreground">{group.desc}</span>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground ml-auto">{connected}/{items.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                {items.map(i => <IntegrationCard key={i.id} integration={i} />)}
              </div>
            </div>
          );
        })}

        {/* Optional Later */}
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowOptional(!showOptional)}
            className="w-full flex items-center justify-between px-4 py-3 text-left bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-muted-foreground">Optional / Future</span>
              <span className="text-[10px] text-muted-foreground">{OPTIONAL_LATER.length} tools</span>
            </div>
            {showOptional ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showOptional && (
            <div className="p-4 space-y-2">
              {OPTIONAL_LATER.map(i => (
                <div key={i.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Plug className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground">{i.name}</span>
                    <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{i.role}</span>
                  </div>
                  <button onClick={() => toast.success(`${i.name} setup opened`)} className="text-[10px] font-medium text-primary hover:underline">Connect</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </GrowthEngineShell>
  );
}
