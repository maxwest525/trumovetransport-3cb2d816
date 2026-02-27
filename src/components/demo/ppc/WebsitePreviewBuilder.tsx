import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon, ArrowLeft, Star, CheckCircle2, Phone, MapPin, Shield, Clock, Users, Truck, Quote, Play, ChevronRight, Zap, Award, ArrowRight, Lock, BarChart3, Globe, Headphones, Check, X, Palette } from "lucide-react";
import ScaledPreview from "@/components/ui/ScaledPreview";
import { BuildSelections } from "./AnalyticsBuilderPanel";
import { cn } from "@/lib/utils";
import { AutomationModeSelector } from "./AutomationModeSelector";
import { BrandExtractor } from "./BrandExtractor";
import { ExtractedBranding } from "@/lib/api/firecrawl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface WebsitePreviewBuilderProps {
  selections: BuildSelections;
  onBack: () => void;
}

type TemplateStyle = 'editorial-dark' | 'clean-split-light' | 'enterprise-dark-form' | 'promo-dark-gradient' | 'corporate-light-video' | 'top10-listicle';
type PageTab = 'home' | 'services' | 'reviews' | 'quote';

const TEMPLATES: { id: TemplateStyle; label: string; desc: string }[] = [
  { id: 'editorial-dark', label: 'Editorial Dark', desc: 'Pure black, centered' },
  { id: 'clean-split-light', label: 'Clean Split Light', desc: 'White, teal accent' },
  { id: 'enterprise-dark-form', label: 'Enterprise Dark Form', desc: 'Dark, form right' },
  { id: 'promo-dark-gradient', label: 'Promo Dark Gradient', desc: 'Navy-purple gradient' },
  { id: 'corporate-light-video', label: 'Corporate Light Video', desc: 'Light, blue accent' },
  { id: 'top10-listicle', label: 'Top 10 Listicle', desc: 'Review/ranking site' },
];

function getContent(selections: BuildSelections) {
  const kw = selections.keywords[0] || 'Long Distance Moving';
  const loc = selections.locations[0] || 'Los Angeles, CA';
  const audience = selections.demographics[0] || 'Homeowners';
  return {
    headline: `Expert ${kw.replace(/\b\w/g, c => c.toUpperCase())} in ${loc.split(',')[0]}`,
    subheadline: `Trusted by ${audience.toLowerCase()} across ${selections.locations.length || 3} states`,
    benefits: [
      selections.keywords[1] ? `Specialized ${selections.keywords[1]}` : 'AI-Powered Instant Quotes',
      selections.keywords[2] ? `Top-rated ${selections.keywords[2]}` : 'Real-Time GPS Tracking',
      'Full-Value Protection Guarantee',
    ],
    testimonials: [
      { name: 'Sarah M.', location: selections.locations[0] || 'Los Angeles', text: 'Seamless experience from quote to delivery. The AI estimate was spot-on.' },
      { name: 'James K.', location: selections.locations[1] || 'Houston', text: 'Best moving company we\'ve ever used. Professional, on-time, and careful with our belongings.' },
    ],
    cta: 'Get Your Free Quote',
    stats: [
      { label: 'Moves Completed', value: '50,000+' },
      { label: 'Customer Rating', value: '4.9/5' },
      { label: 'States Covered', value: '48' },
      { label: 'Years Experience', value: '15+' },
    ],
    logos: ['Allied', 'United', 'Mayflower', 'North American', 'Atlas'],
  };
}

type TProps = { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean };

interface ThemeColors { fg: string; muted: string; accent: string; border: string; cardBg: string; bg: string; }

