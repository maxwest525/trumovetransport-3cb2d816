// Centralized MapTiler configuration
// Publishable API key — safe to store in code
export const MAPTILER_KEY = 'X6zFH8Vcg9bMuUCrXFWU';

// Static map URL generator
export function getStaticMapUrl(
  lng: number,
  lat: number,
  zoom: number = 14,
  width: number = 400,
  height: number = 300,
  style: 'satellite' | 'streets-v2' | 'toner-v2' = 'satellite'
): string {
  const format = style === 'satellite' ? 'jpg' : 'png';
  return `https://api.maptiler.com/maps/${style}/static/${lng},${lat},${zoom}/${width}x${height}@2x.${format}?key=${MAPTILER_KEY}`;
}

// Geocoding helpers
export async function geocodeForward(query: string, limit: number = 5): Promise<GeocodingResult[]> {
  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_KEY}&country=us&limit=${limit}&language=en`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features || []).map((f: any) => ({
      name: f.place_name || f.text || '',
      lng: f.center[0],
      lat: f.center[1],
      city: f.context?.find((c: any) => c.id?.startsWith('place'))?.text || f.text || '',
      state: f.context?.find((c: any) => c.id?.startsWith('region'))?.short_code?.replace('US-', '') || '',
      zip: f.context?.find((c: any) => c.id?.startsWith('postcode'))?.text || '',
      fullAddress: f.place_name || '',
    }));
  } catch {
    return [];
  }
}

export async function geocodeReverse(lng: number, lat: number): Promise<GeocodingResult | null> {
  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}&language=en`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const f = data.features?.[0];
    if (!f) return null;
    return {
      name: f.place_name || f.text || '',
      lng: f.center[0],
      lat: f.center[1],
      city: f.context?.find((c: any) => c.id?.startsWith('place'))?.text || f.text || '',
      state: f.context?.find((c: any) => c.id?.startsWith('region'))?.short_code?.replace('US-', '') || '',
      zip: f.context?.find((c: any) => c.id?.startsWith('postcode'))?.text || '',
      fullAddress: f.place_name || '',
    };
  } catch {
    return null;
  }
}

export interface GeocodingResult {
  name: string;
  lng: number;
  lat: number;
  city: string;
  state: string;
  zip: string;
  fullAddress: string;
}
