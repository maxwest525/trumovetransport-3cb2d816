import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import { Briefcase, Sparkles, Trophy, Key, MessageSquare, LayoutGrid, Medal, Ticket, Kanban, ArrowUpRight } from "lucide-react";
import AgentTopBar from "@/components/agent/AgentTopBar";
import { AgentLoginModal } from "@/components/agent/AgentLoginModal";
import PPCDemoModal from "@/components/demo/PPCDemoModal";
import { OperationsCenterModal } from "@/components/agent/OperationsCenterModal";
import { CoachingSummaryModal } from "@/components/coaching/CoachingSummaryModal";
import { InternalMessagingModal } from "@/components/messaging/InternalMessagingModal";
import { CombinedWorkspaceModal } from "@/components/agent/CombinedWorkspaceModal";
import { AgentCommissionBoard } from "@/components/agent/AgentCommissionBoard";

const AGENT_TOOLS = [
  {
    id: "pipeline" as const,
    title: "Sales Pipeline",
    description: "Leads, deals & activities",
    icon: Kanban,
    external: true,
    href: "/agent/pipeline",
    accent: "hsl(142 71% 45%)",
  },
  {
    id: "workspace" as const,
    title: "Workspace",
    description: "CRM, Dialer & E-Sign",
    icon: LayoutGrid,
    external: false,
    accent: "hsl(221 83% 53%)",
  },
  {
    id: "commission-board" as const,
    title: "Leaderboard",
    description: "Rankings & commissions",
    icon: Medal,
    external: false,
    accent: "hsl(38 92% 50%)",
  },
  {
    id: "operations" as const,
    title: "Operations",
    description: "Carriers & customers",
    icon: Briefcase,
    external: false,
    accent: "hsl(262 83% 58%)",
  },
  {
    id: "support-tickets" as const,
    title: "Support",
    description: "Customer tickets",
    icon: Ticket,
    external: true,
    href: "/admin/support-tickets",
    accent: "hsl(0 84% 60%)",
  },
  {
    id: "messaging" as const,
    title: "Messaging",
    description: "Team chat",
    icon: MessageSquare,
    external: false,
    accent: "hsl(199 89% 48%)",
  },
  {
    id: "coaching-summary" as const,
    title: "Performance",
    description: "Coaching & QA scores",
    icon: Trophy,
    external: false,
    accent: "hsl(24 94% 50%)",
  },
  {
    id: "ppc" as const,
    title: "AI Marketing",
    description: "PPC, SEO & A/B testing",
    icon: Sparkles,
    external: false,
    isIntegration: true,
    accent: "hsl(280 87% 55%)",
  },
];

export default function AgentLoginOld() {
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ppcOpen, setPpcOpen] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [coachingSummaryOpen, setCoachingSummaryOpen] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [commissionBoardOpen, setCommissionBoardOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleToolClick = (toolId: typeof AGENT_TOOLS[number]['id']) => {
    if (toolId === "ppc") setPpcOpen(true);
    else if (toolId === "operations") setOperationsOpen(true);
    else if (toolId === "coaching-summary") setCoachingSummaryOpen(true);
    else if (toolId === "messaging") setMessagingOpen(true);
    else if (toolId === "workspace") setWorkspaceOpen(true);
    else if (toolId === "commission-board") setCommissionBoardOpen(true);
  };

  return (
    <SiteShell centered>
      {isLoggedIn && (
        <AgentTopBar
          crumbs={[{ label: "Agent Tools (Old)" }]}
          onLogout={() => { setIsLoggedIn(false); setShowLoginModal(true); }}
        />
      )}
      <AgentLoginModal 
        open={showLoginModal && !isLoggedIn} 
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />

      <PPCDemoModal open={ppcOpen} onOpenChange={setPpcOpen} />
      <OperationsCenterModal open={operationsOpen} onOpenChange={setOperationsOpen} />
      <CoachingSummaryModal open={coachingSummaryOpen} onOpenChange={setCoachingSummaryOpen} />
      <InternalMessagingModal open={messagingOpen} onOpenChange={setMessagingOpen} />
      <CombinedWorkspaceModal open={workspaceOpen} onOpenChange={setWorkspaceOpen} />
      <AgentCommissionBoard open={commissionBoardOpen} onOpenChange={setCommissionBoardOpen} />

      <div className="agent-dashboard-page">
        <div className="agent-dashboard-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="agent-dashboard-title">
                {isLoggedIn ? "Your Tools (Old)" : "Agent Tools (Old)"}
              </h1>
              <p className="agent-dashboard-subtitle">
                {isLoggedIn 
                  ? "Everything you need, one click away" 
                  : "Sign in to get started"}
              </p>
            </div>
            {isLoggedIn && (
              <Link
                to="/admin/integrations"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Key className="w-3 h-3" />
                API Keys
              </Link>
            )}
          </div>
        </div>

        <div className="agent-tools-grid">
          {AGENT_TOOLS.map((tool) => {
            const Icon = tool.icon;

            if (!isLoggedIn) {
              return (
                <div 
                  key={tool.id} 
                  className="agent-tool-card agent-tool-card-disabled"
                  onClick={() => setShowLoginModal(true)}
                >
                  <div className="agent-tool-icon-minimal">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="agent-tool-text">
                    <h3 className="agent-tool-title">{tool.title}</h3>
                    <p className="agent-tool-description">{tool.description}</p>
                  </div>
                </div>
              );
            }

            if (tool.external && 'href' in tool && tool.href) {
              return (
                <Link
                  key={tool.id}
                  to={tool.href}
                  className="agent-tool-card agent-tool-card-active"
                >
                  <div className="agent-tool-icon-minimal">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="agent-tool-text">
                    <h3 className="agent-tool-title">{tool.title}</h3>
                    <p className="agent-tool-description">{tool.description}</p>
                  </div>
                  <ArrowUpRight className="agent-tool-arrow" />
                </Link>
              );
            }

            return (
              <div
                key={tool.id}
                className="agent-tool-card agent-tool-card-active"
                onClick={() => handleToolClick(tool.id)}
              >
                <div className="agent-tool-icon-minimal">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="agent-tool-text">
                  <h3 className="agent-tool-title">{tool.title}</h3>
                  <p className="agent-tool-description">{tool.description}</p>
                </div>
                <ArrowUpRight className="agent-tool-arrow" />
              </div>
            );
          })}
        </div>
      </div>
    </SiteShell>
  );
}
