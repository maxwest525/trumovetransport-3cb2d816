import { useState } from "react";
import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { cn } from "@/lib/utils";
import {
  Check, X, RefreshCw, Settings, HelpCircle,
  Plug, Clock, ChevronDown, ChevronUp,
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
  { id: "traffic", label: "Traffic Sources", desc: "Primary ad platforms" },
  { id: "tracking", label: "Tracking", desc: "Measure and attribute" },
  { id: "routing", label: "Lead Routing", desc: "Get leads to agents fast" },
  { id: "crm", label: "CRM Sync", desc: "System of record" },
];

const INTEGRATIONS: Integration[] = [
  // Traffic
  { id: "google_ads", name: "Google Ads", category: "Advertising", group: "traffic", description: "Campaign data, keyword performance, conversions. Primary source of high-intent interstate moving leads.", dataAvailable: "Campaigns, keywords, clicks, conversions, spend", connected: true, lastSync: "2 min ago", status: "healthy", tag: "Essential" },
  { id: "meta_ads", name: "Meta Ads", category: "Advertising", group: "traffic", description: "Facebook and Instagram ad performance, leads, and creative metrics.", dataAvailable: "Ad sets, creatives, leads, reach, ROAS", connected: true, lastSync: "5 min ago", status: "healthy", tag: "Essential" },

  // Tracking
  { id: "google_analytics", name: "Google Analytics", category: "Analytics", group: "tracking", description: "Website traffic, user behavior, conversion funnels from GA4.", dataAvailable: "Sessions, users, bounce rate, conversion paths", connected: true, lastSync: "15 min ago", status: "healthy", tag: "Essential" },
  { id: "callrail", name: "CallRail", category: "Call Tracking", group: "tracking", description: "Inbound call tracking with source attribution and keyword-level data.", dataAvailable: "Call logs, source attribution, recordings, keywords", connected: true, lastSync: "1 min ago", status: "healthy", tag: "Essential" },
  { id: "gsc", name: "Google Search Console", category: "SEO", group: "tracking", description: "Organic search performance and keyword rankings.", dataAvailable: "Impressions, clicks, CTR, position, indexed pages", connected: true, lastSync: "1 hr ago", status: "healthy" },
  { id: "gtm", name: "Google Tag Manager", category: "Tag Management", group: "tracking", description: "Tag firing status and tracking pixel management.", dataAvailable: "Tag status, firing rules, containers", connected: false, tag: "Recommended" },
  { id: "semrush", name: "SEMrush", category: "SEO", group: "tracking", description: "Keyword research and competitor analysis. Support tool, not a traffic source.", dataAvailable: "Rankings, competitor data, backlinks", connected: false, tag: "Support tool" },

  // Routing
  { id: "convoso", name: "Convoso", category: "Dialer / Speed-to-Lead", group: "routing", description: "Instant-call engine. Leads route here via webhook for immediate call attempts.", dataAvailable: "Queue, dispositions, agents, contact rate, callbacks", connected: true, lastSync: "Live", status: "healthy", tag: "Essential" },
  { id: "webhooks", name: "Custom Webhooks", category: "Developer", group: "routing", description: "Send or receive data via custom webhook endpoints.", dataAvailable: "Event payloads, delivery logs, retry status", connected: true, lastSync: "Just now", status: "healthy" },

  // CRM
  { id: "ghl", name: "GoHighLevel", category: "CRM Sync", group: "crm", description: "Backup sequences and reporting. Optional sync target.", dataAvailable: "Contacts, opportunities, pipeline, sequences", connected: false, tag: "Optional" },
  { id: "granot", name: "Granot CRM", category: "CRM Sync", group: "crm", description: "System of record option. Sync lead records and dispositions.", dataAvailable: "Leads, move details, status history, assignments", connected: false, tag: "Optional" },
  { id: "custom_crm", name: "Custom CRM", category: "CRM Sync", group: "crm", description: "Connect your own CRM via API. Designate as primary per workflow.", dataAvailable: "Configurable via API mapping", connected: false, tag: "Flexible" },
];

