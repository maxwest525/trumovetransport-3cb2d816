import { useState } from "react";
import { User, Phone, Mail, ArrowRight, Lock, Search, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPhoneNumber, isValidPhoneNumber } from "@/lib/phoneFormat";
import { markFormStart } from "@/lib/leadAttribution";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone: string; leadSource?: string; contactPreference?: string; moveUrgency?: string }) => void;
  targetFlow: "manual" | "ai";
}

export default function LeadCaptureModal({ isOpen, onClose, onSubmit, targetFlow }: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [contactPreference, setContactPreference] = useState("");
  const [moveUrgency, setMoveUrgency] = useState("");
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
      onSubmit({ name, email, phone, leadSource, contactPreference, moveUrgency });
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
          We need basic contact info to save your progress. This allows us to continue your estimate seamlessly - we'll collect home details in the next step.
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

          {/* How did you hear about us? */}
          <div className="tru-lead-capture-field">
            <label className="tru-lead-capture-label">
              <Search className="w-3.5 h-3.5" />
              How did you hear about us?
            </label>
            <select
              value={leadSource}
              onChange={(e) => setLeadSource(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Select one (optional)</option>
              <option value="google">Google Search</option>
              <option value="social_media">Social Media</option>
              <option value="friend_family">Friend / Family</option>
              <option value="moving_com">Moving.com</option>
              <option value="yelp">Yelp</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Contact Preference */}
          <div className="tru-lead-capture-field">
            <label className="tru-lead-capture-label">
              <MessageSquare className="w-3.5 h-3.5" />
              Preferred Contact
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[{ label: "Call", value: "call" }, { label: "Text", value: "text" }, { label: "Email", value: "email" }].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setContactPreference(opt.value)}
                  className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-all ${contactPreference === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground hover:border-primary/40'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Move Urgency */}
          <div className="tru-lead-capture-field">
            <label className="tru-lead-capture-label">
              <ArrowRight className="w-3.5 h-3.5" />
              How soon are you moving?
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[{ label: "ASAP", value: "asap" }, { label: "30 Days", value: "30_days" }, { label: "Flexible", value: "flexible" }, { label: "Browsing", value: "just_browsing" }].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMoveUrgency(opt.value)}
                  className={`rounded-md border px-1.5 py-1.5 text-[10px] font-medium transition-all ${moveUrgency === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground hover:border-primary/40'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
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

          <p className="tru-lead-capture-disclaimer">
            <Lock className="w-3 h-3" /> Your info is secure and never sold.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
