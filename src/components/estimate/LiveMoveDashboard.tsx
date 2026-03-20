import { useMemo } from "react";
import { MapPin, Route, Calendar, Package, Scale, DollarSign, Phone, Video, Truck } from "lucide-react";
import MoveMap from "@/components/MoveMap";
import { calculateEstimate, getMoveSize, formatCurrency } from "@/lib/priceCalculator";

interface LiveMoveDashboardProps {
  fromZip: string;
  toZip: string;
  fromCity: string;
  toCity: string;
  distance: number;
  moveDate: Date | null;
  moveType: "local" | "long-distance";
  size: string;
  itemCount: number;
  totalWeight: number;
  hasCar: boolean;
  needsPacking: boolean;
}

export default function LiveMoveDashboard({
  fromZip,
  toZip,
  fromCity,
  toCity,
  distance,
  moveDate,
  moveType,
  size,
  itemCount,
  totalWeight,
  hasCar,
  needsPacking,
}: LiveMoveDashboardProps) {
  // Calculate estimate
  const estimate = useMemo(() => {
    if (!size) return null;
    
    let base = 1500;
    if (size === "Studio") base = 800;
    else if (size === "1 Bedroom") base = 1200;
    else if (size === "2 Bedroom") base = 2200;
    else if (size === "3 Bedroom") base = 3500;
    else if (size === "4+ Bedroom") base = 5000;
    else if (size === "Office") base = 3000;
    
    if (hasCar) base += 800;
    if (needsPacking) base += 600;
    
    // Add distance factor for long-distance
    if (distance > 150) {
      base += Math.floor(distance * 0.5);
    }
    
    const variance = base * 0.2;
    return { min: Math.round(base - variance), max: Math.round(base + variance) };
  }, [size, hasCar, needsPacking, distance]);

  const moveSize = useMemo(() => {
    if (totalWeight > 0) return getMoveSize(totalWeight);
    if (size) return size;
    return null;
  }, [totalWeight, size]);

  const hasRoute = fromZip && toZip;
  const hasAnyData = hasRoute || size || moveDate;

  return (
    <div className="live-dashboard">
      <div className="live-dashboard-header">
        <Truck className="w-5 h-5 text-primary" />
        <span>Your Move at a Glance</span>
      </div>

      {/* Map Section */}
      <div className="live-dashboard-map">
        {hasRoute ? (
          <MoveMap fromZip={fromZip} toZip={toZip} />
        ) : (
          <div className="live-dashboard-map-empty">
            <MapPin className="w-8 h-8 text-muted-foreground/40" />
            <span>Enter your ZIP codes to see your route</span>
          </div>
        )}
      </div>

      {/* Route Details */}
      <div className="live-dashboard-section">
        <div className="live-dashboard-section-title">
          <Route className="w-4 h-4" />
          <span>Route Details</span>
        </div>
        <div className="live-dashboard-details">
          <div className="live-dashboard-row">
            <span className="live-dashboard-label">From</span>
            <span className="live-dashboard-value">
              {fromCity || fromZip || <span className="text-muted-foreground/50">—</span>}
            </span>
          </div>
          <div className="live-dashboard-row">
            <span className="live-dashboard-label">To</span>
            <span className="live-dashboard-value">
              {toCity || toZip || <span className="text-muted-foreground/50">—</span>}
            </span>
          </div>
          {distance > 0 && (
            <div className="live-dashboard-row">
              <span className="live-dashboard-label">Distance</span>
              <span className="live-dashboard-value">{distance.toLocaleString()} miles</span>
            </div>
          )}
          {moveType && (
            <div className="live-dashboard-row">
              <span className="live-dashboard-label">Type</span>
              <span className={`live-dashboard-badge ${moveType === 'long-distance' ? 'is-accent' : ''}`}>
                {moveType === 'long-distance' ? 'Long-Distance' : 'Local'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Move Details */}
      <div className="live-dashboard-section">
        <div className="live-dashboard-section-title">
          <Calendar className="w-4 h-4" />
          <span>Move Details</span>
        </div>
        <div className="live-dashboard-details">
          <div className="live-dashboard-row">
            <span className="live-dashboard-label">Date</span>
            <span className="live-dashboard-value">
              {moveDate ? moveDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : <span className="text-muted-foreground/50">—</span>}
            </span>
          </div>
          <div className="live-dashboard-row">
            <span className="live-dashboard-label">Size</span>
            <span className="live-dashboard-value">
              {moveSize || <span className="text-muted-foreground/50">—</span>}
            </span>
          </div>
          {hasCar && (
            <div className="live-dashboard-row">
              <span className="live-dashboard-label">Vehicle</span>
              <span className="live-dashboard-badge">Included</span>
            </div>
          )}
          {needsPacking && (
            <div className="live-dashboard-row">
              <span className="live-dashboard-label">Packing</span>
              <span className="live-dashboard-badge">Full Service</span>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Summary */}
      {itemCount > 0 && (
        <div className="live-dashboard-section">
          <div className="live-dashboard-section-title">
            <Package className="w-4 h-4" />
            <span>Inventory</span>
          </div>
          <div className="live-dashboard-details">
            <div className="live-dashboard-row">
              <span className="live-dashboard-label">Items</span>
              <span className="live-dashboard-value">{itemCount}</span>
            </div>
            <div className="live-dashboard-row">
              <span className="live-dashboard-label">Est. Weight</span>
              <span className="live-dashboard-value">{totalWeight.toLocaleString()} lbs</span>
            </div>
          </div>
        </div>
      )}

      {/* Estimate */}
      <div className="live-dashboard-estimate">
        <div className="live-dashboard-estimate-header">
          <DollarSign className="w-5 h-5" />
          <span>Your Estimate</span>
        </div>
        {estimate ? (
          <div className="live-dashboard-price">
            <span className="live-dashboard-price-range">
              {formatCurrency(estimate.min)} – {formatCurrency(estimate.max)}
            </span>
            <span className="live-dashboard-price-note">Final price after video consult</span>
          </div>
        ) : (
          <div className="live-dashboard-price-empty">
            <span>Select your move size to see estimate</span>
          </div>
        )}
      </div>

      {/* Quick CTAs */}
      <div className="live-dashboard-ctas">
        <a href="tel:+18001234567" className="live-dashboard-cta">
          <Phone className="w-4 h-4" />
          <span>Call Now</span>
        </a>
        <a href="/book" className="live-dashboard-cta is-primary">
          <Video className="w-4 h-4" />
          <span>Book Video Consult</span>
        </a>
      </div>
    </div>
  );
}
