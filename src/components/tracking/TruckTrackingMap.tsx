import { useRef, useEffect, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, Navigation, Box } from "lucide-react";
import { TruckLocationPopup } from "./TruckLocationPopup";
import { TrafficLegend } from "./TrafficLegend";

import { findWeighStationsOnRoute, type WeighStation } from "@/data/weighStations";
import { cn } from "@/lib/utils";

interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  congestionLevels?: string[];
}

interface CityWaypoint {
  name: string;
  lat: number;
  lon: number;
}

const MAJOR_CITIES: CityWaypoint[] = [
  { name: "Tampa", lat: 27.9506, lon: -82.4572 },
  { name: "Orlando", lat: 28.5383, lon: -81.3792 },
  { name: "Jacksonville", lat: 30.3322, lon: -81.6557 },
  { name: "Atlanta", lat: 33.749, lon: -84.388 },
  { name: "Charlotte", lat: 35.2271, lon: -80.8431 },
  { name: "Washington DC", lat: 38.9072, lon: -77.0369 },
  { name: "Philadelphia", lat: 39.9526, lon: -75.1652 },
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "Boston", lat: 42.3601, lon: -71.0589 },
  { name: "Chicago", lat: 41.8781, lon: -87.6298 },
  { name: "Dallas", lat: 32.7767, lon: -96.797 },
  { name: "Houston", lat: 29.7604, lon: -95.3698 },
  { name: "Phoenix", lat: 33.4484, lon: -112.074 },
  { name: "Denver", lat: 39.7392, lon: -104.9903 },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
  { name: "Seattle", lat: 47.6062, lon: -122.3321 },
  { name: "Las Vegas", lat: 36.1699, lon: -115.1398 },
];

function findCitiesOnRoute(routeCoords: [number, number][], maxDistanceMiles: number = 15): CityWaypoint[] {
  const citiesOnRoute: CityWaypoint[] = [];
  const degreeThreshold = maxDistanceMiles / 69;
  for (const city of MAJOR_CITIES) {
    for (const coord of routeCoords) {
      const dist = Math.sqrt(Math.pow(coord[0] - city.lon, 2) + Math.pow(coord[1] - city.lat, 2));
      if (dist < degreeThreshold) {
        citiesOnRoute.push(city);
        break;
      }
    }
  }
  return citiesOnRoute;
}

interface TruckTrackingMapProps {
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
  progress: number;
  isTracking: boolean;
  onRouteCalculated?: (route: RouteData) => void;
  followMode?: boolean;
  onFollowModeChange?: (enabled: boolean) => void;
  googleApiKey?: string;
}

