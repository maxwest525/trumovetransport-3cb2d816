

## Carrier Vetting Section Redesign

Replace the current static stats dump with an interactive mini FMCSA lookup demo. Users pick from 3 sample carriers and see a tight, scannable result card.

### Layout

```text
┌─────────────────────────────────────────────────┐
│  Carrier Vetting.                               │
│  Search any carrier. Red flags surfaced instant. │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Sunrise  │ │ Fast &   │ │ Regional │        │
│  │ Movers ✓ │ │ Cheap ✗  │ │ Van Lines│        │
│  │ Safe     │ │ Flagged  │ │ Mixed    │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                  │
│  ┌─ Selected Carrier Result Card ─────────────┐ │
│  │ Name / DOT / MC / Status badge             │ │
│  │                                             │ │
│  │ 3-col: Vehicle OOS | Driver OOS | Crashes  │ │
│  │                                             │ │
│  │ Pass/Fail chips: Insurance, BOC-3, OOS     │ │
│  │                                             │ │
│  │ Overall verdict: PASS / CAUTION / FAIL     │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  [ Try Carrier Vetting → ]                      │
└─────────────────────────────────────────────────┘
```

### What changes

**File: `src/pages/Index.tsx` (lines 1677-1766)**

1. **Three clickable carrier selector cards** at the top — uses data from `mockCarriers.ts` (good, bad, mixed). Each card shows the carrier name, a short status label (e.g., "Safe", "Flagged", "Mixed"), and a color-coded left border (green/red/amber). Selected card gets a highlighted ring.

2. **Result card below** — rendered based on which carrier is selected (default: the good one). Drastically simplified from current version:
   - **Header row**: Legal name, DOT/MC numbers, authority status badge (green "Authorized" or red "Not Authorized")
   - **3-column stat row**: Vehicle OOS rate vs national avg, Driver OOS rate vs national avg, Total crashes — each with a simple pass/fail color
   - **Compliance chips row**: 3-4 badges for key checks (Insurance, BOC-3, OOS orders, Safety rating) — green check or red X per item
   - **Overall verdict banner**: A single-line summary like "No red flags detected" (green) or "3 red flags found" (red) with appropriate icon

3. **Remove** the CSA BASIC progress bars — too dense for a homepage preview. Keep it to the 6-8 most impactful data points only.

4. **Add `useState`** to track selected carrier index, defaulting to 0 (good carrier).

### Technical details

- Import `MOCK_CARRIERS` from `@/data/mockCarriers` — already has good/bad/mixed carrier data with OOS rates, crash counts, authority status, etc.
- Derive pass/fail from existing data: `vehicleOosRate < vehicleOosRateNationalAvg`, `allowToOperate === 'Y'`, crash fatalities, etc.
- Red flag count computed from: OOS status, inactive authority, conditional/unsatisfactory rating, high OOS rates, fatal crashes, low insurance.
- Keep the "Try Carrier Vetting" CTA at the bottom.

