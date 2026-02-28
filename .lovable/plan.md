

# Fix ElevenLabs Edge Function Errors

## Problem
Two issues are causing the "Talk to Real Trudy" live mode to fail:

1. **Permission Error (401)**: The ElevenLabs API key lacks the `convai_write` permission. You need to regenerate or update your API key in the ElevenLabs dashboard with conversational AI permissions enabled.

2. **Response Mismatch**: The edge function calls the `/v1/convai/conversation/token` endpoint and returns `{ token }`, but `AIChatContainer` expects `{ signed_url }` and starts a WebSocket session with `signedUrl`. Since the chat uses `textOnly: true` mode, the signed-url endpoint is the correct one to use.

## Steps

### Step 1: Update the ElevenLabs API Key (User Action Required)
Go to your ElevenLabs account settings, generate a new API key that includes the `convai_write` permission (or enable it on the existing key), then update the secret in the project.

### Step 2: Fix the Edge Function Endpoint
Modify `supabase/functions/elevenlabs-conversation-token/index.ts` to:
- Call `/v1/convai/conversation/get-signed-url` instead of `/v1/convai/conversation/token`
- Return `{ signed_url }` in the response to match what `AIChatContainer` expects

### Technical Details

The edge function change is minimal -- swap the API endpoint URL and the response field name:

```text
// Before:
GET /v1/convai/conversation/token?agent_id=...
return { token: data.token }

// After:
GET /v1/convai/conversation/get-signed-url?agent_id=...
return { signed_url: data.signed_url }
```

This aligns the edge function with the client-side code that already does:
```text
await conversation.startSession({ signedUrl: data.signed_url })
```

