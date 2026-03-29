import { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";
import { initAttribution } from "@/lib/leadAttribution";

const CONSENT_KEY = "tm_tracking_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent === "accepted") {
      // Already accepted — initialize tracking silently
      initAttribution();
    } else if (consent !== "declined") {
      // No decision yet — show banner
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
    initAttribution();
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed">
              We use cookies and similar technologies to improve your experience, analyze site traffic, and personalize your move estimate.{" "}
              <a href="/privacy" className="text-primary underline underline-offset-2 hover:text-primary/80">
                Privacy Policy
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDecline}
              className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
