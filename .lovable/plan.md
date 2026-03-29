

## Plan: Cookie-Consent Lead Creation + Attribution Panel + Modal Attribution

### What This Does
When a visitor clicks "Accept All" on the cookie banner, we immediately create a **anonymous lead** in the CRM with all 30+ collected data points — no form required. If that visitor later fills out a form, we **merge** their form data into the existing lead instead of creating a duplicate. Agents see all attribution data in a new panel on the CRM lead detail view.

---

### 1. New Edge Function: `capture-anonymous-visitor`
Creates a lead from cookie consent alone.

- Accepts: all attribution data (device, UTM, referrer, scroll, etc.)
- Creates a `leads` row with `first_name: "Anonymous"`, `last_name: "Visitor"`, `source: "website"`, `status: "new"`, `tags: ["cookie-consent", "anonymous"]`
- Creates a `lead_attribution` row linked to that lead
- Returns `{ leadId }` → stored in `localStorage` as `tm_anonymous_lead_id`
- Uses service role key (no auth required from visitor), RLS policy needed for anon insert OR use service role
- No JWT verification needed (public-facing)

### 2. Update `CookieConsent.tsx`
On "Accept All":
1. Call `initAttribution()` (already done)
2. Wait ~2 seconds (let scroll/page data accumulate), then call `capture-anonymous-visitor` edge function with `getAttributionData()`
3. Store returned `leadId` in `localStorage` as `tm_anonymous_lead_id`
4. Update cookie banner verbiage to be more comprehensive:
   > "We use cookies and similar tracking technologies to personalize your experience, remember your preferences, analyze how you use our site, measure ad performance, and improve our services. By clicking 'Accept All,' you consent to our full use of cookies as described in our Privacy Policy."

### 3. Update `submit-estimate` Edge Function
Before creating a new lead, check if `anonymousLeadId` is passed in the request body:
- If present: **UPDATE** the existing anonymous lead with the form data (name, email, phone, addresses, etc.) instead of inserting a new one. Also update the existing `lead_attribution` row with form timing data.
- If not present: Create new lead as usual (current behavior).

### 4. Update `OnlineEstimate.tsx`
- Read `tm_anonymous_lead_id` from `localStorage` and pass it as `anonymousLeadId` in the `submit-estimate` body

### 5. Update `LeadCaptureModal.tsx` + `Index.tsx`
- `LeadCaptureModal` `onSubmit` callback now also returns `leadSource`, `contactPreference`, `moveUrgency` (already does)
- In `Index.tsx` `handleLeadCaptureSubmit`: also store `getAttributionData()` and `tm_anonymous_lead_id` into `localStorage` so it flows through to `submit-estimate`
- Ensure the modal form submission passes attribution data through to the estimate flow

### 6. New Component: `LeadAttributionPanel.tsx`
A collapsible card for the CRM lead detail view showing:
- **Marketing Attribution**: UTM source/medium/campaign/term/content, gclid, fbclid, msclkid
- **Referrer & Landing**: referrer URL, landing page
- **Device & Environment**: device type, browser, OS, screen resolution, viewport, timezone, language, connection type, touch device, color depth, cores, DNT, ad blocker
- **Session Behavior**: session duration, pages visited, page path history, visit count, tab blur count, max scroll depth
- **Form Engagement**: form started at, form completed at
- **Self-Reported**: lead source, contact preference, move urgency
- **Consent**: SMS consent, cookie consent timestamp

This is a read-only panel that queries `lead_attribution` by `lead_id`.

> Note: The CRM lead detail view doesn't exist yet in the frontend routes. This component will be built as a standalone reusable component, ready to drop into the CRM when those pages are built. For now, it can be previewed/tested independently.

### 7. Database Migration
- Add `anon` INSERT policy on `lead_attribution` so the edge function with service role can insert (service role bypasses RLS, so actually no migration needed)
- Make `lead_id` on `lead_attribution` nullable (to handle the edge case of standalone anonymous tracking before merge)

Actually — since the edge function uses the **service role key**, it bypasses RLS entirely. No migration needed.

---

### Files Created
- `supabase/functions/capture-anonymous-visitor/index.ts`
- `src/components/crm/LeadAttributionPanel.tsx`

### Files Modified
- `src/components/CookieConsent.tsx` — new verbiage + call edge function on accept
- `supabase/functions/submit-estimate/index.ts` — merge logic for anonymous leads
- `src/pages/OnlineEstimate.tsx` — pass `anonymousLeadId`
- `src/pages/Index.tsx` — pass attribution through LeadCaptureModal flow
- `src/components/LeadCaptureModal.tsx` — include `getAttributionData()` in onSubmit data
- `src/lib/leadAttribution.ts` — no changes needed (already comprehensive)

