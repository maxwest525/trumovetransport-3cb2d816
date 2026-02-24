import { useState, useCallback, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Phone, PhoneOff, Mail, Send, Clock, Shield, Calculator, MapPin, Calendar, HelpCircle, Package, ScanLine, Video, Mic, Loader2, MessageSquare, ArrowRight, Zap, Globe, HeadphonesIcon } from 'lucide-react';
import SiteShell from '@/components/layout/SiteShell';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import trudyAvatar from '@/assets/trudy-avatar.png';

const TRUDY_AGENT_ID = 'agent_0501khwa2t2pfj0s3echetmjhx4n';

const capabilities = [
  { icon: Calculator, label: 'Instant Quotes', desc: 'AI-powered estimates in seconds', tag: 'Most used' },
  { icon: MapPin, label: 'Live Tracking', desc: 'Real-time GPS location & ETA' },
  { icon: Calendar, label: 'Scheduling', desc: 'Book or reschedule moves' },
  { icon: Shield, label: 'Carrier Vetting', desc: 'FMCSA safety verified' },
  { icon: ScanLine, label: 'Room Scanner', desc: 'Photo-based inventory' },
  { icon: Package, label: 'Packing Help', desc: 'Tips & checklists' },
  { icon: Video, label: 'Video Consult', desc: 'Live virtual walk-through' },
  { icon: HelpCircle, label: 'General Support', desc: 'Insurance, claims, storage' },
];

const stats = [
  { value: '24/7', label: 'Availability' },
  { value: '<3s', label: 'Response Time' },
  { value: '95%', label: 'Resolved Instantly' },
  { value: '4.9★', label: 'Satisfaction' },
];

const faqItems = [
  { q: 'How does the AI Move Estimator work?', a: 'Our AI scans photos of your rooms to auto-detect furniture and belongings, then calculates cubic feet and weight to give you an instant quote.' },
  { q: 'Are your carriers vetted and insured?', a: 'Every carrier goes through our FMCSA-verified vetting process. We check safety ratings, complaint history, insurance coverage, and operating authority.' },
  { q: 'Can I track my shipment in real time?', a: 'Yes! Our live tracking dashboard shows your truck\'s GPS location, real-time ETA, weather along the route, and weigh station alerts.' },
  { q: 'What if I need to reschedule?', a: 'Reschedule through Trudy or call our team. We recommend at least 48 hours notice.' },
  { q: 'How do I file a claim?', a: 'Contact our support team within 9 months of delivery. All moves include basic liability coverage, with full-value protection available as an upgrade.' },
];

