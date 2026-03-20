

## Plan: Port TruMove Auto Transport Content

### Overview
Replace the current simple AutoTransport page with the full TruMove page from the other project. This includes a multi-step quote wizard, quote reveal with pricing, "How It Works" section, and a chat bubble -- all using the same premium design system.

### Files to Create
1. **`src/components/auto-transport/HowItWorks.tsx`** -- 5-step animated process section (Enter vehicle, Confirm route, See pricing, Reserve, Track)
2. **`src/components/auto-transport/QuoteWizard.tsx`** -- 2-step wizard with vehicle selection (year/make/model), transport type, condition report, route planning with map visualization
3. **`src/components/auto-transport/QuoteReveal.tsx`** -- Quote display with move summary, exclusive deals overlay, callback request form, trust perks
4. **`src/components/auto-transport/ChatBubble.tsx`** -- Floating chat widget with Trudy bot for auto transport questions
5. **`src/assets/us-map.png`** -- Copy the US map asset from the source project

### Files to Modify
1. **`src/pages/AutoTransport.tsx`** -- Replace current simple page with the TruMove page structure (HowItWorks + QuoteWizard + QuoteReveal + ChatBubble + sticky mobile CTA)
2. **`src/hooks/useScrollAnimation.ts`** (new) -- ScrollFadeIn component and useScrollAnimation hook for scroll-triggered animations
3. **`src/index.css`** -- Add `section-container` utility class (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`)

### Adaptations
- Wrap content in the existing `SiteShell` instead of the source project's `Navbar`
- Remove the 3D model-viewer panel (requires `.glb` assets not available) -- keep form-only layout
- Keep the existing project's button `premium` variant (already present)
- Use existing footer from SiteShell rather than the inline footer from source

### Technical Notes
- All components use `framer-motion` (already installed)
- `date-fns` already available for date formatting
- The quote wizard uses hardcoded city-to-city distances and pricing -- no API calls needed
- The ChatBubble is a self-contained keyword-matching bot, separate from the existing Trudy/ElevenLabs widget

