import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteShell from "@/components/layout/SiteShell";
import PortalAuthForm from "@/components/auth/PortalAuthForm";
import { Settings, Users, BarChart3, Megaphone, Receipt, Package, ShieldCheck, Globe, LogOut, type LucideIcon } from "lucide-react";
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
  icon: LucideIcon;
  href: string;
}

const ROLES: RoleConfig[] = [
  { id: "admin", title: "Admin", description: "Team, data, users, integrations, billing & all settings.", icon: Settings, href: "/admin/dashboard" },
  { id: "agent", title: "Agent", description: "Leads, deals & customer relationships.", icon: Users, href: "/agent/pipeline" },
  { id: "manager", title: "Manager", description: "Team performance, approvals & campaigns.", icon: BarChart3, href: "/manager/dashboard" },
  { id: "marketing", title: "Marketing", description: "AI campaigns, landing pages & A/B testing.", icon: Megaphone, href: "/marketing/dashboard" },
  { id: "accounting", title: "Accounting", description: "Invoices, payroll, expenses & revenue.", icon: Receipt, href: "/accounting/dashboard" },
  { id: "leads", title: "Lead Vendors", description: "Sources, budgets, vendor performance & ROI.", icon: Package, href: "/leads/dashboard" },
  { id: "compliance", title: "Compliance", description: "FMCSA filings, licensing & insurance audits.", icon: ShieldCheck, href: "/compliance/dashboard" },
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
  const Icon = role.icon;
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col gap-2 rounded-xl border border-border/40 bg-card p-4 hover:border-border hover:shadow-md transition-all duration-200 text-left"
    >
      {/* Stat badge */}
      {statLoading ? (
        <div className="absolute top-3 right-3">
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      ) : stat ? (
        <span className="absolute top-3 right-3 text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {stat}
        </span>
      ) : null}

      {/* Icon + Title */}
      <div className="flex items-center gap-2.5">
        <Icon className="w-[18px] h-[18px] text-muted-foreground shrink-0" strokeWidth={1.5} />
        <h3 className="font-semibold text-foreground text-[13px] tracking-tight">{role.title}</h3>
      </div>

      {/* Description */}
      <p className="text-[11px] text-muted-foreground/70 leading-relaxed pl-[30px]">{role.description}</p>
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
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
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
      <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 py-16">

        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-12">
          <img src={logoImg} alt="TruMove" className="h-8 dark:invert" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-3">
            {greeting}, {displayName}
          </h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{session.user.email}</span>
            <span className="text-border">·</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1 hover:text-destructive transition-colors"
            >
              <LogOut className="w-3 h-3" /> Sign out
            </button>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full max-w-[900px]">
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
            className="group relative flex flex-col gap-2 rounded-xl border border-border/40 bg-card p-4 hover:border-border hover:shadow-md transition-all duration-200 text-left"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-[18px] h-[18px] text-muted-foreground shrink-0" strokeWidth={1.5} />
              <h3 className="font-semibold text-foreground text-[13px] tracking-tight">Customer Sites</h3>
            </div>
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed pl-[30px]">Preview & manage public-facing website variants.</p>
          </button>
        </div>

        {/* Remember */}
        <label className="flex items-center gap-2 mt-10 cursor-pointer select-none">
          <Checkbox
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
            className="border-border"
          />
          <span className="text-[11px] text-muted-foreground">Remember my choice on this device</span>
        </label>
      </div>
    </SiteShell>
  );
}
