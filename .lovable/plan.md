

## Mobile CSS Spacing and Overlap Fixes

### Issues Identified

1. **Logo clipped at top-left** -- `.header-logo` has `margin-left: -100px`, pushing the logo off-screen on mobile.
2. **Command Center strip overlaps hero content** -- Pages use `sticky top-[6.375rem]` or `sticky top-[102px]` for the dark tracking-header, but the mobile header is shorter (~4.5rem), causing misalignment.
3. **Trudy chat widget overlaps page content** -- The floating "Chat with Trudy" bubble sits over text and CTAs on mobile.
4. **Horizontal overflow on some sections** -- Text and cards bleed past viewport edge (visible on /book page).
5. **Footer scrollbar/ticker strip cuts off** -- The trust ticker at the bottom is too wide.

### Plan

All changes will be **mobile-only** using `@media (max-width: 768px)` or `@media (max-width: 1000px)` so desktop is completely unaffected.

**File: `src/index.css` (mobile section at bottom, ~line 33870+)**

1. Fix logo clipping: Reset `.header-logo { margin-left: 0 }` inside the existing `max-width: 1000px` breakpoint (where mobile hamburger triggers).
2. Fix Command Center sticky offset: Add `.sticky.top-\[6\.375rem\], .sticky.top-\[102px\]` targeting to use `top: 4.5rem` on mobile, matching the reduced header height.
3. Fix Trudy chat widget overlap: Scale down and reposition the floating chat bubble on mobile (smaller size, tighter to corner).
4. Fix horizontal overflow: Add `overflow-x: hidden` to the body/root on mobile to prevent bleed.
5. Fix footer ticker: Constrain ticker strip width to viewport on mobile.

**File: `src/components/layout/SiteShell.tsx`**

6. Clean up the duplicate Tailwind classes (the current code has `pb-[25px] md:pb-[25px] pb-[12px]` which is redundant -- Tailwind uses the last value). Fix to proper mobile-first: `pb-3 md:pb-[25px]`.

### Technical Details

All fixes use CSS media queries scoped to mobile breakpoints only. No JavaScript changes except the minor SiteShell Tailwind class cleanup. Desktop layout remains completely untouched.

