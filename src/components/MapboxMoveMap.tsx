import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { US_CENTER, US_ZOOM } from '@/lib/leafletConfig';
import { Maximize2, Minimize2, Loader2 } from 'lucide-react';

interface MapboxMoveMapProps {
  fromZip?: string;
  toZip?: string;
  visible?: boolean;
}

const ZIP_COORDS: Record<string, [number, number]> = {
  "010": [-72.6, 42.1], "011": [-72.6, 42.1], "012": [-73.2, 42.5], "013": [-72.6, 42.3],
  "014": [-71.8, 42.3], "015": [-71.8, 42.3], "016": [-71.8, 42.3], "017": [-71.8, 42.3],
  "018": [-71.1, 42.4], "019": [-70.9, 42.5],
  "020": [-71.0, 42.4], "021": [-71.1, 42.4], "022": [-71.1, 42.3], "023": [-71.0, 42.2],
  "024": [-71.2, 42.5], "025": [-70.9, 42.5], "026": [-71.4, 41.8], "027": [-71.4, 41.8],
  "028": [-71.4, 41.8], "029": [-71.3, 41.6],
  "030": [-71.5, 43.2], "031": [-71.5, 43.0], "032": [-71.5, 43.2], "033": [-71.5, 43.2],
  "040": [-70.3, 43.7], "050": [-72.9, 44.3], "060": [-72.7, 41.8],
  "070": [-74.2, 40.8], "080": [-74.9, 39.9],
  "100": [-74.0, 40.7], "101": [-73.9, 40.8], "102": [-74.0, 40.7], "110": [-73.7, 40.8],
  "111": [-73.8, 40.7], "112": [-73.9, 40.7], "120": [-73.9, 42.7], "130": [-76.2, 43.1],
  "140": [-78.9, 42.9], "150": [-79.9, 40.4], "160": [-79.5, 41.4], "170": [-76.9, 40.3],
  "180": [-75.4, 40.6], "190": [-75.2, 40.0], "191": [-75.2, 40.0],
  "200": [-77.0, 38.9], "201": [-77.0, 38.9], "202": [-77.0, 38.9],
  "210": [-76.6, 39.3], "212": [-76.6, 39.3], "220": [-77.5, 38.8],
  "230": [-77.5, 37.5], "240": [-79.9, 37.3],
  "270": [-78.6, 35.8], "280": [-80.8, 35.2], "290": [-79.9, 34.0],
  "300": [-84.4, 33.8], "301": [-84.4, 33.8], "302": [-84.4, 33.8], "303": [-84.4, 33.8],
  "310": [-81.1, 32.1], "320": [-81.7, 30.3], "321": [-81.0, 28.5],
  "327": [-81.4, 28.5], "328": [-81.4, 28.4],
  "330": [-80.2, 25.8], "331": [-80.3, 25.9], "332": [-80.1, 25.8], "333": [-80.2, 25.8],
  "334": [-80.1, 26.4], "335": [-80.1, 26.2], "336": [-82.5, 27.9], "337": [-82.6, 27.8],
  "340": [-80.1, 26.0], "341": [-82.7, 28.0], "349": [-81.8, 26.6],
  "350": [-86.8, 33.5], "360": [-86.3, 32.4], "370": [-86.8, 36.2],
  "380": [-90.0, 35.1], "400": [-85.8, 38.3], "410": [-84.5, 38.0],
  "430": [-83.0, 39.9], "440": [-81.7, 41.5], "450": [-84.2, 39.8],
  "460": [-86.2, 39.8], "470": [-85.7, 41.1], "480": [-83.0, 42.3],
  "490": [-85.7, 42.3], "500": [-93.6, 41.6], "510": [-95.9, 41.3],
  "520": [-91.5, 41.7], "530": [-89.4, 43.1], "540": [-91.5, 44.9],
  "550": [-93.3, 44.9], "560": [-94.2, 44.2], "570": [-96.7, 43.5],
  "580": [-96.8, 46.9], "590": [-110.4, 45.8],
  "600": [-87.6, 41.9], "601": [-87.6, 41.9], "602": [-87.6, 41.9],
  "610": [-88.1, 41.8], "620": [-89.6, 38.6],
  "630": [-90.2, 38.6], "640": [-94.6, 39.1], "650": [-92.3, 38.6],
  "660": [-94.6, 39.0], "670": [-97.3, 37.7],
  "680": [-95.9, 41.3], "700": [-90.1, 29.9], "710": [-92.0, 30.2],
  "720": [-92.3, 34.7], "730": [-97.5, 35.5], "740": [-96.0, 36.2],
  "750": [-96.8, 32.8], "751": [-96.8, 32.8], "752": [-96.8, 32.8],
  "760": [-97.3, 32.7], "770": [-95.4, 29.8], "771": [-95.4, 29.8], "772": [-95.4, 29.8],
  "780": [-98.5, 29.4], "790": [-101.8, 35.2], "798": [-106.5, 31.8],
  "800": [-104.9, 39.7], "801": [-104.9, 39.7], "802": [-104.9, 39.7],
  "820": [-104.8, 41.1], "832": [-116.2, 43.6],
  "840": [-111.9, 40.8], "850": [-112.1, 33.4], "851": [-112.1, 33.4], "852": [-112.1, 33.4],
  "870": [-106.6, 35.1], "880": [-106.5, 32.3],
  "889": [-115.1, 36.2], "890": [-115.1, 36.2], "891": [-115.1, 36.2],
  "900": [-118.2, 34.1], "901": [-118.2, 34.1], "902": [-118.4, 34.0],
  "910": [-118.3, 34.1], "920": [-117.2, 32.7], "921": [-117.2, 32.7],
  "930": [-119.7, 34.4], "940": [-122.4, 37.8], "941": [-122.4, 37.8],
  "950": [-121.9, 37.3], "960": [-121.5, 38.6],
  "970": [-122.7, 45.5], "980": [-122.3, 47.6], "981": [-122.3, 47.6], "982": [-122.3, 47.6],
  "990": [-117.4, 47.7], "995": [-134.4, 58.3], "996": [-149.9, 61.2],
  "967": [-155.5, 19.5], "968": [-157.9, 21.3],
};

