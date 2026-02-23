import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, ArrowLeft, Star, CheckCircle2, Phone, MapPin, Shield, Clock, Users, Truck, Quote, Play } from "lucide-react";
import ScaledPreview from "@/components/ui/ScaledPreview";
import { BuildSelections } from "./AnalyticsBuilderPanel";
import { cn } from "@/lib/utils";

interface WebsitePreviewBuilderProps {
  selections: BuildSelections;
  onBack: () => void;
}

type TemplateStyle = 'editorial-dark' | 'clean-split-light' | 'enterprise-dark-form' | 'promo-dark-gradient' | 'corporate-light-video';
type PageTab = 'home' | 'services' | 'reviews' | 'quote';

const TEMPLATES: { id: TemplateStyle; label: string; desc: string }[] = [
  { id: 'editorial-dark', label: 'Editorial Dark', desc: 'Pure black, centered' },
  { id: 'clean-split-light', label: 'Clean Split Light', desc: 'White, teal accent' },
  { id: 'enterprise-dark-form', label: 'Enterprise Dark Form', desc: 'Dark, form right' },
  { id: 'promo-dark-gradient', label: 'Promo Dark Gradient', desc: 'Navy-purple gradient' },
  { id: 'corporate-light-video', label: 'Corporate Light Video', desc: 'Light, blue accent' },
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

// ── Template Renderers ─────────────────────────────────────────────────

function EditorialDark({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#000000' : '#ffffff';
  const fg = darkMode ? '#ffffff' : '#000000';
  const muted = darkMode ? '#888888' : '#666666';
  const border = darkMode ? '#222222' : '#e5e5e5';

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 80px', borderBottom: `1px solid ${border}` }}>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: -1 }}>TruMove</span>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, color: muted }}>
          <span>Home</span><span>Services</span><span>Reviews</span><span>Quote</span>
        </div>
        <div style={{ background: fg, color: bg, padding: '10px 24px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
          {content.cta}
        </div>
      </div>

      {page === 'home' && (
        <>
          {/* Hero */}
          <div style={{ textAlign: 'center', padding: '120px 80px 80px' }}>
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -3, lineHeight: 1.05, maxWidth: 900, margin: '0 auto' }}>
              {content.headline}
            </div>
            <p style={{ fontSize: 18, color: muted, marginTop: 24, maxWidth: 600, margin: '24px auto 0' }}>
              {content.subheadline}
            </p>
            <div style={{ marginTop: 40, display: 'flex', gap: 16, justifyContent: 'center' }}>
              <div style={{ background: fg, color: bg, padding: '16px 40px', borderRadius: 999, fontSize: 16, fontWeight: 600 }}>{content.cta}</div>
              <div style={{ border: `1px solid ${border}`, padding: '16px 40px', borderRadius: 999, fontSize: 16, color: muted }}>Watch Demo</div>
            </div>
          </div>
          {/* Social Proof */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, padding: '40px 80px', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
            {content.logos.map(l => <span key={l} style={{ fontSize: 14, color: muted, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}>{l}</span>)}
          </div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: border, margin: '0 80px' }}>
            {content.stats.map(s => (
              <div key={s.label} style={{ background: bg, padding: '48px 32px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: muted, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Benefits */}
          <div style={{ padding: '80px 80px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
            {content.benefits.map((b, i) => (
              <div key={i} style={{ padding: '32px', border: `1px solid ${border}`, borderRadius: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: darkMode ? '#1a1a1a' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {i === 0 ? <Shield size={24} color={muted} /> : i === 1 ? <Truck size={24} color={muted} /> : <CheckCircle2 size={24} color={muted} />}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{b}</div>
                <p style={{ fontSize: 14, color: muted, marginTop: 8 }}>Industry-leading service with transparent pricing and real-time updates throughout your move.</p>
              </div>
            ))}
          </div>
        </>
      )}

      {page === 'services' && (
        <div style={{ padding: '80px' }}>
          <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 48 }}>Our Services</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {['Long Distance Moving', 'Local Moving', 'Commercial Relocation', 'Packing Services', 'Storage Solutions', 'Auto Transport'].map(s => (
              <div key={s} style={{ padding: 32, border: `1px solid ${border}`, borderRadius: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{s}</div>
                <p style={{ fontSize: 14, color: muted }}>Professional, insured service with guaranteed delivery dates and full-value protection.</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '80px' }}>
          <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 48 }}>Customer Reviews</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {[...content.testimonials, ...content.testimonials].map((t, i) => (
              <div key={i} style={{ padding: 32, border: `1px solid ${border}`, borderRadius: 16 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>{[1,2,3,4,5].map(s => <Star key={s} size={16} fill={darkMode ? '#fff' : '#000'} color={darkMode ? '#fff' : '#000'} />)}</div>
                <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 16 }}>"{t.text}"</p>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: muted }}>{t.location}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'quote' && (
        <div style={{ padding: '80px', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16, textAlign: 'center' }}>Get Your Free Quote</h2>
          <p style={{ fontSize: 16, color: muted, textAlign: 'center', marginBottom: 48 }}>Fill out the form below and we'll get back to you within 60 seconds.</p>
          {['Full Name', 'Email Address', 'Phone Number', 'Moving From', 'Moving To', 'Move Date'].map(field => (
            <div key={field} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>{field}</label>
              <div style={{ background: darkMode ? '#111' : '#f5f5f5', border: `1px solid ${border}`, borderRadius: 8, padding: '12px 16px', fontSize: 14, color: muted }}>{field}...</div>
            </div>
          ))}
          <div style={{ background: fg, color: bg, padding: '16px', borderRadius: 8, textAlign: 'center', fontWeight: 600, fontSize: 16, marginTop: 24 }}>{content.cta}</div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '48px 80px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13, marginTop: 40 }}>
        <span>© 2025 TruMove. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span><span>Contact</span></div>
      </div>
    </div>
  );
}

function CleanSplitLight({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#0a0a0a' : '#ffffff';
  const fg = darkMode ? '#ffffff' : '#0a0a0a';
  const muted = darkMode ? '#999' : '#666';
  const accent = '#0d9488';
  const accentBg = darkMode ? '#0d948815' : '#0d948810';
  const cardBg = darkMode ? '#141414' : '#f8fafb';
  const border = darkMode ? '#222' : '#e5e7eb';

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 80px', borderBottom: `1px solid ${border}` }}>
        <span style={{ fontSize: 20, fontWeight: 700 }}>TruMove</span>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, color: muted }}><span>Home</span><span>Services</span><span>Reviews</span><span>Quote</span></div>
        <div style={{ background: accent, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{content.cta}</div>
      </div>

      {page === 'home' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, padding: '80px', alignItems: 'center' }}>
            <div>
              <div style={{ background: accentBg, color: accent, padding: '6px 16px', borderRadius: 999, display: 'inline-block', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>AI-Powered Moving</div>
              <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2 }}>{content.headline}</h1>
              <p style={{ fontSize: 17, color: muted, marginTop: 20, lineHeight: 1.7 }}>{content.subheadline}</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <div style={{ background: accent, color: '#fff', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 600 }}>{content.cta}</div>
                <div style={{ border: `1px solid ${border}`, padding: '14px 32px', borderRadius: 8, fontSize: 15, color: muted }}>Learn More</div>
              </div>
            </div>
            <div style={{ background: cardBg, borderRadius: 16, padding: 40, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Get Instant Quote</div>
              {['Moving From', 'Moving To', 'Move Date'].map(f => (
                <div key={f} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: muted }}>{f}</div>
                  <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 14px', fontSize: 14 }}>{f}...</div>
                </div>
              ))}
              <div style={{ background: accent, color: '#fff', padding: '14px', borderRadius: 8, textAlign: 'center', fontWeight: 600, fontSize: 15, marginTop: 16 }}>Get Quote →</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, padding: '32px 80px', background: cardBg, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
            {content.logos.map(l => <span key={l} style={{ fontSize: 13, color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{l}</span>)}
          </div>
          <div style={{ padding: '64px 80px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {content.benefits.map((b, i) => (
              <div key={i} style={{ padding: 28, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <CheckCircle2 size={20} color={accent} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{b}</div>
                <p style={{ fontSize: 13, color: muted, marginTop: 8, lineHeight: 1.6 }}>Reliable, transparent service every step of the way.</p>
              </div>
            ))}
          </div>
        </>
      )}

      {page === 'services' && (
        <div style={{ padding: 80 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 40 }}>Our Services</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {['Long Distance Moving', 'Local Moving', 'Commercial Relocation', 'Packing Services'].map(s => (
              <div key={s} style={{ padding: 28, border: `1px solid ${border}`, borderRadius: 12, background: cardBg }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s}</div>
                <p style={{ fontSize: 14, color: muted }}>Professional service with guaranteed delivery dates.</p>
                <div style={{ color: accent, fontSize: 14, fontWeight: 600, marginTop: 12 }}>Learn More →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: 80 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 40 }}>What Our Customers Say</h2>
          {content.testimonials.map((t, i) => (
            <div key={i} style={{ padding: 28, border: `1px solid ${border}`, borderRadius: 12, marginBottom: 16, background: cardBg }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>{[1,2,3,4,5].map(s => <Star key={s} size={16} fill={accent} color={accent} />)}</div>
              <p style={{ fontSize: 16, lineHeight: 1.6 }}>"{t.text}"</p>
              <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>{t.name} · <span style={{ color: muted }}>{t.location}</span></div>
            </div>
          ))}
        </div>
      )}

      {page === 'quote' && (
        <div style={{ padding: '80px', maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, textAlign: 'center' }}>{content.cta}</h2>
          <p style={{ textAlign: 'center', color: muted, marginBottom: 40 }}>AI-powered estimates in under 60 seconds.</p>
          {['Full Name', 'Email', 'Phone', 'From', 'To', 'Date'].map(f => (
            <div key={f} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>{f}</label>
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 8, padding: '11px 14px', fontSize: 14, color: muted }}>{f}...</div>
            </div>
          ))}
          <div style={{ background: accent, color: '#fff', padding: 14, borderRadius: 8, textAlign: 'center', fontWeight: 600, marginTop: 20 }}>{content.cta}</div>
        </div>
      )}

      <div style={{ padding: '48px 80px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13, marginTop: 40 }}>
        <span>© 2025 TruMove</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span></div>
      </div>
    </div>
  );
}

function EnterpriseDarkForm({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#0a0a0a' : '#f8fafc';
  const fg = darkMode ? '#ffffff' : '#0f172a';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const accent = '#64748b';
  const cardBg = darkMode ? '#141414' : '#ffffff';
  const border = darkMode ? '#1e293b' : '#e2e8f0';

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 80px', borderBottom: `1px solid ${border}` }}>
        <span style={{ fontSize: 20, fontWeight: 700 }}>TruMove</span>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, color: muted }}><span>Home</span><span>Services</span><span>Reviews</span><span>Quote</span></div>
        <div style={{ background: fg, color: bg, padding: '10px 24px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>Contact Us</div>
      </div>

      {page === 'home' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 60, padding: '100px 80px', alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>{content.headline}</h1>
              <p style={{ fontSize: 18, color: muted, marginTop: 24, lineHeight: 1.7 }}>{content.subheadline}. Enterprise-grade relocation services with guaranteed timelines.</p>
              <div style={{ display: 'flex', gap: 48, marginTop: 40 }}>
                {content.stats.slice(0, 3).map(s => (
                  <div key={s.label}><div style={{ fontSize: 28, fontWeight: 800 }}>{s.value}</div><div style={{ fontSize: 12, color: muted, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div></div>
                ))}
              </div>
            </div>
            <div style={{ background: cardBg, borderRadius: 12, padding: 32, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Request a Consultation</div>
              {['Company Name', 'Contact Name', 'Email', 'Phone', 'Employees Relocating', 'Timeline'].map(f => (
                <div key={f} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f}</div>
                  <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 6, padding: '10px 12px', fontSize: 14 }}></div>
                </div>
              ))}
              <div style={{ background: fg, color: bg, padding: 14, borderRadius: 6, textAlign: 'center', fontWeight: 600, marginTop: 8 }}>Submit Request</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, padding: '32px 80px', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
            {content.logos.map(l => <span key={l} style={{ fontSize: 13, color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{l}</span>)}
          </div>
        </>
      )}

      {page !== 'home' && (
        <div style={{ padding: 80 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 40 }}>{page === 'services' ? 'Enterprise Services' : page === 'reviews' ? 'Client Testimonials' : 'Request Consultation'}</h2>
          <p style={{ fontSize: 16, color: muted }}>Content section for {page} page.</p>
        </div>
      )}

      <div style={{ padding: '48px 80px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13, marginTop: 40 }}>
        <span>© 2025 TruMove Enterprise</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span></div>
      </div>
    </div>
  );
}

function PromoDarkGradient({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? 'linear-gradient(135deg, #0c0a1a 0%, #1a0a2e 50%, #0c0a1a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f0f0ff 50%, #f8fafc 100%)';
  const solidBg = darkMode ? '#0c0a1a' : '#f8fafc';
  const fg = darkMode ? '#ffffff' : '#0f172a';
  const muted = darkMode ? '#a78bfa' : '#7c3aed';
  const mutedText = darkMode ? '#a3a3a3' : '#666';
  const accent = '#a855f7';
  const border = darkMode ? '#2d1b69' : '#e5e7eb';
  const cardBg = darkMode ? '#ffffff08' : '#ffffff';

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      {/* Promo Banner */}
      <div style={{ background: `linear-gradient(90deg, ${accent}, #6366f1)`, color: '#fff', textAlign: 'center', padding: '10px', fontSize: 13, fontWeight: 600 }}>
        🎉 Limited Time: Save 30% on All Long Distance Moves — Book This Week
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 80px' }}>
        <span style={{ fontSize: 20, fontWeight: 700 }}>TruMove</span>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, color: mutedText }}><span>Home</span><span>Services</span><span>Reviews</span><span>Quote</span></div>
        <div style={{ background: `linear-gradient(135deg, ${accent}, #6366f1)`, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{content.cta}</div>
      </div>

      {page === 'home' && (
        <>
          <div style={{ textAlign: 'center', padding: '100px 80px 60px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 4, color: muted, marginBottom: 24 }}>AI-POWERED MOVING</div>
            <h1 style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05, letterSpacing: -3, textTransform: 'uppercase' }}>{content.headline}</h1>
            <p style={{ fontSize: 18, color: mutedText, marginTop: 24, maxWidth: 600, margin: '24px auto 0' }}>{content.subheadline}</p>
            <div style={{ marginTop: 40 }}>
              <div style={{ background: `linear-gradient(135deg, ${accent}, #6366f1)`, color: '#fff', padding: '18px 48px', borderRadius: 12, fontSize: 18, fontWeight: 700, display: 'inline-block', boxShadow: `0 8px 32px ${accent}40` }}>{content.cta}</div>
            </div>
          </div>
          {/* Product Screenshot Placeholder */}
          <div style={{ margin: '0 80px', borderRadius: 16, border: `1px solid ${border}`, background: cardBg, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: mutedText }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Product Dashboard Preview</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Interactive quote builder & tracking</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '64px 80px' }}>
            {content.stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: 24, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ fontSize: 32, fontWeight: 800, background: `linear-gradient(135deg, ${accent}, #6366f1)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: mutedText, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {page !== 'home' && (
        <div style={{ padding: 80 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 40 }}>{page === 'services' ? 'Our Services' : page === 'reviews' ? 'Reviews' : content.cta}</h2>
          <p style={{ fontSize: 16, color: mutedText }}>Content section for {page} page.</p>
        </div>
      )}

      <div style={{ padding: '48px 80px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: mutedText, fontSize: 13, marginTop: 40 }}>
        <span>© 2025 TruMove</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span></div>
      </div>
    </div>
  );
}

function CorporateLightVideo({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const fg = darkMode ? '#f1f5f9' : '#0f172a';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const accent = '#3b82f6';
  const accentBg = darkMode ? '#3b82f615' : '#3b82f610';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const border = darkMode ? '#334155' : '#e2e8f0';

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      {/* Top banner */}
      <div style={{ background: accent, color: '#fff', textAlign: 'center', padding: '10px', fontSize: 13, fontWeight: 600 }}>
        ⭐ Rated #1 Moving Platform — Start Your Free Trial Today
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 80px', borderBottom: `1px solid ${border}` }}>
        <span style={{ fontSize: 20, fontWeight: 700 }}>TruMove</span>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, color: muted }}><span>Home</span><span>Services</span><span>Reviews</span><span>Pricing</span></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ border: `1px solid ${border}`, padding: '10px 20px', borderRadius: 8, fontSize: 13, color: muted }}>Log In</div>
          <div style={{ background: accent, color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Start Free</div>
        </div>
      </div>

      {page === 'home' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, padding: '80px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['⭐ G2 Leader', '🏆 Best of 2025', '✅ SOC 2'].map(badge => (
                  <div key={badge} style={{ background: accentBg, color: accent, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{badge}</div>
                ))}
              </div>
              <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5 }}>{content.headline}</h1>
              <p style={{ fontSize: 17, color: muted, marginTop: 20, lineHeight: 1.7 }}>{content.subheadline}. One platform to manage quotes, bookings, and tracking.</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <div style={{ background: accent, color: '#fff', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 600 }}>Start Free Trial</div>
                <div style={{ border: `1px solid ${border}`, padding: '14px 32px', borderRadius: 8, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, color: muted }}><Play size={16} /> Watch Demo</div>
              </div>
            </div>
            {/* Video placeholder */}
            <div style={{ borderRadius: 12, border: `1px solid ${border}`, background: cardBg, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={28} color="#fff" fill="#fff" />
              </div>
              <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,.6)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>2:34</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, padding: '32px 80px', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
            {content.logos.map(l => <span key={l} style={{ fontSize: 13, color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{l}</span>)}
          </div>
        </>
      )}

      {page !== 'home' && (
        <div style={{ padding: 80 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 40 }}>{page === 'services' ? 'Platform Features' : page === 'reviews' ? 'Customer Success Stories' : 'Get Started'}</h2>
          <p style={{ fontSize: 16, color: muted }}>Content section for {page} page.</p>
        </div>
      )}

      <div style={{ padding: '48px 80px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13, marginTop: 40 }}>
        <span>© 2025 TruMove Platform Inc.</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span><span>Security</span></div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────

export function WebsitePreviewBuilder({ selections, onBack }: WebsitePreviewBuilderProps) {
  const [template, setTemplate] = useState<TemplateStyle>('editorial-dark');
  const [darkMode, setDarkMode] = useState(true);
  const [isWebsite, setIsWebsite] = useState(selections.outputType === 'website');
  const [activePage, setActivePage] = useState<PageTab>('home');

  const content = getContent(selections);

  const renderTemplate = () => {
    const props = { content, page: activePage, darkMode };
    switch (template) {
      case 'editorial-dark': return <EditorialDark {...props} />;
      case 'clean-split-light': return <CleanSplitLight {...props} />;
      case 'enterprise-dark-form': return <EnterpriseDarkForm {...props} />;
      case 'promo-dark-gradient': return <PromoDarkGradient {...props} />;
      case 'corporate-light-video': return <CorporateLightVideo {...props} />;
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
          {/* Landing / Website toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => { setIsWebsite(false); setActivePage('home'); }} className={cn("px-3 py-1.5 text-xs font-medium transition-colors", !isWebsite ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>Landing Page</button>
            <button onClick={() => { setIsWebsite(true); setActivePage('home'); }} className={cn("px-3 py-1.5 text-xs font-medium transition-colors", isWebsite ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>Website</button>
          </div>

          {/* Light/Dark */}
          <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            {darkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            {darkMode ? 'Dark' : 'Light'}
          </button>
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
