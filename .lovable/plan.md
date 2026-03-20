

## Plan: Add Estimate Mode Toggle (Manual vs. AI Scan)

### What
Add a prominent toggle at the top of the Online Estimate page that lets the user choose between two modes:
1. **Manual Builder** — the current inventory builder flow
2. **AI Room Scan** — navigates to the `/site/scan-room` page

This replaces the buried "Scan Your Room" button inside the InventoryBuilder with a top-level, visually prominent mode selector.

### Changes

**1. `src/pages/OnlineEstimate.tsx`**
- Add a mode toggle strip above the main grid (below the page header area, around line 338)
- Two-option toggle using styled buttons (not the radix ToggleGroup — simpler custom buttons matching the TruMove design)
- Options: "Build Manually" (with Package icon) and "AI Room Scan" (with Scan icon)
- Default selection: "Build Manually"
- Clicking "AI Room Scan" navigates to `/site/scan-room`
- Style: pill-shaped toggle group with the active option using the primary green accent, inactive option muted — similar to the existing TruMove design language

**2. `src/components/estimate/InventoryBuilder.tsx`**
- Remove or visually de-emphasize the existing "Scan Your Room" preview card (lines 534-562), since the toggle at the top now handles this. Keeping it as a smaller secondary link is optional.

### Visual Design
```text
┌─────────────────────────────────────────────┐
│  [ 📦 Build Manually ]  [ 📷 AI Room Scan ] │
│       ↑ active/green        muted/outline    │
└─────────────────────────────────────────────┘
```
- Centered above the grid
- Clear iconography and labels
- Active state uses primary color fill, inactive uses outline/ghost style

