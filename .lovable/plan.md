

# Fix: Brand Extraction Not Visually Changing Non-Hero Sections

## Problem

When you apply a Style Extractor preset (like DashClicks or Relume), only the **hero section** changes colors. The sections below (Trust Badges, 3-Step Process, Testimonials, FAQ, Footer, etc.) remain white/slate because they use hardcoded Tailwind classes (`bg-white`, `bg-slate-50`, `text-slate-900`) that the CSS override approach cannot reliably target.

The current fix attempts to inject a `<style>` block that overrides Tailwind classes like `.brand-themed-template .bg-white { background: ... !important }`. This is fragile because:
- Tailwind class selectors don't always match inside scoped containers
- Many elements use inline `style` which always wins over CSS classes
- Some classes (e.g., `bg-white/95`) have special characters that break CSS selectors

## Solution

Replace the CSS class override approach with **inline style injection** directly into each template section. Each render function (`renderQuoteFunnelPage`, `renderComparisonPage`, etc.) will receive the brand colors and apply them as inline `style` props on section containers and text elements -- the same way the hero already does.

## Changes

### 1. Create a `sectionStyles` helper object (AILandingPageGenerator.tsx)

Build a reusable style object from the theme that each section can spread:

```text
sectionStyles = {
  light:    { background: brandBg, color: brandText },
  alt:      { background: darken(brandBg, 4%), color: brandText },
  dark:     { background: '#0F172A', color: '#fff' },
  textMain: { color: brandText },
  textSub:  { color: brandTextSecondary },
}
```

### 2. Apply inline styles to all 6 template render functions

For each of the 6 templates (Quote Funnel, Comparison, Calculator, Testimonial, Local SEO, Long Form), replace hardcoded Tailwind background/text classes on section wrappers with inline styles:

- `<div className="bg-white">` becomes `<div className="bg-white" style={sectionStyles.light}>`
- `<div className="bg-slate-50">` becomes `<div className="bg-slate-50" style={sectionStyles.alt}>`
- `<h2 className="text-slate-900">` becomes `<h2 className="text-slate-900" style={sectionStyles.textMain}>`
- `<p className="text-slate-600">` becomes `<p className="text-slate-600" style={sectionStyles.textSub}>`

The Tailwind classes stay as fallbacks for when no brand is applied (sectionStyles would be empty `{}`).

### 3. Remove the fragile CSS override block

Delete the `<style>` block inside `renderSelectedTemplate()` that tries to override `.bg-white`, `.text-slate-900` etc. via CSS selectors. The inline styles will handle everything.

### 4. Scope of changes

- **File**: `src/components/demo/ppc/AILandingPageGenerator.tsx`
- **Sections affected per template**: ~8-12 section containers and ~15-20 text elements per template
- **No changes needed to**: `BrandExtractor.tsx`, `ScaledPreview.tsx`, or `WebsitePreviewBuilder.tsx` (Build Manual already works correctly with `themeOverride` passed as props)

### Why this works

This mirrors the pattern already proven in the Build Manual templates (`WebsitePreviewBuilder.tsx`), where `themeOverride` colors are applied via inline styles and work correctly with every preset.

