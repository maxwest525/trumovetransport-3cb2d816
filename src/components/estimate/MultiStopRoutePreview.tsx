import { useMemo, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StopLocation } from "./MultiStopLocationList";

interface MultiStopRoutePreviewProps {
  pickupLocations: StopLocation[];
  dropoffLocations: StopLocation[];
  optimizedOrder?: number[];
  className?: string;
}

export default function MultiStopRoutePreview({
  pickupLocations,
  dropoffLocations,
  optimizedOrder,
  className,
}: MultiStopRoutePreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  const validPickups = pickupLocations.filter(l => l.validated && l.coords);
  const validDropoffs = dropoffLocations.filter(l => l.validated && l.coords);
  const allValidLocations = [...validPickups, ...validDropoffs];
  const hasLocations = allValidLocations.length >= 1;

  const orderedLocations = useMemo(() => {
    return optimizedOrder
      ? optimizedOrder.map(i => allValidLocations[i]).filter(Boolean)
      : allValidLocations;
  }, [allValidLocations, optimizedOrder]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current || !hasLocations) return;
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      center: [39.8283, -98.5795],
      zoom: 4,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);
    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, [hasLocations]);

  // Update markers/lines
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    layersRef.current.forEach(l => map.removeLayer(l));
    layersRef.current = [];

    const positions: [number, number][] = [];
    let pickupIndex = 0;
    let dropoffIndex = 0;

    orderedLocations.forEach((loc) => {
      if (!loc.coords) return;
      const pos: [number, number] = [loc.coords[0], loc.coords[1]];
      positions.push(pos);
      const isPickup = validPickups.includes(loc);
      const displayIndex = isPickup ? ++pickupIndex : ++dropoffIndex;
      const bg = isPickup ? '#22c55e' : '#ef4444';
      const m = L.marker(pos, {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:28px;height:28px;border-radius:50%;background:${bg};color:white;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">${displayIndex}</div>`,
          iconSize: [28, 28], iconAnchor: [14, 14],
        }),
      }).addTo(map);
      layersRef.current.push(m);
    });

    if (positions.length >= 2) {
      const line = L.polyline(positions, { color: '#6366f1', weight: 3, dashArray: '8 8' }).addTo(map);
      layersRef.current.push(line);
    }

    if (positions.length >= 1) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [orderedLocations, validPickups]);

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

  return (
    <div className={cn("relative rounded-lg overflow-hidden border border-border/40", className)}>
      <div ref={mapRef} className="h-[200px] w-full" />

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

      <div className="absolute top-2 right-2 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md text-[10px] font-medium text-muted-foreground z-[1000]">
        {validPickups.length} pickup{validPickups.length !== 1 ? 's' : ''} • {validDropoffs.length} drop-off{validDropoffs.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