function getZipCoords(zip: string): [number, number] | null {
  if (!zip || zip.length < 3) return null;
  const prefix3 = zip.substring(0, 3);
  if (ZIP_COORDS[prefix3]) return ZIP_COORDS[prefix3];
  const prefix2 = zip.substring(0, 2) + "0";
  if (ZIP_COORDS[prefix2]) return ZIP_COORDS[prefix2];
  return null;
}

const ZIP_NAMES: Record<string, string> = {
  "320": "Jacksonville, FL", "321": "Orlando, FL", "327": "Orlando, FL",
  "330": "Miami, FL", "331": "Miami, FL", "333": "Fort Lauderdale, FL",
  "336": "Tampa, FL", "337": "St. Petersburg, FL", "349": "Fort Myers, FL",
  "100": "New York, NY", "101": "New York, NY", "112": "Brooklyn, NY",
  "200": "Washington, DC", "300": "Atlanta, GA", "600": "Chicago, IL",
  "750": "Dallas, TX", "770": "Houston, TX", "850": "Phoenix, AZ",
  "900": "Los Angeles, CA", "920": "San Diego, CA", "940": "San Francisco, CA",
  "980": "Seattle, WA", "800": "Denver, CO", "890": "Las Vegas, NV",
};

function getLocationName(zip: string): string {
  if (!zip || zip.length < 3) return '';
  return ZIP_NAMES[zip.substring(0, 3)] || '';
}

