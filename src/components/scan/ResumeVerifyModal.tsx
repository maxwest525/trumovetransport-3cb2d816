import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Phone } from "lucide-react";

interface Props {
  open: boolean;
  challenge: "phone_last4" | "email";
  emailHintMasked?: string | null;
  loading?: boolean;
  errorMessage?: string | null;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

// Modal shown to customers who arrive via a one-time resume link. Forces them
// to prove they own the lead (last 4 of phone, or email on file) before any
// PII or scan data is rehydrated into the page.
export default function ResumeVerifyModal({
  open,
  challenge,
  emailHintMasked,
  loading = false,
  errorMessage,
  onSubmit,
  onCancel,
}: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear the field whenever the modal reopens or the challenge type changes.
  useEffect(() => {
    if (open) {
      setValue("");
      // Auto-focus on next tick so the keyboard pops on mobile.
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open, challenge]);

  const isPhone = challenge === "phone_last4";
  const Icon = isPhone ? Phone : Mail;
  const canSubmit = isPhone ? value.replace(/\D/g, "").length === 4 : value.includes("@");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    onSubmit(value.trim());
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Verify it's you
            </span>
          </div>
          <DialogTitle className="text-2xl">Resume your saved scan</DialogTitle>
          <DialogDescription>
            {isPhone
              ? "For your security, please enter the last 4 digits of the phone number on your account."
              : `Please confirm the email address on your account${
                  emailHintMasked ? ` (${emailHintMasked})` : ""
                }.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="resume-verify" className="flex items-center gap-2 text-sm">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              {isPhone ? "Last 4 digits of phone" : "Email address"}
            </Label>
            <Input
              ref={inputRef}
              id="resume-verify"
              type={isPhone ? "tel" : "email"}
              inputMode={isPhone ? "numeric" : "email"}
              autoComplete={isPhone ? "one-time-code" : "email"}
              maxLength={isPhone ? 4 : 254}
              placeholder={isPhone ? "1234" : "you@example.com"}
              value={value}
              onChange={(e) => {
                const next = isPhone ? e.target.value.replace(/\D/g, "").slice(0, 4) : e.target.value;
                setValue(next);
              }}
              className={isPhone ? "tracking-[0.5em] text-center text-lg font-semibold" : ""}
              disabled={loading}
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
              {errorMessage}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Resume scan"
              )}
            </Button>
          </DialogFooter>
        </form>

        <p className="text-[11px] text-muted-foreground text-center pt-1">
          This link is single-use and expires automatically.
        </p>
      </DialogContent>
    </Dialog>
  );
}
