

## Demo Comparison Page

Create a `/demo` route with a simple page that lets you switch between the **old** (pre-overhaul) and **new** (current) agent login experience side by side, plus add a "Demo" link in the footer.

### What you'll get

- **Footer**: A new "Demo" link added to the footer nav, linking to `/demo`
- **`/demo` page**: A clean page with two big buttons:
  - **"Old Version"** -- loads the original agent login (before yesterday's overhaul)
  - **"New Version"** -- loads the current simplified agent login
- Clicking either option renders that version inline on the same page so you can compare without navigating away

### Technical details

1. **Create `src/pages/AgentLoginOld.tsx`**
   - Copy the current `AgentLogin.tsx` as the base, then restore the original pre-overhaul versions of the modals it imports (workspace, operations, coaching, leaderboard). Since we don't have the old code saved, this version will use the **same current modals** but the page itself will be clearly labeled "Old" -- you can then tell me specifically what to change on each one.
   - Actually, a simpler approach: both "Old" and "New" will point to the same `AgentLogin` component for now. The `/demo` page is really a **comparison hub** where you can click through to `/agent-login` (new) or `/agent-login-old` (old), and you tell me what to revert on the old one.

2. **Create `src/pages/Demo.tsx`**
   - Simple page with two cards: "Old Agent Login" links to `/agent-login-old`, "New Agent Login" links to `/agent-login`
   - Clean layout, easy to click

3. **Update `src/components/layout/Footer.tsx`**
   - Add a "Demo" link pointing to `/demo`

4. **Update `src/App.tsx`**
   - Add routes for `/demo` and `/agent-login-old`

Since we don't have the pre-overhaul code saved in version control, the "Old" version will start as a copy of the current agent login. Once you see both side by side, you can tell me exactly what to change on each version -- what you liked from before, what you like now -- and I'll adjust accordingly.

