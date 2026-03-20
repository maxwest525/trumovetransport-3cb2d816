

## Plan: Restyle Shipment Tracking Page to Match Auto Transport

### What Changes
Bring the LiveTracking page in line with the Auto Transport page's premium design language: scroll-fade-in animations, decorative background elements (gradient blurs, dot patterns, divider lines), consistent section headers with uppercase tracking labels, and clean spacing.

### Files to Modify

1. **`src/pages/LiveTracking.tsx`**
   - Wrap in `SiteShell hideTrustStrip` (already done)
   - Replace the `tru-page-hero-section` with an Auto Transport-style hero: uppercase tracking label ("Shipment Tracking"), decorative dot-divider, large bold heading, subtitle
   - Add decorative background elements (radial gradient blurs, dot pattern, gradient border lines) behind the hero and wizard sections
   - Wrap major sections (hero, wizard, map+dashboard, controls) in `ScrollFadeIn` components
   - Use `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` container pattern instead of raw padding
   - Add a bottom CTA section matching Auto Transport's final CTA style ("Need help tracking?" → contact support)
   - Remove the raw `live-tracking-page` wrapper div's inline dark background in favor of the standard `bg-background`

2. **`src/index.css`** (minimal)
   - Keep existing tracking-specific layout classes (map area, dashboard grid, controls) — only override the hero/page-level styling to use Tailwind classes inline instead

### Design Elements to Port
- **Section header pattern**: `text-[11px] uppercase tracking-[0.3em] text-primary font-semibold` label → decorative divider dots → large heading → muted subtitle
- **Background decorations**: `bg-primary/[0.06] blur-[120px]` gradient circles, `radial-gradient` dot pattern at `opacity-[0.035]`, top/bottom gradient `h-px` borders
- **ScrollFadeIn** on hero, wizard, and dashboard sections
- **Consistent spacing**: `py-10 md:py-20` sections with `max-w-7xl` containers

### What Stays the Same
- All tracking functionality (map, controls, dashboard cards, weather/routes/weigh dropdowns)
- The 2-column map+dashboard layout and its CSS
- TrackingWizard component internals
- All map view toggles and controls

