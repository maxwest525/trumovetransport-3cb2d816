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
import { useParallax } from "@/hooks/useParallax";
import logoImg from "@/assets/logo.png";

// Preview images for value cards
import previewAiScanner from "@/assets/preview-ai-scanner.jpg";
import previewCarrierVetting from "@/assets/preview-carrier-vetting.jpg";
import trudyVideoCall from "@/assets/trudy-video-call.jpg";
import previewPropertyLookup from "@/assets/preview-property-lookup.jpg";
import sampleRoomLiving from "@/assets/sample-room-living.jpg";
import scanRoomPreview from "@/assets/scan-room-preview.jpg";
import heroFamilyMove from "@/assets/hero-family-move.jpg";
import trudyAvatar from "@/assets/trudy-model.jpg";

import ChatModal from "@/components/chat/ChatModal";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel";

import { calculateDistance } from "@/lib/distanceCalculator";
import { formatPhoneNumber, isValidPhoneNumber, getDigitsOnly } from "@/lib/phoneFormat";
import { calculateEstimate, formatCurrency } from "@/lib/priceCalculator";
import { 
  Shield, Video, Boxes, CheckCircle, Info,
  MapPin, Route, Clock, DollarSign, Headphones, Phone, ArrowRight, ArrowDown, ArrowUp,
  CalendarIcon, ChevronLeft, Lock, Truck, Sparkles, Star, Users,
  Database, ChevronRight, Radar, CreditCard, ShieldCheck, BarChart3, Zap,
  Home, Building2, MoveVertical, ArrowUpDown, Scan, ChevronUp, ChevronDown, Camera, Globe,
  Play, Pause, MapPinned, Calendar
} from "lucide-react";


// ZIP lookup
const ZIP_LOOKUP: Record<string, string> = {
  "90210": "Beverly Hills, CA", "90001": "Los Angeles, CA", "10001": "New York, NY",
  "10016": "New York, NY", "77001": "Houston, TX", "60601": "Chicago, IL",
  "33101": "Miami, FL", "85001": "Phoenix, AZ", "98101": "Seattle, WA",
  "80201": "Denver, CO", "02101": "Boston, MA", "20001": "Washington, DC",
  "33431": "Boca Raton, FL", "33432": "Boca Raton, FL", "33433": "Boca Raton, FL",
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
  { label: "Office", value: "Office" },
];

