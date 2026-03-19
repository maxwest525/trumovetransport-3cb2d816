

## Problem Analysis

The zoom/scaling issues stem from three root causes:

1. **Viewport-relative sizing**: `.tru-hero-wrapper` uses `min-height: calc(100vh - 130px)` — when browser zoom changes, `100vh` stays the same in CSS pixels but the actual viewport shrinks, causing content to overflow and get cut off (the "Let's Get Moving" form being clipped).

2. **Parallax transforms**: The right column (form) has `transform: translateY(${formParallax.y}px)` applied via the `useParallax` hook. This shifts the form based on scroll position, which interacts badly with zoom levels since the calculations use raw pixel values.

3. **`vw`-based font sizing**: The headline uses `clamp(40px, 6vw, 72px)` and bullets use `clamp(13px, 1.15vw, 16px)` — these shift with zoom since `vw` units change relative to the zoomed viewport.

## Plan

### 1. Remove viewport-height dependency on hero wrapper
- Change `.tru-hero-wrapper` from `min-height: calc(100vh - 130px)` to `min-height: auto` or a fixed `min-height` in `px`/`rem`
- This prevents the form from being cut off at any zoom level

### 2. Remove parallax on the form column
- Remove the `useParallax` hook usage for the form (`parallaxFormRef`, `formParallax`)
- Remove the inline `transform: translateY(...)` style from the right column div
- Keep the headline parallax if desired, or remove both for full stability

### 3. Replace `vw`-based sizing with fixed responsive values
- Change `font-size: clamp(40px, 6vw, 72px)` on `.tru-hero-headline` to a fixed size like `60px` with media query breakpoints
- Change `font-size: clamp(13px, 1.15vw, 16px)` on `.tru-hero-bullets li` to a fixed `15px`
- Replace any other `vw`-based sizing in the hero/header area

### 4. Ensure header uses fixed dimensions
- Verify `.header-main.header-floating` margins and padding use `px`/`rem` not viewport units (they already appear to be pixel-based, but will audit the mobile overrides)

### Files to modify
- `src/index.css` — hero wrapper min-height, font sizes
- `src/pages/Index.tsx` — remove parallax transform on form column

