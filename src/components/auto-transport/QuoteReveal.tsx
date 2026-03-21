import { forwardRef, useState, useEffect } from "react";
import { Lock, Phone, Mail, CircleCheck, ShieldCheck, BadgePercent, Clock, Sparkles, Activity, Zap, Fingerprint, ScanLine, Cpu, Layers, Car, MapPin, ArrowRightLeft, BadgeCheck, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import usMapImg from "@/assets/us-map.png";

interface QuoteRevealProps {
  quoteData: {
    year: string;
    make: string;
    model: string;
    vehicleType: string;
    running: string;
    size: string;
    from: string;
    to: string;
    timeframe: string;
    transportType: string;
  };
  hideSummary?: boolean;
  onScrollToContact?: () => void;
}

const perks = [
  { icon: Fingerprint, label: "No upfront deposit", description: "Pay only when your vehicle is picked up" },
  { icon: ScanLine, label: "Price match guarantee", description: "We'll match any competing written quote" },
  { icon: Cpu, label: "Fully insured transport", description: "Comprehensive coverage on every shipment" },
  { icon: Layers, label: "Seasonal & route discounts", description: "Save more on popular corridors and off-peak dates" },
];

function ExclusiveDealsOverlay({ from, to, onUnlock }: { from: string; to: string; onUnlock: () => void }) {
  const [carrierCount, setCarrierCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const targets = [3, 7, 9, 12];
    let i = 0;
    const interval = setInterval(() => {
      if (i < targets.length) {
        setCarrierCount(targets[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const fromCity = from.split(' ')[0];
  const toCity = to.split(' ')[0];

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] px-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
          Live · {carrierCount} carriers matched · {elapsed}s ago
        </p>
      </div>

      <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-center tracking-tight leading-tight">
        Route Rates Available
        <br />
        <span className="text-primary">Right Now</span>
      </h3>
      <p className="text-xs text-muted-foreground max-w-[300px] text-center leading-relaxed mb-5">
        Active carriers on the <span className="font-medium text-foreground">{fromCity}–{toCity}</span> corridor are offering competitive rates — availability shifts fast
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-7">
        {[
          { icon: Activity, text: `${carrierCount} carriers active` },
          { icon: Zap, text: "Same-week pickup" },
          { icon: Clock, text: "Rates held 24hrs" },
        ].map((deal) => (
          <span key={deal.text} className="flex items-center gap-1.5 text-[10px] font-medium text-foreground/80 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06]">
            <deal.icon className="w-3 h-3 text-primary" strokeWidth={1.5} />
            {deal.text}
          </span>
        ))}
      </div>

      <button
        onClick={onUnlock}
        className="group relative px-8 py-3.5 rounded-full border-2 border-primary text-primary font-bold text-sm tracking-wide hover:bg-primary hover:text-primary-foreground shadow-[0_0_25px_-6px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_40px_-4px_hsl(var(--primary)/0.6)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
      >
        <span className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
          See My Route Rates
        </span>
      </button>
      <p className="text-[10px] text-muted-foreground/50 mt-3">No commitment · Instant access</p>
    </div>
  );
}

export const QuoteReveal = forwardRef<HTMLDivElement, QuoteRevealProps>(
  ({ quoteData, hideSummary = false, onScrollToContact }, ref) => {
    const [callbackName, setCallbackName] = useState("");
    const [callbackPhone, setCallbackPhone] = useState("");
    const [callbackEmail, setCallbackEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [dealsUnlocked, setDealsUnlocked] = useState(false);

    const cityPositions: Record<string, { x: number; y: number }> = {
      "Miami FL": { x: 80, y: 88 },
      "Orlando FL": { x: 78, y: 78 },
      "Atlanta GA": { x: 72, y: 62 },
      "Dallas TX": { x: 45, y: 72 },
      "Los Angeles CA": { x: 12, y: 62 },
      "New York NY": { x: 85, y: 35 },
    };
    const fromPos = cityPositions[quoteData.from];
    const toPos = cityPositions[quoteData.to];

    const handleCallbackRequest = () => {
      if (!callbackName.trim() || !callbackPhone.trim() || !callbackEmail.trim()) {
        toast({ title: "Please fill in all fields", variant: "destructive" });
        return;
      }
      if (!/^[\d\s\-\+\(\)]{7,20}$/.test(callbackPhone.trim())) {
        toast({ title: "Please enter a valid phone number", variant: "destructive" });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(callbackEmail.trim())) {
        toast({ title: "Please enter a valid email address", variant: "destructive" });
        return;
      }
      setSubmitted(true);
      toast({ title: "Callback requested!", description: "An agent will reach out shortly." });
    };

    const calculatePrice = () => {
      let base: number;
      const basePrices: Record<string, Record<string, number>> = {
        "Miami FL": { "New York NY": 1200, "Los Angeles CA": 1800, "Atlanta GA": 650, "Dallas TX": 1300, "Orlando FL": 250 },
        "New York NY": { "Miami FL": 1200, "Los Angeles CA": 2500, "Atlanta GA": 850, "Dallas TX": 1600, "Orlando FL": 1100 },
        "Los Angeles CA": { "Miami FL": 1800, "New York NY": 2500, "Atlanta GA": 2200, "Dallas TX": 1400, "Orlando FL": 2000 },
        "Atlanta GA": { "Miami FL": 650, "New York NY": 850, "Los Angeles CA": 2200, "Dallas TX": 800, "Orlando FL": 450 },
        "Dallas TX": { "Miami FL": 1300, "New York NY": 1600, "Los Angeles CA": 1400, "Atlanta GA": 800, "Orlando FL": 1100 },
        "Orlando FL": { "Miami FL": 250, "New York NY": 1100, "Los Angeles CA": 2000, "Atlanta GA": 450, "Dallas TX": 1100 },
      };
      base = basePrices[quoteData.from]?.[quoteData.to] || 1000;
      if (quoteData.transportType === "Enclosed") base *= 1.35;
      if (quoteData.running === "Does not run") base *= 1.20;
      if (quoteData.size === "Oversize") base *= 1.20;
      if (quoteData.vehicleType === "Truck") base *= 1.10;
      if (quoteData.vehicleType === "SUV") base *= 1.05;
      const low = Math.round(base * 0.92);
      const high = Math.round(base * 1.08);
      return { low, high };
    };

    const price = calculatePrice();

    return (
      <>
      <section ref={ref} className="py-4 sm:py-10 md:py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full bg-primary/[0.08] blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/[0.06] blur-[80px]" />
          <div className="absolute left-1/2 top-2/3 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.14] blur-[120px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-3 sm:mb-8 md:mb-10">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold mb-1 sm:mb-3">Your Estimate</p>
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
              <span className="h-px w-8 bg-primary/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span className="h-px w-8 bg-primary/40" />
            </div>
            <h2 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
              Special Rates Available
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-1.5 sm:mt-3 max-w-md mx-auto leading-relaxed">
              Special rates available now based on your route — lock in pricing before availability shifts.
            </p>
            <button
              onClick={onScrollToContact}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm tracking-wide hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-[0_0_25px_-6px_hsl(var(--primary)/0.5)]"
            >
              <Tag className="w-4 h-4" strokeWidth={2} />
              Get Special Rates
            </button>
          </div>

          <div className="max-w-5xl mx-auto">
            {!hideSummary && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 mb-6">
              {/* Move Summary */}
              <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden relative flex flex-col min-h-[420px]">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-secondary/30" />
                  <div className="absolute inset-0 flex items-end justify-center blur-[12px] scale-[1.3]">
                    <Car className="w-80 h-80 text-foreground/[0.08] -mb-20 translate-x-6" strokeWidth={0.3} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/50 to-background/80" />
                </div>

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="px-5 pt-5 pb-4 border-b border-border/15">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-semibold mb-1.5">Move Summary</p>
                    <p className="text-lg font-bold text-foreground leading-tight">{quoteData.year} {quoteData.make} {quoteData.model}</p>
                    <p className="text-xs text-muted-foreground mt-1">{quoteData.vehicleType} · {quoteData.transportType}</p>
                  </div>
                  <div className="flex-1 flex flex-col justify-around px-5 py-3">
                    {[
                      { label: "Route", value: `${quoteData.from} → ${quoteData.to}` },
                      { label: "Type", value: `${quoteData.vehicleType} · ${quoteData.transportType}` },
                      { label: "Pickup", value: quoteData.timeframe },
                      ...(quoteData.running ? [{ label: "Cond.", value: `${quoteData.running}${quoteData.size ? ` · ${quoteData.size}` : ''}` }] : (quoteData.size ? [{ label: "Size", value: quoteData.size }] : [])),
                      { label: "Cover", value: "Full insurance included" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-baseline gap-3 py-2.5 border-b border-border/10 last:border-0">
                        <p className="text-[10px] text-muted-foreground/50 w-14 shrink-0 uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 border-t border-border/15">
                    {[
                      { label: "Distance", value: "~2,450 mi" },
                      { label: "Transit", value: "3–5 days" },
                      { label: "Carriers", value: "12+" },
                    ].map((stat, i) => (
                      <div key={stat.label} className={`text-center py-4 ${i < 2 ? 'border-r border-border/15' : ''}`}>
                        <p className="text-sm font-bold text-foreground">{stat.value}</p>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map + Deals Overlay */}
              <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden relative min-h-[420px]">
                <div className={`absolute inset-0 overflow-hidden bg-secondary/20 transition-all duration-700 ${!dealsUnlocked ? 'blur-[8px] scale-110' : 'blur-0 scale-100'}`}>
                  <img src={usMapImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
                </div>

                {!dealsUnlocked ? (
                  <ExclusiveDealsOverlay
                    from={quoteData.from}
                    to={quoteData.to}
                    onUnlock={() => setDealsUnlocked(true)}
                  />
                ) : (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center animate-fade-in pointer-events-none">
                    <div className="pointer-events-auto flex flex-col items-center text-center bg-background/70 backdrop-blur-sm rounded-xl px-6 py-5 border border-border/20">
                      <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center mb-3 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)]">
                        <CircleCheck className="w-5 h-5 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">Deals Unlocked!</p>
                      <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">
                        An agent will reach out with exclusive pricing for{" "}
                        <span className="font-medium text-foreground">{quoteData.from}</span> → <span className="font-medium text-foreground">{quoteData.to}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section id="personalized-rate" className="py-4 sm:py-10 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-3 sm:mb-8 md:mb-12">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold mb-1 sm:mb-3">Talk To An Agent</p>
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
              <span className="h-px w-8 bg-primary/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span className="h-px w-8 bg-primary/40" />
            </div>
            <h2 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
              Get Your Personalized Rate
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-1.5 sm:mt-3 max-w-md mx-auto leading-relaxed">
              Route-specific savings & expert guidance
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4">
              {/* Trust perks */}
              <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-5 flex flex-col gap-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-semibold mb-1">Why TruMove</p>
                {perks.map((perk) => (
                  <div key={perk.label} className="flex items-start gap-3 p-3 rounded-lg bg-background/40 border border-border/10">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5">
                      <perk.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">{perk.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{perk.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4 sm:p-6 flex flex-col justify-center relative overflow-hidden">
                {/* Priority Route Rate ribbon */}
                <div className="absolute top-0 right-0 z-10 overflow-hidden w-[180px] h-[180px] pointer-events-none">
                  <div className="absolute top-[28px] right-[-50px] w-[240px] rotate-45 bg-foreground text-background text-[9px] font-bold uppercase tracking-[0.12em] text-center py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.3)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                    ⚡ Priority Route Rate
                  </div>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-semibold mb-1 mt-6">Connect With Us</p>
                <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight mb-4">Request a Callback</h3>
                {!submitted ? (
                  <div className="space-y-3">
                    <Input placeholder="Your name" value={callbackName} onChange={(e) => setCallbackName(e.target.value)} className="bg-background/50 border-border/40 h-12" maxLength={100} />
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input type="tel" placeholder="Phone number" value={callbackPhone} onChange={(e) => setCallbackPhone(e.target.value)} className="pl-10 bg-background/50 border-border/40 h-12" maxLength={20} />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input type="email" placeholder="Email address" value={callbackEmail} onChange={(e) => setCallbackEmail(e.target.value)} className="pl-10 bg-background/50 border-border/40 h-12" maxLength={255} />
                    </div>
                    <Button variant="premium" onClick={handleCallbackRequest} className="w-full h-12 text-sm font-bold uppercase tracking-[0.1em]">
                      Get My Quote
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60 pt-1">
                      <Phone className="w-3 h-3" />
                      <span>Or call <a href="tel:+16097277647" className="text-primary hover:underline font-medium">(609) 727-7647</a></span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center animate-fade-in text-center py-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-[0_0_30px_-4px_hsl(var(--primary)/0.5),0_8px_20px_-6px_hsl(var(--primary)/0.3)] mb-4">
                      <CircleCheck className="w-7 h-7 text-primary-foreground drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]" strokeWidth={1.5} />
                    </div>
                    <p className="text-lg font-semibold text-foreground mb-1">Request received!</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      An agent will call you at <span className="font-medium text-foreground">{callbackPhone}</span> to finalize your transport details and available discounts.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      </>
    );
  }
);

QuoteReveal.displayName = "QuoteReveal";
