

## Fix: Remove Grey Gap Between Hero and Next Section

**Problem**: There's a visible grey box/gap between the bottom of the hero section and the next content section. This is caused by the `tru-page-frame` and `tru-page-inner` wrapper divs having no background styling, allowing the page's default `bg-background` to show through.

**Root cause**: In `src/pages/Index.tsx` (lines 1073-1074), the hero and all content are wrapped in `<div className="tru-page-frame"><div className="tru-page-inner">`, but these classes have zero CSS definitions - no background, no padding adjustments. The hero wrapper ends at line 1364, then there's a section starting at line 1367 with `py-10 md:py-20` padding, creating a visible gap where the light page background bleeds through.

**Fix approach**:
1. In `src/index.css`, ensure `tru-page-frame` has no unintended spacing, or remove the wrapper divs entirely from `Index.tsx` if they serve no purpose
2. Alternatively, ensure the hero's dark background extends fully to meet the next section by either:
   - Removing excess bottom padding from the hero wrapper
   - Adding a matching dark-to-light gradient transition
   - Setting the `tru-page-inner` background to match

**Recommended**: The simplest fix is to add `overflow-hidden` and ensure there's no margin/padding gap between the hero wrapper bottom and the next section. Will inspect more precisely if the gap comes from the hero's `padding-bottom: 130px` in `.tru-hero.tru-hero-split` vs the hero wrapper height, or from the wrapper divs themselves.

**Files to modify**:
- `src/index.css` - Add styles for `tru-page-frame` / adjust hero wrapper bottom
- Possibly `src/pages/Index.tsx` - Remove unnecessary wrapper divs if they cause the gap

