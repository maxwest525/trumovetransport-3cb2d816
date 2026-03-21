import { useEffect, useMemo, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TILE_LAYERS } from '@/lib/leafletConfig';
import { Layers } from 'lucide-react';
import type { TileLayerKey } from '@/lib/leafletConfig';

interface PropertyMapPreviewProps {
  coordinates: [number, number] | null; // [lng, lat]
  originCoordinates?: [number, number] | null;
  showRoute?: boolean;
}

function createArcLine(start: [number, number], end: [number, number], steps = 100): [number, number][] {
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = start[0] + (end[0] - start[0]) * t;
    const lng = start[1] + (end[1] - start[1]) * t;
    const arc = Math.sin(Math.PI * t) * 2;
    coords.push([lat + arc, lng]);
  }
  return coords;
}

export default function PropertyMapPreview({
  coordinates,
  originCoordinates,
  showRoute = false,
}: PropertyMapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapStyle, setMapStyle] = useState<TileLayerKey>('voyager');

  const destLatLng = coordinates ? [coordinates[1], coordinates[0]] as [number, number] : null;
  const originLatLng = originCoordinates ? [originCoordinates[1], originCoordinates[0]] as [number, number] : null;

  const arcCoords = useMemo(() => {
    if (!originLatLng || !destLatLng) return [];
    return createArcLine(originLatLng, destLatLng, 100);
  }, [originLatLng, destLatLng]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const center = destLatLng || [39.8, -98.5] as [number, number];
    const zoom = destLatLng ? 15 : 3;
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
      center,
      zoom,
    });
    const tile = TILE_LAYERS[mapStyle];
    tileLayerRef.current = L.tileLayer(tile.url, { attribution: tile.attribution }).addTo(map);
    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  // Update tile layer on style change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    const tile = TILE_LAYERS[mapStyle];
    tileLayerRef.current = L.tileLayer(tile.url, { attribution: tile.attribution }).addTo(map);
  }, [mapStyle]);

  // Update markers/route
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    layersRef.current.forEach(l => map.removeLayer(l));
    layersRef.current = [];

    const createIcon = (type: 'origin' | 'destination') => {
      const color = type === 'origin' ? 'hsl(145, 63%, 42%)' : 'hsl(0, 72%, 51%)';
      return L.divIcon({
        className: '',
        html: `<div style="position:relative;width:20px;height:20px;">
          <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.3;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);position:absolute;top:3px;left:3px;"></div>
        </div>`,
        iconSize: [20, 20], iconAnchor: [10, 10],
      });
    };

    if (destLatLng) {
      const m = L.marker(destLatLng, { icon: createIcon('destination') }).addTo(map);
      layersRef.current.push(m);
      if (!showRoute) map.flyTo(destLatLng, 16, { duration: 2 });
    }

    if (originLatLng && showRoute) {
      const m = L.marker(originLatLng, { icon: createIcon('origin') }).addTo(map);
      layersRef.current.push(m);
    }

    if (showRoute && arcCoords.length >= 2) {
      const dash = L.polyline(arcCoords, { color: 'hsl(145, 63%, 42%)', weight: 3, opacity: 0.3, dashArray: '8 16' }).addTo(map);
      const solid = L.polyline(arcCoords, { color: 'hsl(145, 63%, 42%)', weight: 4, opacity: 1 }).addTo(map);
      layersRef.current.push(dash, solid);
    }

    if (showRoute && originLatLng && destLatLng) {
      map.fitBounds(L.latLngBounds([originLatLng, destLatLng]), { padding: [60, 60] });
    }
  }, [destLatLng, originLatLng, showRoute, arcCoords]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />
      <button
        onClick={() => setMapStyle(prev => prev === 'voyager' ? 'dark' : 'voyager')}
        className="absolute bottom-4 left-4 z-[1000] px-3 py-2 rounded-lg bg-background/90 backdrop-blur shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-background transition-colors"
      >
        <Layers className="w-4 h-4" />
        {mapStyle === 'voyager' ? 'Dark' : 'Light'}
      </button>
    </div>
  );
}