export function TruckTrackingMap({
  originCoords,
  destCoords,
  progress,
  isTracking,
  onRouteCalculated,
  followMode = false,
  onFollowModeChange,
}: TruckTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  // Persistent layer refs - updated in place, never destroyed on progress tick
  const staticLayersRef = useRef<L.Layer[]>([]);
  const traveledLineRef = useRef<L.Polyline | null>(null);
  const truckMarkerRef = useRef<L.Marker | null>(null);

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showTruckPopup, setShowTruckPopup] = useState(false);
  const [currentTruckPosition, setCurrentTruckPosition] = useState<[number, number] | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState<string>("");
  const [internalFollowMode, setInternalFollowMode] = useState(followMode);
  const [citiesOnRoute, setCitiesOnRoute] = useState<CityWaypoint[]>([]);
  const [weighStations, setWeighStations] = useState<{ station: WeighStation; routeIndex: number }[]>([]);

  useEffect(() => { setInternalFollowMode(followMode); }, [followMode]);

  const toggleFollowMode = useCallback(() => {
    const newMode = !internalFollowMode;
    setInternalFollowMode(newMode);
    onFollowModeChange?.(newMode);
  }, [internalFollowMode, onFollowModeChange]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
      center: [39.8283, -98.5795],
      zoom: 4,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png', {
      attribution: '',
    }).addTo(map);
    mapInstance.current = map;
    setIsLoaded(true);
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  // Fetch route from OSRM
  const fetchRoute = useCallback(async (origin: [number, number], dest: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin[0]},${origin[1]};${dest[0]},${dest[1]}?geometries=geojson&overview=full`
      );
      const data = await response.json();
      if (data.routes?.[0]) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates as [number, number][];
        setRouteCoords(coords);
        const congestion = route.legs?.[0]?.annotation?.congestion || [];
        onRouteCalculated?.({
          coordinates: coords,
          distance: route.distance / 1609.34,
          duration: route.duration,
          congestionLevels: congestion,
        });
        setCitiesOnRoute(findCitiesOnRoute(coords, 20));
        setWeighStations(findWeighStationsOnRoute(coords, 8));
      }
    } catch (error) {
      console.error("Failed to fetch route:", error);
      setMapError("Failed to calculate route");
    }
  }, [onRouteCalculated]);

  useEffect(() => {
    if (originCoords && destCoords) fetchRoute(originCoords, destCoords);
  }, [originCoords, destCoords, fetchRoute]);

  // Draw STATIC layers (route line, markers, cities) - only when route changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || routeCoords.length === 0) return;

    // Clear previous static layers
    staticLayersRef.current.forEach(l => map.removeLayer(l));
    staticLayersRef.current = [];
    // Also remove dynamic layers so they get re-created fresh
    if (traveledLineRef.current) { map.removeLayer(traveledLineRef.current); traveledLineRef.current = null; }
    if (truckMarkerRef.current) { map.removeLayer(truckMarkerRef.current); truckMarkerRef.current = null; }

    const routeLatLngs = routeCoords.map(([lng, lat]) => [lat, lng] as [number, number]);
    const originLatLng = originCoords ? [originCoords[1], originCoords[0]] as [number, number] : null;
    const destLatLng = destCoords ? [destCoords[1], destCoords[0]] as [number, number] : null;

    // Full route (faint background)
    if (routeLatLngs.length >= 2) {
      const bg = L.polyline(routeLatLngs, { color: '#000000', weight: 8, opacity: 0.3 }).addTo(map);
      const fg = L.polyline(routeLatLngs, { color: '#00e5a0', weight: 4, opacity: 0.3 }).addTo(map);
      staticLayersRef.current.push(bg, fg);
    }

    // Origin marker
    if (originLatLng) {
      const m = L.marker(originLatLng, {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
          iconSize: [16, 16], iconAnchor: [8, 8],
        }),
      }).addTo(map);
      staticLayersRef.current.push(m);
    }

    // Destination marker
    if (destLatLng) {
      const m = L.marker(destLatLng, {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
          iconSize: [16, 16], iconAnchor: [8, 8],
        }),
      }).addTo(map);
      staticLayersRef.current.push(m);
    }

    // City waypoints
    citiesOnRoute.forEach(city => {
      const m = L.marker([city.lat, city.lon], {
        icon: L.divIcon({
          className: 'tracking-waypoint-marker city-waypoint',
          html: `<div class="city-waypoint-dot"></div><div class="city-waypoint-label">${city.name}</div>`,
          iconSize: [80, 20], iconAnchor: [40, 10],
        }),
      }).addTo(map);
      staticLayersRef.current.push(m);
    });

    // Initial fit bounds
    const lats = routeCoords.map(c => c[1]);
    const lngs = routeCoords.map(c => c[0]);
    const bounds = L.latLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    );
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 8 });
  }, [routeCoords, originCoords, destCoords, citiesOnRoute]);

  // Compute truck position from progress
  useEffect(() => {
    if (routeCoords.length === 0) return;
    const totalPoints = routeCoords.length;
    const exactIndex = (progress / 100) * (totalPoints - 1);
    const lowerIndex = Math.floor(exactIndex);
    const upperIndex = Math.min(lowerIndex + 1, totalPoints - 1);
    const fraction = exactIndex - lowerIndex;
    const lowerPoint = routeCoords[lowerIndex];
    const upperPoint = routeCoords[upperIndex];
    const currentLng = lowerPoint[0] + (upperPoint[0] - lowerPoint[0]) * fraction;
    const currentLat = lowerPoint[1] + (upperPoint[1] - lowerPoint[1]) * fraction;
    setCurrentTruckPosition([currentLat, currentLng]);
    setCurrentLocationName(`${currentLat.toFixed(4)}°N, ${Math.abs(currentLng).toFixed(4)}°W`);
  }, [progress, routeCoords]);

  // UPDATE dynamic layers in place (truck + traveled line) - no destroy/recreate
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || routeCoords.length === 0 || !currentTruckPosition) return;

    const routeLatLngs = routeCoords.map(([lng, lat]) => [lat, lng] as [number, number]);
    const traveledIndex = Math.floor((progress / 100) * (routeCoords.length - 1));
    const traveledLatLngs = routeLatLngs.slice(0, traveledIndex + 1);
    traveledLatLngs.push(currentTruckPosition);

    // Update traveled line in place
    if (traveledLineRef.current) {
      traveledLineRef.current.setLatLngs(traveledLatLngs);
    } else if (traveledLatLngs.length >= 2) {
      traveledLineRef.current = L.polyline(traveledLatLngs, { color: '#00e5a0', weight: 5, opacity: 1 }).addTo(map);
    }

    // Update truck marker in place
    if (truckMarkerRef.current) {
      truckMarkerRef.current.setLatLng(currentTruckPosition);
    } else {
      truckMarkerRef.current = L.marker(currentTruckPosition, {
        icon: L.divIcon({
          className: 'tracking-truck-marker',
          html: `
            <div class="tracking-truck-glow"></div>
            <div class="tracking-truck-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9"/>
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                <circle cx="17" cy="18" r="2"/>
                <circle cx="7" cy="18" r="2"/>
              </svg>
            </div>`,
          iconSize: [36, 36], iconAnchor: [18, 18],
        }),
        zIndexOffset: 1000,
      }).addTo(map);
    }

    // Pan to truck smoothly - use panTo (no zoom animation) to avoid jitter
    if (isTracking) {
      const targetZoom = internalFollowMode ? 18 : 16;
      const currentZoom = map.getZoom();
      if (currentZoom !== targetZoom) {
        map.setZoom(targetZoom, { animate: false });
      }
      map.panTo(currentTruckPosition, { animate: true, duration: 0.5, easeLinearity: 0.5 });
    }
  }, [progress, currentTruckPosition, routeCoords, isTracking, internalFollowMode]);

  if (mapError) {
    return (
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
            <Box className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Map Unavailable</h3>
          <p className="text-sm text-white/60 mb-4">{mapError}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10">
      <div ref={mapRef} className="w-full h-full" />

      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        {isTracking && (
          <>
            <span className="tracking-status-chip live">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              LIVE
            </span>
            <span className="tracking-status-chip">IN TRANSIT</span>
            <span className="tracking-status-chip success">ON SCHEDULE</span>
          </>
        )}

        <button
          onClick={toggleFollowMode}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-md border transition-all duration-300",
            internalFollowMode
              ? "bg-black/60 border-primary text-primary shadow-lg shadow-primary/30"
              : "bg-black/60 border-white/20 text-white/80 hover:bg-black/80"
          )}
        >
          <Navigation className={cn("w-4 h-4", internalFollowMode && "animate-pulse")} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {internalFollowMode ? "Following" : "Follow"}
          </span>
        </button>
      </div>

      <TrafficLegend isVisible={isTracking} />


      {currentTruckPosition && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] pointer-events-none">
          <div className="pointer-events-auto">
            <TruckLocationPopup
              coordinates={[currentTruckPosition[1], currentTruckPosition[0]]}
              locationName={currentLocationName}
              isOpen={showTruckPopup}
              onClose={() => setShowTruckPopup(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
