import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, ChevronLeft, MapPin, Home, Building2,
  ArrowUpDown, HelpCircle, Footprints, Check, MoveVertical, Sparkles,
  Route, Truck
} from "lucide-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import logoImg from "@/assets/logo.png";
import ChatModal from "@/components/chat/ChatModal";
import MultiStopWizard, { type MultiStopMoveDetails } from "./MultiStopWizard";
import type { StopLocation } from "./MultiStopLocationList";
import { formatPhoneNumber, isValidPhoneNumber } from "@/lib/phoneFormat";

export interface ExtendedMoveDetails {
  // Contact
  name: string;
  phone: string;
  email: string;
  
  // From Location
  fromLocation: string;
  fromPropertyType: 'house' | 'apartment' | '';
  fromFloor: number;
  fromHasElevator: boolean;
  
  // To Location
  toLocation: string;
  toPropertyType: 'house' | 'apartment' | '';
  toFloor: number;
  toHasElevator: boolean;
  
  // Other
  homeSize: string;
  toHomeSize: string;
  moveDate: Date | null;
  
  // Additional Services
  hasVehicleTransport: boolean;
  needsPackingService: boolean;
  
  // Multi-stop support
  isMultiStop: boolean;
  pickupLocations: StopLocation[];
  dropoffLocations: StopLocation[];
  optimizedRoute?: {
    totalDistance: number;
    totalDuration: number;
    savings: { distancePercent: number; durationPercent: number };
    optimizedOrder: number[];
  } | null;
}

interface EstimateWizardProps {
  onComplete: (details: ExtendedMoveDetails) => void;
  initialDetails?: ExtendedMoveDetails | null;
}

const HOME_SIZES = [
  { label: "Studio", value: "studio" },
  { label: "1 BR", value: "1br" },
  { label: "2 BR", value: "2br" },
  { label: "3 BR", value: "3br" },
  { label: "4+ BR", value: "4br+" },
  { label: "Other", value: "other" },
];

const FLOOR_OPTIONS = [
  { label: "Ground/1st", value: 1 },
  { label: "2nd", value: 2 },
  { label: "3rd", value: 3 },
  { label: "4th+", value: 4 },
];


