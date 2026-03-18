import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Monitor, Phone, Globe, ChevronRight, Maximize2 } from "lucide-react";

interface AgentToolLauncherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOOLS = [
  {
    key: "granot",
    label: "Granot CRM",
    description: "Customer & move management",
    icon: Monitor,
    url: "https://app.granot.com",
  },
  {
    key: "convoso",
    label: "Convoso Dialer",
    description: "Power dialer & campaigns",
    icon: Phone,
    url: "https://app.convoso.com",
  },
  {
    key: "website",
    label: "TruMove Website",
    description: "Company site & estimator",
    icon: Globe,
    url: "/site",
    internal: true,
  },
];

export default function AgentToolLauncherModal({ open, onOpenChange }: AgentToolLauncherModalProps) {
  const navigate = useNavigate();

  const openFullscreen = (url: string, isInternal?: boolean) => {
    if (isInternal) {
      window.open(window.location.origin + url, "_blank", "noopener");
    } else {
      window.open(url, "_blank", "noopener");
    }
  };

  const handleGoToDashboard = () => {
    onOpenChange(false);
    navigate("/agent/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-border rounded-2xl">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="text-base font-bold text-foreground">What are you working in today?</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Open your tools fullscreen, or head to the dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 px-6 pb-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.key}
                onClick={() => openFullscreen(tool.url, (tool as any).internal)}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_16px_hsl(var(--primary)/0.1)] hover:bg-muted/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{tool.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{tool.description}</p>
                </div>
                <Maximize2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
              </button>
            );
          })}
        </div>

        <div className="border-t border-border px-6 py-3 text-center">
          <button
            onClick={handleGoToDashboard}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Go to Dashboard →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}