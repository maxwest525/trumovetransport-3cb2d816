import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteShell from "@/components/layout/SiteShell";
import PortalAuthForm from "@/components/auth/PortalAuthForm";
import {
  Users, BarChart3, Shield, ArrowRight, LogOut, Sparkles,
  DollarSign, Building2, ClipboardCheck, Globe, ExternalLink,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import logoImg from "@/assets/logo.png";
import type { Session } from "@supabase/supabase-js";

const ROLES = [
  {
    id: "admin",
    title: "Admin",
    description: "Full access to team, data, users, integrations, billing, and all settings.",
    icon: Shield,
    href: "/admin/dashboard",
    accent: "from-violet-500/20 to-purple-500/10",
    iconAccent: "text-violet-500",
    ring: "group-hover:ring-violet-500/30",
  },
  {
    id: "agent",
    title: "Agent",
    description: "Manage leads, deals, and customer relationships from your dashboard.",
    icon: Users,
    href: "/agent/pipeline",
    accent: "from-blue-500/20 to-cyan-500/10",
    iconAccent: "text-blue-500",
    ring: "group-hover:ring-blue-500/30",
  },
  {
    id: "manager",
    title: "Manager",
    description: "Monitor team performance, approve changes, and review campaigns.",
    icon: BarChart3,
    href: "/manager/dashboard",
    accent: "from-emerald-500/20 to-green-500/10",
    iconAccent: "text-emerald-500",
    ring: "group-hover:ring-emerald-500/30",
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "AI campaigns, landing pages, analytics, and A/B testing.",
    icon: Sparkles,
    href: "/marketing/dashboard",
    accent: "from-pink-500/20 to-rose-500/10",
    iconAccent: "text-pink-500",
    ring: "group-hover:ring-pink-500/30",
  },
  {
    id: "accounting",
    title: "Accounting",
    description: "Invoices, payroll, expenses, revenue reports, and financial tools.",
    icon: DollarSign,
    href: "/accounting/dashboard",
    accent: "from-teal-500/20 to-cyan-500/10",
    iconAccent: "text-teal-500",
    ring: "group-hover:ring-teal-500/30",
  },
  {
    id: "leads",
    title: "Lead Vendors",
    description: "Manage lead sources, budgets, vendor performance, and ROI.",
    icon: Building2,
    href: "/leads/dashboard",
    accent: "from-orange-500/20 to-yellow-500/10",
    iconAccent: "text-orange-500",
    ring: "group-hover:ring-orange-500/30",
  },
  {
    id: "compliance",
    title: "Compliance",
    description: "FMCSA filings, licensing, insurance audits, and regulatory tracking.",
    icon: ClipboardCheck,
    href: "/compliance/dashboard",
    accent: "from-sky-500/20 to-indigo-500/10",
    iconAccent: "text-sky-500",
    ring: "group-hover:ring-sky-500/30",
  },
];

const STORAGE_KEY = "trumove_remembered_role";

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
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16 relative">

        {/* Top bar: back link */}
        <Link
          to="/"
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          Back to website
        </Link>

        {/* Logo + Header */}
        <div className="flex flex-col items-center gap-3 mb-12 z-10">
          <img src={logoImg} alt="TruMove" className="h-8 dark:invert" />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Workspace
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {session.user.email}
              <button
                onClick={handleSignOut}
                className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="w-3 h-3" /> Sign out
              </button>
            </p>
          </div>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-[960px] z-10">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleClick(role.id, role.href)}
                className={`group relative flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 ring-2 ring-transparent ${role.ring} hover:border-border hover:shadow-[0_12px_40px_-12px_hsl(var(--foreground)/0.15)] transition-all duration-300 text-left overflow-hidden`}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center group-hover:border-foreground/20 transition-colors`}>
                    <Icon className={`w-5 h-5 ${role.iconAccent}`} />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{role.title}</h3>
                </div>

                <p className="relative text-[11px] text-muted-foreground leading-relaxed flex-1">
                  {role.description}
                </p>

                <div className="relative mt-auto pt-1">
                  <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-foreground/60 group-hover:text-foreground transition-colors">
                    Open workspace <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </button>
            );
          })}

          {/* Customer Facing Websites */}
          {[
            { title: "Classic", desc: "Original TruMove website", href: "/classic" },
            { title: "New Color TruMove", desc: "Redesigned homepage with updated branding", href: "/homepage-2" },
          ].map((site) => (
            <a
              key={site.href}
              href={site.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 ring-2 ring-transparent hover:ring-muted-foreground/20 hover:border-border hover:shadow-[0_12px_40px_-12px_hsl(var(--foreground)/0.15)] transition-all duration-300 text-left overflow-hidden"
            >
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center group-hover:border-foreground/20 transition-colors">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-foreground text-sm">{site.title}</h3>
              </div>
              <p className="relative text-[11px] text-muted-foreground leading-relaxed flex-1">{site.desc}</p>
              <div className="relative mt-auto pt-1">
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-foreground/60 group-hover:text-foreground transition-colors">
                  Open site <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Remember checkbox */}
        <label className="flex items-center gap-2.5 mt-10 cursor-pointer select-none z-10">
          <Checkbox
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
            className="border-foreground/20"
          />
          <span className="text-xs text-muted-foreground">Remember my choice on this device</span>
        </label>
      </div>
    </SiteShell>
  );
}
