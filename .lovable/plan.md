

## Plan: Add Toggle Between "Talk to Trudy" Chat and "Send a Message" Form

### What Changes

Replace the current "Send a Message" form (left side of the contact card) with a toggled view that lets users switch between:
1. **Talk to Trudy** — an embedded inline version of the AI chat (AIChatContainer)
2. **Send a Message** — the existing contact form

### How It Works

A two-tab pill toggle sits at the top of the left panel (similar to the chat modal's mode toggle). Clicking each tab swaps the content below.

### Implementation Details

**File: `src/pages/Index.tsx`** (Contact Us section, lines ~1696–1717)

1. Add local state: `const [contactMode, setContactMode] = useState<"trudy" | "form">("trudy");`
2. Replace the current "Send a Message" header area with a pill toggle:
   - Two buttons: `Talk to Trudy` (with Sparkles icon) and `Send a Message` (with MessageSquare icon)
   - Styled like the existing chat modal mode toggle (bg-muted pill with active state bg-background shadow)
3. When `contactMode === "trudy"`: render `<AIChatContainer />` inline with a fixed height (~300px), using the general page context
4. When `contactMode === "form"`: render the existing name/email/textarea/submit form unchanged
5. Import `AIChatContainer` and `Sparkles` at the top of the file

The right-side contact buttons (Call Us, Text Support, Talk to Trudy voice, Video Consult) stay unchanged. The "Talk to Trudy" button on the right side continues to open the voice widget — this new toggle is for the text chat.

