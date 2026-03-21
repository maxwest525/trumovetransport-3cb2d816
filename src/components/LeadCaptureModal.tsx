import { useState } from "react";
import { X, User, Phone, Mail, ArrowRight, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPhoneNumber, isValidPhoneNumber } from "@/lib/phoneFormat";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
  targetFlow: "manual" | "ai";
}

export default function LeadCaptureModal({ isOpen, onClose, onSubmit, targetFlow }: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
      onSubmit({ name, email, phone });
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
              onChange={(e) => setName(e.target.value)}
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
