

## Problem

When the logo asset (`src/assets/logo.png`) was modified to have white "MOVE" lettering on a transparent background, it broke the logo everywhere else in the app. There are two categories of breakage:

1. **Command strips and dark backgrounds** — Pages like the home page Command Center, Carrier Vetting, Online Estimate, Scan Room, Live Tracking, and the Contact Hub all apply `brightness-0 invert` to make the logo all-white. But since "MOVE" is already white in the new asset, the invert filter turns it black (invisible on dark backgrounds), while the green truck icon becomes white. The result is a garbled, unrecognizable logo.

2. **Sidebar and light backgrounds** — Admin, Manager, Marketing, Agent, and Customer Portal shells display the logo without any filter. The white "MOVE" text is now invisible against light/card backgrounds.

## Plan

**Revert the logo asset to its original version** (green truck + black "MOVE" text on transparent background). This immediately fixes all ~27 files that reference `logo.png`.

Then, **target the white underglow specifically in the main site header** using CSS rather than modifying the shared asset. The header already wraps the logo in a `.header-logo` class inside a `.dark` container, so we can apply a stronger white text-shadow/glow effect purely through CSS — keeping the original logo intact for every other usage.

### Steps

1. **Restore `src/assets/logo.png`** — Revert to the original asset with the green truck icon and black "MOVE" text on a transparent background.

2. **Update Header CSS in `src/index.css`** — Add a rule for `.dark .header-logo img` that applies a strong white drop-shadow filter (the current 2-layer approach from Header.tsx, potentially intensified) so the dark lettering glows white against the black navbar.

3. **Remove inline filter style from `Header.tsx`** — Move the drop-shadow filter from the inline `style` prop to the CSS file for cleaner separation and easier tuning.

No other files need changes — all existing `brightness-0 invert` usages and plain logo usages will work correctly again with the original asset.

