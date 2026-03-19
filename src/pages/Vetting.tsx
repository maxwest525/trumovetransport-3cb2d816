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
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <SiteShell hideTrustStrip>
      <div className="tru-vetting-page">
        

        {/* Hero Section */}
        <section className="tru-vetting-hero">
          {/* Left: Content */}
          <div className="tru-vetting-hero-content">
            <div className="tru-vetting-badge">
              <Shield className="w-3.5 h-3.5" />
              Carrier Protection System
            </div>

            <h1 className="tru-vetting-headline">
              <span>Every Carrier.</span>
              <span className="tru-vetting-headline-accent">Fully Verified.</span>
            </h1>

            <p className="tru-vetting-subheadline">
              We don't just find movers—we verify every carrier against FMCSA records, 
              analyze safety histories, and continuously monitor for your protection.
            </p>

            <div className="tru-vetting-trust-pills">
              {TRUST_PILLS.map((pill) => (
                <div key={pill.text} className="tru-vetting-pill">
                  <pill.icon className="w-3.5 h-3.5" />
                  {pill.text}
                </div>
              ))}
            </div>

            <div className="tru-vetting-hero-cta">
              <Link to="/site/carrier-vetting" className="tru-vetting-primary-btn">
                Vet a Carrier
                <Search className="w-4 h-4" />
              </Link>
              <Link to="/site/online-estimate" className="tru-vetting-secondary-btn">
                Get Protected Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
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

        {/* Process Section */}
        <section className="tru-vetting-process">
          <div className="tru-vetting-process-header">
            <h2 className="tru-vetting-section-title">
              How We Protect Your Move
            </h2>
            <p className="tru-vetting-section-subtitle">
              Our multi-layer verification process ensures you're matched with only the most reliable carriers.
            </p>
          </div>

          <div className="tru-vetting-process-grid">
            {PROCESS_STEPS.map((step, idx) => (
              <div key={idx} className="tru-vetting-process-card">
                <div className="tru-vetting-process-icon">
                  <step.icon className="w-5 h-5" />
                </div>
                <h3 className="tru-vetting-process-title">{step.title}</h3>
                <p className="tru-vetting-process-desc">{step.description}</p>
              </div>
            ))}
          </div>
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
            <Link to="/site/online-estimate" className="tru-vetting-cta-btn">
              Start Your Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