function SharedServices({ fg, muted, accent, border, cardBg, bg }: ThemeColors) {
  const services = [
    { icon: '🚛', title: 'Long Distance', desc: 'Coast-to-coast relocation with guaranteed delivery windows and full GPS tracking on every shipment.' },
    { icon: '📦', title: 'Packing & Crating', desc: 'Professional packing using museum-quality materials. Custom crating for fragile and high-value items.' },
    { icon: '🏢', title: 'Commercial Moves', desc: 'Office and warehouse relocation with zero-downtime plans. Weekend and after-hours scheduling available.' },
    { icon: '🔒', title: 'Climate Storage', desc: '24/7 monitored, climate-controlled facilities in every major metro. Short and long-term options.' },
    { icon: '🚗', title: 'Auto Transport', desc: 'Open and enclosed vehicle shipping nationwide. Full insurance coverage and real-time tracking.' },
    { icon: '🌍', title: 'International', desc: 'Door-to-door international moves with customs brokerage, destination services, and ocean/air freight.' },
  ];
  return (
    <div style={{ padding: '80px 80px', background: bg, color: fg }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{ fontSize: 13, color: accent, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>Our Services</div>
        <h2 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1 }}>Everything You Need to Move</h2>
        <p style={{ fontSize: 17, color: muted, marginTop: 16, maxWidth: 560, margin: '16px auto 0' }}>From a single bedroom to an entire campus, we handle it all.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {services.map(s => (
          <div key={s.title} style={{ padding: 36, borderRadius: 20, border: `1px solid ${border}`, background: cardBg, transition: 'transform 0.2s' }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{s.title}</div>
            <p style={{ fontSize: 15, color: muted, lineHeight: 1.7 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SharedReviews({ fg, muted, accent, border, cardBg, bg, content }: ThemeColors & { content: TProps['content'] }) {
  const reviews = [
    ...content.testimonials,
    { name: 'Maria G.', location: 'Phoenix', text: 'The entire experience felt curated. Like someone actually cared about where my things ended up.' },
    { name: 'David R.', location: 'Seattle', text: 'GPS tracking gave us total peace of mind during our cross-country move. Would recommend to anyone.' },
    { name: 'Linda T.', location: 'Chicago', text: 'Relocated our entire office in one weekend. Zero downtime. The team was incredible.' },
    { name: 'Robert K.', location: 'Denver', text: 'Their AI quote was within $30 of the final price. No surprises, no hidden fees.' },
  ];
  return (
    <div style={{ padding: '80px 80px', background: bg, color: fg }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16 }}>{[1,2,3,4,5].map(i => <Star key={i} size={20} fill={accent} color={accent} />)}</div>
        <h2 style={{ fontSize: 44, fontWeight: 800 }}>What Our Customers Say</h2>
        <p style={{ fontSize: 16, color: muted, marginTop: 12 }}>4.9/5 from 12,847 verified reviews</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {reviews.map((t, i) => (
          <div key={i} style={{ padding: 32, borderRadius: 20, border: `1px solid ${border}`, background: cardBg }}>
            <div style={{ fontSize: 48, lineHeight: 1, opacity: 0.08, marginBottom: 8 }}>"</div>
            <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 24 }}>{t.text}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: accent + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: accent }}>{t.name[0]}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: 13, color: muted }}>{t.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SharedQuote({ fg, muted, accent, border, cardBg, bg }: ThemeColors) {
  return (
    <div style={{ padding: '80px 80px', background: bg, color: fg, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
      <div>
        <div style={{ fontSize: 13, color: accent, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Get Started</div>
        <h2 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>Let's talk<br />about your move.</h2>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: muted }}>Tell us about your move and we'll respond with a personalized plan within 24 hours. No pressure, no hidden fees.</p>
        <div style={{ marginTop: 48 }}>
          <div style={{ fontSize: 12, color: muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Or call directly</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>(800) 555-MOVE</div>
        </div>
      </div>
      <div style={{ padding: 40, borderRadius: 24, border: `1px solid ${border}`, background: cardBg }}>
        {['Full Name', 'Email Address', 'Phone', 'Moving From', 'Moving To', 'Preferred Date'].map(f => (
          <div key={f} style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: muted, letterSpacing: 0.5 }}>{f}</label>
            <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 18px', fontSize: 14 }} />
          </div>
        ))}
        <div style={{ background: accent, color: '#fff', padding: '16px 0', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 16, marginTop: 8 }}>Submit Request →</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 1. EDITORIAL DARK — Ubernatural-inspired
//    Pure black bg, enormous serif hero, floating portfolio-style
//    screenshots scattered at edges, ultra-minimal, dramatic
// ══════════════════════════════════════════════════════════════════

function EditorialDark({ content, page, darkMode }: TProps) {
  const bg = darkMode ? '#000000' : '#fafaf9';
  const fg = darkMode ? '#ffffff' : '#0a0a0a';
  const muted = darkMode ? '#555' : '#999';
  const border = darkMode ? '#1a1a1a' : '#e5e5e5';
  const cardBg = darkMode ? '#0a0a0a' : '#f5f5f4';

  const shared = { fg, muted, accent: fg, border, cardBg, bg };

  if (page === 'services') return <SharedServices {...shared} />;
  if (page === 'reviews') return <SharedReviews {...shared} content={content} />;
  if (page === 'quote') return <SharedQuote {...shared} />;

  // Portfolio card images - realistic scene previews
  const portfolioCards = [
    { top: 20, left: 30, w: 260, h: 180, rotate: -5, title: 'Corporate HQ', sub: 'Relocation · SF', gradient: darkMode ? 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' : 'linear-gradient(145deg, #e8e6e3 0%, #d4d0cc 50%, #c5c1bc 100%)' },
    { top: 10, right: 50, w: 280, h: 190, rotate: 4, title: 'Beachside Villa', sub: 'Full Service · Malibu', gradient: darkMode ? 'linear-gradient(145deg, #1b2838 0%, #2d4059 50%, #1a3c5e 100%)' : 'linear-gradient(145deg, #dce8f0 0%, #c5d5e0 50%, #b8cad6 100%)' },
    { bottom: 60, left: 60, w: 240, h: 170, rotate: 3, title: 'Tech Campus', sub: 'Commercial · Austin', gradient: darkMode ? 'linear-gradient(145deg, #1a1a2e 0%, #2a1a3a 50%, #1e1e3a 100%)' : 'linear-gradient(145deg, #e8e3ef 0%, #d5cee0 50%, #c5bed5 100%)' },
    { bottom: 40, right: 80, w: 250, h: 175, rotate: -4, title: 'Penthouse Suite', sub: 'Premium · Manhattan', gradient: darkMode ? 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 50%, #0d0d0d 100%)' : 'linear-gradient(145deg, #f0ece8 0%, #e0dcd8 50%, #d0ccc8 100%)' },
    { top: 220, left: -30, w: 220, h: 155, rotate: -2, title: 'Downtown Loft', sub: 'Residential · Chicago', gradient: darkMode ? 'linear-gradient(145deg, #0d1117 0%, #161b22 50%, #21262d 100%)' : 'linear-gradient(145deg, #e6e3df 0%, #d9d6d2 50%, #ccc9c5 100%)' },
    { top: 200, right: -20, w: 230, h: 160, rotate: 5, title: 'Family Estate', sub: 'Cross-Country · Denver', gradient: darkMode ? 'linear-gradient(145deg, #1a1f2e 0%, #252b3b 50%, #2f3545 100%)' : 'linear-gradient(145deg, #e8e6e0 0%, #dbd9d3 50%, #cecci6 100%)' },
  ];

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: 1200 }}>
      {/* Minimal nav — Ubernatural style */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={13} color={bg} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 400, letterSpacing: 3, textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>TruMove</span>
        </div>
        <div style={{ display: 'flex', gap: 36, fontSize: 13, color: muted, fontFamily: "'Inter', sans-serif" }}>
          <span>Work</span><span>About</span><span>Contact</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', gap: 14, color: muted }}>
            <div style={{ width: 18, height: 18, borderRadius: 999, border: `1px solid ${muted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>✦</div>
            <div style={{ width: 18, height: 18, borderRadius: 999, border: `1px solid ${muted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>◎</div>
          </div>
          <div style={{ border: `1px solid ${darkMode ? '#333' : '#bbb'}`, padding: '11px 32px', borderRadius: 999, fontSize: 13, fontFamily: "'Inter', sans-serif", letterSpacing: 0.5 }}>Get in touch</div>
        </div>
      </div>

      {/* Hero — massive centered serif text with scattered portfolio screenshots */}
      <div style={{ position: 'relative', padding: '160px 80px 120px', textAlign: 'center', minHeight: 820, overflow: 'hidden' }}>
        {/* Floating portfolio cards — more realistic with inner content */}
        {portfolioCards.map((pos, i) => (
          <div key={i} style={{
            position: 'absolute',
            ...(pos.top !== undefined ? { top: pos.top } : {}),
            ...('bottom' in pos && pos.bottom !== undefined ? { bottom: pos.bottom } : {}),
            ...('left' in pos && pos.left !== undefined ? { left: pos.left } : {}),
            ...('right' in pos && pos.right !== undefined ? { right: pos.right } : {}),
            width: pos.w, height: pos.h,
            borderRadius: 14,
            transform: `rotate(${pos.rotate}deg)`,
            overflow: 'hidden',
            boxShadow: darkMode ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.08)',
          }}>
            <div style={{ width: '100%', height: '100%', background: pos.gradient, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 16, position: 'relative' }}>
              {/* Fake browser dots */}
              <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', gap: 5 }}>
                {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 6, height: 6, borderRadius: 999, background: c, opacity: 0.6 }} />)}
              </div>
              {/* Fake UI elements */}
              <div style={{ position: 'absolute', top: 32, left: 12, right: 12 }}>
                <div style={{ height: 4, width: '60%', borderRadius: 2, background: fg, opacity: 0.06, marginBottom: 6 }} />
                <div style={{ height: 4, width: '40%', borderRadius: 2, background: fg, opacity: 0.04 }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif", opacity: 0.9 }}>{pos.title}</div>
                <div style={{ fontSize: 10, fontFamily: "'Inter', sans-serif", opacity: 0.4, marginTop: 2 }}>{pos.sub}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Center content — enormous serif type */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ marginBottom: 44 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} color={bg} />
            </div>
          </div>

          <h1 style={{ fontSize: 92, fontWeight: 400, lineHeight: 0.98, letterSpacing: -4, maxWidth: 880, margin: '0 auto' }}>
            We Move Lives
            <br />
            <span style={{ fontStyle: 'italic', color: muted }}>That Matter</span>
          </h1>
          
          <p style={{ fontSize: 17, color: muted, marginTop: 40, maxWidth: 440, margin: '40px auto 0', lineHeight: 1.8, fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
            Need the best movers in the shortest timeframe?<br />There's no one who does this better than us.
          </p>
          
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 52, fontFamily: "'Inter', sans-serif" }}>
            <div style={{ background: fg, color: bg, padding: '18px 48px', borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Let's move</div>
            <div style={{ border: `1px solid ${darkMode ? '#333' : '#bbb'}`, padding: '18px 48px', borderRadius: 999, fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>How It Works <ArrowRight size={16} /></div>
          </div>
        </div>
      </div>

      {/* Works showcase — large asymmetric grid */}
      <div style={{ padding: '0 80px 120px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: 12, color: muted, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>Selected Work</div>
            <h2 style={{ fontSize: 42, fontWeight: 400, letterSpacing: -1 }}>Recent Moves</h2>
          </div>
          <div style={{ fontSize: 13, color: muted, fontFamily: "'Inter', sans-serif", textDecoration: 'underline', textUnderlineOffset: 4 }}>View all</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          <div style={{ borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ height: 460, background: darkMode ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0a0e1a 100%)' : 'linear-gradient(180deg, #e8e6e3 0%, #d4d0cc 100%)', display: 'flex', alignItems: 'flex-end', padding: 36, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 24, right: 24, border: `1px solid ${darkMode ? '#333' : '#bbb'}`, padding: '8px 20px', borderRadius: 999, fontSize: 12, fontFamily: "'Inter', sans-serif", color: muted }}>View Case Study →</div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 400, letterSpacing: -0.5 }}>Manhattan → Los Angeles</div>
                <div style={{ fontSize: 13, color: muted, marginTop: 8, fontFamily: "'Inter', sans-serif" }}>Full-service corporate relocation · 2025</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'San Francisco HQ', sub: 'Commercial move · 2025', grad: darkMode ? 'linear-gradient(135deg, #1a1f2e, #252b3b)' : 'linear-gradient(135deg, #e8e6e3, #ddd)' },
              { title: 'Miami Beach Villa', sub: 'Premium residential · 2025', grad: darkMode ? 'linear-gradient(135deg, #1b2838, #2d4059)' : 'linear-gradient(135deg, #dce8f0, #c5d5e0)' },
            ].map(item => (
              <div key={item.title} style={{ borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ height: '100%', minHeight: 220, background: item.grad, display: 'flex', alignItems: 'flex-end', padding: 28 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 400 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{item.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process — large numbered steps */}
      <div style={{ padding: '120px 80px', borderTop: `1px solid ${border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 88 }}>
          <h2 style={{ fontSize: 56, fontWeight: 400, letterSpacing: -2 }}>How It Works</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 72 }}>
          {[
            { n: '01', title: 'Request a Quote', desc: 'Tell us your origin, destination, and timeline. Get an AI-powered estimate in under 60 seconds.' },
            { n: '02', title: 'We Plan Everything', desc: 'Our team handles packing, logistics, scheduling, and insurance. Zero effort on your part.' },
            { n: '03', title: 'Relax & Track', desc: 'Real-time GPS tracking on every shipment. Know exactly where your belongings are, 24/7.' },
          ].map(s => (
            <div key={s.n}>
              <div style={{ fontSize: 80, fontWeight: 200, color: darkMode ? '#151515' : '#e8e6e3', marginBottom: 28, fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 26, fontWeight: 400, marginBottom: 16, letterSpacing: -0.5 }}>{s.title}</div>
              <p style={{ fontSize: 15, color: muted, lineHeight: 1.8, fontFamily: "'Inter', sans-serif" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats — dramatic full-width dividers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: `1px solid ${border}` }}>
        {content.stats.map((s, i) => (
          <div key={s.label} style={{ padding: '64px 40px', textAlign: 'center', borderRight: i < 3 ? `1px solid ${border}` : 'none' }}>
            <div style={{ fontSize: 60, fontWeight: 300, letterSpacing: -3 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: muted, marginTop: 14, letterSpacing: 3, textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '140px 80px', textAlign: 'center', borderTop: `1px solid ${border}` }}>
        <h2 style={{ fontSize: 68, fontWeight: 400, letterSpacing: -3, maxWidth: 700, margin: '0 auto', lineHeight: 1.02 }}>
          Ready to make<br /><span style={{ fontStyle: 'italic' }}>your move?</span>
        </h2>
        <p style={{ fontSize: 17, color: muted, marginTop: 28, fontFamily: "'Inter', sans-serif" }}>Let's create something remarkable together.</p>
        <div style={{ marginTop: 52, display: 'inline-block', background: fg, color: bg, padding: '20px 60px', borderRadius: 999, fontSize: 16, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Get Started →</div>
      </div>

      {/* Footer */}
      <div style={{ padding: '40px 80px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 12, fontFamily: "'Inter', sans-serif" }}>
        <span>© 2025 TruMove</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span><span>Instagram</span></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 2. CLEAN SPLIT LIGHT — Pixel.ai-inspired
//    White bg, teal accent, asymmetric split hero with signup card,
//    checkmark bullets, browser mockup, airy spacing
// ══════════════════════════════════════════════════════════════════

function CleanSplitLight({ content, page, darkMode }: TProps) {
  const bg = darkMode ? '#0f172a' : '#ffffff';
  const fg = darkMode ? '#f1f5f9' : '#0f172a';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const accent = '#0d9488';
  const accentBg = darkMode ? '#0d948815' : '#f0fdfa';
  const cardBg = darkMode ? '#1e293b' : '#f8fafc';
  const border = darkMode ? '#334155' : '#e2e8f0';

  const shared = { fg, muted, accent, border, cardBg, bg };

  if (page === 'services') return <SharedServices {...shared} />;
  if (page === 'reviews') return <SharedReviews {...shared} content={content} />;
  if (page === 'quote') return <SharedQuote {...shared} />;

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 1200 }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800 }}>TruMove</span>
        </div>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, color: muted, fontWeight: 500 }}>
          <span>Features</span><span>Pricing</span><span>Reviews</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: muted, fontWeight: 500 }}>Log in</span>
          <div style={{ background: accent, color: '#fff', padding: '11px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700 }}>Get Started →</div>
        </div>
      </div>

      {/* Hero: asymmetric split — text left, CTA card right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 60, padding: '100px 64px 80px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${accent}40`, color: accent, padding: '7px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: 32 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: accent }} /> Now available
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>
            Create, Launch &<br />Optimize<br />
            <span style={{ color: accent }}>All With a Quote</span>
          </h1>
          <p style={{ fontSize: 18, color: muted, marginTop: 24, lineHeight: 1.7, maxWidth: 480 }}>
            Launch your move in minutes. Watch us handle everything from packing to delivery, around the clock.
          </p>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['Live estimates in minutes, not days', 'AI-generated routes & optimal pricing', 'Self-optimizing 24/7', 'Works across all 48 states'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15 }}>
                <div style={{ color: accent }}><CheckCircle2 size={18} /></div>
                <span>{b}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40 }}>
            <div style={{ fontSize: 12, color: muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Trusted by teams at</div>
            <div style={{ display: 'flex', gap: 28 }}>
              {content.logos.map(l => <span key={l} style={{ fontSize: 14, fontWeight: 700, color: muted, opacity: 0.4 }}>{l}</span>)}
            </div>
          </div>
        </div>

        {/* CTA Card — clean, elevated */}
        <div style={{ padding: 40, borderRadius: 20, border: `1px solid ${border}`, background: cardBg, boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Claim your free estimate</h3>
          <p style={{ fontSize: 14, color: muted, marginBottom: 28 }}>Sign up and get your first AI-powered estimate in minutes.</p>
          {['Moving From', 'Moving To', 'Move Date', 'Home Size'].map(f => (
            <div key={f} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: muted, marginBottom: 6 }}>{f}</div>
              <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '13px 18px', fontSize: 14 }} />
            </div>
          ))}
          <div style={{ background: accent, color: '#fff', padding: '15px 0', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 16, marginTop: 8 }}>Claim Your Credits</div>
        </div>
      </div>

      {/* How it Works — with browser mockup */}
      <div style={{ padding: '80px 64px', background: cardBg }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800 }}>How it Works</h2>
          <p style={{ fontSize: 17, color: muted, marginTop: 10 }}>Describe your move and watch TruMove build everything — in real time.</p>
        </div>
        {/* Browser mockup */}
        <div style={{ maxWidth: 960, margin: '0 auto', borderRadius: 20, border: `1px solid ${border}`, overflow: 'hidden', background: bg, boxShadow: '0 24px 80px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 7 }}>
              {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: 999, background: c }} />)}
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: muted, background: cardBg, padding: '5px 20px', borderRadius: 8, border: `1px solid ${border}` }}>trumove.com/dashboard</span>
            </div>
          </div>
          <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, minHeight: 380 }}>
            <div style={{ borderRight: `1px solid ${border}`, paddingRight: 24 }}>
              {['Dashboard', 'My Moves', 'Tracking', 'Quotes', 'Settings'].map((item, i) => (
                <div key={item} style={{ padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: i === 0 ? 700 : 500, background: i === 0 ? accentBg : 'transparent', color: i === 0 ? accent : muted, marginBottom: 4 }}>{item}</div>
              ))}
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {[{ label: 'Active Moves', val: '3' }, { label: 'Total Saved', val: '$4,200' }, { label: 'Rating', val: '4.9★' }].map(s => (
                  <div key={s.label} style={{ padding: 20, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: accent }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 160, borderRadius: 12, border: `1px solid ${border}`, background: `linear-gradient(135deg, ${accentBg}, ${bg})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <BarChart3 size={32} style={{ color: accent, opacity: 0.3, marginBottom: 8 }} />
                  <div style={{ fontSize: 13, color: muted }}>Move Analytics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div style={{ padding: '80px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800 }}>Everything you need</h2>
          <p style={{ fontSize: 17, color: muted, marginTop: 10 }}>One platform. Zero hassle.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { icon: <Zap size={22} />, title: 'AI Instant Quotes', desc: 'Machine learning estimates within $50 accuracy, updated in real-time.' },
            { icon: <MapPin size={22} />, title: 'GPS Tracking', desc: 'Real-time location of every shipment, updated every 30 seconds.' },
            { icon: <Shield size={22} />, title: 'Full Protection', desc: 'Comprehensive coverage up to $100K per shipment, included free.' },
            { icon: <Clock size={22} />, title: 'Guaranteed Dates', desc: 'We hit our delivery windows 99.2% of the time. Or your money back.' },
            { icon: <Users size={22} />, title: 'Dedicated Team', desc: 'Personal move coordinator from start to finish, available 24/7.' },
            { icon: <Headphones size={22} />, title: '24/7 Support', desc: 'Live help anytime via chat, phone, or email. Average response: 30s.' },
          ].map(f => (
            <div key={f.title} style={{ padding: 32, borderRadius: 16, border: `1px solid ${border}`, background: cardBg }}>
              <div style={{ color: accent, marginBottom: 20 }}>{f.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
              <p style={{ fontSize: 15, color: muted, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '40px 64px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Truck size={12} color="#fff" /></div>
          <span style={{ fontWeight: 700, color: fg }}>TruMove</span>
        </div>
        <span>© 2025 TruMove. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 20 }}><span>Privacy</span><span>Terms</span></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 3. ENTERPRISE DARK FORM — Ceros-inspired
//    Near-black bg (#0a0a0a), bold warm-white headline on left,
//    clean form with white inputs on right, minimal social proof,
//    NO gradient text — just bold, simple, dramatic
// ══════════════════════════════════════════════════════════════════

function EnterpriseDarkForm({ content, page, darkMode }: TProps) {
  const bg = darkMode ? '#0a0a0a' : '#f8fafc';
  const fg = darkMode ? '#f5f0e8' : '#0f172a';
  const muted = darkMode ? '#8a8478' : '#94a3b8';
  const accent = '#f5f0e8';
  const cardBg = darkMode ? '#141414' : '#ffffff';
  const border = darkMode ? '#222222' : '#e2e8f0';
  const inputBg = darkMode ? '#1a1a1a' : '#f1f5f9';

  const shared = { fg, muted, accent: darkMode ? '#f5f0e8' : '#0f172a', border, cardBg, bg };

  if (page === 'services') return <SharedServices {...shared} />;
  if (page === 'reviews') return <SharedReviews {...shared} content={content} />;
  if (page === 'quote') return <SharedQuote {...shared} />;

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 1200 }}>
      {/* Nav — minimal like Ceros */}
      <div style={{ padding: '28px 64px' }}>
        <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>TruMove</span>
      </div>

      {/* Hero — split: bold headline left, form right (Ceros layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 80, padding: '80px 64px 100px', alignItems: 'start' }}>
        <div style={{ paddingTop: 20 }}>
          <h1 style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2, color: fg }}>
            Stop planning moves manually. Start moving smarter—no stress required.
          </h1>
          <p style={{ fontSize: 17, color: muted, marginTop: 32, lineHeight: 1.8, maxWidth: 480 }}>
            TruMove gives homeowners and businesses the freedom to ditch the spreadsheets and unlock AI-powered moving that actually delivers. Get quotes, track shipments, and manage everything from one place.
          </p>
        </div>

        {/* Form — clean white inputs on dark bg, matching Ceros */}
        <div>
          {['First name', 'Last name', 'Email address', 'Phone number', 'Moving from', 'Moving to'].map(f => (
            <div key={f} style={{ marginBottom: 14 }}>
              <div style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: 8, padding: '16px 20px', fontSize: 15, color: muted }}>
                {f}
              </div>
            </div>
          ))}
          <div style={{
            marginTop: 8,
            background: darkMode ? '#f5f0e8' : '#0f172a',
            color: darkMode ? '#0a0a0a' : '#ffffff',
            padding: '18px 0',
            borderRadius: 8,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
          }}>
            Request a quote
          </div>
        </div>
      </div>

      {/* Social proof — centered, large text */}
      <div style={{ textAlign: 'center', padding: '80px 64px 60px', borderTop: `1px solid ${border}` }}>
        <h2 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>
          50,000+ families and businesses trust TruMove
        </h2>
      </div>

      {/* Logos strip */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 56, padding: '0 64px 80px' }}>
        {content.logos.map(l => (
          <span key={l} style={{ fontSize: 16, fontWeight: 700, color: muted, opacity: 0.35, letterSpacing: 1 }}>{l}</span>
        ))}
      </div>

      {/* Features — simple two-column layout */}
      <div style={{ padding: '80px 64px', borderTop: `1px solid ${border}` }}>
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 13, color: muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Your team is busy?</div>
          <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>Not a problem</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {[
            { title: 'AI-powered quotes built for speed', desc: 'No more wrestling with spreadsheet estimates. TruMove gives you smart, accurate quotes anyone can understand in seconds.' },
            { title: 'A platform made for movers', desc: 'Intuitive drag-and-drop scheduling, real-time GPS tracking, and automated customer updates — all from one dashboard.' },
            { title: 'Go from planning to moving even faster', desc: 'Drag-and-drop reusable templates for common routes. Pre-built packing lists. Auto-generated insurance forms.' },
            { title: 'Scale without the headcount', desc: 'AI handles quote generation, route optimization, and follow-ups. Your team focuses on what matters: the move.' },
          ].map(f => (
            <div key={f.title} style={{ padding: 36, borderRadius: 16, border: `1px solid ${border}`, background: cardBg }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{f.title}</div>
              <p style={{ fontSize: 15, color: muted, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        {content.stats.map((s, i) => (
          <div key={s.label} style={{ padding: '56px 32px', textAlign: 'center', borderRight: i < 3 ? `1px solid ${border}` : 'none' }}>
            <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -2 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: muted, marginTop: 10, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '100px 64px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 52, fontWeight: 800, letterSpacing: -2, maxWidth: 600, margin: '0 auto', lineHeight: 1.08 }}>
          Ready to simplify your next move?
        </h2>
        <p style={{ fontSize: 17, color: muted, marginTop: 24 }}>Join 50,000+ who already moved smarter.</p>
        <div style={{
          marginTop: 44,
          display: 'inline-block',
          background: darkMode ? '#f5f0e8' : '#0f172a',
          color: darkMode ? '#0a0a0a' : '#fff',
          padding: '18px 56px',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 700,
        }}>Get Your Quote →</div>
      </div>

      {/* Footer */}
      <div style={{ padding: '40px 64px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13 }}>
        <span style={{ fontWeight: 800, color: fg }}>TruMove</span>
        <span>© 2025 TruMove</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 4. PROMO DARK GRADIENT — Madgicx-inspired
//    Dark navy-purple bg, massive centered ALL-CAPS headline,
//    promo banner at top, glowing purple CTA, product screenshot
//    with dashboard UI below hero
// ══════════════════════════════════════════════════════════════════

function PromoDarkGradient({ content, page, darkMode }: TProps) {
  const bg = darkMode ? '#0c0820' : '#faf5ff';
  const fg = darkMode ? '#f3e8ff' : '#1e1b4b';
  const muted = darkMode ? '#8b84a8' : '#64748b';
  const purple = '#8b5cf6';
  const pink = '#ec4899';
  const gradBg = `linear-gradient(135deg, ${purple}, #6366f1)`;
  const gradText = `linear-gradient(135deg, ${purple}, ${pink}, #6366f1)`;
  const glow = `0 4px 40px ${purple}40`;
  const cardBg = darkMode ? '#110827' : '#ffffff';
  const border = darkMode ? '#1e1547' : '#e9d5ff';

  const shared = { fg, muted, accent: purple, border, cardBg, bg };

  if (page === 'services') return <SharedServices {...shared} />;
  if (page === 'reviews') return <SharedReviews {...shared} content={content} />;
  if (page === 'quote') return <SharedQuote {...shared} />;

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 1200 }}>
      {/* Promo banner — full width purple gradient */}
      <div style={{ background: gradBg, textAlign: 'center', padding: '12px 0', fontSize: 14, color: '#fff', fontWeight: 700, letterSpacing: 0.5 }}>
        🚨 $60 off your first month (USE COUPON: TRUMOVE60)
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 64px', borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <div style={{ width: 6, height: 20, background: purple, borderRadius: 2 }} />
            <div style={{ width: 6, height: 20, background: '#6366f1', borderRadius: 2, opacity: 0.6 }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>TruMove</span>
        </div>
        <div style={{ background: gradBg, color: '#fff', padding: '12px 32px', borderRadius: 12, fontSize: 14, fontWeight: 800, boxShadow: glow }}>
          👉 START YOUR 7-DAY FREE TRIAL NOW (+$60 OFF)
        </div>
      </div>

      {/* Hero — massive centered uppercase text with glow */}
      <div style={{ textAlign: 'center', padding: '120px 64px 80px', position: 'relative' }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle, ${purple}12 0%, transparent 60%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '30%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${pink}08 0%, transparent 60%)`, pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.15, letterSpacing: 1, textTransform: 'uppercase', maxWidth: 920, margin: '0 auto' }}>
            THE WORLD'S SMARTEST AI AGENT FOR MOVING – CLAIM YOUR 7-DAY FREE TRIAL AND{' '}
            <span style={{ background: gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GET $60 OFF</span>
          </h1>
          <p style={{ fontSize: 18, color: muted, marginTop: 32, maxWidth: 640, margin: '32px auto 0', lineHeight: 1.7 }}>
            If you're still planning moves manually, you're already losing. Other movers are quoting 10× faster with AI. Use the Coupon TRUMOVE60 according to the instructions at the end of this page.
          </p>
          <div style={{ marginTop: 48 }}>
            <div style={{ display: 'inline-block', background: gradBg, color: '#fff', padding: '22px 64px', borderRadius: 14, fontSize: 17, fontWeight: 800, boxShadow: glow, letterSpacing: 0.5 }}>
              👉 START YOUR 7-DAY FREE TRIAL NOW (+$60 OFF)
            </div>
            <div style={{ fontSize: 13, color: muted, marginTop: 12, opacity: 0.6 }}>Get Lifetime access</div>
          </div>
        </div>
      </div>

      {/* Product screenshot — detailed dashboard mockup */}
      <div style={{ margin: '0 64px 100px', borderRadius: 24, overflow: 'hidden', border: `1px solid ${border}`, boxShadow: `0 40px 120px -20px ${purple}25` }}>
        <div style={{ padding: 32, background: cardBg }}>
          {/* Dashboard header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: gradBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 18 }}>✦</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Good morning, it's your personal AI Mover ✨</div>
              <div style={{ fontSize: 13, color: muted }}>Ask AI Mover to Do More</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 20 }}>
            {/* Left - metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'ROAS', val: '4.2×', icon: '📊' },
                { label: 'Net profit', val: '$24.8K', icon: '💰' },
                { label: 'CAC', val: '$47', icon: '📉' },
              ].map(m => (
                <div key={m.label} style={{ padding: 16, borderRadius: 12, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{m.val}</div>
                    <div style={{ fontSize: 11, color: muted }}>{m.label}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Center - recommendations */}
            <div style={{ padding: 24, borderRadius: 16, border: `1px solid ${border}`, background: bg }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>15 recommendations are waiting</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['All: 10', 'Facebook: 8', 'Google: 2'].map(tab => (
                  <div key={tab} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, background: tab.startsWith('All') ? purple + '20' : 'transparent', color: tab.startsWith('All') ? purple : muted, fontWeight: 600 }}>{tab}</div>
                ))}
              </div>
              {[
                'Ann C. → Set budget $5 to $7.2',
                'Matthew O. → Set budget $3 to $7.2',
                'John B. → Set budget $4 to $6.8',
              ].map(r => (
                <div key={r} style={{ padding: '10px 0', borderBottom: `1px solid ${border}`, fontSize: 13, color: muted }}>{r}</div>
              ))}
            </div>
            
            {/* Right - performance */}
            <div style={{ padding: 24, borderRadius: 16, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>You are 20% below average</div>
              <div style={{ fontSize: 13, color: muted, marginBottom: 16 }}>Optimization opportunities detected</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Machine optimized', val: '54' },
                  { label: 'Total actions', val: '128' },
                  { label: 'Open', val: '10' },
                  { label: 'Completed', val: '54' },
                ].map(s => (
                  <div key={s.label} style={{ padding: 12, borderRadius: 8, border: `1px solid ${border}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: muted }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social proof stats */}
      <div style={{ padding: '80px 64px', borderTop: `1px solid ${border}`, textAlign: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {content.stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 52, fontWeight: 900, background: gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: muted, marginTop: 10 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '40px 64px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13 }}>
        <span style={{ fontWeight: 700, color: fg }}>TruMove</span>
        <span>© 2025 TruMove</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 5. CORPORATE LIGHT VIDEO — GoHighLevel-inspired
//    Light pastel blue hero bg, navy headline (#1e3a5f), golden/blue
//    CTA button, promo top banner, awards strip with badge icons,
//    split demo video + value prop, comparison table
// ══════════════════════════════════════════════════════════════════

function CorporateLightVideo({ content, page, darkMode }: TProps) {
  const bg = darkMode ? '#0f172a' : '#ffffff';
  const fg = darkMode ? '#f1f5f9' : '#0f172a';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const accent = '#2563eb';
  const navy = '#1e3a5f';
  const orange = '#f59e0b';
  const heroBg = darkMode ? '#0c1529' : '#e8f1fd';
  const cardBg = darkMode ? '#1e293b' : '#f8fafc';
  const border = darkMode ? '#334155' : '#e2e8f0';

  const shared = { fg, muted, accent, border, cardBg, bg };

  if (page === 'services') return <SharedServices {...shared} />;
  if (page === 'reviews') return <SharedReviews {...shared} content={content} />;
  if (page === 'quote') return <SharedQuote {...shared} />;

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 1200 }}>
      {/* Top banner — navy with emoji */}
      <div style={{ background: navy, textAlign: 'center', padding: '13px 0', fontSize: 14, color: '#fff', fontWeight: 700, letterSpacing: 0.5 }}>
        🎉 START YOUR FREE 14 DAY TRIAL TODAY! 🎉
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 64px', background: bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 22 }}>🚛</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: navy }}>TruMove</span>
        </div>
        <div style={{ border: `1px solid ${border}`, padding: '11px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: bg }}>Login to App</div>
      </div>

      {/* Hero — split with badge + video placeholder */}
      <div style={{ background: heroBg, padding: '80px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${border}`, padding: '10px 22px', borderRadius: 999, fontSize: 14, fontWeight: 600, marginBottom: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', color: navy }}>
            ⚡ Power Up Your Business:
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.18, letterSpacing: -1, color: navy }}>
            Elevate Your Marketing and Sales with TruMove's All-in-One Platform!
          </h1>
          <div style={{ marginTop: 36 }}>
            <div style={{ background: accent, color: '#fff', padding: '22px 48px', borderRadius: 12, fontSize: 18, fontWeight: 800, display: 'inline-block', textAlign: 'center', boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}>
              14 DAY FREE TRIAL
              <div style={{ fontSize: 13, fontWeight: 400, marginTop: 4, opacity: 0.85 }}>No obligations, no contracts, cancel at any time</div>
            </div>
          </div>
        </div>
        {/* Video placeholder — product UI mockup */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.08)' }}>
          <div style={{ height: 340, background: `linear-gradient(135deg, ${navy} 0%, #2563eb 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ width: 80, height: 80, borderRadius: 999, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Play size={32} fill="#fff" color="#fff" />
            </div>
            <div style={{ position: 'absolute', top: 24, left: 24, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#fff' }}>
              <div style={{ fontWeight: 700 }}>TruMove</div>
              <div style={{ opacity: 0.7, marginTop: 2 }}>Platform Overview</div>
            </div>
          </div>
        </div>
      </div>

      {/* Awards row */}
      <div style={{ textAlign: 'center', padding: '56px 64px', borderBottom: `1px solid ${border}` }}>
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 32, color: muted }}>Awards</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {[
            { icon: '🏆', label: 'Momentum\nLeader 2025' },
            { icon: '🥇', label: 'Leader\nWinter 2025' },
            { icon: '⭐', label: 'Users\nLove Us' },
            { icon: '🏅', label: 'Capterra\nShortlist' },
            { icon: '📊', label: 'Top 20\nFastest Growing' },
            { icon: '🎖️', label: 'Leader\nAmericas 2025' },
            { icon: '🏆', label: 'Small Business\nLeader' },
          ].map(a => (
            <div key={a.label} style={{ width: 100, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{a.icon}</div>
              <div style={{ fontSize: 11, color: muted, whiteSpace: 'pre-line', lineHeight: 1.3, fontWeight: 600 }}>{a.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Value prop + demo */}
      <div style={{ padding: '80px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
        <div style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${border}`, background: cardBg }}>
          <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${heroBg}, ${bg})` }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: 999, background: accent }} />
                <span style={{ fontSize: 14, color: accent, fontWeight: 600 }}>Watch Demo</span>
              </div>
              <Play size={44} style={{ color: accent }} />
            </div>
          </div>
        </div>
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, color: navy }}>
            We're In The Business Of<br />
            <span style={{ color: accent }}>Helping You Grow Your Business</span>
          </h2>
          <p style={{ fontSize: 16, color: muted, marginTop: 20, lineHeight: 1.7 }}>
            TruMove is the first-ever all-in-one platform that gives you the tools, support, and resources you need to succeed and crush your marketing goals.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 32 }}>
            {content.stats.map(s => (
              <div key={s.label} style={{ padding: 20, borderRadius: 14, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: accent }}>{s.value}</div>
                <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ padding: '48px 64px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: navy }}>Why teams switch to TruMove</h2>
        </div>
        <div style={{ border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: cardBg }}>
            {['Feature', 'TruMove', 'Competitor A', 'Competitor B'].map((h, i) => (
              <div key={h} style={{ padding: '16px 28px', fontSize: 14, fontWeight: 700, color: i === 1 ? accent : muted, textAlign: i > 0 ? 'center' : 'left', borderBottom: `2px solid ${border}` }}>{h}</div>
            ))}
          </div>
          {[
            ['AI Instant Quotes', true, false, false],
            ['Real-Time GPS', true, true, false],
            ['Built-in CRM', true, false, true],
            ['Marketing Automation', true, false, false],
            ['24/7 Support', true, false, false],
          ].map(([feature, a, b, c], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: `1px solid ${border}` }}>
              <div style={{ padding: '14px 28px', fontSize: 14 }}>{feature as string}</div>
              {[a, b, c].map((val, j) => (
                <div key={j} style={{ padding: '14px 28px', textAlign: 'center' }}>
                  {val ? <Check size={20} color="#22c55e" /> : <X size={20} color="#ef4444" style={{ opacity: 0.35 }} />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '40px 64px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13 }}>
        <span style={{ fontWeight: 700, color: fg }}>TruMove</span>
        <span>© 2025 TruMove</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 6. TOP 10 LISTICLE — Review/ranking site
// ══════════════════════════════════════════════════════════════════

function Top10Listicle({ content, page, darkMode }: TProps) {
  const bg = darkMode ? '#0f1117' : '#ffffff';
  const fg = darkMode ? '#e5e7eb' : '#111827';
  const muted = darkMode ? '#6b7280' : '#9ca3af';
  const accent = '#4f46e5';
  const green = '#22c55e';
  const greenBg = darkMode ? '#22c55e15' : '#f0fdf4';
  const cardBg = darkMode ? '#1a1d27' : '#f9fafb';
  const border = darkMode ? '#2a2d37' : '#e5e7eb';

  const shared = { fg, muted, accent, border, cardBg, bg };

  if (page === 'services') return <SharedServices {...shared} />;
  if (page === 'reviews') return <SharedReviews {...shared} content={content} />;
  if (page === 'quote') return <SharedQuote {...shared} />;

  const competitors = [
    { rank: 1, name: 'TruMove', rating: 4.9, reviews: 12847, badge: "Editor's Choice", highlight: true, pros: ['AI-powered instant quotes', 'Real-time GPS tracking', 'Full-value protection'], cons: ['Premium pricing', 'Minimum 3-day notice'] },
    { rank: 2, name: 'SafeShip Movers', rating: 4.6, reviews: 8932, badge: 'Best Value', highlight: false, pros: ['Competitive pricing', 'Flexible scheduling'], cons: ['Limited tracking', 'No packing service'] },
    { rank: 3, name: 'QuickHaul Express', rating: 4.5, reviews: 7654, badge: null, highlight: false, pros: ['Fast delivery times', 'Good communication'], cons: ['Higher damage rates', 'No storage options'] },
    { rank: 4, name: 'PrimeRoute Logistics', rating: 4.4, reviews: 6543, badge: null, highlight: false, pros: ['Nationwide coverage', 'Military discounts'], cons: ['Slow customer service', 'Limited insurance'] },
    { rank: 5, name: 'HomeBase Movers', rating: 4.3, reviews: 5678, badge: null, highlight: false, pros: ['Great for local moves', 'Weekend availability'], cons: ['No long-distance', 'Small trucks only'] },
  ];

  const kw = content.headline.split(' in ')[0]?.replace('Expert ', '') || 'Long Distance Moving';
  const loc = content.headline.split(' in ')[1] || 'Your Area';
  const year = new Date().getFullYear();

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 1200 }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 80px', borderBottom: `1px solid ${border}` }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>MovingReviews<span style={{ color: accent }}>.com</span></span>
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: muted }}>
          <span>Home</span><span>Categories</span><span>How We Rank</span><span>About</span>
        </div>
        <div style={{ fontSize: 13, color: muted }}>Last Updated: Feb {year}</div>
      </div>

      {/* Header */}
      <div style={{ padding: '64px 80px 48px', maxWidth: 900 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <span style={{ background: accent + '20', color: accent, padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>✅ Updated for {year}</span>
          <span style={{ background: greenBg, color: green, padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>Independently Reviewed</span>
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.15, letterSpacing: -1 }}>
          Top 5 Best {kw} Companies in {loc} ({year})
        </h1>
        <p style={{ fontSize: 17, color: muted, marginTop: 20, lineHeight: 1.7 }}>
          We researched and compared {competitors.length} {kw.toLowerCase()} companies based on pricing, customer reviews, insurance coverage, and service quality.
        </p>
        <div style={{ display: 'flex', gap: 28, marginTop: 24, fontSize: 14, color: muted }}>
          <span>📋 {competitors.length} Companies</span>
          <span>⏱️ 47 Hours Research</span>
          <span>👥 12,000+ Surveys</span>
        </div>
      </div>

      {/* Quick pick */}
      <div style={{ margin: '0 80px', padding: '20px 28px', background: cardBg, borderRadius: 14, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <span style={{ fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap' }}>🏆 Quick Pick:</span>
        <span style={{ fontSize: 15 }}><strong>TruMove</strong> — Best overall for {kw.toLowerCase()}. AI-powered quotes, 4.9★ rating, full-value protection.</span>
        <div style={{ marginLeft: 'auto', background: green, color: '#fff', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>Get Free Quote →</div>
      </div>

      {/* Rankings */}
      <div style={{ padding: '0 80px 64px' }}>
        {competitors.map(c => (
          <div key={c.rank} style={{
            padding: 32, marginBottom: 16, borderRadius: 16,
            border: c.highlight ? `2px solid ${accent}` : `1px solid ${border}`,
            background: c.highlight ? (darkMode ? '#1a1d2e' : '#fffbeb') : cardBg,
            display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 24, alignItems: 'start',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: c.highlight ? accent : cardBg, border: c.highlight ? 'none' : `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: c.highlight ? '#fff' : fg }}>
              {c.rank}
            </div>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 800 }}>{c.name}</span>
                {c.badge && <span style={{ background: c.highlight ? accent : green + '20', color: c.highlight ? '#fff' : green, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{c.badge}</span>}
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= Math.floor(c.rating) ? '#f59e0b' : 'transparent'} color="#f59e0b" />)}
                <span style={{ fontSize: 14, fontWeight: 700, marginLeft: 6 }}>{c.rating}</span>
                <span style={{ fontSize: 13, color: muted, marginLeft: 4 }}>({c.reviews.toLocaleString()} reviews)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: green, marginBottom: 6, letterSpacing: 1 }}>✓ PROS</div>
                  {c.pros.map(p => <div key={p} style={{ fontSize: 13, color: muted, marginBottom: 4, paddingLeft: 12 }}>• {p}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 6, letterSpacing: 1 }}>✗ CONS</div>
                  {c.cons.map(p => <div key={p} style={{ fontSize: 13, color: muted, marginBottom: 4, paddingLeft: 12 }}>• {p}</div>)}
                </div>
              </div>
            </div>
            
            <div style={{ background: c.highlight ? accent : fg, color: c.highlight ? '#fff' : bg, padding: '12px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
              Visit Site →
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '40px 80px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13 }}>
        <span>MovingReviews.com</span>
        <span>© {year} · Independently operated</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════

export function WebsitePreviewBuilder({ selections, onBack }: WebsitePreviewBuilderProps) {
  const [template, setTemplate] = useState<TemplateStyle>('editorial-dark');
  const [darkMode, setDarkMode] = useState(false);
  const [isWebsite, setIsWebsite] = useState(selections.outputType === 'website');
  const [activePage, setActivePage] = useState<PageTab>('home');
  const [customBranding, setCustomBranding] = useState<ExtractedBranding | null>(null);

  const getThemedColors = (): { accent: string; fg: string; bg: string; muted: string; border: string; cardBg: string } | null => {
    if (!customBranding?.colors) return null;
    const c = customBranding.colors;
    const isDark = darkMode || customBranding.colorScheme === 'dark';
    return {
      accent: c.primary || c.accent || '#635BFF',
      fg: isDark ? (c.textPrimary && c.textPrimary !== '#000000' ? c.textPrimary : '#ffffff') : (c.textPrimary || '#0a0a0a'),
      bg: isDark ? (c.background && c.background !== '#FFFFFF' ? c.background : '#0a0a0a') : (c.background || '#ffffff'),
      muted: c.textSecondary || (isDark ? '#888' : '#666'),
      border: isDark ? '#222' : '#e5e5e5',
      cardBg: isDark ? '#111' : '#f8f8f8',
    };
  };

  const content = getContent(selections);

  const renderTemplate = () => {
    const props = { content, page: activePage, darkMode };
    switch (template) {
      case 'editorial-dark': return <EditorialDark {...props} />;
      case 'clean-split-light': return <CleanSplitLight {...props} />;
      case 'enterprise-dark-form': return <EnterpriseDarkForm {...props} />;
      case 'promo-dark-gradient': return <PromoDarkGradient {...props} />;
      case 'corporate-light-video': return <CorporateLightVideo {...props} />;
      case 'top10-listicle': return <Top10Listicle {...props} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => { setIsWebsite(false); setActivePage('home'); }} className={cn("px-3 py-1.5 text-xs font-medium transition-colors", !isWebsite ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>Landing Page</button>
            <button onClick={() => { setIsWebsite(true); setActivePage('home'); }} className={cn("px-3 py-1.5 text-xs font-medium transition-colors", isWebsite ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>Website</button>
          </div>

          <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            {darkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            {darkMode ? 'Dark' : 'Light'}
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant={customBranding ? "default" : "outline"} size="sm" className="gap-1.5 text-xs">
                <Palette className="w-3.5 h-3.5" />
                {customBranding ? 'Styled' : 'Style Extractor'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[520px] max-h-[70vh] overflow-y-auto" align="end">
              <BrandExtractor onApplyTheme={setCustomBranding} />
            </PopoverContent>
          </Popover>

          <AutomationModeSelector />
        </div>
      </div>

      {/* Template Picker */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border",
              template === t.id
                ? 'bg-foreground text-background border-foreground'
                : 'text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Website page tabs */}
      {isWebsite && (
        <div className="flex gap-1">
          {(['home', 'services', 'reviews', 'quote'] as PageTab[]).map(p => (
            <button
              key={p}
              onClick={() => setActivePage(p)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors",
                activePage === p ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {p === 'quote' ? 'Quote Form' : p}
            </button>
          ))}
        </div>
      )}

      {/* Preview Canvas */}
      <div className="rounded-xl border border-border overflow-hidden">
        <ScaledPreview contentWidth={1440} scrollable>
          {renderTemplate()}
        </ScaledPreview>
      </div>
    </div>
  );
}
