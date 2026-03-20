import { Car, Route, Zap, CalendarClock, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const steps = [
  { icon: Car, label: "Enter your vehicle", description: "Provide vehicle details and condition" },
  { icon: Route, label: "Confirm route", description: "Select pickup and delivery locations" },
  { icon: Zap, label: "See your pricing", description: "Get instant transparent estimates" },
  { icon: CalendarClock, label: "Reserve shipment", description: "Book your preferred pickup window" },
  { icon: Navigation, label: "Track delivery", description: "Follow your vehicle in real-time" },
];

export function HowItWorks() {
  return (
    <section className="py-10 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-primary/[0.07] blur-[100px]" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-primary/[0.05] blur-[80px]" />
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
        <div className="text-center mb-10 md:mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold mb-3">Process</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="h-px w-8 bg-primary/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            <span className="h-px w-8 bg-primary/40" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-5 tracking-tight leading-[1.1]">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg font-light leading-relaxed">
            Five simple steps to ship your vehicle.
          </p>
        </div>

        {/* Desktop: horizontal row */}
        <div className="hidden md:block max-w-4xl mx-auto">
          <div className="grid grid-cols-5 gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
                className="relative text-center group cursor-default"
              >
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.12 + 0.3, ease: "easeOut" }}
                    className="absolute top-7 left-1/2 w-full h-px bg-gradient-to-r from-border/80 to-border/30 origin-left"
                  />
                )}
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.15, y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cn(
                      "w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 transition-colors duration-300",
                      index === 0
                        ? "text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
                        : "text-muted-foreground/60 group-hover:text-primary group-hover:drop-shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                    )}
                  >
                    <step.icon className="w-6 h-6" strokeWidth={1.5} />
                  </motion.div>
                  <p className="text-sm font-medium text-foreground mb-1">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden max-w-sm mx-auto">
          <div className="space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                className="relative flex items-start gap-4"
              >
                {index < steps.length - 1 && (
                  <div className="absolute left-[22px] top-[48px] w-px h-[calc(100%-12px)] bg-gradient-to-b from-border/60 to-border/20" />
                )}
                <div className={cn(
                  "relative z-10 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
                  index === 0
                    ? "text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
                    : "text-muted-foreground/60"
                )}>
                  <step.icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="pb-6 pt-2">
                  <p className="text-sm font-semibold text-foreground leading-tight">{step.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
