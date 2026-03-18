

## Hero Section Redesign

### What Changes

**Left Column** — Replace the current single feature line with a bullet-point value proposition list, and add a CTA line pointing to the form:

1. Logo (keep, move up by reducing top padding)
2. "The Smarter Way To Move" headline (keep)
3. New sub-bullets (each as its own line with a small icon):
   - Scan, document, and build your own inventory — your items stay private and secure
   - Meet your broker virtually, face to face, from anywhere
   - Track your most valuable belongings every step of the way
   - See the full history and performance record of your movers
4. "Fill out the form on the right to get started." (arrow pointing right)

**Right Column (Form)** — Replace the current multi-step quote builder's Step 1 with a single flat contact form:
- Row 1: First & Last Name (text) + Phone (tel) — side by side
- Row 2: Email (full width)
- Row 3: From + To location fields (keep existing LocationAutocomplete, side by side)
- CTA button: "Talk to Support"

Remove the "Let's Get Moving" / "FMCSA-vetted carriers" header text, the date picker, and the "Analyze Route" button from step 1. The multi-step flow (steps 2, 3, confirmation) stays intact but the initial step becomes this simpler contact-first form.

### Files to Edit

1. **`src/pages/Index.tsx`** (lines ~1328-1487)
   - Left column: replace `tru-hero-feature-line` paragraph with a `<ul>` of 4 bullet items + a CTA prompt line
   - Right column Step 1: restructure to show name+phone row, email row, from+to row, and "Talk to Support" button
   - Remove date picker and "Analyze Route" from step 1

2. **`src/index.css`**
   - Add styles for the new bullet list (`.tru-hero-bullets`) — white text, slight text-shadow, spacing
   - Reduce `.tru-hero-left-column` top padding to push logo higher
   - Style the new form layout (two-column name+phone row)

