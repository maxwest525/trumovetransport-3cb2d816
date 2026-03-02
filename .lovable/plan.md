

# New Lead Save Options + E-Sign "View" Button

## Changes

### 1. AgentNewCustomer.tsx -- Add "Save" option alongside "Continue to E-Sign"
Currently there's only one button: "Save & Continue to E-Sign". We'll split this into two actions:
- **"Save Lead"** (outline button) -- saves the lead to the database and navigates back to customers/pipeline
- **"Save & Continue to E-Sign"** (primary button) -- keeps the current behavior

Both buttons will share the same `handleCreate` logic but with a different post-save destination.

### 2. AgentESign.tsx -- Replace "Assist" (screen share) with "View" button
The current "Assist" button triggers a fake screen share session which isn't practical. We'll:
- Replace the screen share functionality with a **"View" button** that opens the e-sign document in a new tab (navigates to `/esign/[refNumber]` i.e. the Auth page where the customer signs)
- This lets the agent see exactly what the customer sees so they can guide them by phone
- The "View" button will appear on all tracked documents (not just "opened" ones) so the agent can preview at any stage
- Remove the screen share banner and related state since it's no longer needed

### Technical Details

**AgentNewCustomer.tsx:**
- Refactor `handleCreate` to accept a `destination` parameter (`"esign"` or `"customers"`)
- Add a second outline-style "Save Lead" button next to the existing primary button
- "Save Lead" saves then navigates to `/agent/customers`
- "Save & Continue to E-Sign" keeps navigating to `/agent/esign?leadId=...`

**AgentESign.tsx:**
- Remove `isScreensharing`, `selectedDoc`, `startScreenshare`, `endScreenshare` state and functions
- Remove the screen share banner card (lines 239-259)
- Replace the "Assist" button in the Track tab with a "View" button that opens the signing URL in a new tab (`window.open`)
- Add a "View" button to all tracked documents (not gated behind "opened" status)
- Keep the existing "View" button in the Completed tab as-is

