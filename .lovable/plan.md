

## Add "Customer Facing Websites" Tab to Customer Portal

### What
Add a new tab called **"Websites"** to the Customer Portal shell navigation. This tab will display cards linking to the two customer-facing website variants:
- **Classic** (`/classic`) — the traditional TruMove site
- **New Color TruMove** (`/homepage-2`) — the redesigned homepage

### Changes

**1. `src/components/layout/CustomerPortalShell.tsx`**
- Import `Globe` icon from lucide-react
- Add `{ id: "websites", label: "Websites", icon: Globe }` to the `navItems` array

**2. `src/pages/CustomerPortalDashboard.tsx`**
- Add a new `activeTab === "websites"` section after the messages tab
- Render two styled cards, each with a title, short description, and an "Open" link that opens the respective page in a new browser tab (`target="_blank"`)
  - **Classic Website** → `/classic`
  - **New Color TruMove** → `/homepage-2`

The cards will follow the existing portal card styling (rounded-xl, border, bg-card) for visual consistency.

