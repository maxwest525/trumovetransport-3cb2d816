import { useState, useEffect, useCallback, useMemo } from "react";
import { Truck, MapPin, Navigation, Clock, Route, Video, Globe, Loader2, Search, Check, Circle, Map, Layers, Pause, Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
// Aerial view cache removed - inline no-op stubs
const getCachedAerialView = (_key: string): any => null;
const setCachedAerialView = (_key: string, _data: any): void => {};

interface AerialViewData {
  type: "video" | "processing" | "not_found" | "fallback" | "error";
  videoUrl?: string;
  thumbnailUrl?: string;
  message?: string;
}

// Single-stop truck status
export interface SingleTruckStatus {
  bookingId: string;
  isMultiStop: false;
  originName: string;
  destName: string;
  originCoords: [number, number];
  destCoords: [number, number];
  currentCoords: [number, number];
  progress: number;
  distanceTraveled: number;
  totalDistance: number;
  eta: string;
  status: "in_transit" | "delivered" | "pending";
  currentLocationName: string;
}

// Multi-stop truck status
export interface MultiStopTruckStatus {
  bookingId: string;
  isMultiStop: true;
  stops: Array<{
    type: 'pickup' | 'dropoff';
    address: string;
    coords: [number, number];
    status: 'completed' | 'current' | 'upcoming';
    eta?: string;
    completedAt?: string;
  }>;
  currentStopIndex: number;
  totalDistance: number;
  estimatedDuration: number;
  progress: number;
  currentLocationName: string;
}

export type TruckStatus = SingleTruckStatus | MultiStopTruckStatus;

// Type guards
export function isMultiStop(truck: TruckStatus): truck is MultiStopTruckStatus {
  return 'isMultiStop' in truck && truck.isMultiStop === true;
}

export function isSingleStop(truck: TruckStatus): truck is SingleTruckStatus {
  return !('isMultiStop' in truck) || truck.isMultiStop === false;
}

// Demo truck statuses
const DEMO_TRUCKS: Record<string, TruckStatus> = {
  "12345": {
    bookingId: "12345",
    isMultiStop: false,
    originName: "Jacksonville, FL",
    destName: "Miami, FL",
    originCoords: [-81.6557, 30.3322],
    destCoords: [-80.1918, 25.7617],
    currentCoords: [-80.6081, 28.0601],
    progress: 52,
    distanceTraveled: 182,
    totalDistance: 350,
    eta: "4:30 PM",
    status: "in_transit",
    currentLocationName: "Near Melbourne, FL"
  },
  "00000": {
    bookingId: "00000",
    isMultiStop: true,
    stops: [
      { type: 'pickup', address: "4520 Atlantic Blvd, Jacksonville, FL", coords: [-81.65, 30.32], status: 'completed', completedAt: "9:15 AM" },
      { type: 'pickup', address: "1200 Ocean Dr, Jacksonville Beach, FL", coords: [-81.39, 30.29], status: 'current', eta: "10:30 AM" },
      { type: 'dropoff', address: "1000 Ocean Dr, Miami Beach, FL", coords: [-80.13, 25.78], status: 'upcoming', eta: "4:45 PM" },
      { type: 'dropoff', address: "500 Collins Ave, Miami Beach, FL", coords: [-80.13, 25.78], status: 'upcoming', eta: "5:15 PM" },
    ],
    currentStopIndex: 1,
    totalDistance: 352,
    estimatedDuration: 20700,
    progress: 25,
    currentLocationName: "Near Jacksonville Beach, FL"
  }
};

interface CheckMyTruckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadRoute?: (truck: TruckStatus) => void;
  onLoadMultiStop?: (truck: MultiStopTruckStatus) => void;
  defaultBookingNumber?: string;
  // Live tracking data from parent
  liveProgress?: number;
  liveRouteCoordinates?: [number, number][];
}

// Google API key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyD8aMj_HlkLUWuYbZRU7I6oFGTavx2zKOc";

