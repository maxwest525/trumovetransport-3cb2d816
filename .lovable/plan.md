

## Fix White Gap Above Hero Behind Navbar

**Problem**: The SiteShell wraps the header in a sticky `div` with `bg-background` (white in light mode). The hero content starts below this, creating a visible white band behind the transparent-ish navbar.

**Solution**: Pull the hero wrapper up behind the navbar using a negative top margin, so the hero background image extends under the header area.

### Changes

**1. `src/index.css`** — Add negative top margin to `.tru-hero-wrapper`
- Add `margin-top: -80px` to pull the hero up behind the sticky header
- Add corresponding extra `padding-top` to `.tru-hero.tru-hero-split` (increase from `96px` to ~`176px`) so the actual content doesn't get hidden behind the nav

**2. `src/components/layout/SiteShell.tsx`** — Make the header background transparent on the homepage
- The header wrapper `div` has a `dark` class forcing a dark background with padding. The `pt-2` and `pb-[25px]` create the visible band. Either:
  - Make the wrapper background transparent (so the hero shows through), OR
  - Simply let the negative margin on the hero overlap it

The cleanest approach: keep SiteShell as-is and just use the negative margin + padding compensation on the hero, since the header is already `sticky` and will float over the pulled-up hero.

### Files Modified
- `src/index.css` — negative margin on `.tru-hero-wrapper`, padding compensation on `.tru-hero.tru-hero-split`

