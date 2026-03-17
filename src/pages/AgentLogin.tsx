import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteShell from "@/components/layout/SiteShell";
import PortalAuthForm from "@/components/auth/PortalAuthForm";
import { LogOut, Bell, ExternalLink } from "lucide-react";
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
  external?: boolean;
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
      { label: "Convoso Dialer", href: "https://app.convoso.com", external: true },
      { label: "RingCentral", href: "https://app.ringcentral.com", external: true },
      { label: "Granot CRM", href: "https://app.granot.com", external: true },
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
      { label: "Convoso Admin", href: "https://admin.convoso.com", external: true },
      { label: "RingCentral Admin", href: "https://admin.ringcentral.com", external: true },
      { label: "Granot Manager", href: "https://app.granot.com/manager", external: true },
      { label: "PulseOS", href: "https://app.pulseos.com", external: true },
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

  const handleClick = (link: LinkItem) => {
    if (link.external) {
      window.open(link.href, "_blank", "noopener");
    } else {
      navigate(link.href);
    }
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
      <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 py-20">

        {/* Header — logo + greeting */}
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

        {/* Link sections */}
        <div className="w-full max-w-md space-y-8">
          {rolesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-40 rounded" />
              ))}
            </div>
          ) : (
            visibleSections.map((section, si) => (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.08, duration: 0.3 }}
              >
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
                  {section.title}
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {section.links.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => handleClick(link)}
                      className="inline-flex items-center gap-1 text-[13px] text-foreground/80 hover:text-foreground transition-colors py-0.5"
                    >
                      {link.label}
                      {link.external && (
                        <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/40" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </SiteShell>
  );
}
