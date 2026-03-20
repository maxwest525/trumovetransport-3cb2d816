

## Contact Section Redesign

### Problem
The "Contact Us" section has excessive whitespace and inconsistent styling compared to the other homepage sections (Shipment Tracking, Scan/Estimate). The "Call Now" CTA uses a different style than the `tru-ai-cta-btn` pattern used elsewhere.

### Plan

**1. Match section structure to other homepage sections**
- Use the same `tru-ai-steps-section` wrapper with consistent padding
- Use `tru-ai-main-headline` and `tru-ai-headline-accent` classes for the heading (same as "Real-Time Shipment Tracking" and "Scan. Add. Estimate.")
- Reduce `mb-10` gap between headline and content to `mb-6`

**2. Restyle "Call Now" CTA to match `tru-ai-cta-btn`**
- Replace the custom rounded-full black button with the `tru-ai-cta-btn` class
- Green Phone icon on left, green ArrowRight on right — same pattern as "Track Shipment" and "Start Scanning"

**3. Make it special — add a subtle differentiator**
- Give the contact card a soft green gradient border glow (using the brand green) to make it feel like a premium, inviting section distinct from the feature sections
- Add a subtle pulsing green dot next to the headline text reading "We're Online" to signal availability and urgency
- Keep the agent photo but add a subtle fade-in animation

**4. Tighten internal spacing**
- Reduce card padding from `p-6` to `p-5`
- Reduce form textarea `min-h` from 120px to 100px
- Tighten gaps between contact option buttons

### Files to edit
- `src/pages/Index.tsx` — section structure, classes, CTA button, spacing, online indicator

