import { useState, useCallback, useMemo, useRef, useEffect } from "react";


// Scroll to top on mount
const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import SiteShell from "@/components/layout/SiteShell";
import MapboxMoveMap from "@/components/MapboxMoveMap";
import AnimatedRouteMap from "@/components/estimate/AnimatedRouteMap";
import FloatingNav from "@/components/FloatingNav";
import HeroParticles from "@/components/HeroParticles";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import RouteAnalysisSection from "@/components/RouteAnalysisSection";
// Static Street View preview used instead of interactive component
import FeatureCarousel from "@/components/FeatureCarousel";
import FeatureTrustStrip from "@/components/FeatureTrustStrip";
import StatsStrip from "@/components/StatsStrip";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

import logoImg from "@/assets/logo.png";
import eldMapImg from "@/assets/eld-map.jpg";
import trackingLifestyleImg from "@/assets/tracking-lifestyle.png";

// Preview images for value cards
import previewAiScanner from "@/assets/preview-ai-scanner.jpg";
import previewCarrierVetting from "@/assets/preview-carrier-vetting.jpg";
import trudyVideoCall from "@/assets/trudy-video-call.jpg";
import previewPropertyLookup from "@/assets/preview-property-lookup.jpg";
import sampleRoomLiving from "@/assets/sample-room-living.jpg";
import scanRoomPreview from "@/assets/scan-room-preview.jpg";
import heroFamilyMove from "@/assets/hero-family-move.jpg";
import videoConsultPreview from "@/assets/video-consult-preview.jpg";
import trudyVoicePreview from "@/assets/trudy-voice-preview.jpg";
import contactAgentImg from "@/assets/contact-agent.png";
import testimonialSarah from "@/assets/testimonial-sarah.jpg";
import testimonialJames from "@/assets/testimonial-james.jpg";
import testimonialEmilyDavid from "@/assets/testimonial-emily-david.jpg";
import testimonialMarcus from "@/assets/testimonial-marcus.jpg";
import testimonialLisa from "@/assets/testimonial-lisa.jpg";
import testimonialCarlosAna from "@/assets/testimonial-carlos-ana.jpg";

import { Mic } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel";

import { calculateDistance } from "@/lib/distanceCalculator";
import { formatPhoneNumber, isValidPhoneNumber, getDigitsOnly } from "@/lib/phoneFormat";
import { calculateEstimate, formatCurrency } from "@/lib/priceCalculator";
import {
  Shield, Video, Boxes, CheckCircle, Info, FileText,
  MapPin, Route, Clock, DollarSign, Headphones, Phone, ArrowRight, ArrowDown, ArrowUp,
  CalendarIcon, ChevronLeft, Lock, Truck, Sparkles, Star, Users,
  Database, ChevronRight, Radar, CreditCard, ShieldCheck, BarChart3, Zap,
  Home, Building2, MoveVertical, ArrowUpDown, Scan, ChevronUp, ChevronDown, Camera, Globe,
  Play, Pause, MapPinned, Calendar, Mail, MessageSquare, AlertTriangle, XCircle, Search } from
"lucide-react";
import { MOCK_CARRIERS } from "@/data/mockCarriers";


// ZIP lookup
const ZIP_LOOKUP: Record<string, string> = {
  "90210": "Beverly Hills, CA", "90001": "Los Angeles, CA", "10001": "New York, NY",
  "10016": "New York, NY", "77001": "Houston, TX", "60601": "Chicago, IL",
  "33101": "Miami, FL", "85001": "Phoenix, AZ", "98101": "Seattle, WA",
  "80201": "Denver, CO", "02101": "Boston, MA", "20001": "Washington, DC",
  "33431": "Boca Raton, FL", "33432": "Boca Raton, FL", "33433": "Boca Raton, FL"
};

async function lookupZip(zip: string): Promise<string | null> {
  if (ZIP_LOOKUP[zip]) return ZIP_LOOKUP[zip];
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (res.ok) {
      const data = await res.json();
      return `${data.places[0]["place name"]}, ${data.places[0]["state abbreviation"]}`;
    }
  } catch {}
  return null;
}


// Geocode a location string to coordinates for static map images
async function geocodeLocation(location: string): Promise<[number, number] | null> {
  try {
    const token = 'pk.eyJ1IjoibWF4d2VzdDUyNSIsImEiOiJjbWtuZTY0cTgwcGIzM2VweTN2MTgzeHc3In0.nlM6XCog7Y0nrPt-5v-E2g';
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?country=us&limit=1&access_token=${token}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return [lng, lat];
      }
    }
  } catch {}
  return null;
}

const MOVE_SIZES = [
{ label: "Studio", value: "Studio" },
{ label: "1 Bed", value: "1 Bedroom" },
{ label: "2 Bed", value: "2 Bedroom" },
{ label: "3 Bed", value: "3 Bedroom" },
{ label: "4+ Bed", value: "4+ Bedroom" },
{ label: "Office", value: "Office" }];


const FLOOR_OPTIONS = [
{ label: "Ground/1st", value: 1 },
{ label: "2nd", value: 2 },
{ label: "3rd", value: 3 },
{ label: "4th+", value: 4 }];


// AI Messages based on context
function getAiHint(step: number, fromCity: string, toCity: string, distance: number, moveDate: Date | null): string {
  switch (step) {
    case 2:
      return "";
    case 3:
      if (distance > 0) {
        return `🚛 ${distance.toLocaleString()} miles — analyzing best carriers for this route`;
      }
      return "";
    case 4:
      if (moveDate) {
        const month = format(moveDate, 'MMMM');
        const isLowSeason = [0, 1, 2, 10, 11].includes(moveDate.getMonth());
        if (isLowSeason) {
          return `📅 ${month} — typically 15-20% lower rates`;
        }
        return `📅 ${month} — peak season, finding competitive rates`;
      }
      return "";
    case 5:
      return "📦 Select size to calculate your estimate";
    case 6:
      return "";
    default:
      return "";
  }
}

// Demo items for live scan preview
const SCAN_DEMO_ITEMS = [
{ name: "3-Seat Sofa", weight: 350, cuft: 45, image: "/inventory/living-room/sofa-3-cushion.png" },
{ name: "Coffee Table", weight: 45, cuft: 8, image: "/inventory/living-room/coffee-table.png" },
{ name: "TV Stand", weight: 80, cuft: 12, image: "/inventory/living-room/tv-stand.png" },
{ name: "Armchair", weight: 85, cuft: 18, image: "/inventory/living-room/armchair.png" },
{ name: "Floor Lamp", weight: 15, cuft: 4, image: "/inventory/living-room/lamp-floor.png" }];


// Move Summary Modal - Hero Right Side
import { X } from "lucide-react";

interface MoveSummaryModalProps {
  fromCity: string;
  toCity: string;
  distance: number;
  fromCoords: [number, number] | null;
  toCoords: [number, number] | null;
  moveDate?: Date | null;
  estimatedDuration?: string;
  onClose?: () => void;
}

import React from "react";

const MoveSummaryModal = React.forwardRef<HTMLDivElement, MoveSummaryModalProps>(({
  fromCity,
  toCity,
  distance,
  fromCoords,
  toCoords,
  moveDate,
  estimatedDuration,
  onClose
}, ref) => {
  const hasData = fromCity || toCity;
  if (!hasData) return null;

  const MAPBOX_TOKEN = 'pk.eyJ1IjoibWF4d2VzdDUyNSIsImEiOiJjbWtuZTY0cTgwcGIzM2VweTN2MTgzeHc3In0.nlM6XCog7Y0nrPt-5v-E2g';

  return (
    <div className="tru-move-summary-modal" ref={ref}>
      {/* Close Button */}
      {onClose &&
      <button
        onClick={onClose}
        className="tru-move-summary-close"
        aria-label="Close move summary">
        
          <X className="w-4 h-4" />
        </button>
      }
      
      {/* Header with Sparkle */}
      <div className="tru-move-summary-header">
        <Sparkles className="w-5 h-5" />
        <h3>Building your personalized move profile</h3>
      </div>
      
      {/* Subtitle */}
      <p className="tru-move-summary-subtitle">
        We validate cities, analyze distance and access, prepare carrier matching, and estimate weight and volume.
      </p>
      
      <div className="tru-move-summary-grid">
        {/* Origin */}
        <div className="tru-move-summary-location">
          <div className="tru-move-summary-map tru-move-summary-map-lg">
            {fromCoords ?
            <img
              src={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${fromCoords[0]},${fromCoords[1]},14,0/280x280@2x?access_token=${MAPBOX_TOKEN}`}
              alt="Origin satellite view" /> :


            <div className="tru-move-summary-map-placeholder">
                <MapPin className="w-6 h-6" />
              </div>
            }
          </div>
          <div className="tru-move-summary-location-info">
            <span className="label">Origin</span>
            <span className="value">{fromCity || "Enter origin..."}</span>
          </div>
        </div>
        
        {/* Distance Badge - Green on Black - Only show when both cities entered */}
        <div className="tru-move-summary-distance">
          <Route className="w-4 h-4" />
          <span className="tru-move-summary-mileage">
            {fromCity && toCity && distance > 0 ? `${distance.toLocaleString()} mi` : "— mi"}
          </span>
        </div>
        
        {/* Destination */}
        <div className="tru-move-summary-location">
          <div className="tru-move-summary-map tru-move-summary-map-lg">
            {toCoords ?
            <img
              src={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${toCoords[0]},${toCoords[1]},14,0/280x280@2x?access_token=${MAPBOX_TOKEN}`}
              alt="Destination satellite view" /> :


            <div className="tru-move-summary-map-placeholder">
                <Truck className="w-6 h-6" />
              </div>
            }
          </div>
          <div className="tru-move-summary-location-info">
            <span className="label">Destination</span>
            <span className="value">{toCity || "Enter destination..."}</span>
          </div>
        </div>
      </div>
      
      {/* Move Date & ETA Row */}
      {(moveDate || estimatedDuration) &&
      <div className="tru-move-summary-details">
          {moveDate &&
        <div className="tru-move-summary-detail">
              <Calendar className="w-4 h-4" />
              <span>{format(moveDate, "MMM d, yyyy")}</span>
            </div>
        }
          {estimatedDuration &&
        <div className="tru-move-summary-detail">
              <Clock className="w-4 h-4" />
              <span>ETA: {estimatedDuration}</span>
            </div>
        }
        </div>
      }
      
      {/* Status Indicators */}
      <div className="tru-move-summary-status">
        <div className={`tru-move-summary-status-item ${fromCity && toCity ? 'is-complete' : ''}`}>
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Cities validated</span>
        </div>
        <div className={`tru-move-summary-status-item ${fromCity && toCity && distance > 0 ? 'is-complete' : ''}`}>
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Distance calculated</span>
        </div>
        <div className={`tru-move-summary-status-item ${fromCity && toCity ? 'is-complete' : ''}`}>
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Carrier matching ready</span>
        </div>
      </div>
    </div>);

});

