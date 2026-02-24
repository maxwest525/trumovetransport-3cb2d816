import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone, Mail, MapPin, Clock, Tag, Shield, ShieldAlert,
  MessageSquare, FileText, ChevronDown, ChevronUp, Copy, AlertTriangle,
  PhoneOutgoing, PhoneIncoming, Voicemail
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DialerContact, DialerCall } from "./types";

// Mock contact
const MOCK_CONTACT: DialerContact = {
  id: "c1",
  name: "Jessica Martinez",
  phones: ["+1 (555) 234-5678", "+1 (555) 876-5432"],
  email: "jessica.martinez@email.com",
  timezone: "EST (UTC-5)",
  tags: ["Hot Lead", "Residential"],
  flags: { dnc: false, tcpaBlocked: false, wrongNumber: false, doNotText: false },
  ownerAgentId: null,
  leadSource: "Website",
  state: "FL",
};

const MOCK_TIMELINE: { type: string; text: string; time: string; icon: any }[] = [
  { type: "call", text: "Outbound call — No answer (32s)", time: "2h ago", icon: PhoneOutgoing },
  { type: "note", text: "Client interested in 2BR estimate, asked for callback tomorrow", time: "2h ago", icon: FileText },
  { type: "email", text: "Sent: Moving estimate follow-up", time: "1d ago", icon: Mail },
  { type: "call", text: "Inbound call — Follow Up (4:12)", time: "3d ago", icon: PhoneIncoming },
  { type: "vm", text: "Voicemail left: intro message", time: "5d ago", icon: Voicemail },
];

const SCRIPTS = [
  { id: "s1", title: "Opening Script", body: "Hi, this is [Agent] from [Company]. I'm following up on your moving inquiry. Is now a good time to talk?", required: true },
  { id: "s2", title: "Needs Assessment", body: "Can you tell me about your move? Where are you moving from and to? What's your ideal move date?", required: true },
  { id: "s3", title: "Closing Script", body: "Based on what you've told me, I'd like to schedule an in-home estimate. Would [date] work for you?", required: false },
];

interface ContactWorkspaceProps {
  onDial: (phone: string, name: string) => void;
}

export default function ContactWorkspace({ onDial }: ContactWorkspaceProps) {
  const contact = MOCK_CONTACT;
  const [expandedScript, setExpandedScript] = useState<string | null>("s1");

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {/* Contact Card */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{contact.name}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{contact.state}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{contact.timezone}</span>
                <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{contact.leadSource}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {contact.flags.dnc && (
                <Badge variant="destructive" className="text-[10px] gap-1"><ShieldAlert className="w-3 h-3" />DNC</Badge>
              )}
              {contact.flags.tcpaBlocked && (
                <Badge variant="destructive" className="text-[10px] gap-1"><Shield className="w-3 h-3" />TCPA</Badge>
              )}
            </div>
          </div>

          {/* Phones */}
          <div className="mt-3 flex flex-wrap gap-2">
            {contact.phones.map((phone, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={() => onDial(phone, contact.name)}
                disabled={contact.flags.dnc || contact.flags.tcpaBlocked}
              >
                <Phone className="w-3.5 h-3.5 text-primary" />
                {phone}
                {i === 0 && <Badge variant="secondary" className="text-[9px] h-4 px-1">Primary</Badge>}
              </Button>
            ))}
            {contact.email && (
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                {contact.email}
              </Button>
            )}
          </div>

          {/* Tags */}
          <div className="mt-3 flex items-center gap-1.5">
            {contact.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance banner */}
      {(contact.flags.dnc || contact.flags.tcpaBlocked) && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {contact.flags.dnc && "This contact is on the Do Not Call list. "}
            {contact.flags.tcpaBlocked && "TCPA litigant — calling is blocked. "}
            Call button is disabled.
          </span>
        </div>
      )}

      {/* Tabs: Timeline / Scripts */}
      <Tabs defaultValue="timeline" className="flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline" className="text-xs gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />Timeline
          </TabsTrigger>
          <TabsTrigger value="scripts" className="text-xs gap-1.5">
            <FileText className="w-3.5 h-3.5" />Scripts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-3 space-y-2">
          {MOCK_TIMELINE.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{item.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="scripts" className="mt-3 space-y-2">
          {SCRIPTS.map(script => (
            <Card key={script.id} className={cn("border-border", script.required && "border-l-2 border-l-primary")}>
              <button
                className="w-full flex items-center justify-between p-3 text-left"
                onClick={() => setExpandedScript(expandedScript === script.id ? null : script.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{script.title}</span>
                  {script.required && <Badge variant="secondary" className="text-[9px] h-4 px-1">Required</Badge>}
                </div>
                {expandedScript === script.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {expandedScript === script.id && (
                <CardContent className="pt-0 pb-3 px-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{script.body}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs gap-1"
                    onClick={() => navigator.clipboard.writeText(script.body)}
                  >
                    <Copy className="w-3 h-3" />Copy
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
