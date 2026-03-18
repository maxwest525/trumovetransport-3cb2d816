import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plug } from "lucide-react";

const TOOL_META: Record<string, { title: string; description: string }> = {
  convoso: {
    title: "Convoso Dialer",
    description: "Power dialer, campaigns & call analytics. API integration coming soon.",
  },
  "convoso-admin": {
    title: "Convoso Admin",
    description: "Dialer admin panel, agent monitoring & campaign management. API integration coming soon.",
  },
  ringcentral: {
    title: "RingCentral",
    description: "Cloud phone system, call routing & voicemail. API integration coming soon.",
  },
  "ringcentral-admin": {
    title: "RingCentral Admin",
    description: "Phone system administration, user management & analytics. API integration coming soon.",
  },
  granot: {
    title: "Granot CRM",
    description: "Customer & move management platform. API integration coming soon.",
  },
  "granot-manager": {
    title: "Granot Manager",
    description: "Manager & admin CRM view with team oversight. API integration coming soon.",
  },
  pulseos: {
    title: "PulseOS",
    description: "FMCSA compliance, licensing & insurance management. API integration coming soon.",
  },
};

export default function IntegrationPlaceholder() {
  const { tool } = useParams<{ tool: string }>();
  const navigate = useNavigate();
  const meta = TOOL_META[tool || ""] || { title: tool || "Integration", description: "This integration is being set up." };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Slim header */}
      <div className="flex items-center justify-between h-10 px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-tight text-foreground">TruMove</span>
          <span className="text-[11px] text-muted-foreground">/ {meta.title}</span>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/agent/dashboard")}>
          <ArrowLeft className="w-3 h-3" />
          Dashboard
        </Button>
      </div>

      {/* Tool content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
          <Plug className="w-6 h-6 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-semibold text-foreground mb-1">{meta.title}</h1>
        <p className="text-sm text-muted-foreground max-w-sm">{meta.description}</p>
      </div>
    </div>
  );
}