MoveSummaryModal.displayName = "MoveSummaryModal";

// Furniture positions for detection overlay on sample living room image
const FURNITURE_POSITIONS = [
{ id: 0, name: "Sofa", confidence: 98, top: "42%", left: "1%", width: "34%", height: "50%" },
{ id: 1, name: "Coffee Table", confidence: 96, top: "64%", left: "32%", width: "22%", height: "16%" },
{ id: 2, name: "TV Console", confidence: 97, top: "32%", left: "28%", width: "36%", height: "26%" },
{ id: 3, name: "Armchair", confidence: 94, top: "42%", left: "70%", width: "24%", height: "42%" },
{ id: 4, name: "Floor Lamp", confidence: 91, top: "16%", left: "60%", width: "7%", height: "44%" }];


// Scanner Component - Center column
interface ScannerPreviewProps {
  isRunning: boolean;
  onStartDemo: () => void;
  visibleCount: number;
}

function ScannerPreview({ isRunning, onStartDemo, visibleCount }: ScannerPreviewProps) {
  return (
    <div className="tru-ai-live-scanner">
      <img src={sampleRoomLiving} alt="Room being scanned" />
      {isRunning &&
      <>
          <div className="tru-ai-scanner-overlay">
            <div className="tru-ai-scanner-line" />
          </div>
          {/* Furniture detection boxes */}
          {FURNITURE_POSITIONS.slice(0, visibleCount).map((item) =>
        <div
          key={item.id}
          className="tru-ai-detection-box"
          style={{
            top: item.top,
            left: item.left,
            width: item.width,
            height: item.height
          }}>
          
              <span className="tru-ai-detection-corner tru-ai-corner-tl" />
              <span className="tru-ai-detection-corner tru-ai-corner-tr" />
              <span className="tru-ai-detection-corner tru-ai-corner-bl" />
              <span className="tru-ai-detection-corner tru-ai-corner-br" />
              <span className="tru-ai-detection-label">
                {item.name}
                <span className="tru-ai-detection-confidence">{item.confidence}%</span>
              </span>
            </div>
        )}
        </>
      }
      {/* Start Demo button as overlay - top right */}
      <button
        className="tru-ai-scanner-start-btn"
        onClick={onStartDemo}>
        
        <Sparkles className="w-3.5 h-3.5 text-[#49fc03]" />
        {isRunning ? "Running..." : "Start AI Analysis Demo"}
      </button>
    </div>);

}

// Detection List Component - Right column
interface DetectionListProps {
  visibleCount: number;
}

function DetectionList({ visibleCount }: DetectionListProps) {
  const isRunning = visibleCount > 0;
  // Show all items as samples when not running, otherwise show detected items
  const displayItems = isRunning ? SCAN_DEMO_ITEMS.slice(0, visibleCount) : SCAN_DEMO_ITEMS;
  const totalWeight = displayItems.reduce((sum, item) => sum + item.weight, 0);
  const totalCuFt = displayItems.reduce((sum, item) => sum + item.cuft, 0);

  return (
    <div className="tru-ai-live-inventory">
      <div className="tru-ai-live-header">
        <Sparkles className="w-4 h-4" />
        <span>Live Inventory Detection</span>
      </div>
      <div className={`tru-ai-live-items ${!isRunning ? 'is-sample' : ''}`}>
        {displayItems.map((item, i) =>
        <div
          key={`${item.name}-${i}`}
          className={`tru-ai-live-item ${!isRunning ? 'is-sample' : ''}`}
          style={{ animationDelay: isRunning ? `${i * 0.1}s` : '0s' }}>
          
            <img src={item.image} alt={item.name} />
            <span className="tru-ai-live-item-name">{item.name}</span>
            <span className="tru-ai-live-item-weight">{item.weight} lbs</span>
          </div>
        )}
      </div>
      <div className="tru-ai-live-totals">
        <span>
          <span className="tru-ai-total-label">Items:</span> {displayItems.length}
        </span>
        <span>
          <span className="tru-ai-total-label">Weight:</span> {totalWeight} lbs
        </span>
        <span>
          <span className="tru-ai-total-label">Volume:</span> {totalCuFt} cu ft
        </span>
      </div>
    </div>);

}

