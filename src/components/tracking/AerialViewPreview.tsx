import { useState } from "react";
import { Plane, Loader2, MapPin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AerialViewPreviewProps {
  coordinates: [number, number] | null;
  locationName?: string;
  heading?: number; // Direction the camera looks (0-360)
  pitch?: number; // Camera tilt (0-90)
  zoom?: number; // Zoom level (1-20)
  className?: string;
  onError?: () => void;
}

// Google Aerial View API endpoint (using Static Maps with satellite view as fallback)
// Note: True Aerial View API requires additional setup, using satellite tiles for now
export function AerialViewPreview({
  coordinates,
  locationName,
  heading = 0,
  pitch = 45,
  zoom = 18,
  className,
  onError
}: AerialViewPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use MapTiler satellite for aerial-like view
  const aerialUrl = coordinates
    ? `https://api.maptiler.com/maps/satellite/static/${coordinates[0]},${coordinates[1]},${zoom}/${400}x${300}@2x.jpg?key=X6zFH8Vcg9bMuUCrXFWU`
    : null;

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (!coordinates) {
    return (
      <div className={cn(
        "relative w-full h-[180px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center",
        className
      )}>
        <div className="flex flex-col items-center gap-2 text-white/40">
          <Plane className="w-8 h-8" />
          <span className="text-xs">Awaiting location...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative w-full rounded-xl overflow-hidden border border-white/10 group",
      className
    )}>
      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/90 z-10">
          <AlertCircle className="w-6 h-6 text-amber-500" />
          <span className="text-xs text-white/50">Aerial view unavailable</span>
        </div>
      )}

      {/* Aerial Image */}
      {aerialUrl && (
        <img
          src={aerialUrl}
          alt={`Aerial view of ${locationName || 'location'}`}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            isLoading ? "opacity-0" : "opacity-100",
            "group-hover:scale-105"
          )}
          onLoad={() => setIsLoading(false)}
          onError={handleError}
        />
      )}

      {/* Overlay Badge */}
      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm flex items-center gap-1.5">
        <Plane className="w-3 h-3 text-primary" />
        <span className="text-[9px] font-bold tracking-wider text-white/90">AERIAL VIEW</span>
      </div>

      {/* Coordinates Badge */}
      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm">
        <span className="text-[9px] font-mono text-white/60">
          {coordinates[1].toFixed(4)}°, {coordinates[0].toFixed(4)}°
        </span>
      </div>

      {/* Truck Marker Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          <div className="absolute inset-0 w-8 h-8 rounded-full bg-primary/30 animate-ping" />
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Location Name */}
      {locationName && (
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm">
          <span className="text-[10px] font-semibold text-white/90 truncate max-w-[150px] block">
            {locationName}
          </span>
        </div>
      )}
    </div>
  );
}
