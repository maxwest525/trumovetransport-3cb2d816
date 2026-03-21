import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TILE_LAYERS } from '@/lib/leafletConfig';

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

// Convert [lng,lat] array to [lat,lng] for Leaflet
function toLatLng(coords: [number, number][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

function createMarkerIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createTruckIcon(): L.DivIcon {
  return L.divIcon({
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
  });
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
  }, [bounds, map]);
  return null;
}

function MapReadyHandler({ onReady }: { onReady?: () => void }) {
  const map = useMap();
  useEffect(() => {
    if (map && onReady) {
      onReady();
    }
  }, [map, onReady]);
  return null;
}

const AnimatedRouteMap: React.FC<AnimatedRouteMapProps> = ({
  fromCoords,
  toCoords,
  routeGeometry,
  progress,
  onMapReady,
}) => {
  const routeCoords = useMemo(() => decodePolyline(routeGeometry), [routeGeometry]);
  
  const fullRouteLatLng = useMemo(() => toLatLng(routeCoords), [routeCoords]);
  
  const partialCoords = useMemo(() => getPartialRoute(routeCoords, progress), [routeCoords, progress]);
  const partialLatLng = useMemo(() => toLatLng(partialCoords), [partialCoords]);
  
  const truckPosLngLat = useMemo(() => getPointAtProgress(routeCoords, progress), [routeCoords, progress]);
  const truckLatLng: [number, number] = [truckPosLngLat[1], truckPosLngLat[0]];

  const bounds = useMemo((): L.LatLngBoundsExpression => {
    const lats = routeCoords.map(c => c[1]);
    const lngs = routeCoords.map(c => c[0]);
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
  }, [routeCoords]);

  const fromLatLng: [number, number] = [fromCoords[1], fromCoords[0]];
  const toLatLng2: [number, number] = [toCoords[1], toCoords[0]];

  return (
    <MapContainer
      center={fromLatLng}
      zoom={5}
      className="animated-route-map-container"
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
    >
      <TileLayer url={TILE_LAYERS.dark.url} attribution={TILE_LAYERS.dark.attribution} />
      <FitBounds bounds={bounds} />
      <MapReadyHandler onReady={onMapReady} />

      {/* Background route (faint) */}
      {fullRouteLatLng.length >= 2 && (
        <Polyline positions={fullRouteLatLng} pathOptions={{ color: '#00e5a0', weight: 6, opacity: 0.25 }} />
      )}

      {/* Animated portion */}
      {partialLatLng.length >= 2 && (
        <>
          <Polyline positions={partialLatLng} pathOptions={{ color: '#00e5a0', weight: 5, opacity: 1 }} />
          <Polyline positions={partialLatLng} pathOptions={{ color: '#00e5a0', weight: 12, opacity: 0.35 }} />
        </>
      )}

      {/* Origin marker */}
      <Marker position={fromLatLng} icon={createMarkerIcon('#00e5a0')} />
      
      {/* Destination marker */}
      <Marker position={toLatLng2} icon={createMarkerIcon('#ef4444')} />

      {/* Truck marker */}
      <Marker position={truckLatLng} icon={createTruckIcon()} />
    </MapContainer>
  );
};

export default AnimatedRouteMap;