const OPTIONAL_LATER: Integration[] = [
  { id: "tiktok", name: "TikTok Ads", category: "Advertising", group: "traffic", description: "Video ad campaigns.", dataAvailable: "Campaigns, impressions, clicks", connected: false, tag: "Coming Soon" },
  { id: "youtube", name: "YouTube Ads", category: "Advertising", group: "traffic", description: "Video ads on YouTube.", dataAvailable: "Views, clicks, conversions", connected: false, tag: "Coming Soon" },
  { id: "microsoft_ads", name: "Microsoft Ads", category: "Advertising", group: "traffic", description: "Bing search ads. Lower CPCs.", dataAvailable: "Campaigns, keywords, clicks", connected: false, tag: "Optional" },
  { id: "linkedin", name: "LinkedIn Ads", category: "Advertising", group: "traffic", description: "B2B and corporate relocation.", dataAvailable: "Campaigns, leads", connected: false, tag: "Coming Soon" },
  { id: "zapier", name: "Zapier", category: "Automation", group: "automation", description: "Connect 5,000+ apps with automated workflows.", dataAvailable: "Triggers, actions, logs", connected: false, tag: "Optional" },
  { id: "make", name: "Make (Integromat)", category: "Automation", group: "automation", description: "Multi-step automation builder.", dataAvailable: "Scenario runs, data transfers", connected: false, tag: "Optional" },
  { id: "dashclicks", name: "DashClicks", category: "Agency", group: "automation", description: "White-label campaign management.", dataAvailable: "Orders, campaigns", connected: false, tag: "Coming Soon" },
  { id: "firecrawl", name: "Firecrawl", category: "Data", group: "automation", description: "Competitor page scraping.", dataAvailable: "Page content, metadata", connected: false, tag: "Optional" },
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
                  integration.tag === "Essential" ? "bg-primary/10 text-primary" :
                  integration.tag === "Recommended" ? "bg-blue-500/10 text-blue-600" :
                  integration.tag === "Support tool" ? "bg-violet-500/10 text-violet-600" :
                  "bg-muted text-muted-foreground"
                )}>{integration.tag}</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{integration.category}</span>
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

      <p className="text-[11px] text-muted-foreground mb-2">{integration.description}</p>

      <div className="bg-muted/50 rounded-lg p-2 mb-2">
        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Data</span>
        <p className="text-[10px] text-foreground mt-0.5">{integration.dataAvailable}</p>
      </div>

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
        ) : integration.tag === "Coming Soon" ? (
          <span className="text-[10px] text-muted-foreground italic">Coming soon</span>
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

function CompactOptionalCard({ integration }: { integration: Integration }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20">
      <div className="flex items-center gap-2 min-w-0">
        <Plug className="w-3 h-3 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">{integration.name}</span>
            {integration.tag && (
              <span className="text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-muted text-muted-foreground">{integration.tag}</span>
            )}
          </div>
        </div>
      </div>
      {integration.tag === "Coming Soon" ? (
        <span className="text-[10px] text-muted-foreground italic shrink-0">Soon</span>
      ) : (
        <button
          onClick={() => toast.success(`${integration.name} setup wizard opened`)}
          className="text-[10px] font-medium text-primary hover:underline shrink-0"
        >
          Connect
        </button>
      )}
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
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Core tools for interstate moving lead generation. {connectedCount}/{INTEGRATIONS.length} connected.
          </p>
        </div>

        {/* Helper */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">How it works</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Ads generate clicks. Landing pages capture leads with attribution. Webhooks route instantly to Convoso for call attempts. CRM gets a synced copy as system of record.
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
              <span className="text-[12px] font-semibold text-muted-foreground">Optional / Advanced</span>
              <span className="text-[10px] text-muted-foreground">{OPTIONAL_LATER.length} additional tools</span>
            </div>
            {showOptional ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showOptional && (
            <div className="p-4 space-y-2">
              <p className="text-[10px] text-muted-foreground mb-3">Add these after your core stack (Google Ads, Meta, CallRail, Convoso) is running well.</p>
              {OPTIONAL_LATER.map(i => <CompactOptionalCard key={i.id} integration={i} />)}
            </div>
          )}
        </div>
      </div>
    </GrowthEngineShell>
  );
}