const FLOOR_OPTIONS = [
  { label: "Ground/1st", value: 1 },
  { label: "2nd", value: 2 },
  { label: "3rd", value: 3 },
  { label: "4th+", value: 4 },
];

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
  { name: "Floor Lamp", weight: 15, cuft: 4, image: "/inventory/living-room/lamp-floor.png" },
];

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
      {onClose && (
        <button 
          onClick={onClose} 
          className="tru-move-summary-close"
          aria-label="Close move summary"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
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
            {fromCoords ? (
              <img 
                src={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${fromCoords[0]},${fromCoords[1]},14,0/280x280@2x?access_token=${MAPBOX_TOKEN}`}
                alt="Origin satellite view"
              />
            ) : (
              <div className="tru-move-summary-map-placeholder">
                <MapPin className="w-6 h-6" />
              </div>
            )}
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
            {toCoords ? (
              <img 
                src={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${toCoords[0]},${toCoords[1]},14,0/280x280@2x?access_token=${MAPBOX_TOKEN}`}
                alt="Destination satellite view"
              />
            ) : (
              <div className="tru-move-summary-map-placeholder">
                <Truck className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="tru-move-summary-location-info">
            <span className="label">Destination</span>
            <span className="value">{toCity || "Enter destination..."}</span>
          </div>
        </div>
      </div>
      
      {/* Move Date & ETA Row */}
      {(moveDate || estimatedDuration) && (
        <div className="tru-move-summary-details">
          {moveDate && (
            <div className="tru-move-summary-detail">
              <Calendar className="w-4 h-4" />
              <span>{format(moveDate, "MMM d, yyyy")}</span>
            </div>
          )}
          {estimatedDuration && (
            <div className="tru-move-summary-detail">
              <Clock className="w-4 h-4" />
              <span>ETA: {estimatedDuration}</span>
            </div>
          )}
        </div>
      )}
      
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
    </div>
  );
});

MoveSummaryModal.displayName = "MoveSummaryModal";

// Furniture positions for detection overlay on sample living room image
const FURNITURE_POSITIONS = [
  { id: 0, name: "Sofa", confidence: 98, top: "42%", left: "1%", width: "34%", height: "50%" },
  { id: 1, name: "Coffee Table", confidence: 96, top: "64%", left: "32%", width: "22%", height: "16%" },
  { id: 2, name: "TV Console", confidence: 97, top: "32%", left: "28%", width: "36%", height: "26%" },
  { id: 3, name: "Armchair", confidence: 94, top: "42%", left: "70%", width: "24%", height: "42%" },
  { id: 4, name: "Floor Lamp", confidence: 91, top: "16%", left: "60%", width: "7%", height: "44%" },
];

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
      {isRunning && (
        <>
          <div className="tru-ai-scanner-overlay">
            <div className="tru-ai-scanner-line" />
          </div>
          {/* Furniture detection boxes */}
          {FURNITURE_POSITIONS.slice(0, visibleCount).map((item) => (
            <div 
              key={item.id}
              className="tru-ai-detection-box"
              style={{ 
                top: item.top, 
                left: item.left, 
                width: item.width, 
                height: item.height 
              }}
            >
              <span className="tru-ai-detection-corner tru-ai-corner-tl" />
              <span className="tru-ai-detection-corner tru-ai-corner-tr" />
              <span className="tru-ai-detection-corner tru-ai-corner-bl" />
              <span className="tru-ai-detection-corner tru-ai-corner-br" />
              <span className="tru-ai-detection-label">
                {item.name}
                <span className="tru-ai-detection-confidence">{item.confidence}%</span>
              </span>
            </div>
          ))}
        </>
      )}
      {/* Start Demo button as overlay - top right */}
      <button 
        className="tru-ai-scanner-start-btn"
        onClick={onStartDemo}
      >
        <Sparkles className="w-3.5 h-3.5" />
        {isRunning ? "Running..." : "Start AI Analysis Demo"}
      </button>
    </div>
  );
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
        {displayItems.map((item, i) => (
          <div 
            key={`${item.name}-${i}`} 
            className={`tru-ai-live-item ${!isRunning ? 'is-sample' : ''}`}
            style={{ animationDelay: isRunning ? `${i * 0.1}s` : '0s' }}
          >
            <img src={item.image} alt={item.name} />
            <span className="tru-ai-live-item-name">{item.name}</span>
            <span className="tru-ai-live-item-weight">{item.weight} lbs</span>
          </div>
        ))}
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
    </div>
  );
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
  { lat: 40.7128, lng: -74.0060 },   // NYC
  { lat: 40.4406, lng: -79.9959 },   // Pittsburgh
  { lat: 39.7684, lng: -86.1581 },   // Indianapolis
  { lat: 38.6270, lng: -90.1994 },   // St. Louis
  { lat: 39.0997, lng: -94.5786 },   // Kansas City
  { lat: 35.4676, lng: -97.5164 },   // Oklahoma City
  { lat: 35.0844, lng: -106.6504 },  // Albuquerque
  { lat: 33.4484, lng: -112.0740 },  // Phoenix
  { lat: 34.0522, lng: -118.2437 },  // LA
];

// Note: useTruckAnimation hook preserved for use on other pages (e.g., live tracking)
// Homepage now uses static demo preview - no animation needed

