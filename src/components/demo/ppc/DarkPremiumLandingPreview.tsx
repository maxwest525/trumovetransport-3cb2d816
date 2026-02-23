import { BuildSelections } from "./AnalyticsBuilderPanel";
import {
  Star, Shield, Truck, Clock, Phone, MapPin,
  CheckCircle2, ArrowRight, Quote, Zap, BarChart3,
} from "lucide-react";

interface DarkPremiumLandingPreviewProps {
  selections: BuildSelections;
  onBack?: () => void;
}

export function DarkPremiumLandingPreview({ selections, onBack }: DarkPremiumLandingPreviewProps) {
  const primaryKeyword = selections.keywords[0] || "Long Distance Moving";
  const primaryLocation = selections.locations[0] || "California";
  const allLocations = selections.locations.length > 0 ? selections.locations : ["California", "Texas", "Florida"];
  const audience = selections.demographics[0] || "Homeowners";

  return (
    <div className="w-full rounded-xl overflow-hidden border border-border shadow-2xl">
      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-slate-500 ml-2 font-mono">trumove-{primaryLocation.toLowerCase().replace(/\s/g, '')}.com</span>
        </div>
        {onBack && (
          <button onClick={onBack} className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Back to Builder
          </button>
        )}
      </div>

      {/* ── Page Content ─────────────────────────────────────────── */}
      <div className="bg-slate-950 text-white">

        {/* ── Nav ───────────────────────────────────────────────── */}
        <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-400" />
            <span className="text-lg font-bold tracking-tight">TruMove</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <span className="text-white font-medium">Home</span>
            <span className="hover:text-white transition-colors cursor-default">Services</span>
            <span className="hover:text-white transition-colors cursor-default">Reviews</span>
            <span className="hover:text-white transition-colors cursor-default">Get Quote</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">(800) 555-MOVE</span>
          </div>
        </nav>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative px-8 py-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <Zap className="w-3 h-3" /> AI-Powered Estimates in 60 Seconds
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                {primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)}{" "}
                <span className="text-emerald-400">
                  in {primaryLocation}
                </span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                Trusted by {audience.toLowerCase()} across {allLocations.join(", ")}. Get instant quotes, real-time tracking, and guaranteed damage protection.
              </p>

              {/* CTA */}
              <div className="flex items-center gap-2 max-w-md">
                <div className="flex-1 flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-3">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-500">Enter your ZIP code</span>
                </div>
                <button className="px-6 py-3 bg-white text-slate-950 font-semibold rounded-lg text-sm whitespace-nowrap hover:bg-slate-100 transition-colors">
                  Get Free Quote <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      {["JM", "SK", "RL", "AT"][i]}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                  </div>
                  <span className="text-slate-500 text-xs">4.9/5 from 2,847 reviews</span>
                </div>
              </div>
            </div>

            {/* Hero Card */}
            <div className="relative hidden md:block">
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Your Moving Estimate</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">AI Generated</span>
                </div>
                <div className="text-3xl font-extrabold text-white">$2,450 - $3,200</div>
                <div className="text-xs text-slate-500">Based on 2BR apartment • {primaryLocation} → Houston</div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                  {[
                    { label: "Distance", value: "1,420 mi" },
                    { label: "Est. Weight", value: "4,200 lbs" },
                    { label: "Transit Time", value: "5-7 days" },
                    { label: "Insurance", value: "Included" },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-800/60 rounded-lg p-2.5">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</div>
                      <div className="text-sm font-semibold text-slate-200">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Strip ──────────────────────────────────────── */}
        <section className="border-y border-slate-800/60 py-6 px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="text-xs text-slate-600 uppercase tracking-widest">Trusted by</span>
            <div className="flex items-center gap-10">
              {["Google", "Yelp", "BBB A+", "AMSA", "FMCSA"].map((logo) => (
                <span key={logo} className="text-sm font-semibold text-slate-600 tracking-wide">{logo}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Grid ─────────────────────────────────────── */}
        <section className="px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Our Services</h2>
              <p className="text-slate-400 max-w-xl mx-auto">Everything you need for a stress-free move, powered by AI technology and decades of experience.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Truck, title: "Long Distance Moving", desc: "Cross-country relocations with real-time GPS tracking and dedicated move coordinators." },
                { icon: Shield, title: "Full-Value Protection", desc: "Comprehensive coverage up to $50,000. Every item inventoried and insured." },
                { icon: Clock, title: "Flexible Scheduling", desc: "Choose your exact pickup and delivery windows. Weekend and evening availability." },
                { icon: BarChart3, title: "AI Cost Optimizer", desc: "Our algorithm finds the best rates by analyzing 10,000+ data points in real time." },
              ].map((feature) => (
                <div key={feature.title} className="group p-6 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/20 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats Bar ────────────────────────────────────────── */}
        <section className="border-y border-slate-800/60 py-12 px-8 bg-slate-900/40">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50,000+", label: "Moves Completed" },
              { value: "4.9", label: "Average Rating" },
              { value: "98%", label: "On-Time Delivery" },
              { value: "$0", label: "Hidden Fees" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold text-emerald-400">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────────── */}
        <section className="px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">What Our Customers Say</h2>
              <p className="text-slate-400">Real reviews from verified customers</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { name: "Sarah M.", location: primaryLocation, quote: "Absolutely seamless experience. The AI estimate was within $50 of the final cost. Highly recommend!", rating: 5 },
                { name: "James K.", location: allLocations[1] || "Texas", quote: "Best movers I've ever used. On time, careful with everything, and the tracking app kept me updated the whole way.", rating: 5 },
                { name: "Linda R.", location: allLocations[2] || "Florida", quote: "Got quotes from 5 companies — TruMove was the most transparent and affordable. Zero hidden fees.", rating: 5 },
              ].map((review) => (
                <div key={review.name} className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-4">
                  <Quote className="w-8 h-8 text-emerald-500/20" />
                  <p className="text-slate-300 text-sm leading-relaxed italic">"{review.quote}"</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                    <div>
                      <div className="font-semibold text-white text-sm">{review.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {review.location}</div>
                    </div>
                    <div className="flex gap-0.5 text-yellow-400">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quote Form ───────────────────────────────────────── */}
        <section className="px-8 py-16 bg-slate-900/60">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Move?</h2>
            <p className="text-slate-400">Get your free, no-obligation quote in under 60 seconds.</p>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-8 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                {["Full Name", "Phone Number", "Moving From (ZIP)", "Moving To (ZIP)"].map((label) => (
                  <div key={label}>
                    <label className="text-xs text-slate-400 mb-1 block">{label}</label>
                    <div className="w-full h-10 rounded-lg bg-slate-900/80 border border-slate-700/60" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Move Date</label>
                <div className="w-full h-10 rounded-lg bg-slate-900/80 border border-slate-700/60" />
              </div>
              <button className="w-full py-3 bg-white text-slate-950 font-semibold rounded-lg text-sm hover:bg-slate-100 transition-colors">
                Get My Free Quote <ArrowRight className="w-4 h-4 inline ml-1" />
              </button>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> No obligation</span>
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" /> Data encrypted</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-400" /> Response in 60s</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="border-t border-slate-800/60 px-8 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">TruMove</span>
            </div>
            <div className="flex gap-6 text-xs text-slate-500">
              <span>Home</span><span>Services</span><span>Reviews</span><span>Quote</span><span>Privacy</span><span>Terms</span>
            </div>
            <div className="text-xs text-slate-600">© 2025 TruMove. All rights reserved.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
