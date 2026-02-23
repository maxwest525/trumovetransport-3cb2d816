import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ThumbsUp, Share2, Globe, ExternalLink, Play, Music, Search, ChevronDown, Star } from "lucide-react";

interface AdCopy {
  headlines: string[];
  descriptions: string[];
  cta: string;
}

interface MockupProps {
  copy: AdCopy;
  platformId: string;
}

/* ───────────────────── Facebook Feed Card ───────────────────── */
export function FacebookFeedMockup({ copy }: MockupProps) {
  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', maxWidth: 500, background: '#fff', borderRadius: 8, border: '1px solid #dddfe2', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #1a7f37, #2da44e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>TM</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#050505' }}>TruMove</div>
          <div style={{ fontSize: 12, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 }}>
            Sponsored · <Globe style={{ width: 12, height: 12 }} />
          </div>
        </div>
        <MoreHorizontal style={{ width: 20, height: 20, color: '#65676b' }} />
      </div>
      {/* Text */}
      <div style={{ padding: '0 16px 12px', fontSize: 14, color: '#050505', lineHeight: 1.4 }}>
        {copy.descriptions[0]}
      </div>
      {/* Image area */}
      <div style={{ width: '100%', height: 260, background: 'linear-gradient(135deg, #0a2540 0%, #1a3a5c 50%, #0d9488 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, position: 'relative' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', textAlign: 'center', padding: '0 24px', lineHeight: 1.2 }}>
          {copy.headlines[0]}
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', padding: '0 32px' }}>
          AI-Powered Quotes in 60 Seconds
        </div>
        <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 4, padding: '4px 8px', fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
          Ad
        </div>
      </div>
      {/* Link preview */}
      <div style={{ background: '#f0f2f5', padding: '10px 16px', borderBottom: '1px solid #dddfe2' }}>
        <div style={{ fontSize: 12, color: '#65676b', textTransform: 'uppercase' }}>trumove.com</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#050505', marginTop: 2 }}>{copy.headlines[1] || copy.headlines[0]}</div>
        <div style={{ fontSize: 14, color: '#65676b', marginTop: 2 }}>{copy.descriptions[1] || copy.descriptions[0]?.slice(0, 80) + '...'}</div>
      </div>
      {/* CTA */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <div style={{ display: 'flex' }}>
            <span style={{ fontSize: 14 }}>👍</span>
            <span style={{ fontSize: 14, marginLeft: -2 }}>❤️</span>
          </div>
          <span style={{ fontSize: 13, color: '#65676b' }}>2.4K</span>
        </div>
        <div style={{ fontSize: 13, color: '#65676b' }}>186 comments · 94 shares</div>
      </div>
      {/* Action bar */}
      <div style={{ borderTop: '1px solid #dddfe2', display: 'flex', padding: '4px 16px' }}>
        {[{ icon: ThumbsUp, label: 'Like' }, { icon: MessageCircle, label: 'Comment' }, { icon: Share2, label: 'Share' }].map(a => (
          <button key={a.label} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', fontSize: 13, fontWeight: 600, color: '#65676b', background: 'none', border: 'none', cursor: 'default' }}>
            <a.icon style={{ width: 18, height: 18 }} /> {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────── Google Search Result ───────────────────── */
export function GoogleSearchMockup({ copy }: MockupProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600, background: '#fff', borderRadius: 8, border: '1px solid #dadce0', padding: 20 }}>
      {/* Search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderRadius: 24, border: '1px solid #dfe1e5', marginBottom: 20 }}>
        <Search style={{ width: 16, height: 16, color: '#9aa0a6' }} />
        <span style={{ fontSize: 14, color: '#202124', flex: 1 }}>long distance movers near me</span>
      </div>
      {/* Sponsored label */}
      <div style={{ fontSize: 12, color: '#202124', fontWeight: 400, marginBottom: 4 }}>Sponsored</div>
      {/* Ad result */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a7f37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>TM</span>
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#202124' }}>TruMove — AI-Powered Moving</div>
            <div style={{ fontSize: 12, color: '#4d5156' }}>https://www.trumove.com</div>
          </div>
        </div>
        <a style={{ fontSize: 20, color: '#1a0dab', textDecoration: 'none', fontWeight: 400, lineHeight: 1.3, display: 'block', cursor: 'default' }}>
          {copy.headlines[0]}
        </a>
        <p style={{ fontSize: 14, color: '#4d5156', lineHeight: 1.5, margin: '4px 0 0' }}>
          {copy.descriptions[0]}
        </p>
        {/* Sitelinks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px', marginTop: 12 }}>
          {['Get Free Quote', 'Service Areas', 'Track Your Move', 'About TruMove'].map(link => (
            <a key={link} style={{ fontSize: 14, color: '#1a0dab', textDecoration: 'none', padding: '4px 0', cursor: 'default' }}>{link}</a>
          ))}
        </div>
      </div>
      {/* Second organic-looking result (competitor) */}
      <div style={{ opacity: 0.5, paddingTop: 16, borderTop: '1px solid #ebebeb' }}>
        <div style={{ fontSize: 14, color: '#202124', marginBottom: 2 }}>www.othermovers.com</div>
        <div style={{ fontSize: 18, color: '#1a0dab' }}>Other Moving Company — Request a Quote</div>
        <div style={{ fontSize: 14, color: '#4d5156', marginTop: 4 }}>Get a moving quote from our team. Call today for pricing...</div>
      </div>
    </div>
  );
}

/* ───────────────────── Instagram Feed ───────────────────── */
export function InstagramFeedMockup({ copy }: MockupProps) {
  return (
    <div style={{ fontFamily: '-apple-system, Helvetica, Arial, sans-serif', maxWidth: 400, background: '#fff', borderRadius: 8, border: '1px solid #dbdbdb', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', padding: 2 }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#1a7f37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>TM</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>trumove</span>
          <span style={{ fontSize: 11, color: '#8e8e8e', marginLeft: 6 }}>Sponsored</span>
        </div>
        <MoreHorizontal style={{ width: 16, height: 16, color: '#262626' }} />
      </div>
      {/* Image */}
      <div style={{ width: '100%', aspectRatio: '1/1', background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 40%, #0d9488 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 600 }}>TruMove</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
          {copy.headlines[0]}
        </div>
        <div style={{ padding: '10px 24px', background: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          {copy.cta}
        </div>
      </div>
      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <Heart style={{ width: 22, height: 22, color: '#262626' }} />
          <MessageCircle style={{ width: 22, height: 22, color: '#262626' }} />
          <Send style={{ width: 22, height: 22, color: '#262626' }} />
        </div>
        <Bookmark style={{ width: 22, height: 22, color: '#262626' }} />
      </div>
      {/* Likes & caption */}
      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#262626', marginBottom: 4 }}>1,847 likes</div>
        <div style={{ fontSize: 13, color: '#262626' }}>
          <span style={{ fontWeight: 600 }}>trumove</span>{' '}
          <span>{copy.descriptions[0]?.slice(0, 120)}...</span>
        </div>
        <div style={{ fontSize: 12, color: '#8e8e8e', marginTop: 4 }}>View all 43 comments</div>
      </div>
      {/* CTA button */}
      <div style={{ borderTop: '1px solid #dbdbdb', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0095f6' }}>{copy.cta}</span>
        <ExternalLink style={{ width: 14, height: 14, color: '#0095f6' }} />
      </div>
    </div>
  );
}

/* ───────────────────── TikTok / Reels (vertical video) ───────────────────── */
export function TikTokMockup({ copy }: MockupProps) {
  return (
    <div style={{ fontFamily: '-apple-system, Helvetica, Arial, sans-serif', width: 280, height: 500, background: '#000', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
      {/* Video background */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0a0a0a 0%, #1a2744 40%, #0d9488 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 16 }}>
        {/* Play icon center */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <Play style={{ width: 48, height: 48, color: 'rgba(255,255,255,0.3)', fill: 'rgba(255,255,255,0.15)' }} />
        </div>
        {/* Sponsored tag */}
        <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 4, padding: '3px 8px', fontSize: 10, color: '#fff', fontWeight: 600 }}>
          Sponsored
        </div>
        {/* Right action bar */}
        <div style={{ position: 'absolute', right: 12, bottom: 120, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a7f37', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>TM</span>
          </div>
          {[Heart, MessageCircle, Bookmark, Share2].map((Icon, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Icon style={{ width: 24, height: 24, color: '#fff' }} />
              <span style={{ fontSize: 10, color: '#fff' }}>{['24.3K', '847', '1.2K', '3.4K'][i]}</span>
            </div>
          ))}
        </div>
        {/* Bottom text */}
        <div style={{ marginBottom: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>@trumove</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>· Sponsored</span>
          </div>
          <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.4, marginBottom: 10 }}>
            {copy.headlines[0]} {copy.descriptions[0]?.slice(0, 60)}...
          </div>
          {/* CTA button */}
          <button style={{ width: '100%', padding: '10px 0', background: '#fe2c55', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'default' }}>
            {copy.cta}
          </button>
        </div>
        {/* Music bar */}
        <div style={{ position: 'absolute', bottom: 12, left: 16, right: 60, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Music style={{ width: 12, height: 12, color: '#fff' }} />
          <div style={{ fontSize: 11, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap' }}>Original Sound — TruMove</div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── LinkedIn ───────────────────── */
export function LinkedInMockup({ copy }: MockupProps) {
  return (
    <div style={{ fontFamily: '-apple-system, Helvetica, Arial, sans-serif', maxWidth: 550, background: '#fff', borderRadius: 8, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px' }}>
        <div style={{ width: 48, height: 48, borderRadius: 4, background: '#1a7f37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>TM</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>TruMove</div>
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.3 }}>46,823 followers</div>
          <div style={{ fontSize: 12, color: '#666' }}>Promoted</div>
        </div>
        <MoreHorizontal style={{ width: 20, height: 20, color: '#666' }} />
      </div>
      {/* Post text */}
      <div style={{ padding: '0 16px 12px', fontSize: 14, color: '#000', lineHeight: 1.5 }}>
        {copy.descriptions[0]}
      </div>
      {/* Image */}
      <div style={{ width: '100%', height: 240, background: 'linear-gradient(135deg, #0a2540, #1e3a5f, #1e40af)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>TruMove Enterprise</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
          {copy.headlines[0]}
        </div>
        <div style={{ padding: '8px 20px', background: '#fff', borderRadius: 4, fontSize: 13, fontWeight: 600, color: '#0a66c2' }}>
          {copy.cta}
        </div>
      </div>
      {/* Engagement */}
      <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
        <span>👍 ❤️ 💡 1,284</span>
        <span>52 comments · 28 reposts</span>
      </div>
      {/* Action bar */}
      <div style={{ borderTop: '1px solid #e0e0e0', display: 'flex', padding: '4px 8px' }}>
        {['Like', 'Comment', 'Repost', 'Send'].map(a => (
          <button key={a} style={{ flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 600, color: '#666', background: 'none', border: 'none', cursor: 'default' }}>
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────── Google Display Banner ───────────────────── */
export function GoogleDisplayMockup({ copy }: MockupProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600, height: 250, background: 'linear-gradient(135deg, #0a2540, #0d4f6e)', borderRadius: 8, overflow: 'hidden', position: 'relative', display: 'flex' }}>
      {/* Left content */}
      <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>TruMove</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
          {copy.headlines[0]}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
          {copy.descriptions[0]?.slice(0, 90)}...
        </div>
        <button style={{ alignSelf: 'flex-start', padding: '8px 20px', background: '#0d9488', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'default' }}>
          {copy.cta}
        </button>
      </div>
      {/* Right decorative */}
      <div style={{ width: 200, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', opacity: 0.3 }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 36 }}>🚛</div>
        </div>
      </div>
      {/* Ad label */}
      <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 3, padding: '2px 6px', fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
        Ad
      </div>
      {/* AdChoices */}
      <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
        AdChoices ▸
      </div>
    </div>
  );
}

/* ───────────────────── Picker: resolve platform to mockup ───────────────────── */
export function PlatformAdPreview({ platformId, copy }: MockupProps) {
  const p = platformId;

  if (p === 'fb-feed') return <FacebookFeedMockup copy={copy} platformId={p} />;
  if (p === 'ig-feed' || p === 'ig-stories') return <InstagramFeedMockup copy={copy} platformId={p} />;
  if (p === 'fb-reels' || p === 'ig-reels' || p === 'tiktok' || p === 'yt-shorts') return <TikTokMockup copy={copy} platformId={p} />;
  if (p === 'google-search') return <GoogleSearchMockup copy={copy} platformId={p} />;
  if (p === 'google-display' || p === 'google-pmax') return <GoogleDisplayMockup copy={copy} platformId={p} />;
  if (p === 'linkedin') return <LinkedInMockup copy={copy} platformId={p} />;
  if (p === 'microsoft') return <GoogleSearchMockup copy={copy} platformId={p} />;

  // Fallback: display banner
  return <GoogleDisplayMockup copy={copy} platformId={p} />;
}
