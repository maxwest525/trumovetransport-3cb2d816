import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, FileText, 
  PhoneIncoming, PhoneOutgoing, Voicemail,
  PenLine
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CombinedWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CALLS = [
  { type: "incoming", name: "Sarah Johnson", duration: "4:32", time: "2 min ago" },
  { type: "outgoing", name: "Michael Chen", duration: "2:15", time: "15 min ago" },
  { type: "missed", name: "Unknown", duration: "-", time: "32 min ago" },
];

const DOCS = [
  { name: "Johnson Move Estimate", status: "signed", time: "2 hrs ago" },
  { name: "Chen CC Authorization", status: "opened", time: "4 hrs ago" },
  { name: "Rodriguez BOL", status: "sent", time: "1 day ago" },
];

const callIcon = (t: string) => t === 'incoming' ? PhoneIncoming : t === 'outgoing' ? PhoneOutgoing : Voicemail;

export function CombinedWorkspaceModal({ open, onOpenChange }: CombinedWorkspaceModalProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold">Workspace</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dialer" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="esign" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />E-Sign</TabsTrigger>
            <TabsTrigger value="dialer" className="gap-1.5 text-xs"><Phone className="h-3.5 w-3.5" />Dialer</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-3">

            {/* E-Sign Tab */}
            <TabsContent value="esign" className="mt-0 space-y-1">
              {DOCS.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{doc.name}</div>
                    <div className="text-[11px] text-muted-foreground">{doc.time}</div>
                  </div>
                  <Badge variant="secondary" className={cn("text-[10px] capitalize", doc.status === "signed" && "bg-green-100 text-green-700")}>{doc.status}</Badge>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs mt-2">
                <PenLine className="w-3.5 h-3.5" /> New Document
              </Button>
            </TabsContent>

            {/* Dialer Tab */}
            <TabsContent value="dialer" className="mt-0 space-y-1">
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
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
