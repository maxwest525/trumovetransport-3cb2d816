// Centralized Leaflet tile layer configuration
// Uses CartoDB (free, clean, no watermark) + MapTiler satellite

import { MAPTILER_KEY } from './maptilerConfig';

export const TILE_LAYERS = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
    attribution: '',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
    attribution: '',
  },
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
    attribution: '',
  },
  satellite: {
    url: `https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
    attribution: '',
  },
  osm: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
    attribution: '',
  },
} as const;

export type TileLayerKey = keyof typeof TILE_LAYERS;

// US center coordinates [lat, lng] (Leaflet order)
export const US_CENTER: [number, number] = [39.8283, -98.5795];
export const US_ZOOM = 4;
