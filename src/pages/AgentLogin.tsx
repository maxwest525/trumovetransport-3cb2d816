import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import { Briefcase, Sparkles, Trophy, Key, MessageSquare, LayoutGrid, Medal, Ticket, Kanban } from "lucide-react";
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
    description: "Kanban board for leads, deals & activities",
    icon: Kanban,
    external: true,
    href: "/agent/pipeline",
  },
  {
    id: "workspace" as const,
    title: "Agent Workspace",
    description: "CRM, Dialer & E-Sign in one split-panel view",
    icon: LayoutGrid,
    external: false,
  },
  {
    id: "commission-board" as const,
    title: "Commission Leaderboard",
    description: "Agent rankings by deposits, jobs & premium",
    icon: Medal,
    external: false,
  },
  {
    id: "operations" as const,
    title: "Operations Center",
    description: "Carriers, customers & messaging",
    icon: Briefcase,
    external: false,
  },
  {
    id: "support-tickets" as const,
    title: "Support Tickets",
    description: "View & manage customer support requests",
    icon: Ticket,
    external: true,
    href: "/admin/support-tickets",
  },
  {
    id: "messaging" as const,
    title: "Team Messaging",
    description: "Chat with agents & managers",
    icon: MessageSquare,
    external: false,
  },
  {
    id: "coaching-summary" as const,
    title: "Team Performance",
    description: "Coaching metrics, QA scores & leaderboards",
    icon: Trophy,
    external: false,
  },
  {
    id: "ppc" as const,
    title: "AI Marketing Suite",
    description: "PPC, SEO, A/B testing & conversions",
    icon: Sparkles,
    external: false,
    isIntegration: true,
  },
];

export default function AgentLogin() {
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
    if (toolId === "ppc") {
      setPpcOpen(true);
    } else if (toolId === "operations") {
      setOperationsOpen(true);
    } else if (toolId === "coaching-summary") {
      setCoachingSummaryOpen(true);
    } else if (toolId === "messaging") {
      setMessagingOpen(true);
    } else if (toolId === "workspace") {
      setWorkspaceOpen(true);
    } else if (toolId === "commission-board") {
      setCommissionBoardOpen(true);
    }
  };

  return (
    <SiteShell centered>
      {isLoggedIn && (
        <AgentTopBar
          crumbs={[{ label: "Agent Tools" }]}
          onLogout={() => { setIsLoggedIn(false); setShowLoginModal(true); }}
        />
      )}
      <AgentLoginModal 
        open={showLoginModal && !isLoggedIn} 
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />

      <PPCDemoModal 
        open={ppcOpen} 
        onOpenChange={setPpcOpen} 
      />
      <OperationsCenterModal
        open={operationsOpen}
        onOpenChange={setOperationsOpen}
      />
      <CoachingSummaryModal
        open={coachingSummaryOpen}
        onOpenChange={setCoachingSummaryOpen}
      />
      <InternalMessagingModal
        open={messagingOpen}
        onOpenChange={setMessagingOpen}
      />
      <CombinedWorkspaceModal
        open={workspaceOpen}
        onOpenChange={setWorkspaceOpen}
      />
      <AgentCommissionBoard
        open={commissionBoardOpen}
        onOpenChange={setCommissionBoardOpen}
      />
      <div className="agent-dashboard-page">
            <div className="agent-dashboard-header">
              <div className="flex items-center justify-between mb-2">
                <h1 className="agent-dashboard-title">Agent Tools</h1>
                {isLoggedIn && (
                  <Link
                    to="/admin/integrations"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    Manage API Keys
                  </Link>
                )}
              </div>
              <p className="agent-dashboard-subtitle">
                {isLoggedIn 
                  ? "Access your carrier management and authorization tools" 
                  : "Please log in to access agent tools"}
              </p>
            </div>

            <div className="agent-tools-grid">
              {AGENT_TOOLS.map((tool) => {
                const Icon = tool.icon;
                const content = (
                  <>
                    <div className="agent-tool-icon">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="agent-tool-title">{tool.title}</h3>
                    <p className="agent-tool-description">{tool.description}</p>
                  </>
                );

                if (!isLoggedIn) {
                  return (
                    <div 
                      key={tool.id} 
                      className="agent-tool-card agent-tool-card-disabled"
                      onClick={() => setShowLoginModal(true)}
                    >
                      {content}
                      <span className="agent-tool-badge">Login Required</span>
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
                      {content}
                    </Link>
                  );
                }

                return (
                  <div
                    key={tool.id}
                    className="agent-tool-card agent-tool-card-active"
                    onClick={() => handleToolClick(tool.id)}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
      </div>
    </SiteShell>
  );
}
