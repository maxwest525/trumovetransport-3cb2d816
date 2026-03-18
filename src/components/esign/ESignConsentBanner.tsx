import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ESignConsentBannerProps {
  consentGiven: boolean;
  onConsentChange: (given: boolean) => void;
  className?: string;
}

const CONSENT_TEXT =
  "I consent to conduct this transaction electronically and agree that my electronic signature is legally binding under the Electronic Signatures in Global and National Commerce Act (ESIGN Act) and the Uniform Electronic Transactions Act (UETA). I understand that I may withdraw this consent at any time before signing.";

export function ESignConsentBanner({ consentGiven, onConsentChange, className }: ESignConsentBannerProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        consentGiven
          ? "border-primary/30 bg-primary/5"
          : "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Shield className={cn("h-5 w-5 mt-0.5 flex-shrink-0", consentGiven ? "text-primary" : "text-amber-600 dark:text-amber-400")} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Electronic Signature Consent</h3>
            {!consentGiven && (
              <span className="text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                Required
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="esign-consent"
              checked={consentGiven}
              onCheckedChange={(checked) => onConsentChange(checked === true)}
            />
            <label htmlFor="esign-consent" className="text-xs font-medium text-foreground cursor-pointer">
              I agree to the electronic signature terms above
            </label>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
            <Info className="h-3 w-3" />
            <span>Your IP address, browser, and timestamp will be recorded for compliance.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
