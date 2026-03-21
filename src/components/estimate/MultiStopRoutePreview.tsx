import { useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_LAYERS, US_CENTER } from "@/lib/leafletConfig";
import { MapPin, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StopLocation } from "./MultiStopLocationList";
import { useEffect } from "react";

interface MultiStopRoutePreviewProps {
  pickupLocations: StopLocation[];
  dropoffLocations: StopLocation[];
  optimizedOrder?: number[];
  className?: string;
}

function createStopIcon(isPickup: boolean, index: number): L.DivIcon {
  const bg = isPickup ? '#22c55e' : '#ef4444';
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${bg};color:white;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">${index}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitToMarkers({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 1) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [positions, map]);
  return null;
}

export default function MultiStopRoutePreview({
  pickupLocations,
  dropoffLocations,
  optimizedOrder,
  className,
}: MultiStopRoutePreviewProps) {
  const validPickups = pickupLocations.filter(l => l.validated && l.coords);
  const validDropoffs = dropoffLocations.filter(l => l.validated && l.coords);
  const allValidLocations = [...validPickups, ...validDropoffs];
  const hasLocations = allValidLocations.length >= 1;

  const orderedLocations = useMemo(() => {
    return optimizedOrder
      ? optimizedOrder.map(i => allValidLocations[i]).filter(Boolean)
      : allValidLocations;
  }, [allValidLocations, optimizedOrder]);

  // Convert coords [lat, lng] for Leaflet
  const markerPositions = useMemo(() => 
    orderedLocations
      .filter(l => l.coords)
      .map(l => [l.coords![0], l.coords![1]] as [number, number]),
    [orderedLocations]
  );

  const linePositions = useMemo(() => 
    orderedLocations
      .filter(l => l.coords)
      .map(l => [l.coords![0], l.coords![1]] as [number, number]),
    [orderedLocations]
  );

  if (!hasLocations) {
    return (
      <div className={cn(
        "h-[200px] bg-muted/30 rounded-lg border border-border/40 flex flex-col items-center justify-center gap-2",
        className
      )}>
        <div className="flex items-center gap-3 text-muted-foreground">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-sm">Add locations to see route preview</span>
          <Truck className="w-5 h-5 text-destructive" />
        </div>
      </div>
    );
  }

  let pickupIndex = 0;
  let dropoffIndex = 0;

  return (
    <div className={cn("relative rounded-lg overflow-hidden border border-border/40", className)}>
      <MapContainer
        center={US_CENTER}
        zoom={4}
        className="h-[200px] w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={TILE_LAYERS.light.url} attribution={TILE_LAYERS.light.attribution} />
        <FitToMarkers positions={markerPositions} />

        {/* Connecting dashed line */}
        {linePositions.length >= 2 && (
          <Polyline positions={linePositions} pathOptions={{ color: '#6366f1', weight: 3, dashArray: '8 8' }} />
        )}

        {/* Stop markers */}
        {orderedLocations.map((loc, i) => {
          if (!loc.coords) return null;
          const isPickup = validPickups.includes(loc);
          const displayIndex = isPickup ? ++pickupIndex : ++dropoffIndex;
          return (
            <Marker
              key={`stop-${i}`}
              position={[loc.coords[0], loc.coords[1]]}
              icon={createStopIcon(isPickup, displayIndex)}
            />
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-3 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md text-[10px] z-[1000]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Pickup</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Drop-off</span>
        </div>
      </div>

      {/* Location count badge */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md text-[10px] font-medium text-muted-foreground z-[1000]">
        {validPickups.length} pickup{validPickups.length !== 1 ? 's' : ''} • {validDropoffs.length} drop-off{validDropoffs.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