// Tracking Preview Component - Left column (mirrored layout)
// Sample route: New York, NY to Los Angeles, CA (cross-country)
const SAMPLE_ROUTE = {
  origin: { lat: 40.7128, lng: -74.0060, name: "New York, NY" },
  destination: { lat: 34.0522, lng: -118.2437, name: "Los Angeles, CA" },
  truckPosition: { lat: 39.0997, lng: -94.5786 }, // Kansas City, MO - midpoint
  distance: "2,789 mi",
  eta: "41h 15m",
  traffic: "Light",
  weather: "58°F Clear"
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoibWF4d2VzdDUyNSIsImEiOiJjbWtuZTY0cTgwcGIzM2VweTN2MTgzeHc3In0.nlM6XCog7Y0nrPt-5v-E2g';

// Supabase URL for edge function proxying
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nhoagucgcqjfbtifykha.supabase.co';

// Route waypoints from NY to LA (simplified path)
const ROUTE_WAYPOINTS = [
{ lat: 40.7128, lng: -74.0060 }, // NYC
{ lat: 40.4406, lng: -79.9959 }, // Pittsburgh
{ lat: 39.7684, lng: -86.1581 }, // Indianapolis
{ lat: 38.6270, lng: -90.1994 }, // St. Louis
{ lat: 39.0997, lng: -94.5786 }, // Kansas City
{ lat: 35.4676, lng: -97.5164 }, // Oklahoma City
{ lat: 35.0844, lng: -106.6504 }, // Albuquerque
{ lat: 33.4484, lng: -112.0740 }, // Phoenix
{ lat: 34.0522, lng: -118.2437 } // LA
];

// Note: useTruckAnimation hook preserved for use on other pages (e.g., live tracking)
// Homepage now uses static demo preview - no animation needed

// Shipment Tracker Section - Compact ELD verification layout
function ShipmentTrackerSection({ navigate }: {navigate: (path: string) => void;}) {
  const animationRef = useRef<number>();
  const [truckProgress, setTruckProgress] = useState(0);

  useEffect(() => {
    let p = 0;
    const tick = () => {
      p += 0.0003;
      if (p > 1) p = 0;
      setTruckProgress(p);
      animationRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => {if (animationRef.current) cancelAnimationFrame(animationRef.current);};
  }, []);

  // Route definitions for SVG overlay — recalibrated to map image
  const routes = useMemo(() => [
  {
    color: 'hsl(142, 71%, 45%)',
    startLabel: 'Los Angeles', endLabel: 'New York',
    offset: 0, speed: 1,
    // LA (SW California) → across southern states → up to NYC (NE coast)
    pts: [[100, 215], [145, 208], [195, 198], [250, 185], [305, 170], [355, 155], [400, 135], [445, 120], [485, 110], [525, 100], [555, 92]] as [number, number][]
  },
  {
    color: 'hsl(35, 90%, 55%)',
    startLabel: 'Seattle', endLabel: 'Denver',
    offset: 0.6, speed: 0.7,
    // Seattle (WA, NW corner) → SE to Denver (CO, central)
    pts: [[88, 42], [110, 65], [138, 90], [168, 115], [198, 135], [225, 150], [248, 158]] as [number, number][]
  },
  {
    color: 'hsl(280, 65%, 60%)',
    startLabel: 'Dallas', endLabel: 'Atlanta',
    offset: 0.15, speed: 0.9,
    // Dallas (N Texas) → east to Atlanta (N Georgia)
    pts: [[300, 248], [335, 238], [370, 225], [405, 215], [440, 208], [460, 205]] as [number, number][]
  }], []);

  // Helper: build smooth SVG path from points
  const buildPath = (pts: [number, number][]) => {
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const xc = (pts[i][0] + pts[i + 1][0]) / 2;
      const yc = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ` Q ${pts[i][0]} ${pts[i][1]} ${xc} ${yc}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last[0]} ${last[1]}`;
    return d;
  };

  // Get truck position along route
  const getTruckPos = (pts: [number, number][], progress: number): [number, number] => {
    const segs = pts.length - 1;
    const sf = progress * segs;
    const si = Math.min(Math.floor(sf), segs - 1);
    const t = sf - si;
    return [
    pts[si][0] + (pts[si + 1][0] - pts[si][0]) * t,
    pts[si][1] + (pts[si + 1][1] - pts[si][1]) * t];

  };

  return (
    <section className="tru-ai-steps-section" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div className="tru-ai-steps-inner">
        <div className="flex flex-col lg:flex-row items-end justify-center gap-10 lg:gap-16 w-full">
          {/* Lifestyle image - left */}
          <div className="hidden lg:flex items-end flex-shrink-0">
            <div className="rounded-xl overflow-hidden">
              <img src={trackingLifestyleImg} alt="Customer tracking their move in real-time" className="h-auto block" style={{ height: 'calc(600px * 0.567)', width: 'auto' }} />
            </div>
          </div>

          {/* Headline + CTA - center */}
          <div className="flex flex-col items-center text-center gap-4 bg-card p-8 border-0 shadow-none rounded-none">
            <div className="tru-ai-headline-block">
              <h2 className="tru-ai-main-headline text-5xl md:text-6xl">
                Real-Time<br />
                <span className="tru-ai-headline-accent">Shipment Tracking.</span>
              </h2>
              <p className="tru-ai-subheadline text-lg">
                Stay up to date and track your belongings across the country with real-time GPS tracking of your goods.
              </p>
            </div>
            
            <button onClick={() => navigate("/site/track")} className="tru-ai-cta-btn">
              <MapPin className="w-4 h-4 text-[#49fe01]" />
              Track Shipment
              <ArrowRight className="w-4 h-4 text-[#48ff00]" />
            </button>
          </div>



        </div>
      </div>
    </section>);

}

// Trust Compact Section with scroll-triggered staggered reveal
function TrustCompactSection() {
  const [sectionRef, isInView] = useScrollAnimation<HTMLElement>({
    threshold: 0.2,
    rootMargin: "0px",
    triggerOnce: true
  });

  const stats = [
  { icon: Database, label: "Federal SAFER Data" },
  { icon: CreditCard, label: "Secure Payments" },
  { icon: ShieldCheck, label: "Vetted Movers" }];


  const badges = ["FMCSA Authorized", "USDOT Compliant", "Insured & Bonded"];

  return (
    <section className="tru-trust-compact" ref={sectionRef}>
      <div className="tru-trust-compact-inner">
        <div className="tru-trust-compact-stats">
          {stats.map((stat, index) =>
          <div
            key={stat.label}
            className={`tru-trust-compact-stat ${isInView ? 'in-view' : ''}`}
            style={{ '--stagger-index': index } as React.CSSProperties}>
            
              <stat.icon className="w-5 h-5" />
              <span>{stat.label}</span>
            </div>
          )}
        </div>
        <div className="tru-trust-compact-badges">
          {badges.map((badge, index) =>
          <span
            key={badge}
            className={`tru-trust-compact-badge ${isInView ? 'in-view' : ''}`}
            style={{ '--stagger-index': index + 3 } as React.CSSProperties}>
            
              {badge}
            </span>
          )}
        </div>
      </div>
    </section>);

}

// Steps Compact Section with parallax effect
function StepsCompactSection({ navigate }: {navigate: (path: string) => void;}) {
  const [sectionRef, isInView] = useScrollAnimation<HTMLElement>({
    threshold: 0.1,
    rootMargin: "0px",
    triggerOnce: true
  });

  const steps = [
  { num: 1, title: "Build Your Inventory", desc: "AI-powered tools calculate weight and volume from real data." },
  { num: 2, title: "Get Carrier Matches", desc: "We analyze SAFER Web data to find the best fit." },
  { num: 3, title: "Book with Confidence", desc: "Secure payment. Licensed, vetted movers only." }];


  return (
    <section className="tru-steps-compact" ref={sectionRef}>
      <div className="tru-steps-compact-inner">
        <div className="tru-steps-compact-header">
          <span className="tru-steps-compact-badge">How It Works</span>
          <h2 className="tru-steps-compact-title">Get matched with the right mover.</h2>
        </div>
        <div className="tru-steps-compact-grid">
          {steps.map((step, index) =>
          <div
            key={step.num}
            className={`tru-steps-compact-card tru-steps-parallax-card ${isInView ? 'in-view' : ''}`}
            style={{ '--card-index': index } as React.CSSProperties}
            onClick={() => navigate("/site/online-estimate")}>
            
              <div className="tru-steps-compact-num">{step.num}</div>
              <div className="tru-steps-compact-card-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 tru-steps-compact-arrow" />
            </div>
          )}
        </div>
      </div>
    </section>);

}

export default function Index() {
  useScrollToTop();
  const navigate = useNavigate();
  const quoteBuilderRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);

  // Scroll-triggered animation for hero content
  const [heroContentRef, isHeroInView] = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: "0px",
    triggerOnce: true
  });

  // Parallax removed for zoom stability

  // Step tracking (1-4)
  const [step, setStep] = useState(1);

  // Analyzing transition state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzePhase, setAnalyzePhase] = useState(0); // 0: origin, 1: destination, 2: route
  const [fromCoords, setFromCoords] = useState<[number, number] | null>(null);
  const [toCoords, setToCoords] = useState<[number, number] | null>(null);
  const [routeProgress, setRouteProgress] = useState(0); // 0-100 for route drawing animation
  const [routeGeometry, setRouteGeometry] = useState<string | null>(null);

  // UI engagement state - cards expand when user starts typing
  const [isEngaged, setIsEngaged] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);

  // Lead capture modal state
  const [leadCaptureOpen, setLeadCaptureOpen] = useState(false);
  const [leadCaptureTarget, setLeadCaptureTarget] = useState<"manual" | "ai">("manual");
  const [hasProvidedContactInfo, setHasProvidedContactInfo] = useState(false);

  // AI Scan Demo state
  const [scanDemoRunning, setScanDemoRunning] = useState(false);
  const [scanVisibleCount, setScanVisibleCount] = useState(0);
  const scanPreviewRef = useRef<HTMLDivElement>(null);

  // Sync visibleCount with scan running state
  useEffect(() => {
    if (!scanDemoRunning) {
      setScanVisibleCount(0);
      return;
    }
    const interval = setInterval(() => {
      setScanVisibleCount((prev) => prev >= SCAN_DEMO_ITEMS.length ? prev : prev + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, [scanDemoRunning]);

  // Form state
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [fromZip, setFromZip] = useState("");
  const [toZip, setToZip] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [moveDate, setMoveDate] = useState<Date | null>(null);
  const [size, setSize] = useState("");
  const [propertyType, setPropertyType] = useState<'house' | 'apartment' | ''>('');
  const [floor, setFloor] = useState(1);
  const [hasElevator, setHasElevator] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhoneNum] = useState("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Carrier search animation states
  const [isSearchingCarriers, setIsSearchingCarriers] = useState(false);
  const [searchPhase, setSearchPhase] = useState(0);
  const [carrierCount, setCarrierCount] = useState(0);
  const [foundCarriers, setFoundCarriers] = useState(0);

  // Track which summary fields just updated (for animation)
  const [updatedFields, setUpdatedFields] = useState<Set<string>>(new Set());

  // Why TruMove feature selection state
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [carrierIdx, setCarrierIdx] = useState(0);

  // Why TruMove features data - Updated per plan
  const whyTruMoveFeatures = [
  {
    id: 'ai-scanner',
    icon: Scan,
    title: 'Computer Vision Inventory',
    shortDesc: 'AI scans your rooms in seconds',
    longDesc: 'Our proprietary neural network detects furniture, estimates cubic footage, and calculates weight — eliminating the guesswork that leads to surprise fees on move day.',
    hoverTip: 'Skip the clipboard. Snap photos and let AI do the counting.'
  },
  {
    id: 'video-consults',
    icon: Video,
    title: 'Live Video Walk-Through',
    shortDesc: 'Real-time consultation with experts',
    longDesc: 'A TruMove specialist joins you via video to walk your home room-by-room. They catch details photos miss and build a quote you can actually trust.',
    hoverTip: 'Like FaceTime, but with a moving pro on the other end.'
  },
  {
    id: 'fmcsa-vetting',
    icon: ShieldCheck,
    title: 'FMCSA Safety Intelligence',
    shortDesc: 'Federal database cross-reference',
    longDesc: 'We pull real-time data from the SAFER Web Services API — checking operating authority, crash history, and compliance ratings before any carrier makes our list.',
    hoverTip: 'Same data the feds use. Zero guesswork.'
  },
  {
    id: 'authority-check',
    icon: Shield,
    title: 'License Verification Engine',
    shortDesc: 'Active authority confirmation',
    longDesc: 'Every carrier is validated for active MC and USDOT numbers. Revoked, suspended, or lapsed licenses get flagged instantly — you only see vetted options.',
    hoverTip: "If it's not active, you won't see it."
  },
  {
    id: 'insurance-check',
    icon: CreditCard,
    title: 'Coverage Validation',
    shortDesc: 'Insurance limits verified on file',
    longDesc: 'We confirm cargo, liability, and bodily injury coverage meets or exceeds federal minimums — so your belongings are protected before they leave the driveway.',
    hoverTip: 'Proof of coverage, not just promises.'
  },
  {
    id: 'transparency',
    icon: Zap,
    title: 'Zero Black Box',
    shortDesc: 'Full visibility at every stage',
    longDesc: 'From carrier matching to move-day coordination, you see exactly what we see. Real-time status updates, no hidden fees, no corporate runaround.',
    hoverTip: "You're in the loop. Always."
  }];


  // Calculate real distance
  const distance = useMemo(() => calculateDistance(fromZip, toZip), [fromZip, toZip]);
  const moveType = distance > 150 ? "long-distance" : "local";

  // Previous values to detect changes (for animation)
  const prevFromCity = useRef(fromCity);
  const prevToCity = useRef(toCity);
  const prevDistance = useRef(distance);
  const prevMoveDate = useRef(moveDate);
  const prevSize = useRef(size);
  const prevPropertyType = useRef(propertyType);

  // Animate summary value updates (kept for potential future use)
  useEffect(() => {
    const fieldsToUpdate: string[] = [];

    if (fromCity && fromCity !== prevFromCity.current) fieldsToUpdate.push('from');
    if (toCity && toCity !== prevToCity.current) fieldsToUpdate.push('to');
    if (distance > 0 && distance !== prevDistance.current) fieldsToUpdate.push('distance');
    if (moveDate && moveDate !== prevMoveDate.current) fieldsToUpdate.push('date');
    if (size && size !== prevSize.current) fieldsToUpdate.push('size');
    if (propertyType && propertyType !== prevPropertyType.current) fieldsToUpdate.push('propertyType');

    // Update refs
    prevFromCity.current = fromCity;
    prevToCity.current = toCity;
    prevDistance.current = distance;
    prevMoveDate.current = moveDate;
    prevSize.current = size;
    prevPropertyType.current = propertyType;

    if (fieldsToUpdate.length > 0) {
      setUpdatedFields(new Set(fieldsToUpdate));
      const timer = setTimeout(() => setUpdatedFields(new Set()), 500);
      return () => clearTimeout(timer);
    }
  }, [fromCity, toCity, distance, moveDate, size, propertyType]);

  // AI hint for current step
  const aiHint = useMemo(() =>
  getAiHint(step, fromCity, toCity, distance, moveDate),
  [step, fromCity, toCity, distance, moveDate]
  );

  // Dynamic ticker content based on progress
  const tickerContent = useMemo(() => {
    if (!fromCity && !toCity) {
      return "256-bit encryption • Real-time pricing • FMCSA verified";
    }
    if (fromCity && !toCity) {
      const state = fromCity.split(',')[1]?.trim() || '';
      return `Scanning carriers in ${state} • Real-time pricing • FMCSA verified`;
    }
    if (fromCity && toCity && distance > 0) {
      return `${distance.toLocaleString()} mile route analyzed • Matching best carriers • FMCSA verified`;
    }
    return "256-bit encryption • Real-time pricing • FMCSA verified";
  }, [fromCity, toCity, distance]);

  // Calculate estimated move duration based on distance
  const estimatedDuration = useMemo(() => {
    if (distance <= 0) return null;
    if (distance < 50) return "1 day";
    if (distance < 200) return "1-2 days";
    if (distance < 500) return "2-3 days";
    if (distance < 1000) return "3-5 days";
    if (distance < 2000) return "5-7 days";
    return "7-10 days";
  }, [distance]);

  // Calculate estimate
  const estimate = useMemo(() => {
    if (!size) return null;

    const sizeWeights: Record<string, number> = {
      'Studio': 2000,
      '1 Bedroom': 3000,
      '2 Bedroom': 5000,
      '3 Bedroom': 7000,
      '4+ Bedroom': 10000,
      'Office': 4000
    };
    const weight = sizeWeights[size] || 4000;
    const base = calculateEstimate(weight, distance, moveType);

    let min = base.min;
    let max = base.max;

    // Add floor surcharge for apartments with stairs
    if (propertyType === 'apartment' && !hasElevator && floor > 1) {
      const floorSurcharge = (floor - 1) * 75;
      min += floorSurcharge;
      max += floorSurcharge;
    }

    return { min, max };
  }, [size, distance, moveType, propertyType, floor, hasElevator]);

  // Carrier search animation
  const triggerCarrierSearch = useCallback((state: string) => {
    setIsSearchingCarriers(true);
    setSearchPhase(1);
    setCarrierCount(0);
    setFoundCarriers(0);

    // Phase 1: Scanning (0-2s)
    setTimeout(() => {
      setSearchPhase(2);
      // Count up carriers
      let count = 0;
      const countInterval = setInterval(() => {
        count += Math.floor(Math.random() * 8) + 3;
        if (count >= 47) {
          count = 47;
          clearInterval(countInterval);
        }
        setCarrierCount(count);
      }, 150);
    }, 1500);

    // Phase 2: Analyzing (2-4s)
    setTimeout(() => {
      setSearchPhase(3);
      setFoundCarriers(Math.floor(Math.random() * 6) + 8); // 8-14 carriers
    }, 3500);

    // Complete (4s+)
    setTimeout(() => {
      setIsSearchingCarriers(false);
    }, 5000);
  }, []);

  // Handle ZIP changes
  const handleFromZipChange = useCallback(async (value: string) => {
    setFromZip(value);
    if (value.length === 5) {
      const city = await lookupZip(value);
      setFromCity(city || "");
      if (city) {
        const state = city.split(',')[1]?.trim() || '';
        triggerCarrierSearch(state);
      }
    } else {
      setFromCity("");
    }
  }, [triggerCarrierSearch]);

  const handleToZipChange = useCallback(async (value: string) => {
    setToZip(value);
    if (value.length === 5) {
      const city = await lookupZip(value);
      setToCity(city || "");
      if (city && fromCity) {
        const state = city.split(',')[1]?.trim() || '';
        triggerCarrierSearch(state);
      }
    } else {
      setToCity("");
    }
  }, [triggerCarrierSearch, fromCity]);

  // Track full location display text for better data transfer
  const [fromLocationDisplay, setFromLocationDisplay] = useState("");
  const [toLocationDisplay, setToLocationDisplay] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Store lead data with full address display
    localStorage.setItem("tm_lead", JSON.stringify({
      name, fromZip, toZip, fromCity, toCity,
      fromLocationDisplay: fromLocationDisplay || `${fromCity} ${fromZip}`,
      toLocationDisplay: toLocationDisplay || `${toCity} ${toZip}`,
      moveDate: moveDate?.toISOString(),
      size, propertyType, floor, hasElevator, email, phone, ts: Date.now()
    }));

    // Show confirmation
    setSubmitted(true);
  };

  // Handle inventory flow gating
  const handleInventoryClick = (flow: "manual" | "ai") => {
    if (!hasProvidedContactInfo && !name && !email && !phone) {
      setLeadCaptureTarget(flow);
      setLeadCaptureOpen(true);
    } else {
      // Already have contact info, proceed directly
      navigate(flow === "ai" ? "/scan-room" : "/online-estimate");
    }
  };

  const handleLeadCaptureSubmit = (data: {name: string;email: string;phone: string;}) => {
    setName(data.name);
    setEmail(data.email);
    setPhoneNum(data.phone);
    setHasProvidedContactInfo(true);
    setLeadCaptureOpen(false);

    // Store the lead data
    localStorage.setItem("tm_lead_contact", JSON.stringify({
      name: data.name,
      email: data.email,
      phone: data.phone,
      ts: Date.now()
    }));

    // Navigate to the selected flow
    navigate(leadCaptureTarget === "ai" ? "/scan-room" : "/online-estimate");
  };

  // Step validation - Updated flow:
  // Step 1: From/To addresses + move date
  // Step 2: Contact info (name, email, SMS)
  // Step 3: Choose estimate method (AI or Manual)
  const canContinue = () => {
    switch (step) {
      case 1:return fromZip.length === 5 && fromCity && toZip.length === 5 && toCity && moveDate !== null;
      case 2:return name.trim().length >= 2 && email.includes("@") && isValidPhoneNumber(phone);
      case 3:return true; // Always can proceed from method selection
      default:return false;
    }
  };

  const goNext = async () => {
    if (canContinue() && step < 3) {
      // If on step 1, trigger analyzing transition
      if (step === 1) {
        setIsAnalyzing(true);
        setAnalyzePhase(0);

        // Fetch route geometry for the third map
        if (fromCoords && toCoords) {
          try {
            const token = 'pk.eyJ1IjoibWF4d2VzdDUyNSIsImEiOiJjbWtuZTY0cTgwcGIzM2VweTN2MTgzeHc3In0.nlM6XCog7Y0nrPt-5v-E2g';
            const res = await fetch(
              `https://api.mapbox.com/directions/v5/mapbox/driving/${fromCoords[0]},${fromCoords[1]};${toCoords[0]},${toCoords[1]}?geometries=polyline&overview=full&access_token=${token}`
            );
            if (res.ok) {
              const data = await res.json();
              if (data.routes && data.routes[0]) {
                setRouteGeometry(data.routes[0].geometry);
              }
            }
          } catch (e) {
            console.error('Failed to fetch route:', e);
          }
        }

        // Slower timing for popup modal experience
        // Phase 0: Show origin (0-2s)
        setTimeout(() => setAnalyzePhase(1), 2000);
        // Phase 1: Show destination (2-4s)
        setTimeout(() => {
          setAnalyzePhase(2);
          // Start route progress animation
          setRouteProgress(0);
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 2;
            if (progress >= 100) {
              progress = 100;
              clearInterval(progressInterval);
              // Wait a moment at 100% before transitioning
              setTimeout(() => {
                setIsAnalyzing(false);
                setAnalyzePhase(0);
                setRouteProgress(0);
                setStep(2);
              }, 500);
            }
            setRouteProgress(progress);
          }, 50);
        }, 4000);
      } else {
        setStep(step + 1);
      }
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canContinue()) {
      e.preventDefault();
      goNext();
    }
  };

  const hasRoute = fromZip.length === 5 && toZip.length === 5;

  return (
    <SiteShell centered hideTrustStrip>
      

      <div className="tru-page-frame">
        <div className="tru-page-inner">
        {/* HERO - Full Width Background Wrapper */}
        <div className="tru-hero-wrapper">
          {/* Full-width background image with parallax */}
          <div className="tru-hero-bg">
            <img
                src={heroFamilyMove}
                alt="Happy family moving into their new home"
                className="tru-hero-bg-image" />
              
            <div className="tru-hero-bg-overlay" />
          </div>
          
          <section className="tru-hero tru-hero-split" ref={heroSectionRef}>
            {/* Particle Background Effect */}
            <HeroParticles />
            <div className="tru-hero-particles-overlay" />
            
            
            {/* Full-Page Analyzing Overlay */}
            {isAnalyzing &&
              <div className="tru-analyze-fullpage-overlay">
                <div className="tru-analyze-popup-modal">
                  <div className="tru-analyze-popup-header">
                    <Radar className="w-6 h-6 tru-analyzing-icon" />
                    <span className="tru-analyze-popup-title">
                      {analyzePhase === 0 && "Locating origin..."}
                      {analyzePhase === 1 && "Locating destination..."}
                      {analyzePhase === 2 && "Analyzing route..."}
                    </span>
                  </div>
                  
                  <div className="tru-analyze-strip">
                    {/* Origin Satellite */}
                    <div className={`tru-analyze-strip-panel ${analyzePhase >= 0 ? 'is-active' : ''}`}>
                      <div className="tru-analyze-strip-label">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Origin</span>
                      </div>
                      <div className="tru-analyze-strip-frame">
                        <div className="tru-analyze-strip-shimmer" />
                        <img
                          src={fromCoords ? `https://maps.googleapis.com/maps/api/streetview?size=720x440&location=${fromCoords[1]},${fromCoords[0]}&fov=90&heading=0&pitch=5&key=AIzaSyCWDpAPlxVRXnl1w5rz0Df5S3vGsHY6Xoo` : ''}
                          alt="Origin location"
                          className="tru-analyze-strip-img"
                          onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
                          onError={(e) => {
                            e.currentTarget.src = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${fromCoords?.[0]},${fromCoords?.[1]},16,0/720x440@2x?access_token=pk.eyJ1IjoibWF4d2VzdDUyNSIsImEiOiJjbWtuZTY0cTgwcGIzM2VweTN2MTgzeHc3In0.nlM6XCog7Y0nrPt-5v-E2g`;
                          }} />
                        
                        <div className="tru-analyze-strip-city">{fromCity}</div>
                      </div>
                    </div>
                    
                    {/* Route Map - Center */}
                    <div className={`tru-analyze-strip-panel tru-analyze-strip-route ${analyzePhase >= 2 ? 'is-active' : ''}`}>
                      <div className="tru-analyze-strip-label">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Your Route</span>
                      </div>
                      <div className="tru-analyze-strip-frame tru-analyze-strip-route-frame">
                        <div className="tru-analyze-strip-shimmer" />
                        {fromCoords && toCoords && routeGeometry &&
                        <AnimatedRouteMap
                          fromCoords={fromCoords}
                          toCoords={toCoords}
                          routeGeometry={routeGeometry}
                          progress={routeProgress} />

                        }
                      </div>
                    </div>
                    
                    {/* Destination Satellite */}
                    <div className={`tru-analyze-strip-panel ${analyzePhase >= 1 ? 'is-active' : ''}`}>
                      <div className="tru-analyze-strip-label">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Destination</span>
                      </div>
                      <div className="tru-analyze-strip-frame">
                        <div className="tru-analyze-strip-shimmer" />
                        <img
                          src={toCoords ? `https://maps.googleapis.com/maps/api/streetview?size=720x440&location=${toCoords[1]},${toCoords[0]}&fov=90&heading=0&pitch=5&key=AIzaSyCWDpAPlxVRXnl1w5rz0Df5S3vGsHY6Xoo` : ''}
                          alt="Destination location"
                          className="tru-analyze-strip-img"
                          onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
                          onError={(e) => {
                            e.currentTarget.src = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${toCoords?.[0]},${toCoords?.[1]},16,0/720x440@2x?access_token=pk.eyJ1IjoibWF4d2VzdDUyNSIsImEiOiJjbWtuZTY0cTgwcGIzM2VweTN2MTgzeHc3In0.nlM6XCog7Y0nrPt-5v-E2g`;
                          }} />
                        
                        <div className="tru-analyze-strip-city">{toCity}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              }

            {/* LEFT COLUMN: Text Content */}
            <div className="tru-hero-left-column">
              <img src={logoImg} alt="TruMove" className="tru-hero-logo" />
              <h1 className="tru-hero-headline">
                The Smarter Way To <span className="tru-hero-accent">Move</span>
              </h1>
              <ul className="tru-hero-bullets">
                <li>Scan, document, and build your own inventory — your items stay private and secure</li>
                <li>Meet your broker virtually, face to face, from anywhere</li>
                <li>Track your most valuable belongings every step of the way</li>
                <li>See the full history and performance record of your movers</li>
              </ul>
            </div>

            {/* RIGHT COLUMN: Form + CTAs */}
            <div className="tru-hero-right-column">
                
              <div className="tru-hero-form-panel" ref={quoteBuilderRef}>
                {/* TOP ROW: Form Card */}
                <div className="tru-floating-form-card rounded-3xl shadow-2xl">
                  {/* Form Header */}
                  <div className="tru-qb-form-header tru-qb-form-header-pill">
                    
                    <div className="tru-qb-form-title-group">
                      <h2 className="tru-qb-form-title tru-qb-form-title-large">Let's Get Moving</h2>
                      <p className="tru-qb-form-subtitle-compact">FMCSA-vetted carriers, AI precision</p>
                    </div>
                  </div>
                  
                  {/* Form Content */}
                  <div className="tru-floating-form-content shadow-lg">

                    {/* Step 1: Contact + Route */}
                    {step === 1 &&
                      <div className="tru-qb-step-content" key="step-1">
                        
                         {/* First Name + Last Name Row */}
                         <div className="tru-qb-location-row">
                           <div className="tru-qb-location-col">
                             <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name</label>
                             <div className="tru-qb-input-wrap tru-qb-input-enhanced">
                               <input
                                type="text"
                                value={contactFirstName}
                                onChange={(e) => {
                                  setContactFirstName(e.target.value);
                                  if (e.target.value.length > 0 && !isEngaged) setIsEngaged(true);
                                }}
                                placeholder="First Name"
                                className="tru-qb-input"
                                autoFocus />
                             </div>
                           </div>
                           <div className="tru-qb-location-col">
                             <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name</label>
                             <div className="tru-qb-input-wrap tru-qb-input-enhanced">
                               <input
                                type="text"
                                value={contactLastName}
                                onChange={(e) => setContactLastName(e.target.value)}
                                placeholder="Last Name"
                                className="tru-qb-input" />
                             </div>
                           </div>
                         </div>

                         {/* Phone + Email Row */}
                         <div className="tru-qb-location-row" style={{ marginTop: '12px' }}>
                           <div className="tru-qb-location-col">
                             <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                             <div className="tru-qb-input-wrap tru-qb-input-enhanced">
                               <input
                                type="tel"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(formatPhoneNumber(e.target.value))}
                                placeholder="(555) 555-5555"
                                className="tru-qb-input" />
                             </div>
                           </div>
                           <div className="tru-qb-location-col">
                             <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                             <div className="tru-qb-input-wrap tru-qb-input-enhanced">
                               <input
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="you@email.com"
                                className="tru-qb-input" />
                             </div>
                           </div>
                         </div>

                         <div style={{ marginTop: '12px' }}>
                           <label className="text-xs font-medium text-muted-foreground mb-1 block">Move Date</label>
                           <Popover>
                             <PopoverTrigger asChild>
                               <button
                                type="button"
                                className="tru-qb-input"
                                style={{ width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <Calendar className="w-4 h-4 shrink-0 text-primary" />
                                 <span style={{ opacity: moveDate ? 1 : 0.5 }}>
                                   {moveDate ? format(moveDate, 'MMM d, yyyy') : 'Select a date'}
                                 </span>
                               </button>
                             </PopoverTrigger>
                             <PopoverContent className="w-auto p-0" align="center" side="top">
                               <CalendarComponent
                                mode="single"
                                selected={moveDate ?? undefined}
                                onSelect={(date) => setMoveDate(date ?? null)}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto" />
                             </PopoverContent>
                           </Popover>
                         </div>

                         {formError &&
                        <p style={{ color: 'hsl(0 70% 55%)', fontSize: '13px', textAlign: 'center', margin: '4px 0 0' }}>{formError}</p>
                        }
                         <button
                          type="button"
                          className="tru-qb-continue tru-engine-btn"
                          onClick={() => {
                            const first = contactFirstName.trim();
                            const last = contactLastName.trim();
                            const email = contactEmail.trim();
                            const phone = contactPhone.trim();
                            if (!first) {setFormError('Please enter your first name.');return;}
                            if (!last) {setFormError('Please enter your last name.');return;}
                            if (!isValidPhoneNumber(phone)) {setFormError('Please enter a valid 10-digit phone number.');return;}
                            if (!email || !email.includes('@') || !email.includes('.')) {setFormError('Please enter a valid email.');return;}
                            if (!moveDate) {setFormError('Please select a move date.');return;}
                            setFormError('');
                            goNext();
                          }}
                          style={{ marginTop: '16px' }}>
                           
                           <span>Talk to Support</span>
                           <ArrowRight className="w-5 h-5 tru-btn-arrow text-[#00ff00]" />
                         </button>
                         
                         <p className="tru-qb-microcopy">A moving specialist will call you shortly.</p>
                       </div>
                      }


                    {/* Step 2: Contact Information (moved from step 3) */}
                    {step === 2 &&
                      <div className="tru-qb-step-content tru-qb-step-compact" key="step-2">
                        <h1 className="tru-qb-question">How can we reach you?</h1>
                        <p className="tru-qb-subtitle">We'll save your progress and send updates</p>
                        
                        <div className="tru-qb-contact-fields">
                          <div className="tru-qb-input-wrap tru-qb-glow-always">
                            <input
                              type="text"
                              className={`tru-qb-input ${formError && !name.trim() ? 'has-error' : ''}`}
                              placeholder="Your full name"
                              value={name}
                              onChange={(e) => {setName(e.target.value);setFormError("");}}
                              autoFocus />
                            
                          </div>
                          
                          <div className="tru-qb-input-wrap">
                            <input
                              type="email"
                              className={`tru-qb-input ${formError && !email.includes('@') ? 'has-error' : ''}`}
                              placeholder="Email address"
                              value={email}
                              onChange={(e) => {setEmail(e.target.value);setFormError("");}}
                              onKeyDown={handleKeyDown} />
                            
                          </div>
                          
                          <div className="tru-qb-input-wrap">
                            <input
                              type="tel"
                              className={`tru-qb-input ${formError && !isValidPhoneNumber(phone) ? 'has-error' : ''}`}
                              placeholder="(555) 123-4567"
                              value={phone}
                              onChange={(e) => {
                                setPhoneNum(formatPhoneNumber(e.target.value));
                                setFormError("");
                              }}
                              onKeyDown={handleKeyDown} />
                            
                          </div>
                        </div>

                        {formError &&
                        <p className="tru-qb-error">{formError}</p>
                        }

                        <button
                          type="button"
                          className="tru-qb-continue tru-engine-btn"
                          disabled={!canContinue()}
                          onClick={() => {
                            if (canContinue()) {
                              // Store lead data
                              localStorage.setItem("tm_lead_contact", JSON.stringify({
                                name, email, phone,
                                fromCity, toCity, fromZip, toZip,
                                moveDate: moveDate?.toISOString(),
                                ts: Date.now()
                              }));
                              setHasProvidedContactInfo(true);
                              setStep(3);
                            } else {
                              setFormError("Please enter your name, a valid email, and phone number.");
                            }
                          }}>
                          
                          <span>Continue</span>
                          <ArrowRight className="w-5 h-5 tru-btn-arrow text-[hsl(142,71%,45%)]" />
                        </button>

                        <button type="button" className="tru-qb-back" onClick={goBack}>
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        
                        <p className="tru-qb-disclaimer-bottom">
                          <Lock className="w-3 h-3 inline" /> Your info is secure & never sold.
                        </p>
                      </div>
                      }

                    {/* Step 3: Choose Estimate Method */}
                    {step === 3 && !submitted &&
                      <div className="tru-qb-step-content" key="step-3">
                        <h1 className="tru-qb-question">How would you like to build your inventory?</h1>
                        <p className="tru-qb-subtitle">Choose the method that works best for you</p>
                        
                        <div className="tru-qb-method-options">
                          {/* AI Estimate Option */}
                          <button
                            type="button"
                            className="tru-qb-method-card tru-qb-method-primary"
                            onClick={() => {
                              handleSubmit(new Event('submit') as any);
                              navigate("/site/scan-room");
                            }}>
                            
                            <div className="tru-qb-method-icon-wrap tru-qb-method-icon-ai">
                              <Scan className="w-6 h-6" />
                            </div>
                            <div className="tru-qb-method-content">
                              <span className="tru-qb-method-title">AI Estimate</span>
                              <span className="tru-qb-method-desc">Upload photos or video of your rooms</span>
                              <span className="tru-qb-method-badge">
                                <Camera className="w-3 h-3" />
                                Fastest
                              </span>
                            </div>
                            <ArrowRight className="w-5 h-5 tru-qb-method-arrow" />
                          </button>
                          
                          {/* Manual Inventory Option */}
                          <button
                            type="button"
                            className="tru-qb-method-card"
                            onClick={() => {
                              handleSubmit(new Event('submit') as any);
                              navigate("/site/online-estimate");
                            }}>
                            
                            <div className="tru-qb-method-icon-wrap">
                              <Boxes className="w-6 h-6" />
                            </div>
                            <div className="tru-qb-method-content">
                              <span className="tru-qb-method-title">Manual Builder</span>
                              <span className="tru-qb-method-desc">Select items room-by-room</span>
                            </div>
                            <ArrowRight className="w-5 h-5 tru-qb-method-arrow" />
                          </button>
                          
                          {/* Video Consult Option */}
                          <button
                            type="button"
                            className="tru-qb-method-card"
                            onClick={() => {
                              handleSubmit(new Event('submit') as any);
                              navigate("/site/book");
                            }}>
                            
                            <div className="tru-qb-method-icon-wrap">
                              <Video className="w-6 h-6" />
                            </div>
                            <div className="tru-qb-method-content">
                              <span className="tru-qb-method-title">Video Consult</span>
                              <span className="tru-qb-method-desc">Live walkthrough with a specialist</span>
                              <span className="tru-qb-method-badge tru-qb-method-badge-alt">
                                <Headphones className="w-3 h-3" />
                                Personal
                              </span>
                            </div>
                            <ArrowRight className="w-5 h-5 tru-qb-method-arrow" />
                          </button>
                        </div>

                        <button type="button" className="tru-qb-back" onClick={goBack}>
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                      </div>
                      }

                    {/* Post-Submission Confirmation - shown after selecting a method */}
                    {submitted &&
                      <div className="tru-qb-step-content tru-qb-confirmation" key="step-confirmed">
                        <div className="tru-qb-confirmation-icon">
                          <CheckCircle className="w-12 h-12" />
                        </div>
                        <h1 className="tru-qb-question">You're all set!</h1>
                        <p className="tru-qb-subtitle tru-qb-subtitle-bold">
                          <strong>We've saved your move details.</strong> You can continue building your inventory or speak with a specialist.
                        </p>
                        
                        <div className="tru-qb-confirmation-divider">
                          <span>Continue with:</span>
                        </div>
                        
                        <div className="tru-qb-options-stack-full">
                          <button
                            type="button"
                            className="tru-qb-option-card"
                            onClick={() => navigate("/site/scan-room")}>
                            
                            <Scan className="w-5 h-5" />
                            <div className="tru-qb-option-text">
                              <span className="tru-qb-option-title">AI Inventory</span>
                              <span className="tru-qb-option-desc">Upload photos or video</span>
                            </div>
                          </button>
                          <button
                            type="button"
                            className="tru-qb-option-card tru-qb-option-card-outline"
                            onClick={() => navigate("/site/online-estimate")}>
                            
                            <Boxes className="w-5 h-5" />
                            <div className="tru-qb-option-text">
                              <span className="tru-qb-option-title">Manual Builder</span>
                              <span className="tru-qb-option-desc">Select items room-by-room</span>
                            </div>
                          </button>
                          <button
                            type="button"
                            className="tru-qb-option-card tru-qb-option-card-outline"
                            onClick={() => navigate("/site/book")}>
                            
                            <Video className="w-5 h-5" />
                            <div className="tru-qb-option-text">
                              <span className="tru-qb-option-title">Video Consult</span>
                              <span className="tru-qb-option-desc py-[6px]">Schedule a walkthrough</span>
                            </div>
                          </button>
                        </div>
                      </div>
                      }
                  </div>
                  
                  {/* Footer inside form card - with trust indicators */}
                  <div className="tru-floating-form-footer tru-form-footer-trust">
                    <div className="tru-form-trust-items">
                      <span className="tru-form-trust-item"><Lock className="w-3 h-3" /> TLS 1.3 ENCRYPTED</span>
                      <span className="tru-form-trust-divider">•</span>
                      <span className="tru-form-trust-item"><Shield className="w-3 h-3" /> FMCSA LICENSE VERIFIED</span>
                      <span className="tru-form-trust-divider">•</span>
                      <span className="tru-form-trust-item"><Database className="w-3 h-3" /> FIRST-PARTY DATA ONLY</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </section>
        </div> {/* End tru-hero-wrapper */}

        {/* BLACK STATS STRIP - Section Divider */}
        <StatsStrip />

          {/* START YOUR AI INVENTORY ANALYSIS - Enhanced with Preview */}
          <section className="tru-ai-steps-section">
            <div className="tru-ai-steps-inner">
              {/* Header row: info on left, previews on right */}
              <div className="tru-ai-header-row border-0 rounded-none shadow-none" ref={scanPreviewRef}>
                {/* LEFT: Description content */}
                <div className="tru-ai-content-left border-0 rounded-none shadow-none border-primary-foreground" style={{ justifyContent: 'center' }}>
                  {/* Premium headline block */}
                  <div className="tru-ai-headline-block animate-fade-scale-in opacity-0" style={{ animationDelay: '0ms' }}>
                    <h2 className="tru-ai-main-headline text-5xl md:text-6xl">
                      Scan. Add.<br />
                      <span className="tru-ai-headline-accent">Estimate.</span>
                    </h2>
                    <p className="tru-ai-subheadline text-lg">
                      Point your camera at any room. Our AI identifies every item and calculates your move in seconds—not hours.
                    </p>
                  </div>
                  
                  {/* CTA Button */}
                  <button
                    onClick={() => navigate("/site/scan-room")}
                    className="tru-ai-cta-btn animate-fade-scale-in opacity-0"
                    style={{ animationDelay: '350ms' }}>
                    
                    <Home className="w-4 h-4 text-[#00ff00]" />
                    Scan Your Home
                    <ArrowRight className="w-4 h-4 text-[#4cff05]" />
                  </button>
                </div>
                
                {/* CENTER: Room Scanner Demo */}
                <div className={`tru-ai-scanner-center ${scanDemoRunning ? 'is-running' : ''}`}>
                  <ScannerPreview
                    isRunning={scanDemoRunning}
                    visibleCount={scanVisibleCount}
                    onStartDemo={() => {
                      setScanDemoRunning((prev) => !prev);
                      setTimeout(() => {
                        scanPreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }} />
                  
                </div>
                
                {/* RIGHT: Detection List */}
                <div className="tru-ai-detection-right">
                  <DetectionList visibleCount={scanVisibleCount} />
                </div>
              </div>
            </div>
          </section>

          <FeatureTrustStrip />

          {/* SHIPMENT TRACKER - Mirrored Layout */}
          <ShipmentTrackerSection navigate={navigate} />

          <div className="py-8"><FeatureTrustStrip /></div>

          {/* TESTIMONIALS */}
          <section className="tru-ai-steps-section pt-16 pb-16">
            <div className="max-w-[90rem] mx-auto">
              <div className="flex flex-col items-center text-center mb-10">
                <h2 className="tru-ai-main-headline text-5xl md:text-6xl">
                  What Our Customers <span className="tru-ai-headline-accent">Say.</span>
                </h2>
                <p className="tru-ai-subheadline text-lg mt-3">Real stories from real moves across the country.</p>
              </div>

              {/* Infinite marquee carousel */}
              <div className="overflow-hidden relative py-[5px]">
                {/* Fade edges */}

                <div className="flex animate-marquee gap-5 w-max hover:[animation-play-state:paused]">
                  {[...Array(2)].map((_, dupeIdx) =>
                    [
                      { name: "Sarah M.", location: "New York → Miami", rating: 5, photo: testimonialSarah, source: "Google", text: "TruMove made our cross-country move seamless. Real-time tracking gave us total peace of mind the entire way." },
                      { name: "James R.", location: "Chicago → Denver", rating: 5, photo: testimonialJames, source: "Yelp", text: "The AI inventory scanner saved us hours of manual cataloging. Our estimate was spot-on — no surprise charges." },
                      { name: "Emily & David K.", location: "Los Angeles → Seattle", rating: 5, photo: testimonialEmilyDavid, source: "SiteJabber", text: "Best moving experience we've ever had. The team was professional, on time, and the video consult made planning easy." },
                      { name: "Marcus T.", location: "Houston → Atlanta", rating: 5, photo: testimonialMarcus, source: "Facebook", text: "From the first call to delivery day, everything was handled with care. Trudy even helped us prep our inventory list." },
                      { name: "Lisa W.", location: "Boston → San Francisco", rating: 5, photo: testimonialLisa, source: "MovingReviews.com", text: "We tracked our shipment in real time across the country. The transparency was unlike any other mover we've used." },
                      { name: "Carlos & Ana P.", location: "Phoenix → Dallas", rating: 5, photo: testimonialCarlosAna, source: "BBB", text: "Incredible value. The video consultation caught things we would have missed. Highly recommend TruMove to anyone." },
                      { name: "Rachel S.", location: "Portland → Nashville", rating: 5, photo: testimonialSarah, source: "Google", text: "The carrier vetting gave us confidence we were hiring a safe, legit company. No hidden fees, no stress." },
                      { name: "David L.", location: "Tampa → Charlotte", rating: 5, photo: testimonialJames, source: "Yelp", text: "Scheduling was a breeze. The whole process from quote to delivery was handled professionally and on time." },
                      { name: "Nina & Tom H.", location: "Austin → San Diego", rating: 5, photo: testimonialEmilyDavid, source: "Facebook", text: "We moved with two kids and a dog — TruMove took all the stress off our plate. Would absolutely use them again." },
                      { name: "Andre W.", location: "Detroit → Orlando", rating: 5, photo: testimonialMarcus, source: "Google", text: "The live tracking map was incredible. I could see exactly where our stuff was the whole trip. Top-notch service." },
                    ].map((review, i) => (
                      <div
                        key={`${dupeIdx}-${i}`}
                        className="w-[280px] sm:w-[380px] shrink-0 rounded-2xl bg-card p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 ring-1 ring-border min-h-[200px] sm:min-h-[220px]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex gap-0.5">
                            {Array.from({ length: review.rating }).map((_, s) => (
                              <svg key={s} className="w-4 h-4 text-primary fill-primary" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">via {review.source}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed flex-1">"{review.text}"</p>
                        <div className="pt-2 border-t border-border flex items-center gap-3">
                          <img src={review.photo} alt={review.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-border" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.location}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="py-8"><FeatureTrustStrip /></div>

          {/* CARRIER VETTING PREVIEW */}
          <section className="tru-ai-steps-section py-24">
            <div className="max-w-6xl mx-auto">
              {/* Two-column layout: headline left, SAFER card right */}
              <div className="flex flex-col lg:flex-row gap-10 items-center justify-center">
                {/* Left column: headline + subheadline + CTA */}
                <div className="lg:w-[340px] shrink-0 flex flex-col items-center text-center">
                  <h2 className="tru-ai-main-headline text-5xl md:text-6xl">
                    Carrier <span className="tru-ai-headline-accent">Vetting.</span>
                  </h2>
                  <p className="tru-ai-subheadline text-lg mt-5">Search any carrier. Red flags surfaced instantly.</p>
                  <div className="pt-5">
                    <button onClick={() => navigate("/site/vetting")} className="tru-ai-cta-btn">
                      <Radar className="w-5 h-5 text-primary" />
                      Try Carrier Vetting
                      <ArrowRight className="w-5 h-5 text-primary" />
                    </button>
                  </div>
                </div>

                {/* Right column: SAFER-style lookup UI */}
                <div className="flex-1 min-w-0">
                  {/* Window chrome */}
                  <div className="bg-muted/60 rounded-t-xl px-3 py-2 flex items-center gap-3 border border-b-0 border-border">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-destructive/60" />
                      <span className="w-2 h-2 rounded-full bg-amber-400/60" />
                      <span className="w-2 h-2 rounded-full bg-primary/60" />
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground tracking-wider uppercase">SAFER Database Query</span>
                  </div>

                  {/* Search bar area */}
                  <div className="border border-border border-t-0 bg-card px-3 py-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {['Name', 'DOT#', 'MC#'].map((f, fi) => (
                          <span key={f} className={`px-2 py-0.5 rounded-md text-[9px] font-semibold cursor-default ${fi === 0 ? 'bg-muted text-foreground' : 'bg-muted text-muted-foreground'}`}>{f}</span>
                        ))}
                      </div>
                      <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-lg px-2.5 py-1">
                        <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-[11px] text-foreground font-medium truncate">{MOCK_CARRIERS[carrierIdx].carrier.dbaName}</span>
                      </div>
                    </div>
                    <p className="text-[8px] text-muted-foreground leading-tight">Carriers filtered per FMCSA Safety Measurement System (SMS) criteria.</p>
                  </div>

                  {/* Result cards */}
                  <div className="border border-border border-t-0 rounded-b-xl bg-card divide-y divide-border overflow-hidden">
                    {MOCK_CARRIERS.map((c, i) => {
                      const authorized = c.carrier.allowToOperate === 'Y' && c.authority.commonStatus === 'ACTIVE';
                      const vOosPass = c.oos.vehicleOosRate < c.oos.vehicleOosRateNationalAvg;
                      const dOosPass = c.oos.driverOosRate < c.oos.driverOosRateNationalAvg;
                      const redFlags: string[] = [];
                      if (c.carrier.outOfService === 'Y') redFlags.push('OOS');
                      if (!authorized) redFlags.push('Auth');
                      if (c.safety.rating === 'CONDITIONAL' || c.safety.rating === 'UNSATISFACTORY') redFlags.push('Rating');
                      if (!vOosPass) redFlags.push('Veh OOS');
                      if (!dOosPass) redFlags.push('Drv OOS');
                      if (c.crashes.fatal > 0) redFlags.push('Fatal');
                      const verdict = redFlags.length === 0 ? 'pass' : redFlags.length <= 2 ? 'caution' : 'fail';
                      const selected = carrierIdx === i;

                      return (
                        <button
                          key={i}
                          onClick={() => setCarrierIdx(i)}
                          className={`w-full text-left px-3 py-2.5 transition-all ${selected ? 'bg-primary/5' : 'hover:bg-accent/30'}`}
                        >
                          {/* Row 1: Name + status */}
                          <div className="flex items-center justify-between gap-3 mb-1.5">
                            <div className="min-w-0 flex items-center gap-2">
                              {selected && <div className="w-1 h-6 rounded-full bg-primary shrink-0" />}
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">{c.carrier.legalName}</p>
                                <p className="text-[10px] text-muted-foreground">DOT {c.carrier.dotNumber} · {c.carrier.mcNumber}</p>
                              </div>
                            </div>
                            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${authorized ? 'bg-muted text-foreground' : 'bg-destructive/10 text-foreground'}`}>
                              {authorized ? <ShieldCheck className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                              {authorized ? 'Authorized' : 'Not Auth'}
                            </span>
                          </div>

                          {/* Row 2: Inline metrics */}
                          <div className="flex items-center gap-3 text-[10px] mb-1.5 ml-3">
                            <span className="font-semibold text-foreground">
                              Veh OOS: {c.oos.vehicleOosRate}% <span className="text-muted-foreground font-normal">/ {c.oos.vehicleOosRateNationalAvg}%</span>
                            </span>
                            <span className="text-border">|</span>
                            <span className="font-semibold text-foreground">
                              Drv OOS: {c.oos.driverOosRate}% <span className="text-muted-foreground font-normal">/ {c.oos.driverOosRateNationalAvg}%</span>
                            </span>
                            <span className="text-border">|</span>
                            <span className="font-semibold text-foreground">
                              {c.crashes.total} crashes <span className="text-muted-foreground font-normal">({c.crashes.fatal} fatal)</span>
                            </span>
                          </div>

                          {/* Row 3: Chips + verdict */}
                          <div className="flex items-center gap-1.5 ml-3 flex-wrap">
                            {[
                              { ok: authorized, label: 'Authority' },
                              { ok: c.carrier.outOfService !== 'Y', label: 'OOS Clear' },
                              { ok: c.safety.rating !== 'CONDITIONAL' && c.safety.rating !== 'UNSATISFACTORY', label: 'Safety' },
                              { ok: c.authority.cargoInsurance !== 'N/A' && c.authority.cargoInsurance !== '$0', label: 'Insured' },
                            ].map((chip) => (
                              <span
                                key={chip.label}
                                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${chip.ok ? 'bg-muted text-foreground' : 'bg-destructive/10 text-foreground'}`}
                              >
                                {chip.ok ? <CheckCircle className="w-2 h-2" /> : <XCircle className="w-2 h-2" />}
                                {chip.label}
                              </span>
                            ))}
                            <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-bold text-foreground">
                              {verdict === 'pass' ? <CheckCircle className="w-2.5 h-2.5" /> :
                               verdict === 'caution' ? <AlertTriangle className="w-2.5 h-2.5" /> :
                               <XCircle className="w-2.5 h-2.5" />}
                              {verdict === 'pass' ? 'PASS' : verdict === 'caution' ? 'CAUTION' : 'FAIL'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="py-8"><FeatureTrustStrip /></div>

          {/* GET IN TOUCH */}
          <section className="tru-ai-steps-section">
            <div className="max-w-6xl mx-auto">
              {/* Online indicator + Headline */}
              <div className="flex flex-col items-center text-center mb-6">
                <h2 className="tru-ai-main-headline text-5xl md:text-6xl">
                  Contact <span className="tru-ai-headline-accent">Us.</span>
                </h2>
                <p className="tru-ai-subheadline text-lg mt-3">Our team is standing by. Voice, video, text, or email.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-5 items-stretch">

                {/* Single card with green gradient glow */}
                <div className="flex-1 min-w-0 rounded-2xl bg-card p-5 flex flex-col md:flex-row gap-5 transition-all duration-200 ring-1 ring-border">

                  {/* Send a Message form */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-col items-center text-center mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 border border-border flex items-center justify-center mb-3">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-0.5">Send a Message</h3>
                      <p className="text-xs text-muted-foreground">We'll get back to you within a few hours.</p>
                    </div>
                    <form className="flex-1 flex flex-col space-y-2.5" onSubmit={(e) => e.preventDefault()}>
                      <div className="grid grid-cols-2 gap-2.5">
                        <input type="text" required placeholder="Your name" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm" />
                        <input type="email" required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm" placeholder="Email" />
                      </div>
                      <textarea required placeholder="How can we help?" className="w-full flex-1 min-h-[100px] rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none text-sm" />
                      <button type="submit" className="w-full bg-foreground text-background py-2.5 rounded-lg text-sm font-semibold hover:bg-foreground/90 transition-colors">
                        Send Message
                      </button>
                    </form>
                    <p className="text-center text-[11px] text-muted-foreground mt-2">
                      or email <a href="mailto:support@trumove.com" className="text-primary underline underline-offset-2 hover:text-primary/80">support@trumove.com</a>
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px bg-border" />

                  {/* Contact options */}
                  <div className="flex flex-col gap-2 md:w-48 shrink-0 justify-center">
                    <a
                        href="tel:+16097277647"
                        className="flex items-center justify-center gap-2 border border-foreground bg-background text-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                      <Phone className="w-4 h-4 text-primary" />
                      Call Us
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </a>

                    <a
                        href="sms:+16097277647"
                        className="flex items-center justify-center gap-2 border border-foreground bg-background text-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Text Support
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </a>

                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('trudy-start'))}
                        className="flex items-center justify-center gap-2 border border-foreground bg-background text-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                      <Mic className="w-4 h-4 text-primary" />
                      Talk to Trudy
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </button>

                    <button
                        onClick={() => navigate("/site/book")}
                        className="flex items-center justify-center gap-2 border border-foreground bg-background text-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                      <Video className="w-4 h-4 text-primary" />
                      Video Consult
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                </div>

                {/* Agent photo */}
                <div className="hidden lg:flex md:w-64 shrink-0 self-center animate-fade-in">
                  <div className="rounded-2xl overflow-hidden w-full">
                    <img src={contactAgentImg} alt="TruMove support agent" className="block w-full h-auto" />
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>



      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={leadCaptureOpen}
        onClose={() => setLeadCaptureOpen(false)}
        onSubmit={handleLeadCaptureSubmit}
        targetFlow={leadCaptureTarget} />
      

    </SiteShell>);

}