import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Navigation, Truck, Search, Loader2, Globe, Eye, ArrowRight, Play, Sparkles } from "lucide-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { cn } from "@/lib/utils";
import { MAPTILER_KEY } from "@/lib/maptilerConfig";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyD8aMj_HlkLUWuYbZRU7I6oFGTavx2zKOc";

interface RouteSetupModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    originAddress: string;
    destAddress: string;
    originCoords?: [number, number] | null;
    destCoords?: [number, number] | null;
    moveDate?: Date;
    bookingNumber?: string;
  }) => void;
  onDemo?: () => void;
}

// Booking lookup - will query DB in future
const MOCK_BOOKINGS: Record<string, { origin: string; destination: string; date: Date }> = {};

// Geocode address to coordinates using MapTiler
async function geocodeAddress(address: string): Promise<[number, number] | null> {
  if (!address || address.length < 5) return null;
  
  try {
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${MAPTILER_KEY}&country=us&limit=1&language=en`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].center as [number, number];
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Skeleton Preview Component for empty states
function PreviewSkeleton({ variant }: { variant: "origin" | "destination" }) {
  const Icon = variant === "origin" ? Navigation : MapPin;
  const iconColor = variant === "origin" ? "text-primary" : "text-destructive";
  
  return (
    <div className="relative w-full h-[220px] rounded-lg overflow-hidden border border-dashed border-border bg-muted/30">
      {/* Animated skeleton background */}
      <div className="absolute inset-0">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      
      {/* Decorative grid pattern overlay */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${variant}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${variant})`} />
        </svg>
      </div>
      
      {/* Center icon and text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center",
          variant === "origin" ? "border-primary/40 bg-primary/5" : "border-destructive/40 bg-destructive/5"
        )}>
          <Icon className={cn("w-5 h-5", iconColor, "opacity-50")} />
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-muted-foreground">
            {variant === "origin" ? "Origin Preview" : "Destination Preview"}
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
            Enter address to see location
          </p>
        </div>
      </div>
      
      {/* Skeleton address bar at bottom */}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-1.5 px-2 py-1.5 rounded bg-background/60 backdrop-blur-sm border border-border/50">
        <Skeleton className="w-3 h-3 rounded-full" />
        <Skeleton className="h-2 flex-1 max-w-[140px]" />
      </div>
    </div>
  );
}

