import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Monitor, Phone, Globe, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentToolLauncherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOOLS = [
  { key: "granot", label: "Granot CRM", icon: Monitor, url: "https://app.granot.com" },
  { key: "convoso", label: "Convoso Dialer", icon: Phone, url: "https://app.convoso.com" },
  { key: "website", label: "TruMove Website", icon: Globe, url: "/site", internal: true },
];

export default function AgentToolLauncherModal({ open, onOpenChange }: AgentToolLauncherModalProps) {
  const navigate = useNavigate();

  const handleLaunchAll = () => {
    const sw = window.screen.availWidth;
    const sh = window.screen.availHeight;
    const sl = (window.screen as any).availLeft ?? 0;
    const st = (window.screen as any).availTop ?? 0;
    const count = TOOLS.length;
    const w = Math.floor(sw / count);

    TOOLS.forEach((tool, i) => {
      const url = tool.internal ? window.location.origin + tool.url : tool.url;
      window.open(
        url,
        `tool_${tool.key}`,
        `left=${sl + i * w},top=${st},width=${w},height=${sh},menubar=no,toolbar=no,location=yes,status=no`
      );
    });

    onOpenChange(false);
  };

  const handleGoToDashboard = () => {
    onOpenChange(false);
    navigate("/agent/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden border-border rounded-2xl">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="text-base font-bold text-foreground">Ready to work?</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Opens Granot, Convoso & Website side-by-side across your screen.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4 space-y-3">
          {/* Tool preview list */}
          <div className="flex flex-col gap-1.5">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.key} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{tool.label}</span>
                </div>
              );
            })}
          </div>

          <Button
            onClick={handleLaunchAll}
            className="w-full h-11 rounded-xl gap-2 font-semibold"
            size="lg"
          >
            <Rocket className="h-4 w-4" />
            Launch All
          </Button>
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