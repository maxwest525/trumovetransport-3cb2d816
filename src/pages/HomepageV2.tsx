import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Truck, Scan, Route, Sparkles, Star, CheckCircle, Phone, Zap, Globe, BarChart3, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";

export default function HomepageV2() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[hsl(200,15%,8%)] text-white font-sans overflow-x-hidden">
      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[hsl(200,15%,8%)/0.85] border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/homepage-2" className="flex items-center gap-2.5">
            <img src={logoImg} alt="TruMove" className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">TruMove</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/agent-login">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5">
                Sign In
              </Button>
            </Link>
            <Link to="/online-estimate">
              <Button size="sm" className="bg-[hsl(175,70%,40%)] hover:bg-[hsl(175,70%,35%)] text-white border-0 rounded-lg px-5">
                Get Estimate
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] rounded-full bg-[hsl(175,80%,30%)] opacity-[0.07] blur-[120px]" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[70%] rounded-full bg-[hsl(200,80%,35%)] opacity-[0.06] blur-[100px]" />
          <div className="absolute top-[30%] right-[20%] w-[30%] h-[40%] rounded-full bg-[hsl(160,60%,25%)] opacity-[0.05] blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(175,70%,40%)/0.3] bg-[hsl(175,70%,40%)/0.08] mb-8">
              <Sparkles className="w-3.5 h-3.5 text-[hsl(175,70%,50%)]" />
              <span className="text-xs font-medium text-[hsl(175,70%,60%)]">AI-Powered Moving Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Move smarter,{" "}
              <span className="bg-gradient-to-r from-[hsl(175,80%,50%)] to-[hsl(200,80%,55%)] bg-clip-text text-transparent">
                not harder.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 max-w-xl mb-10 leading-relaxed">
              AI scans your home, matches FMCSA-vetted carriers, and gives you instant pricing — all before a single box is packed.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/online-estimate">
                <Button className="h-12 px-8 bg-[hsl(175,70%,40%)] hover:bg-[hsl(175,70%,35%)] text-white border-0 rounded-xl text-base font-semibold shadow-[0_0_30px_hsl(175,70%,40%,0.3)]">
                  Get Your Estimate <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/scan-room">
                <Button variant="outline" className="h-12 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-base">
                  Try AI Scanner
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-12 text-xs text-white/40">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[hsl(175,70%,50%)]" /> FMCSA Verified</span>
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[hsl(175,70%,50%)]" /> 256-bit Encryption</span>
              <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-[hsl(175,70%,50%)]" /> 4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO FEATURE GRID */}
      <section id="features" className="relative py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to move</h2>
            <p className="text-white/40 max-w-lg mx-auto">Precision at speed, without the grind.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Large card */}
            <div className="md:col-span-2 group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 overflow-hidden hover:border-[hsl(175,70%,40%)/0.3] transition-all duration-500">
              <div className="absolute top-0 right-0 w-[50%] h-[60%] bg-[hsl(175,70%,30%)] opacity-[0.05] blur-[80px] group-hover:opacity-[0.1] transition-opacity" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-[hsl(175,70%,40%)/0.1] border border-[hsl(175,70%,40%)/0.2] flex items-center justify-center mb-5">
                  <Scan className="w-5 h-5 text-[hsl(175,70%,50%)]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Room Scanner</h3>
                <p className="text-white/40 text-sm leading-relaxed max-w-md">
                  Point your camera at any room. Our AI identifies every piece of furniture, calculates cubic footage, and estimates weight — in seconds.
                </p>
              </div>
              {/* Mock preview */}
              <div className="mt-6 rounded-xl border border-white/[0.06] bg-[hsl(200,15%,6%)] p-4 h-48 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-white/20">
                  <div className="w-16 h-16 rounded-xl border border-dashed border-[hsl(175,70%,40%)/0.3] flex items-center justify-center">
                    <Scan className="w-7 h-7 text-[hsl(175,70%,40%)/0.4]" />
                  </div>
                  <span className="text-xs">Live detection preview</span>
                </div>
              </div>
            </div>

            {/* Tall right card */}
            <div className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 overflow-hidden hover:border-[hsl(175,70%,40%)/0.3] transition-all duration-500">
              <div className="absolute bottom-0 left-0 w-[60%] h-[50%] bg-[hsl(200,80%,35%)] opacity-[0.05] blur-[60px] group-hover:opacity-[0.1] transition-opacity" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-[hsl(200,70%,40%)/0.1] border border-[hsl(200,70%,40%)/0.2] flex items-center justify-center mb-5">
                  <Shield className="w-5 h-5 text-[hsl(200,70%,55%)]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Carrier Vetting</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Every carrier is verified through FMCSA's SAFER database. We check licenses, insurance, complaint history, and safety ratings before matching.
                </p>
                {/* Stats */}
                <div className="mt-8 space-y-4">
                  {[
                    { label: "Carriers Vetted", value: "12,400+" },
                    { label: "Claims Ratio", value: "< 0.3%" },
                    { label: "Avg Rating", value: "4.9/5" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                      <span className="text-xs text-white/30">{stat.label}</span>
                      <span className="text-sm font-semibold text-[hsl(175,70%,55%)]">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom row - 3 equal cards */}
            {[
              { icon: Route, color: "175", title: "Real-Time Tracking", desc: "GPS tracking with live ETA updates, weather alerts, and driver communication." },
              { icon: BarChart3, color: "200", title: "Instant Pricing", desc: "AI-calculated estimates based on distance, weight, season, and market rates." },
              { icon: Globe, color: "160", title: "Nationwide Network", desc: "Coverage across all 50 states with local and long-distance specialists." },
            ].map((item) => (
              <div key={item.title} className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 overflow-hidden hover:border-[hsl(175,70%,40%)/0.3] transition-all duration-500">
                <div className="w-9 h-9 rounded-lg bg-[hsl(${item.color},70%,40%)/0.1] border border-[hsl(${item.color},70%,40%)/0.2] flex items-center justify-center mb-4">
                  <item.icon className={`w-4.5 h-4.5 text-[hsl(${item.color},70%,55%)]`} />
                </div>
                <h3 className="text-base font-semibold mb-1.5">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative py-24 border-t border-white/[0.04]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[30%] w-[40%] h-[60%] rounded-full bg-[hsl(175,60%,25%)] opacity-[0.04] blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-white/40 max-w-lg mx-auto">Three steps. Zero chaos.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Scan Your Space",
                desc: "Open the AI scanner and point your camera at each room. We detect and catalog everything automatically.",
                icon: Scan,
              },
              {
                step: "02",
                title: "Get Matched",
                desc: "Our algorithm matches your move profile with FMCSA-vetted carriers optimized for your route and timeline.",
                icon: Shield,
              },
              {
                step: "03",
                title: "Move with Confidence",
                desc: "Track your shipment in real-time, communicate with your driver, and enjoy a transparent, stress-free move.",
                icon: Truck,
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 h-full hover:border-[hsl(175,70%,40%)/0.2] transition-all">
                  <span className="text-5xl font-black text-white/[0.04] absolute top-4 right-6">{item.step}</span>
                  <div className="w-12 h-12 rounded-xl bg-[hsl(175,70%,40%)/0.1] border border-[hsl(175,70%,40%)/0.15] flex items-center justify-center mb-6">
                    <item.icon className="w-5 h-5 text-[hsl(175,70%,50%)]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / TESTIMONIALS */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by thousands</h2>
            <p className="text-white/40">Real moves, real reviews.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah K.", location: "NYC → LA", quote: "The AI scanner was mind-blowing. It cataloged my entire apartment in under 5 minutes.", rating: 5 },
              { name: "James T.", location: "Chicago → Miami", quote: "Best moving experience I've ever had. The real-time tracking gave me total peace of mind.", rating: 5 },
              { name: "Lisa M.", location: "Austin → Seattle", quote: "Saved $1,200 compared to other quotes. The carrier they matched me with was fantastic.", rating: 5 },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[hsl(45,90%,55%)] text-[hsl(45,90%,55%)]" />
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div>
                  <span className="text-sm font-medium">{t.name}</span>
                  <span className="text-xs text-white/30 ml-2">{t.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="relative py-32 border-t border-white/[0.04]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-[20%] w-[60%] h-full bg-[hsl(175,70%,30%)] opacity-[0.04] blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to move<br />the right way?</h2>
          <p className="text-white/40 text-lg mb-10 max-w-md mx-auto">
            Get your AI-powered estimate in under 60 seconds. No obligations, no surprises.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/online-estimate">
              <Button className="h-14 px-10 bg-[hsl(175,70%,40%)] hover:bg-[hsl(175,70%,35%)] text-white border-0 rounded-xl text-lg font-semibold shadow-[0_0_40px_hsl(175,70%,40%,0.25)]">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="h-14 px-10 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-lg">
                View Original Site
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="TruMove" className="h-6 w-6 opacity-50" />
              <span className="text-sm text-white/30">© 2026 TruMove. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/30">
              <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
              <Link to="/faq" className="hover:text-white/60 transition-colors">FAQ</Link>
              <Link to="/about" className="hover:text-white/60 transition-colors">About</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
