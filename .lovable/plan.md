

## Replace Mapbox with Leaflet for Maps

### Summary
Yes, Leaflet is a great free alternative. It's open-source, has no API key requirements for basic tile layers (using OpenStreetMap tiles), and handles interactive maps, markers, polylines, and route visualization well. However, there are tradeoffs to consider.

### What Mapbox is Currently Used For

| Usage | Files | Leaflet Replacement |
|-------|-------|-------------------|
| **Autocomplete/Geocoding** | `LocationAutocomplete.tsx`, `CityZipInput.tsx` | Leaflet does NOT provide geocoding. Need a separate free geocoder (Nominatim/OpenStreetMap) |
| **Interactive tracking map** | `TruckTrackingMap.tsx` | Leaflet with OSM tiles ✅ |
| **Animated route map** | `AnimatedRouteMap.tsx` | Leaflet polylines + markers ✅ |
| **Multi-stop route preview** | `MultiStopRoutePreview.tsx` | Leaflet with markers + lines ✅ |
| **Static satellite images** | `AerialViewPreview.tsx`, `RouteAnalysisSection.tsx`, `MiniRouteOverview.tsx` | No free satellite tiles equivalent ❌ |
| **Mapbox Search JS React** | `@mapbox/search-js-react` package | Would need Nominatim or similar free geocoder |

### Tradeoffs

**Leaflet wins:**
- Completely free, no API key, no usage limits on map rendering
- Lighter bundle (~42KB vs ~230KB for mapbox-gl)
- Simpler API

**Leaflet loses:**
- No satellite/aerial imagery (free OSM tiles are street-map only)
- No built-in geocoding/autocomplete (need Nominatim which has usage limits)
- No vector tiles or 3D support
- Less polished visual style compared to Mapbox

### Recommended Approach

**Hybrid strategy** — replace interactive maps with Leaflet but keep Mapbox for:
1. Satellite imagery (aerial views, static previews)
2. Geocoding/autocomplete (LocationAutocomplete already works well)

**Phase 1: Replace interactive maps with Leaflet**
- Install `leaflet` and `react-leaflet` packages
- Replace `TruckTrackingMap.tsx` — use Leaflet `TileLayer` with OSM tiles, `Marker`, `Polyline`
- Replace `AnimatedRouteMap.tsx` — use Leaflet polylines for route animation, custom markers for truck
- Replace `MultiStopRoutePreview.tsx` — use Leaflet markers and polylines
- Remove `mapbox-gl` dependency (if fully replaced)

**Phase 2: Replace geocoding (optional)**
- Swap Mapbox geocoding in `LocationAutocomplete.tsx` with Nominatim (free OpenStreetMap geocoder)
- Note: Nominatim has a 1 req/sec rate limit for free usage

**What stays on Mapbox:**
- Satellite/aerial static images (`AerialViewPreview`, `RouteAnalysisSection`, `MiniRouteOverview`) — no free equivalent
- OR accept street-map style instead of satellite

### Technical Details

- Use `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` as the free tile source
- For better-looking tiles, can use CartoDB: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
- Leaflet uses `[lat, lng]` order (opposite of Mapbox's `[lng, lat]`) — coordinate swaps needed
- `react-leaflet` provides React components: `<MapContainer>`, `<TileLayer>`, `<Marker>`, `<Polyline>`

