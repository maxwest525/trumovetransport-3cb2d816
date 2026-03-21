import { useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { getStaticMapUrl } from "@/lib/maptilerConfig";

interface SatellitePreviewProps {
  coordinates: [number, number] | null;
  label: string;
  locationName: string;
  time?: string;
  timeLabel?: string;
  variant?: "origin" | "destination";
}

export function SatellitePreview({
  coordinates,
  label,
  locationName,
  time,
  timeLabel,
  variant = "origin"
}: SatellitePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const satelliteUrl = coordinates
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${coordinates[0]},${coordinates[1]},15,0/300x180@2x?access_token=${MAPBOX_TOKEN}`
    : null;

  const Icon = variant === "origin" ? Navigation : MapPin;

  return (
    <div className="tracking-info-card">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
          variant === "origin" 
            ? "bg-primary/20 text-primary" 
            : "bg-white/10 text-white"
        }`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/50">
          {label}
        </span>
      </div>

      {/* Satellite Image */}
      <div className="relative w-full h-[120px] rounded-lg overflow-hidden mb-3 bg-white/5">
        {coordinates && satelliteUrl ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
            <img
              src={satelliteUrl}
              alt={`Satellite view of ${locationName}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                <span className="text-xs text-white/40">Unable to load</span>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white/30">Awaiting location</span>
          </div>
        )}
      </div>

      {/* Location Name */}
      <div className="text-sm font-semibold text-white truncate">
        {locationName || "-"}
      </div>

      {/* Time */}
      {time && (
        <div className="text-xs text-white/50 mt-1">
          {timeLabel}: {time}
        </div>
      )}
    </div>
  );
}
