import { useState, useEffect, useCallback } from "react";
import { Navigation, MapPin, Loader2, Play, Sparkles, Navigation2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import LocationAutocomplete from "@/components/LocationAutocomplete";

const MOCK_BOOKINGS: Record<string, { origin: string; destination: string }> = {};

interface TrackingWizardProps {
  onSubmit: (data: {
    originAddress: string;
    destAddress: string;
    originCoords?: [number, number] | null;
    destCoords?: [number, number] | null;
    bookingNumber?: string;
  }) => void;
  onDemo?: () => void;
}

export default function TrackingWizard({ onSubmit, onDemo }: TrackingWizardProps) {
  const [bookingNumber, setBookingNumber] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [originAddress, setOriginAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { longitude, latitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
            { headers: { Accept: "application/json" } }
          );
          const data = await res.json();
          const label = data?.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setOriginAddress(label);
          setOriginCoords([longitude, latitude]);
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
    const pendingRoute = localStorage.getItem("trumove_pending_route");
    if (pendingRoute) {
      try {
        const data = JSON.parse(pendingRoute);
        if (data.originAddress) setOriginAddress(data.originAddress);
        if (data.destAddress) setDestAddress(data.destAddress);
        localStorage.removeItem("trumove_pending_route");
      } catch (e) {
        console.error("Failed to parse pending route:", e);
      }
    }
  }, []);

  const handleSubmit = () => {
    if (!originAddress.trim() || !destAddress.trim()) return;
    onSubmit({
      originAddress: originAddress.trim(),
      destAddress: destAddress.trim(),
      originCoords,
      destCoords,
      bookingNumber: bookingNumber.trim() || undefined,
    });
  };

  const canSubmit = originAddress.trim().length > 0 && destAddress.trim().length > 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card border border-border/60 rounded-2xl overflow-visible shadow-[0_0_80px_-20px_hsl(var(--primary)/0.12)]">
        <div className="p-4 sm:p-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold mb-1">Route Setup</p>
            <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Enter Your Route</h3>
            <p className="text-sm text-muted-foreground mt-1">Type any ZIP, city, or address to begin tracking.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Origin</Label>
            <div className="relative">
              <Navigation className="absolute left-3 top-[22px] -translate-y-1/2 w-4 h-4 text-primary z-10 pointer-events-none" />
              <LocationAutocomplete
                value={originAddress}
                onValueChange={(value) => {
                  setOriginAddress(value);
                  setOriginCoords(null);
                }}
                onLocationSelect={(displayAddr, _zip, fullAddress, _isVerified, lat, lng) => {
                  setOriginAddress(fullAddress || displayAddr);
                  setOriginCoords(lat !== undefined && lng !== undefined ? [lng, lat] : null);
                }}
                placeholder="Enter pickup ZIP, city, or address..."
                mode="address"
                strictAddressVerification
                validationIconInsetClassName="right-9"
                className="pl-9 pr-14 text-left"
              />
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                title="Use my current location"
                tabIndex={-1}
                className="absolute right-2 top-[22px] -translate-y-1/2 z-10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Destination</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-[22px] -translate-y-1/2 w-4 h-4 text-destructive z-10 pointer-events-none" />
              <LocationAutocomplete
                value={destAddress}
                onValueChange={(value) => {
                  setDestAddress(value);
                  setDestCoords(null);
                }}
                onLocationSelect={(displayAddr, _zip, fullAddress, _isVerified, lat, lng) => {
                  setDestAddress(fullAddress || displayAddr);
                  setDestCoords(lat !== undefined && lng !== undefined ? [lng, lat] : null);
                }}
                placeholder="Enter delivery ZIP, city, or address..."
                mode="address"
                strictAddressVerification
                className="pl-9 pr-10 text-left"
              />
            </div>
          </div>

          <Button variant="premium" className="w-full h-12 text-sm" disabled={!canSubmit} onClick={handleSubmit}>
            <Play className="w-4 h-4" />
            View Route
          </Button>

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
