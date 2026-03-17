

## Plan: Remove Demo Data Toggle from All Shells

The `DemoDataToggle` component (the "Demo" switch in every portal header) will be removed from all 6 shell layouts. The component file itself and its `onRefresh` wiring will also be cleaned up.

### Changes

**Remove `DemoDataToggle` import and usage from 6 shell files:**
1. `src/components/layout/AgentShell.tsx` — remove import + `<DemoDataToggle />` render
2. `src/components/layout/AdminShell.tsx` — same
3. `src/components/layout/ManagerShell.tsx` — same
4. `src/components/layout/AccountingShell.tsx` — same
5. `src/components/layout/MarketingShell.tsx` — same
6. `src/components/layout/LeadVendorShell.tsx` — remove import, render, and `onRefresh` prop (used only for demo toggle callback)

**Remove `onRefresh` prop wiring in consumer pages** (passed only to feed the demo toggle):
- `src/pages/LeadsDashboard.tsx` — remove `onRefresh` prop from `<LeadVendorShell>`
- `src/pages/LeadsPerformance.tsx` — same
- `src/pages/AdminLeadVendors.tsx` — same

**Delete the component file:**
- `src/components/leads/DemoDataToggle.tsx`

No database changes needed — the demo data seeding/purging logic simply goes away with the component.