export function CheckMyTruckModal({ 
  open, 
  onOpenChange, 
  onLoadRoute, 
  onLoadMultiStop, 
  defaultBookingNumber,
  liveProgress,
  liveRouteCoordinates
}: CheckMyTruckModalProps) {
  const [bookingNumber, setBookingNumber] = useState("");
  const [truckStatus, setTruckStatus] = useState<TruckStatus | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [aerialData, setAerialData] = useState<AerialViewData | null>(null);
  const [isLoadingAerial, setIsLoadingAerial] = useState(false);
  
  // View mode: 'street' (default) or 'hybrid'
  const [viewMode, setViewMode] = useState<'street' | 'hybrid'>('street');

  // MapTiler key for satellite fallback
  const maptilerKey = "X6zFH8Vcg9bMuUCrXFWU";
  
  // Calculate live truck position from parent's route coordinates and progress
  const livePosition = useMemo(() => {
    if (!liveRouteCoordinates?.length || liveProgress === undefined) return null;
    
    const totalPoints = liveRouteCoordinates.length;
    const exactIndex = (liveProgress / 100) * (totalPoints - 1);
    const lowerIndex = Math.floor(exactIndex);
    const upperIndex = Math.min(lowerIndex + 1, totalPoints - 1);
    const fraction = exactIndex - lowerIndex;
    
    const lowerPoint = liveRouteCoordinates[lowerIndex];
    const upperPoint = liveRouteCoordinates[upperIndex];
    
    if (!lowerPoint || !upperPoint) return null;
    
    const lng = lowerPoint[0] + (upperPoint[0] - lowerPoint[0]) * fraction;
    const lat = lowerPoint[1] + (upperPoint[1] - lowerPoint[1]) * fraction;
    
    return [lng, lat] as [number, number];
  }, [liveProgress, liveRouteCoordinates]);

  // Get current coordinates based on truck type
  const getCurrentCoords = (truck: TruckStatus): [number, number] => {
    if (isMultiStop(truck)) {
      const currentStop = truck.stops[truck.currentStopIndex];
      return currentStop?.coords || [-80.19, 25.77];
    }
    return truck.currentCoords;
  };

  // Fetch aerial view for current truck position (with caching)
  const fetchAerialView = useCallback(async (lat: number, lng: number, locationName: string) => {
    setIsLoadingAerial(true);
    
    // Check cache first
    const cached = getCachedAerialView(lat, lng);
    if (cached) {
      console.log('[CheckMyTruck] Using cached aerial data');
      setAerialData(cached as AerialViewData);
      setIsLoadingAerial(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('google-aerial-view', {
        body: { address: locationName, lat, lng }
      });

      if (error) {
        console.error('Aerial view API error:', error);
        return;
      }

      console.log('Check My Truck aerial view:', data);
      
      // Cache the response
      if (data) {
        setCachedAerialView(lat, lng, data);
      }
      
      setAerialData(data as AerialViewData);
    } catch (err) {
      console.error('Failed to fetch aerial view:', err);
    } finally {
      setIsLoadingAerial(false);
    }
  }, []);

  // Search for truck
  const handleSearch = async () => {
    if (!bookingNumber.trim()) return;
    
    setIsSearching(true);
    setNotFound(false);
    setAerialData(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const truck = DEMO_TRUCKS[bookingNumber.trim()];
    
    if (truck) {
      setTruckStatus(truck);
      // Fetch aerial view for current position
      const coords = getCurrentCoords(truck);
      fetchAerialView(coords[1], coords[0], truck.currentLocationName);
    } else {
      setTruckStatus(null);
      setNotFound(true);
    }
    
    setIsSearching(false);
  };

  // Reset when modal closes, or pre-fill with default booking number when opening
  useEffect(() => {
    if (!open) {
      setBookingNumber("");
      setTruckStatus(null);
      setNotFound(false);
      setAerialData(null);
    } else if (defaultBookingNumber && !bookingNumber) {
      // Auto-populate with current booking when modal opens
      setBookingNumber(defaultBookingNumber);
    }
  }, [open, defaultBookingNumber]);

  // Get satellite/hybrid fallback URL (using Google Maps Static API)
  const getHybridUrl = (coords: [number, number]) => {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${coords[1]},${coords[0]}&zoom=14&size=400x250&scale=2&maptype=hybrid&key=${GOOGLE_MAPS_API_KEY}`;
  };
  
  // Get Street View URL
  const getStreetViewUrl = (coords: [number, number]) => {
    return `https://maps.googleapis.com/maps/api/streetview?size=400x250&location=${coords[1]},${coords[0]}&fov=90&heading=90&pitch=0&key=${GOOGLE_MAPS_API_KEY}`;
  };
  
  // Determine which coordinates to use - prefer live position if available
  const displayCoords = livePosition || (truckStatus ? getCurrentCoords(truckStatus) : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-white/10 text-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <DialogTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-lg font-bold">Check My Truck</span>
              <p className="text-xs text-white/50 font-normal mt-0.5">
                Enter your booking number to see live status
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* Search Input */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter booking # (try 12345 or 00000)"
                className="w-full h-11 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !bookingNumber.trim()}
              className="bg-foreground text-background hover:bg-foreground/90 px-5"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Find"}
            </Button>
          </div>

          {/* Not Found */}
          {notFound && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/60 text-sm">No shipment found with that booking number</p>
              <p className="text-white/40 text-xs mt-1">Try: 12345 or 00000</p>
            </div>
          )}

          {/* Truck Status */}
          {truckStatus && (
            <div className="space-y-4">
              {/* View Toggle - Street View / Hybrid */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-white/50" />
                  <span className="text-xs text-white/70">Street View</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={viewMode === 'hybrid'}
                    onCheckedChange={(checked) => setViewMode(checked ? 'hybrid' : 'street')}
                    className="data-[state=checked]:bg-primary"
                  />
                  <div className="flex items-center gap-1">
                    <Layers className="w-4 h-4 text-white/50" />
                    <span className="text-xs text-white/70">Hybrid</span>
                  </div>
                </div>
              </div>
              
              {/* Street View / Hybrid View - Enhanced */}
              <div className="relative w-full h-[200px] rounded-xl overflow-hidden bg-background border border-border">
                {isLoadingAerial && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}

                {/* Street View (default) or Hybrid View */}
                {displayCoords && (
                  <img
                    src={viewMode === 'street' 
                      ? getStreetViewUrl(displayCoords)
                      : getHybridUrl(displayCoords)
                    }
                    alt="Truck location"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Truck marker overlay (only in hybrid mode) */}
                {viewMode === 'hybrid' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative">
                      <div className="absolute inset-0 -m-3 rounded-full bg-primary/30 animate-ping" />
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 border-2 border-white">
                        <Truck className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                )}

                {/* View type badge */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm flex items-center gap-1.5">
                  {viewMode === 'street' ? (
                    <>
                      <Map className="w-3 h-3 text-primary" />
                      <span className="text-[9px] font-bold tracking-wider text-white/90 uppercase">Street View</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-3 h-3 text-primary" />
                      <span className="text-[9px] font-bold tracking-wider text-white/90 uppercase">Hybrid</span>
                    </>
                  )}
                </div>
                
                {/* Live indicator when tracking */}
                {liveProgress !== undefined && liveProgress > 0 && liveProgress < 100 && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-red-500/80 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-[9px] font-bold text-white tracking-wider">LIVE</span>
                  </div>
                )}

                {/* Multi-stop badge */}
                {isMultiStop(truckStatus) && !liveProgress && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-primary/80 flex items-center gap-1.5">
                    <Route className="w-3 h-3 text-primary-foreground" />
                    <span className="text-[10px] font-bold text-primary-foreground tracking-wider">MULTI-STOP</span>
                  </div>
                )}

                {/* Location name */}
                <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-lg bg-black/70 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-white truncate">
                      {truckStatus.currentLocationName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Journey Progress</span>
                  <span className="text-sm font-bold text-primary">{truckStatus.progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                    style={{ width: `${truckStatus.progress}%` }}
                  />
                </div>
                {/* Show origin/dest for single-stop, stops for multi-stop */}
                {isMultiStop(truckStatus) ? (
                  <div className="flex justify-between mt-2 text-[10px] text-white/40">
                    <span>{truckStatus.stops[0]?.address.split(',')[0]}</span>
                    <span>{truckStatus.stops[truckStatus.stops.length - 1]?.address.split(',')[0]}</span>
                  </div>
                ) : (
                  <div className="flex justify-between mt-2 text-[10px] text-white/40">
                    <span>{truckStatus.originName}</span>
                    <span>{truckStatus.destName}</span>
                  </div>
                )}
              </div>

              {/* Multi-stop: Show stops list */}
              {isMultiStop(truckStatus) && (
                <div className="space-y-2 max-h-[160px] overflow-y-auto">
                  {truckStatus.stops.map((stop, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg",
                        stop.status === 'current' && "bg-primary/10 border border-primary/20",
                        stop.status === 'completed' && "opacity-60",
                      )}
                    >
                      {/* Status icon */}
                      {stop.status === 'completed' ? (
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                      ) : stop.status === 'current' ? (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Truck className="w-3 h-3 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                          <Circle className="w-2.5 h-2.5 text-white/40" />
                        </div>
                      )}

                      {/* Stop info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                          <MapPin className={cn("w-3 h-3", stop.type === 'pickup' ? "text-green-400" : "text-red-400")} />
                          <span className="uppercase tracking-wider">{stop.type}</span>
                        </div>
                        <p className="text-xs text-white truncate">{stop.address.split(',')[0]}</p>
                      </div>

                      {/* ETA */}
                      <div className="text-[10px] text-white/50">
                        {stop.completedAt || stop.eta}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Single-stop: Stats Grid */}
              {!isMultiStop(truckStatus) && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
                    <Route className="w-4 h-4 text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{truckStatus.distanceTraveled}</div>
                    <div className="text-[10px] text-white/40">Miles Traveled</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
                    <MapPin className="w-4 h-4 text-white/50 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{truckStatus.totalDistance - truckStatus.distanceTraveled}</div>
                    <div className="text-[10px] text-white/40">Miles Left</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
                    <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{truckStatus.eta}</div>
                    <div className="text-[10px] text-white/40">Est. Arrival</div>
                  </div>
                </div>
              )}

              {/* Multi-stop: Summary stats */}
              {isMultiStop(truckStatus) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
                    <Route className="w-4 h-4 text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{truckStatus.totalDistance}</div>
                    <div className="text-[10px] text-white/40">Total Miles</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
                    <MapPin className="w-4 h-4 text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{truckStatus.stops.length}</div>
                    <div className="text-[10px] text-white/40">Total Stops</div>
                  </div>
                </div>
              )}

              {/* Route Summary - Single stop only */}
              {!isMultiStop(truckStatus) && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 flex-1">
                    <Navigation className="w-4 h-4 text-primary" />
                    <span className="text-xs text-white/70 truncate">{truckStatus.originName}</span>
                  </div>
                  <div className="text-white/30">→</div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-xs text-white/70 truncate">{truckStatus.destName}</span>
                    <MapPin className="w-4 h-4 text-white/50" />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button 
                onClick={() => {
                  if (isMultiStop(truckStatus)) {
                    onLoadMultiStop?.(truckStatus);
                  } else {
                    onLoadRoute?.(truckStatus);
                  }
                  onOpenChange(false);
                }}
                className="w-full bg-foreground text-background hover:bg-foreground/90 font-semibold"
              >
                <Truck className="w-4 h-4 mr-2" />
                Track Full Journey
              </Button>
            </div>
          )}

          {/* Initial State */}
          {!truckStatus && !notFound && !isSearching && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-10 h-10 text-primary/60" />
              </div>
              <p className="text-white/60 text-sm mb-2">Enter your booking number above</p>
              <p className="text-white/40 text-xs">
                Try: 12345 (single) or 00000 (multi-stop)
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
