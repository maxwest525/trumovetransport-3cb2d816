

## Integrate MapTiler as Primary Map Provider

### Summary
Replace CartoDB/OSM tile layers with MapTiler tiles across all Leaflet maps, and replace Mapbox static images + geocoding with MapTiler equivalents. MapTiler provides free raster tiles, geocoding, and static maps — all with your API key.

### What Changes

| Current Provider | Usage | MapTiler Replacement |
|---|---|---|
| CartoDB tiles (via Leaflet) | Interactive maps (6 components) | MapTiler raster XYZ tiles |
| Mapbox Static API | Satellite preview images (5 components) | MapTiler static maps API |
| Mapbox Geocoding | Address autocomplete + reverse geocode | MapTiler geocoding API (`@maptiler/client`) |
| Mapbox Directions | Route geometry | Keep as-is OR use free OSRM |

### Files to Modify

**1. Core config — `src/lib/leafletConfig.ts`**
- Replace CartoDB/OSM tile URLs with MapTiler raster tiles:
  - Light: `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=KEY`
  - Dark: `https://api.maptiler.com/maps/toner-v2/256/{z}/{x}/{y}.png?key=KEY`
  - Voyager: `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=KEY`
  - Satellite: `https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=KEY`

**2. New file — `src/lib/maptilerConfig.ts`**
- Store MapTiler API key centrally
- Helper for static map URLs
- Helper for geocoding (forward + reverse)

**3. Replace Mapbox static images (5 files)**
- `src/pages/Index.tsx` — hero analysis satellite cards
- `src/components/RouteAnalysisSection.tsx` — route location thumbnails
- `src/components/tracking/MiniRouteOverview.tsx` — mini route static image
- `src/components/tracking/AerialViewPreview.tsx` — aerial satellite view
- `src/components/tracking/SatellitePreview.tsx` — satellite preview
- Use MapTiler static maps: `https://api.maptiler.com/maps/satellite/static/{lng},{lat},{zoom}/400x300.jpg?key=KEY`

**4. Replace Mapbox geocoding (3 files)**
- `src/components/LocationAutocomplete.tsx` — main autocomplete
- `src/components/tracking/RouteSetupModal.tsx` — route geocoding
- `src/components/estimate/MoveWeatherForecast.tsx` — weather geocoding
- Use MapTiler geocoding: `https://api.maptiler.com/geocoding/{query}.json?key=KEY`

**5. Replace Mapbox directions (2 files)**
- `src/components/tracking/TruckViewPanel.tsx`
- `src/components/tracking/TruckTrackingMap.tsx`
- Option: Use free OSRM (`https://router.project-osrm.org/route/v1/driving/...`) or keep Mapbox for now

**6. Remove `mapbox-gl` dependency if TruckViewPanel can be converted to Leaflet**
- `src/components/tracking/TruckViewPanel.tsx` uses `mapbox-gl` directly — convert to Leaflet or keep as fallback

### Dependencies
- Install `@maptiler/client` for geocoding/static maps SDK
- API key `sKYOSfDoKHOwlfsP94LH` stored as public constant (it's a publishable key)

### What Stays
- `react-leaflet` + `leaflet` — unchanged, just different tile URLs
- All marker/polyline/routing logic — unchanged

### Technical Notes
- MapTiler raster tiles work as drop-in replacements for Leaflet `TileLayer` — just swap the URL
- MapTiler geocoding returns GeoJSON with `[lng, lat]` coordinates, similar to Mapbox
- Static maps URL pattern: `https://api.maptiler.com/maps/{style}/static/{lng},{lat},{zoom}/{width}x{height}.png?key=KEY`
- Free tier: 100K tile loads/month, unlimited geocoding calls

