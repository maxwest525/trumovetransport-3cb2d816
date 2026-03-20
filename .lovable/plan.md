

## Simplify Carrier Vetting Section on Homepage

**Current state**: The carrier vetting section (lines 1685-1815) has a two-column layout with a full mock SAFER database UI on the right — showing a search bar with Name/DOT/MC toggles, multiple carrier result rows with inline OOS metrics, crash data, authority/safety/insured chips, and pass/caution/fail verdicts. It's dense and visually heavy.

**Proposed simplification**: Replace the detailed mock database UI with a minimal, clean preview that communicates the value without overwhelming the visitor.

### What changes

**File: `src/pages/Index.tsx` (lines ~1685-1815)**

Replace the entire carrier vetting section with a simpler layout:

1. **Keep**: Left column with headline ("Carrier Vetting."), subheadline, and CTA button — no changes needed.

2. **Replace right column** (the full SAFER mock UI) with a single clean preview card:
   - Window chrome bar (dots + "FMCSA Carrier Lookup" label)
   - A static preview image (`previewCarrierVetting` — already imported) with a subtle overlay
   - 3 small floating badges on the image: "FMCSA Verified", "Insurance Active", "Safety Scored"
   - No interactive elements, no carrier rows, no OOS metrics, no chips

3. **Remove**: The `carrierIdx` / `setCarrierIdx` state and `MOCK_CARRIERS` usage from this section (check if used elsewhere on the page first).

This cuts the section from ~130 lines of dense carrier data to ~30 lines of a clean visual preview, making the homepage feel lighter while still conveying the feature.

