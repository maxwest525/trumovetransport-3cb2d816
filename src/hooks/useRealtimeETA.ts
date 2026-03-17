import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrafficData {
  delayMinutes: number;
  delayFormatted: string;
  hasDelay: boolean;
  severity: 'low' | 'medium' | 'high';
}

interface TollData {
  hasTolls: boolean;
  estimatedPrice: string | null;
}

interface RouteInfo {
  distanceMiles: number;
  durationSeconds: number;
  durationFormatted: string;
  staticDurationSeconds: number;
  etaFormatted: string;
  eta: string;
  traffic: TrafficData;
  tolls: TollData;
  polyline: string | null;
}

interface ETAUpdateEvent {
  timestamp: Date;
  previousETA: string | null;
  newETA: string;
  delayChange: number; // minutes gained or lost
  reason: 'traffic_improved' | 'traffic_worsened' | 'initial' | 'refresh';
}

interface UseRealtimeETAOptions {
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
  currentProgress: number; // 0-100
  isTracking: boolean;
  refreshIntervalMs?: number; // default 60 seconds
}

interface UseRealtimeETAReturn {
  routeInfo: RouteInfo | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  etaHistory: ETAUpdateEvent[];
  adjustedETA: string | null;
  adjustedDuration: string | null;
  trafficTrend: 'improving' | 'worsening' | 'stable' | null;
  remainingDistance: number;
  remainingDuration: string;
  refreshNow: () => void;
}

// Format duration from seconds
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Format time for display
function formatTimeOfDay(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
}

export function useRealtimeETA({
  originCoords,
  destCoords,
  currentProgress,
  isTracking,
  refreshIntervalMs = 60000, // 1 minute default
}: UseRealtimeETAOptions): UseRealtimeETAReturn {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [etaHistory, setEtaHistory] = useState<ETAUpdateEvent[]>([]);
  
  const previousETARef = useRef<string | null>(null);
  const previousDelayRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate interpolated current position based on progress
  const getCurrentPosition = useCallback((): [number, number] | null => {
    if (!originCoords || !destCoords) return null;
    
    const progress = Math.max(0, Math.min(100, currentProgress)) / 100;
    
    // Linear interpolation between origin and destination
    const lat = originCoords[1] + (destCoords[1] - originCoords[1]) * progress;
    const lng = originCoords[0] + (destCoords[0] - originCoords[0]) * progress;
    
    return [lng, lat];
  }, [originCoords, destCoords, currentProgress]);

  // Fetch route data from Google Routes API
  const fetchRouteData = useCallback(async (isRefresh = false) => {
    if (!destCoords) {
      setRouteInfo(null);
      return;
    }

    // Determine starting point (current position or origin)
    const startCoords = currentProgress > 0 ? getCurrentPosition() : originCoords;
    if (!startCoords) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('google-routes', {
        body: {
          origin: { lat: startCoords[1], lng: startCoords[0] },
          destination: { lat: destCoords[1], lng: destCoords[0] },
          departureTime: new Date().toISOString(),
        },
      });

      if (fnError) {
        console.error('Google Routes error:', fnError);
        setError('Unable to fetch traffic data');
        return;
      }

      if (data?.fallback) {
        console.log('Google Routes API fallback mode');
        // Don't set error, just silently continue without live traffic data
        return;
      }

      if (data?.noRoute) {
        console.log('No route found - truck may have arrived or coordinates invalid');
        // Don't set error for no route - this is expected at journey end
        return;
      }

      if (data?.success && data?.route) {
        const route = data.route;
        
        // Track ETA changes
        const newEvent: ETAUpdateEvent = {
          timestamp: new Date(),
          previousETA: previousETARef.current,
          newETA: route.etaFormatted,
          delayChange: route.traffic.delayMinutes - previousDelayRef.current,
          reason: !previousETARef.current 
            ? 'initial' 
            : isRefresh 
              ? 'refresh'
              : route.traffic.delayMinutes < previousDelayRef.current 
                ? 'traffic_improved' 
                : route.traffic.delayMinutes > previousDelayRef.current
                  ? 'traffic_worsened'
                  : 'refresh',
        };

        previousETARef.current = route.etaFormatted;
        previousDelayRef.current = route.traffic.delayMinutes;

        setEtaHistory(prev => [...prev.slice(-9), newEvent]); // Keep last 10 updates
        setRouteInfo(route);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('ETA fetch error:', err);
      setError('Failed to update ETA');
    } finally {
      setIsLoading(false);
    }
  }, [originCoords, destCoords, currentProgress, getCurrentPosition]);

  // Initial fetch
  useEffect(() => {
    if (originCoords && destCoords) {
      fetchRouteData();
    }
  }, [originCoords, destCoords]);

  // Set up refresh interval when tracking
  useEffect(() => {
    if (isTracking && originCoords && destCoords) {
      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set up new interval
      intervalRef.current = setInterval(() => {
        fetchRouteData(true);
      }, refreshIntervalMs);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isTracking, refreshIntervalMs, fetchRouteData]);

  // Calculate traffic trend from history
  const trafficTrend = useCallback((): 'improving' | 'worsening' | 'stable' | null => {
    if (etaHistory.length < 2) return null;
    
    const recentChanges = etaHistory.slice(-3);
    const totalChange = recentChanges.reduce((sum, event) => sum + event.delayChange, 0);
    
    if (totalChange < -5) return 'improving';
    if (totalChange > 5) return 'worsening';
    return 'stable';
  }, [etaHistory])();

  // Calculate remaining values based on progress
  const remainingDistance = routeInfo 
    ? routeInfo.distanceMiles * (1 - currentProgress / 100)
    : 0;

  const remainingDurationSeconds = routeInfo
    ? routeInfo.durationSeconds * (1 - currentProgress / 100)
    : 0;

  const remainingDuration = formatDuration(remainingDurationSeconds);

  // Calculate adjusted ETA based on current time + remaining duration
  const adjustedETA = routeInfo
    ? formatTimeOfDay(new Date(Date.now() + remainingDurationSeconds * 1000))
    : null;

  const adjustedDuration = remainingDuration;

  // Manual refresh function
  const refreshNow = useCallback(() => {
    fetchRouteData(true);
  }, [fetchRouteData]);

  return {
    routeInfo,
    isLoading,
    error,
    lastUpdate,
    etaHistory,
    adjustedETA,
    adjustedDuration,
    trafficTrend,
    remainingDistance: Math.round(remainingDistance * 10) / 10,
    remainingDuration,
    refreshNow,
  };
}
