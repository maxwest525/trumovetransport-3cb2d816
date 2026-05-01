import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { initAttribution, getAttributionData } from "@/lib/leadAttribution";
import { initBehaviorTracking } from "@/lib/behaviorTracker";
import { supabase } from "@/integrations/supabase/client";

const CONSENT_KEY = "tm_tracking_consent";
const ANON_LEAD_KEY = "tm_anonymous_lead_id";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent === "accepted") {
      initAttribution();
      initBehaviorTracking();
    } else if (consent !== "declined") {
      setVisible(true);
    }
  }, []);

  const captureAnonymousVisitor = async () => {
    // Already captured this session
    if (localStorage.getItem(ANON_LEAD_KEY)) return;

    // Wait 2s for attribution data to accumulate
    await new Promise((r) => setTimeout(r, 2000));

    try {
      const attribution = getAttributionData();
      const { data, error } = await supabase.functions.invoke("capture-anonymous-visitor", {
        body: { attribution },
      });

      if (!error && data?.leadId) {
        localStorage.setItem(ANON_LEAD_KEY, data.leadId);
      }
    } catch (e) {
      console.error("Anonymous capture failed:", e);
    }
  };

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
    initAttribution();
    initBehaviorTracking();
    captureAnonymousVisitor();
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-3 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-xl mx-auto rounded-lg border border-border bg-card shadow-2xl overflow-hidden">
        <div className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-snug">
              We use cookies to personalize your experience, analyze usage, and improve our services. See our{" "}
              <a href="/privacy" className="text-primary underline underline-offset-2 hover:text-primary/80">
                Privacy Policy
              </a>.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleDecline}
              className="flex-1 sm:flex-none rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
