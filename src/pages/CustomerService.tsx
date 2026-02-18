import { useState, useEffect, useCallback } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Calculator, Calendar, HelpCircle, Send, Clock, Shield, Truck, History, User, Bot } from 'lucide-react';
import SiteShell from '@/components/layout/SiteShell';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import trudyAvatar from '@/assets/trudy-avatar.png';

const helpCards = [
  { icon: Calculator, title: 'Moving Quotes', desc: 'Get an instant estimate for your upcoming move — local or long distance.' },
  { icon: MapPin, title: 'Shipment Tracking', desc: 'Real-time GPS tracking with weather and ETA updates.' },
  { icon: Calendar, title: 'Scheduling', desc: 'Book, reschedule, or confirm your moving date.' },
  { icon: Shield, title: 'Carrier Vetting', desc: 'Verify any mover\'s FMCSA safety record instantly.' },
  { icon: Truck, title: 'Day-of Support', desc: 'Get help during your move with our live team.' },
  { icon: HelpCircle, title: 'General Questions', desc: 'Insurance, packing, storage — ask us anything.' },
];

const faqItems = [
  {
    q: 'How does the AI Move Estimator work?',
    a: 'Our AI scans photos of your rooms to auto-detect furniture and belongings, then calculates cubic feet and weight to give you an instant quote. You can also add items manually from our catalog of 200+ items.',
  },
  {
    q: 'Are your carriers vetted and insured?',
    a: 'Absolutely. Every carrier goes through our FMCSA-verified vetting process. We check safety ratings, complaint history, insurance coverage, and operating authority before recommending any mover.',
  },
  {
    q: 'Can I track my shipment in real time?',
    a: 'Yes! Our live tracking dashboard shows your truck\'s GPS location, real-time ETA, weather along the route, and weigh station alerts. You\'ll know exactly where your belongings are at all times.',
  },
  {
    q: 'What if I need to reschedule my move?',
    a: 'No problem. You can reschedule through Trudy or by calling our team. We recommend at least 48 hours notice for schedule changes to ensure availability.',
  },
  {
    q: 'Do you offer packing services?',
    a: 'Yes, we offer full-service packing, partial packing, and DIY options. Our team uses professional-grade materials and techniques to protect your belongings.',
  },
  {
    q: 'What areas do you serve?',
    a: 'TruMove operates nationwide for long-distance moves and serves the greater tri-state area for local moves. Contact us for specific availability in your area.',
  },
  {
    q: 'How do I file a claim for damaged items?',
    a: 'Contact our support team within 9 months of delivery. We\'ll guide you through the claims process. All moves include basic liability coverage, with full-value protection available as an upgrade.',
  },
];

interface TranscriptMessage {
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export default function CustomerService() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  useEffect(() => {
    if (!document.querySelector('script[src*="elevenlabs/convai-widget-embed"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }
  }, []);

  // Listen for ElevenLabs widget messages to build transcript
  useEffect(() => {
    const handleElevenLabsMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      
      const { type } = event.data;
      
      if (type === 'user_transcript' && event.data.user_transcription_event?.user_transcript) {
        setTranscript(prev => [...prev, {
          role: 'user',
          text: event.data.user_transcription_event.user_transcript,
          timestamp: new Date(),
        }]);
      }
      
      if (type === 'agent_response' && event.data.agent_response_event?.agent_response) {
        setTranscript(prev => [...prev, {
          role: 'agent',
          text: event.data.agent_response_event.agent_response,
          timestamp: new Date(),
        }]);
      }
    };

    window.addEventListener('message', handleElevenLabsMessage);
    return () => window.removeEventListener('message', handleElevenLabsMessage);
  }, []);

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
      const { error } = await supabase.from('support_tickets').insert({
        name,
        email,
        subject,
        message,
      });

      if (error) throw error;

      // Fire email notification (non-blocking — ticket is already saved)
      supabase.functions.invoke('notify-support-ticket', {
        body: { name, email, subject, message },
      }).catch(console.error);

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
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-32 pb-16 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <img
              src={trudyAvatar}
              alt="Trudy – Virtual Customer Service Rep"
              className="mx-auto mb-6 h-28 w-28 rounded-full border-4 border-primary/30 shadow-lg object-cover"
            />
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Meet <span className="text-primary">Trudy</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Your 24/7 virtual customer service representative. Ask about quotes, tracking, scheduling, or anything else — Trudy's here to help.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
              <span>Trudy is online — click the chat widget to start talking</span>
            </div>
          </div>
        </section>

        {/* What Trudy can help with */}
        <section className="py-16 px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold text-center text-foreground mb-10">What Trudy Can Help With</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {helpCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <card.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Chat Transcript */}
        {transcript.length > 0 && (
          <section className="py-16 px-4">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center justify-center gap-2 mb-8">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Conversation Transcript</h2>
              </div>
              <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto p-6 space-y-4">
                  {transcript.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === 'agent' ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {msg.role === 'agent' ? (
                          <Bot className="w-4 h-4 text-primary" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                        msg.role === 'agent'
                          ? 'bg-muted text-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <span className="text-[10px] opacity-60 mt-1 block">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FAQ Accordion */}
        <section className="py-16 px-4 bg-muted/20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-center text-foreground mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-border bg-card px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Support Ticket Form */}
        <section className="py-16 px-4">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">Send Us a Message</h2>
            <p className="text-center text-muted-foreground mb-10">
              Can't find your answer? Submit a request and we'll respond within 24 hours.
            </p>
            <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-8 shadow-lg space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="cs-name" className="block text-sm font-medium text-foreground mb-1.5">Name *</label>
                  <Input
                    id="cs-name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    maxLength={100}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cs-email" className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                  <Input
                    id="cs-email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    maxLength={255}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="cs-subject" className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                <Input
                  id="cs-subject"
                  placeholder="What's this about?"
                  value={formData.subject}
                  onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))}
                  maxLength={200}
                />
              </div>
              <div>
                <label htmlFor="cs-message" className="block text-sm font-medium text-foreground mb-1.5">Message *</label>
                <Textarea
                  id="cs-message"
                  placeholder="How can we help?"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                  maxLength={2000}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
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
        <section className="py-16 px-4 bg-muted/30">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Prefer to Talk to a Human?</h2>
            <p className="text-muted-foreground mb-8">Our team is available Monday–Saturday, 8 AM – 8 PM EST.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+16097277647"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 transition-opacity"
              >
                <Phone className="w-4 h-4" /> Call (609) 727-7647
              </a>
              <a
                href="mailto:support@trumove.com"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-accent transition-colors"
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
