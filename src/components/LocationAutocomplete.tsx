import { useState, useCallback, useRef, useEffect } from "react";
import { MapPin, Loader2, CheckCircle, AlertCircle, XCircle, Navigation, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { MAPBOX_TOKEN } from '@/lib/mapboxToken';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  mapboxId?: string;
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

// Generate a unique session token for API billing optimization
function generateSessionToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Session tokens for APIs - persists for the component lifecycle
let mapboxSessionToken = generateSessionToken();
let googleSessionToken = generateSessionToken();

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

// Google Places Autocomplete API - PRIMARY source for address suggestions
// Uses retry logic to handle transient 503 boot errors gracefully
async function searchGooglePlaces(query: string): Promise<{ suggestions: LocationSuggestion[]; failed: boolean }> {
  const makeRequest = async (): Promise<{ suggestions: LocationSuggestion[]; failed: boolean }> => {
    const { data, error } = await supabase.functions.invoke('google-places-autocomplete', {
      body: { 
        query,
        sessionToken: googleSessionToken,
        types: ['address']
      }
    });

    // Throw on transient errors (503, etc.) to trigger retry
    if (error) {
      const errorMessage = error.message || String(error);
      if (errorMessage.includes('503') || errorMessage.includes('BOOT_ERROR')) {
        throw new Error(`Transient error: ${errorMessage}`);
      }
      console.error('Google Places error:', error);
      return { suggestions: [], failed: true };
    }

    // Check if we should fallback
    if (data?.fallback || data?.error) {
      // If it's a transient error, throw to retry
      if (data?.code === 'BOOT_ERROR' || data?.code === 'EXCEPTION') {
        throw new Error(`Transient API error: ${data.code}`);
      }
      console.log('Google Places unavailable, will fallback to Mapbox');
      return { suggestions: [], failed: true };
    }

    // Generate new session token after successful use
    googleSessionToken = generateSessionToken();

    const suggestions: LocationSuggestion[] = (data?.suggestions || []).map((s: any) => ({
      streetAddress: s.streetAddress || s.mainText || '',
      city: s.city || '',
      state: s.state || '',
      zip: s.zip || '',
      display: s.description || s.mainText,
      fullAddress: s.description,
      isVerified: false, // Will be verified after selection
      validationLevel: null,
      mapboxId: undefined,
      googlePlaceId: s.placeId,
    }));

    return { suggestions, failed: false };
  };

  // Use retry logic for transient 503/boot errors
  const { result, failed } = await withRetry(makeRequest, MAX_RETRIES, RETRY_DELAY);
  
  if (failed || !result) {
    console.log('Google Places failed after retries, falling back to Mapbox');
    return { suggestions: [], failed: true };
  }
  
  return result;
}

// Mapbox Address Autofill API - FALLBACK source for address suggestions
// Now includes 'place' and 'postcode' types for better ZIP/city coverage
async function searchMapboxAddresses(query: string): Promise<{ suggestions: LocationSuggestion[]; failed: boolean }> {
  const { result, failed } = await withRetry(async () => {
    const res = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&types=address,place,postcode&country=us&language=en&limit=5&session_token=${mapboxSessionToken}&access_token=${MAPBOX_TOKEN}`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!res.ok) {
      throw new Error(`Mapbox API error: ${res.status}`);
    }
    
    return res.json();
  });
  
  if (failed || !result) {
    return { suggestions: [], failed: true };
  }
  
  const suggestions = (result.suggestions || []).map((s: any) => {
    // Mapbox suggest returns: name (street), full_address (complete), place_formatted (city, state, country)
    const streetName = s.name || ''; // e.g., "123 Main Street"
    const fullAddr = s.full_address || ''; // e.g., "123 Main Street, New York, NY 10001, United States"
    const featureType = s.feature_type || 'address';
    
    // Parse from full_address: "123 Main St, New York, NY 10001, United States"
    const parts = fullAddr.split(', ');
    const streetAddress = featureType === 'address' ? (parts[0] || streetName) : '';
    const city = featureType === 'place' ? streetName : (parts.length >= 3 ? parts[1] : '');
    
    // Extract state and zip from "NY 10001" pattern
    const stateZipPart = parts.length >= 3 ? parts[parts.length - 2] : '';
    const stateZipMatch = stateZipPart.match(/^([A-Z]{2})\s*(\d{5})?$/);
    const state = stateZipMatch?.[1] || '';
    const zip = stateZipMatch?.[2] || (featureType === 'postcode' ? streetName : '');
    
    // Display the full address without "United States"
    const displayAddr = fullAddr.replace(', United States', '');
    
    // Check if this has a street address component (not just city/state)
    const hasStreet = featureType === 'address' && streetName && !streetName.match(/^\d{5}$/) && streetName !== city;
    
    return {
      streetAddress,
      city,
      state,
      zip,
      display: displayAddr, // Show full street address in dropdown
      fullAddress: fullAddr,
      isVerified: false, // Will be verified after retrieve
      validationLevel: hasStreet ? null : 'partial' as ValidationLevel,
      mapboxId: s.mapbox_id,
    };
  });
  
  return { suggestions, failed: false };
}

// Google Address Validation API for verified street addresses
async function validateWithGoogle(address: string): Promise<{ 
  address: LocationSuggestion | null; 
  failed: boolean;
  errorCode?: string;
  fallbackToMapbox?: boolean;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('google-address-validation', {
      body: { address }
    });

    if (error) {
      console.error('Google Address Validation error:', error);
      return { address: null, failed: true, errorCode: 'INVOKE_ERROR', fallbackToMapbox: true };
    }

    // Check if we should fallback to Mapbox
    if (data?.fallbackToMapbox || data?.code === 'API_ERROR') {
      console.log('Google API not available, falling back to Mapbox');
      return { address: null, failed: false, errorCode: data?.code, fallbackToMapbox: true };
    }

    if (data?.error || !data?.valid) {
      console.warn('Google validation failed:', data?.error || 'Invalid address');
      return { address: null, failed: false, errorCode: data?.code };
    }

    const { components, formattedAddress, validationLevel: googleLevel } = data;
    
    // Map Google validation levels to our system
    let validationLevel: ValidationLevel;
    if (googleLevel === 'verified') {
      validationLevel = 'verified';
    } else if (googleLevel === 'partial') {
      validationLevel = 'partial';
    } else {
      validationLevel = 'unverifiable';
    }

    return {
      address: {
        streetAddress: components.streetAddress || '',
        city: components.city || '',
        state: components.state || '',
        zip: components.zip || '',
        display: formattedAddress?.replace(', USA', '').replace(', United States', '') || '',
        fullAddress: formattedAddress || '',
        isVerified: validationLevel === 'verified',
        validationLevel,
        mapboxId: undefined, // Not from Mapbox
      },
      failed: false
    };
  } catch (error) {
    console.error('Google Address Validation exception:', error);
    return { address: null, failed: true, errorCode: 'EXCEPTION', fallbackToMapbox: true };
  }
}

// Retrieve full verified address from Mapbox with retry (fallback)
async function retrieveMapboxAddress(mapboxId: string): Promise<{ address: LocationSuggestion | null; failed: boolean }> {
  const { result, failed } = await withRetry(async () => {
    const res = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?session_token=${mapboxSessionToken}&access_token=${MAPBOX_TOKEN}`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!res.ok) {
      throw new Error(`Mapbox retrieve error: ${res.status}`);
    }
    
    // Generate a new session token after retrieve (billing best practice)
    mapboxSessionToken = generateSessionToken();
    
    return res.json();
  });
  
  if (failed || !result) {
    return { address: null, failed: true };
  }
  
  const feature = result.features?.[0];
  if (!feature) {
    return { address: null, failed: false };
  }
  
  const props = feature.properties;
  const context = props.context || {};
  
  // Build the verified full address
  const streetAddress = props.name || '';
  const city = context.place?.name || '';
  const state = context.region?.region_code || '';
  const zip = context.postcode?.name || '';
  const fullAddr = props.full_address || `${streetAddress}, ${city}, ${state} ${zip}`;
  const displayAddr = fullAddr.replace(', United States', '');
  
  // Street-level verification requires an actual street address
  const hasStreet = streetAddress && !streetAddress.match(/^\d{5}$/) && streetAddress !== city;
  
  return {
    address: {
      streetAddress,
      city,
      state,
      zip,
      display: displayAddr, // Full verified address
      fullAddress: fullAddr,
      isVerified: hasStreet,
      validationLevel: hasStreet ? 'verified' : 'partial',
      mapboxId,
    },
    failed: false
  };
}

