import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteShell from "@/components/layout/SiteShell";
import PortalAuthForm from "@/components/auth/PortalAuthForm";
import { LogOut, Bell, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import logoImg from "@/assets/logo.png";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { motion } from "framer-motion";
import type { Session } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface LinkItem {
  label: string;
  href: string;
}

interface Section {
  key: string;
  title: string;
  allowedRoles: string[];
  links: LinkItem[];
}

const SECTIONS: Section[] = [
  {
    key: "agents",
    title: "Agents",
    allowedRoles: ["owner", "admin", "manager", "agent"],
    links: [
      { label: "Convoso Dialer", href: "/tools/convoso" },
      { label: "RingCentral", href: "/tools/ringcentral" },
      { label: "Granot CRM", href: "/tools/granot" },
      { label: "Dashboard", href: "/agent/dashboard" },
      { label: "Pipeline", href: "/agent/pipeline" },
      { label: "Dialer", href: "/agent/dialer" },
      { label: "E-Sign", href: "/agent/esign" },
      { label: "Customers", href: "/agent/customers" },
      { label: "Operations", href: "/agent/operations" },
      { label: "Team Chat", href: "/agent/team-chat" },
    ],
  },
  {
    key: "managers",
    title: "Managers",
    allowedRoles: ["owner", "admin", "manager"],
    links: [
      { label: "Convoso Admin", href: "/tools/convoso-admin" },
      { label: "RingCentral Admin", href: "/tools/ringcentral-admin" },
      { label: "Granot Manager", href: "/tools/granot-manager" },
      { label: "PulseOS", href: "/tools/pulseos" },
      { label: "Team Dashboard", href: "/manager/dashboard" },
      { label: "Coaching", href: "/coaching" },
    ],
  },
  {
    key: "admin",
    title: "Admin / Owner",
    allowedRoles: ["owner", "admin"],
    links: [
      { label: "Admin Dashboard", href: "/admin/dashboard" },
      { label: "Marketing Suite", href: "/marketing/dashboard" },
      { label: "Customer Sites", href: "/customer-facing-sites" },
      { label: "Compliance", href: "/compliance/dashboard" },
      { label: "Accounting", href: "/accounting/dashboard" },
      { label: "Lead Vendors", href: "/leads/dashboard" },
      { label: "Users & Roles", href: "/admin/users" },
      { label: "Integrations", href: "/admin/integrations" },
      { label: "Support Tickets", href: "/admin/support-tickets" },
      { label: "KPIs", href: "/kpi" },
    ],
  },
];

const STORAGE_KEY = "truemove_remembered_role";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AgentLogin() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
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

  useEffect(() => {
    if (!session?.user) { setUserRoles([]); setRolesLoading(false); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .then(({ data }) => {
        setUserRoles((data || []).map((r: any) => r.role));
        setRolesLoading(false);
      });
  }, [session?.user?.id]);

  const visibleSections = useMemo(() => {
    if (rolesLoading) return [];
    if (userRoles.length === 0) return SECTIONS;
    return SECTIONS.filter((s) =>
      s.allowedRoles.some((ar) => userRoles.includes(ar))
    );
  }, [userRoles, rolesLoading]);

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
          className="flex flex-col items-center gap-1.5 mb-14"
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

        {/* Three columns */}
        <div className="w-full max-w-5xl">
          {rolesLoading ? (
            <div className="grid grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-24 rounded" />
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-36 rounded" />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {visibleSections.map((section, si) => (
                <motion.div
                  key={section.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.1, duration: 0.3 }}
                  className="space-y-3"
                >
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50 pb-2 border-b border-border/30">
                    {section.title}
                  </h2>
                  <div className="flex flex-col gap-0.5">
                    {section.links.map((link) => (
                      <button
                        key={link.label}
                        onClick={() => navigate(link.href)}
                        className="flex items-center justify-between gap-2 text-[13px] text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors py-1.5 px-2 -mx-2 rounded-md text-left group"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