export default function EstimateWizard({ onComplete, initialDetails }: EstimateWizardProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [showMultiStopWizard, setShowMultiStopWizard] = useState(false);
  const prevStep = useRef(1);
  
  // Handle "View Route" navigation to tracking page
  const handleViewRoute = () => {
    if (details.fromLocation && details.toLocation) {
      localStorage.setItem('trumove_pending_route', JSON.stringify({
        originAddress: details.fromLocation,
        destAddress: details.toLocation,
      }));
      navigate('/site/track');
    }
  };

  useEffect(() => {
    prevStep.current = step;
  }, [step]);
  
  const [details, setDetails] = useState<ExtendedMoveDetails>({
    name: '',
    phone: '',
    email: '',
    fromLocation: '',
    fromPropertyType: '',
    fromFloor: 1,
    fromHasElevator: false,
    toLocation: '',
    toPropertyType: '',
    toFloor: 1,
    toHasElevator: false,
    homeSize: '',
    toHomeSize: '',
    moveDate: null,
    hasVehicleTransport: false,
    needsPackingService: false,
    isMultiStop: false,
    pickupLocations: [],
    dropoffLocations: [],
    optimizedRoute: null,
  });

  // Auto-populate from homepage form data stored in localStorage
  useEffect(() => {
    const storedLead = localStorage.getItem("tm_lead");
    if (storedLead) {
      try {
        const lead = JSON.parse(storedLead);
        
        // Helper to map homepage size values to wizard values
        const mapHomeSize = (size: string): string => {
          const sizeMap: Record<string, string> = {
            'Studio': 'studio',
            '1 Bedroom': '1br',
            '2 Bedroom': '2br',
            '3 Bedroom': '3br',
            '4+ Bedroom': '4br+',
            'Office': '2br',
          };
          return sizeMap[size] || '';
        };
        
        setDetails(prev => ({
          ...prev,
          name: lead.name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          // Use full address display if available, otherwise construct from city+zip
          fromLocation: lead.fromLocationDisplay || (lead.fromCity ? `${lead.fromCity} ${lead.fromZip}` : lead.fromZip || ''),
          toLocation: lead.toLocationDisplay || (lead.toCity ? `${lead.toCity} ${lead.toZip}` : lead.toZip || ''),
          homeSize: mapHomeSize(lead.size) || '',
          moveDate: lead.moveDate ? new Date(lead.moveDate) : null,
          // Restore property type and floor info
          fromPropertyType: lead.propertyType || '',
          fromFloor: lead.floor || 1,
          fromHasElevator: lead.hasElevator || false,
        }));
        
        // Clear the stored data after use
        localStorage.removeItem("tm_lead");
      } catch (e) {
        console.error("Failed to parse stored lead data:", e);
      }
    }
  }, []);

  // Auto-populate destination home size from origin home size when entering step 2
  useEffect(() => {
    if (step === 2 && !details.toHomeSize && details.homeSize) {
      setDetails(prev => ({ ...prev, toHomeSize: prev.homeSize }));
    }
  }, [step, details.homeSize, details.toHomeSize]);

  const updateDetails = useCallback((updates: Partial<ExtendedMoveDetails>) => {
    setDetails(prev => ({ ...prev, ...updates }));
  }, []);

  const canContinue = () => {
    switch (step) {
      case 1:
        return details.fromLocation && details.fromPropertyType && details.homeSize;
      case 2:
        return details.toLocation && details.toPropertyType && details.toHomeSize;
      case 3:
        return details.name.trim() && details.phone.trim() && details.email.includes('@');
      default:
        return false;
    }
  };

  const goNext = () => {
    if (canContinue()) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        onComplete(details);
      }
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canContinue()) {
      e.preventDefault();
      goNext();
    }
  };

  // Handle multi-stop wizard completion
  const handleMultiStopComplete = useCallback((multiStopDetails: MultiStopMoveDetails) => {
    setDetails(prev => ({
      ...prev,
      isMultiStop: true,
      pickupLocations: multiStopDetails.pickupLocations,
      dropoffLocations: multiStopDetails.dropoffLocations,
      optimizedRoute: multiStopDetails.optimizedRoute,
      // Set fromLocation and toLocation from first pickup/dropoff for compatibility
      fromLocation: multiStopDetails.pickupLocations[0]?.address || prev.fromLocation,
      toLocation: multiStopDetails.dropoffLocations[0]?.address || prev.toLocation,
    }));
    setShowMultiStopWizard(false);
    // Skip to step 2 or continue with property details
  }, []);

  return (
    <>
      {showMultiStopWizard ? (
        <div className="tru-floating-form-card p-4">
          <MultiStopWizard
            onComplete={handleMultiStopComplete}
            onBack={() => setShowMultiStopWizard(false)}
            initialPickups={details.pickupLocations.length > 0 ? details.pickupLocations : undefined}
            initialDropoffs={details.dropoffLocations.length > 0 ? details.dropoffLocations : undefined}
          />
        </div>
      ) : (
        <div className="tru-floating-form-card">
          {/* Progress Bar - no accent stripe */}
          
          {/* Progress Bar */}
          <div className="tru-form-progress-bar">
            <div 
              className="tru-form-progress-fill" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          
          {/* Header - Matching homepage style */}
           <div className="tru-summary-header-large">
             <div className="text-center flex-1">
               <h3 className="text-lg font-black text-foreground">
                 Where are you <span className="tru-qb-title-accent">moving</span> from?
               </h3>
             </div>
           </div>

          <div className="tru-floating-form-content">
            {/* Step 1: Moving FROM Details + Parking */}
            {step === 1 && (
            <div className="tru-qb-step-content" key="step-1">

              <p className="tru-qb-section-label">Current Address</p>
              <div className="tru-qb-input-wrap tru-qb-zip-wrap">
                <LocationAutocomplete
                  value={details.fromLocation}
                  onValueChange={(val) => updateDetails({ fromLocation: val })}
                  onLocationSelect={(displayAddr, zip, fullAddress) => updateDetails({ fromLocation: fullAddress || displayAddr })}
                  placeholder="Address, City, or ZIP"
                  onKeyDown={handleKeyDown}
                  className="tru-qb-input"
                  mode="address"
                  showHelperText
                  showGeolocation
                />
              </div>

              <p className="tru-qb-section-label">Property Type</p>
              <div className="tru-qb-toggles">
                <button
                  type="button"
                  className={`tru-qb-toggle-card ${details.fromPropertyType === 'house' ? 'is-active' : ''}`}
                  onClick={() => updateDetails({ fromPropertyType: 'house' })}
                >
                  <Home className="tru-qb-toggle-icon" />
                  <div className="tru-qb-toggle-content">
                    <span className="tru-qb-toggle-title">House</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`tru-qb-toggle-card ${details.fromPropertyType === 'apartment' ? 'is-active' : ''}`}
                  onClick={() => updateDetails({ fromPropertyType: 'apartment' })}
                >
                  <Building2 className="tru-qb-toggle-icon" />
                  <div className="tru-qb-toggle-content">
                    <span className="tru-qb-toggle-title">Apartment</span>
                  </div>
                </button>
              </div>

              {/* Expandable apartment options with smooth animation */}
              <div className={`tru-expandable-section ${details.fromPropertyType === 'apartment' ? 'is-expanded' : ''}`}>
                <div className="tru-expandable-content">
                  <p className="tru-qb-section-label">What floor?</p>
                  <div className="tru-qb-size-grid">
                    {FLOOR_OPTIONS.map((floor) => (
                      <button
                        key={floor.value}
                        type="button"
                        className={`tru-qb-size-btn ${details.fromFloor === floor.value ? 'is-active' : ''}`}
                        onClick={() => updateDetails({ fromFloor: floor.value })}
                      >
                        {floor.label}
                      </button>
                    ))}
                  </div>

                  <p className="tru-qb-section-label">Access type</p>
                  <div className="tru-qb-toggles">
                    <button
                      type="button"
                      className={`tru-qb-toggle-card ${!details.fromHasElevator ? 'is-active' : ''}`}
                      onClick={() => updateDetails({ fromHasElevator: false })}
                    >
                      <MoveVertical className="tru-qb-toggle-icon" />
                      <div className="tru-qb-toggle-content">
                        <span className="tru-qb-toggle-title">Stairs</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`tru-qb-toggle-card ${details.fromHasElevator ? 'is-active' : ''}`}
                      onClick={() => updateDetails({ fromHasElevator: true })}
                    >
                      <ArrowUpDown className="tru-qb-toggle-icon" />
                      <div className="tru-qb-toggle-content">
                        <span className="tru-qb-toggle-title">Elevator</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <p className="tru-qb-section-label">Home Size</p>
              <div className="tru-qb-size-grid">
                {HOME_SIZES.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    className={`tru-qb-size-btn ${details.homeSize === size.value ? 'is-active' : ''}`}
                    onClick={() => updateDetails({ homeSize: size.value })}
                  >
                    {size.label}
                  </button>
                ))}
              </div>


              <button
                type="button"
                className="tru-qb-continue"
                disabled={!canContinue()}
                onClick={goNext}
              >
                <span>Next Step</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Moving TO Details + Parking */}
          {step === 2 && (
            <div className="tru-qb-step-content" key="step-2">
              <h1 className="tru-qb-question">Where are you moving to?</h1>
              <p className="tru-qb-subtitle">Enter your destination address details</p>

              <div className="tru-qb-input-wrap tru-qb-zip-wrap">
                <LocationAutocomplete
                  value={details.toLocation}
                  onValueChange={(val) => updateDetails({ toLocation: val })}
                  onLocationSelect={(displayAddr, zip, fullAddress) => updateDetails({ toLocation: fullAddress || displayAddr })}
                  placeholder="Address, City, or ZIP"
                  onKeyDown={handleKeyDown}
                  className="tru-qb-input"
                  mode="address"
                  showHelperText
                  showGeolocation
                />
              </div>

              <p className="tru-qb-section-label">Property Type</p>
              <div className="tru-qb-toggles">
                <button
                  type="button"
                  className={`tru-qb-toggle-card ${details.toPropertyType === 'house' ? 'is-active' : ''}`}
                  onClick={() => updateDetails({ toPropertyType: 'house' })}
                >
                  <Home className="tru-qb-toggle-icon" />
                  <div className="tru-qb-toggle-content">
                    <span className="tru-qb-toggle-title">House</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`tru-qb-toggle-card ${details.toPropertyType === 'apartment' ? 'is-active' : ''}`}
                  onClick={() => updateDetails({ toPropertyType: 'apartment' })}
                >
                  <Building2 className="tru-qb-toggle-icon" />
                  <div className="tru-qb-toggle-content">
                    <span className="tru-qb-toggle-title">Apartment</span>
                  </div>
                </button>
              </div>

              {/* Expandable apartment options with smooth animation */}
              <div className={`tru-expandable-section ${details.toPropertyType === 'apartment' ? 'is-expanded' : ''}`}>
                <div className="tru-expandable-content">
                  <p className="tru-qb-section-label">What floor?</p>
                  <div className="tru-qb-size-grid">
                    {FLOOR_OPTIONS.map((floor) => (
                      <button
                        key={floor.value}
                        type="button"
                        className={`tru-qb-size-btn ${details.toFloor === floor.value ? 'is-active' : ''}`}
                        onClick={() => updateDetails({ toFloor: floor.value })}
                      >
                        {floor.label}
                      </button>
                    ))}
                  </div>

                  <p className="tru-qb-section-label">Access type</p>
                  <div className="tru-qb-toggles">
                    <button
                      type="button"
                      className={`tru-qb-toggle-card ${!details.toHasElevator ? 'is-active' : ''}`}
                      onClick={() => updateDetails({ toHasElevator: false })}
                    >
                      <MoveVertical className="tru-qb-toggle-icon" />
                      <div className="tru-qb-toggle-content">
                        <span className="tru-qb-toggle-title">Stairs</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`tru-qb-toggle-card ${details.toHasElevator ? 'is-active' : ''}`}
                      onClick={() => updateDetails({ toHasElevator: true })}
                    >
                      <ArrowUpDown className="tru-qb-toggle-icon" />
                      <div className="tru-qb-toggle-content">
                        <span className="tru-qb-toggle-title">Elevator</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <p className="tru-qb-section-label">Home Size</p>
              <div className="tru-qb-size-grid">
                {HOME_SIZES.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    className={`tru-qb-size-btn ${details.toHomeSize === size.value ? 'is-active' : ''}`}
                    onClick={() => updateDetails({ toHomeSize: size.value })}
                  >
                    {size.label}
                  </button>
                ))}
              </div>


              <button
                type="button"
                className="tru-qb-continue"
                disabled={!canContinue()}
                onClick={goNext}
              >
                <span>Next Step</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              {/* View Route Button - Navigate to tracking page */}
              {details.fromLocation && details.toLocation && (
                <button
                  type="button"
                  className="w-full py-2.5 text-sm text-muted-foreground hover:text-primary border border-dashed border-border/50 hover:border-primary/50 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                  onClick={handleViewRoute}
                >
                  <Truck className="w-4 h-4" />
                  <span>View Route on Map</span>
                </button>
              )}

              <button type="button" className="tru-qb-back" onClick={goBack}>
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          )}

          {/* Step 3: Contact Information (Final Step) */}
          {step === 3 && (
            <div className="tru-qb-step-content" key="step-3">
              <h1 className="tru-qb-question">Almost done! How can we reach you?</h1>
              <p className="tru-qb-subtitle">We'll send your personalized quote</p>

              <div className="tru-qb-contact-fields">
                <div className="tru-qb-input-wrap">
                  <input
                    type="text"
                    value={details.name}
                    onChange={(e) => updateDetails({ name: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="Full Name"
                    className="tru-qb-input"
                    autoFocus
                  />
                </div>

                <div className="tru-qb-input-wrap">
                  <input
                    type="tel"
                    value={details.phone}
                    onChange={(e) => updateDetails({ phone: formatPhoneNumber(e.target.value) })}
                    onKeyDown={handleKeyDown}
                    placeholder="(555) 123-4567"
                    className="tru-qb-input"
                  />
                </div>

                <div className="tru-qb-input-wrap">
                  <input
                    type="email"
                    value={details.email}
                    onChange={(e) => updateDetails({ email: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="Email Address"
                    className="tru-qb-input"
                  />
                </div>
              </div>

              <button
                type="button"
                className="tru-qb-continue"
                disabled={!canContinue()}
                onClick={goNext}
              >
                <span>Get My Quote</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button type="button" className="tru-qb-back" onClick={goBack}>
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          )}
        </div>

          {/* Footer inside form card */}
          <div className="tru-floating-form-footer">
            <span>Powered by</span>
            <img src={logoImg} alt="TruMove" className="tru-footer-mini-logo" />
          </div>
        </div>
      )}

      {/* Chat Modal */}
      <ChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
