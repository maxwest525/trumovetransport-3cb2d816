import { useEffect } from "react";

import { Link } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import { Clock, Target, Headphones, CheckCircle2, X } from "lucide-react";

const STATS = [
  { value: "60 sec", label: "Average time to get an AI backed quote" },
  { value: "±5-8%", label: "Typical accuracy window vs final invoice" },
  { value: "24/7", label: "AI monitoring for pricing and carrier risk" }
];

const COMPARISON = [
  {
    area: "Instant quotes",
    old: "Takes hours or days, often inaccurate.",
    new: "AI scrapes real time carrier availability, truck locations, fuel costs, seasonal demand, and historical job data, then gives you a binding or guaranteed not to exceed price in under 60 seconds."
  },
  {
    area: "Price accuracy",
    old: "Bait and switch is common.",
    new: "Machine learning models trained on millions of past moves predict the final cost within about 5 to 8 percent. No more \"oops, your stuff is heavier\" surprises."
  },
  {
    area: "Carrier matching",
    old: "Sales rep picks whoever pays the highest commission.",
    new: "AI scores and ranks movers by on time percentage, damage claims, reviews, licensing status, current capacity, and route efficiency, then matches you with the actual best fit, not the highest bidder."
  },
  {
    area: "Fraud and scam detection",
    old: "Almost none.",
    new: "AI flags red flags in real time: unlicensed carriers, fake reviews, companies with sudden price spikes, or patterns of holding items hostage. Bad actors are automatically blocked from the platform."
  },
  {
    area: "Dynamic pricing",
    old: "Fixed or quietly inflated to pad margins.",
    new: "Like ride share surge, but fair. Prices adjust in real time based on demand, but the algorithm is transparent and capped so customers are not gouged."
  },
  {
    area: "Inventory accuracy",
    old: "Phone call guesswork.",
    new: "AI powered visual inventory from video walkthroughs and photos. Computer vision identifies items and estimates weight, reducing over or under counting."
  },
  {
    area: "Live tracking",
    old: "You call and hope someone answers.",
    new: "Real time GPS tracking, automated ETA updates, and push notifications. You always know where your stuff is."
  },
  {
    area: "Customer support",
    old: "9 to 5, maybe. Endless hold times.",
    new: "AI chat for instant answers plus human escalation paths. Issues are flagged and prioritized before you even ask."
  },
  {
    area: "Claims and disputes",
    old: "Good luck.",
    new: "AI powered claims intake, automated damage assessment via photos, and faster resolution with transparent status updates."
  }
];

export default function About() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <SiteShell>
      
      <div className="max-w-[1480px] mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="text-[10px] font-black tracking-[0.24em] uppercase text-muted-foreground mb-3">
            Learn More
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            The first AI powered way to book your move.
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            TruMove is built to make moving feel less like a gamble and more like a clean, predictable transaction. No guesswork, no mystery fees, just data driven quotes and movers who actually show up.
          </p>
        </div>

        {/* About Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-2xl border border-border/60 bg-card">
            <h2 className="text-2xl font-black text-foreground mb-4">About TruMove</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                TruMove was created by people who have seen both sides of the moving industry – the customers who feel stressed and in the dark, and the operations teams trying to juggle trucks, crews, and unpredictable demand.
              </p>
              <p>
                Instead of another broker making calls in the background, TruMove works more like a flight search engine. Our AI connects to real carrier data, capacity, and route networks so you can compare options in one place, then lock in a transparent price in minutes.
              </p>
              <p>
                Every move that runs through TruMove feeds back into the system. That means better price predictions, smarter carrier matching, and fewer surprises for the next customer. The platform gets smarter with every truck that rolls.
              </p>
              <p className="font-semibold text-foreground">
                Our goal is simple: make moving as easy and transparent as booking a flight.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl border border-border/60 bg-card flex flex-col">
            <h2 className="text-2xl font-black text-foreground mb-4">Technology that works for you</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                The moving industry has a trust problem. Big brokers shuffle your job between unknown carriers, and when something goes wrong, you're stuck in a phone tree talking to someone reading from a script who has never seen a moving truck.
              </p>
              <p>
                We built TruMove to flip that equation. Our AI vets every carrier in real time – checking federal licensing, insurance, complaint history, and actual performance data – so you're matched with movers who have skin in the game, not whoever bid lowest that morning.
              </p>
              <p>
                When you have a question, you get answers from people (and AI) who actually understand your move, not a call center halfway around the world. Every price is locked in writing. Every carrier is accountable. Every step is tracked.
              </p>
              <p className="font-semibold text-foreground">
                It's the kind of service that used to be reserved for corporate relocations – now available to everyone.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {STATS.map((stat) => (
            <div key={stat.value} className="p-6 rounded-xl border border-border/60 bg-card text-center">
              <div className="text-4xl font-black text-foreground mb-2">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mb-16">
          * Stats are target benchmarks based on platform design. Actual results vary by move type and complexity.
        </p>

        {/* Comparison */}
        <section className="mb-16">
          <h2 className="text-2xl font-black text-foreground mb-4 text-center">
            Why choose TruMove over the old way.
          </h2>
          <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-8">
            Traditional moving brokers rely on phone calls, manual quotes, and whoever they have a relationship with that day. TruMove uses real data, AI models, and constant feedback from completed jobs to give you a smarter way to move.
          </p>

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border/40">
                  <th className="text-left px-6 py-4 font-bold text-xs tracking-wide uppercase text-muted-foreground">Area</th>
                  <th className="text-left px-6 py-4 font-bold text-xs tracking-wide uppercase text-muted-foreground">
                    <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-orange-500/10 text-orange-600">
                      Old Way
                    </span>
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-xs tracking-wide uppercase text-muted-foreground">
                    <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-muted/60 border border-border/40 text-foreground font-bold">
                      TruMove
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, index) => (
                  <tr key={row.area} className={index % 2 === 0 ? 'bg-card' : 'bg-muted/10'}>
                    <td className="px-6 py-4 font-semibold text-foreground align-top whitespace-nowrap">{row.area}</td>
                    <td className="px-6 py-4 text-muted-foreground align-top">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        {row.old}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground align-top">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {row.new}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-black text-foreground mb-4">Ready to experience the difference?</h2>
          <p className="text-muted-foreground mb-6">
            Get an AI-powered quote in 60 seconds or talk to a specialist.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/site/online-estimate"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-foreground text-background text-sm font-bold tracking-wide uppercase transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Get an Estimate
            </Link>
            <Link
              to="/site/book"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-border/60 bg-card text-foreground text-sm font-bold tracking-wide uppercase transition-all hover:bg-muted/50"
            >
              Book a Consult
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
