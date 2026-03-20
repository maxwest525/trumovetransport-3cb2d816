import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import SiteShell from "@/components/layout/SiteShell";
import { HowItWorks } from "@/components/auto-transport/HowItWorks";
import { QuoteWizard } from "@/components/auto-transport/QuoteWizard";
import { QuoteReveal } from "@/components/auto-transport/QuoteReveal";
import { ChatBubble } from "@/components/auto-transport/ChatBubble";
import { ScrollFadeIn } from "@/hooks/useScrollFadeIn";
import { Sparkles } from "lucide-react";

// Load model-viewer web component script
if (!document.querySelector('script[src*="model-viewer"]')) {
  const modelViewerScript = document.createElement('script');
  modelViewerScript.type = 'module';
  modelViewerScript.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
  document.head.appendChild(modelViewerScript);
}

export default function AutoTransport() {
  const quoteRef = useRef<HTMLDivElement>(null);
  const quoteRevealRef = useRef<HTMLDivElement>(null);
  const [showMobileCTA, setShowMobileCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowMobileCTA(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [quoteData, setQuoteData] = useState({
    year: "",
    make: "",
    model: "",
    vehicleType: "",
    running: "",
    size: "",
    from: "",
    to: "",
    timeframe: "",
    transportType: "",
  });

  const scrollToQuote = () => {
    quoteRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToQuoteReveal = () => {
    quoteRevealRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <SiteShell>
      {/* How It Works */}
      <ScrollFadeIn>
        <div className="pt-8">
          <HowItWorks />
        </div>
      </ScrollFadeIn>

      {/* Quote Wizard */}
      <ScrollFadeIn>
        <section ref={quoteRef} className="py-10 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/[0.05] blur-[100px]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-8 md:mb-12">
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold mb-3">Quote Builder</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="h-px w-8 bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span className="h-px w-8 bg-primary/40" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-5 tracking-tight leading-[1.1]">
                Build Your Quote
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg font-light leading-relaxed">
                Enter your vehicle and route details for an instant estimate.
              </p>
            </div>

            <QuoteWizard
              quoteData={quoteData}
              setQuoteData={setQuoteData}
              variant="expanded"
              onGetEstimate={scrollToQuoteReveal}
            />
          </div>
        </section>
      </ScrollFadeIn>

      {/* Quote Reveal */}
      <ScrollFadeIn>
        <QuoteReveal ref={quoteRevealRef} quoteData={quoteData} />
      </ScrollFadeIn>

      {/* Final CTA */}
      <section className="py-6 sm:py-10 md:py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">
              Auto transport should feel predictable.
            </h2>
            <p className="text-xs sm:text-sm sm:text-base text-muted-foreground mb-4 sm:mb-5 sm:mb-8">
              TruMove makes shipping simple — from quote to delivery.
            </p>
            <Button variant="premium" size="lg" onClick={scrollToQuote}>
              Get Instant Quote
              <Sparkles className="ml-2 w-4 h-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <AnimatePresence>
        {showMobileCTA && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
          >
            <div className="bg-background/95 backdrop-blur-xl border-t border-border/60 px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Get your free quote</p>
                <p className="text-xs text-muted-foreground truncate">Instant estimate available</p>
              </div>
              <Button variant="premium" onClick={scrollToQuote} className="shrink-0 text-sm font-medium px-5 py-2.5">
                Get Quote
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatBubble />
    </SiteShell>
  );
}
