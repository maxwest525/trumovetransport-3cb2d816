import { useCallback } from "react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { cn } from "@/lib/utils";

interface CityZipInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onLocationSelect: (city: string, zip: string, fullAddress?: string, isVerified?: boolean, lat?: number, lng?: number) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
  mode?: "city" | "address";
}

/**
 * Reusable city/ZIP input combining LocationAutocomplete.
 * Use site-wide for consistent city/zip autocomplete and validation.
 */
export default function CityZipInput({
  value,
  onValueChange,
  onLocationSelect,
  placeholder = "City or ZIP",
  label,
  icon,
  className,
  autoFocus = false,
  mode = "city",
}: CityZipInputProps) {
  const handleSelect = useCallback(
    (city: string, zip: string, fullAddress?: string, isVerified?: boolean, lat?: number, lng?: number) => {
      onLocationSelect(city, zip, fullAddress, isVerified, lat, lng);
    },
    [onLocationSelect]
  );

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          {icon}
        </div>
      )}
      <LocationAutocomplete
        value={value}
        onValueChange={onValueChange}
        onLocationSelect={handleSelect}
        placeholder={placeholder}
        autoFocus={autoFocus}
        mode={mode}
        className={cn(icon ? "pl-9" : "", className)}
      />
    </div>
  );
}
