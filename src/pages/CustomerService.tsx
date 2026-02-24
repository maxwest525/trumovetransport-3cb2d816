import { useState, useCallback, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Phone, PhoneOff, Send, Clock, Shield, Calculator, MapPin, Calendar, HelpCircle, Package, ScanLine, Video, Mic, Loader2, MessageSquare, Zap, Globe, HeadphonesIcon, CheckCircle2, MonitorPlay, Share2, FileText } from 'lucide-react';
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

/* ─── Particle type ─── */
interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; hue: number;
}

/* ─── Voice Orb ─── */
function VoiceOrb({ isConnected, isSpeaking }: { isConnected: boolean; isSpeaking: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const intensityRef = useRef(0);
  const isDarkRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const size = 240;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Detect dark mode
    const checkDark = () => { isDarkRef.current = document.documentElement.classList.contains('dark'); };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const spawnParticle = (cx: number, cy: number, orbR: number, intensity: number) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = orbR + 2 + Math.random() * 6;
      const speed = 0.15 + intensity * 0.4;
      particlesRef.current.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.3,
        vy: Math.sin(angle) * speed - Math.random() * 0.3,
        life: 1,
        maxLife: 40 + Math.random() * 40,
        size: 1 + Math.random() * 2 * (0.5 + intensity),
        hue: 0 + Math.random() * 30 * intensity,
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2, cy = size / 2;
      const t = Date.now() / 1000;

      // Smooth intensity interpolation
      const targetIntensity = isSpeaking ? 0.6 + Math.sin(t * 5) * 0.2 + Math.sin(t * 8.3) * 0.15 : isConnected ? 0.15 : 0;
      intensityRef.current += (targetIntensity - intensityRef.current) * 0.08;
      const intensity = intensityRef.current;

      const dark = isDarkRef.current;

      // Color shift: dark mode uses brighter, more saturated tones
      const hueBase = isConnected ? (isSpeaking ? 20 + Math.sin(t * 3) * 20 : 200) : 0;
      const sat = isConnected ? (dark ? 20 + intensity * 45 : 8 + intensity * 30) : 0;
      const lum = dark
        ? (isConnected ? 55 + intensity * 20 : 50)
        : (isConnected ? 25 + intensity * 15 : 55);

      // Dark mode outer glow
      if (dark && isConnected) {
        const glowR = 90 + intensity * 20;
        const glowGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, glowR);
        const glowHue = isSpeaking ? hueBase : 200;
        const glowAlpha = 0.06 + intensity * 0.1;
        glowGrad.addColorStop(0, `hsl(${glowHue} ${sat + 15}% ${lum + 10}% / ${glowAlpha})`);
        glowGrad.addColorStop(0.6, `hsl(${glowHue} ${sat}% ${lum}% / ${glowAlpha * 0.3})`);
        glowGrad.addColorStop(1, `hsl(${glowHue} ${sat}% ${lum}% / 0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }

      // Concentric rings with color
      for (let i = 4; i >= 0; i--) {
        const r = 52 + i * 16 + (isConnected ? Math.sin(t * 1.5 + i * 0.8) * (2 + intensity * 4) : 0);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        const ringAlpha = dark
          ? (isConnected ? 0.08 + intensity * 0.08 : 0.04)
          : (isConnected ? 0.04 + intensity * 0.04 : 0.025);
        ctx.strokeStyle = `hsl(${hueBase} ${sat}% ${lum}% / ${ringAlpha})`;
        ctx.lineWidth = dark ? 1.5 : 1;
        ctx.stroke();
      }

      // Main circle
      const baseR = 46;
      const pulse = isSpeaking
        ? Math.sin(t * 6) * (3 + intensity * 5) + Math.sin(t * 9.5) * (2 + intensity * 3)
        : isConnected ? Math.sin(t * 2) * 1.5 : 0;
      const r = baseR + pulse;

      // Gradient fill with hue shift
      const grad = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, r);
      grad.addColorStop(0, `hsl(${hueBase} ${sat + 5}% ${lum + 10}% / ${0.04 + intensity * 0.06})`);
      grad.addColorStop(1, `hsl(${hueBase + 15} ${sat}% ${lum}% / ${0.02 + intensity * 0.03})`);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = `hsl(${hueBase} ${sat}% ${lum}% / ${0.15 + intensity * 0.2})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner waveform bars with color
      if (isConnected) {
        const bars = 20;
        for (let i = 0; i < bars; i++) {
          const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
          const barIntensity = isSpeaking
            ? 5 + Math.sin(t * 7 + i * 0.5) * (8 + intensity * 8) + Math.sin(t * 12 + i * 1.1) * (3 + intensity * 5)
            : 2 + Math.sin(t * 1.5 + i * 0.4) * 1.5;
          const innerR = 22;
          const x1 = cx + Math.cos(angle) * innerR;
          const y1 = cy + Math.sin(angle) * innerR;
          const x2 = cx + Math.cos(angle) * (innerR + barIntensity);
          const y2 = cy + Math.sin(angle) * (innerR + barIntensity);

          const barHue = hueBase + i * 3;
          const barAlpha = isSpeaking ? 0.3 + intensity * 0.4 : 0.12;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsl(${barHue} ${sat + 10}% ${lum}% / ${barAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // Spawn particles
      if (isConnected) {
        const spawnRate = isSpeaking ? 2 + Math.floor(intensity * 3) : 1;
        if (Math.random() < (isSpeaking ? 0.6 : 0.15)) {
          for (let i = 0; i < spawnRate; i++) spawnParticle(cx, cy, r, intensity);
        }
      }

      // Update & draw particles
      const alive: Particle[] = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.005; // slight float up
        p.life += 1;
        const progress = p.life / p.maxLife;
        if (progress >= 1) continue;

        const alpha = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;
        const pHue = hueBase + p.hue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${pHue} ${sat + 10}% ${lum + 20}% / ${alpha * 0.35})`;
        ctx.fill();
        alive.push(p);
      }
      particlesRef.current = alive;

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      particlesRef.current = [];
      observer.disconnect();
    };
  }, [isConnected, isSpeaking]);

  return <canvas ref={canvasRef} className="w-[240px] h-[240px]" style={{ imageRendering: 'auto' }} />;
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

        {/* ─── COMMAND CENTER TRUST BAR ─── */}
        <div className="w-full bg-[hsl(220_20%_12%)] dark:bg-[hsl(220_15%_8%)] border-b border-[hsl(0_0%_100%/0.08)]">
          <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-6 h-6 rounded border border-[hsl(0_0%_100%/0.15)] bg-[hsl(0_0%_100%/0.06)]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">Contact Center</span>
            </div>
            <div className="flex items-center gap-5 overflow-x-auto">
              {[
                { icon: MonitorPlay, text: 'Secure Video' },
                { icon: Shield, text: 'Licensed Broker' },
                { icon: Share2, text: 'Screen Sharing' },
                { icon: FileText, text: 'Quote Review' },
                { icon: CheckCircle2, text: 'No Obligation' },
              ].map((item, idx, arr) => (
                <div key={item.text} className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <item.icon className="w-3 h-3 text-green-400/80" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">{item.text}</span>
                  </div>
                  {idx < arr.length - 1 && <span className="text-white/15 text-[6px]">•</span>}
                </div>
              ))}
            </div>
            <div className="hidden md:block shrink-0">
              <span className="text-[10px] text-white/40 font-mono tracking-wide">TM-{new Date().getFullYear()}-{Math.floor(Math.random() * 90000000 + 10000000)}</span>
            </div>
          </div>
        </div>

        {/* ─── HERO: Command Center ─── */}
        <section className="text-center pt-8 pb-4 px-4">
          <div className="mx-auto max-w-3xl">
            {/* Orb + Avatar */}
            <div className="relative mx-auto w-fit mb-4">
              {/* Dark mode ambient glow behind orb */}
              <div className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none dark:block hidden ${
                isConnected
                  ? conversation.isSpeaking
                    ? 'bg-[hsl(25_50%_50%/0.08)] shadow-[0_0_80px_30px_hsl(25_50%_50%/0.12)]'
                    : 'bg-[hsl(200_40%_50%/0.06)] shadow-[0_0_60px_20px_hsl(200_40%_50%/0.08)]'
                  : 'bg-transparent'
              }`} />
              <VoiceOrb isConnected={isConnected} isSpeaking={conversation.isSpeaking} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`h-16 w-16 rounded-full border overflow-hidden transition-all duration-500 ${
                  isConnected
                    ? 'border-foreground/30 shadow-[0_0_24px_hsl(var(--tm-ink)/0.15)] dark:shadow-[0_0_30px_hsl(var(--tm-ink)/0.3)]'
                    : 'border-border shadow-sm'
                }`}>
                  <img src={trudyAvatar} alt="Trudy AI Assistant" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-none">Trudy</h1>
            <p className="text-muted-foreground text-xs mt-1 mb-3 max-w-sm mx-auto leading-relaxed">
              AI move coordinator — instant quotes, tracking, scheduling & support by voice.
            </p>

            {/* Action row */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-3">
              {!isConnected ? (
                <button
                  onClick={startCall}
                  disabled={isConnecting}
                  className="tru-modal-primary-btn !w-auto !px-6 !py-2 !text-[11px]"
                >
                  {isConnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
                  {isConnecting ? 'Connecting…' : 'Talk to Trudy'}
                </button>
              ) : (
                <button
                  onClick={endCall}
                  className="flex items-center gap-2 rounded-full bg-destructive text-destructive-foreground px-5 py-2 text-[11px] font-semibold transition-all hover:opacity-90 active:scale-95"
                >
                  <PhoneOff className="h-3.5 w-3.5" />
                  End Call
                </button>
              )}
              <a href="tel:+16097277647" className="tru-secondary-action-btn !text-[11px] !py-1.5 !px-4">
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
            <div className="flex flex-wrap justify-center gap-6 mt-4 mb-1">
              {[
                { value: '24/7', label: 'Availability' },
                { value: '<3s', label: 'Response' },
                { value: '95%', label: 'Resolved' },
                { value: '4.9★', label: 'Rating' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-sm font-black text-foreground tracking-tight">{s.value}</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CAPABILITIES GRID ─── */}
        <section className="py-8 px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-5">
              <h2 className="text-sm font-bold text-foreground tracking-tight uppercase tracking-wider">What Trudy Handles</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">One AI assistant for your entire move</p>
            </div>
            <div className="tru-hero-value-cards-open grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((cap, i) => (
                <div
                  key={cap.label}
                  className="tru-value-card-open group relative rounded-lg border border-border bg-card p-3 hover:border-foreground/20 transition-colors cursor-default"
                  style={{ animationDelay: `${0.5 + i * 0.08}s` }}
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
        <section className="py-8 px-4 border-t border-border">
          <div className="mx-auto max-w-4xl">
            <div className="grid lg:grid-cols-2 gap-8">

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
