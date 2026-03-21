// Centralized Leaflet tile layer configuration
// Uses MapTiler raster XYZ tiles — free tier with API key
import { MAPTILER_KEY } from './maptilerConfig';

export const TILE_LAYERS = {
  // Light theme (default for most maps)
  light: {
    url: `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  // Dark theme (tracking, dashboards)
  dark: {
    url: `https://api.maptiler.com/maps/toner-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  // Voyager (clean, detailed — good for route views)
  voyager: {
    url: `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  // Satellite imagery
  satellite: {
    url: `https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
  },
  // Standard OSM fallback
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
} as const;

export type TileLayerKey = keyof typeof TILE_LAYERS;

// US center coordinates [lat, lng] (Leaflet order)
export const US_CENTER: [number, number] = [39.8283, -98.5795];
export const US_ZOOM = 4;
