

## Plan: Fix FMCSA Data Mapping Issues

I compared the raw FMCSA API response for DOT 4285236 with what your edge function returns, and found several fields being lost or misread.

### Issues Found

1. **OOS rates returning 0** — The `/oos` endpoint returns empty data, but OOS rates are actually on the main carrier object (`driverOosRate`, `vehicleOosRate`, `vehicleInsp`, `driverInsp`, etc.). The edge function ignores these.

2. **Authority status shows "UNKNOWN"** — The raw API returns `commonAuthorityStatus: "I"` (single letter code: A=Active, I=Inactive, N=None). The edge function checks for full words like "ACTIVE" from the `/authority` endpoint, but when that endpoint returns nothing, it falls back to "UNKNOWN" instead of reading the code from the main carrier object.

3. **MC number missing** — The carrier has MC-1666506 (visible on SAFER), but neither `carrier.mcNumber` nor the `/docket-numbers` endpoint is returning it. Need to also check `carrier.mcNumber` as a raw number without prefix.

4. **Phone number missing** — SAFER shows (813) 492-4283 but the API returns empty `telephone`. This may be a limitation of the QC API for some carriers.

5. **Insurance data on wrong object** — The main carrier response has `bipdInsuranceOnFile: "0"` directly on it, but the edge function only reads from the `/authority` endpoint. Should merge both sources.

6. **OOS national averages outdated** — The carrier object has current `vehicleOosRateNationalAverage: "20.72"` and `driverOosRateNationalAverage: "5.51"` but the edge function hardcodes fallback values instead of reading from the carrier.

### Changes

**File: `supabase/functions/carrier-lookup/index.ts`**

- Read OOS data from the main carrier object as primary source, fall back to `/oos` endpoint
- Map single-letter authority codes (`A`, `I`, `N`) from the carrier object when the `/authority` endpoint returns empty
- Read `bipdInsuranceOnFile`, `cargoInsuranceOnFile`, `bondInsuranceOnFile` from the carrier object as fallback
- Use `vehicleOosRateNationalAverage` and `driverOosRateNationalAverage` from carrier object
- Include inspection counts (`vehicleInsp`, `driverInsp`, `vehicleOosInsp`, `driverOosInsp`, `hazmatInsp`) from carrier object

This is all in the edge function — no UI changes needed since the card already handles these fields correctly.

