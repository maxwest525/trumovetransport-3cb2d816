

## Remove the Green Truck Icon from Feature Carousel

The "Trudy AI Assistant" card in the `FeatureCarousel` component uses a `TruckChatIcon` — a large green `Truck` icon from Lucide with chat bubbles. This is the "stupid green little truck" you're seeing.

### Plan

**File: `src/components/FeatureCarousel.tsx`**

1. **Replace `TruckChatIcon`** with a cleaner design using Trudy's actual avatar image (`trudy-avatar.png`) paired with a `Sparkles` icon — matching the rest of the widget's branding instead of using a generic truck icon.

2. **Remove the `Truck` and `MessageCircle` imports** since they'll no longer be needed in this component.

3. The new card visual will show Trudy's avatar in a styled container with a subtle sparkle accent — consistent with the floating "Talk to Trudy" widget design.

### Technical Detail

- Replace the `TruckChatIcon` functional component with a `TrudyAvatarIcon` that renders `trudyAvatar` image (already imported in `ElevenLabsTrudyWidget`) in a centered, rounded container with a `Sparkles` badge overlay.
- Keep the card's `action: "openChat"` behavior unchanged.

