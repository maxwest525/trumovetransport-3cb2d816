import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteShell from "@/components/layout/SiteShell";
import PortalAuthForm from "@/components/auth/PortalAuthForm";
import {
  Truck, LayoutGrid, TrendingUp, Megaphone, ArrowRight, LogOut,
  Receipt, Container, ShieldCheck, Globe, LucideIcon,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import logoImg from "@/assets/logo.png";
import type { Session } from "@supabase/supabase-js";

interface RoleConfig {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  iconColor: string;
  shadowColor: string;
}

const ROLES: RoleConfig[] = [
  {
    id: "admin",
    title: "Admin",
    description: "Team, data, users, integrations, billing & all settings.",
    icon: LayoutGrid,
    href: "/admin/dashboard",
    gradient: "from-violet-600 to-purple-600",
    iconColor: "text-white",
    shadowColor: "shadow-violet-500/25",
  },
  {
    id: "agent",
    title: "Agent",
    description: "Leads, deals & customer relationships.",
    icon: Truck,
    href: "/agent/pipeline",
    gradient: "from-blue-600 to-cyan-600",
    iconColor: "text-white",
    shadowColor: "shadow-blue-500/25",
  },
  {
    id: "manager",
    title: "Manager",
    description: "Team performance, approvals & campaigns.",
    icon: TrendingUp,
    href: "/manager/dashboard",
    gradient: "from-emerald-600 to-green-600",
    iconColor: "text-white",
    shadowColor: "shadow-emerald-500/25",
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "AI campaigns, landing pages & A/B testing.",
    icon: Megaphone,
    href: "/marketing/dashboard",
    gradient: "from-pink-600 to-rose-600",
    iconColor: "text-white",
    shadowColor: "shadow-pink-500/25",
  },
  {
    id: "accounting",
    title: "Accounting",
    description: "Invoices, payroll, expenses & revenue.",
    icon: Receipt,
    href: "/accounting/dashboard",
    gradient: "from-teal-600 to-cyan-600",
    iconColor: "text-white",
    shadowColor: "shadow-teal-500/25",
  },
  {
    id: "leads",
    title: "Lead Vendors",
    description: "Sources, budgets, vendor performance & ROI.",
    icon: Container,
    href: "/leads/dashboard",
    gradient: "from-orange-600 to-amber-600",
    iconColor: "text-white",
    shadowColor: "shadow-orange-500/25",
  },
  {
    id: "compliance",
    title: "Compliance",
    description: "FMCSA filings, licensing & insurance audits.",
    icon: ShieldCheck,
    href: "/compliance/dashboard",
    gradient: "from-sky-600 to-indigo-600",
    iconColor: "text-white",
    shadowColor: "shadow-sky-500/25",
  },
];

const STORAGE_KEY = "truemove_remembered_role";

function WorkspaceCard({ role, onClick }: { role: RoleConfig; onClick: () => void }) {
  const Icon = role.icon;
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col gap-5 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 hover:border-border hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon with colored gradient bg */}
      <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${role.gradient} ${role.shadowColor} shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-5 h-5 ${role.iconColor}`} strokeWidth={2} />
      </div>

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
        <div className="flex flex-col items-center gap-5 mb-16 z-10">
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-primary/[0.08] via-violet-500/[0.04] to-transparent rounded-3xl blur-2xl" />
            <img src={logoImg} alt="TruMove" className="h-10 dark:invert relative" />
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Portal
            </h1>
            <p className="text-sm text-muted-foreground/80 mt-2 flex items-center justify-center gap-2 flex-wrap">
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
            />
          ))}

          {/* Customer Facing Sites */}
          <button
            onClick={() => navigate("/customer-facing-sites")}
            className="group relative flex flex-col gap-5 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 hover:border-border hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-900 dark:from-neutral-300 dark:to-neutral-500 shadow-lg shadow-foreground/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-5 h-5 text-white dark:text-neutral-900" strokeWidth={2} />
            </div>
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
