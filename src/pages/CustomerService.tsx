import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Phone, Send, Clock, Shield, Calculator, MapPin, Calendar, HelpCircle, Package, ScanLine, Video, Loader2, MessageSquare, FileText, Brain, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import TrudyChatBox from '@/components/TrudyChatBox';
import AIChatContainer from '@/components/chat/AIChatContainer';
import { getPageContext } from '@/components/chat/pageContextConfig';
import SiteShell from '@/components/layout/SiteShell';
import { ScrollFadeIn } from '@/hooks/useScrollFadeIn';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const capabilities = [
  { icon: Calculator, label: 'Instant Quotes', desc: 'AI-powered estimates in seconds', tag: 'Most used', href: '/online-estimate' },
  { icon: MapPin, label: 'Live Tracking', desc: 'Real-time GPS location & ETA', href: '/track' },
  { icon: Calendar, label: 'Scheduling', desc: 'Book or reschedule moves', href: '/book' },
  { icon: Shield, label: 'Carrier Vetting', desc: 'FMCSA safety verified', href: '/carrier-vetting' },
  { icon: ScanLine, label: 'Room Scanner', desc: 'Photo-based inventory', href: '/scan-room' },
  { icon: Package, label: 'Packing Help', desc: 'Tips & checklists', href: '/faq' },
  { icon: Video, label: 'Video Consult', desc: 'Live virtual walk-through', href: '/book' },
  { icon: HelpCircle, label: 'General Support', desc: 'Insurance, claims, storage', href: '/faq' },
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

      const targetIntensity = isSpeaking ? 0.6 + Math.sin(t * 5) * 0.2 + Math.sin(t * 8.3) * 0.15 : isConnected ? 0.15 : 0;
      intensityRef.current += (targetIntensity - intensityRef.current) * 0.08;
      const intensity = intensityRef.current;

      const dark = isDarkRef.current;
      const hueBase = isConnected ? (isSpeaking ? 20 + Math.sin(t * 3) * 20 : 200) : 0;
      const sat = isConnected ? (dark ? 20 + intensity * 45 : 8 + intensity * 30) : 0;
      const lum = dark
        ? (isConnected ? 55 + intensity * 20 : 50)
        : (isConnected ? 25 + intensity * 15 : 55);

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

      const baseR = 46;
      const pulse = isSpeaking
        ? Math.sin(t * 6) * (3 + intensity * 5) + Math.sin(t * 9.5) * (2 + intensity * 3)
        : isConnected ? Math.sin(t * 2) * 1.5 : 0;
      const r = baseR + pulse;

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

      if (isConnected) {
        const spawnRate = isSpeaking ? 2 + Math.floor(intensity * 3) : 1;
        if (Math.random() < (isSpeaking ? 0.6 : 0.15)) {
          for (let i = 0; i < spawnRate; i++) spawnParticle(cx, cy, r, intensity);
        }
      }

      const alive: Particle[] = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.005;
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
  const [activeTab, setActiveTab] = useState<'voice' | 'form'>('voice');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const scrollToChat = useCallback(() => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

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
    <SiteShell hideTrustStrip>
      {/* ─── HERO ─── */}
      <ScrollFadeIn>
        <section className="py-10 md:py-16 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px]" />
            <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left — text content */}
              <div className="text-center lg:text-left space-y-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold mb-3">AI-Powered Support</p>
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                    <span className="h-px w-8 bg-primary/40" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    <span className="h-px w-8 bg-primary/40" />
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
                    Meet <span className="text-primary">Trudy</span>
                  </h1>
                  <p className="text-muted-foreground text-base md:text-lg mt-4 max-w-md mx-auto lg:mx-0 leading-relaxed font-light">
                    Your AI move coordinator — get instant quotes, real-time tracking, scheduling & 24/7 support by voice or chat.
                  </p>
                </div>

                {/* Action row */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <button
                    onClick={scrollToChat}
                    className="tru-modal-primary-btn !w-auto !px-8 !py-3 !text-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat with Trudy
                  </button>
                  <a href="tel:+16097277647" className="tru-secondary-action-btn !text-sm !py-2.5 !px-5">
                    <Phone className="h-4 w-4" />
                    (609) 727-7647
                  </a>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto lg:mx-0 pt-2">
                  {[
                    { value: '24/7', label: 'Availability' },
                    { value: '<3s', label: 'Response' },
                    { value: '95%', label: 'Resolved' },
                    { value: '4.9★', label: 'Rating' },
                  ].map((s) => (
                    <div key={s.label} className="text-center lg:text-left">
                      <p className="text-lg font-black text-foreground tracking-tight">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-1">
                  {['Instant Quotes', 'Live Tracking', 'Smart Scheduling', 'Carrier Vetting'].map((f) => (
                    <span key={f} className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — chat box */}
              <div className="w-full max-w-lg mx-auto lg:max-w-none">
                <TrudyChatBox />
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      {/* ─── CAPABILITIES GRID ─── */}
      <ScrollFadeIn delay={0.1}>
        <section className="py-8 md:py-14 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-primary/[0.05] blur-[100px]" />
            <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-8">
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold mb-3">Capabilities</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="h-px w-8 bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span className="h-px w-8 bg-primary/40" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.1]">
                What Trudy <span className="text-primary">Handles</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg font-light leading-relaxed mt-3">
                One AI assistant for your entire move
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={cap.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
                >
                  <Link
                    to={cap.href}
                    className="group relative block rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_-2px_hsl(var(--foreground)/0.08)] hover:shadow-[0_8px_24px_-4px_hsl(var(--foreground)/0.16)] hover:border-foreground/30 hover:-translate-y-1 hover:scale-[1.03] transition-all duration-200 no-underline h-full"
                  >
                    {cap.tag && (
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wider text-foreground bg-muted px-2 py-0.5 rounded group-hover:bg-foreground group-hover:text-background transition-colors duration-200">
                        {cap.tag}
                      </span>
                    )}
                    <cap.icon className="w-5 h-5 text-muted-foreground mb-2 group-hover:text-foreground group-hover:scale-110 transition-all duration-200" />
                    <h3 className="text-sm font-semibold text-foreground">{cap.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed group-hover:text-foreground/70 transition-colors duration-200">{cap.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      {/* ─── FAQ + CONTACT ─── */}
      <ScrollFadeIn delay={0.15}>
        <section className="py-8 md:py-14 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-8">
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold mb-3">Support</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="h-px w-8 bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span className="h-px w-8 bg-primary/40" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.1]">
                FAQ & <span className="text-primary">Contact</span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              {/* FAQ */}
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold mb-4">Common Questions</h3>
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
                  <h3 className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">Contact a Human</h3>
                  <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider">Optional</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Trudy handles 95% of requests. For the rest, we're here.</p>

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
      </ScrollFadeIn>

      {/* ─── BOTTOM CTA ─── */}
      <ScrollFadeIn delay={0.2}>
        <section className="py-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/[0.06] blur-[120px]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          </div>
          <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Ready for a worry-free <span className="text-primary">move</span>?
            </h2>
            <p className="text-muted-foreground text-sm md:text-base font-light mb-6">
              Get your instant estimate and let us handle the rest.
            </p>
            <Link
              to="/online-estimate"
              className="inline-flex items-center gap-2 h-11 px-8 rounded-lg bg-foreground text-background font-semibold text-sm hover:bg-foreground/85 transition-all duration-200 hover:shadow-[0_4px_12px_hsl(var(--foreground)/0.15)]"
            >
              Start Your Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </ScrollFadeIn>
    </SiteShell>
  );
}
