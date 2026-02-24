import { useState, useCallback, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Phone, PhoneOff, Send, Clock, Shield, Calculator, MapPin, Calendar, HelpCircle, Package, ScanLine, Video, Mic, Loader2, MessageSquare, Zap, Globe, HeadphonesIcon } from 'lucide-react';
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
    const dpr = window.devicePixelRatio || 1;
    const size = 220;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2, cy = size / 2;
      const t = Date.now() / 1000;

      // Concentric rings
      for (let i = 4; i >= 0; i--) {
        const r = 50 + i * 16 + (isConnected ? Math.sin(t * 1.5 + i * 0.8) * 3 : 0);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        const alpha = isConnected ? 0.06 + (isSpeaking ? Math.sin(t * 4 + i) * 0.03 : 0) : 0.03;
        ctx.strokeStyle = `hsl(0 0% ${isConnected ? '20%' : '60%'} / ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Main circle
      const baseR = 44;
      const pulse = isSpeaking ? Math.sin(t * 6) * 5 + Math.sin(t * 9) * 3 : isConnected ? Math.sin(t * 2) * 1.5 : 0;
      const r = baseR + pulse;

      // Fill
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = isConnected ? 'hsl(0 0% 8% / 0.06)' : 'hsl(0 0% 50% / 0.04)';
      ctx.fill();
      ctx.strokeStyle = isConnected ? 'hsl(0 0% 15% / 0.25)' : 'hsl(0 0% 60% / 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner waveform bars
      if (isConnected) {
        const bars = 16;
        for (let i = 0; i < bars; i++) {
          const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
          const h = isSpeaking
            ? 6 + Math.sin(t * 7 + i * 0.6) * 10 + Math.sin(t * 11 + i * 1.2) * 5
            : 2 + Math.sin(t * 1.5 + i * 0.4) * 1.5;
          const innerR = 22;
          const x1 = cx + Math.cos(angle) * innerR;
          const y1 = cy + Math.sin(angle) * innerR;
          const x2 = cx + Math.cos(angle) * (innerR + h);
          const y2 = cy + Math.sin(angle) * (innerR + h);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsl(0 0% 15% / ${isSpeaking ? 0.5 : 0.15})`;
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isConnected, isSpeaking]);

  return <canvas ref={canvasRef} className="w-[220px] h-[220px]" style={{ imageRendering: 'auto' }} />;
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

        {/* ─── HERO: Command Center ─── */}
        <section className="tru-page-hero-section" style={{ paddingBottom: 0 }}>
          <div className="mx-auto max-w-3xl">
            {/* Orb + Avatar */}
            <div className="relative mx-auto w-fit mb-6">
              <VoiceOrb isConnected={isConnected} isSpeaking={conversation.isSpeaking} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`h-16 w-16 rounded-full border overflow-hidden transition-all duration-500 ${
                  isConnected ? 'border-foreground/30 shadow-[0_0_24px_hsl(var(--tm-ink)/0.15)]' : 'border-border shadow-sm'
                }`}>
                  <img src={trudyAvatar} alt="Trudy AI Assistant" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>

            <h1 className="tru-hero-headline-main !text-[clamp(2.5rem,5vw,3.5rem)]">Trudy</h1>
            <p className="text-muted-foreground text-sm mt-1 mb-5 max-w-md mx-auto leading-relaxed">
              Your AI move coordinator. Get instant quotes, track shipments, schedule moves, and resolve issues — all by voice.
            </p>

            {/* Action row */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              {!isConnected ? (
                <button
                  onClick={startCall}
                  disabled={isConnecting}
                  className="tru-modal-primary-btn !w-auto !px-7 !py-2.5 !text-xs"
                >
                  {isConnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
                  {isConnecting ? 'Connecting…' : 'Talk to Trudy'}
                </button>
              ) : (
                <button
                  onClick={endCall}
                  className="flex items-center gap-2 rounded-full bg-destructive text-destructive-foreground px-6 py-2.5 text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
                >
                  <PhoneOff className="h-3.5 w-3.5" />
                  End Call
                </button>
              )}
              <a href="tel:+16097277647" className="tru-secondary-action-btn !text-xs !py-2 !px-5">
                <Phone className="h-3.5 w-3.5" />
                (609) 727-7647
              </a>
            </div>

            {/* Live status */}
            {isConnected && (
              <div className="flex items-center justify-center gap-2.5 text-xs text-foreground animate-in fade-in slide-in-from-bottom-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground/60 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
                </span>
                {conversation.isSpeaking ? 'Trudy is speaking…' : 'Listening…'}
              </div>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-8 mt-6 mb-2">
              {[
                { value: '24/7', label: 'Availability' },
                { value: '<3s', label: 'Response' },
                { value: '95%', label: 'Resolved' },
                { value: '4.9★', label: 'Rating' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-base font-black text-foreground tracking-tight">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TRUST STRIP ─── */}
        <div className="safer-trust-strip mt-6">
          <div className="safer-trust-strip-inner">
            {[
              { icon: Shield, text: 'FMCSA Verified' },
              { icon: Globe, text: '24/7 Available' },
              { icon: Zap, text: 'Instant Responses' },
              { icon: HeadphonesIcon, text: 'Human Escalation' },
            ].map((item, idx, arr) => (
              <div key={item.text} className="safer-trust-item">
                <item.icon className="w-4 h-4" />
                <span>{item.text}</span>
                {idx < arr.length - 1 && <span className="safer-trust-dot">•</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ─── CAPABILITIES GRID ─── */}
        <section className="py-14 px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-lg font-bold text-foreground tracking-tight">What Trudy Handles</h2>
              <p className="text-xs text-muted-foreground mt-1">One AI assistant for your entire move</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((cap) => (
                <div
                  key={cap.label}
                  className="group relative rounded-xl border border-border bg-card p-4 hover:border-foreground/20 transition-colors cursor-default"
                >
                  {cap.tag && (
                    <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider text-foreground bg-muted px-1.5 py-0.5 rounded">
                      {cap.tag}
                    </span>
                  )}
                  <cap.icon className="w-4 h-4 text-muted-foreground mb-2.5 group-hover:text-foreground transition-colors" />
                  <h3 className="text-xs font-semibold text-foreground">{cap.label}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ + CONTACT ─── */}
        <section className="py-14 px-4 border-t border-border">
          <div className="mx-auto max-w-4xl">
            <div className="grid lg:grid-cols-2 gap-10">

              {/* FAQ */}
              <div>
                <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Common Questions</h2>
                <Accordion type="single" collapsible className="space-y-1">
                  {faqItems.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="rounded-lg border border-border bg-card px-4"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-3 text-xs">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-3 text-[11px] leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Contact */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Contact a Human</h2>
                  <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider">Optional</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-4">Trudy handles 95% of requests. For the rest, we're here.</p>

                {/* Tab toggle */}
                <div className="flex gap-0.5 rounded-lg border border-border p-0.5 mb-4 w-fit">
                  <button
                    onClick={() => setActiveTab('voice')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === 'voice' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Phone className="w-3 h-3" /> Call
                  </button>
                  <button
                    onClick={() => setActiveTab('form')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === 'form' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" /> Form
                  </button>
                </div>

                {activeTab === 'voice' ? (
                  <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
                    <p className="text-xs text-foreground font-semibold">Speak with our team directly</p>
                    <p className="text-[11px] text-muted-foreground">Mon–Sat, 8 AM – 8 PM EST</p>
                    <a
                      href="tel:+16097277647"
                      className="tru-modal-primary-btn !w-auto !inline-flex !px-6 !py-2.5 !text-xs"
                    >
                      <Phone className="h-3.5 w-3.5" /> (609) 727-7647
                    </a>
                    <p className="text-[10px] text-muted-foreground">
                      or email <a href="mailto:support@trumove.com" className="underline hover:text-foreground transition-colors">support@trumove.com</a>
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Name *</label>
                        <Input placeholder="Your name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} maxLength={100} required className="text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Email *</label>
                        <Input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} maxLength={255} required className="text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Subject</label>
                      <Input placeholder="What's this about?" value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} maxLength={200} className="text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Message *</label>
                      <Textarea placeholder="How can we help?" rows={3} value={formData.message} onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))} maxLength={2000} required className="text-xs" />
                    </div>
                    <Button type="submit" variant="outline" className="w-full text-xs" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 animate-spin" /> Sending…</span>
                      ) : (
                        <span className="flex items-center gap-2"><Send className="w-3.5 h-3.5" /> Send Message</span>
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
