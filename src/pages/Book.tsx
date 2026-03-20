import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  Calendar as CalendarIcon, Clock, MapPin, Phone, ArrowRight,
  Truck, Package, Shield, CheckCircle, User, Mail
} from "lucide-react";
import SiteShell from "@/components/layout/SiteShell";
import { ScrollFadeIn } from "@/hooks/useScrollFadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

const SERVICE_TYPES = [
  { value: "local", label: "Local Move", desc: "Within 100 miles" },
  { value: "long-distance", label: "Long Distance", desc: "Interstate moves" },
  { value: "auto-transport", label: "Auto Transport", desc: "Vehicle shipping" },
  { value: "packing", label: "Packing Service", desc: "Full or partial packing" },
];

const TIME_SLOTS = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
];

const TRUST_ITEMS = [
  { icon: Shield, label: "FMCSA Licensed" },
  { icon: CheckCircle, label: "Insured & Bonded" },
  { icon: Truck, label: "Vetted Carriers" },
  { icon: Package, label: "Full-Service" },
];

export default function Book() {
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", origin: "", destination: "", notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !date || !serviceType) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(r => setTimeout(r, 1500));
    toast.success("Booking request submitted! We'll confirm within 24 hours.");
    setIsSubmitting(false);
    setFormData({ name: "", email: "", phone: "", origin: "", destination: "", notes: "" });
    setDate(undefined);
    setTimeSlot("");
    setServiceType("");
  };

  return (
    <SiteShell hideTrustStrip>
      {/* Hero */}
      <ScrollFadeIn>
        <section className="py-10 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px]" />
            <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-8">
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold mb-3">Schedule Your Move</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="h-px w-8 bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span className="h-px w-8 bg-primary/40" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
                Book Your <span className="text-primary">Move</span>
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg font-light leading-relaxed mt-4">
                Pick a date, choose your service, and we'll handle the rest.
              </p>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8">
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

      {/* Booking Form */}
      <ScrollFadeIn delay={0.1}>
        <section className="py-6 md:py-10 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-primary/[0.05] blur-[100px]" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <form onSubmit={handleSubmit}>
              {/* Form header bar */}
              <div className="bg-foreground text-background rounded-t-xl px-6 py-4">
                <h2 className="text-sm md:text-base font-bold uppercase tracking-wider">
                  SCHEDULE YOUR <span className="text-primary">CONSULTATION</span>
                </h2>
                <p className="text-background/60 text-xs mt-1">Fill in your details and preferred move date</p>
              </div>

              <div className="bg-card border border-t-0 border-border rounded-b-xl p-6 md:p-8 space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold mb-3">Contact Information</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Full name"
                          value={formData.name}
                          onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                          className="pl-10 text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                          className="pl-10 text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                          className="pl-10 text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Type */}
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold mb-3">Service Type</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SERVICE_TYPES.map((svc) => (
                      <motion.button
                        key={svc.value}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setServiceType(svc.value)}
                        className={cn(
                          "rounded-xl border-2 p-4 text-left transition-all duration-200",
                          serviceType === svc.value
                            ? "border-primary bg-primary/5 shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
                            : "border-border hover:border-foreground/20 bg-card"
                        )}
                      >
                        <p className="text-sm font-semibold text-foreground">{svc.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{svc.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Date & Time */}
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold mb-3">Preferred Date & Time</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Move Date *</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal text-sm",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(d) => d < new Date()}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Time Window</label>
                      <Select value={timeSlot} onValueChange={setTimeSlot}>
                        <SelectTrigger className="text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Select time window" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Locations */}
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold mb-3">Move Details</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Origin</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Pickup city or zip"
                          value={formData.origin}
                          onChange={(e) => setFormData(p => ({ ...p, origin: e.target.value }))}
                          className="pl-10 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Destination</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                        <Input
                          placeholder="Delivery city or zip"
                          value={formData.destination}
                          onChange={(e) => setFormData(p => ({ ...p, destination: e.target.value }))}
                          className="pl-10 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Additional Notes</label>
                  <Textarea
                    placeholder="Anything we should know? (stairs, special items, timing needs...)"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                    className="text-sm"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-sm font-bold bg-foreground text-background hover:bg-foreground/85 hover:shadow-[0_4px_12px_hsl(var(--foreground)/0.15)]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Submit Booking Request
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <p className="text-center text-[10px] text-muted-foreground">
                  We'll confirm your booking within 24 hours. No payment required now.
                </p>
              </div>
            </form>
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
              Skip the scheduling and get a price estimate right now.
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
