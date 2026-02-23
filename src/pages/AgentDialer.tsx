import AgentShell from "@/components/layout/AgentShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, PhoneIncoming, PhoneOutgoing, Voicemail } from "lucide-react";
import { cn } from "@/lib/utils";

const CALLS = [
  { type: "incoming", name: "Sarah Johnson", duration: "4:32", time: "2 min ago" },
  { type: "outgoing", name: "Michael Chen", duration: "2:15", time: "15 min ago" },
  { type: "missed", name: "Unknown", duration: "-", time: "32 min ago" },
];

const callIcon = (t: string) => t === 'incoming' ? PhoneIncoming : t === 'outgoing' ? PhoneOutgoing : Voicemail;

export default function AgentDialer() {
  return (
    <AgentShell breadcrumb=" / Dialer">
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Dialer</h1>
        <div className="space-y-1">
          {CALLS.map((call, i) => {
            const Icon = callIcon(call.type);
            return (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", call.type === "missed" ? "bg-destructive/10" : "bg-primary/10")}>
                  <Icon className={cn("w-3.5 h-3.5", call.type === "missed" ? "text-destructive" : "text-primary")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{call.name}</div>
                  <div className="text-[11px] text-muted-foreground">{call.time} · {call.duration}</div>
                </div>
                <Badge variant="secondary" className={cn("text-[10px] capitalize", call.type === "missed" && "bg-destructive/10 text-destructive")}>{call.type}</Badge>
              </div>
            );
          })}
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs mt-2">
            <Phone className="w-3.5 h-3.5" /> New Call
          </Button>
        </div>
      </div>
    </AgentShell>
  );
}
