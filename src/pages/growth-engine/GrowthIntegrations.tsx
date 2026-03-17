import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { cn } from "@/lib/utils";
import {
  Check, X, RefreshCw, Settings, HelpCircle,
  Plug, Clock,
} from "lucide-react";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  category: string;
  group: string;
  description: string;
  dataAvailable: string;
  connected: boolean;
  lastSync?: string;
  status?: "healthy" | "warning" | "error";
  tag?: string;
}

const INTEGRATION_GROUPS = [
  { id: "traffic", label: "Traffic Sources", desc: "Where your leads come from" },
  { id: "tracking", label: "Tracking", desc: "Measure and attribute everything" },
  { id: "routing", label: "Lead Routing", desc: "Get leads to your team instantly" },
  { id: "crm", label: "CRM Sync", desc: "System of record (pick one primary)" },
  { id: "automation", label: "Automation / Support", desc: "Optional workflows and tools" },
];

const INTEGRATIONS: Integration[] = [
  // Traffic Sources
  { id: "google_ads", name: "Google Ads", category: "Advertising", group: "traffic", description: "Import campaign data, keyword performance, and conversion tracking. Your primary source of high-intent moving leads.", dataAvailable: "Campaigns, keywords, clicks, conversions, spend, quality scores", connected: true, lastSync: "2 min ago", status: "healthy", tag: "Essential" },
  { id: "meta_ads", name: "Meta Ads", category: "Advertising", group: "traffic", description: "Sync Facebook and Instagram ad performance including leads, reach, and creative metrics.", dataAvailable: "Ad sets, creatives, leads, reach, frequency, CPM, ROAS", connected: true, lastSync: "5 min ago", status: "healthy", tag: "Essential" },
  { id: "tiktok", name: "TikTok Ads", category: "Advertising", group: "traffic", description: "Import TikTok ad campaign performance and audience data.", dataAvailable: "Campaigns, impressions, clicks, conversions, video views", connected: false, tag: "Coming Soon" },
  { id: "microsoft_ads", name: "Microsoft Ads", category: "Advertising", group: "traffic", description: "Sync Bing/Microsoft Search ad campaigns. Lower CPCs, older demographic.", dataAvailable: "Campaigns, keywords, clicks, conversions", connected: false, tag: "Optional" },
  { id: "linkedin", name: "LinkedIn Ads", category: "Advertising", group: "traffic", description: "LinkedIn ad campaign performance for B2B or corporate relocation.", dataAvailable: "Campaigns, leads, impressions", connected: false, tag: "Coming Soon" },

  // Tracking
  { id: "google_analytics", name: "Google Analytics", category: "Analytics", group: "tracking", description: "Pull website traffic data, user behavior, and conversion funnels from GA4.", dataAvailable: "Sessions, users, bounce rate, conversion paths, traffic sources", connected: true, lastSync: "15 min ago", status: "healthy", tag: "Essential" },
  { id: "callrail", name: "CallRail", category: "Call Tracking", group: "tracking", description: "Track inbound calls with source attribution, call recordings, and keyword-level tracking.", dataAvailable: "Call logs, source attribution, recordings, keywords, caller data", connected: true, lastSync: "1 min ago", status: "healthy", tag: "Essential" },
  { id: "gtm", name: "Google Tag Manager", category: "Tag Management", group: "tracking", description: "Monitor tag firing status and manage tracking pixels across your site.", dataAvailable: "Tag status, firing rules, container versions", connected: false, tag: "Recommended" },
  { id: "gsc", name: "Google Search Console", category: "SEO", group: "tracking", description: "View organic search performance, keyword rankings, and indexing status.", dataAvailable: "Impressions, clicks, CTR, average position, indexed pages", connected: true, lastSync: "1 hr ago", status: "healthy" },
  { id: "semrush", name: "SEMrush", category: "SEO", group: "tracking", description: "Access keyword research, competitor analysis, backlink data, and site audit results.", dataAvailable: "Keyword rankings, competitor traffic, backlinks, site health", connected: false, tag: "Recommended" },

  // Lead Routing
  { id: "convoso", name: "Convoso", category: "Dialer / Speed-to-Lead", group: "routing", description: "Your instant-call engine. Leads are routed here via webhook for immediate call attempts within seconds of submission. This is the primary destination for all new leads.", dataAvailable: "Call queue, dispositions, agent status, dial attempts, contact rate, callback scheduling", connected: true, lastSync: "Live", status: "healthy", tag: "Essential" },
  { id: "webhooks", name: "Custom Webhooks", category: "Developer", group: "routing", description: "Send or receive data via custom webhook endpoints for any platform.", dataAvailable: "Event payloads, delivery logs, retry status", connected: true, lastSync: "Just now", status: "healthy" },

  // CRM Sync
  { id: "ghl", name: "GoHighLevel", category: "CRM Sync", group: "crm", description: "Mirror leads and pipeline data to GoHighLevel for backup sequences and reporting. Optional secondary sync target.", dataAvailable: "Contacts, opportunities, pipeline stages, SMS/email sequences", connected: false, tag: "Optional" },
  { id: "granot", name: "Granot CRM", category: "CRM Sync", group: "crm", description: "Sync lead records and disposition data to Granot as your system of record.", dataAvailable: "Lead records, move details, status history, agent assignments", connected: false, tag: "Optional" },
  { id: "custom_crm", name: "Custom CRM / System of Record", category: "CRM Sync", group: "crm", description: "Connect your own CRM via API. Designate one CRM as primary per workflow.", dataAvailable: "Configurable via API mapping", connected: false, tag: "Flexible" },

  // Automation
  { id: "zapier", name: "Zapier", category: "Automation", group: "automation", description: "Connect 5,000+ apps with automated workflows triggered by events.", dataAvailable: "Webhook triggers, action logs, error reports", connected: false, tag: "Optional" },
  { id: "make", name: "Make (Integromat)", category: "Automation", group: "automation", description: "Build complex multi-step automations with visual workflow builder.", dataAvailable: "Scenario runs, data transfers, error logs", connected: false, tag: "Optional" },
  { id: "dashclicks", name: "DashClicks", category: "Agency", group: "automation", description: "White-label fulfillment and campaign management integration.", dataAvailable: "Orders, campaigns, fulfillment status", connected: false, tag: "Coming Soon" },
  { id: "firecrawl", name: "Firecrawl", category: "Data", group: "automation", description: "Scrape competitor websites, landing pages, and review sites for intelligence.", dataAvailable: "Page content, metadata, structured data", connected: false, tag: "Optional" },
];

