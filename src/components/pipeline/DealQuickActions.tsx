import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, Send, Mail, MessageSquare, Loader2, Zap, Sparkles } from "lucide-react";
import { Deal, Activity } from "./types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type DocumentType = "estimate" | "ccach" | "bol";

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  estimate: "Estimate Authorization",
  ccach: "CC/ACH Authorization",
  bol: "Bill of Lading",
};

const HTML_TEMPLATES: Record<string, { label: string; getHtml: (name: string, company?: string) => string }> = {
  follow_up: {
    label: "Follow-Up",
    getHtml: (name) => `
      <!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;margin:0;padding:0;background:#f4f4f5;">
        <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
          <div style="background:linear-gradient(135deg,#7C3AED 0%,#4F46E5 100%);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:-0.5px;">TruMove</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;">Your Trusted Moving Partner</p>
          </div>
          <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
            <p style="font-size:16px;color:#18181b;">Hi ${name},</p>
            <p style="color:#3f3f46;line-height:1.7;">Just checking in on your upcoming move! We want to make sure everything is on track and answer any questions you may have.</p>
            <p style="color:#3f3f46;line-height:1.7;">If you're ready to proceed, simply reply to this email or give us a call — we're here to help every step of the way.</p>
            <div style="text-align:center;margin:28px 0;">
              <a href="#" style="display:inline-block;background:#7C3AED;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Schedule a Call</a>
            </div>
            <p style="color:#71717a;font-size:13px;">Best regards,<br/><strong style="color:#18181b;">The TruMove Team</strong></p>
          </div>
          <p style="text-align:center;color:#a1a1aa;font-size:11px;margin-top:16px;">© ${new Date().getFullYear()} TruMove · <a href="#" style="color:#7C3AED;">Unsubscribe</a></p>
        </div>
      </body></html>`,
  },
  quote_ready: {
    label: "Quote Ready",
    getHtml: (name) => `
      <!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;margin:0;padding:0;background:#0a0a0b;">
        <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
          <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
            <div style="padding:32px;text-align:center;border-bottom:1px solid #27272a;">
              <h1 style="color:#fff;margin:0;font-size:22px;">Your Quote is Ready 🎉</h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#d4d4d8;font-size:15px;">Hi ${name},</p>
              <p style="color:#a1a1aa;line-height:1.7;">Great news — your personalized moving quote has been prepared. We've factored in all the details you shared to give you the best possible rate.</p>
              <div style="background:#7C3AED;background:linear-gradient(135deg,#7C3AED,#6D28D9);border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
                <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Your Estimated Rate</p>
                <p style="color:#fff;font-size:36px;font-weight:800;margin:0;">Contact Us</p>
                <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:4px 0 0;">for your personalized quote</p>
              </div>
              <div style="text-align:center;">
                <a href="#" style="display:inline-block;background:#fff;color:#18181b;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View Full Quote</a>
              </div>
            </div>
          </div>
          <p style="text-align:center;color:#52525b;font-size:11px;margin-top:16px;">© ${new Date().getFullYear()} TruMove</p>
        </div>
      </body></html>`,
  },
  booking_confirm: {
    label: "Booking Confirmed",
    getHtml: (name) => `
      <!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;margin:0;padding:0;background:#f0fdf4;">
        <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
          <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);border:1px solid #bbf7d0;">
            <div style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);padding:32px;text-align:center;">
              <div style="font-size:48px;margin-bottom:8px;">✅</div>
              <h1 style="color:#fff;margin:0;font-size:24px;">Move Confirmed!</h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#18181b;font-size:15px;">Hi ${name},</p>
              <p style="color:#3f3f46;line-height:1.7;">Your move has been officially booked! Our team is locked in and ready to deliver a seamless experience.</p>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:20px 0;">
                <p style="color:#15803d;font-weight:700;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">What's Next</p>
                <p style="color:#3f3f46;margin:0;line-height:1.8;font-size:14px;">
                  ✓ Our coordinator will reach out 48hrs before your move<br/>
                  ✓ You'll receive a detailed inventory checklist<br/>
                  ✓ Track your move in real-time on move day
                </p>
              </div>
              <p style="color:#71717a;font-size:13px;">Questions? Reply to this email anytime.<br/><strong style="color:#18181b;">— TruMove Team</strong></p>
            </div>
          </div>
        </div>
      </body></html>`,
  },
};

