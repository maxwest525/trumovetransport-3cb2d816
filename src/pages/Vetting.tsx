import { useEffect } from "react";

import { Link } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import { Shield, CheckCircle, AlertTriangle, TrendingUp, BadgeCheck, FileSearch, Clock, ArrowRight, Star, Search, Database, Activity, ClipboardCheck } from "lucide-react";
import previewImage from "@/assets/preview-carrier-vetting.jpg";
import logoImg from "@/assets/logo.png";

const TRUST_PILLS = [
  { icon: FileSearch, text: "FMCSA Records" },
  { icon: Clock, text: "24/7 Monitoring" },
  { icon: TrendingUp, text: "Safety Scores" },
  { icon: BadgeCheck, text: "Insurance Verified" },
];

const PROCESS_STEPS = [
  {
    icon: FileSearch,
    title: "FMCSA License Verification",
    description: "We verify every carrier's operating authority, insurance coverage, and USDOT registration in real-time.",
  },
  {
    icon: AlertTriangle,
    title: "Safety Record Analysis",
    description: "Deep analysis of inspection history, crash records, and compliance with federal safety regulations.",
  },
  {
    icon: TrendingUp,
    title: "TruMove Score Rating",
    description: "Our proprietary algorithm rates carriers A+ to F based on 50+ data points for easy comparison.",
  },
  {
    icon: Clock,
    title: "Continuous Monitoring",
    description: "Carriers are monitored 24/7 for any changes in status, insurance lapses, or safety violations.",
  },
];

const STATS = [
  { value: "2,847", label: "Carriers Vetted" },
  { value: "99.2%", label: "Accuracy Rate" },
  { value: "24/7", label: "Monitoring" },
  { value: "A+", label: "Top Rating" },
];

export default function Vetting() {
  useEffect(() => { window.scrollTo(0, 0); document.title = "Vetting Moving Carriers | TruMove"; }, []);
  return (
    <SiteShell hideTrustStrip>
      <div className="tru-vetting-page relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px]" />
          <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        </div>
        

        {/* Hero Section */}
        <section className="tru-vetting-hero">
          {/* Left: Content */}
          <div className="tru-vetting-hero-content">
            <div className="tru-vetting-badge">
              <Shield className="w-3.5 h-3.5" />
              Carrier Protection System
            </div>

            <h1 className="tru-vetting-headline">
              <span>FMCSA-Verified</span>
              <span className="tru-vetting-headline-accent">Carrier Safety Records</span>
            </h1>

            {/* How It Works Steps - inline below headline */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-4 mb-6">
              {PROCESS_STEPS.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <step.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground leading-tight">{step.title}</h3>
                    <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 max-w-[180px]">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="tru-vetting-hero-cta">
              <Link to="/carrier-vetting" className="tru-vetting-primary-btn">
                Vet a Carrier
                <Search className="w-4 h-4" />
              </Link>
              <Link to="/online-estimate" className="tru-vetting-secondary-btn">
                Get Protected Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust pills below CTAs */}
            <div className="tru-vetting-trust-pills">
              {TRUST_PILLS.map((pill) => (
                <div key={pill.text} className="tru-vetting-pill">
                  <pill.icon className="w-3.5 h-3.5" />
                  {pill.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Preview Card */}
          <div className="tru-vetting-hero-visual">
            <div className="tru-vetting-preview-glow" />
            <div className="tru-vetting-preview-glow-secondary" />
            
            <div className="tru-vetting-preview-card">
              <div className="tru-vetting-preview-image-wrap">
                <img
                  src={previewImage}
                  alt="TruMove Carrier Vetting Dashboard"
                  className="tru-vetting-preview-image"
                />
                <div className="tru-vetting-preview-overlay" />
              </div>

              {/* Floating Badges */}
              <div className="tru-vetting-float-badge tru-vetting-badge-1">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Insurance Verified</span>
              </div>

              <div className="tru-vetting-float-badge tru-vetting-badge-2">
                <BadgeCheck className="w-4 h-4 text-primary" />
                <span>FMCSA Compliant</span>
              </div>

              <div className="tru-vetting-float-badge tru-vetting-badge-3 tru-vetting-score-badge">
                <div className="tru-vetting-score-ring">
                  <span className="tru-vetting-score-value">A+</span>
                </div>
                <span>TruMove Score</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="tru-vetting-stats">
          {STATS.map((stat, idx) => (
            <div key={idx} className="tru-vetting-stat">
              <div className="tru-vetting-stat-value">{stat.value}</div>
              <div className="tru-vetting-stat-label">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Testimonial / Trust Section */}
        <section className="tru-vetting-testimonial">
          <div className="tru-vetting-testimonial-card">
            <div className="tru-vetting-testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" style={{ color: 'hsl(45 93% 47%)' }} />
              ))}
            </div>
            <blockquote className="tru-vetting-testimonial-quote">
              "TruMove's vetting process gave us complete peace of mind. Every carrier was thoroughly verified 
              and our move went flawlessly."
            </blockquote>
            <div className="tru-vetting-testimonial-author">
              <div className="tru-vetting-testimonial-avatar">JM</div>
              <div>
                <div className="tru-vetting-testimonial-name">Jennifer M.</div>
                <div className="tru-vetting-testimonial-location">Los Angeles → New York</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="tru-vetting-cta-section">
          <div className="tru-vetting-cta-content">
            <h2 className="tru-vetting-cta-headline">
              Ready for a worry-free move?
            </h2>
            <p className="tru-vetting-cta-subtext">
              Get matched with verified carriers today.
            </p>
            <Link to="/online-estimate" className="tru-vetting-cta-btn">
              Start Your Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