function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <div className={cn(
      "bg-card rounded-xl border p-5 transition-all hover:shadow-md",
      integration.connected ? "border-emerald-500/20" : "border-border"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold",
            integration.connected ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
          )}>
            <Plug className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{integration.name}</span>
              {integration.tag && (
                <span className={cn(
                  "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full",
                  integration.tag === "Essential" ? "bg-primary/10 text-primary" :
                  integration.tag === "Recommended" ? "bg-blue-500/10 text-blue-600" :
                  integration.tag === "Coming Soon" ? "bg-muted text-muted-foreground" :
                  "bg-muted text-muted-foreground"
                )}>{integration.tag}</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{integration.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {integration.connected ? (
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
              <Check className="w-3 h-3" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <X className="w-3 h-3" /> Not connected
            </span>
          )}
        </div>
      </div>

      <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">{integration.description}</p>

      <div className="bg-muted/50 rounded-lg p-2.5 mb-3">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Data available</span>
        <p className="text-[11px] text-foreground mt-0.5">{integration.dataAvailable}</p>
      </div>

      {integration.lastSync && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-3">
          <Clock className="w-3 h-3" />
          Last sync: {integration.lastSync}
        </div>
      )}

      <div className="flex gap-2">
        {integration.connected ? (
          <>
            <button
              onClick={() => toast.info(`Testing ${integration.name} connection...`)}
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
        ) : integration.tag === "Coming Soon" ? (
          <span className="text-[11px] text-muted-foreground italic">Available in a future update</span>
        ) : (
          <button
            onClick={() => toast.success(`${integration.name} connection wizard opened`)}
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
  const connectedCount = INTEGRATIONS.filter(i => i.connected).length;

  return (
    <GrowthEngineShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your marketing tools and lead routing systems. {connectedCount} of {INTEGRATIONS.length} connected.
          </p>
        </div>

        {/* Helper */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">How lead routing works</span>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Leads flow from your ad platforms and landing pages through attribution capture, then route instantly via webhook to Convoso for immediate call attempts. Your CRM (GHL, Granot, or custom) receives a synced copy as the system of record. One CRM should be designated as primary per workflow.
            </p>
          </div>
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
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground ml-auto">{connected}/{items.length} connected</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                {items.map(i => <IntegrationCard key={i.id} integration={i} />)}
              </div>
            </div>
          );
        })}
      </div>
    </GrowthEngineShell>
  );
}
