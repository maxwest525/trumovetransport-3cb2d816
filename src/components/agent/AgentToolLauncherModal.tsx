import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Monitor, Phone, ChevronRight } from "lucide-react";

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
    path: "/tools/granot",
  },
  {
    key: "convoso",
    label: "Convoso Dialer",
    description: "Power dialer & campaigns",
    icon: Phone,
    path: "/tools/convoso",
  },
];

export default function AgentToolLauncherModal({ open, onOpenChange }: AgentToolLauncherModalProps) {
  const navigate = useNavigate();

  const handleToolClick = (path: string) => {
    sessionStorage.setItem("agent_launcher_shown", "1");
    onOpenChange(false);
    navigate(path);
  };

  const handleSkip = () => {
    sessionStorage.setItem("agent_launcher_shown", "1");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-border">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-base font-bold text-foreground">What are you working in today?</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Launch your daily tools below, or skip to the dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 px-6 pb-4 pt-2">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.key}
                onClick={() => handleToolClick(tool.path)}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_16px_hsl(var(--primary)/0.1)] hover:bg-muted/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{tool.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{tool.description}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
              </button>
            );
          })}
        </div>

        <div className="border-t border-border px-6 py-3 text-center">
          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip to Dashboard →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
