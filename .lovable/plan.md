

# Add "Talk to Real Trudy" Toggle to the Mock Chatbot

## Overview
Keep the mock `TrudyChatBox` as the default demo experience. Add a prominent "Talk to Real Trudy" button in the chat header that, when clicked, switches to the real ElevenLabs-powered `AIChatContainer` within the same glassmorphism container.

## Changes

### 1. Modify `src/components/TrudyChatBox.tsx`
- Add a new prop: `onSwitchToLive?: () => void`
- Add a "Talk to Real Trudy" button in the header (next to the "AI-Powered" badge) that calls `onSwitchToLive` when clicked
- Style it as a small pill button with a `Sparkles` icon and a subtle pulsing dot to indicate live availability

### 2. Modify `src/pages/CustomerService.tsx`
- Add a `chatMode` state: `'demo' | 'live'` (default `'demo'`)
- Wrap both `TrudyChatBox` and `AIChatContainer` in the same glassmorphism container div
- When `chatMode === 'demo'`: render `TrudyChatBox` with `onSwitchToLive` toggling to `'live'`
- When `chatMode === 'live'`: render `AIChatContainer` inside the same styled wrapper, passing the existing `TRUDY_AGENT_ID` and a customer-service page context
- Add a small "Back to Demo" link in live mode header so users can return to the mock

### Technical Details

**TrudyChatBox header addition:**
```text
[Sparkles icon] Trudy          [Talk to Real Trudy ->] [AI-Powered]
```

The "Talk to Real Trudy" button uses a green pulsing dot + text to signal live AI, styled as:
- `text-[10px] font-semibold` with a subtle border and hover effect
- Only rendered when `onSwitchToLive` prop is provided

**CustomerService.tsx state logic:**
```text
chatMode = 'demo'  -->  Show TrudyChatBox (mock)
chatMode = 'live'  -->  Show AIChatContainer (ElevenLabs WebSocket)
```

The `AIChatContainer` will only mount (and connect to ElevenLabs) when the user explicitly clicks "Talk to Real Trudy", saving API costs until needed.

