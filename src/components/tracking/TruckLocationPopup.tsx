import { useState, useEffect, useCallback, useRef } from "react";
import { Truck, Video, Globe, MapPin, Loader2, X, Maximize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
// Aerial view cache removed - inline no-op stubs
const getCachedAerialView = (_key: string): any => null;
const setCachedAerialView = (_key: string, _data: any): void => {};
import { cn } from "@/lib/utils";

interface AerialViewData {
  type: "video" | "processing" | "not_found" | "fallback" | "error";
  videoUrl?: string;
  thumbnailUrl?: string;
  message?: string;
}

interface TruckLocationPopupProps {
  coordinates: [number, number];
  locationName?: string;
  onClose: () => void;
  isOpen: boolean;
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyD8aMj_HlkLUWuYbZRU7I6oFGTavx2zKOc";

export function TruckLocationPopup({ coordinates, locationName, onClose, isOpen }: TruckLocationPopupProps) {
  const [aerialData, setAerialData] = useState<AerialViewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [imageReady, setImageReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const fetchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsInitializing(true);
      setImageReady(false);
      setImageFailed(false);
    } else {
      // Clear state when closed
      setAerialData(null);
      setIsFullscreen(false);
    }
  }, [isOpen]);

  const fetchAerialView = useCallback(async () => {
    if (!coordinates) return;
    
    const [lng, lat] = coordinates;
    setIsLoading(true);
    
    // Check cache first
    const cached = getCachedAerialView(lat, lng);
    if (cached) {
      setAerialData(cached as AerialViewData);
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('google-aerial-view', {
        body: { lat, lng, address: locationName || `${lat},${lng}` }
      });

      if (error) {
        console.error('Aerial view API error:', error);
        setAerialData({ type: 'fallback' });
        return;
      }
      
      // Cache the response
      if (data) {
        setCachedAerialView(lat, lng, data);
      }
      
      setAerialData(data as AerialViewData);
    } catch (err) {
      console.error('Failed to fetch aerial view:', err);
      setAerialData({ type: 'fallback' });
    } finally {
      setIsLoading(false);
    }
  }, [coordinates, locationName]);

  useEffect(() => {
    if (isOpen && coordinates) {
      // Debounce the fetch to prevent rapid-fire calls
      if (fetchDebounceRef.current) {
        clearTimeout(fetchDebounceRef.current);
      }
      fetchDebounceRef.current = setTimeout(() => {
        fetchAerialView();
      }, 200);
    }
    
    return () => {
      if (fetchDebounceRef.current) {
        clearTimeout(fetchDebounceRef.current);
      }
    };
  }, [isOpen, coordinates, fetchAerialView]);

  if (!isOpen) return null;

  // Use Google Static Maps instead of Mapbox
  const getSatelliteUrl = () => {
    const size = isFullscreen ? '800x500' : '640x400';
    return `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates[1]},${coordinates[0]}&zoom=15&size=${size}&maptype=satellite&key=${GOOGLE_API_KEY}`;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setIsInitializing(false);
    setImageReady(true);
    setImageFailed(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setIsInitializing(false);
    setImageFailed(true);
  };

  return (
    <>
      {/* Overlay for fullscreen */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
          onClick={() => setIsFullscreen(false)}
        />
      )}
      
      <div 
        className={cn(
          "bg-slate-900/95 border border-white/20 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md transition-opacity duration-300",
          isFullscreen 
            ? 'fixed inset-4 z-[70] max-w-4xl mx-auto my-auto h-fit' 
            : 'absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50',
          isInitializing && !imageFailed ? "opacity-0" : "opacity-100"
        )}
        style={!isFullscreen ? { width: '340px' } : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Truck className="w-3 h-3 text-primary" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white">Live Location</span>
              {locationName && (
                <p className="text-[10px] text-white/50 truncate max-w-[180px]">{locationName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5 text-white/60" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`relative ${isFullscreen ? 'h-[500px]' : 'h-[200px]'}`}>
          {isLoading && !imageReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Fallback placeholder when image fails */}
          {imageFailed ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="text-center">
                <Globe className="w-10 h-10 text-primary/30 mx-auto mb-2" />
                <span className="text-xs text-white/50">Satellite imagery unavailable</span>
                {locationName && (
                  <span className="block text-[9px] text-white/30 mt-1">Location: {locationName}</span>
                )}
                <span className="block text-[9px] text-white/30 mt-1 font-mono">
                  {coordinates[1].toFixed(4)}°N, {Math.abs(coordinates[0]).toFixed(4)}°W
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Video or Satellite Image */}
              {aerialData?.type === 'video' && aerialData.videoUrl ? (
                <video
                  src={aerialData.videoUrl}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    imageReady ? "opacity-100" : "opacity-0"
                  )}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onLoadedData={handleImageLoad}
                  onError={handleImageError}
                />
              ) : (
                <img
                  src={getSatelliteUrl()}
                  alt="Truck location"
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    imageReady ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
            </>
          )}

          {/* Truck marker overlay - only show when image is ready */}
          {imageReady && !imageFailed && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <div className="absolute inset-0 -m-2 rounded-full bg-primary/30 animate-ping" />
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 border-2 border-white">
                  <Truck className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            </div>
          )}

          {/* View type badge - only show when image is ready */}
          {imageReady && !imageFailed && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm flex items-center gap-1.5">
              {aerialData?.type === 'video' ? (
                <>
                  <Video className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-bold tracking-wider text-white/90 uppercase">Flyover</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-bold tracking-wider text-white/90 uppercase">Satellite</span>
                </>
              )}
            </div>
          )}

          {/* Coordinates - only show when image is ready */}
          {imageReady && !imageFailed && (
            <div className="absolute bottom-2 left-2 right-2 px-2 py-1.5 rounded-md bg-black/70 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-[10px] text-white/80 font-mono">
                  {coordinates[1].toFixed(4)}°N, {Math.abs(coordinates[0]).toFixed(4)}°W
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
