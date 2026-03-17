import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { cn } from "@/lib/utils";
import {
  Check, X, RefreshCw, Settings, ExternalLink, HelpCircle,
  Plug, Zap, Clock,
} from "lucide-react";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  dataAvailable: string;
  connected: boolean;
  lastSync?: string;
  status?: "healthy" | "warning" | "error";
  tag?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "google_ads", name: "Google Ads", category: "Advertising", description: "Import campaign data, keyword performance, and conversion tracking from Google Ads.", dataAvailable: "Campaigns, keywords, clicks, conversions, spend, quality scores", connected: true, lastSync: "2 min ago", status: "healthy", tag: "Essential" },
  { id: "meta_ads", name: "Meta Ads", category: "Advertising", description: "Sync Facebook and Instagram ad performance including leads, reach, and creative metrics.", dataAvailable: "Ad sets, creatives, leads, reach, frequency, CPM, ROAS", connected: true, lastSync: "5 min ago", status: "healthy", tag: "Essential" },
  { id: "google_analytics", name: "Google Analytics", category: "Analytics", description: "Pull website traffic data, user behavior, and conversion funnels from GA4.", dataAvailable: "Sessions, users, bounce rate, conversion paths, traffic sources", connected: true, lastSync: "15 min ago", status: "healthy" },
  { id: "gtm", name: "Google Tag Manager", category: "Tracking", description: "Monitor tag firing status and manage tracking pixels across your site.", dataAvailable: "Tag status, firing rules, container versions", connected: false, tag: "Recommended" },
  { id: "gsc", name: "Google Search Console", category: "SEO", description: "View organic search performance, keyword rankings, and indexing status.", dataAvailable: "Impressions, clicks, CTR, average position, indexed pages", connected: true, lastSync: "1 hr ago", status: "healthy" },
  { id: "semrush", name: "SEMrush", category: "SEO", description: "Access keyword research, competitor analysis, backlink data, and site audit results.", dataAvailable: "Keyword rankings, competitor traffic, backlinks, site health", connected: false, tag: "Recommended" },
  { id: "ghl", name: "GoHighLevel", category: "CRM", description: "Sync leads, pipeline stages, and follow-up sequences with your CRM.", dataAvailable: "Contacts, opportunities, pipeline stages, SMS/email sequences", connected: true, lastSync: "3 min ago", status: "warning" },
  { id: "callrail", name: "CallRail", category: "Call Tracking", description: "Track inbound calls with source attribution, call recordings, and keyword tracking.", dataAvailable: "Call logs, source attribution, recordings, keywords, caller data", connected: false, tag: "Recommended" },
  { id: "zapier", name: "Zapier", category: "Automation", description: "Connect 5,000+ apps with automated workflows (Zaps) triggered by events.", dataAvailable: "Webhook triggers, action logs, error reports", connected: false },
  { id: "make", name: "Make (Integromat)", category: "Automation", description: "Build complex multi-step automations with visual workflow builder.", dataAvailable: "Scenario runs, data transfers, error logs", connected: false },
  { id: "webhooks", name: "Custom Webhooks", category: "Developer", description: "Send or receive data via custom webhook endpoints for any platform.", dataAvailable: "Event payloads, delivery logs, retry status", connected: true, lastSync: "Just now", status: "healthy" },
  { id: "dashclicks", name: "DashClicks", category: "Agency", description: "White-label fulfillment and campaign management integration.", dataAvailable: "Orders, campaigns, fulfillment status", connected: false, tag: "Coming Soon" },
  { id: "firecrawl", name: "Firecrawl", category: "Data", description: "Scrape competitor websites, landing pages, and review sites for intelligence.", dataAvailable: "Page content, metadata, structured data", connected: false },
  { id: "tiktok", name: "TikTok Ads", category: "Advertising", description: "Import TikTok ad campaign performance and audience data.", dataAvailable: "Campaigns, impressions, clicks, conversions, video views", connected: false, tag: "Coming Soon" },
  { id: "microsoft_ads", name: "Microsoft Ads", category: "Advertising", description: "Sync Bing/Microsoft Search ad campaigns and performance data.", dataAvailable: "Campaigns, keywords, clicks, conversions, audience data", connected: false },
  { id: "linkedin", name: "LinkedIn Ads", category: "Advertising", description: "Import LinkedIn ad campaign performance for B2B targeting.", dataAvailable: "Campaigns, leads, impressions, company targeting", connected: false, tag: "Coming Soon" },
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
          {integration.status === "warning" && (
            <span className="text-amber-500 font-medium ml-1">Sync delayed</span>
          )}
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
  const categories = [...new Set(INTEGRATIONS.map(i => i.category))];
  const connectedCount = INTEGRATIONS.filter(i => i.connected).length;

  return (
    <GrowthEngineShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your marketing tools. {connectedCount} of {INTEGRATIONS.length} connected.
          </p>
        </div>

        {/* Helper */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">What this does</span>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Integrations connect your ad platforms, analytics tools, and CRM so all your data flows into one place. Start with the "Essential" ones, then add more as you grow.
            </p>
          </div>
        </div>

        {/* Summary bar */}
        <div className="flex gap-3 overflow-x-auto pb-1">
          {categories.map(cat => {
            const items = INTEGRATIONS.filter(i => i.category === cat);
            const connected = items.filter(i => i.connected).length;
            return (
              <div key={cat} className="bg-card rounded-lg border border-border px-3 py-2 whitespace-nowrap">
                <span className="text-[11px] font-medium text-foreground">{cat}</span>
                <span className="text-[10px] text-muted-foreground ml-2">{connected}/{items.length}</span>
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {INTEGRATIONS.map(i => <IntegrationCard key={i.id} integration={i} />)}
        </div>
      </div>
    </GrowthEngineShell>
  );
}
