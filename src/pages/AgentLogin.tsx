import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteShell from "@/components/layout/SiteShell";
import PortalAuthForm from "@/components/auth/PortalAuthForm";
import { ArrowRight, LogOut } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import logoImg from "@/assets/logo.png";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { usePortalStats } from "@/hooks/usePortalStats";
import type { Session } from "@supabase/supabase-js";

interface RoleConfig {
  id: string;
  title: string;
  description: string;
  emoji: string;
  href: string;
}

const ROLES: RoleConfig[] = [
  { id: "admin", title: "Admin", description: "Team, data, users, integrations, billing & all settings.", emoji: "🛠️", href: "/admin/dashboard" },
  { id: "agent", title: "Agent", description: "Leads, deals & customer relationships.", emoji: "🚚", href: "/agent/pipeline" },
  { id: "manager", title: "Manager", description: "Team performance, approvals & campaigns.", emoji: "📊", href: "/manager/dashboard" },
  { id: "marketing", title: "Marketing", description: "AI campaigns, landing pages & A/B testing.", emoji: "📣", href: "/marketing/dashboard" },
  { id: "accounting", title: "Accounting", description: "Invoices, payroll, expenses & revenue.", emoji: "💰", href: "/accounting/dashboard" },
  { id: "leads", title: "Lead Vendors", description: "Sources, budgets, vendor performance & ROI.", emoji: "📦", href: "/leads/dashboard" },
  { id: "compliance", title: "Compliance", description: "FMCSA filings, licensing & insurance audits.", emoji: "🛡️", href: "/compliance/dashboard" },
];

const STORAGE_KEY = "truemove_remembered_role";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function WorkspaceCard({
  role,
  onClick,
  stat,
  statLoading,
}: {
  role: RoleConfig;
  onClick: () => void;
  stat?: string;
  statLoading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 hover:border-border hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Stat badge */}
      {statLoading ? (
        <div className="absolute top-4 right-4">
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
      ) : stat ? (
        <span className="absolute top-4 right-4 text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {stat}
        </span>
      ) : null}

      {/* Emoji icon */}
      <span className="text-[28px] leading-none group-hover:scale-110 transition-transform duration-300 relative">
        {role.emoji}
      </span>

      {/* Text */}
      <div className="relative flex-1">
        <h3 className="font-bold text-foreground text-[13px] tracking-tight mb-1">{role.title}</h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{role.description}</p>
      </div>

      {/* CTA */}
      <div className="relative flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-foreground/30 group-hover:text-foreground/70 transition-colors uppercase tracking-wider">
          Open
        </span>
        <ArrowRight className="w-3 h-3 text-foreground/30 group-hover:text-foreground/70 group-hover:translate-x-0.5 transition-all duration-200" />
      </div>
    </button>
  );
}

export default function AgentLogin() {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { displayName } = useAgentProfile();
  const { stats, loading: statsLoading } = usePortalStats();
  const greeting = useMemo(() => getGreeting(), []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const role = ROLES.find((r) => r.id === saved);
      if (role) navigate(role.href, { replace: true });
    }
    window.scrollTo(0, 0);
  }, [session, navigate]);

  const handleClick = (roleId: string, href: string) => {
    if (remember) localStorage.setItem(STORAGE_KEY, roleId);
    navigate(href);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
  };

  if (loading) {
    return (
      <SiteShell centered backendMode hideHeader>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      </SiteShell>
    );
  }

  if (!session) {
    return (
      <SiteShell centered backendMode hideHeader>
        <div className="flex items-center justify-center min-h-[60vh] px-4 py-16">
          <PortalAuthForm onAuthenticated={() => {}} />
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell centered backendMode hideHeader>
      <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 py-20 relative overflow-hidden">

        {/* Ambient background blurs */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/[0.04] via-blue-500/[0.03] to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-tl from-emerald-500/[0.03] via-transparent to-transparent rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-16 z-10">
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-primary/[0.08] via-violet-500/[0.04] to-transparent rounded-3xl blur-2xl" />
            <img src={logoImg} alt="TruMove" className="h-10 dark:invert relative" />
          </div>

          <div className="text-center mt-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {greeting}, {displayName}
            </h1>
            <p className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-widest font-medium">Portal</p>
            <p className="text-sm text-muted-foreground/80 mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span className="font-medium text-foreground/70">{session.user.email}</span>
              <span className="text-foreground/10">•</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
              >
                <LogOut className="w-3 h-3" /> Sign out
              </button>
            </p>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-[960px] z-10">
          {ROLES.map((role) => (
            <WorkspaceCard
              key={role.id}
              role={role}
              onClick={() => handleClick(role.id, role.href)}
              stat={stats[role.id]}
              statLoading={statsLoading}
            />
          ))}

          {/* Customer Facing Sites */}
          <button
            onClick={() => navigate("/customer-facing-sites")}
            className="group relative flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 hover:border-border hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="text-[28px] leading-none group-hover:scale-110 transition-transform duration-300 relative">🌐</span>
            <div className="relative flex-1">
              <h3 className="font-bold text-foreground text-[13px] tracking-tight mb-1">Customer Sites</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">Preview & manage public-facing website variants.</p>
            </div>
            <div className="relative flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-foreground/30 group-hover:text-foreground/70 transition-colors uppercase tracking-wider">Open</span>
              <ArrowRight className="w-3 h-3 text-foreground/30 group-hover:text-foreground/70 group-hover:translate-x-0.5 transition-all duration-200" />
            </div>
          </button>
        </div>

        {/* Remember */}
        <label className="flex items-center gap-2.5 mt-14 cursor-pointer select-none z-10">
          <Checkbox
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
            className="border-foreground/15"
          />
          <span className="text-[11px] text-muted-foreground/60">Remember my choice on this device</span>
        </label>
      </div>
    </SiteShell>
  );
}