// Route Overview Panel - Free OpenStreetMap static image (no API key needed)
function RouteOverviewPanel() {
  // Use free static map from OpenStreetMap tile server via a simple image approach
  // Shows LA to NY corridor at a zoom that fits both cities
  const staticMapUrl = `https://maps.geoapify.com/v1/staticmap?style=dark-matter-dark-grey&width=420&height=480&center=lonlat:-95,38&zoom=3.8&marker=lonlat:-118.24,34.05;color:%2322c55e;size:small|lonlat:-74.00,40.71;color:%23ef4444;size:small&apiKey=`;

  // Fallback: use a canvas-drawn map if no API key
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;
    
    // Dark background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);
    
    // Simple US outline/grid lines for context
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
    }
    for (let i = 0; i < h; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }
    
    // Convert rough lat/lng to canvas coords (simple mercator approximation for continental US)
    const toCanvas = (lng: number, lat: number): [number, number] => {
      const x = ((lng + 130) / 65) * w;
      const y = ((50 - lat) / 25) * h;
      return [x, y];
    };
    
    // Route waypoints
    const cities: [number, number][] = [
      [-118.24, 34.05], [-114.29, 34.14], [-111.65, 35.19],
      [-106.65, 35.08], [-101.83, 35.22], [-97.52, 35.47],
      [-94.58, 39.10], [-90.20, 38.63], [-86.16, 39.77],
      [-82.98, 40.00], [-79.99, 40.44], [-74.00, 40.71],
    ];
    
    // Draw route line
    ctx.strokeStyle = '#4285F4';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#4285F4';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    cities.forEach((city, i) => {
      const [x, y] = toCanvas(city[0], city[1]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Origin marker (green)
    const [ox, oy] = toCanvas(-118.24, 34.05);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath(); ctx.arc(ox, oy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('LA', ox + 10, oy + 3);
    
    // Destination marker (red)
    const [dx, dy] = toCanvas(-74.00, 40.71);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(dx, dy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('NYC', dx + 10, dy + 3);
    
    // Truck position (middle of route, yellow)
    const mid = cities[Math.floor(cities.length / 2)];
    const [mx, my] = toCanvas(mid[0], mid[1]);
    ctx.fillStyle = '#facc15';
    ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.fill();
    
    // Labels
    ctx.fillStyle = '#ffffff90';
    ctx.font = '10px sans-serif';
    ctx.fillText('ROUTE OVERVIEW', 12, 20);
    ctx.fillText('2,789 mi', w - 70, h - 12);
    
  }, []);
  
  return (
    <div className="tru-tracker-satellite-panel tru-tracker-satellite-enlarged tru-map-window-frame">
      <canvas ref={canvasRef} width={420} height={480} className="w-full h-full" />
    </div>
  );
}

