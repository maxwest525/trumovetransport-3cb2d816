import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteShell from "@/components/layout/SiteShell";
import PortalAuthForm from "@/components/auth/PortalAuthForm";
import {
  Users, BarChart3, Megaphone, Receipt, Package, ShieldCheck, Globe,
  LogOut, Bell, Phone, PhoneCall, Database, Gauge, PenTool, MessageSquare,
  Headphones, Settings, ExternalLink, UserCog, Plug, TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import logoImg from "@/assets/logo.png";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { motion } from "framer-motion";
import type { Session } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface HubItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Internal route OR external URL (starts with http) */
  href: string;
  external?: boolean;
}

interface HubSection {
  key: string;
  title: string;
  /** DB roles that can see this section. owner always sees everything. */
  allowedRoles: string[];
  items: HubItem[];
}

/* ------------------------------------------------------------------ */
/*  Section definitions                                                */
/* ------------------------------------------------------------------ */

const SECTIONS: HubSection[] = [
  {
    key: "agents",
    title: "Agents",
    allowedRoles: ["owner", "admin", "manager", "agent"],
    items: [
      { id: "convoso", title: "Convoso Dialer", description: "Power dialer & campaigns.", icon: Phone, href: "https://app.convoso.com", external: true },
      { id: "ringcentral", title: "RingCentral", description: "Cloud phone system.", icon: PhoneCall, href: "https://app.ringcentral.com", external: true },
      { id: "granot-agent", title: "Granot CRM", description: "Customer & move management.", icon: Database, href: "https://app.granot.com", external: true },
      { id: "pipeline", title: "Pipeline", description: "Leads, deals & stages.", icon: Gauge, href: "/agent/pipeline" },
      { id: "dialer", title: "Dialer", description: "Built-in softphone.", icon: Headphones, href: "/agent/dialer" },
      { id: "esign", title: "E-Sign Hub", description: "Contracts & signatures.", icon: PenTool, href: "/agent/esign" },
      { id: "team-chat", title: "Team Chat", description: "Internal messaging.", icon: MessageSquare, href: "/agent/team-chat" },
    ],
  },
  {
    key: "managers",
    title: "Managers",
    allowedRoles: ["owner", "admin", "manager"],
    items: [
      { id: "convoso-admin", title: "Convoso Admin", description: "Dialer admin & analytics.", icon: Phone, href: "https://admin.convoso.com", external: true },
      { id: "rc-admin", title: "RingCentral Admin", description: "Phone system admin.", icon: PhoneCall, href: "https://admin.ringcentral.com", external: true },
      { id: "granot-mgr", title: "Granot Manager", description: "Manager / admin CRM view.", icon: Database, href: "https://app.granot.com/manager", external: true },
      { id: "pulseos", title: "PulseOS", description: "FMCSA compliance platform.", icon: ShieldCheck, href: "https://app.pulseos.com", external: true },
      { id: "mgr-dashboard", title: "Team Dashboard", description: "Performance & approvals.", icon: BarChart3, href: "/manager/dashboard" },
      { id: "coaching", title: "Coaching", description: "Agent coaching & call reviews.", icon: Headphones, href: "/coaching" },
    ],
  },
  {
    key: "admin",
    title: "Admin / Owner",
    allowedRoles: ["owner", "admin"],
    items: [
      { id: "marketing", title: "Marketing Suite", description: "AI campaigns & A/B testing.", icon: Megaphone, href: "/marketing/dashboard" },
      { id: "sites", title: "Customer Sites", description: "Public-facing website variants.", icon: Globe, href: "/customer-facing-sites" },
      { id: "compliance", title: "Compliance", description: "FMCSA filings & audits.", icon: ShieldCheck, href: "/compliance/dashboard" },
      { id: "accounting", title: "Accounting", description: "Invoices, payroll & revenue.", icon: Receipt, href: "/accounting/dashboard" },
      { id: "vendors", title: "Lead Vendors", description: "Sources, budgets & ROI.", icon: Package, href: "/leads/dashboard" },
      { id: "users", title: "User Management", description: "Team members & roles.", icon: UserCog, href: "/admin/users" },
      { id: "integrations", title: "Integrations", description: "Connected services.", icon: Plug, href: "/admin/integrations" },
      { id: "kpis", title: "KPIs", description: "Company-wide metrics.", icon: TrendingUp, href: "/kpi" },
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
/*  Card component                                                     */
/* ------------------------------------------------------------------ */

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.04, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

function HubCard({ item, index, onClick }: { item: HubItem; index: number; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <motion.button
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      className="group relative flex flex-col gap-1.5 rounded-xl border border-border/40 bg-card p-4 hover:border-border hover:shadow-md transition-all duration-200 text-left"
    >
      {item.external && (
        <ExternalLink className="absolute top-3 right-3 w-3 h-3 text-muted-foreground/40" />
      )}
      <div className="flex items-center gap-2.5">
        <Icon className="w-[18px] h-[18px] text-muted-foreground shrink-0" strokeWidth={1.5} />
        <h3 className="font-semibold text-foreground text-[13px] tracking-tight">{item.title}</h3>
      </div>
      <p className="text-[11px] text-muted-foreground/70 leading-relaxed pl-[30px]">{item.description}</p>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
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

  // Auth listener
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

  // Fetch roles
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

  // Visible sections based on roles
  const visibleSections = useMemo(() => {
    if (rolesLoading) return [];
    // Fallback: show everything if no roles assigned yet
    if (userRoles.length === 0) return SECTIONS;
    return SECTIONS.filter((s) =>
      s.allowedRoles.some((ar) => userRoles.includes(ar))
    );
  }, [userRoles, rolesLoading]);

  const handleClick = (item: HubItem) => {
    if (item.external) {
      window.open(item.href, "_blank", "noopener");
    } else {
      navigate(item.href);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
  };

  // Loading state
  if (loading) {
    return (
      <SiteShell centered backendMode hideHeader>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      </SiteShell>
    );
  }

  // Auth gate
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
      <div className="flex flex-col items-center min-h-[100vh] px-4 py-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center gap-2 mb-12"
        >
          <img src={logoImg} alt="TruMove" className="h-8 dark:invert" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-3 flex items-center gap-2">
            {greeting}, {displayName}
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold">
                <Bell className="w-3 h-3" />
                {unreadCount}
              </span>
            )}
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
        </motion.div>

        {/* Sections */}
        <div className="w-full max-w-[960px] space-y-10">
          {rolesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] rounded-xl" />
              ))}
            </div>
          ) : (
            visibleSections.map((section) => (
              <div key={section.key}>
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 pl-1">
                  {section.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {section.items.map((item, i) => (
                    <HubCard
                      key={item.id}
                      item={item}
                      index={i}
                      onClick={() => handleClick(item)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SiteShell>
  );
}
