import { useEffect, useRef, useState } from "react";
import { MAPTILER_KEY } from "@/lib/maptilerConfig";
import { Map, Maximize2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniRouteOverviewProps {
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
  truckPosition: [number, number] | null;
  progress: number;
  isVisible: boolean;
  onExpand?: () => void;
}

export function MiniRouteOverview({
  originCoords,
  destCoords,
  truckPosition,
  progress,
  isVisible,
  onExpand
}: MiniRouteOverviewProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!originCoords || !destCoords) return;

    setIsLoading(true);
    setHasError(false);

    // Build static map URL with route and markers
    const originMarker = `pin-s-a+22c55e(${originCoords[0]},${originCoords[1]})`;
    const destMarker = `pin-s-b+ef4444(${destCoords[0]},${destCoords[1]})`;
    
    // Truck marker if available
    const truckMarker = truckPosition 
      ? `,pin-l-car+22c55e(${truckPosition[0]},${truckPosition[1]})`
      : "";

    // Calculate center and auto-fit
    const centerLng = (originCoords[0] + destCoords[0]) / 2;
    const centerLat = (originCoords[1] + destCoords[1]) / 2;
    
    // Calculate zoom based on distance
    const latDiff = Math.abs(originCoords[1] - destCoords[1]);
    const lngDiff = Math.abs(originCoords[0] - destCoords[0]);
    const maxDiff = Math.max(latDiff, lngDiff);
    let zoom = 5;
    if (maxDiff < 1) zoom = 8;
    else if (maxDiff < 3) zoom = 6;
    else if (maxDiff < 6) zoom = 5;
    else zoom = 4;

    const url = `https://api.maptiler.com/maps/satellite/static/auto/${width}x${height}@2x.jpg?key=${MAPTILER_KEY}&markers=${originCoords[0]},${originCoords[1]}|${destCoords[0]},${destCoords[1]}${truckPosition ? `|${truckPosition[0]},${truckPosition[1]}` : ''}&padding=30`;
    
    setImageUrl(url);
  }, [originCoords, destCoords, truckPosition]);

  if (!isVisible || !originCoords || !destCoords) return null;

  return (
    <div className={cn(
      "absolute bottom-20 right-4 z-30 transition-all duration-300",
      "opacity-0 translate-y-2",
      isVisible && "opacity-100 translate-y-0"
    )}>
      <div className="relative group">
        {/* Mini map container */}
        <div className="w-[180px] h-[120px] rounded-lg overflow-hidden border-2 border-white/20 shadow-xl bg-black/50 backdrop-blur-sm">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Route Overview" 
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Map className="w-6 h-6 text-white/40" />
            </div>
          )}

          {/* Loading overlay */}
          {imageUrl && isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          )}

          {/* Error fallback */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <Map className="w-5 h-5 text-white/40" />
            </div>
          )}
          
          {/* Progress indicator overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Route label */}
          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[9px] font-semibold text-white/90">
            ROUTE OVERVIEW
          </div>
        </div>
        
        {/* Expand button */}
        {onExpand && (
          <button
            onClick={onExpand}
            className="absolute -top-2 -right-2 w-6 h-6 bg-black/80 border border-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:border-primary"
          >
            <Maximize2 className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
