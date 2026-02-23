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

      {page === 'services' && (
        <div style={{ padding: '80px' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>Enterprise Services</h2>
          <p style={{ fontSize: 16, color: muted, marginBottom: 48, maxWidth: 600 }}>End-to-end relocation solutions for organizations of every size.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {[
              { title: 'Corporate Relocation', desc: 'Full-service employee relocation with dedicated project managers, temporary housing coordination, and spousal career assistance.' },
              { title: 'Office & Commercial Moves', desc: 'Minimize downtime with after-hours and weekend scheduling. IT equipment handling and furniture installation included.' },
              { title: 'Executive Moving', desc: 'White-glove service for C-suite relocations. Confidential, insured, and handled by our most experienced crews.' },
              { title: 'International Transfers', desc: 'Customs brokerage, freight forwarding, and destination services across 40+ countries.' },
              { title: 'Asset Management', desc: 'Inventory tracking, secure warehousing, and disposition services for surplus office assets.' },
              { title: 'Policy Consulting', desc: 'Optimize your mobility program with data-driven benchmarking and policy design.' },
            ].map(s => (
              <div key={s.title} style={{ padding: 28, border: `1px solid ${border}`, borderRadius: 10, background: cardBg }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                <p style={{ fontSize: 14, color: muted, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '80px' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>Client Testimonials</h2>
          <p style={{ fontSize: 16, color: muted, marginBottom: 48 }}>What enterprise clients say about working with TruMove.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {[
              { name: 'Sarah Mitchell', role: 'VP People Ops, Acme Corp', text: 'TruMove relocated 120 employees across 3 states in under 60 days. Zero complaints, zero delays.', location: content.testimonials[0]?.location },
              { name: 'James Park', role: 'CFO, Summit Healthcare', text: 'The cost transparency was refreshing. No surprise invoices — exactly what was quoted is what we paid.', location: content.testimonials[1]?.location },
              { name: 'Linda Torres', role: 'HR Director, Finova Inc.', text: 'Their dedicated PM made the entire office move seamless. Our team was back online within 24 hours.', location: 'New York' },
              { name: 'David Chen', role: 'COO, TechBridge', text: 'International relocation used to be a nightmare. TruMove handled customs, housing, and onboarding support flawlessly.', location: 'San Francisco' },
            ].map((t, i) => (
              <div key={i} style={{ padding: 28, border: `1px solid ${border}`, borderRadius: 10, background: cardBg }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={fg} color={fg} />)}</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>"{t.text}"</p>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: muted }}>{t.role} · {t.location}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'quote' && (
        <div style={{ padding: '80px', maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>Request a Consultation</h2>
          <p style={{ fontSize: 15, color: muted, textAlign: 'center', marginBottom: 40 }}>Tell us about your relocation needs and we'll prepare a custom proposal within 24 hours.</p>
          {['Company Name', 'Contact Name', 'Work Email', 'Phone Number', 'Number of Employees', 'Origin Location', 'Destination', 'Preferred Timeline'].map(f => (
            <div key={f} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5, color: muted }}>{f}</label>
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 6, padding: '11px 14px', fontSize: 14, color: muted }}>{f}...</div>
            </div>
          ))}
          <div style={{ background: fg, color: bg, padding: 14, borderRadius: 6, textAlign: 'center', fontWeight: 600, fontSize: 15, marginTop: 20 }}>Submit Request</div>
          <p style={{ fontSize: 12, color: muted, textAlign: 'center', marginTop: 12 }}>We'll respond within 1 business day. No obligation.</p>
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

      {page === 'services' && (
        <div style={{ padding: '64px 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 4, color: muted, marginBottom: 16 }}>WHAT WE OFFER</div>
            <h2 style={{ fontSize: 44, fontWeight: 900, textTransform: 'uppercase' }}>Our Services</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: '🚛', title: 'Long Distance Moving', desc: 'Coast-to-coast relocations with guaranteed delivery windows and full GPS tracking.' },
              { icon: '📦', title: 'Packing & Crating', desc: 'Professional packing with custom crating for fragile, high-value, and oversized items.' },
              { icon: '🏢', title: 'Commercial Moves', desc: 'Office relocations with minimal downtime. Weekend and after-hours scheduling available.' },
              { icon: '🔒', title: 'Secure Storage', desc: 'Climate-controlled, 24/7 monitored storage facilities in all major metros.' },
              { icon: '🌍', title: 'International Shipping', desc: 'Door-to-door international moves with customs clearance and destination support.' },
              { icon: '🚗', title: 'Auto Transport', desc: 'Open and enclosed vehicle shipping anywhere in the continental US.' },
            ].map(s => (
              <div key={s.title} style={{ padding: 28, borderRadius: 12, border: `1px solid ${border}`, background: cardBg, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                <p style={{ fontSize: 13, color: mutedText, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '64px 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 4, color: muted, marginBottom: 16 }}>TESTIMONIALS</div>
            <h2 style={{ fontSize: 44, fontWeight: 900, textTransform: 'uppercase' }}>What Customers Say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {[
              ...content.testimonials,
              { name: 'Maria G.', location: 'Phoenix', text: 'The promo discount was real — no bait and switch. Saved over $800 on our cross-country move.' },
              { name: 'Robert L.', location: 'Chicago', text: 'From the first call to final delivery, everything was handled with care. Will absolutely use again.' },
            ].map((t, i) => (
              <div key={i} style={{ padding: 28, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>{[1,2,3,4,5].map(s => <Star key={s} size={16} fill={accent} color={accent} />)}</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>"{t.text}"</p>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: mutedText }}>{t.location}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'quote' && (
        <div style={{ padding: '64px 80px', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 4, color: muted, marginBottom: 16 }}>LIMITED TIME OFFER</div>
            <h2 style={{ fontSize: 40, fontWeight: 900 }}>{content.cta}</h2>
            <p style={{ fontSize: 16, color: mutedText, marginTop: 12 }}>Lock in 30% savings when you book this week. AI-powered estimates in under 60 seconds.</p>
          </div>
          {['Full Name', 'Email Address', 'Phone Number', 'Moving From', 'Moving To', 'Preferred Move Date'].map(f => (
            <div key={f} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4, color: mutedText }}>{f}</label>
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 8, padding: '12px 16px', fontSize: 14, color: mutedText }}>{f}...</div>
            </div>
          ))}
          <div style={{ background: `linear-gradient(135deg, ${accent}, #6366f1)`, color: '#fff', padding: '16px', borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 16, marginTop: 20, boxShadow: `0 8px 32px ${accent}40` }}>{content.cta} — Save 30%</div>
          <p style={{ fontSize: 12, color: mutedText, textAlign: 'center', marginTop: 12 }}>No credit card required · Free cancellation</p>
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

      {page === 'services' && (
        <div style={{ padding: '64px 80px' }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['All Features', 'Quoting', 'Tracking', 'CRM'].map((tab, i) => (
                <div key={tab} style={{ background: i === 0 ? accent : 'transparent', color: i === 0 ? '#fff' : muted, padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: i === 0 ? 'none' : `1px solid ${border}` }}>{tab}</div>
              ))}
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Platform Features</h2>
            <p style={{ fontSize: 16, color: muted }}>Everything you need to run your moving business, in one place.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: '⚡', title: 'AI Instant Quotes', desc: 'Customers get accurate estimates in under 60 seconds using our AI inventory scanner.' },
              { icon: '📍', title: 'Real-Time Tracking', desc: 'GPS-powered shipment tracking with automated customer notifications at every milestone.' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Revenue forecasting, lead attribution, and crew performance metrics at a glance.' },
              { icon: '🤝', title: 'Built-In CRM', desc: 'Manage leads, follow-ups, and customer communications from a single inbox.' },
              { icon: '📱', title: 'Mobile App', desc: 'Crew management, digital BOLs, and photo documentation from any device.' },
              { icon: '🔗', title: 'Integrations', desc: 'Connect with QuickBooks, Google Ads, Zapier, and 50+ tools out of the box.' },
            ].map(f => (
              <div key={f.title} style={{ padding: 24, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
                <p style={{ fontSize: 13, color: muted, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '64px 80px' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Customer Success Stories</h2>
          <p style={{ fontSize: 16, color: muted, marginBottom: 40 }}>See how moving companies grow with TruMove.</p>

          {/* Featured case study */}
          <div style={{ padding: 32, borderRadius: 12, border: `1px solid ${border}`, background: cardBg, marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ background: accentBg, color: accent, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>Case Study</div>
              <div style={{ background: accentBg, color: accent, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>+340% Lead Growth</div>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>How Summit Movers Tripled Their Revenue in 6 Months</h3>
            <p style={{ fontSize: 15, color: muted, lineHeight: 1.7 }}>"TruMove's AI quoting converted 3x more website visitors into booked moves. The analytics dashboard helped us cut our ad spend by 40% while increasing leads."</p>
            <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600 }}>— Alex Rivera, Owner, Summit Movers</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              ...content.testimonials,
              { name: 'Chris W.', location: 'Denver', text: 'Switched from spreadsheets to TruMove. Now I can see every lead, every truck, and every dollar in real time.' },
              { name: 'Priya S.', location: 'Austin', text: 'The mobile app alone was worth it. My crews do everything from their phones now — no more paperwork.' },
            ].map((t, i) => (
              <div key={i} style={{ padding: 24, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={accent} color={accent} />)}</div>
                <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>"{t.text}"</p>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name} · <span style={{ color: muted, fontWeight: 400 }}>{t.location}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'quote' && (
        <div style={{ padding: '64px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>Get Started Free</h2>
              <p style={{ fontSize: 16, color: muted, lineHeight: 1.7, marginBottom: 32 }}>Start your 14-day free trial. No credit card required. Set up in under 5 minutes.</p>
              <div style={{ display: 'grid', gap: 16 }}>
                {[
                  { label: 'Unlimited quotes', desc: 'AI-powered instant estimates for your customers' },
                  { label: 'Full CRM access', desc: 'Manage leads, deals, and follow-ups from day one' },
                  { label: 'Analytics dashboard', desc: 'Track every metric that matters to your business' },
                  { label: 'Priority support', desc: 'Live chat and phone support during your trial' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <CheckCircle2 size={18} color={accent} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{f.label}</div>
                      <div style={{ fontSize: 13, color: muted }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: cardBg, borderRadius: 12, padding: 32, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Create Your Account</div>
              {['Full Name', 'Work Email', 'Company Name', 'Phone Number', 'Company Size'].map(f => (
                <div key={f} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4, color: muted }}>{f}</label>
                  <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '11px 14px', fontSize: 14 }}>{f}...</div>
                </div>
              ))}
              <div style={{ background: accent, color: '#fff', padding: 14, borderRadius: 8, textAlign: 'center', fontWeight: 600, fontSize: 15, marginTop: 8 }}>Start Free Trial →</div>
              <p style={{ fontSize: 11, color: muted, textAlign: 'center', marginTop: 10 }}>No credit card required · Cancel anytime</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '48px 80px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13, marginTop: 40 }}>
        <span>© 2025 TruMove Platform Inc.</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span><span>Security</span></div>
      </div>
    </div>
  );
}

function Top10Listicle({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#0f1117' : '#ffffff';
  const fg = darkMode ? '#f1f5f9' : '#1a1a2e';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const accent = '#f59e0b';
  const cardBg = darkMode ? '#1a1d2e' : '#f8fafc';
  const border = darkMode ? '#2a2d3e' : '#e5e7eb';
  const greenBg = darkMode ? '#16a34a15' : '#16a34a10';
  const green = '#16a34a';

  const competitors = [
    { rank: 1, name: 'TruMove', rating: 4.9, reviews: 12847, badge: '🏆 Editor\'s Choice', highlight: true, pros: ['AI-powered instant quotes', 'Real-time GPS tracking', 'Full-value protection', '$0 hidden fees'], cons: ['Premium pricing'] },
    { rank: 2, name: 'SafeShip Movers', rating: 4.6, reviews: 8234, badge: null, highlight: false, pros: ['Good customer service', 'Nationwide coverage'], cons: ['Slow quote process', 'Extra fees for stairs'] },
    { rank: 3, name: 'QuickHaul Express', rating: 4.5, reviews: 6891, badge: null, highlight: false, pros: ['Fast delivery times', 'Budget options'], cons: ['Limited tracking', 'Insurance extra'] },
    { rank: 4, name: 'HomeRun Relocations', rating: 4.3, reviews: 5102, badge: null, highlight: false, pros: ['Family-owned', 'Flexible scheduling'], cons: ['Regional only', 'No online booking'] },
    { rank: 5, name: 'PrimeMove Co.', rating: 4.2, reviews: 4567, badge: null, highlight: false, pros: ['Corporate packages', 'Storage options'], cons: ['Higher minimums', 'Slower response'] },
    { rank: 6, name: 'EasyGo Movers', rating: 4.1, reviews: 3890, badge: null, highlight: false, pros: ['Low prices', 'Simple booking'], cons: ['Limited insurance', 'Few reviews'] },
    { rank: 7, name: 'TransNation', rating: 4.0, reviews: 3201, badge: null, highlight: false, pros: ['International moves', 'Multi-language'], cons: ['Complex pricing', 'Long wait times'] },
    { rank: 8, name: 'BudgetBox Movers', rating: 3.9, reviews: 2890, badge: null, highlight: false, pros: ['Cheapest option', 'DIY packages'], cons: ['Minimal service', 'No packing help'] },
    { rank: 9, name: 'SwiftLine Moving', rating: 3.8, reviews: 2345, badge: null, highlight: false, pros: ['Fast estimates', 'Weekend availability'], cons: ['Small fleet', 'Limited areas'] },
    { rank: 10, name: 'ValuePack Relocation', rating: 3.7, reviews: 1980, badge: null, highlight: false, pros: ['Bundle deals', 'Student discounts'], cons: ['Inconsistent quality', 'Few trucks'] },
  ];

  const kw = content.headline.split(' in ')[0]?.replace('Expert ', '') || 'Long Distance Moving';
  const loc = content.headline.split(' in ')[1] || 'Your Area';
  const year = new Date().getFullYear();

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 80px', borderBottom: `1px solid ${border}` }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>MovingReviews<span style={{ color: accent }}>.com</span></span>
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: muted }}>
          <span>Home</span><span>Categories</span><span>How We Rank</span><span>About</span>
        </div>
        <div style={{ fontSize: 12, color: muted }}>Last Updated: Feb {year}</div>
      </div>

      {page === 'home' && (
        <>
          {/* Hero */}
          <div style={{ padding: '64px 80px 48px', maxWidth: 900 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span style={{ background: accent + '20', color: accent, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>✅ Updated for {year}</span>
              <span style={{ background: greenBg, color: green, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>Independently Reviewed</span>
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, letterSpacing: -1 }}>
              Top 10 Best {kw} Companies in {loc} ({year})
            </h1>
            <p style={{ fontSize: 17, color: muted, marginTop: 16, lineHeight: 1.7 }}>
              We researched and compared {competitors.length} {kw.toLowerCase()} companies based on pricing, customer reviews, insurance coverage, and service quality. Here are our top picks.
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 24, fontSize: 13, color: muted }}>
              <span>📋 {competitors.length} Companies Reviewed</span>
              <span>⏱️ 47 Hours of Research</span>
              <span>👥 12,000+ Customer Surveys</span>
            </div>
          </div>

          {/* Quick comparison strip */}
          <div style={{ margin: '0 80px', padding: '20px 24px', background: cardBg, borderRadius: 12, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>🏆 Quick Pick:</span>
            <span style={{ fontSize: 14 }}><strong>TruMove</strong> — Best overall for {kw.toLowerCase()}. AI-powered quotes, 4.9★ rating, full-value protection.</span>
            <div style={{ marginLeft: 'auto', background: green, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>Get Free Quote →</div>
          </div>

          {/* Rankings */}
          <div style={{ padding: '0 80px 64px' }}>
            {competitors.map((c) => (
              <div key={c.rank} style={{
                padding: 28,
                marginBottom: 16,
                borderRadius: 12,
                border: c.highlight ? `2px solid ${accent}` : `1px solid ${border}`,
                background: c.highlight ? (darkMode ? '#1a1d2e' : '#fffbeb') : cardBg,
                position: 'relative',
              }}>
                {c.badge && (
                  <div style={{ position: 'absolute', top: -12, left: 24, background: accent, color: '#fff', padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{c.badge}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
                  {/* Rank */}
                  <div style={{ fontSize: 36, fontWeight: 900, color: c.highlight ? accent : muted, minWidth: 48, textAlign: 'center', lineHeight: 1 }}>
                    #{c.rank}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 22, fontWeight: 800 }}>{c.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={16} fill={s <= Math.floor(c.rating) ? accent : 'transparent'} color={accent} />
                        ))}
                        <span style={{ fontSize: 14, fontWeight: 700, marginLeft: 4 }}>{c.rating}</span>
                        <span style={{ fontSize: 12, color: muted }}>({c.reviews.toLocaleString()} reviews)</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: green, marginBottom: 6 }}>Pros</div>
                        {c.pros.map((p, i) => (
                          <div key={i} style={{ fontSize: 13, color: fg, display: 'flex', gap: 6, marginBottom: 4 }}>
                            <CheckCircle2 size={14} color={green} style={{ marginTop: 2, flexShrink: 0 }} /> {p}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#ef4444', marginBottom: 6 }}>Cons</div>
                        {c.cons.map((con, i) => (
                          <div key={i} style={{ fontSize: 13, color: muted, display: 'flex', gap: 6, marginBottom: 4 }}>
                            <span style={{ color: '#ef4444', flexShrink: 0 }}>−</span> {con}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* CTA */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 140 }}>
                    <div style={{
                      background: c.highlight ? green : (darkMode ? '#ffffff15' : '#f1f5f9'),
                      color: c.highlight ? '#fff' : fg,
                      padding: '12px 24px',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      textAlign: 'center',
                      width: '100%',
                    }}>
                      {c.highlight ? 'Get Free Quote' : 'Visit Site'}
                    </div>
                    <span style={{ fontSize: 11, color: muted }}>Free · No obligation</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Methodology */}
          <div style={{ padding: '48px 80px', borderTop: `1px solid ${border}`, background: cardBg }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>How We Rank</h2>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.7, maxWidth: 700 }}>
              Our rankings are based on a weighted scoring system: Customer Reviews (35%), Pricing Transparency (25%), Insurance & Protection (20%), Service Coverage (10%), and Technology & Tracking (10%). We update our rankings monthly and accept no payment for placement.
            </p>
          </div>
        </>
      )}

      {page !== 'home' && (
        <div style={{ padding: 80 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 40 }}>{page === 'services' ? 'How We Review' : page === 'reviews' ? 'Reader Reviews' : 'Get Listed'}</h2>
          <p style={{ fontSize: 16, color: muted }}>Content section for {page} page.</p>
        </div>
      )}

      <div style={{ padding: '48px 80px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13, marginTop: 40 }}>
        <span>© {year} MovingReviews.com · Editorial Guidelines · Advertiser Disclosure</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span><span>Contact</span></div>
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