// Truck View Panel - Canvas-based animated truck driving (no API key needed)
function TruckViewPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;
    let frame = 0;
    
    const animate = () => {
      frame++;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      
      // Moving road perspective
      const vanishY = h * 0.35;
      const vanishX = w * 0.5;
      
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, vanishY);
      skyGrad.addColorStop(0, '#0c1222');
      skyGrad.addColorStop(1, '#1a2744');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, vanishY);
      
      // Ground
      const groundGrad = ctx.createLinearGradient(0, vanishY, 0, h);
      groundGrad.addColorStop(0, '#1e293b');
      groundGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, vanishY, w, h - vanishY);
      
      // Road
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(vanishX - 2, vanishY);
      ctx.lineTo(0, h);
      ctx.lineTo(w, h);
      ctx.lineTo(vanishX + 2, vanishY);
      ctx.fill();
      
      // Road edges
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(vanishX - 2, vanishY); ctx.lineTo(w * 0.1, h); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(vanishX + 2, vanishY); ctx.lineTo(w * 0.9, h); ctx.stroke();
      
      // Dashed center line (animated)
      const dashOffset = (frame * 2) % 60;
      for (let i = 0; i < 12; i++) {
        const t = (i * 60 + dashOffset) / (h - vanishY);
        if (t > 1) continue;
        const perspT = t * t; // perspective acceleration
        const y = vanishY + perspT * (h - vanishY);
        const lineLen = 8 + perspT * 20;
        const lineW = 1 + perspT * 3;
        
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = lineW;
        ctx.beginPath();
        ctx.moveTo(vanishX, y);
        ctx.lineTo(vanishX, Math.min(y + lineLen, h));
        ctx.stroke();
      }
      
      // Stars
      ctx.fillStyle = '#ffffff40';
      for (let i = 0; i < 20; i++) {
        const sx = ((i * 97 + 13) % w);
        const sy = ((i * 43 + 7) % (vanishY - 10));
        const twinkle = Math.sin(frame * 0.02 + i) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle * 0.6;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  return (
    <div className="tru-tracker-road-map tru-map-window-frame">
      <canvas ref={canvasRef} width={480} height={480} className="w-full h-full" />
      
      {/* Truck marker - centered, fixed position */}
      <div className="tru-homepage-truck-marker">
        <div className="tru-homepage-truck-glow" />
        <div className="tru-homepage-truck-glow tru-homepage-truck-glow-2" />
        <div className="tru-homepage-truck-icon">
          <Truck className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// Shipment Tracker Section - 3-column layout: Route Overview | Truck View (centered) | Description
function ShipmentTrackerSection({ navigate }: { navigate: (path: string) => void }) {
  // Street View Thumbnail component - tiny corner preview
  const StreetViewThumbnail = () => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    
    // Kansas City position (middle of cross-country route)
    const position = { lat: 39.0997, lng: -94.5786 };
    
    // Use Google Street View Static API directly (publishable key, same as route analysis)
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=120x80&location=${position.lat},${position.lng}&heading=90&pitch=0&fov=100&key=AIzaSyCWDpAPlxVRXnl1w5rz0Df5S3vGsHY6Xoo`;
    
    if (error) return null;
    
    return (
      <div className="tru-streetview-thumbnail">
        {!loaded && (
          <div className="tru-streetview-loading">
            <Globe className="w-3 h-3 animate-pulse" />
          </div>
        )}
        <img 
          src={streetViewUrl}
          alt="Street View"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={loaded ? 'opacity-100' : 'opacity-0'}
        />
        <span className="tru-streetview-label">Street View</span>
      </div>
    );
  };

  return (
    <section className="tru-tracker-section">
      <div className="tru-tracker-inner">
        <div className="tru-tracker-header-row">
          {/* Route Overview - LEFT */}
          <div className="tru-tracker-satellite-left">
            <RouteOverviewPanel />
            <StreetViewThumbnail />
          </div>
          
          {/* Truck View - CENTER (aligned with AI demo above) */}
          <div className="tru-tracker-roadmap-center">
            <TruckViewPanel />
          </div>
          
          {/* Content - RIGHT */}
          <div className="tru-tracker-content-right" style={{ justifyContent: 'center' }}>
            <div className="tru-ai-headline-block">
              <h2 className="tru-ai-main-headline">
                Track. Monitor.<br />
                <span className="tru-ai-headline-accent">Arrive.</span>
              </h2>
              <p className="tru-ai-subheadline">
                Know exactly where your belongings are. GPS tracking, live ETAs, and instant updates—from pickup to delivery.
              </p>
            </div>
            
            {/* CTA Button */}
            <button 
              onClick={() => navigate("/site/track")}
              className="tru-ai-cta-btn"
            >
              <MapPin className="w-4 h-4" />
              Track Your Shipment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Trust Compact Section with scroll-triggered staggered reveal
function TrustCompactSection() {
  const [sectionRef, isInView] = useScrollAnimation<HTMLElement>({
    threshold: 0.2,
    rootMargin: "0px",
    triggerOnce: true,
  });

  const stats = [
    { icon: Database, label: "Federal SAFER Data" },
    { icon: CreditCard, label: "Secure Payments" },
    { icon: ShieldCheck, label: "Vetted Movers" },
  ];

  const badges = ["FMCSA Authorized", "USDOT Compliant", "Insured & Bonded"];

  return (
    <section className="tru-trust-compact" ref={sectionRef}>
      <div className="tru-trust-compact-inner">
        <div className="tru-trust-compact-stats">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className={`tru-trust-compact-stat ${isInView ? 'in-view' : ''}`}
              style={{ '--stagger-index': index } as React.CSSProperties}
            >
              <stat.icon className="w-5 h-5" />
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="tru-trust-compact-badges">
          {badges.map((badge, index) => (
            <span 
              key={badge} 
              className={`tru-trust-compact-badge ${isInView ? 'in-view' : ''}`}
              style={{ '--stagger-index': index + 3 } as React.CSSProperties}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// Steps Compact Section with parallax effect
function StepsCompactSection({ navigate }: { navigate: (path: string) => void }) {
  const [sectionRef, isInView] = useScrollAnimation<HTMLElement>({
    threshold: 0.1,
    rootMargin: "0px",
    triggerOnce: true,
  });

  const steps = [
    { num: 1, title: "Build Your Inventory", desc: "AI-powered tools calculate weight and volume from real data." },
    { num: 2, title: "Get Carrier Matches", desc: "We analyze SAFER Web data to find the best fit." },
    { num: 3, title: "Book with Confidence", desc: "Secure payment. Licensed, vetted movers only." },
  ];

  return (
    <section className="tru-steps-compact" ref={sectionRef}>
      <div className="tru-steps-compact-inner">
        <div className="tru-steps-compact-header">
          <span className="tru-steps-compact-badge">How It Works</span>
          <h2 className="tru-steps-compact-title">Get matched with the right mover.</h2>
        </div>
        <div className="tru-steps-compact-grid">
          {steps.map((step, index) => (
            <div 
              key={step.num}
              className={`tru-steps-compact-card tru-steps-parallax-card ${isInView ? 'in-view' : ''}`}
              style={{ '--card-index': index } as React.CSSProperties}
              onClick={() => navigate("/site/online-estimate")}
            >
              <div className="tru-steps-compact-num">{step.num}</div>
              <div className="tru-steps-compact-card-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 tru-steps-compact-arrow" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
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
    triggerOnce: true,
  });
  
  // Parallax effects for hero elements
  const [parallaxHeadlineRef, headlineParallax] = useParallax<HTMLDivElement>({ speed: 0.15, direction: "up" });
  const [parallaxFormRef, formParallax] = useParallax<HTMLDivElement>({ speed: 0.05, direction: "up" });
  
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
      setScanVisibleCount(prev => prev >= SCAN_DEMO_ITEMS.length ? prev : prev + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, [scanDemoRunning]);
  
  // Form state
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
    }
  ];
  
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
      'Office': 4000,
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

  const handleLeadCaptureSubmit = (data: { name: string; email: string; phone: string }) => {
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
      case 1: return fromZip.length === 5 && fromCity && toZip.length === 5 && toCity && moveDate !== null;
      case 2: return name.trim().length >= 2 && email.includes("@") && isValidPhoneNumber(phone);
      case 3: return true; // Always can proceed from method selection
      default: return false;
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
      {/* Sticky Header Block - TruMove Command Center */}
      <div className="sticky top-[6.375rem] z-40">
        <header className="tracking-header">
          {/* Left - Logo & Title */}
          <div className="flex items-center gap-3">
            <img 
              src={logoImg} 
              alt="TruMove" 
              className="h-6 brightness-0 invert"
            />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/90">
              TruMove Command Center
            </span>
          </div>

          {/* Right - Session ID */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] text-white/80 uppercase tracking-wider">Session ID</div>
              <div className="text-sm font-mono text-white">TM-{String(Date.now()).slice(-8)}</div>
            </div>
          </div>
        </header>
      </div>

      <div className="tru-page-frame">
        <div className="tru-page-inner">
        {/* HERO - Full Width Background Wrapper */}
        <div className="tru-hero-wrapper">
          {/* Full-width background image with parallax */}
          <div className="tru-hero-bg">
            <img 
              src={heroFamilyMove} 
              alt="Happy family moving into their new home" 
              className="tru-hero-bg-image"
            />
            <div className="tru-hero-bg-overlay" />
          </div>
          
          <section className="tru-hero tru-hero-split" ref={heroSectionRef}>
            {/* Particle Background Effect */}
            <HeroParticles />
            <div className="tru-hero-particles-overlay" />
            
            
            {/* Full-Page Analyzing Overlay */}
            {isAnalyzing && (
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
                          }}
                        />
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
                        {fromCoords && toCoords && routeGeometry && (
                          <AnimatedRouteMap
                            fromCoords={fromCoords}
                            toCoords={toCoords}
                            routeGeometry={routeGeometry}
                            progress={routeProgress}
                          />
                        )}
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
                          }}
                        />
                        <div className="tru-analyze-strip-city">{toCity}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LEFT COLUMN: Text Content */}
            <div className="tru-hero-left-column">
              <img src={logoImg} alt="TruMove" className="tru-hero-logo" />
              <h1 className="tru-hero-headline">
                The Smarter Way To <span className="tru-hero-accent">Move</span>
              </h1>
              <p className="tru-hero-feature-line">
                AI-powered inventory · FMCSA-vetted carriers · Live video consults · Shipment Tracking
              </p>
            </div>

            {/* RIGHT COLUMN: Form + CTAs */}
            <div 
              ref={parallaxFormRef}
              className="tru-hero-right-column"
              style={{
                transform: `translateY(${formParallax.y}px)`,
              }}
            >
              <div className="tru-hero-form-panel" ref={quoteBuilderRef}>
                {/* TOP ROW: Form Card */}
                <div className="tru-floating-form-card">
                  {/* Progress bar removed per user request */}
                  
                  <div className="tru-qb-form-header tru-qb-form-header-pill">
                    <div className="tru-qb-form-title-group animate-fade-scale-in opacity-0">
                      <span className="tru-qb-form-title tru-qb-form-title-large" style={{ animationDelay: '0.1s' }}>
                        Let's Get Moving
                      </span>
                      <span className="tru-qb-form-subtitle-compact" style={{ animationDelay: '0.25s' }}>
                        FMCSA-vetted carriers, AI precision
                      </span>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="tru-floating-form-content">

                    {/* Step 1: Route & Date */}
                    {step === 1 && (
                      <div className="tru-qb-step-content" key="step-1">
                        
                        
                        {/* FROM + TO Row - Side by Side with Route Connector */}
                        <div className="tru-qb-location-row">
                        <div className="tru-qb-location-col">
                            <p className="tru-qb-section-label"><MapPin className="w-3 h-3" /> From</p>
                            <div className="tru-qb-input-wrap tru-qb-zip-wrap tru-qb-input-enhanced">
                              <LocationAutocomplete
                                value={fromZip}
                                onValueChange={(val) => {
                                  setFromZip(val);
                                  if (val.length > 0 && !isEngaged) setIsEngaged(true);
                                }}
                                onLocationSelect={async (city, zip, fullAddress) => {
                                  setFromZip(zip);
                                  setFromCity(city);
                                  setFromLocationDisplay(fullAddress || `${city} ${zip}`);
                                  const state = city.split(',')[1]?.trim() || '';
                                  triggerCarrierSearch(state);
                                  // Geocode for static map
                                  const coords = await geocodeLocation(`${city} ${zip}`);
                                  if (coords) setFromCoords(coords);
                                }}
                                placeholder="City or ZIP"
                                autoFocus
                              />
                            </div>
                          </div>

                          {/* Route Connector */}
                          <div className="tru-qb-route-connector">
                            <ArrowRight className="w-4 h-4" />
                          </div>

                          <div className="tru-qb-location-col">
                            <p className="tru-qb-section-label"><MapPin className="w-3 h-3" /> To</p>
                            <div className="tru-qb-input-wrap tru-qb-zip-wrap tru-qb-input-enhanced">
                              <LocationAutocomplete
                                value={toZip}
                                onValueChange={(val) => {
                                  setToZip(val);
                                  if (val.length > 0 && !isEngaged) setIsEngaged(true);
                                }}
                                onLocationSelect={async (city, zip, fullAddress) => {
                                  setToZip(zip);
                                  setToCity(city);
                                  setToLocationDisplay(fullAddress || `${city} ${zip}`);
                                  if (fromCity) {
                                    const state = city.split(',')[1]?.trim() || '';
                                    triggerCarrierSearch(state);
                                  }
                                  // Geocode for static map
                                  const coords = await geocodeLocation(`${city} ${zip}`);
                                  if (coords) setToCoords(coords);
                                }}
                                placeholder="City or ZIP"
                              />
                            </div>
                          </div>
                        </div>


                        {/* Move Date */}
                        <p className="tru-qb-section-label" style={{ marginTop: '1.25rem' }}>Move Date</p>
                        <div className="tru-qb-input-wrap">
                          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                            <PopoverTrigger asChild>
                              <button type="button" className="tru-qb-date-btn">
                                <CalendarIcon className="w-5 h-5" />
                                <span>{moveDate ? format(moveDate, "MMMM d, yyyy") : "Select a date"}</span>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="form-date-popover" align="center">
                              <CalendarComponent
                                mode="single"
                                selected={moveDate || undefined}
                                onSelect={(date) => {
                                  setMoveDate(date || null);
                                  setDatePopoverOpen(false);
                                }}
                                disabled={(date) => date < new Date()}
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <button
                          type="button"
                          className={`tru-qb-continue tru-engine-btn ${isSearchingCarriers || isAnalyzing ? 'is-scanning' : ''}`}
                          disabled={!canContinue() || isSearchingCarriers || isAnalyzing}
                          onClick={goNext}
                        >
                          <Scan className="w-4 h-4 tru-btn-scan" />
                          <span>{isSearchingCarriers || isAnalyzing ? 'Analyzing...' : 'Analyze Route'}</span>
                          {!isSearchingCarriers && !isAnalyzing && <ArrowRight className="w-5 h-5 tru-btn-arrow" />}
                        </button>
                        
                        {/* Micro-copy below Analyze Route */}
                        <p className="tru-qb-microcopy">A moving specialist will call you shortly.</p>
                        
                        {/* Track My Move Button */}
                        {fromLocationDisplay && toLocationDisplay && (
                          <button
                            type="button"
                            className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/50 hover:border-primary/40 hover:shadow-[0_0_6px_hsl(var(--primary)/0.08)] rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
                            onClick={() => {
                              localStorage.setItem('trumove_pending_route', JSON.stringify({
                                originAddress: fromLocationDisplay,
                                destAddress: toLocationDisplay,
                              }));
                              navigate('/site/track');
                            }}
                          >
                            <Truck className="w-4 h-4" />
                            <span>Track My Move</span>
                          </button>
                        )}
                      </div>
                    )}


                    {/* Step 2: Contact Information (moved from step 3) */}
                    {step === 2 && (
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
                              onChange={(e) => { setName(e.target.value); setFormError(""); }}
                              autoFocus
                            />
                          </div>
                          
                          <div className="tru-qb-input-wrap">
                            <input
                              type="email"
                              className={`tru-qb-input ${formError && !email.includes('@') ? 'has-error' : ''}`}
                              placeholder="Email address"
                              value={email}
                              onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
                              onKeyDown={handleKeyDown}
                            />
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
                              onKeyDown={handleKeyDown}
                            />
                          </div>
                        </div>

                        {formError && (
                          <p className="tru-qb-error">{formError}</p>
                        )}

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
                          }}
                        >
                          <span>Continue</span>
                          <ArrowRight className="w-5 h-5 tru-btn-arrow" />
                        </button>

                        <button type="button" className="tru-qb-back" onClick={goBack}>
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        
                        <p className="tru-qb-disclaimer-bottom">
                          <Lock className="w-3 h-3 inline" /> Your info is secure & never sold.
                        </p>
                      </div>
                    )}

                    {/* Step 3: Choose Estimate Method */}
                    {step === 3 && !submitted && (
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
                            }}
                          >
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
                            }}
                          >
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
                            }}
                          >
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
                    )}

                    {/* Post-Submission Confirmation - shown after selecting a method */}
                    {submitted && (
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
                            onClick={() => navigate("/site/scan-room")}
                          >
                            <Scan className="w-5 h-5" />
                            <div className="tru-qb-option-text">
                              <span className="tru-qb-option-title">AI Inventory</span>
                              <span className="tru-qb-option-desc">Upload photos or video</span>
                            </div>
                          </button>
                          <button 
                            type="button" 
                            className="tru-qb-option-card tru-qb-option-card-outline"
                            onClick={() => navigate("/site/online-estimate")}
                          >
                            <Boxes className="w-5 h-5" />
                            <div className="tru-qb-option-text">
                              <span className="tru-qb-option-title">Manual Builder</span>
                              <span className="tru-qb-option-desc">Select items room-by-room</span>
                            </div>
                          </button>
                          <button 
                            type="button" 
                            className="tru-qb-option-card tru-qb-option-card-outline"
                            onClick={() => navigate("/site/book")}
                          >
                            <Video className="w-5 h-5" />
                            <div className="tru-qb-option-text">
                              <span className="tru-qb-option-title">Video Consult</span>
                              <span className="tru-qb-option-desc">Schedule a walkthrough</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
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

              
              {/* Secondary call button */}
              <a href="tel:+16097277647" className="tru-hero-call-btn">
                <Phone className="w-4 h-4" />
                Call a moving specialist
              </a>
            </div>
          </section>
        </div> {/* End tru-hero-wrapper */}

        {/* BLACK STATS STRIP - Section Divider */}
        <StatsStrip />

          {/* START YOUR AI INVENTORY ANALYSIS - Enhanced with Preview */}
          <section className="tru-ai-steps-section">
            <div className="tru-ai-steps-inner">
              {/* Header row: info on left, previews on right */}
              <div className="tru-ai-header-row" ref={scanPreviewRef}>
                {/* LEFT: Description content */}
                <div className="tru-ai-content-left" style={{ justifyContent: 'center' }}>
                  {/* Premium headline block */}
                  <div className="tru-ai-headline-block animate-fade-scale-in opacity-0" style={{ animationDelay: '0ms' }}>
                    <h2 className="tru-ai-main-headline">
                      Scan. Catalog.<br />
                      <span className="tru-ai-headline-accent">Estimate.</span>
                    </h2>
                    <p className="tru-ai-subheadline">
                      Point your camera at any room. Our AI identifies every item and calculates your move in seconds—not hours.
                    </p>
                  </div>
                  
                  {/* CTA Button */}
                  <button 
                    onClick={() => navigate("/site/scan-room")}
                    className="tru-ai-cta-btn animate-fade-scale-in opacity-0"
                    style={{ animationDelay: '350ms' }}
                  >
                    <Home className="w-4 h-4" />
                    Scan Your Home
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                {/* CENTER: Room Scanner Demo */}
                <div className={`tru-ai-scanner-center ${scanDemoRunning ? 'is-running' : ''}`}>
                  <ScannerPreview 
                    isRunning={scanDemoRunning} 
                    visibleCount={scanVisibleCount}
                    onStartDemo={() => {
                      setScanDemoRunning(prev => !prev);
                      setTimeout(() => {
                        scanPreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }} 
                  />
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


        </div>
      </div>



      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={leadCaptureOpen}
        onClose={() => setLeadCaptureOpen(false)}
        onSubmit={handleLeadCaptureSubmit}
        targetFlow={leadCaptureTarget}
      />

    </SiteShell>
  );
}
