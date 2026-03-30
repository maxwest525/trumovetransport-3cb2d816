import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import Confetti from "@/components/Confetti";
import { CheckCircle, Scan, Phone, Video, ArrowRight, Shield, Star, Headphones, MessageCircle, Truck, MapPin, FileText } from "lucide-react";

export default function ThankYou() {
  const navigate = useNavigate();
  const [leadData, setLeadData] = useState<{ name?: string; fromCity?: string; toCity?: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      const raw = localStorage.getItem("tm_lead");
      if (raw) setLeadData(JSON.parse(raw));
    } catch {}
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const firstName = leadData?.name?.split(" ")[0] || "";

  const features = [
    { icon: Scan, label: "Inventory Builder", desc: "AI scan or manual item list", route: "/scan-room" },
    { icon: Video, label: "Video Consult", desc: "Live walkthrough with a specialist", route: "/book" },
    { icon: MapPin, label: "Track Shipment", desc: "Real-time move tracking", route: "/track" },
    { icon: Shield, label: "Carrier Vetting", desc: "FMCSA verified carriers", route: "/vetting" },
    { icon: FileText, label: "Online Estimate", desc: "Detailed cost breakdown", route: "/online-estimate" },
    { icon: MessageCircle, label: "Chat with Trudy", desc: "AI-powered move assistant", action: "chat" },
  ];

  return (
    <SiteShell centered hideTrustStrip>
      <Confetti show={showConfetti} />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          {/* Celebration hero */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6 ring-4 ring-primary/20 animate-scale-in">
              <CheckCircle className="w-14 h-14 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Thank You{firstName ? `, ${firstName}` : ""}!
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              A specialist will contact you shortly.
            </p>
            <p className="text-base text-muted-foreground/80 mt-2 max-w-lg mx-auto">
              We're excited for you to learn more about the <span className="font-semibold text-foreground">TruMove experience</span> — sit back, we've got it from here.
            </p>
          </div>

          {/* Route summary pill */}
          {leadData?.fromCity && leadData?.toCity && (
            <div className="flex justify-center mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-muted/60 ring-1 ring-border text-sm">
                <Truck className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{leadData.fromCity}</span>
                <ArrowRight className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{leadData.toCity}</span>
              </div>
            </div>
          )}

          {/* Primary CTA */}
          <div className="flex justify-center gap-3 mb-10 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <button
              onClick={() => (window.location.href = "tel:+18001234567")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/85 transition-all shadow-lg"
            >
              <Phone className="w-4 h-4" /> Call Us Now
            </button>
          </div>

          {/* Feature grid */}
          <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-4">
              While you wait, explore:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {features.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl ring-1 ring-border hover:ring-primary/40 hover:bg-accent/30 transition-all text-center"
                  onClick={() => {
                    if (f.action === "chat") {
                      window.dispatchEvent(new CustomEvent("openTrudyChat"));
                    } else if (f.route) {
                      navigate(f.route);
                    }
                  }}
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <f.icon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{f.label}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trust footer */}
          <div className="mt-8 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.15em] text-muted-foreground animate-fade-in" style={{ animationDelay: "500ms" }}>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> FMCSA Verified</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> 4.9★ Rating</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Headphones className="w-3 h-3" /> 24/7 Support</span>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
