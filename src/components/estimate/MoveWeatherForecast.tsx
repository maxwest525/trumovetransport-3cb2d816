import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Snowflake, Wind, Loader2, ThermometerSun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WeatherData {
  location: string;
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  visibility: number;
}

interface MoveWeatherForecastProps {
  originLocation: string; // Address string like "New York, NY 10001"
  destLocation: string;
  moveDate: Date | null;
}

const MAPTILER_KEY = "X6zFH8Vcg9bMuUCrXFWU";

// Geocode address to coordinates using MapTiler
async function geocodeAddress(address: string): Promise<[number, number] | null> {
  if (!address || address.length < 3) return null;
  
  try {
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${MAPTILER_KEY}&country=us&limit=1&language=en`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].center as [number, number];
    }
    return null;
  } catch {
    return null;
  }
}

// Get appropriate weather icon component
function getWeatherIcon(iconCode: string, className: string = "w-5 h-5") {
  // OpenWeather icon codes: https://openweathermap.org/weather-conditions
  if (iconCode.startsWith('01')) return <Sun className={`${className} text-amber-400`} />;
  if (iconCode.startsWith('02') || iconCode.startsWith('03') || iconCode.startsWith('04')) 
    return <Cloud className={`${className} text-slate-400`} />;
  if (iconCode.startsWith('09') || iconCode.startsWith('10') || iconCode.startsWith('11')) 
    return <CloudRain className={`${className} text-blue-400`} />;
  if (iconCode.startsWith('13')) return <Snowflake className={`${className} text-cyan-300`} />;
  if (iconCode.startsWith('50')) return <Wind className={`${className} text-slate-400`} />;
  return <ThermometerSun className={`${className} text-orange-400`} />;
}

export default function MoveWeatherForecast({ 
  originLocation, 
  destLocation, 
  moveDate
}: MoveWeatherForecastProps) {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!originLocation || !destLocation) {
      setWeather([]);
      return;
    }

    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Geocode both locations
        const [originCoords, destCoords] = await Promise.all([
          geocodeAddress(originLocation),
          geocodeAddress(destLocation)
        ]);

        if (!originCoords || !destCoords) {
          setError('Unable to locate addresses');
          setIsLoading(false);
          return;
        }

        // Calculate midpoint
        const midLng = (originCoords[0] + destCoords[0]) / 2;
        const midLat = (originCoords[1] + destCoords[1]) / 2;

        // Extract city names for display
        const originName = originLocation.split(',')[0] || 'Start';
        const destName = destLocation.split(',')[0] || 'End';

        const points = [
          { lat: originCoords[1], lon: originCoords[0], name: originName },
          { lat: midLat, lon: midLng, name: 'Route Mid' },
          { lat: destCoords[1], lon: destCoords[0], name: destName },
        ];

        const { data, error: apiError } = await supabase.functions.invoke('weather-route', {
          body: { points }
        });

        if (apiError) {
          console.error('Weather API error:', apiError);
          setError('Unable to fetch weather');
          return;
        }

        if (data?.weather) {
          setWeather(data.weather);
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Weather unavailable');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [originLocation, destLocation]);

  // Don't render if no locations
  if (!originLocation || !destLocation) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-2">
          <ThermometerSun className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
            Route Weather
          </span>
          {moveDate && (
            <span className="ml-auto text-[10px] text-muted-foreground">
              {moveDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-3 text-xs text-muted-foreground">
            {error}
          </div>
        ) : weather.length > 0 ? (
          <div className="flex items-stretch gap-2">
            {weather.map((w, index) => (
              <div 
                key={index}
                className="flex-1 flex flex-col items-center p-2 rounded-lg bg-muted/40"
              >
                {/* Location */}
                <span className="text-[10px] font-semibold text-muted-foreground truncate max-w-full mb-1">
                  {index === 0 ? 'Start' : index === weather.length - 1 ? 'End' : 'Mid'}
                </span>
                
                {/* Icon */}
                <div className="my-1">
                  {getWeatherIcon(w.icon, "w-6 h-6")}
                </div>
                
                {/* Temperature */}
                <span className="text-lg font-bold text-foreground">
                  {w.temp}°
                </span>
                
                {/* Description */}
                <span className="text-[9px] text-muted-foreground capitalize truncate max-w-full">
                  {w.description}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3 text-xs text-muted-foreground">
            No weather data available
          </div>
        )}
      </div>
    </div>
  );
}