async function fetchDrivingRoute(from: [number, number], to: [number, number]): Promise<[number, number][] | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[0]},${from[1]};${to[0]},${to[1]}?geometries=geojson&overview=full`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.routes?.[0]) return data.routes[0].geometry.coordinates as [number, number][];
    return null;
  } catch { return null; }
}

function createArcLine(start: [number, number], end: [number, number], steps: number): [number, number][] {
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lng = start[0] + (end[0] - start[0]) * t;
    const lat = start[1] + (end[1] - start[1]) * t;
    const dist = Math.abs(end[0] - start[0]);
    const arcHeight = Math.min(dist * 0.1, 5);
    const arc = Math.sin(t * Math.PI) * arcHeight;
    coords.push([lng, lat + arc]);
  }
  return coords;
}

export default function MapboxMoveMap({ fromZip = '', toZip = '', visible = true }: MapboxMoveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fromCoords = useMemo(() => getZipCoords(fromZip), [fromZip]);
  const toCoords = useMemo(() => getZipCoords(toZip), [toZip]);
  const fromName = useMemo(() => getLocationName(fromZip), [fromZip]);
  const toName = useMemo(() => getLocationName(toZip), [toZip]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      center: US_CENTER,
      zoom: US_ZOOM,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);
    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  // Fetch route
  useEffect(() => {
    if (!fromCoords || !toCoords) { setRouteCoords([]); return; }
    setIsLoading(true);
    fetchDrivingRoute(fromCoords, toCoords).then(coords => {
      setRouteCoords(coords || createArcLine(fromCoords, toCoords, 100));
      setIsLoading(false);
    });
  }, [fromCoords, toCoords]);

  // Update map layers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    layersRef.current.forEach(l => map.removeLayer(l));
    layersRef.current = [];

    if (fromCoords && !toCoords) {
      map.flyTo([fromCoords[1], fromCoords[0]], 10, { duration: 1.5 });
      const m = L.marker([fromCoords[1], fromCoords[0]], {
        icon: L.divIcon({
          className: 'mapbox-origin-marker-container',
          html: `<div class="mapbox-origin-marker"></div>${fromName ? `<div class="mapbox-origin-label">${fromName}</div>` : ''}<div class="mapbox-waiting-label">Enter destination...</div>`,
          iconSize: [120, 40], iconAnchor: [60, 20],
        }),
      }).addTo(map);
      layersRef.current.push(m);
    } else if (fromCoords && toCoords && routeCoords.length >= 2) {
      const routeLatLngs = routeCoords.map(([lng, lat]) => [lat, lng] as [number, number]);
      
      const bg = L.polyline(routeLatLngs, { color: '#000000', weight: 8, opacity: 0.7 }).addTo(map);
      const fg = L.polyline(routeLatLngs, { color: '#00e5a0', weight: 4, opacity: 1 }).addTo(map);
      layersRef.current.push(bg, fg);

      if (fromName) {
        const m = L.marker([fromCoords[1], fromCoords[0]], {
          icon: L.divIcon({ className: 'mapbox-marker-label-only', html: `<div class="mapbox-marker-label">${fromName}</div>`, iconSize: [100, 20], iconAnchor: [50, 10] }),
        }).addTo(map);
        layersRef.current.push(m);
      }
      if (toName) {
        const m = L.marker([toCoords[1], toCoords[0]], {
          icon: L.divIcon({ className: 'mapbox-marker-label-only', html: `<div class="mapbox-marker-label">${toName}</div>`, iconSize: [100, 20], iconAnchor: [50, 10] }),
        }).addTo(map);
        layersRef.current.push(m);
      }

      const lats = routeCoords.map(c => c[1]);
      const lngs = routeCoords.map(c => c[0]);
      map.fitBounds(L.latLngBounds([Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]), { padding: [80, 80], maxZoom: 10 });
    } else if (!fromCoords && !toCoords) {
      map.flyTo(US_CENTER, US_ZOOM, { duration: 1 });
    }
  }, [fromCoords, toCoords, routeCoords, fromName, toName]);

  const handleExpandClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (fromCoords && toCoords) setIsExpanded(prev => !prev);
  }, [fromCoords, toCoords]);

  return (
    <div className={`mapbox-move-map-wrapper ${isExpanded ? 'expanded' : ''}`}>
      {isLoading && (
        <div className="mapbox-loading-overlay">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapRef} className="mapbox-move-map w-full h-full" />
      {fromCoords && toCoords && (
        <button onClick={handleExpandClick} className="map-expand-button">
          {isExpanded ? (
            <><Minimize2 className="w-4 h-4" /><span>Collapse</span></>
          ) : (
            <><Maximize2 className="w-4 h-4" /><span>Expand</span></>
          )}
        </button>
      )}
    </div>
  );
}
