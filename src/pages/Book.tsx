import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, ArrowRight, Shield, CheckCircle, Truck, Package, Calendar } from "lucide-react";
import SiteShell from "@/components/layout/SiteShell";
import { ScrollFadeIn } from "@/hooks/useScrollFadeIn";

const TRUST_ITEMS = [
  { icon: Shield, label: "FMCSA Licensed" },
  { icon: CheckCircle, label: "Insured & Bonded" },
  { icon: Truck, label: "Vetted Carriers" },
  { icon: Package, label: "Full-Service" },
];

export default function Book() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <SiteShell hideTrustStrip>
      {/* Hero */}
      <ScrollFadeIn>
        <section className="py-10 md:py-14 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px]" />
            <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-6">
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold mb-3">Schedule a Consultation</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="h-px w-8 bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span className="h-px w-8 bg-primary/40" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
                Book a <span className="text-primary">Call</span>
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg font-light leading-relaxed mt-4">
                Pick a time that works for you and speak with a moving specialist.
              </p>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {TRUST_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <item.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      {/* Cal.com Embed */}
      <ScrollFadeIn delay={0.1}>
        <section className="py-6 md:py-10 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-primary/[0.05] blur-[100px]" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Dark header bar */}
            <div className="bg-foreground text-background rounded-t-xl px-6 py-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-sm md:text-base font-bold uppercase tracking-wider">
                  PICK YOUR <span className="text-primary">TIME</span>
                </h2>
                <p className="text-background/60 text-xs mt-0.5">Select a date and time below to schedule your consultation</p>
              </div>
            </div>

            {/* Cal.com iframe */}
            <div className="cal-embed-container">
              <iframe
                src="https://cal.com/trumove?embed=true&theme=dark&layout=month_view"
                title="Schedule a consultation with TruMove"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      {/* Bottom CTA */}
      <ScrollFadeIn delay={0.2}>
        <section className="py-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/[0.06] blur-[120px]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          </div>
          <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Prefer an instant <span className="text-primary">quote</span>?
            </h2>
            <p className="text-muted-foreground text-sm md:text-base font-light mb-6">
              Skip the call and get a price estimate right now.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/online-estimate"
                className="inline-flex items-center gap-2 h-11 px-8 rounded-lg bg-foreground text-background font-semibold text-sm hover:bg-foreground/85 transition-all duration-200 hover:shadow-[0_4px_12px_hsl(var(--foreground)/0.15)]"
              >
                Get Instant Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:+16097277647"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg border border-border text-foreground font-semibold text-sm hover:border-primary/40 transition-all duration-200"
              >
                <Phone className="w-4 h-4" />
                (609) 727-7647
              </a>
            </div>
          </div>
        </section>
      </ScrollFadeIn>
    </SiteShell>
  );
}
