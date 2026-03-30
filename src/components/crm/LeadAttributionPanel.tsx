import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe, Monitor, Smartphone, Tablet, Clock, MapPin, MousePointer,
  Eye, BarChart3, MessageSquare, Shield, ChevronDown, ChevronUp,
  Search, Fingerprint, Wifi, Zap, Target, AlertTriangle
} from "lucide-react";

interface LeadAttributionPanelProps {
  leadId: string;
}

interface AttributionRow {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  fbclid: string | null;
  msclkid: string | null;
  referrer_url: string | null;
  landing_page: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  screen_resolution: string | null;
  viewport_size: string | null;
  timezone: string | null;
  browser_language: string | null;
  connection_type: string | null;
  is_touch_device: boolean | null;
  color_depth: number | null;
  hardware_concurrency: number | null;
  do_not_track: boolean | null;
  ad_blocker_detected: boolean | null;
  cookies_enabled: boolean | null;
  pdf_viewer_enabled: boolean | null;
  session_duration_seconds: number | null;
  pages_visited: number | null;
  page_path_history: string[] | null;
  visit_count: number | null;
  tab_blur_count: number | null;
  max_scroll_depth: number | null;
  form_started_at: string | null;
  form_completed_at: string | null;
  lead_source_self_reported: string | null;
  preferred_contact_method: string | null;
  move_urgency: string | null;
  sms_consent: boolean | null;
  sms_consent_timestamp: string | null;
  created_at: string;
  // Behavioral columns
  click_events: any[] | null;
  hover_events: any[] | null;
  cta_interactions: any[] | null;
  form_field_interactions: any[] | null;
  rage_clicks: number | null;
  total_clicks: number | null;
  exit_intent_count: number | null;
  scroll_milestones: number[] | null;
  total_time_on_page: Record<string, number> | null;
  last_activity_at: string | null;
}

function DataRow({ label, value, icon }: { label: string; value: string | null | undefined; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-border/30 last:border-0">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <span className="text-xs text-muted-foreground w-32 shrink-0">{label}</span>
      <span className="text-xs text-foreground font-medium break-all">{value}</span>
    </div>
  );
}

