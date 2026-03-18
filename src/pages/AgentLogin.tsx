import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteShell from "@/components/layout/SiteShell";
import PortalAuthForm from "@/components/auth/PortalAuthForm";
import { LogOut, Bell, Headset, Users, Shield, Brain, Sparkles } from "lucide-react";
import logoImg from "@/assets/logo.png";
import PortalCard from "@/components/portal/PortalCard";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { motion } from "framer-motion";
import type { Session } from "@supabase/supabase-js";
import AgentToolLauncherModal from "@/components/agent/AgentToolLauncherModal";
import GreenParticles from "@/components/portal/GreenParticles";

const STORAGE_KEY = "truemove_remembered_role";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const PORTALS = [
  {
    key: "agents",
    label: "Agents",
    description: "Dialer, pipeline, customers & operations",
    href: "/agent/dashboard",
    icon: Headset,
    accentHsl: "142 71% 45%",
  },
  {
    key: "managers",
    label: "Managers",
    description: "Team dashboards, coaching & oversight",
    href: "/manager/dashboard",
    icon: Users,
    accentHsl: "217 91% 60%",
  },
  {
    key: "marketing",
    label: "Max's Crazy Marketing Things",
    description: "Ads, landing pages, customer-facing sites, Trudy tools & creative experiments",
    href: "/marketing/dashboard",
    icon: Sparkles,
    accentHsl: "325 84% 54%",
  },
  {
    key: "admin",
    label: "Admin / Owner",
    description: "Overhead, expenses, invoices, vendors, payroll, compliance & settings",
    href: "/admin/dashboard",
    icon: Shield,
    accentHsl: "38 92% 50%",
  },
  {
    key: "pulse",
    label: "Pulse Command",
    description: "PulseAI Compliance Beta",
    href: "/pulse",
    icon: Brain,
    accentHsl: "0 72% 51%",
  },
];

export default function AgentLogin() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const { displayName } = useAgentProfile();
  const { unreadCount } = useNotifications();
  const greeting = useMemo(() => getGreeting(), []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
  };

  // Shared page wrapper with shimmery gray bg + particles
  const PageShell = ({ children }: { children: React.ReactNode }) => (
    <SiteShell centered backendMode hideHeader>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[hsl(220,10%,92%)] via-[hsl(220,8%,88%)] to-[hsl(220,12%,85%)]">
        {/* Shimmery metallic sheen overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_hsla(220,15%,98%,0.4)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,_hsla(142,30%,90%,0.2)_0%,_transparent_50%)]" />
        <GreenParticles />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </SiteShell>
  );

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-screen px-4 py-16">
          <PortalAuthForm onAuthenticated={() => {}} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center gap-1.5 mb-16"
        >
          <img src={logoImg} alt="TruMove" className="h-7" />
          <h1 className="text-lg font-semibold tracking-tight text-foreground mt-2 flex items-center gap-2">
            {greeting}, {displayName}
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5 text-[9px] font-semibold">
                <Bell className="w-2.5 h-2.5" />
                {unreadCount}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{session.user.email}</span>
            <span className="text-border">·</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1 hover:text-destructive transition-colors"
            >
              <LogOut className="w-3 h-3" /> Sign out
            </button>
          </div>
        </motion.div>

        {/* Portal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {PORTALS.map((portal, i) => (
            <PortalCard
              key={portal.key}
              label={portal.label}
              description={portal.description}
              icon={portal.icon}
              accentHsl={portal.accentHsl}
              index={i}
              onClick={() => {
                if (portal.key === "agents") {
                  setLauncherOpen(true);
                } else {
                  navigate(portal.href);
                }
              }}
            />
          ))}
        </div>

        <AgentToolLauncherModal open={launcherOpen} onOpenChange={setLauncherOpen} />
      </div>
    </PageShell>
  );
}
