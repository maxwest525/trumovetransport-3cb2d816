## Goal

Make the scan-room library panel render in a clean, predictable top-to-bottom order with no `order-*` overrides:

1. Header strip (Library label + counter + multi-select controls)
2. Folders / photo grid (or empty-state uploader)
3. Analyze (Start Scanning) button

## Root cause

The library panel (`.tru-scan-library-panel`) is a flex column. The grid wrapper currently has `order-first`, which is the leftover hack that pushed the photo grid above the header. The header itself was previously stuck to the bottom via `order-last` + `border-t`. Both should be removed, and the header should rely on natural document order with a clean bottom border.

## Changes

### 1. `src/pages/ScanRoom.tsx`

**Library panel children (around lines 2207, 2396):**

- Header wrapper (line 2207): keep current natural-order classes, drop the `mb-3` margin since the panel already provides a `0.5rem` flex `gap`. Result:
  ```tsx
  <div className="tru-scan-library-header">
  ```
  (Remove `mb-3 pb-2 border-b` - the base `.tru-scan-library-header` CSS rule already supplies `padding-bottom` + `border-bottom`.)

- Grid wrapper (line 2396): remove `order-first`. Result:
  ```tsx
  <div className="tru-scan-library-grid tru-scan-library-grid-compact">
  ```

No other elements use `order-*` inside the panel.

### 2. `src/index.css`

No structural changes needed - the existing `.tru-scan-library-panel` flex column + per-section padding/border rules already produce the correct visual stack once the `order-first` hack is removed.

(Optional cleanup: the inline `[border-bottom:0] border-t pt-2` styles were added during the bottom-pinned phase and have already been replaced by my prior edit, so nothing further is required in CSS.)

## Resulting DOM order (desktop and mobile)

```text
.tru-scan-library-panel  (flex column, gap 0.5rem)
  .tru-scan-library-header     <- title, counter, multi-select tools
  .tru-scan-library-grid       <- folders + photo grid OR empty-state uploader
  .tru-scan-library-analyze-btn <- "Start Scanning"
```

Mobile breakpoint already collapses the outer scan-room split to a single column (`grid-cols-1`); the panel itself is unchanged across breakpoints, so the same order applies.

## Verification

After the edit, on `/scan-room`:

- Desktop (>=1024px): right-side panel shows Header -> Folders/Empty uploader -> Start Scanning button.
- Mobile (<1024px): panel stacks below the scanner with the same internal order.
- No `order-*` classes remain inside `.tru-scan-library-panel` (grep confirms).

## Technical notes

- The base `.tru-scan-library-header` rule already provides `padding-bottom: 0.5rem` and `border-bottom: 1px solid hsl(var(--border))`, so we don't need Tailwind utilities to recreate them.
- The panel's `gap: 0.75rem` (or `0.5rem` in compact mode) handles vertical spacing - extra `mb-*` utilities would double the gap.
