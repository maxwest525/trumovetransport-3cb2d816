

## Plan: Comprehensive Lead Attribution, Behavior Tracking & Enhanced Data Collection

### What We're Building
A full lead intelligence system that automatically captures UTM parameters, ad click IDs, referrer data, session behavior, device info, and enhanced form fields -- all stored in the database and sent with every lead submission.

---

### 1. Database Migration: Add `lead_attribution` Table

New table `lead_attribution` linked to leads:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| lead_id | uuid | FK to leads |
| utm_source | text | Google, Meta, etc. |
| utm_medium | text | cpc, organic, email |
| utm_campaign | text | Campaign name |
| utm_term | text | Keyword |
| utm_content | text | Ad variant |
| gclid | text | Google Ads click ID |
| fbclid | text | Meta click ID |
| msclkid | text | Microsoft Ads click ID |
| referrer_url | text | document.referrer |
| landing_page | text | First page visited |
| device_type | text | mobile/desktop/tablet |
| browser | text | Chrome, Safari, etc. |
| os | text | iOS, Windows, etc. |
| screen_resolution | text | e.g. 1920x1080 |
| ip_geolocation | text | Pending integration |
| session_duration_seconds | integer | Time on site |
| pages_visited | integer | Page count |
| page_path_history | text[] | Pages visited in order |
| form_started_at | timestamptz | When form engagement began |
| form_completed_at | timestamptz | When form submitted |
| lead_source_self_reported | text | "How did you hear about us?" |
| preferred_contact_method | text | call/text/email |
| move_urgency | text | asap/flexible/just_browsing |
| sms_consent | boolean | SMS checkbox value |
| sms_consent_timestamp | timestamptz | TCPA compliance |
| sms_consent_ip | text | TCPA compliance |
| created_at | timestamptz | Default now() |

RLS: Service role insert (edge function), staff read via `has_any_role`.

---

### 2. New Utility: `src/lib/leadAttribution.ts`

A client-side module that:
- On page load, captures and stores UTM params, gclid, fbclid, msclkid from URL into sessionStorage
- Captures `document.referrer`, landing page URL, device/browser/OS/screen info
- Tracks pages visited (array), session start time
- Tracks form engagement start time
- Exposes a `getAttributionData()` function that returns all collected data as an object
- Data persists across page navigations via sessionStorage

---

### 3. Update Hero Form (Index.tsx)

Add three new fields below the date picker, before the submit button:

- **"How did you hear about us?"** -- dropdown: Google Search, Social Media, Friend/Family, Moving.com, Yelp, TV/Radio, Other
- **"How would you prefer to be contacted?"** -- pill selector: Call, Text, Email
- **"How soon are you moving?"** -- pill selector: ASAP, Within 30 Days, Flexible, Just Browsing

Track SMS consent checkbox state and timestamp.

On submit (`goNext`), call `getAttributionData()` and include all data in the `tm_lead` localStorage payload.

---

### 4. Update `submit-estimate` Edge Function

Accept the new attribution fields in the request body. After creating the lead:
- Insert a row into `lead_attribution` with all captured data
- Store `preferred_contact_method`, `move_urgency`, and `lead_source_self_reported` 
- Log SMS consent timestamp and IP for TCPA compliance

---

### 5. Update Online Estimate Submission (OnlineEstimate.tsx)

Pass attribution data from `getAttributionData()` alongside existing estimate body to `submit-estimate`.

---

### 6. Update LeadCaptureModal

Add the same three fields (how heard, contact preference, urgency) and pass them through `onSubmit`.

---

### 7. Initialize Attribution Tracking in App.tsx

Call the attribution capture function on app mount so UTM params are stored immediately on first page load, before any navigation clears them.

---

### Technical Details

**Files to create:**
- `src/lib/leadAttribution.ts` -- attribution capture utility

**Files to edit:**
- `src/pages/Index.tsx` -- add form fields + attribution capture on submit
- `src/pages/OnlineEstimate.tsx` -- pass attribution data to submit
- `src/components/LeadCaptureModal.tsx` -- add fields
- `src/App.tsx` -- initialize attribution capture on mount
- `supabase/functions/submit-estimate/index.ts` -- accept & store attribution data

**Database migration:**
- Create `lead_attribution` table with RLS policies

**Pending integrations (labeled in code):**
- IP geolocation (requires server-side lookup -- marked "Pending: IP Geolocation API")
- Facebook Conversions API (marked "Pending: Meta CAPI")  
- Google Ads offline conversion import (marked "Pending: Google Ads API")
- Scroll depth / heatmap tracking (marked "Pending: Analytics integration")

