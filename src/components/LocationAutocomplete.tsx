import { useState, useCallback, useRef, useEffect } from "react";
import { MapPin, Loader2, CheckCircle, AlertCircle, XCircle, Navigation, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { MAPTILER_KEY } from '@/lib/maptilerConfig';

// Geoapify API key (publishable, safe in client code)
const GEOAPIFY_KEY = '196cdbf659334d408ece5c98682f2106';
import { toast } from "@/hooks/use-toast";


// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 500; // ms

// Debounce delay for API calls (ms) - shorter for faster suggestions
const DEBOUNCE_DELAY = 200;

// Validation levels for address verification
export type ValidationLevel = 'verified' | 'partial' | 'unverifiable' | null;

interface LocationSuggestion {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  display: string;
  fullAddress: string;
  isVerified?: boolean;
  validationLevel?: ValidationLevel;
}

interface LocationAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  onLocationSelect: (city: string, zip: string, fullAddress?: string, isVerified?: boolean) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
  mode?: 'city' | 'address'; // 'city' for homepage, 'address' for full street addresses
  showHelperText?: boolean; // Show helper text below input
  showGeolocation?: boolean; // Show "Use my location" button
}



// Normalize address for comparison (remove punctuation, extra spaces, lowercase)
function normalizeAddress(addr: string): string {
  return addr
    .toLowerCase()
    .replace(/[.,#]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b(street|st)\b/g, 'st')
    .replace(/\b(avenue|ave)\b/g, 'ave')
    .replace(/\b(boulevard|blvd)\b/g, 'blvd')
    .replace(/\b(drive|dr)\b/g, 'dr')
    .replace(/\b(road|rd)\b/g, 'rd')
    .replace(/\b(lane|ln)\b/g, 'ln')
    .replace(/\b(court|ct)\b/g, 'ct')
    .replace(/\b(circle|cir)\b/g, 'cir')
    .replace(/\b(apartment|apt)\b/g, 'apt')
    .replace(/\b(suite|ste)\b/g, 'ste')
    .replace(/, united states$/i, '')
    .trim();
}

// Helper function for retrying API calls
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<{ result: T | null; failed: boolean; retryCount: number }> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return { result, failed: false, retryCount: attempt };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }
  
  console.warn(`API call failed after ${maxRetries + 1} attempts:`, lastError);
  return { result: null, failed: true, retryCount: maxRetries + 1 };
}

// Geoapify Address Autocomplete API - PRIMARY source for address suggestions
async function searchGeoapifyAddresses(query: string, mode: 'city' | 'address'): Promise<{ suggestions: LocationSuggestion[]; failed: boolean }> {
  const typeParam = mode === 'city' ? '&type=city' : '';
  const { result, failed } = await withRetry(async () => {
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=countrycode:us&format=json&limit=5${typeParam}&apiKey=${GEOAPIFY_KEY}`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!res.ok) {
      throw new Error(`Geoapify API error: ${res.status}`);
    }
    
    return res.json();
  });
  
  if (failed || !result) {
    return { suggestions: [], failed: true };
  }
  
  const suggestions = (result.results || []).map((r: any) => {
    const streetAddress = r.housenumber && r.street 
      ? `${r.housenumber} ${r.street}` 
      : r.street || '';
    const city = r.city || '';
    const state = r.state_code || r.state || '';
    const zip = r.postcode || '';
    const formatted = r.formatted || '';
    const displayAddr = formatted.replace(/, United States of America$/i, '');
    
    // Determine verification level from Geoapify confidence scores
    const confidence = r.rank?.confidence || 0;
    const resultType = r.result_type || '';
    const hasStreet = !!streetAddress && resultType !== 'postcode' && resultType !== 'city';
    
    let validLevel: ValidationLevel = 'partial';
    if (hasStreet && confidence >= 0.8) {
      validLevel = 'verified';
    } else if (hasStreet && confidence >= 0.5) {
      validLevel = 'partial';
    } else if (resultType === 'city' || resultType === 'postcode') {
      validLevel = 'partial';
    }
    
    return {
      streetAddress,
      city,
      state,
      zip,
      display: displayAddr,
      fullAddress: formatted,
      isVerified: validLevel === 'verified',
      validationLevel: validLevel,
    };
  });
  
  return { suggestions, failed: false };
}

// Photon API for city-only search (mode="city") - CORS-friendly, fallback
async function searchPhotonCities(query: string): Promise<LocationSuggestion[]> {
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=en&layer=city&layer=county&layer=state`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.features
      .filter((f: any) => f.properties.country === 'United States')
      .map((f: any) => {
        const props = f.properties;
        const city = props.city || props.town || props.village || props.name || '';
        const state = props.state || '';
        const zip = props.postcode || '';
        
        return {
          streetAddress: '',
          city,
          state,
          zip,
          display: `${city}, ${state}`,
          fullAddress: `${city}, ${state}${zip ? ` ${zip}` : ''}`,
          isVerified: false,
          validationLevel: 'partial' as ValidationLevel,
        };
      })
      .slice(0, 5);
  } catch {
    return [];
  }
}

// ZIP code lookup for complete 5-digit codes
async function lookupZip(zip: string): Promise<LocationSuggestion | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (res.ok) {
      const data = await res.json();
      const city = data.places[0]["place name"];
      const state = data.places[0]["state abbreviation"];
      return {
        streetAddress: '',
        city,
        state,
        zip,
        display: `${city}, ${state} ${zip}`,
        fullAddress: `${city}, ${state} ${zip}`,
        isVerified: false, // ZIP only = partial verification
        validationLevel: 'partial' as ValidationLevel,
      };
    }
  } catch {}
  return null;
}

