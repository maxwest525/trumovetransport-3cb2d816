

## Make the Feature Trust Strip Match the Hero Trust Strip (with centered dots)

### Changes to `src/index.css`

**`.feature-trust-strip` container:**
- Change padding from `4px 24px` to `8px 24px`
- Remove the top border (keep only bottom border)
- Remove `margin: 2rem 0`

**`.feature-trust-dot` separator:**
- Add `font-size: 8px` (matching the hero strip dot at 8px instead of inheriting 12px)
- Add `line-height: 1`
- Add `display: inline-flex`
- Add `align-items: center` -- this is what vertically centers the dots between items

These properties match exactly what the hero trust strip uses for `.trust-strip-dot`.

### No component changes needed
The dot markup in `FeatureTrustStrip.tsx` already renders correctly -- this is purely a CSS fix.

