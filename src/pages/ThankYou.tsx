import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import { CheckCircle, Scan, Phone, Video, ArrowRight, Shield, Star, Headphones } from "lucide-react";

export default function ThankYou() {
  const navigate = useNavigate();
  const [leadData, setLeadData] = useState<{ name?: string; fromCity?: string; toCity?: string } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      const raw = localStorage.getItem("tm_lead");
      if (raw) setLeadData(JSON.parse(raw));
    } catch {}
  }, []);

  const firstName = leadData?.name?.split(" ")[0] || "";

  return (
    <SiteShell centered hideTrustStrip>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl bg-card border border-border shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-foreground px-6 py-5 text-center">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-background">
                Thank You{firstName ? `, ${firstName}` : ""}!
              </h1>
              <p className="text-sm text-background/70 mt-1">
                A moving specialist will be in contact with you shortly.
              </p>
            </div>

            {/* Route summary */}
            {leadData?.fromCity && leadData?.toCity && (
              <div className="px-6 pt-5 pb-2">
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{leadData.fromCity}</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{leadData.toCity}</span>
                </div>
              </div>
            )}

            {/* Action options */}
            <div className="p-6 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-4">
                While you wait, you can:
              </p>

              <button
                type="button"
                className="w-full flex items-center gap-3 p-4 rounded-xl ring-1 ring-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
                onClick={() => navigate("/scan-room")}
              >
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Scan className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground block">Build Your Inventory</span>
                  <span className="text-xs text-muted-foreground">AI scan or manual item builder</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-3 p-4 rounded-xl ring-1 ring-border hover:ring-primary/30 hover:bg-accent/30 transition-colors text-left"
                onClick={() => (window.location.href = "tel:+18001234567")}
              >
                <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground block">Call Us Now</span>
                  <span className="text-xs text-muted-foreground">Speak with a specialist right away</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-3 p-4 rounded-xl ring-1 ring-border hover:ring-primary/30 hover:bg-accent/30 transition-colors text-left"
                onClick={() => navigate("/book")}
              >
                <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground block">Video Consult</span>
                  <span className="text-xs text-muted-foreground">Live walkthrough with a specialist</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            </div>

            {/* Trust footer */}
            <div className="border-t border-border px-4 py-3 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> FMCSA Verified</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3" /> 4.9★ Rating</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Headphones className="w-3 h-3" /> 24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