// Compact Street View Preview Component
function AddressPreview({ 
  address, 
  variant,
  coordinates 
}: { 
  address: string; 
  variant: "origin" | "destination";
  coordinates: [number, number] | null;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset states when address changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [address, coordinates]);

  // Google Street View Static API URL - larger images
  const streetViewUrl = coordinates
    ? `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${coordinates[1]},${coordinates[0]}&fov=90&heading=0&pitch=10&key=${GOOGLE_MAPS_API_KEY}`
    : null;

  // Google Static Maps satellite fallback - larger
  const satelliteUrl = coordinates
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates[1]},${coordinates[0]}&zoom=17&size=600x300&maptype=hybrid&key=${GOOGLE_MAPS_API_KEY}`
    : null;

  const Icon = variant === "origin" ? Navigation : MapPin;
  const iconColor = variant === "origin" ? "text-primary" : "text-destructive";

  if (!coordinates) {
    return null;
  }

  return (
    <div className="relative w-full h-[220px] rounded-lg overflow-hidden border border-border bg-muted animate-in fade-in slide-in-from-bottom-2 duration-300">
      {isLoading && (
        <div className="absolute inset-0 z-10">
          {/* Skeleton loading animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted-foreground/10 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
            <div className="h-2 w-24 rounded bg-muted-foreground/10" />
          </div>
        </div>
      )}
      
      {hasError ? (
        // Fallback to satellite view
        <img
          src={satelliteUrl || ""}
          alt={`Satellite view of ${address}`}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
          }}
        />
      ) : (
        <img
          src={streetViewUrl || ""}
          alt={`Street view of ${address}`}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(true);
          }}
        />
      )}

      {/* Location badge overlay */}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-1.5 px-2 py-1 rounded bg-background/90 backdrop-blur-sm border border-border">
        <Icon className={cn("w-3 h-3 flex-shrink-0", iconColor)} />
        <span className="text-[10px] font-medium text-foreground truncate">
          {address}
        </span>
      </div>

      {/* View type badge */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm">
        {hasError ? (
          <Globe className="w-2.5 h-2.5 text-muted-foreground" />
        ) : (
          <Eye className="w-2.5 h-2.5 text-muted-foreground" />
        )}
        <span className="text-[8px] font-medium text-muted-foreground uppercase">
          {hasError ? "Satellite" : "Street"}
        </span>
      </div>
    </div>
  );
}

export function RouteSetupModal({ open, onClose, onSubmit, onDemo }: RouteSetupModalProps) {
  const [originAddress, setOriginAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [bookingNumber, setBookingNumber] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  
  // Coordinates for Street View previews
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);

  // Geocode origin/destination only when exact coordinates have not already been selected
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (originCoords || !originAddress || originAddress.length <= 5) return;
      const coords = await geocodeAddress(originAddress);
      setOriginCoords(coords);
    }, 500);

    return () => clearTimeout(timer);
  }, [originAddress, originCoords]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (destCoords || !destAddress || destAddress.length <= 5) return;
      const coords = await geocodeAddress(destAddress);
      setDestCoords(coords);
    }, 500);

    return () => clearTimeout(timer);
  }, [destAddress, destCoords]);

  // Auto-populate from booking number with loading animation
  useEffect(() => {
    const trimmed = bookingNumber.trim();
    if (trimmed.length >= 4) {
      setIsLookingUp(true);
      const timer = setTimeout(() => {
        if (MOCK_BOOKINGS[trimmed]) {
          const booking = MOCK_BOOKINGS[trimmed];
          setOriginAddress(booking.origin);
          setDestAddress(booking.destination);
        }
        setIsLookingUp(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setIsLookingUp(false);
    }
  }, [bookingNumber]);

  // Check for pending route from cross-page navigation
  useEffect(() => {
    if (open) {
      const pendingRoute = localStorage.getItem('trumove_pending_route');
      if (pendingRoute) {
        try {
          const data = JSON.parse(pendingRoute);
          if (data.originAddress) setOriginAddress(data.originAddress);
          if (data.destAddress) setDestAddress(data.destAddress);
          localStorage.removeItem('trumove_pending_route');
        } catch (e) {
          console.error('Failed to parse pending route:', e);
        }
      }
    }
  }, [open]);

  const handleSubmit = () => {
    if (!originAddress.trim() || !destAddress.trim()) return;
    
    onSubmit({
      originAddress: originAddress.trim(),
      destAddress: destAddress.trim(),
      bookingNumber: bookingNumber.trim() || undefined,
    });
  };

  const canSubmit = originAddress.trim() && destAddress.trim();

  // Keyboard shortcuts: Escape to close, Enter to submit
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && canSubmit && !e.shiftKey) {
        // Don't submit if user is typing in an input with suggestions
        const activeElement = document.activeElement;
        const isInAutocomplete = activeElement?.closest('[data-autocomplete]');
        if (!isInAutocomplete) {
          e.preventDefault();
          handleSubmit();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, canSubmit, onClose]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Track Your Shipment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Booking/Shipping Number - NOW AT TOP */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {isLookingUp ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              Booking / Shipping Number
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Input
                  value={bookingNumber}
                  onChange={(e) => setBookingNumber(e.target.value)}
                  placeholder="Have a Booking ID or Shipping #?"
                  className={cn(
                    "pr-8 transition-all",
                    isLookingUp && "border-primary/50"
                  )}
                />
                {isLookingUp && (
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={onClose} className="h-10 px-4">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!canSubmit}
                size="sm"
                className="h-10 px-6 gap-2 bg-[hsl(220,15%,8%)] text-white hover:bg-[hsl(220,15%,12%)] border-2 border-border/30 rounded-lg font-bold shadow-lg"
              >
                <Play className="w-4 h-4 text-primary" />
                View Route
                <ArrowRight className="w-4 h-4" />
              </Button>
              {onDemo && (
                <Button 
                  onClick={() => {
                    onDemo();
                    onClose();
                  }}
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Demo
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your booking number to auto-populate route details (try 12345)
            </p>
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-3 py-1">
            <Separator className="flex-1" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Or enter addresses manually</span>
            <Separator className="flex-1" />
          </div>

          {/* Origin Row - Compact input left, Larger preview right */}
          <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-4 items-center">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                <Navigation className="w-3 h-3 text-primary" />
                Origin
              </Label>
              <LocationAutocomplete
                value={originAddress}
                onValueChange={setOriginAddress}
                onLocationSelect={(displayAddr, zip, fullAddress) => 
                  setOriginAddress(fullAddress || displayAddr)
                }
                placeholder="Enter pickup address..."
                mode="address"
                className="w-full h-9 text-sm"
              />
            </div>
            
            {/* Origin Preview - Skeleton or actual preview */}
            <div className="hidden md:block">
              <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                <Eye className="w-3 h-3" />
                Origin Preview
              </Label>
              {originCoords ? (
                <AddressPreview 
                  address={originAddress} 
                  variant="origin" 
                  coordinates={originCoords}
                />
              ) : (
                <PreviewSkeleton variant="origin" />
              )}
            </div>
          </div>

          {/* Destination Row - Compact input left, Larger preview right */}
          <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-4 items-center">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                <MapPin className="w-3 h-3 text-destructive" />
                Destination
              </Label>
              <LocationAutocomplete
                value={destAddress}
                onValueChange={setDestAddress}
                onLocationSelect={(displayAddr, zip, fullAddress) => 
                  setDestAddress(fullAddress || displayAddr)
                }
                placeholder="Enter delivery address..."
                mode="address"
                className="w-full h-9 text-sm"
              />
            </div>
            
            {/* Destination Preview - Skeleton or actual preview */}
            <div className="hidden md:block">
              <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                <Eye className="w-3 h-3" />
                Destination Preview
              </Label>
              {destCoords ? (
                <AddressPreview 
                  address={destAddress} 
                  variant="destination" 
                  coordinates={destCoords}
                />
              ) : (
                <PreviewSkeleton variant="destination" />
              )}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}