function Section({ title, icon, children, defaultOpen = false, badge }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; badge?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <span className="text-primary">{icon}</span>
        <span className="text-xs font-semibold text-foreground flex-1">{title}</span>
        {badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{badge}</span>}
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="px-3 py-2">{children}</div>}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function LeadAttributionPanel({ leadId }: LeadAttributionPanelProps) {
  const [data, setData] = useState<AttributionRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data: rows, error } = await supabase
        .from("lead_attribution")
        .select("*")
        .eq("lead_id", leadId)
        .limit(1);

      if (!error && rows && rows.length > 0) {
        setData(rows[0] as unknown as AttributionRow);
      }
      setLoading(false);
    }
    fetch();
  }, [leadId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">No attribution data available for this lead.</p>
      </div>
    );
  }

  const deviceIcon = data.device_type === "mobile" ? <Smartphone className="w-3.5 h-3.5" /> :
    data.device_type === "tablet" ? <Tablet className="w-3.5 h-3.5" /> :
    <Monitor className="w-3.5 h-3.5" />;

  const ctaCount = data.cta_interactions?.length || 0;
  const clickCount = data.total_clicks || 0;
  const topCTAs = (data.cta_interactions || [])
    .reduce((acc: Record<string, number>, cta: any) => {
      const key = cta.label || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const totalTimeOnPages = data.total_time_on_page || {};
  const sortedPages = Object.entries(totalTimeOnPages).sort(([, a], [, b]) => (b as number) - (a as number));

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 bg-muted/40 border-b border-border">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-primary" />
          Attribution & Behavioral Intelligence
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Captured {new Date(data.created_at).toLocaleString()}
          {data.last_activity_at && ` · Last active ${new Date(data.last_activity_at).toLocaleString()}`}
        </p>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-4 gap-px bg-border/30">
        {[
          { label: "Clicks", value: clickCount.toString(), icon: <MousePointer className="w-3 h-3" /> },
          { label: "CTAs", value: ctaCount.toString(), icon: <Target className="w-3 h-3" /> },
          { label: "Rage", value: (data.rage_clicks || 0).toString(), icon: <AlertTriangle className="w-3 h-3" /> },
          { label: "Exit Intent", value: (data.exit_intent_count || 0).toString(), icon: <Zap className="w-3 h-3" /> },
        ].map((s) => (
          <div key={s.label} className="bg-card px-2 py-2 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">{s.icon}<span className="text-[9px]">{s.label}</span></div>
            <p className="text-sm font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="p-3 space-y-2">
        {/* Marketing Attribution */}
        <Section title="Marketing Attribution" icon={<Search className="w-3.5 h-3.5" />} defaultOpen>
          <DataRow label="UTM Source" value={data.utm_source} />
          <DataRow label="UTM Medium" value={data.utm_medium} />
          <DataRow label="UTM Campaign" value={data.utm_campaign} />
          <DataRow label="UTM Term" value={data.utm_term} />
          <DataRow label="UTM Content" value={data.utm_content} />
          <DataRow label="Google Click ID" value={data.gclid} />
          <DataRow label="Facebook Click ID" value={data.fbclid} />
          <DataRow label="Microsoft Click ID" value={data.msclkid} />
          {!data.utm_source && !data.gclid && !data.fbclid && !data.msclkid && (
            <p className="text-[10px] text-muted-foreground italic py-1">No campaign tracking detected - likely direct or organic traffic.</p>
          )}
        </Section>

        {/* CTA Interactions */}
        <Section title="CTA Interactions" icon={<Target className="w-3.5 h-3.5" />} badge={ctaCount > 0 ? `${ctaCount}` : undefined}>
          {Object.entries(topCTAs).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(topCTAs).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 15).map(([label, count]) => (
                <div key={label} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
                  <span className="text-[11px] text-foreground truncate max-w-[200px]">{label}</span>
                  <span className="text-[10px] font-bold text-primary">{count as number}×</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground italic py-1">No CTA interactions recorded yet.</p>
          )}
        </Section>

        {/* Time on Page */}
        <Section title="Time on Page" icon={<Clock className="w-3.5 h-3.5" />} badge={sortedPages.length > 0 ? `${sortedPages.length} pages` : undefined}>
          {sortedPages.length > 0 ? (
            <div className="space-y-1">
              {sortedPages.slice(0, 10).map(([path, seconds]) => (
                <div key={path} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
                  <span className="text-[11px] text-foreground font-mono truncate max-w-[180px]">{path}</span>
                  <span className="text-[10px] font-bold text-muted-foreground">{formatDuration(seconds as number)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground italic py-1">No page time data yet.</p>
          )}
        </Section>

        {/* Referrer & Landing */}
        <Section title="Referrer & Landing Page" icon={<Globe className="w-3.5 h-3.5" />}>
          <DataRow label="Referrer URL" value={data.referrer_url} icon={<Globe className="w-3 h-3" />} />
          <DataRow label="Landing Page" value={data.landing_page} icon={<MapPin className="w-3 h-3" />} />
        </Section>

        {/* Device & Environment */}
        <Section title="Device & Environment" icon={deviceIcon}>
          <DataRow label="Device" value={data.device_type} icon={deviceIcon} />
          <DataRow label="Browser" value={data.browser} />
          <DataRow label="OS" value={data.os} />
          <DataRow label="Screen" value={data.screen_resolution} />
          <DataRow label="Viewport" value={data.viewport_size} />
          <DataRow label="Timezone" value={data.timezone} icon={<Clock className="w-3 h-3" />} />
          <DataRow label="Language" value={data.browser_language} />
          <DataRow label="Connection" value={data.connection_type} icon={<Wifi className="w-3 h-3" />} />
          <DataRow label="Touch Device" value={data.is_touch_device ? "Yes" : "No"} />
          <DataRow label="Color Depth" value={data.color_depth ? `${data.color_depth}-bit` : null} />
          <DataRow label="CPU Cores" value={data.hardware_concurrency?.toString()} />
          <DataRow label="Do Not Track" value={data.do_not_track ? "Enabled" : "Disabled"} />
          <DataRow label="Ad Blocker" value={data.ad_blocker_detected ? "Detected" : "Not detected"} />
          <DataRow label="Cookies" value={data.cookies_enabled ? "Enabled" : "Disabled"} />
        </Section>

        {/* Session Behavior */}
        <Section title="Session Behavior" icon={<BarChart3 className="w-3.5 h-3.5" />}>
          <DataRow label="Session Duration" value={data.session_duration_seconds != null ? formatDuration(data.session_duration_seconds) : null} icon={<Clock className="w-3 h-3" />} />
          <DataRow label="Pages Visited" value={data.pages_visited?.toString()} icon={<Eye className="w-3 h-3" />} />
          <DataRow label="Visit Count" value={data.visit_count?.toString()} />
          <DataRow label="Tab Blurs" value={data.tab_blur_count?.toString()} />
          <DataRow label="Max Scroll" value={data.max_scroll_depth != null ? `${data.max_scroll_depth}%` : null} icon={<MousePointer className="w-3 h-3" />} />
          <DataRow label="Scroll Milestones" value={data.scroll_milestones && data.scroll_milestones.length > 0 ? data.scroll_milestones.map(m => `${m}%`).join(", ") : null} />
          <DataRow label="Rage Clicks" value={data.rage_clicks ? `${data.rage_clicks} detected` : "None"} />
          <DataRow label="Exit Intents" value={data.exit_intent_count ? `${data.exit_intent_count} detected` : "None"} />
          {data.page_path_history && data.page_path_history.length > 0 && (
            <div className="mt-1">
              <span className="text-[10px] text-muted-foreground font-medium">Page Path:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.page_path_history.map((p, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-mono">{p}</span>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Form Field Interactions */}
        <Section title="Form Field Interactions" icon={<MessageSquare className="w-3.5 h-3.5" />} badge={data.form_field_interactions?.length ? `${data.form_field_interactions.length}` : undefined}>
          <DataRow label="Form Started" value={data.form_started_at ? new Date(data.form_started_at).toLocaleString() : "Not started"} />
          <DataRow label="Form Completed" value={data.form_completed_at ? new Date(data.form_completed_at).toLocaleString() : "Not completed"} />
          <DataRow label="Self-Reported Source" value={data.lead_source_self_reported} />
          <DataRow label="Contact Preference" value={data.preferred_contact_method} />
          <DataRow label="Move Urgency" value={data.move_urgency} />
          {data.form_field_interactions && data.form_field_interactions.length > 0 && (
            <div className="mt-2">
              <span className="text-[10px] text-muted-foreground font-medium">Field Activity:</span>
              <div className="mt-1 space-y-0.5 max-h-32 overflow-y-auto">
                {(data.form_field_interactions as any[]).filter((f: any) => f.event === "blur" && f.timeSpent).slice(-10).map((f: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-[10px] py-0.5">
                    <span className="text-foreground font-mono">{f.field}</span>
                    <span className="text-muted-foreground">{f.timeSpent ? `${(f.timeSpent / 1000).toFixed(1)}s` : "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Consent */}
        <Section title="Consent & Compliance" icon={<Shield className="w-3.5 h-3.5" />}>
          <DataRow label="SMS Consent" value={data.sms_consent ? "Granted" : "Not granted"} />
          <DataRow label="SMS Consent At" value={data.sms_consent_timestamp ? new Date(data.sms_consent_timestamp).toLocaleString() : null} />
        </Section>
      </div>
    </div>
  );
}
