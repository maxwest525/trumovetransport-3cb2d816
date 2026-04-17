import { useState } from "react";
import { User, Phone, Mail, ArrowRight, Lock, Shield, Sparkles, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPhoneNumber, isValidPhoneNumber } from "@/lib/phoneFormat";
import { supabase } from "@/integrations/supabase/client";
import { getAttributionData, markFormStart, markFormComplete } from "@/lib/leadAttribution";

interface LeadGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (lead: { firstName: string; lastName: string; email: string; phone: string; leadId?: string }) => void;
}

/**
 * Gates access to the AI Room Scan. Captures basic contact info and immediately
 * creates a lead in the CRM so every scan attempt becomes a real lead.
 */
export default function LeadGateModal({ isOpen, onClose, onUnlock }: LeadGateModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string; phone?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!firstName.trim()) e.firstName = "Required";
    if (!lastName.trim()) e.lastName = "Required";
    if (!email.includes("@")) e.email = "Valid email required";
    if (!isValidPhoneNumber(phone)) e.phone = "Valid phone required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };

    // Persist contact for the auto-save flow that runs after each scan
    try {
      localStorage.setItem("tm_lead", JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }

    // Mark attribution form completion so the CRM has accurate funnel data
    try { markFormComplete(); } catch { /* noop */ }

    // Push a lead to the CRM right now so every unlock = a real lead, even if
    // the user abandons the scan.
    let createdLeadId: string | undefined;
    try {
      const attribution = getAttributionData();
      const { data, error } = await supabase.functions.invoke("capture-anonymous-visitor", {
        body: {
          attribution: {
            ...attribution,
            // Tag this attribution row with the captured contact so CRM can show it
            form_completed_at: new Date().toISOString(),
          },
          contact: payload,
          source: "scan-room-gate",
        },
      });
      if (error) throw error;
      if (data?.leadId) {
        createdLeadId = data.leadId as string;
        localStorage.setItem("tm_anonymous_lead_id", createdLeadId);
      }
    } catch (err) {
      console.warn("Lead pre-create failed (will retry on auto-save):", err);
      // Non-fatal — autoSaveScanToCrm will still create/merge a lead after the scan
    }

    setSubmitting(false);
    onUnlock({ ...payload, leadId: createdLeadId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !submitting) onClose(); }}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary/15 border border-primary/30">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <DialogTitle className="text-center text-lg font-bold">
            Unlock AI Room Scan
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Quick contact info so we can save your scan and send your estimate.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <User className="w-3.5 h-3.5" /> First Name
              </label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); markFormStart(); }}
                placeholder="Jane"
                className={errors.firstName ? "border-destructive" : ""}
                autoComplete="given-name"
              />
              {errors.firstName && <span className="text-[11px] text-destructive">{errors.firstName}</span>}
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <User className="w-3.5 h-3.5" /> Last Name
              </label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className={errors.lastName ? "border-destructive" : ""}
                autoComplete="family-name"
              />
              {errors.lastName && <span className="text-[11px] text-destructive">{errors.lastName}</span>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={errors.email ? "border-destructive" : ""}
              autoComplete="email"
            />
            {errors.email && <span className="text-[11px] text-destructive">{errors.email}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="(555) 123-4567"
              className={errors.phone ? "border-destructive" : ""}
              autoComplete="tel"
            />
            {errors.phone && <span className="text-[11px] text-destructive">{errors.phone}</span>}
          </div>

          <Button type="submit" disabled={submitting} className="w-full mt-2">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Unlocking...</span>
              </>
            ) : (
              <>
                <span>Unlock AI Scan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> TLS 1.3</span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> No spam</span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Free estimate</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
