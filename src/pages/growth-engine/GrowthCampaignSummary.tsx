import GrowthEngineShell from "@/components/layout/GrowthEngineShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, ArrowRight, BarChart3, Phone, FileText, Globe,
  MapPin, DollarSign, Tag, Zap, Eye, Target, TrendingUp,
  Clock, Shield, AlertTriangle, Activity, ExternalLink
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function GrowthCampaignSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const campaign = location.state?.campaign;

  // Fallback if navigated directly
  if (!campaign) {
    return (
      <GrowthEngineShell>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <p className="text-sm text-muted-foreground">No campaign data found.</p>
          <Button variant="outline" onClick={() => navigate("/marketing/campaigns")}>
            Go to Campaign Builder
          </Button>
        </div>
      </GrowthEngineShell>
    );
  }

  const FLOW_STEPS = [
    { label: "Ad Click", sub: campaign.platforms },
    { label: "Landing Page", sub: campaign.landingPage },
    { label: "Form / Call", sub: "Lead capture" },
    { label: "Attribution", sub: "UTM captured" },
    { label: "Webhook", sub: "Instant route" },
    { label: "Convoso", sub: "Agent dials", highlight: true },
    { label: "CRM Sync", sub: "Record saved" },
  ];

  const WATCH_FIRST = [
    { kpi: "Cost per Lead", why: "Are you paying too much per form or call?", icon: DollarSign },
    { kpi: "Form / Call Rate", why: "Is the landing page converting clicks into leads?", icon: BarChart3 },
    { kpi: "Speed-to-Lead", why: "How fast are leads getting called after submitting?", icon: Clock },
    { kpi: "Booked Rate", why: "Are leads turning into actual booked jobs?", icon: CheckCircle2 },
  ];

  const NEXT_STEPS = [
    { action: "Check tracking is firing", link: "/marketing/tracking", label: "Tracking" },
    { action: "Watch leads come in", link: "/marketing/leads", label: "Leads" },
    { action: "Verify Convoso routing", link: "/marketing/automation", label: "Automation" },
    { action: "Review after 50-100 clicks", link: "/marketing/dashboard", label: "Dashboard" },
  ];

  return (
    <GrowthEngineShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h1 className="text-xl font-bold text-foreground">Campaign Created</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {campaign.name || "Interstate Moving Campaign"} is ready for launch
            </p>
          </div>
          <Badge className="bg-green-500/10 text-green-600 border-0 text-xs">Active</Badge>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Goal", value: campaign.goal, icon: Target },
            { label: "Platforms", value: campaign.platforms, icon: Globe },
            { label: "Origin Markets", value: campaign.geoMode, icon: MapPin },
            { label: "Daily Budget", value: `$${campaign.budget}/day`, icon: DollarSign },
            { label: "Keywords", value: campaign.keywords, icon: Tag },
            { label: "Landing Page", value: campaign.landingPage, icon: FileText },
          ].map(item => {
            const Icon = item.icon;
            return (
              <Card key={item.label}>
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{item.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground truncate">{item.value || "Not set"}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lead Flow */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Lead Flow</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {FLOW_STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className={`px-2.5 py-1.5 rounded-md text-center ${
                    s.highlight ? "bg-green-500/10 ring-1 ring-green-500/20" : "bg-background border"
                  }`}>
                    <span className={`text-[11px] font-semibold block ${s.highlight ? "text-green-600" : "text-foreground"}`}>{s.label}</span>
                    <span className="text-[9px] text-muted-foreground">{s.sub}</span>
                  </div>
                  {i < FLOW_STEPS.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Leads are captured on your landing page, attributed with UTMs, then routed via webhook to Convoso for instant agent contact.
            </p>
          </CardContent>
        </Card>

        {/* Routing Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-green-500/20">
            <CardContent className="p-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-semibold text-foreground">Business Hours</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Lead routed to Convoso instantly. Agent dials within seconds.</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20">
            <CardContent className="p-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-foreground">After Hours</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Queued for next calling block. Auto-text sent to lead confirming receipt.</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20">
            <CardContent className="p-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-foreground">If Unreached</span>
              </div>
              <p className="text-[11px] text-muted-foreground">SMS recovery triggered. Escalation alert if no contact within threshold.</p>
            </CardContent>
          </Card>
        </div>

        {/* KPIs to Watch */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <span className="text-sm font-semibold text-foreground">KPIs to Watch First</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {WATCH_FIRST.map(kpi => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.kpi} className="p-3 rounded-lg bg-muted/30 border space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground">{kpi.kpi}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{kpi.why}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* What to Do Next */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <span className="text-sm font-semibold text-foreground">What to Do Next</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {NEXT_STEPS.map((ns, i) => (
                <Link
                  key={ns.action}
                  to={ns.link}
                  className="flex items-center gap-2 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-foreground">{ns.action}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto shrink-0" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evolution */}
        <div className="text-center py-2">
          <p className="text-[11px] text-muted-foreground">
            After 50-100 clicks: review performance, pause weak keywords/pages, scale what converts.
          </p>
        </div>
      </div>
    </GrowthEngineShell>
  );
}
