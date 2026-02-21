import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, Loader2, Sparkles, X } from "lucide-react";
import { Deal, Activity } from "./types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DealEmailComposerProps {
  deal: Deal;
  activities: Activity[];
}

export function DealEmailComposer({ deal, activities }: DealEmailComposerProps) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(deal.leads?.email || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [drafting, setDrafting] = useState(false);

  const lead = deal.leads;

  const draftWithAI = async () => {
    setDrafting(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deal-ai-assistant`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          deal,
          lead: lead || null,
          activities,
          action: "draft_email",
        }),
      });

      if (!resp.ok || !resp.body) {
        toast({ title: "AI Error", description: "Failed to draft email", variant: "destructive" });
        setDrafting(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, idx);
          textBuffer = textBuffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setBody(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Auto-generate subject if empty
      if (!subject && lead) {
        setSubject(`Follow-up: Your upcoming move — ${lead.first_name} ${lead.last_name}`);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to draft email", variant: "destructive" });
    }
    setDrafting(false);
  };

  const sendEmail = async () => {
    if (!to || !subject || !body) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-deal-email", {
        body: { to, subject, body, customerName: lead ? `${lead.first_name} ${lead.last_name}` : "Customer" },
      });

      if (error) throw error;
      toast({ title: "Email sent!" });

      // Log as activity
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("activities" as any).insert({
        deal_id: deal.id,
        lead_id: deal.lead_id,
        agent_id: user?.id,
        type: "email",
        subject: `Email: ${subject}`,
        description: `Sent to ${to}`,
      } as any);

      setOpen(false);
      setBody("");
      setSubject("");
    } catch (e: any) {
      toast({ title: "Send failed", description: e.message, variant: "destructive" });
    }
    setSending(false);
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="gap-2 w-full" onClick={() => { setOpen(true); setTo(lead?.email || ""); }}>
        <Mail className="h-3.5 w-3.5" /> Send Email
      </Button>
    );
  }

  return (
    <Card className="border-accent bg-accent/30">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" /> Compose Email
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <Label className="text-xs">To</Label>
          <Input value={to} onChange={(e) => setTo(e.target.value)} className="h-8 text-sm" placeholder="customer@email.com" />
        </div>
        <div>
          <Label className="text-xs">Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-8 text-sm" placeholder="Re: Your upcoming move" />
        </div>
        <div>
          <Label className="text-xs">Body</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="text-sm min-h-[100px]" placeholder="Write your message..." />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={draftWithAI} disabled={drafting}>
            {drafting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            AI Draft
          </Button>
          <Button size="sm" className="gap-1 text-xs ml-auto" onClick={sendEmail} disabled={sending || !to || !body}>
            {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
