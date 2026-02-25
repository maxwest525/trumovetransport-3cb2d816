import { useState, useEffect, useCallback } from "react";
import { Search, Navigation, MapPin, Loader2, Play, Sparkles, Eye, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { cn } from "@/lib/utils";
import { MAPBOX_TOKEN } from "@/lib/mapboxToken";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyD8aMj_HlkLUWuYbZRU7I6oFGTavx2zKOc";

const MOCK_BOOKINGS: Record<string, { origin: string; destination: string }> = {
  '12345': {
    origin: '4520 Atlantic Blvd, Jacksonville, FL 32207',
    destination: '1000 Ocean Dr, Miami Beach, FL 33139',
  },
  '00000': {
    origin: '123 Main St, Atlanta, GA 30301',
    destination: '456 Oak Ave, Tampa, FL 33601',
  },
};

async function geocodeAddress(address: string): Promise<[number, number] | null> {
  if (!address || address.length < 5) return null;
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=US&types=address,place&limit=1`
    );
    const data = await response.json();
    if (data.features?.length > 0) return data.features[0].center as [number, number];
    return null;
  } catch { return null; }
}

function AddressPreview({ address, variant, coordinates }: { 
  address: string; variant: "origin" | "destination"; coordinates: [number, number] | null;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => { setIsLoading(true); setHasError(false); }, [address, coordinates]);

  const streetViewUrl = coordinates
    ? `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${coordinates[1]},${coordinates[0]}&fov=90&heading=0&pitch=10&key=${GOOGLE_MAPS_API_KEY}`
    : null;
  const satelliteUrl = coordinates
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates[1]},${coordinates[0]}&zoom=17&size=600x300&maptype=hybrid&key=${GOOGLE_MAPS_API_KEY}`
    : null;

  const Icon = variant === "origin" ? Navigation : MapPin;
  const iconColor = variant === "origin" ? "text-primary" : "text-destructive";

  if (!coordinates) return null;

  return (
    <div className="relative w-full h-[140px] rounded-lg overflow-hidden border border-border bg-muted animate-in fade-in slide-in-from-bottom-2 duration-300">
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        </div>
      )}
      {hasError ? (
        <img src={satelliteUrl || ""} alt={`Satellite view of ${address}`}
          className={cn("w-full h-full object-cover transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100")}
          onLoad={() => setIsLoading(false)} onError={() => setIsLoading(false)} />
      ) : (
        <img src={streetViewUrl || ""} alt={`Street view of ${address}`}
          className={cn("w-full h-full object-cover transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100")}
          onLoad={() => setIsLoading(false)} onError={() => { setHasError(true); setIsLoading(true); }} />
      )}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-1.5 px-2 py-1 rounded bg-background/90 backdrop-blur-sm border border-border">
        <Icon className={cn("w-3 h-3 flex-shrink-0", iconColor)} />
        <span className="text-[10px] font-medium text-foreground truncate">{address}</span>
      </div>
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm">
        {hasError ? <Globe className="w-2.5 h-2.5 text-muted-foreground" /> : <Eye className="w-2.5 h-2.5 text-muted-foreground" />}
        <span className="text-[8px] font-medium text-muted-foreground uppercase">{hasError ? "Satellite" : "Street"}</span>
      </div>
    </div>
  );
}

interface TrackingWizardProps {
  onSubmit: (data: { originAddress: string; destAddress: string; bookingNumber?: string }) => void;
  onDemo?: () => void;
}

export default function TrackingWizard({ onSubmit, onDemo }: TrackingWizardProps) {
  const [bookingNumber, setBookingNumber] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [originAddress, setOriginAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (originAddress?.length > 5) {
        setOriginCoords(await geocodeAddress(originAddress));
      } else { setOriginCoords(null); }
    }, 500);
    return () => clearTimeout(timer);
  }, [originAddress]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (destAddress?.length > 5) {
        setDestCoords(await geocodeAddress(destAddress));
      } else { setDestCoords(null); }
    }, 500);
    return () => clearTimeout(timer);
  }, [destAddress]);

  const handleBookingLookup = useCallback(() => {
    const trimmed = bookingNumber.trim();
    if (!trimmed) return;
    setIsLookingUp(true);
    setTimeout(() => {
      if (MOCK_BOOKINGS[trimmed]) {
        const booking = MOCK_BOOKINGS[trimmed];
        setOriginAddress(booking.origin);
        setDestAddress(booking.destination);
      }
      setIsLookingUp(false);
    }, 600);
  }, [bookingNumber]);

  useEffect(() => {
    const pendingRoute = localStorage.getItem('trumove_pending_route');
    if (pendingRoute) {
      try {
        const data = JSON.parse(pendingRoute);
        if (data.originAddress) setOriginAddress(data.originAddress);
        if (data.destAddress) setDestAddress(data.destAddress);
        localStorage.removeItem('trumove_pending_route');
      } catch (e) { console.error('Failed to parse pending route:', e); }
    }
  }, []);

  const handleSubmit = () => {
    if (!originAddress.trim() || !destAddress.trim()) return;
    onSubmit({ originAddress: originAddress.trim(), destAddress: destAddress.trim(), bookingNumber: bookingNumber.trim() || undefined });
  };

  const canSubmit = originAddress.trim().length > 3 && destAddress.trim().length > 3;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="tru-floating-form-card tru-floating-form-compact p-6 sm:p-8">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-center mb-2">
            <h2 className="text-xl font-black tracking-tight text-foreground">Track Your Shipment</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter your route details to begin live tracking.</p>
          </div>

          {/* Booking Number */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {isLookingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <Search className="w-3.5 h-3.5" />}
              Booking / Shipping Number (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                placeholder="e.g. 12345 or TM-20260225-0001"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleBookingLookup()}
              />
              <Button onClick={handleBookingLookup} disabled={!bookingNumber.trim() || isLookingUp} size="sm" className="h-10 px-4 gap-1.5">
                {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Lookup
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Try "12345" for a demo route</p>
          </div>

          <div className="border-t border-border/50" />

          {/* Origin Address */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <Navigation className="w-3.5 h-3.5 text-primary" />
              Origin Address
            </Label>
            <LocationAutocomplete
              value={originAddress}
              onValueChange={setOriginAddress}
              onLocationSelect={(displayAddr, zip, fullAddress) => setOriginAddress(fullAddress || displayAddr)}
              placeholder="Enter pickup address..."
              mode="address"
              className="w-full h-10"
            />
            <AddressPreview address={originAddress} variant="origin" coordinates={originCoords} />
          </div>

          {/* Destination Address */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-destructive" />
              Destination Address
            </Label>
            <LocationAutocomplete
              value={destAddress}
              onValueChange={setDestAddress}
              onLocationSelect={(displayAddr, zip, fullAddress) => setDestAddress(fullAddress || displayAddr)}
              placeholder="Enter delivery address..."
              mode="address"
              className="w-full h-10"
            />
            <AddressPreview address={destAddress} variant="destination" coordinates={destCoords} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            {onDemo && (
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onDemo}>
                <Sparkles className="w-3.5 h-3.5" />
                Launch Demo
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={!canSubmit} size="sm" className="gap-2 bg-foreground text-background hover:bg-foreground/90 font-bold px-6 ml-auto">
              <Play className="w-4 h-4" />
              View Route
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
