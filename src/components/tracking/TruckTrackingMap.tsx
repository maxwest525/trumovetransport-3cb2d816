import { useRef, useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_LAYERS, US_CENTER, US_ZOOM } from "@/lib/leafletConfig";
import { MAPBOX_TOKEN } from "@/lib/mapboxToken";
import { Loader2, Navigation, Box } from "lucide-react";
import { TruckLocationPopup } from "./TruckLocationPopup";
import { TrafficLegend } from "./TrafficLegend";
import { MiniRouteOverview } from "./MiniRouteOverview";
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
      // routeCoords are [lng, lat] from Mapbox Directions
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
  originCoords: [number, number] | null; // [lng, lat]
  destCoords: [number, number] | null;   // [lng, lat]
  progress: number;
  isTracking: boolean;
  onRouteCalculated?: (route: RouteData) => void;
  followMode?: boolean;
  onFollowModeChange?: (enabled: boolean) => void;
  googleApiKey?: string;
}

// Custom Leaflet icons
function createCircleIcon(color: string, size = 14): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createTruckIcon(): L.DivIcon {
  return L.divIcon({
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
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function createCityIcon(name: string): L.DivIcon {
  return L.divIcon({
    className: 'tracking-waypoint-marker city-waypoint',
    html: `<div class="city-waypoint-dot"></div><div class="city-waypoint-label">${name}</div>`,
    iconSize: [80, 20],
    iconAnchor: [40, 10],
  });
}

// Component to control map view
function MapViewController({ 
  center, 
  zoom, 
  bounds,
  followMode,
  truckPos 
}: { 
  center?: [number, number]; 
  zoom?: number; 
  bounds?: L.LatLngBoundsExpression;
  followMode: boolean;
  truckPos: [number, number] | null;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (followMode && truckPos) {
      map.flyTo(truckPos, 10, { duration: 0.5 });
    } else if (bounds) {
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 8 });
    }
  }, [followMode, truckPos, bounds, map]);

  return null;
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
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showTruckPopup, setShowTruckPopup] = useState(false);
  const [currentTruckPosition, setCurrentTruckPosition] = useState<[number, number] | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState<string>("");
  const [internalFollowMode, setInternalFollowMode] = useState(followMode);
  const [routeBounds, setRouteBounds] = useState<L.LatLngBoundsExpression | undefined>();
  const [citiesOnRoute, setCitiesOnRoute] = useState<CityWaypoint[]>([]);
  const [weighStations, setWeighStations] = useState<{ station: WeighStation; routeIndex: number }[]>([]);

  useEffect(() => { setInternalFollowMode(followMode); }, [followMode]);

  const toggleFollowMode = useCallback(() => {
    const newMode = !internalFollowMode;
    setInternalFollowMode(newMode);
    onFollowModeChange?.(newMode);
  }, [internalFollowMode, onFollowModeChange]);

  // Fetch route from Mapbox Directions (free tier, keeps working)
  const fetchRoute = useCallback(async (origin: [number, number], dest: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${origin[0]},${origin[1]};${dest[0]},${dest[1]}?geometries=geojson&overview=full&annotations=congestion&access_token=${MAPBOX_TOKEN}`
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

        // Set bounds (convert [lng,lat] to [lat,lng] for Leaflet)
        const lats = coords.map(c => c[1]);
        const lngs = coords.map(c => c[0]);
        setRouteBounds([
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ]);

        // Find cities and weigh stations
        setCitiesOnRoute(findCitiesOnRoute(coords, 20));
        setWeighStations(findWeighStationsOnRoute(coords, 8));
      }
    } catch (error) {
      console.error("Failed to fetch route:", error);
      setMapError("Failed to calculate route");
    }
  }, [onRouteCalculated]);

  useEffect(() => {
    if (originCoords && destCoords) {
      fetchRoute(originCoords, destCoords);
    }
  }, [originCoords, destCoords, fetchRoute]);

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
    // Store as [lat, lng] for Leaflet
    setCurrentTruckPosition([currentLat, currentLng]);
    setCurrentLocationName(`${currentLat.toFixed(4)}°N, ${Math.abs(currentLng).toFixed(4)}°W`);
  }, [progress, routeCoords]);

  // Convert [lng,lat] coords to [lat,lng] for Leaflet polylines
  const routeLatLngs = routeCoords.map(([lng, lat]) => [lat, lng] as [number, number]);
  
  // Traveled portion
  const traveledIndex = Math.floor((progress / 100) * (routeCoords.length - 1));
  const traveledLatLngs = routeLatLngs.slice(0, traveledIndex + 1);
  if (currentTruckPosition && traveledLatLngs.length > 0) {
    traveledLatLngs.push(currentTruckPosition);
  }

  // Origin/dest in [lat,lng]
  const originLatLng = originCoords ? [originCoords[1], originCoords[0]] as [number, number] : null;
  const destLatLng = destCoords ? [destCoords[1], destCoords[0]] as [number, number] : null;

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
      <MapContainer
        center={US_CENTER}
        zoom={US_ZOOM}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={false}
        whenReady={() => setIsLoaded(true)}
      >
        <TileLayer url={TILE_LAYERS.dark.url} attribution={TILE_LAYERS.dark.attribution} />
        
        <MapViewController
          bounds={routeBounds}
          followMode={internalFollowMode && isTracking}
          truckPos={currentTruckPosition}
        />

        {/* Full route line */}
        {routeLatLngs.length >= 2 && (
          <>
            <Polyline positions={routeLatLngs} pathOptions={{ color: '#00e5a0', weight: 4, opacity: 0.3 }} />
            <Polyline positions={routeLatLngs} pathOptions={{ color: '#000000', weight: 8, opacity: 0.3 }} />
          </>
        )}

        {/* Traveled portion */}
        {traveledLatLngs.length >= 2 && (
          <Polyline positions={traveledLatLngs} pathOptions={{ color: '#00e5a0', weight: 5, opacity: 1 }} />
        )}

        {/* Origin marker */}
        {originLatLng && (
          <Marker position={originLatLng} icon={createCircleIcon('#22c55e', 16)} />
        )}

        {/* Destination marker */}
        {destLatLng && (
          <Marker position={destLatLng} icon={createCircleIcon('#ef4444', 16)} />
        )}

        {/* Truck marker */}
        {currentTruckPosition && (
          <Marker position={currentTruckPosition} icon={createTruckIcon()} />
        )}

        {/* City waypoints */}
        {citiesOnRoute.map(city => (
          <Marker key={city.name} position={[city.lat, city.lon]} icon={createCityIcon(city.name)} />
        ))}
      </MapContainer>

      {/* Status chips */}
      {isTracking && (
        <div className="absolute top-4 left-4 z-[1000] flex gap-2">
          <span className="tracking-status-chip live">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            LIVE
          </span>
          <span className="tracking-status-chip">IN TRANSIT</span>
          <span className="tracking-status-chip success">ON SCHEDULE</span>
        </div>
      )}

      {/* Follow Mode Toggle */}
      <button
        onClick={toggleFollowMode}
        className={cn(
          "absolute top-4 right-4 z-[1000] flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-md border transition-all duration-300",
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

      {/* Traffic Legend */}
      <TrafficLegend isVisible={isTracking} />

      {/* Progress overlay */}
      {isTracking && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="px-6 py-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-3">
            {internalFollowMode && <Navigation className="w-4 h-4 text-primary animate-pulse" />}
            <span className="text-sm font-semibold text-white">{Math.round(progress)}% Complete</span>
          </div>
        </div>
      )}

      {/* Truck Location Popup */}
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

      {/* Mini Route Overview */}
      <MiniRouteOverview
        originCoords={originCoords}
        destCoords={destCoords}
        truckPosition={currentTruckPosition ? [currentTruckPosition[1], currentTruckPosition[0]] : null}
        progress={progress}
        isVisible={isTracking && internalFollowMode}
        onExpand={() => {
          setInternalFollowMode(false);
          onFollowModeChange?.(false);
        }}
      />
    </div>
  );
}
