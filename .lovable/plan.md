

# Build a Premium Dark-Theme Landing Page Style Preview

## What We're Building
A single polished landing page design that displays after clicking "Generate Landing Page" from Build Manual. This page will match the dark, modern aesthetic from your Slide UI / Designers System references -- sleek dark backgrounds, gradient accents, bold typography, trust badges, and feature sections. It will be display-only (non-functional) but visually complete.

## Design Style (Based on Your Samples)
- **Background**: Dark slate/navy (slate-900 to slate-950)
- **Accents**: Teal/cyan gradient glows, subtle blue highlights
- **Typography**: Large bold white headlines, muted gray subtext
- **Layout sections**: Hero with split layout (text left, visual right), logo/trust strip, feature grid with icons, stats counter bar, testimonials, and a final CTA
- **Feel**: Premium SaaS / modern dark mode

## Technical Plan

### 1. Create `DarkPremiumLandingPreview.tsx`
A new component in `src/components/demo/ppc/` that renders a full landing page mockup with these sections:
- **Hero**: Large headline (injected from Build Manual selections like location/keywords), subheadline, ZIP code input + CTA button, star rating + social proof avatars
- **Trust Strip**: Logo bar (Airbnb, Google, FedEx style text logos)
- **Features Grid**: 4 icon cards (Search and copy, Design and build, etc. adapted for moving services)
- **Stats Bar**: 4 counters (50,000+ Moves, 4.9 Rating, etc.)
- **Testimonials**: Card grid with quotes and avatars
- **Final CTA**: "Ready to move?" section with button
- **Footer**: Simple dark footer

All content will be dynamically populated from the `BuildSelections` data (selected keywords, locations, audiences) passed from Build Manual.

### 2. Wire It Into the Generation Flow
- In `MarketingDashboard.tsx`, when `outputType === 'landing'` and generation triggers, render `DarkPremiumLandingPreview` instead of (or alongside) the existing `AILandingPageGenerator`
- Pass the `BuildSelections` data so headlines reference selected cities, keywords, and audience segments

### 3. Scope (One Card Only)
- This is ONE style template. After you review it, we can add more style options (light theme, coral/red theme, etc.) as selectable cards in the Build Manual output type section.

