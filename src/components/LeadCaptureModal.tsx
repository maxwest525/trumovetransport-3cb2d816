import { useState } from "react";
import { User, Phone, Mail, ArrowRight, Lock, Shield, CheckSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPhoneNumber, isValidPhoneNumber } from "@/lib/phoneFormat";
import { markFormStart } from "@/lib/leadAttribution";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone: string; smsConsent?: boolean }) => void;
  targetFlow: "manual" | "ai";
}

export default function LeadCaptureModal({ isOpen, onClose, onSubmit, targetFlow }: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.includes("@")) newErrors.email = "Valid email is required";
    if (!isValidPhoneNumber(phone)) newErrors.phone = "Valid phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ name, email, phone, smsConsent });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="tru-lead-capture-modal sm:max-w-[420px]">
        <DialogHeader className="tru-lead-capture-header">
          <DialogTitle className="tru-lead-capture-title">
            Before we start building your inventory
          </DialogTitle>
        </DialogHeader>
        
        <p className="tru-lead-capture-desc">
          We need basic contact info to save your progress and send your estimate.
        </p>

        <form onSubmit={handleSubmit} className="tru-lead-capture-form">
          <div className="tru-lead-capture-field">
            <label className="tru-lead-capture-label">
              <User className="w-3.5 h-3.5" />
              Full Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); markFormStart(); }}
              placeholder="Your full name"
              className={`tru-lead-capture-input ${errors.name ? 'has-error' : ''}`}
            />
            {errors.name && <span className="tru-lead-capture-error">{errors.name}</span>}
          </div>

          <div className="tru-lead-capture-field">
            <label className="tru-lead-capture-label">
              <Mail className="w-3.5 h-3.5" />
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`tru-lead-capture-input ${errors.email ? 'has-error' : ''}`}
            />
            {errors.email && <span className="tru-lead-capture-error">{errors.email}</span>}
          </div>

          <div className="tru-lead-capture-field">
            <label className="tru-lead-capture-label">
              <Phone className="w-3.5 h-3.5" />
              Phone Number
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="(555) 123-4567"
              className={`tru-lead-capture-input ${errors.phone ? 'has-error' : ''}`}
            />
            {errors.phone && <span className="tru-lead-capture-error">{errors.phone}</span>}
          </div>

          {/* SMS Consent Checkbox + TCPA Disclaimer */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <Checkbox
                checked={smsConsent}
                onCheckedChange={(v) => setSmsConsent(v === true)}
                className="mt-0.5 shrink-0"
                data-ui-switch="true"
              />
              <span className="text-[11px] leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                By checking this box, I agree to receive SMS text messages from TruMove
                regarding my request, including estimate updates, document notifications, and
                account-related information. Message frequency varies. Message and data rates
                may apply. Reply <strong>HELP</strong> for help or <strong>STOP</strong> to opt out at any time.
                View our{" "}
                <a href="/privacy" target="_blank" className="text-primary underline underline-offset-2 hover:text-primary/80">
                  Privacy Policy
                </a>{" "}
                &amp;{" "}
                <a href="/sms-consent" target="_blank" className="text-primary underline underline-offset-2 hover:text-primary/80">
                  SMS Terms
                </a>.
              </span>
            </label>
          </div>

          <div className="tru-lead-capture-actions">
            <Button type="submit" className="tru-lead-capture-submit">
              <span>Continue to {targetFlow === "ai" ? "AI Inventory" : "Manual Builder"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <button type="button" onClick={onClose} className="tru-lead-capture-cancel">
              Cancel
            </button>
          </div>

          {/* Trust strip */}
          <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> TLS 1.3</span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> FMCSA VERIFIED</span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" /> FIRST PARTY DATA</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
