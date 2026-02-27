

# Fix: Shared Components Not Responding to Brand Theme

## Problem

The inline `sectionStyles` approach was applied to sections rendered **directly** inside each template function, but large chunks of the page come from **shared components** imported from `TruMoveBrandingElements.tsx`:

- `TrustBadgeStrip` -- hardcoded `bg-slate-50`, `text-blue-600`, `text-slate-700`
- `ThreeStepProcess` -- hardcoded `bg-white`, `text-slate-900`, `text-slate-600`, `bg-blue-500`
- `TripleGuaranteeSection` -- hardcoded `bg-slate-900`, `text-blue-400`
- `VideoTestimonialGrid` -- hardcoded `bg-slate-50`, `text-slate-900`, `text-slate-600`
- `ComparisonTableSection` -- hardcoded `bg-white`, `bg-blue-600`, `text-blue-600`, `bg-blue-50`
- `FAQSection` -- hardcoded `bg-slate-50`, `text-slate-900`, `text-slate-600`
- `FinalCTASection` -- only receives `theme.primary` and `theme.primaryDark` (partial)
- `TruMoveFooter` -- hardcoded `bg-slate-900`

These components accept no branding props, so they remain completely unchanged when a preset is applied. This is why "nothing changes" -- the hero adapts, the few inline sections adapt, but the bulk of the visible page is these shared components.

## Solution

Add a `brandColors` prop to each shared component in `TruMoveBrandingElements.tsx`, and pass `theme` + `sectionStyles` from `AILandingPageGenerator.tsx` at every call site.

## Changes

### 1. Define a shared `BrandColors` interface (TruMoveBrandingElements.tsx)

```text
interface BrandColors {
  primary: string;
  primaryDark: string;
  accent: string;
  background?: string;       // brand bg for light sections
  textPrimary?: string;      // main text color
  textSecondary?: string;    // muted text color
}
```

### 2. Update each shared component to accept and use `brandColors`

For each component, add an optional `brandColors?: BrandColors` prop. When present, use its values as inline `style` overrides on the relevant elements:

- **TrustBadgeStrip**: Section bg, icon color, text color
- **ThreeStepProcess**: Section bg, heading/body text, step circle gradient, connecting line
- **TripleGuaranteeSection**: Icon color uses `brandColors.primary`, card border hover uses `brandColors.primary`
- **VideoTestimonialGrid**: Section bg, heading/body text, play button accent
- **ComparisonTableSection**: Section bg, heading/body text, TruMove column header bg, checkmark color, exclusive badge color
- **FAQSection**: Section bg, heading/body text, card bg and border
- **FinalCTASection**: Already partially themed -- add `brandColors` for text colors
- **TruMoveFooter**: Keep dark (footer stays dark is intentional), but use `brandColors.primary` for link accents

### 3. Pass theme colors at every call site in AILandingPageGenerator.tsx

At each usage of these components across all 6 templates, pass the brand colors:

```text
// Build the prop once
const brandColors = hasBrandTheme ? {
  primary: theme.primary,
  primaryDark: theme.primaryDark,
  accent: theme.accent,
  background: (theme as any).brandBackground,
  textPrimary: (theme as any).brandText,
  textSecondary: (theme as any).brandTextSecondary,
} : undefined;

// Then at each call site:
<TrustBadgeStrip theme="light" brandColors={brandColors} />
<ThreeStepProcess theme="light" brandColors={brandColors} />
<TripleGuaranteeSection brandColors={brandColors} />
<VideoTestimonialGrid brandColors={brandColors} />
<ComparisonTableSection brandColors={brandColors} />
<FAQSection brandColors={brandColors} />
<FinalCTASection theme={theme} brandColors={brandColors} />
<TruMoveFooter brandColors={brandColors} />
```

### 4. Files changed

- **`src/components/demo/ppc/TruMoveBrandingElements.tsx`**: Add `BrandColors` interface, update 8 component signatures and their JSX to use inline styles when `brandColors` is present
- **`src/components/demo/ppc/AILandingPageGenerator.tsx`**: Build `brandColors` object once, pass it at ~30 call sites across 6 templates

### 5. Inner element text colors

Within each shared component, also apply brand text colors to inner elements that currently use hardcoded Tailwind classes like `text-slate-900`, `text-slate-600`, `text-slate-500`. This ensures headings, descriptions, badge text, table cells, and FAQ answers all reflect the brand palette.

