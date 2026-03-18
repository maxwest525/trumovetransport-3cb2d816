

# Enhance Contact Us Section

## What Changes

Replace the current minimal Contact Us section with a polished 3-option layout that gives users clear paths to get help:

1. **Talk to Trudy** — A card that triggers the existing Trudy voice widget (not a chatbot). Clicking it programmatically starts the ElevenLabs conversation already available via the floating widget.

2. **Call Us** — A card with phone number, business hours, and a tap-to-call button.

3. **Send a Message** — A card with the contact form (name, email, message, submit).

## Layout

Three cards in a responsive grid (`grid-cols-1 md:grid-cols-3`), each with an icon, title, short description, and CTA. Clean, consistent styling matching the site's dark/minimal aesthetic.

## Technical Details

**File: `src/pages/Index.tsx`** (lines 1700-1708)
- Replace the current `<ContactHumanTabs />` wrapper with a new inline section containing the 3-card grid.
- The "Talk to Trudy" card dispatches a custom event (`trudy-start`) that the `ElevenLabsTrudyWidget` listens for.

**File: `src/components/ElevenLabsTrudyWidget.tsx`**
- Add a `useEffect` listener for a `trudy-start` custom event on `window` that calls `startConversation()`.

**File: `src/components/ContactHumanTabs.tsx`**
- Can be removed or kept — the new section replaces it on the homepage.

## Visual Design
- Section heading: "Get in Touch" with a subtle subtitle
- Cards: rounded-2xl, border, subtle hover lift effect
- Icons: `Mic` for Trudy, `Phone` for Call, `MessageSquare` for Form
- Consistent with the site's existing design philosophy (minimal, text-centric)