/* ─── Voice Orb ─── */
function VoiceOrb({ isConnected, isSpeaking }: { isConnected: boolean; isSpeaking: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2, cy = size / 2;
      const t = Date.now() / 1000;

      // Outer glow rings
      if (isConnected) {
        for (let i = 3; i >= 1; i--) {
          const r = 60 + i * 12 + Math.sin(t * 2 + i) * 4;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(142, 71%, 45%, ${0.08 - i * 0.02})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Main circle
      const baseR = 55;
      const pulse = isSpeaking ? Math.sin(t * 6) * 6 + Math.sin(t * 10) * 3 : isConnected ? Math.sin(t * 2) * 2 : 0;
      const r = baseR + pulse;

      const grad = ctx.createRadialGradient(cx - 10, cy - 10, 0, cx, cy, r);
      if (isConnected) {
        grad.addColorStop(0, 'hsla(142, 71%, 55%, 0.15)');
        grad.addColorStop(1, 'hsla(142, 71%, 45%, 0.05)');
      } else {
        grad.addColorStop(0, 'hsla(0, 0%, 50%, 0.1)');
        grad.addColorStop(1, 'hsla(0, 0%, 40%, 0.05)');
      }

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = isConnected ? 'hsla(142, 71%, 45%, 0.3)' : 'hsla(0, 0%, 50%, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner waveform bars when speaking
      if (isConnected) {
        const bars = 12;
        for (let i = 0; i < bars; i++) {
          const angle = (i / bars) * Math.PI * 2;
          const h = isSpeaking
            ? 8 + Math.sin(t * 8 + i * 0.7) * 12 + Math.sin(t * 12 + i * 1.3) * 6
            : 3 + Math.sin(t * 2 + i * 0.5) * 2;
          const innerR = 28;
          const x1 = cx + Math.cos(angle) * innerR;
          const y1 = cy + Math.sin(angle) * innerR;
          const x2 = cx + Math.cos(angle) * (innerR + h);
          const y2 = cy + Math.sin(angle) * (innerR + h);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsla(142, 71%, 45%, ${isSpeaking ? 0.6 : 0.2})`;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isConnected, isSpeaking]);

  return <canvas ref={canvasRef} className="w-[200px] h-[200px]" />;
}

/* ─── Main Page ─── */
export default function CustomerService() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'voice' | 'form'>('voice');

  const conversation = useConversation({
    onConnect: () => console.log('Trudy: connected'),
    onDisconnect: () => console.log('Trudy: disconnected'),
    onError: () => {
      toast({ variant: 'destructive', title: 'Connection Error', description: 'Could not connect. Try again.' });
    },
  });

  const isConnected = conversation.status === 'connected';

  const startCall = useCallback(async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId: TRUDY_AGENT_ID, connectionType: 'webrtc' });
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        toast({ variant: 'destructive', title: 'Microphone Required', description: 'Allow mic access to talk with Trudy.' });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, isConnecting]);

  const endCall = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, message, subject } = formData;
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({ name: name.trim(), email: email.trim(), subject: subject.trim() || null, message: message.trim() });
      if (error) throw error;
      supabase.functions.invoke('notify-support-ticket', { body: { name, email, subject, message } }).catch(console.error);
      toast({ title: 'Message sent!', description: 'We\'ll respond within 24 hours.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  return (
    <SiteShell>
      <main className="min-h-screen bg-background">

        {/* ─── HERO: Trudy Command Center ─── */}
        <section className="relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left: Info */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 mb-6">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="text-[11px] font-semibold tracking-wide uppercase text-primary">AI-Powered Support</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                  Trudy
                  <span className="block text-muted-foreground font-medium text-lg sm:text-xl mt-2">
                    Your AI move coordinator
                  </span>
                </h1>

                <p className="mt-5 text-sm text-muted-foreground max-w-md leading-relaxed">
                  Get instant quotes, track shipments, schedule moves, and resolve issues — all through a single voice conversation. No hold times, no transfers.
                </p>

                {/* Stats strip */}
                <div className="mt-8 flex flex-wrap gap-6">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <p className="text-xl font-black text-foreground">{s.value}</p>
                      <p className="text-[11px] text-muted-foreground tracking-wide uppercase">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="mt-8 flex flex-wrap gap-3">
                  {!isConnected ? (
                    <button
                      onClick={startCall}
                      disabled={isConnecting}
                      className="flex items-center gap-2.5 rounded-full bg-foreground text-background px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl active:scale-95 disabled:opacity-50"
                    >
                      {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                      {isConnecting ? 'Connecting…' : 'Talk to Trudy'}
                    </button>
                  ) : (
                    <button
                      onClick={endCall}
                      className="flex items-center gap-2.5 rounded-full bg-destructive text-destructive-foreground px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:scale-[1.03] active:scale-95"
                    >
                      <PhoneOff className="h-4 w-4" />
                      End Call
                    </button>
                  )}
                  <a
                    href="tel:+16097277647"
                    className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    (609) 727-7647
                  </a>
                </div>

                {isConnected && (
                  <div className="mt-4 flex items-center gap-3 text-sm text-foreground animate-in fade-in slide-in-from-bottom-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                    </span>
                    {conversation.isSpeaking ? 'Trudy is speaking…' : 'Listening…'}
                  </div>
                )}
              </div>

              {/* Right: Voice Orb */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <VoiceOrb isConnected={isConnected} isSpeaking={conversation.isSpeaking} />
                  {/* Avatar centered in orb */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`h-20 w-20 rounded-full border-2 overflow-hidden transition-all duration-500 ${
                      isConnected ? 'border-primary/40 shadow-[0_0_30px_hsl(var(--primary)/0.2)]' : 'border-border shadow-lg'
                    }`}>
                      <img src={trudyAvatar} alt="Trudy" className="h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TRUST STRIP ─── */}
        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {[
              { icon: Shield, text: 'FMCSA Verified' },
              { icon: Globe, text: 'Available 24/7' },
              { icon: Zap, text: 'Instant Responses' },
              { icon: HeadphonesIcon, text: 'Human Escalation' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <item.icon className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CAPABILITIES GRID ─── */}
        <section className="py-16 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground">What Trudy Handles</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">One AI assistant for your entire move</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((cap) => (
                <div
                  key={cap.label}
                  className="group relative rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-200 cursor-default"
                >
                  {cap.tag && (
                    <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {cap.tag}
                    </span>
                  )}
                  <cap.icon className="w-5 h-5 text-foreground/70 mb-3 group-hover:text-primary transition-colors" />
                  <h3 className="text-sm font-semibold text-foreground">{cap.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CONTACT / FAQ SPLIT ─── */}
        <section className="py-16 px-4 bg-muted/20">
          <div className="mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-12">

              {/* Left: FAQ */}
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Common Questions</h2>
                <Accordion type="single" collapsible className="space-y-1.5">
                  {faqItems.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="rounded-lg border border-border bg-card px-4 shadow-sm"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-3 text-sm">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-3 text-xs leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Right: Contact Form */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-bold text-foreground">Contact a Human</h2>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">Optional</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Trudy handles 95% of requests. For the rest, we're here.</p>

                {/* Tab toggle */}
                <div className="flex gap-1 rounded-lg bg-muted/60 p-0.5 mb-4 w-fit">
                  <button
                    onClick={() => setActiveTab('voice')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activeTab === 'voice' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Phone className="w-3 h-3" /> Call
                  </button>
                  <button
                    onClick={() => setActiveTab('form')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activeTab === 'form' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" /> Form
                  </button>
                </div>

                {activeTab === 'voice' ? (
                  <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
                    <p className="text-sm text-foreground font-medium">Speak with our team directly</p>
                    <p className="text-xs text-muted-foreground">Mon–Sat, 8 AM – 8 PM EST</p>
                    <a
                      href="tel:+16097277647"
                      className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-semibold shadow-lg hover:scale-[1.03] active:scale-95 transition-all"
                    >
                      <Phone className="h-4 w-4" /> (609) 727-7647
                    </a>
                    <p className="text-[11px] text-muted-foreground">
                      or email <a href="mailto:support@trumove.com" className="underline hover:text-foreground">support@trumove.com</a>
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-medium text-foreground mb-1">Name *</label>
                        <Input placeholder="Your name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} maxLength={100} required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-foreground mb-1">Email *</label>
                        <Input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} maxLength={255} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-foreground mb-1">Subject</label>
                      <Input placeholder="What's this about?" value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} maxLength={200} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-foreground mb-1">Message *</label>
                      <Textarea placeholder="How can we help?" rows={3} value={formData.message} onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))} maxLength={2000} required />
                    </div>
                    <Button type="submit" variant="outline" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 animate-spin" /> Sending…</span>
                      ) : (
                        <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Message</span>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>
    </SiteShell>
  );
}
