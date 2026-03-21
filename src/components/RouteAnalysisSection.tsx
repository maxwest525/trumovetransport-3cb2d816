import { MapPin, Route, Radar, Truck, CheckCircle, Globe } from "lucide-react";

interface RouteAnalysisSectionProps {
  fromCity: string;
  toCity: string;
  distance: number;
  isAnalyzing?: boolean;
  fromCoords?: [number, number] | null;
  toCoords?: [number, number] | null;
}

export default function RouteAnalysisSection({ 
  fromCity, 
  toCity, 
  distance, 
  isAnalyzing = false,
  fromCoords = null,
  toCoords = null
}: RouteAnalysisSectionProps) {
  const hasRoute = fromCity && toCity && distance > 0;

  // Always visible - show placeholders when no data
  return (
    <section className="tru-route-analysis-section tru-route-analysis-permanent">
      <div className="tru-route-analysis-inner">
        <div className="tru-route-analysis-header">
          <CheckCircle className={`w-5 h-5 ${hasRoute ? 'text-primary' : 'text-muted-foreground'}`} />
          <h3 className="tru-route-analysis-title">
            {isAnalyzing ? "Analyzing your move..." : "Building your personalized move profile"}
          </h3>
        </div>

        <p className="tru-route-analysis-desc">
          We validate cities, analyze distance and access, prepare carrier matching, and estimate weight and volume.
        </p>

        <div className="tru-route-analysis-grid">
          {/* Origin */}
          <div className={`tru-route-analysis-location ${fromCity ? 'is-validated' : ''}`}>
            <div className="tru-route-location-thumb">
              {fromCoords ? (
                <img 
                  src={`https://api.maptiler.com/maps/satellite/static/${fromCoords[0]},${fromCoords[1]},14/100x100@2x.jpg?key=X6zFH8Vcg9bMuUCrXFWU`}
                  alt="Origin"
                  className="tru-route-location-map"
                />
              ) : (
                <div className="tru-route-location-icon-placeholder">
                  <MapPin className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="tru-route-location-content">
              <span className="tru-route-location-label">Origin</span>
              <span className="tru-route-location-value">
                {fromCity || "Enter origin..."}
              </span>
            </div>
            {fromCity && <CheckCircle className="w-4 h-4 tru-route-check" />}
          </div>

          {/* Distance Badge */}
          <div className={`tru-route-analysis-distance-badge ${distance > 0 ? 'has-value' : ''}`}>
            <Route className="w-4 h-4" />
            <span className="tru-route-distance-value">
              {distance > 0 ? `${distance.toLocaleString()} mi` : "- mi"}
            </span>
          </div>

          {/* Destination */}
          <div className={`tru-route-analysis-location ${toCity ? 'is-validated' : ''}`}>
            <div className="tru-route-location-thumb">
              {toCoords ? (
                <img 
                  src={`https://api.maptiler.com/maps/satellite/static/${toCoords[0]},${toCoords[1]},14/100x100@2x.jpg?key=X6zFH8Vcg9bMuUCrXFWU`}
                  alt="Destination"
                  className="tru-route-location-map"
                />
              ) : (
                <div className="tru-route-location-icon-placeholder">
                  <Truck className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="tru-route-location-content">
              <span className="tru-route-location-label">Destination</span>
              <span className="tru-route-location-value">
                {toCity || "Enter destination..."}
              </span>
            </div>
            {toCity && <CheckCircle className="w-4 h-4 tru-route-check" />}
          </div>
        </div>

        {/* Status indicators - always show */}
        <div className="tru-route-analysis-status">
          <div className={`tru-route-status-item ${fromCity && toCity ? 'is-complete' : ''}`}>
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Cities validated</span>
          </div>
          <div className={`tru-route-status-item ${distance > 0 ? 'is-complete' : ''}`}>
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Distance calculated</span>
          </div>
          <div className={`tru-route-status-item ${hasRoute ? 'is-complete' : ''}`}>
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Carrier matching ready</span>
          </div>
        </div>
      </div>
    </section>
  );
}
