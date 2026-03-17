

## Replace Demo TrudyChatBox with Live ElevenLabs AI

The current `TrudyChatBox` uses hardcoded pattern-matching for responses. We'll replace it with real ElevenLabs Conversational AI using the existing infrastructure (edge function, API keys, and `@elevenlabs/react` SDK) — the same setup the floating Trudy widget already uses.

### Changes

**`src/components/TrudyChatBox.tsx`**
- Remove the `simulateResponse` pattern-matching logic
- Add the `useConversation` hook from `@elevenlabs/react` in text-only mode
- On mount, fetch a signed URL from the existing `elevenlabs-conversation-token` edge function and start a session
- Route `handleSend` through `conversation.sendUserMessage()` instead of pattern matching
- Handle `onMessage` callbacks to display real AI responses
- Keep the existing visual design (glassmorphism, avatars, quick prompts, typing indicator) — only the response engine changes
- Remove the "Demo" badge since it's now live
- Show a connecting state while the WebSocket session initializes
- Add error handling with a retry button if connection fails

**No new edge functions or secrets needed** — reuses the existing `elevenlabs-conversation-token` function and `ELEVENLABS_API_KEY` / `ELEVENLABS_AGENT_ID` secrets.

