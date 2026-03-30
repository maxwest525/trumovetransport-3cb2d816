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
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed">
              We use cookies and similar tracking technologies to personalize your experience, remember your preferences, analyze how you use our site, measure ad performance, and improve our services. By clicking &ldquo;Accept All,&rdquo; you consent to our full use of cookies as described in our{" "}
              <a href="/privacy" className="text-primary underline underline-offset-2 hover:text-primary/80">
                Privacy Policy
              </a>.
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
