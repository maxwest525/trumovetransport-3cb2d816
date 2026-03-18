import AgentShell from "@/components/layout/AgentShell";
import { ExternalLink, Monitor, Phone } from "lucide-react";

const TOOLS = [
  {
    name: "Granot CRM",
    description: "Customer relationship management & lead tracking",
    url: "https://granot.com",
    icon: Monitor,
  },
  {
    name: "Convoso Dialer",
    description: "Power dialer for outbound calls & follow-ups",
    url: "https://convoso.com",
    icon: Phone,
  },
];

export default function AgentPreferences() {
  return (
    <AgentShell>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-lg font-semibold">Preferences</h1>
          <p className="text-sm text-muted-foreground">Launch your external tools and manage settings.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Tools</h2>
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{tool.name}</div>
                  <div className="text-xs text-muted-foreground">{tool.description}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </a>
            );
          })}
        </div>
      </div>
    </AgentShell>
  );
}
