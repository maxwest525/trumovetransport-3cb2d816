

## Plan: Fullscreen Mock Tool Panels (Granot + Convoso)

### What changes

Instead of opening real browser windows, "Launch All" will transition the current view into a **fullscreen dual-panel workspace** showing mock versions of Granot CRM and Convoso Dialer side-by-side, filling the entire screen.

### Implementation

1. **New component: `AgentToolWorkspace.tsx`**
   - A fullscreen overlay (`fixed inset-0 z-50`) with two panels split 50/50 horizontally
   - **Left panel**: Mock Granot CRM — dark sidebar with nav items (Contacts, Deals, Pipeline, Tasks), a top bar with search, and a placeholder data table with mock rows
   - **Right panel**: Mock Convoso Dialer — dark UI with a dial pad, call queue list, agent status indicator, and mock call controls
   - Each panel has a minimal top bar showing the tool name, icon, and a close button
   - A floating "Exit Workspace" button (bottom center or top center) to close back to normal view
   - Uses framer-motion for a smooth scale-in entrance animation

2. **Update `AgentToolLauncherModal.tsx`**
   - Change `handleLaunchAll` to close the modal and set a new `workspaceOpen` state to `true` instead of calling `window.open`
   - Remove TruMove Website from the launch (focus on Granot + Convoso only)

3. **Update parent components** (`AgentDashboardContent.tsx` and `AgentLogin.tsx`)
   - Add `workspaceOpen` state and render `<AgentToolWorkspace>` when active
   - Pass the state through the launcher modal via a new `onLaunchWorkspace` callback prop

### Mock UI Details
- Granot mock: CRM-style layout with a sidebar (logo, nav), header with search bar, and a table showing fake leads (Name, Phone, Status, Date columns)
- Convoso mock: Dialer-style layout with agent status badge, call queue cards, a circular dial pad, and call action buttons (Call, Hold, Transfer, Hangup)
- Both panels use dark backgrounds with subtle borders between them
- Responsive: on smaller screens, stack vertically

