import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Phone, Calendar } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "What is TruMove in simple terms?",
    answer: "TruMove is an AI-powered moving broker that helps you get accurate quotes, vet movers, and coordinate your move. We use technology to compare real carrier data, check licensing and reviews, and give you a transparent price—all in minutes instead of days."
  },
  {
    question: "How is TruMove different from calling a mover directly?",
    answer: "When you call a mover directly, you get one quote from one company with no way to verify if it's fair. TruMove connects to multiple vetted carriers, compares options, and uses AI to predict accurate pricing based on millions of past moves. You also get our vetting layer—we check licenses, safety records, and reviews before any mover is offered to you."
  },
  {
    question: "Is my quote guaranteed?",
    answer: "Depending on the carrier and shipment type, you may receive a binding, non-binding, or guaranteed-not-to-exceed quote. We'll explain the difference and help you understand what's locked in. Our AI is trained to predict final costs within about 5-8% of the actual invoice, so surprises are rare."
  },
  {
    question: "Can I book a move online without speaking to anyone?",
    answer: "You can get an instant estimate and build your inventory online. For final booking, we recommend a quick call or video consult with a TruMove specialist to confirm details and match you with the right carrier. This takes about 15 minutes and helps prevent issues on move day."
  },
  {
    question: "Who actually performs the move?",
    answer: "TruMove is a licensed broker—we coordinate and arrange transportation with FMCSA-authorized motor carriers who perform the actual move. Every carrier on our platform is vetted for licensing, insurance, safety, and customer reviews before they're allowed to work with TruMove customers."
  },
  {
    question: "How does TruMove help reduce surprises and issues?",
    answer: "Our AI flags risk factors before you book—things like carriers with complaint patterns, pricing that seems too low, or moves with access challenges. We also track every job in real time and have a structured response process if anything goes wrong. Most problems in moving come from bad estimates or bad carriers—TruMove addresses both."
  },
  {
    question: "What can cause my quote to change?",
    answer: "Quotes can change if your inventory changes significantly, if there are access issues we didn't know about (stairs, long carries, elevators), or if you add services like packing. We build in buffers for minor changes, but major inventory additions will affect pricing. That's why an accurate inventory upfront helps lock in your price."
  },
  {
    question: "What if my inventory changes after I book?",
    answer: "Let us know as soon as possible. Small changes usually don't affect your quote much. For larger changes, we'll adjust the estimate and confirm with you before move day. It's always better to update early than to surprise the movers on site."
  },
  {
    question: "What happens if something goes wrong during the move?",
    answer: "TruMove has a dedicated support team and a structured incident process. If there's an issue—delays, damages, disputes—we step in to mediate between you and the carrier. Carriers with repeated problems are removed from the platform. You're not on your own."
  }
];

export default function FAQ() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <SiteShell>
      <div className="max-w-[900px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-[10px] font-black tracking-[0.24em] uppercase text-muted-foreground mb-3">
            FAQ
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">
            How TruMove works
          </h1>
          <p className="text-lg text-muted-foreground">
            TruMove helps you evaluate options, understand pricing, and coordinate your move with licensed carriers. Final booking is confirmed with a TruMove specialist.
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border/60 rounded-xl bg-card px-6 data-[state=open]:shadow-lg transition-shadow"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline py-5">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-5 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-black text-foreground mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Speak with a TruMove specialist to review your move and available options.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+16097277647"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-foreground text-background text-sm font-bold tracking-wide uppercase transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Phone className="w-4 h-4" />
              Talk to a Specialist
            </a>
            <Link
              to="/site/book"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-border/60 bg-card text-foreground text-sm font-bold tracking-wide uppercase transition-all hover:bg-muted/50"
            >
              <Calendar className="w-4 h-4" />
              Schedule a Call
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
