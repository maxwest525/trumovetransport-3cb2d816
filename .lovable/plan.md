

## Audit: Fields That Are "Wired Up" But Never Actually Populated

The UI has sections for Canadian data, IEP inspections, and safety review from the scraper — but **the scraper never actually extracts those values**. The types and UI exist, but the data pipeline is broken in the middle.

### Fields with UI + Interface but NO extraction logic in the scraper

| Field | UI Section Exists? | Scraper Interface? | Actually Extracted? |
|---|---|---|---|
| `canadianInspections` | Yes (line 1245) | Yes (line 49-54) | **NO** — not in SMS JSON schema, not parsed from SAFER markdown |
| `canadianCrashes` | Yes (line 1275) | Yes (line 55-60) | **NO** — same, never populated |
| `safetyReview` | No dedicated section | Yes (line 61-66) | **NO** — interface exists but `parseSaferMarkdown()` never extracts it |
| `iepInspections` | Yes (line 864) | Yes (line 39) | **NO** — hardcoded to `0` on line 400 of scraper |

### Fields available from API but not fully shown in UI

| Field | Source | Currently Shown? |
|---|---|---|
| `carrier.address.street` | QC API | **NO** — only city/state rendered |
| `carrier.address.zip` | QC API | **NO** |
| `carrier.address.country` | QC API | **NO** |

### What needs to change

**1. `supabase/functions/carrier-safer-scrape/index.ts` — Fix `parseSaferMarkdown()`**

Add regex extraction for:
- **Canadian Inspections**: Parse the "Inspections/Crashes In Canada" table from SAFER markdown (vehicle inspections, driver inspections, OOS counts)
- **Canadian Crashes**: Parse fatal/injury/tow-away from the Canada section
- **Safety Review**: Parse `Rating Date`, `Review Date`, `Review Type` from SAFER markdown
- **IEP Inspections**: Parse IEP row from the inspection summary table instead of hardcoding 0

These are all on the SAFER snapshot page and appear in the markdown. The regex patterns just need to be added to the existing `parseSaferMarkdown()` function.

**2. `src/components/vetting/CarrierSnapshotCard.tsx` — Show full address**

Update the Location & Contact section (line 1358) to include `street`, `zip`, and `country` when available, instead of only city/state.

### What's already fully connected (no changes needed)

- All 6 BASIC scores + violation counts + snapshot dates ✓
- OOS rates vs national average (from API) ✓
- Roadside inspection breakdown (from API) ✓
- Insurance policies, BOC-3, authority history (from scraper) ✓
- Hazmat Compliance BASIC (from scraper) ✓
- Violation summary, enforcement cases, activity summary (from scraper) ✓
- Entity type, mileage, DUNS, state carrier ID, operating authority text (from scraper) ✓
- Safety review date/type/rating date in footer (from API) ✓

### Summary

The QC API is fully exhausted. The UI sections are all built. The gap is in the **scraper's `parseSaferMarkdown()` function** — it needs 4 new regex blocks to extract Canadian data, safety review details, and IEP inspections from the SAFER page markdown that Firecrawl already fetches. Plus a small UI tweak to show the full carrier address.

