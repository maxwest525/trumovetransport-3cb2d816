import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
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
    coords.push([lat + arc, lng]); // [lat, lng] for Leaflet
  }
  return coords;
}

function createPulsingIcon(type: 'origin' | 'destination'): L.DivIcon {
  const color = type === 'origin' ? 'hsl(145, 63%, 42%)' : 'hsl(0, 72%, 51%)';
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.3;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);position:absolute;top:3px;left:3px;"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function FlyToCoords({ coords, zoom }: { coords: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, zoom, { duration: 2 });
  }, [coords, zoom, map]);
  return null;
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [bounds, map]);
  return null;
}

export default function PropertyMapPreview({
  coordinates,
  originCoordinates,
  showRoute = false,
}: PropertyMapPreviewProps) {
  const [mapStyle, setMapStyle] = useState<TileLayerKey>('voyager');

  // Convert [lng, lat] to [lat, lng] for Leaflet
  const destLatLng = coordinates ? [coordinates[1], coordinates[0]] as [number, number] : null;
  const originLatLng = originCoordinates ? [originCoordinates[1], originCoordinates[0]] as [number, number] : null;

  const arcCoords = useMemo(() => {
    if (!originLatLng || !destLatLng) return [];
    return createArcLine(originLatLng, destLatLng, 100);
  }, [originLatLng, destLatLng]);

  const bounds = useMemo((): L.LatLngBoundsExpression | null => {
    if (!originLatLng || !destLatLng) return null;
    return L.latLngBounds([originLatLng, destLatLng]);
  }, [originLatLng, destLatLng]);

  const tile = TILE_LAYERS[mapStyle];

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={destLatLng || [39.8, -98.5]}
        zoom={destLatLng ? 15 : 3}
        className="w-full h-full rounded-xl overflow-hidden"
        zoomControl={true}
        attributionControl={false}
        key={mapStyle} // Re-mount on style change
      >
        <TileLayer url={tile.url} attribution={tile.attribution} />

        {destLatLng && !showRoute && <FlyToCoords coords={destLatLng} zoom={16} />}
        {bounds && showRoute && <FitBounds bounds={bounds} />}

        {/* Destination marker */}
        {destLatLng && <Marker position={destLatLng} icon={createPulsingIcon('destination')} />}

        {/* Origin marker */}
        {originLatLng && showRoute && <Marker position={originLatLng} icon={createPulsingIcon('origin')} />}

        {/* Route arc */}
        {showRoute && arcCoords.length >= 2 && (
          <>
            <Polyline positions={arcCoords} pathOptions={{ color: 'hsl(145, 63%, 42%)', weight: 3, opacity: 0.3, dashArray: '8 16' }} />
            <Polyline positions={arcCoords} pathOptions={{ color: 'hsl(145, 63%, 42%)', weight: 4, opacity: 1 }} />
          </>
        )}
      </MapContainer>

      {/* Style toggle */}
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