interface DealQuickActionsProps {
  deal: Deal;
  activities: Activity[];
  onActivityAdded?: () => void;
}

export function DealQuickActions({ deal, activities, onActivityAdded }: DealQuickActionsProps) {
  const [sending, setSending] = useState(false);
  const [sendingEsign, setSendingEsign] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("follow_up");
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>("estimate");

  const lead = deal.leads;
  const customerName = lead ? `${lead.first_name} ${lead.last_name}` : "Customer";
  const customerEmail = lead?.email || "";

  const handleAutoFollowUp = async () => {
    if (!customerEmail) {
      toast({ title: "No email on file", description: "Add an email to this lead first.", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const template = HTML_TEMPLATES[selectedTemplate];
      const htmlBody = template.getHtml(lead?.first_name || "there");
      const subject =
        selectedTemplate === "follow_up" ? `Following up on your move — ${customerName}` :
        selectedTemplate === "quote_ready" ? `Your moving quote is ready, ${lead?.first_name}!` :
        `Move confirmed! Here's what's next, ${lead?.first_name}`;

      const { error } = await supabase.functions.invoke("send-deal-email", {
        body: { to: customerEmail, subject, htmlBody, customerName },
      });
      if (error) throw error;

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("activities" as any).insert({
        deal_id: deal.id,
        lead_id: deal.lead_id,
        agent_id: user?.id,
        type: "email",
        subject: `Auto ${template.label} email sent`,
        description: `Sent "${template.label}" HTML template to ${customerEmail}`,
      } as any);

      toast({ title: "Email sent!", description: `${template.label} template sent to ${customerEmail}` });
      onActivityAdded?.();
    } catch (e: any) {
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
    }
    setSending(false);
  };

  const handleSendEsign = async () => {
    if (!customerEmail) {
      toast({ title: "No email on file", description: "Add an email to this lead first.", variant: "destructive" });
      return;
    }

    setSendingEsign(true);
    try {
      const refPrefix = selectedDocType === "estimate" ? "EST" : selectedDocType === "ccach" ? "CC" : "BOL";
      const refNumber = `${refPrefix}-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
      const signingUrl = `${window.location.origin}/esign/${refNumber}`;

      const { error } = await supabase.functions.invoke("send-esign-document", {
        body: {
          documentType: selectedDocType,
          customerName,
          customerEmail,
          customerPhone: lead?.phone || "",
          refNumber,
          deliveryMethod: "email",
          signingUrl,
        },
      });
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("activities" as any).insert({
        deal_id: deal.id,
        lead_id: deal.lead_id,
        agent_id: user?.id,
        type: "email",
        subject: `E-Sign: ${DOCUMENT_LABELS[selectedDocType]} sent`,
        description: `Sent ${DOCUMENT_LABELS[selectedDocType]} (${refNumber}) to ${customerEmail}`,
      } as any);

      toast({ title: "E-Sign sent!", description: `${DOCUMENT_LABELS[selectedDocType]} sent to ${customerEmail}` });
      onActivityAdded?.();
    } catch (e: any) {
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
    }
    setSendingEsign(false);
  };

  return (
    <div className="space-y-3">
      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Actions</h5>

      {/* Auto Follow-Up Email */}
      <div className="rounded-lg border border-border p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Auto Follow-Up
        </div>
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(HTML_TEMPLATES).map(([key, t]) => (
              <SelectItem key={key} value={key}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="w-full gap-2 text-xs"
          onClick={handleAutoFollowUp}
          disabled={sending || !customerEmail}
        >
          {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
          {sending ? "Sending..." : "Send HTML Email"}
        </Button>
      </div>

      {/* E-Sign Quick Send */}
      <div className="rounded-lg border border-border p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-3.5 w-3.5 text-primary" />
          Send E-Sign
        </div>
        <Select value={selectedDocType} onValueChange={(v) => setSelectedDocType(v as DocumentType)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["estimate", "ccach", "bol"] as DocumentType[]).map(type => (
              <SelectItem key={type} value={type}>{DOCUMENT_LABELS[type]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-2 text-xs"
          onClick={handleSendEsign}
          disabled={sendingEsign || !customerEmail}
        >
          {sendingEsign ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          {sendingEsign ? "Sending..." : "Send for Signature"}
        </Button>
      </div>
    </div>
  );
}
