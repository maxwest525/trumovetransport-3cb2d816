import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWF4d2VzdDUyNSIsImEiOiJjbWtuZTY0cTgwcGIzM2VweTN2MTgzeHc3In0.nlM6XCog7Y0nrPt-5v-E2g';
import { Truck, AlertTriangle } from 'lucide-react';

interface TruckViewPanelProps {
  routeCoordinates: [number, number][];
  progress: number; // 0-100
  isTracking: boolean;
  interactive?: boolean;
  originCoords?: [number, number] | null;
  destCoords?: [number, number] | null;
  onRouteCalculated?: (route: { coordinates: [number, number][]; distance: number; duration: number }) => void;
}

// Get interpolated position along route at given progress
function getPointAlongRoute(coords: [number, number][], progress: number): [number, number] {
  if (!coords || coords.length === 0) return [0, 0];
  if (coords.length === 1) return coords[0];
  if (progress <= 0) return coords[0];
  if (progress >= 100) return coords[coords.length - 1];

  const numSegments = coords.length - 1;
  const segmentProgress = (progress / 100) * numSegments;
  const segmentIndex = Math.min(Math.floor(segmentProgress), numSegments - 1);
  const t = segmentProgress - segmentIndex;

  const start = coords[segmentIndex];
  const end = coords[Math.min(segmentIndex + 1, coords.length - 1)];

  if (!start || !end) return coords[0];

  return [
    start[0] + (end[0] - start[0]) * t,
    start[1] + (end[1] - start[1]) * t
  ];
}

// Calculate bearing between two points
function calculateBearing(start: [number, number], end: [number, number]): number {
  const startLat = start[1] * (Math.PI / 180);
  const startLng = start[0] * (Math.PI / 180);
  const endLat = end[1] * (Math.PI / 180);
  const endLng = end[0] * (Math.PI / 180);

  const dLng = endLng - startLng;

  const x = Math.sin(dLng) * Math.cos(endLat);
  const y = Math.cos(startLat) * Math.sin(endLat) - 
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  let bearing = Math.atan2(x, y) * (180 / Math.PI);
  return (bearing + 360) % 360;
}

// Get bearing at given progress along route
function getBearingAtProgress(coords: [number, number][], progress: number): number {
  if (!coords || coords.length < 2) return 0;
  
  const numSegments = coords.length - 1;
  const segmentProgress = (progress / 100) * numSegments;
  const segmentIndex = Math.min(Math.floor(segmentProgress), numSegments - 1);
  
  const start = coords[segmentIndex];
  const end = coords[Math.min(segmentIndex + 1, coords.length - 1)];
  
  if (!start || !end) return 0;
  
  return calculateBearing(start, end);
}

// Get partial route up to current progress for the trail effect
function getPartialRoute(coords: [number, number][], progress: number): [number, number][] {
  if (!coords || coords.length === 0) return [];
  if (progress <= 0) return [coords[0]];
  if (progress >= 100) return coords;

  const numSegments = coords.length - 1;
  const segmentProgress = (progress / 100) * numSegments;
  const segmentIndex = Math.floor(segmentProgress);
  const t = segmentProgress - segmentIndex;

  // Get all points up to current segment
  const partialCoords = coords.slice(0, segmentIndex + 1);
  
  // Add interpolated current position
  const start = coords[segmentIndex];
  const end = coords[Math.min(segmentIndex + 1, coords.length - 1)];
  
  if (start && end) {
    partialCoords.push([
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t
    ]);
  }

  return partialCoords;
}

