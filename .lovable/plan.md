

## Comprehensive Mobile Fix -- Round 3

This update addresses the remaining mobile issues across all pages: the initial form being cut off, proportional headers, trust bar pushing content down, maps sizing, the chat widget auto-minimizing after 3 seconds, and general spacing issues.

### Changes Overview

**1. Chat Widget Auto-Minimize on Mobile (3-second timer)**
- File: `src/components/FloatingTruckChat.tsx`
- Add a `useIsMobile()` check and a `useEffect` that auto-sets `isScrollMinimized = true` after 3 seconds on mobile devices
- This means on mobile, the full pill shows briefly then collapses to the slim right-edge strip automatically

**2. Homepage Hero Form Cutoff Fix**
- File: `src/index.css` (mobile media query)
- The `.tru-floating-form-card` has `min-height: 480px` on desktop which causes cutoff on mobile
- Force `min-height: auto !important` and reduce internal padding
- Reduce `.tru-hero.tru-hero-split` padding further and set `min-height: auto`
- Make the hero headline smaller on mobile: `clamp(24px, 6.5vw, 36px)`
- Reduce logo height to `48px` on mobile
- Compact the form inputs: smaller font size, reduced padding, tighter spacing
- Ensure the "Analyze Route" button is always visible without scrolling

**3. Trust Strip Pushing Form Down**
- File: `src/index.css` (mobile media query)
- Reduce `.safer-trust-strip` `margin-top` from `8px` to `4px` and padding to `4px 8px`
- Reduce `.safer-trust-item` font-size to `9px` on mobile
- This recovers ~20px of vertical space

**4. SiteShell Header -- Tighter on Mobile**
- File: `src/index.css` (mobile media query)
- The sticky header `.bg-background` padding reduced to `4px 12px 6px`
- The command center strip (`tracking-header`) also gets tighter padding
- Sticky offset for command center: use `top: 3.5rem` instead of `4.5rem`

**5. Map Panels -- Proper Mobile Sizing**
- File: `src/index.css` (mobile media query)
- `.tru-tracker-satellite-panel`: force `height: 180px` on mobile (not 200px)
- `.tru-tracker-road-map`: force `height: 200px` on mobile (not 240px)
- Both get `border-radius: 12px` and `overflow: hidden`

**6. Proportional Headers -- Responsive Sizing**
- File: `src/index.css` (mobile media query)
- `.tru-ai-main-headline`: `font-size: clamp(22px, 6vw, 32px)` on mobile
- `.tru-ai-section-title`: `font-size: 12px` on mobile
- `.tru-ai-subheadline`: `font-size: 13px` on mobile
- `.tru-qb-question`: `font-size: 14px` on mobile
- All section headings get `word-break: break-word` and controlled max widths

**7. Inventory Builder (Online Estimate) -- Mobile Refinement**
- File: `src/index.css` (mobile media query)
- Room list horizontal scroll already in place -- add scroll snap for better UX
- Inventory grid items get smaller icons and tighter labels

**8. Extra-Small Breakpoint (< 375px)**
- Further reduce hero headline to `22px`
- Trust strip items to `8px` font
- Form inputs get `height: 36px` and `font-size: 13px`

### Technical Details

- All CSS changes are within `@media (max-width: 768px)`, `@media (max-width: 480px)`, and `@media (max-width: 375px)` blocks
- One component change: `FloatingTruckChat.tsx` gets a 3-second auto-minimize timer on mobile
- No other JS/component changes needed
- Desktop layout is completely untouched

### Files to Edit
1. `src/index.css` -- Mobile media query additions/updates
2. `src/components/FloatingTruckChat.tsx` -- Add auto-minimize timer for mobile

