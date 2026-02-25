

## Fix Horizontal Centering of Dots in Feature Trust Strip

### Problem
The dot separators (`•`) sit right next to each item's text instead of being horizontally centered in the gap between two items. This is because the dots are rendered **inside** each `.feature-trust-item` div, making them part of that item rather than independent elements between items.

### Solution
Move the dots outside of the item containers so they become their own flex children in the strip layout. This way, `space-between` (or the natural flex flow) will position items and dots evenly, with dots sitting centered between neighboring items.

### Changes

**`src/components/FeatureTrustStrip.tsx`** -- Restructure the JSX so the dot is a sibling of the item, not a child:

```text
Before (dot inside item):
  <div class="feature-trust-item">
    <icon /> <span>Text</span> <span class="dot">•</span>
  </div>

After (dot between items):
  <div class="feature-trust-item">
    <icon /> <span>Text</span>
  </div>
  <span class="feature-trust-dot">•</span>
```

**`src/index.css`** -- Remove `margin: 0 8px` from `.feature-trust-dot` since the flex layout will handle spacing naturally. The dot will be a direct child of `.feature-trust-strip-inner` and will be spaced evenly by the flex gap or the available space.

- Optionally switch `.feature-trust-strip-inner` from `justify-content: space-between` to `justify-content: center` with a `gap` value (e.g., `gap: 12px`) for more predictable even spacing of items and dots alike. This matches how evenly-spaced strips with separators typically work.

### Summary
- One component file change (move dot outside item div)
- One CSS tweak (remove dot margin, adjust inner layout to use gap)
- No new files or dependencies
