import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteShell from "@/components/layout/SiteShell";
import PortalAuthForm from "@/components/auth/PortalAuthForm";
import { Users, BarChart3, Shield, Crown, ArrowRight, LogOut, Sparkles, DollarSign, Building2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Session } from "@supabase/supabase-js";

const ROLES = [
  {
    id: "owner",
    title: "Owner",
    description: "Full access to everything — team, data, billing, and all settings.",
    icon: Crown,
    href: "/admin/dashboard",
  },
  {
    id: "agent",
    title: "Agent",
    description: "Manage leads, deals, and customer relationships from your personal dashboard.",
    icon: Users,
    href: "/agent/pipeline",
  },
  {
    id: "manager",
    title: "Manager",
    description: "Monitor team performance, approve changes, and review campaign health.",
    icon: BarChart3,
    href: "/manager/dashboard",
  },
  {
    id: "admin",
    title: "Admin",
    description: "Configure users, integrations, branding, and system settings.",
    icon: Shield,
    href: "/admin/dashboard",
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "AI-powered campaigns, landing pages, analytics, and A/B testing.",
    icon: Sparkles,
    href: "/marketing/dashboard",
  },
  {
    id: "accounting",
    title: "Accounting",
    description: "Invoices, payroll, expenses, revenue reports, and financial tools.",
    icon: DollarSign,
    href: "/accounting/dashboard",
  },
  {
    id: "leads",
    title: "Lead Vendors",
    description: "Manage 3rd-party lead sources, budgets, vendor performance, and ROI.",
    icon: Building2,
    href: "/admin/lead-vendors",
  },
];

const STORAGE_KEY = "trumove_remembered_role";

export default function AgentLogin() {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener BEFORE getSession
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
      if (role) {
        navigate(role.href, { replace: true });
      }
    }
    window.scrollTo(0, 0);
  }, [session, navigate]);

  const handleClick = (roleId: string, href: string) => {
    if (remember) {
      localStorage.setItem(STORAGE_KEY, roleId);
    }
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

  // Not authenticated — show login/signup form
  if (!session) {
    return (
      <SiteShell centered backendMode hideHeader>
        <div className="flex items-center justify-center min-h-[60vh] px-4 py-16">
          <PortalAuthForm onAuthenticated={() => {}} />
        </div>
      </SiteShell>
    );
  }

  // Authenticated — show role picker
  return (
    <SiteShell centered backendMode hideHeader>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Choose your workspace</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Signed in as <span className="text-foreground font-medium">{session.user.email}</span>
          <button onClick={handleSignOut} className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-4xl">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleClick(role.id, role.href)}
                className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 hover:border-foreground/20 hover:shadow-md transition-all text-left"
              >
                <Icon className="w-6 h-6 text-foreground" />
                <div>
                  <h3 className="font-semibold text-foreground">{role.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{role.description}</p>
                </div>
                <div className="mt-auto pt-2">
                  <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-foreground text-background group-hover:gap-3 transition-all">
                    Enter {role.title} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 mt-8 cursor-pointer select-none">
          <Checkbox
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
            className="border-muted-foreground/40"
          />
          <span className="text-xs text-muted-foreground">Remember my choice on this device</span>
        </label>
      </div>
    </SiteShell>
  );
}
