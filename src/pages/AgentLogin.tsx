import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteShell from "@/components/layout/SiteShell";
import PortalAuthForm from "@/components/auth/PortalAuthForm";
import { LogOut, Bell, Headset, Users, Shield, ArrowRight } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { motion } from "framer-motion";
import type { Session } from "@supabase/supabase-js";

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
    gradient: "from-emerald-500/10 to-emerald-500/5",
    borderHover: "group-hover:border-emerald-500/40",
    iconColor: "text-emerald-500",
    glowColor: "group-hover:shadow-[0_0_40px_-8px_hsl(152,69%,53%,0.25)]",
  },
  {
    key: "managers",
    label: "Managers",
    description: "Team dashboards, coaching & oversight",
    href: "/manager/dashboard",
    icon: Users,
    gradient: "from-blue-500/10 to-blue-500/5",
    borderHover: "group-hover:border-blue-500/40",
    iconColor: "text-blue-500",
    glowColor: "group-hover:shadow-[0_0_40px_-8px_hsl(217,91%,60%,0.25)]",
  },
  {
    key: "admin",
    label: "Admin / Owner",
    description: "Marketing, compliance, accounting & settings",
    href: "/admin/dashboard",
    icon: Shield,
    gradient: "from-amber-500/10 to-amber-500/5",
    borderHover: "group-hover:border-amber-500/40",
    iconColor: "text-amber-500",
    glowColor: "group-hover:shadow-[0_0_40px_-8px_hsl(38,92%,50%,0.25)]",
  },
];

export default function AgentLogin() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
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
      <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 py-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center gap-1.5 mb-16"
        >
          <img src={logoImg} alt="TruMove" className="h-7 dark:invert" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl">
          {PORTALS.map((portal, i) => {
            const Icon = portal.icon;
            return (
              <motion.button
                key={portal.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                onClick={() => navigate(portal.href)}
                className={`group relative flex flex-col items-center text-center gap-4 rounded-2xl border border-border/60 bg-card p-8 pb-7 cursor-pointer transition-all duration-300 ${portal.borderHover} ${portal.glowColor} hover:-translate-y-1`}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${portal.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Icon */}
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-muted/60 group-hover:bg-background flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                    <Icon className={`w-6 h-6 text-muted-foreground ${portal.iconColor.replace('text-', 'group-hover:text-')} transition-colors duration-300`} />
                  </div>
                </div>

                {/* Text */}
                <div className="relative z-10 space-y-1.5">
                  <h2 className="text-[15px] font-semibold text-foreground tracking-tight">{portal.label}</h2>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{portal.description}</p>
                </div>

                {/* Arrow */}
                <div className="relative z-10 mt-1">
                  <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all duration-300 group-hover:translate-x-0.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </SiteShell>
  );
}