// Photon API for city-only search (mode="city") - CORS-friendly, fallback
async function searchPhotonCities(query: string): Promise<LocationSuggestion[]> {
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=en&layer=city,town,village`,
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

// Reverse geocode coordinates to address using Mapbox
async function reverseGeocode(lat: number, lng: number): Promise<LocationSuggestion | null> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&types=address&access_token=${MAPBOX_TOKEN}`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!res.ok) return null;
    
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    
    const props = feature.properties;
    const context = props.context || {};
    
    const streetAddress = props.name || '';
    const city = context.place?.name || '';
    const state = context.region?.region_code || '';
    const zip = context.postcode?.name || '';
    const fullAddr = props.full_address || `${streetAddress}, ${city}, ${state} ${zip}`;
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
      mapboxId: feature.id,
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
      // For address mode, try Google Places first, fallback to Mapbox
      const { suggestions: googleSuggestions, failed: googleFailed } = await searchGooglePlaces(query);
      
      if (!googleFailed && googleSuggestions.length > 0) {
        // Use Google Places results
        const filtered = googleSuggestions.filter(s => {
          const normalizedSuggestion = normalizeAddress(s.fullAddress || s.display);
          return normalizedSuggestion !== normalizedQuery;
        });
        setSuggestions(filtered);
      } else {
        // Fallback to Mapbox
        console.log('Using Mapbox fallback for address suggestions');
        const { suggestions: mapboxSuggestions, failed: mapboxFailed } = await searchMapboxAddresses(query);
        
        if (mapboxFailed) {
          toast({
            title: "Address lookup unavailable",
            description: "We're having trouble searching for addresses. Please try again.",
            variant: "destructive",
          });
          setSuggestions([]);
        } else if (mapboxSuggestions.length > 0) {
          // Filter out suggestions that are identical to what's already entered
          const filtered = mapboxSuggestions.filter(s => {
            const normalizedSuggestion = normalizeAddress(s.fullAddress || s.display);
            return normalizedSuggestion !== normalizedQuery;
          });
          setSuggestions(filtered);
        } else if (isCompleteZip) {
          // Fallback: if both return nothing for a ZIP, show city-level with a prompt
          const zipResult = await lookupZip(query.trim());
          if (zipResult) {
            // Mark as partial - needs street address
            zipResult.validationLevel = 'partial';
            // Only show if different from current input
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
    let finalSuggestion = suggestion;
    
    // For address mode, validate with Google Address Validation API first
    if (mode === 'address') {
      setIsValidating(true); // Show loading overlay
      
      // Build address string for Google validation
      const addressToValidate = suggestion.fullAddress || 
        (suggestion.streetAddress 
          ? `${suggestion.streetAddress}, ${suggestion.city}, ${suggestion.state} ${suggestion.zip}`
          : suggestion.display);
      
      // Try Google Address Validation first
      const googleResult = await validateWithGoogle(addressToValidate);
      
      if (!googleResult.failed && !googleResult.fallbackToMapbox && googleResult.address) {
        // Google validation succeeded
        finalSuggestion = googleResult.address;
        
        // Compare user's input with the Google-standardized result
        const currentNormalized = normalizeAddress(value);
        const verifiedNormalized = normalizeAddress(googleResult.address.fullAddress);
        
        if (verifiedNormalized && currentNormalized !== verifiedNormalized) {
          const currentStreetPart = currentNormalized.split(',')[0]?.trim();
          const verifiedStreetPart = verifiedNormalized.split(',')[0]?.trim();
          
          if (currentStreetPart !== verifiedStreetPart) {
            setCorrectionSuggestion(googleResult.address.fullAddress.replace(', USA', '').replace(', United States', ''));
          }
        }
      } else if (suggestion.mapboxId) {
        // Fallback to Mapbox retrieve if Google fails or is unavailable
        console.log('Using Mapbox fallback for address validation');
        const { address: mapboxVerified, failed: mapboxFailed } = await retrieveMapboxAddress(suggestion.mapboxId);
        
        if (!mapboxFailed && mapboxVerified) {
          finalSuggestion = mapboxVerified;
          
          const currentNormalized = normalizeAddress(value);
          const verifiedNormalized = normalizeAddress(mapboxVerified.fullAddress);
          const displayNormalized = normalizeAddress(suggestion.display || suggestion.fullAddress || '');
          
          if (verifiedNormalized && currentNormalized !== verifiedNormalized) {
            const currentStreetPart = currentNormalized.split(',')[0]?.trim();
            const verifiedStreetPart = verifiedNormalized.split(',')[0]?.trim();
            const suggestionStreetPart = displayNormalized.split(',')[0]?.trim();
            
            const isSameStreet = currentStreetPart === verifiedStreetPart;
            const matchesSuggestion = suggestionStreetPart === verifiedStreetPart;
            const inputContainsCorrection = currentNormalized.includes(verifiedStreetPart);
            
            if (!isSameStreet && !matchesSuggestion && !inputContainsCorrection) {
              setCorrectionSuggestion(mapboxVerified.fullAddress.replace(', United States', ''));
            }
          }
        }
      }
      
      setIsValidating(false); // Hide loading overlay
    }
    
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
                    key={`${suggestion.mapboxId || suggestion.zip}-${idx}`}
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
