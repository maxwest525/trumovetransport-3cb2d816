

## Goal
Fix the mobile nav header so the desktop horizontal link strip ("Virtual Inventory | Shipment Tracking | FMCSA Carrier Vetting | Meet Trudy | Contact Us") never renders or overflows on mobile/tablet. Replace it with the proper hamburger toggle and mobile menu at every viewport that can't fit the full desktop nav.

## Root cause
- `src/components/layout/Header.tsx` renders `.header-nav` (desktop) and `.header-mobile-toggle` (mobile).
- `src/index.css` only swaps them at `@media (max-width: 700px)`. With 5 nav items plus icons + dividers, the desktop nav legitimately overflows starting around 1000–1100px and is showing on the user's mobile screenshot.
- There's no `min-width: 0` / overflow guard on `.header-inner` or `.header-nav`, so when the nav is shown it pushes the layout wider than the viewport.

## Fix (must-fix)
1. Raise the mobile breakpoint that hides `.header-nav` and shows `.header-mobile-toggle` from `700px` to `1024px` so the hamburger is used on all phones and tablets.
2. Add overflow guards to the header so a too-wide nav never causes horizontal page scroll:
   - `.header-inner { min-width: 0; overflow: hidden; }`
   - `.header-nav { min-width: 0; overflow: hidden; flex-wrap: nowrap; }`
   - `.header-main.header-floating { max-width: 100%; }`
3. Keep the existing 640px and 768px overrides (logo height 40px, smaller margins, hamburger 36px) — they already look right.
4. Verify `.header-mobile-menu` covers full width on small viewports (already handled at the 640px breakpoint).

## Files to edit
- `src/index.css`
  - Update the `@media (max-width: 700px)` block (line ~12172) → change to `@media (max-width: 1024px)`.
  - Add the `min-width: 0` / overflow guards to `.header-inner` and `.header-nav` (lines ~10839 and ~10862).

## Out of scope (not changing)
- Header HTML structure in `Header.tsx` — no JSX changes needed.
- Mobile menu styling — already polished from prior passes.
- Logo size, header height, side margins — keep current values.

## Verification
After the change, at 320px / 375px / 390px / 414px / 449px / 768px / 1024px the user should see only the logo + hamburger. At ≥1025px the full desktop nav returns. No horizontal page scroll at any width.

