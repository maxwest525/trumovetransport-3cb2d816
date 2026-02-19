
# Fix Green Tint on Homepage Hero Form Card Border

## Problem
The hero form card on the homepage shows a subtle green tint/glow around its border edges. This is caused by the combination of:

1. Semi-transparent background (`background: hsl(var(--background) / 0.98)`) at line 31005
2. `backdrop-filter: blur(16px)` which blurs the content behind the card, including green elements like the "Move" text and truck logo
3. The 2% transparency allows green light to bleed through at the rounded corners where anti-aliasing occurs

## Fix

### 1. Make the form card background fully opaque on the hero section
Change `hsl(var(--background) / 0.98)` to `hsl(var(--background))` (fully opaque) at line 31005, and remove the backdrop-filter since it serves no purpose with an opaque background.

**File:** `src/index.css` (lines 31001-31006)

Before:
```css
.tru-hero-form-panel .tru-floating-form-card {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: hsl(var(--background) / 0.98);
}
```

After:
```css
.tru-hero-form-panel .tru-floating-form-card {
  background: hsl(var(--background));
}
```

### 2. Neutralize remaining green in tailwind.config.ts
The `attention-pulse` animation still references `hsl(var(--primary))` (green). Replace with neutral `--tm-ink` tones.

**File:** `tailwind.config.ts` (lines 93-101)

Before:
```css
boxShadow: "0 8px 32px -4px hsl(var(--primary)/0.4), ..."
```

After:
```css
boxShadow: "0 8px 32px -4px hsl(var(--tm-ink)/0.4), ..."
```

### 3. Clean up remaining green references near the form
- Line 31533: `.dark .tru-why-card-glow` uses `hsl(var(--primary) / 0.2)` -- neutralize to `--tm-ink`

## Scope
- 3 targeted fixes in 2 files
- No visual regressions expected -- the glassmorphism effect was barely visible at 2% transparency anyway
