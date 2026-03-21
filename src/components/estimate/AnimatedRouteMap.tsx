import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AnimatedRouteMapProps {
  fromCoords: [number, number]; // [lng, lat]
  toCoords: [number, number];
  routeGeometry: string; // encoded polyline
  progress: number; // 0-100
  onMapReady?: () => void;
}

function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let shift = 0, result = 0, byte: number;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lng / 1e5, lat / 1e5]); // [lng, lat]
  }
  return coords;
}

function getPointAtProgress(coords: [number, number][], progress: number): [number, number] {
  if (coords.length === 0) return [0, 0];
  if (progress <= 0) return coords[0];
  if (progress >= 100) return coords[coords.length - 1];
  const index = Math.floor((coords.length - 1) * (progress / 100));
  return coords[Math.min(index, coords.length - 1)];
}

function getPartialRoute(coords: [number, number][], progress: number): [number, number][] {
  if (coords.length === 0) return [];
  if (progress <= 0) return [coords[0]];
  if (progress >= 100) return coords;
  const endIndex = Math.floor((coords.length - 1) * (progress / 100)) + 1;
  return coords.slice(0, Math.max(2, endIndex));
}

function toLatLng(coords: [number, number][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

const AnimatedRouteMap: React.FC<AnimatedRouteMapProps> = ({
  fromCoords,
  toCoords,
  routeGeometry,
  progress,
  onMapReady,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const fullRouteLayer = useRef<L.Polyline | null>(null);
  const partialRouteLayer = useRef<L.Polyline | null>(null);
  const partialGlowLayer = useRef<L.Polyline | null>(null);
  const originMarker = useRef<L.Marker | null>(null);
  const destMarker = useRef<L.Marker | null>(null);
  const truckMarker = useRef<L.Marker | null>(null);

  const routeCoords = useMemo(() => decodePolyline(routeGeometry), [routeGeometry]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png', {
      attribution: '',
    }).addTo(map);

    mapInstance.current = map;
    onMapReady?.();

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update map content when route/progress changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || routeCoords.length === 0) return;

    const fullLatLng = toLatLng(routeCoords);
    const partialCoords = getPartialRoute(routeCoords, progress);
    const partialLatLng = toLatLng(partialCoords);
    const truckPosLngLat = getPointAtProgress(routeCoords, progress);
    const truckLatLng: [number, number] = [truckPosLngLat[1], truckPosLngLat[0]];
    const fromLatLng: [number, number] = [fromCoords[1], fromCoords[0]];
    const toLatLng2: [number, number] = [toCoords[1], toCoords[0]];

    // Remove old layers
    if (fullRouteLayer.current) map.removeLayer(fullRouteLayer.current);
    if (partialRouteLayer.current) map.removeLayer(partialRouteLayer.current);
    if (partialGlowLayer.current) map.removeLayer(partialGlowLayer.current);
    if (originMarker.current) map.removeLayer(originMarker.current);
    if (destMarker.current) map.removeLayer(destMarker.current);
    if (truckMarker.current) map.removeLayer(truckMarker.current);

    // Full route (faint)
    if (fullLatLng.length >= 2) {
      fullRouteLayer.current = L.polyline(fullLatLng, { color: '#00e5a0', weight: 6, opacity: 0.25 }).addTo(map);
    }

    // Partial route (animated portion)
    if (partialLatLng.length >= 2) {
      partialGlowLayer.current = L.polyline(partialLatLng, { color: '#00e5a0', weight: 12, opacity: 0.35 }).addTo(map);
      partialRouteLayer.current = L.polyline(partialLatLng, { color: '#00e5a0', weight: 5, opacity: 1 }).addTo(map);
    }

    // Origin marker
    originMarker.current = L.marker(fromLatLng, {
      icon: L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#00e5a0;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    }).addTo(map);

    // Destination marker
    destMarker.current = L.marker(toLatLng2, {
      icon: L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    }).addTo(map);

    // Truck marker
    truckMarker.current = L.marker(truckLatLng, {
      icon: L.divIcon({
        className: 'animated-route-truck-marker',
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
          <circle cx="17" cy="18" r="2"/>
          <circle cx="7" cy="18" r="2"/>
        </svg>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    }).addTo(map);

    // Fit bounds
    const lats = routeCoords.map(c => c[1]);
    const lngs = routeCoords.map(c => c[0]);
    const bounds = L.latLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
  }, [routeCoords, progress, fromCoords, toCoords]);

  return (
    <div
      ref={mapRef}
      className="animated-route-map-container w-full h-full"
    />
  );
};

export default AnimatedRouteMap;