// Fetch road-snapped route from Mapbox Directions API (matches homepage pattern)
async function fetchRoadSnappedRoute(
  origin: [number, number],
  dest: [number, number]
): Promise<{ coordinates: [number, number][]; distance: number; duration: number } | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${dest[0]},${dest[1]}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`
    );
    const data = await response.json();
    
    if (data.routes && data.routes[0]) {
      const route = data.routes[0];
      return {
        coordinates: route.geometry.coordinates as [number, number][],
        distance: route.distance / 1609.34, // meters to miles
        duration: route.duration, // seconds
      };
    }
    return null;
  } catch (error) {
    console.error('Mapbox Directions failed:', error);
    return null;
  }
}

const TruckViewPanel: React.FC<TruckViewPanelProps> = ({
  routeCoordinates,
  progress,
  isTracking,
  interactive = false,
  originCoords,
  destCoords,
  onRouteCalculated,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const lastBearing = useRef<number>(0);
  
  // Local detailed route state - fetched if parent doesn't provide road-snapped data
  const [detailedRoute, setDetailedRoute] = useState<[number, number][]>([]);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'fetching' | 'done'>('idle');
  
  // Use detailed route if available, otherwise fall back to parent route
  const activeRoute = detailedRoute.length > 10 ? detailedRoute : routeCoordinates;

  // Track coordinate changes to reset state
  const coordKey = `${originCoords?.[0]},${originCoords?.[1]}-${destCoords?.[0]},${destCoords?.[1]}`;

  // Reset state when coordinates change
  useEffect(() => {
    setFetchStatus('idle');
    setDetailedRoute([]);
    
    // Destroy existing map so it reinitializes with new route
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    setIsReady(false);
  }, [coordKey]);

  // Fetch road-snapped route from Mapbox (self-contained, matches homepage)
  useEffect(() => {
    // Already have detailed route from parent (>10 points = road-snapped)
    if (routeCoordinates.length > 10) {
      setDetailedRoute(routeCoordinates);
      setFetchStatus('done');
      return;
    }
    
    // Need coordinates to fetch
    if (!originCoords || !destCoords) return;
    
    // Already fetching or done
    if (fetchStatus !== 'idle') return;
    
    setFetchStatus('fetching');
    
    fetchRoadSnappedRoute(originCoords, destCoords).then((result) => {
      setFetchStatus('done');
      
      if (result) {
        setDetailedRoute(result.coordinates);
        // Notify parent so other components can use the route too
        onRouteCalculated?.(result);
      } else {
        // Fallback: use straight line between points
        setDetailedRoute([originCoords, destCoords]);
      }
    });
  }, [routeCoordinates.length, originCoords, destCoords, fetchStatus, onRouteCalculated]);

  // Initialize Mapbox map - ONLY when route is ready (matches homepage pattern)
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    // KEY FIX: Wait for route data before initializing map
    if (activeRoute.length < 2) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      // Use first point of route as initial center
      const initialCenter: [number, number] = activeRoute[0];
      const initialBearing = getBearingAtProgress(activeRoute, 0);
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        center: initialCenter,
        zoom: 17,
        pitch: 60,
        bearing: initialBearing,
        interactive: interactive,
        attributionControl: false,
      });

      map.current.on('load', () => {
        if (!map.current) return;

        // Add route source - full route (faint background)
        map.current.addSource('route-full', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: activeRoute
            }
          }
        });

        // Full route background layer
        map.current.addLayer({
          id: 'route-full-bg',
          type: 'line',
          source: 'route-full',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#00e5a0',
            'line-width': 4,
            'line-opacity': 0.2
          }
        });

        // Add traveled route source (bright trail)
        map.current.addSource('route-traveled', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [activeRoute[0], activeRoute[0]]
            }
          }
        });

        // Traveled route shadow
        map.current.addLayer({
          id: 'route-traveled-shadow',
          type: 'line',
          source: 'route-traveled',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#000000',
            'line-width': 12,
            'line-opacity': 0.4,
            'line-blur': 4
          }
        });

        // Traveled route glow
        map.current.addLayer({
          id: 'route-traveled-glow',
          type: 'line',
          source: 'route-traveled',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#00e5a0',
            'line-width': 10,
            'line-opacity': 0.4,
            'line-blur': 3
          }
        });

        // Traveled route core
        map.current.addLayer({
          id: 'route-traveled-core',
          type: 'line',
          source: 'route-traveled',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#00e5a0',
            'line-width': 4,
            'line-opacity': 1
          }
        });

        // Store initial bearing
        lastBearing.current = initialBearing;
        
        setIsReady(true);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Map failed to load');
      });

    } catch (error) {
      console.error('Failed to initialize Mapbox:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [interactive, activeRoute.length >= 2 ? activeRoute : null]);

  // Update full route source when coordinates change
  useEffect(() => {
    if (!isReady || !map.current || activeRoute.length < 2) return;

    const source = map.current.getSource('route-full') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: activeRoute
        }
      });
    }
  }, [activeRoute, isReady]);

  // Synchronized camera update - position + bearing in same frame
  const updateCamera = useCallback(() => {
    if (!map.current || !isReady || activeRoute.length < 2) return;

    const position = getPointAlongRoute(activeRoute, progress);
    const bearing = getBearingAtProgress(activeRoute, progress);
    const partialRoute = getPartialRoute(activeRoute, progress);

    // Smooth bearing transition to avoid jerky rotation
    const bearingDiff = bearing - lastBearing.current;
    let smoothBearing = bearing;
    
    // Handle wrap-around (e.g., 350 to 10 degrees)
    if (Math.abs(bearingDiff) > 180) {
      if (bearingDiff > 0) {
        smoothBearing = lastBearing.current + (bearingDiff - 360) * 0.1;
      } else {
        smoothBearing = lastBearing.current + (bearingDiff + 360) * 0.1;
      }
    } else {
      smoothBearing = lastBearing.current + bearingDiff * 0.1;
    }
    
    lastBearing.current = smoothBearing;

    // Update traveled route
    const traveledSource = map.current.getSource('route-traveled') as mapboxgl.GeoJSONSource;
    if (traveledSource && partialRoute.length >= 2) {
      traveledSource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: partialRoute
        }
      });
    }

    // Synchronized camera update - both in same call for smooth animation
    map.current.setCenter(position);
    map.current.setBearing(smoothBearing);

  }, [activeRoute, progress, isReady]);

  // Run camera update on progress change
  useEffect(() => {
    updateCamera();
  }, [progress, updateCamera]);

  // Error fallback
  if (mapError) {
    return (
      <div className="absolute inset-0 bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <AlertTriangle className="w-8 h-8" />
          <span className="text-sm">{mapError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Mapbox container */}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 truck-view-map-container"
      />

      {/* Centered truck marker overlay */}
      <div className="tracking-truck-view-marker">
        <div className="truck-glow" />
        <div className="truck-icon">
          <Truck className="w-6 h-6 text-black" />
        </div>
      </div>

      {/* Loading state - show while fetching route OR initializing map */}
      {(fetchStatus === 'fetching' || (!isReady && activeRoute.length >= 2)) && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-foreground">
              {fetchStatus === 'fetching' ? 'Calculating route...' : 'Loading Truck View...'}
            </span>
          </div>
        </div>
      )}

      {/* No route warning - show when waiting for coordinates */}
      {fetchStatus !== 'fetching' && activeRoute.length < 2 && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-2 text-center px-6">
            <Truck className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Set origin and destination to enable Truck View
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckViewPanel;
