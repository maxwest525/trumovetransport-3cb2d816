import { useState, useEffect, useCallback } from "react";
import { Search, Navigation, MapPin, Loader2, Play, Sparkles, ArrowRight, Navigation2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { MAPBOX_TOKEN } from "@/lib/mapboxToken";

// Booking lookup - will query DB in future
const MOCK_BOOKINGS: Record<string, { origin: string; destination: string }> = {};

interface TrackingWizardProps {
  onSubmit: (data: { originAddress: string; destAddress: string; bookingNumber?: string }) => void;
  onDemo?: () => void;
}

export default function TrackingWizard({ onSubmit, onDemo }: TrackingWizardProps) {
  const [bookingNumber, setBookingNumber] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [originAddress, setOriginAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { longitude, latitude } = pos.coords;
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=address&limit=1`
          );
          const data = await res.json();
          if (data.features?.length > 0) {
            setOriginAddress(data.features[0].place_name);
          }
        } catch (e) {
          console.error("Reverse geocode failed", e);
        } finally {
          setIsLocating(false);
        }
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

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
    <div className="w-full max-w-md mx-auto">
      <div className="tru-floating-form-card tru-floating-form-compact overflow-hidden">
        <div className="tru-qb-form-header tru-qb-form-header-pill">
          <div className="tru-qb-form-title-group">
            <span className="tru-qb-form-title tru-qb-form-title-large">WHERE ARE WE <span className="text-primary">MOVING?</span></span>
            <span className="tru-qb-form-subtitle-compact">GPS • Live Tracking • Weather • ETA</span>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Booking # - centered */}
          <div className="flex items-center justify-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <Input
              value={bookingNumber}
              onChange={(e) => setBookingNumber(e.target.value)}
              placeholder="Booking # (optional)"
              className="max-w-[180px] h-8 text-xs text-center"
              onKeyDown={(e) => e.key === 'Enter' && handleBookingLookup()}
            />
            <Button onClick={handleBookingLookup} disabled={!bookingNumber.trim() || isLookingUp} variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
              {isLookingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Origin Address */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-base font-black uppercase tracking-wide text-foreground">
              <Navigation className="w-5 h-5 text-primary" />
              Origin
            </Label>
            <div className="relative">
              <LocationAutocomplete
                value={originAddress}
                onValueChange={setOriginAddress}
                onLocationSelect={(displayAddr, zip, fullAddress) => setOriginAddress(fullAddress || displayAddr)}
                placeholder="Enter pickup address..."
                mode="address"
                className="w-full h-9 text-sm pr-9"
              />
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                title="Use my current location"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Destination Address */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-base font-black uppercase tracking-wide text-foreground">
              <MapPin className="w-5 h-5 text-destructive" />
              Destination
            </Label>
            <LocationAutocomplete
              value={destAddress}
              onValueChange={setDestAddress}
              onLocationSelect={(displayAddr, zip, fullAddress) => setDestAddress(fullAddress || displayAddr)}
              placeholder="Enter delivery address..."
              mode="address"
              className="w-full h-9 text-sm"
            />
          </div>

          {/* View Route */}
          <button type="button" className="tru-qb-continue mx-auto" disabled={!canSubmit} onClick={handleSubmit}>
            <Play className="w-4 h-4" />
            <span>View Route</span>
          </button>
          {onDemo && (
            <div className="text-center">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground h-7" onClick={onDemo}>
                <Sparkles className="w-3 h-3" />
                See How It Works
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