// Reverse geocode coordinates to address using MapTiler
async function reverseGeocode(lat: number, lng: number): Promise<LocationSuggestion | null> {
  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}&language=en`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!res.ok) return null;
    
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    
    const context = feature.context || [];
    const streetAddress = feature.text || '';
    const city = context.find((c: any) => c.id?.startsWith('place'))?.text || '';
    const state = context.find((c: any) => c.id?.startsWith('region'))?.short_code?.replace('US-', '') || '';
    const zip = context.find((c: any) => c.id?.startsWith('postcode'))?.text || '';
    const fullAddr = feature.place_name || `${streetAddress}, ${city}, ${state} ${zip}`;
    const displayAddr = fullAddr.replace(', United States', '');
    
    const hasStreet = streetAddress && !streetAddress.match(/^\d{5}$/) && streetAddress !== city;
    
    return {
      streetAddress,
      city,
      state,
      zip,
      display: displayAddr,
      fullAddress: fullAddr,
      isVerified: hasStreet,
      validationLevel: hasStreet ? 'verified' : 'partial',
    };
  } catch {
    return null;
  }
}

export default function LocationAutocomplete({
  value,
  onValueChange,
  onLocationSelect,
  placeholder = "City or ZIP",
  autoFocus = false,
  onKeyDown,
  className,
  mode = 'city', // Default to city-only mode
  showHelperText = false,
  showGeolocation = false,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false); // Loading overlay for validation
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedDisplay, setSelectedDisplay] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationLevel, setValidationLevel] = useState<ValidationLevel>(null);
  const [correctionSuggestion, setCorrectionSuggestion] = useState<string | null>(null);
  const [originalUserInput, setOriginalUserInput] = useState<string>(""); // Track original input for comparison
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isClickingDropdownRef = useRef(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mode]);

  const searchLocations = useCallback(async (query: string) => {
    // Start suggesting after just 2 characters for faster feedback
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    setShowDropdown(true);
    setSelectedIndex(-1);

    // Check if it's a complete ZIP code (5 digits)
    const isCompleteZip = /^\d{5}$/.test(query.trim());
    const isPartialZip = /^\d{2,4}$/.test(query.trim());
    
    // Normalize current input for duplicate detection
    const normalizedQuery = normalizeAddress(query);

    if (mode === 'address') {
      // For address mode, use MapTiler geocoding
      const { suggestions: maptilerSuggestions, failed: maptilerFailed } = await searchMapTilerAddresses(query);
      
      if (!maptilerFailed && maptilerSuggestions.length > 0) {
        const filtered = maptilerSuggestions.filter(s => {
          const normalizedSuggestion = normalizeAddress(s.fullAddress || s.display);
          return normalizedSuggestion !== normalizedQuery;
        });
        setSuggestions(filtered);
      } else if (isCompleteZip) {
        const zipResult = await lookupZip(query.trim());
        if (zipResult) {
          zipResult.validationLevel = 'partial';
          const normalizedResult = normalizeAddress(zipResult.fullAddress || zipResult.display);
          if (normalizedResult !== normalizedQuery) {
            setSuggestions([zipResult]);
          } else {
            setSuggestions([]);
          }
        } else {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    } else {
      // City mode: use existing logic
      let results: LocationSuggestion[] = [];
      
      if (isCompleteZip) {
        const result = await lookupZip(query.trim());
        if (result) {
          results = [result];
        }
      } else {
        results = await searchPhotonCities(query);
      }
      
      // Filter out suggestions that match what's already entered
      const filtered = results.filter(s => {
        const normalizedSuggestion = normalizeAddress(s.fullAddress || s.display);
        return normalizedSuggestion !== normalizedQuery;
      });
      setSuggestions(filtered);
    }

    setIsLoading(false);
  }, [mode]);

  const debouncedSearch = useCallback((query: string) => {
    // Cancel any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    debounceRef.current = setTimeout(() => {
      searchLocations(query);
    }, DEBOUNCE_DELAY);
  }, [searchLocations]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onValueChange(newValue);
    setSelectedDisplay("");
    setIsValid(null);
    setValidationLevel(null);
    setCorrectionSuggestion(null);
    setOriginalUserInput(newValue); // Track what user typed
    debouncedSearch(newValue);
  };

  // Handle geolocation - use browser's current position
  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }
    
    setIsGeolocating(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const result = await reverseGeocode(latitude, longitude);
        
        if (result) {
          const displayText = result.fullAddress?.replace(', United States', '') || result.display;
          setSelectedDisplay(displayText);
          onValueChange(displayText);
          onLocationSelect(displayText, result.zip, result.fullAddress, result.isVerified);
          setIsValid(true);
          setValidationLevel(result.validationLevel || 'verified');
        }
        
        setIsGeolocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setIsGeolocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSelect = async (suggestion: LocationSuggestion) => {
    const finalSuggestion = suggestion;
    
    const displayText = finalSuggestion.fullAddress?.replace(', United States', '') || 
      (finalSuggestion.streetAddress 
        ? `${finalSuggestion.streetAddress}, ${finalSuggestion.city}, ${finalSuggestion.state} ${finalSuggestion.zip}`.trim()
        : `${finalSuggestion.display}${finalSuggestion.zip ? ` ${finalSuggestion.zip}` : ''}`);
    
    setSelectedDisplay(displayText);
    onValueChange(displayText);
    // Pass the full verified address as the first parameter for easier consumption
    onLocationSelect(displayText, finalSuggestion.zip, finalSuggestion.fullAddress, finalSuggestion.isVerified);
    setShowDropdown(false);
    setSuggestions([]);
    setIsValid(true);
    setValidationLevel(finalSuggestion.validationLevel || (finalSuggestion.isVerified ? 'verified' : 'partial'));
  };

  const acceptCorrection = (correctedAddress: string) => {
    setSelectedDisplay(correctedAddress);
    onValueChange(correctedAddress);
    onLocationSelect(correctedAddress, '', correctedAddress, true);
    setCorrectionSuggestion(null);
    setValidationLevel('verified');
  };

  const dismissCorrection = () => {
    setCorrectionSuggestion(null);
  };

  const handleKeyDownInternal = (e: React.KeyboardEvent) => {
    if (showDropdown && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
        return;
      } else if (e.key === "Tab" && suggestions.length > 0) {
        // Tab selects highlighted or first suggestion (Google Places behavior)
        const indexToSelect = selectedIndex >= 0 ? selectedIndex : 0;
        handleSelect(suggestions[indexToSelect]);
        // Don't preventDefault - let tab continue to next field
      } else if (e.key === "Escape") {
        setShowDropdown(false);
      }
    }
    
    // Pass through to parent handler - also set isValid to true if there's meaningful input
    if (onKeyDown && e.key === "Enter" && selectedIndex < 0) {
      // If user typed something meaningful, consider it valid for proceeding
      if (value.trim().length >= 3) {
        setIsValid(true);
      }
      onKeyDown(e);
    }
  };

  // Handle blur - autofill first/highlighted suggestion (Google Places behavior)
  // Also auto-populate ZIP to city/state
  const handleBlur = async () => {
    // Slightly longer delay to allow click events on dropdown to fire first
    setTimeout(async () => {
      // If user is clicking a dropdown item, don't interfere - let onClick handle it
      if (isClickingDropdownRef.current) {
        isClickingDropdownRef.current = false;
        return;
      }
      
      // Otherwise, auto-select first/highlighted suggestion (Google Places behavior)
      if (showDropdown && suggestions.length > 0) {
        const indexToSelect = selectedIndex >= 0 ? selectedIndex : 0;
        handleSelect(suggestions[indexToSelect]);
      } else if (!showDropdown || suggestions.length === 0) {
        // If no suggestions shown, check if user typed a complete ZIP code
        const trimmedValue = value.trim();
        const isCompleteZip = /^\d{5}$/.test(trimmedValue);
        
        if (isCompleteZip && !selectedDisplay) {
          // Auto-populate city/state from ZIP
          const zipResult = await lookupZip(trimmedValue);
          if (zipResult) {
            const displayText = `${zipResult.city}, ${zipResult.state} ${zipResult.zip}`;
            setSelectedDisplay(displayText);
            onValueChange(displayText);
            onLocationSelect(displayText, zipResult.zip, zipResult.fullAddress, false);
            setIsValid(true);
            setValidationLevel('partial');
          }
        }
      }
      setShowDropdown(false);
    }, 200);
  };

  const displayValue = selectedDisplay || value;

  // Determine border color based on validation level
  const getBorderClass = () => {
    if (!isValid) return "border-border/60 focus:border-primary";
    switch (validationLevel) {
      case 'verified':
        return "border-emerald-500/60 focus:border-emerald-500";
      case 'partial':
        return "border-emerald-600/50 border-2 focus:border-emerald-500";
      case 'unverifiable':
        return "border-red-500/60 focus:border-red-500";
      default:
        return "border-border/60 focus:border-primary";
    }
  };

  // Get tooltip content based on validation level
  const getTooltipContent = () => {
    switch (validationLevel) {
      case 'verified':
        return "Address verified via Google USPS CASS validation";
      case 'partial':
        return "City/ZIP verified. Add a street address for full USPS verification";
      case 'unverifiable':
        return "Could not verify this address. Please check for errors";
      default:
        return "";
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative">
        {/* Input with geolocation button */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            {/* Loading overlay for validation */}
            {isValidating && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10 animate-in fade-in duration-200">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Validating...</span>
              </div>
            )}
            
            <input
              ref={inputRef}
              type="text"
              className={cn(
                "w-full h-11 px-4 pr-10 rounded-lg border bg-background text-sm font-medium text-center",
                "placeholder:text-muted-foreground/50 focus:outline-none",
                "transition-all duration-300",
                "tru-input-glow",
                getBorderClass(),
                className
              )}
              placeholder={placeholder}
              value={displayValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDownInternal}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              onBlur={handleBlur}
              autoFocus={autoFocus}
            />
            
            {/* Validation indicators with tooltips - wrapped in span for proper ref handling */}
            {isValid && validationLevel === 'verified' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-help">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[200px] bg-popover border border-border z-[150]">
                  <p className="text-xs">{getTooltipContent()}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {isValid && validationLevel === 'partial' && mode === 'address' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-help">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[200px] bg-popover border border-border z-[150]">
                  <p className="text-xs">{getTooltipContent()}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {isValid && validationLevel === 'partial' && mode === 'city' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </span>
            )}
            {isValid && validationLevel === 'unverifiable' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-help">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[200px] bg-popover border border-border z-[150]">
                  <p className="text-xs">{getTooltipContent()}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          {/* Geolocation button */}
          {showGeolocation && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleGeolocation}
                  disabled={isGeolocating}
                  className={cn(
                    "flex items-center justify-center w-11 h-11 rounded-lg border transition-all duration-200",
                    "bg-background hover:bg-muted border-border/60 hover:border-primary/40",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  aria-label="Use my current location"
                >
                  {isGeolocating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Navigation className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-popover border border-border z-[150]">
                <p className="text-xs">Use my current location</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {/* Helper text */}
        {showHelperText && mode === 'address' && !isValid && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Enter a complete street address (e.g., 123 Main St, City, ST 12345)
          </p>
        )}
        
        {/* Address correction suggestion removed - was causing UI clutter */}
        
        {showDropdown && (suggestions.length > 0 || isLoading) && (
          <div 
            ref={dropdownRef}
            className={cn(
              "absolute left-0 z-[100] rounded-lg border border-border/60 bg-card shadow-lg overflow-hidden min-w-full w-max max-w-md max-h-[300px] overflow-y-auto",
              showHelperText && mode === 'address' && !isValid ? "top-[calc(100%+28px)]" : "top-full mt-1"
            )}
          >
            {isLoading ? (
              <div className="space-y-0.5 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-md">
                    <div className="w-4 h-4 rounded-full bg-muted animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div
                        className="h-3.5 rounded-md bg-muted animate-pulse"
                        style={{
                          width: `${70 - i * 12}%`,
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                      <div
                        className="h-2.5 rounded-md bg-muted/60 animate-pulse"
                        style={{
                          width: `${50 - i * 8}%`,
                          animationDelay: `${i * 150}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Hint banner removed for cleaner UI */}
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={`${suggestion.zip}-${idx}`}
                    className={cn(
                      "flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                      idx === selectedIndex ? "bg-slate-100" : "hover:bg-slate-50"
                    )}
                    onMouseDown={() => {
                      isClickingDropdownRef.current = true;
                    }}
                    onClick={() => {
                      isClickingDropdownRef.current = false;
                      handleSelect(suggestion);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {suggestion.streetAddress
                          ? `${suggestion.streetAddress}, ${suggestion.city}, ${suggestion.state} ${suggestion.zip}`.trim()
                          : `${suggestion.display}${suggestion.zip && !suggestion.display.includes(suggestion.zip) ? ` ${suggestion.zip}` : ''}`
                        }
                      </span>
                      {/* Verification badges removed for cleaner UI */}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
