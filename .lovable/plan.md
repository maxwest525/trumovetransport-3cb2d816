

## Agent Tool Launcher on Dashboard

**Flow:** `/ (Portal Hub)` → click "Agents" → `/agent/dashboard` → **Tool Launcher Modal auto-opens on first visit**

### What to build

1. **`AgentToolLauncherModal.tsx`** (new component)
   - Dialog with two large cards: **Granot CRM** and **Convoso Dialer**
   - "Skip to Dashboard →" link to dismiss
   - Clicking a tool navigates to `/tools/granot` or `/tools/convoso`
   - Uses sessionStorage flag so it only auto-opens once per session (not every page refresh)

2. **`AgentDashboardContent.tsx`** (update)
   - Import and render the modal, auto-open on mount if no sessionStorage flag set
   - Add a small "My Tools" button somewhere in the dashboard header so agents can re-open the launcher anytime

3. **`IntegrationPlaceholder.tsx`** (update)
   - Remove `AgentShell` wrapper (no sidebar)
   - Replace with a minimal fullscreen layout: slim 40px header with logo, tool name, and "← Back to Dashboard" button
   - Rest of viewport = tool content area (placeholder now, iframe-ready later)

### Files

| File | Action |
|------|--------|
| `src/components/agent/AgentToolLauncherModal.tsx` | Create |
| `src/components/agent/AgentDashboardContent.tsx` | Add modal + trigger |
| `src/pages/IntegrationPlaceholder.tsx` | Minimal fullscreen shell |

