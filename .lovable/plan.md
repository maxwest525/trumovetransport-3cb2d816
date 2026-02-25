

## Align Feature Trust Strip with Hero Trust Strip Style

### What Changes
The feature trust strip (between AI Analysis and Shipment Tracker) will be updated to match the hero trust strip exactly: no dot separators, `space-between` layout, same height and spacing.

### Changes

**`src/components/FeatureTrustStrip.tsx`**
- Remove the dot separator markup entirely (no more `feature-trust-dot` spans)
- Remove `React.Fragment` wrapper (no longer needed)
- Remove `React` import
- Keep 5 items (drop "Nationwide Coverage" since it overlaps with "Live GPS Tracking") to fit cleanly in `space-between`:
  1. AI Room Scanner
  2. Live GPS Tracking
  3. Video Consultations
  4. Carrier Vetting
  5. Verified Estimates

**`src/index.css`**
- `.feature-trust-strip-inner`: Change `justify-content: center` and `gap: 12px` to `justify-content: space-between` with no gap -- matching `.trust-strip-inner` exactly
- Delete the `.feature-trust-dot` CSS block entirely (lines ~32820-32826) since dots are removed

Everything else (background, padding, border, font size/weight, icon color, max-width) already matches the hero trust strip -- no changes needed there.

