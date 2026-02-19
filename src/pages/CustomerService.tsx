import { useState, useCallback } from 'react';
import { Phone, Mail, Send, Clock, Shield, Truck, Calculator, MapPin, Calendar, HelpCircle, Package, ScanLine, Video, Sparkles, ArrowRight } from 'lucide-react';
import SiteShell from '@/components/layout/SiteShell';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AIChatContainer from '@/components/chat/AIChatContainer';
import trudyAvatar from '@/assets/trudy-avatar.png';

const capabilities = [
  { icon: Calculator, label: 'Instant Quotes', desc: 'Get a ballpark estimate in seconds' },
  { icon: MapPin, label: 'Shipment Tracking', desc: 'Real-time GPS location & ETA' },
  { icon: Calendar, label: 'Scheduling', desc: 'Book or reschedule your move' },
  { icon: Shield, label: 'Carrier Vetting', desc: 'FMCSA safety verification' },
  { icon: ScanLine, label: 'AI Room Scan', desc: 'Photo-based inventory builder' },
  { icon: Package, label: 'Packing Help', desc: 'Tips, checklists & services' },
  { icon: Video, label: 'Video Consult', desc: 'Live virtual walk-through' },
  { icon: HelpCircle, label: 'Anything Else', desc: 'Insurance, storage, claims…' },
];

const faqItems = [
  { q: 'How does the AI Move Estimator work?', a: 'Our AI scans photos of your rooms to auto-detect furniture and belongings, then calculates cubic feet and weight to give you an instant quote. You can also add items manually from our catalog of 200+ items.' },
  { q: 'Are your carriers vetted and insured?', a: 'Absolutely. Every carrier goes through our FMCSA-verified vetting process. We check safety ratings, complaint history, insurance coverage, and operating authority before recommending any mover.' },
  { q: 'Can I track my shipment in real time?', a: 'Yes! Our live tracking dashboard shows your truck\'s GPS location, real-time ETA, weather along the route, and weigh station alerts.' },
  { q: 'What if I need to reschedule my move?', a: 'No problem. You can reschedule through Trudy or by calling our team. We recommend at least 48 hours notice.' },
  { q: 'Do you offer packing services?', a: 'Yes, we offer full-service packing, partial packing, and DIY options with professional-grade materials.' },
  { q: 'How do I file a claim for damaged items?', a: 'Contact our support team within 9 months of delivery. All moves include basic liability coverage, with full-value protection available as an upgrade.' },
];

const trudyPageContext = {
  key: 'meet-trudy',
  firstMessage: "Hey! I'm Trudy — your AI move coordinator. I handle quotes, scheduling, tracking, carrier vetting, packing advice, and pretty much anything else you need. Think of me as your entire support team, available 24/7. What can I help you with?",
  quickActions: [
    { id: 'quote', label: 'Get a Quote', icon: Calculator, action: 'message' as const, message: 'I need a moving quote' },
    { id: 'track', label: 'Track Shipment', icon: MapPin, action: 'navigate' as const, target: '/track' },
    { id: 'schedule', label: 'Schedule a Move', icon: Calendar, action: 'message' as const, message: 'I want to schedule a move' },
    { id: 'scan', label: 'Scan My Room', icon: ScanLine, action: 'navigate' as const, target: '/scan-room' },
  ],
  agentContext: "User is on the Meet Trudy page — they came here specifically to interact with you. Be confident, helpful, and proactive. You can handle quotes, scheduling, tracking, vetting, packing tips, and general questions. Only escalate to a human when genuinely necessary.",
};

export default function CustomerService() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();
    const subject = formData.subject.trim() || null;

    if (!name || !email || !message) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({ name, email, subject, message });
      if (error) throw error;
      supabase.functions.invoke('notify-support-ticket', { body: { name, email, subject, message } }).catch(console.error);
      toast({ title: 'Message sent!', description: 'We\'ll get back to you within 24 hours.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Support ticket error:', err);
      toast({ title: 'Something went wrong', description: 'Please try again or call us directly.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  return (
    <SiteShell>
      <main className="min-h-screen bg-background">
        {/* Hero + Chat */}
        <section className="relative pt-28 pb-0">
          <div className="mx-auto max-w-4xl px-4">
            {/* Trudy intro */}
            <div className="text-center mb-8">
              <div className="relative mx-auto mb-5 h-24 w-24">
                <img
                  src={trudyAvatar}
                  alt="Trudy – AI Assistant"
                  className="h-24 w-24 rounded-full border-2 border-border shadow-lg object-cover"
                />
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-foreground border-2 border-background" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Meet Trudy
              </h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-lg mx-auto">
                Your AI move coordinator — available 24/7, faster than a phone call, and knows everything about your move.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground/5 border border-border px-4 py-1.5 text-sm text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-foreground" />
                <span>Powered by conversational AI · Handles 95% of requests instantly</span>
              </div>
            </div>

            {/* Embedded chat — the hero of the page */}
            <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden" style={{ height: '520px' }}>
              <AIChatContainer pageContext={trudyPageContext} />
            </div>
          </div>
        </section>

        {/* Capability strip */}
        <section className="py-14 px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground text-center mb-8">
              What Trudy handles for you
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((cap) => (
                <div
                  key={cap.label}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 rounded-lg bg-foreground/5 p-2">
                    <cap.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{cap.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 px-4 bg-muted/20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-center text-foreground mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqItems.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-border bg-card px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4 text-sm">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Support ticket form */}
        <section className="py-14 px-4">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold text-center text-foreground mb-1">Need a Human?</h2>
            <p className="text-center text-muted-foreground mb-8 text-sm">
              Trudy handles most requests, but you can always reach our team.
            </p>
            <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-8 shadow-lg space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cs-name" className="block text-xs font-medium text-foreground mb-1">Name *</label>
                  <Input id="cs-name" placeholder="Your name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} maxLength={100} required />
                </div>
                <div>
                  <label htmlFor="cs-email" className="block text-xs font-medium text-foreground mb-1">Email *</label>
                  <Input id="cs-email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} maxLength={255} required />
                </div>
              </div>
              <div>
                <label htmlFor="cs-subject" className="block text-xs font-medium text-foreground mb-1">Subject</label>
                <Input id="cs-subject" placeholder="What's this about?" value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} maxLength={200} />
              </div>
              <div>
                <label htmlFor="cs-message" className="block text-xs font-medium text-foreground mb-1">Message *</label>
                <Textarea id="cs-message" placeholder="How can we help?" rows={4} value={formData.message} onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))} maxLength={2000} required />
              </div>
              <Button type="submit" variant="outline" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 animate-spin" /> Sending…</span>
                ) : (
                  <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Message</span>
                )}
              </Button>
            </form>
          </div>
        </section>

        {/* Fallback contact */}
        <section className="py-14 px-4 bg-muted/30">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-muted-foreground mb-6 text-sm">Our team is available Monday–Saturday, 8 AM – 8 PM EST.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="tel:+16097277647"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-accent transition-colors"
              >
                <Phone className="w-4 h-4" /> (609) 727-7647
              </a>
              <a
                href="mailto:support@trumove.com"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-accent transition-colors"
              >
                <Mail className="w-4 h-4" /> Email Support
              </a>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
