import SiteShell from "@/components/layout/SiteShell";
import { Car, Shield, MapPin, Clock, CheckCircle, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  { icon: Shield, title: "Fully Insured", desc: "Every vehicle is covered with comprehensive transport insurance." },
  { icon: MapPin, title: "Door-to-Door", desc: "We pick up and deliver your vehicle right to your location." },
  { icon: Clock, title: "On-Time Delivery", desc: "Real-time tracking and guaranteed delivery windows." },
  { icon: CheckCircle, title: "Vetted Carriers", desc: "All carriers are FMCSA-verified and safety-rated." },
];

export default function AutoTransport() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <Car className="w-4 h-4" />
            Auto Transport Services
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            Ship Your Vehicle <span className="text-primary">Anywhere</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Safe, reliable, and affordable auto transport across the country. Open and enclosed carriers available for cars, trucks, SUVs, and motorcycles.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/online-estimate">
              <Button size="lg" className="gap-2 text-base px-8">
                Get a Free Quote <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="tel:+16097277647">
              <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                <Phone className="w-4 h-4" /> Call Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">Why Ship With TruMove?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Request a Quote", desc: "Tell us your pickup and delivery locations, vehicle details, and preferred dates." },
              { step: "2", title: "We Match a Carrier", desc: "Our team finds the best vetted carrier for your route and vehicle type." },
              { step: "3", title: "Track & Receive", desc: "Follow your shipment in real-time and receive your vehicle at the destination." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mb-4 text-lg">
                  {s.step}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Ready to Ship Your Vehicle?</h2>
          <p className="text-muted-foreground mb-8">Get a free, no-obligation quote in minutes.</p>
          <Link to="/online-estimate">
            <Button size="lg" className="gap-2 text-base px-10">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
