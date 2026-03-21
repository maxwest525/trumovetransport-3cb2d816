import { useState, useEffect, useRef, useCallback } from "react";

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
  delayChange: number;
  reason: 'traffic_improved' | 'traffic_worsened' | 'initial' | 'refresh';
}

interface UseRealtimeETAOptions {
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
  currentProgress: number;
  isTracking: boolean;
  refreshIntervalMs?: number;
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

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatTimeOfDay(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function buildRouteInfo(distanceMeters: number, durationSeconds: number): RouteInfo {
  const etaDate = new Date(Date.now() + durationSeconds * 1000);

  return {
    distanceMiles: distanceMeters / 1609.34,
    durationSeconds,
    durationFormatted: formatDuration(durationSeconds),
    staticDurationSeconds: durationSeconds,
    etaFormatted: formatTimeOfDay(etaDate),
    eta: etaDate.toISOString(),
    traffic: {
      delayMinutes: 0,
      delayFormatted: 'On time',
      hasDelay: false,
      severity: 'low',
    },
    tolls: {
      hasTolls: false,
      estimatedPrice: null,
    },
    polyline: null,
  };
}

export function useRealtimeETA({
  originCoords,
  destCoords,
  currentProgress,
  isTracking,
  refreshIntervalMs = 60000,
}: UseRealtimeETAOptions): UseRealtimeETAReturn {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [etaHistory, setEtaHistory] = useState<ETAUpdateEvent[]>([]);

  const previousETARef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getCurrentPosition = useCallback((): [number, number] | null => {
    if (!originCoords || !destCoords) return null;

    const progress = Math.max(0, Math.min(100, currentProgress)) / 100;
    const lat = originCoords[1] + (destCoords[1] - originCoords[1]) * progress;
    const lng = originCoords[0] + (destCoords[0] - originCoords[0]) * progress;

    return [lng, lat];
  }, [originCoords, destCoords, currentProgress]);

  const fetchRouteData = useCallback(async (isRefresh = false) => {
    if (!destCoords) {
      setRouteInfo(null);
      return;
    }

    const startCoords = currentProgress > 0 ? getCurrentPosition() : originCoords;
    if (!startCoords) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${destCoords[0]},${destCoords[1]}?overview=false`
      );

      if (!response.ok) {
        throw new Error(`OSRM request failed with ${response.status}`);
      }

      const data = await response.json();
      const route = data?.routes?.[0];

      if (!route) {
        setError('No route available');
        setRouteInfo(null);
        return;
      }

      const nextRouteInfo = buildRouteInfo(route.distance, route.duration);
      const newEvent: ETAUpdateEvent = {
        timestamp: new Date(),
        previousETA: previousETARef.current,
        newETA: nextRouteInfo.etaFormatted,
        delayChange: 0,
        reason: !previousETARef.current ? 'initial' : isRefresh ? 'refresh' : 'traffic_improved',
      };

      previousETARef.current = nextRouteInfo.etaFormatted;
      setEtaHistory((prev) => [...prev.slice(-9), newEvent]);
      setRouteInfo(nextRouteInfo);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('ETA fetch error:', err);
      setError('Failed to update ETA');
    } finally {
      setIsLoading(false);
    }
  }, [originCoords, destCoords, currentProgress, getCurrentPosition]);

  useEffect(() => {
    if (originCoords && destCoords) {
      fetchRouteData();
    }
  }, [originCoords, destCoords, fetchRouteData]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isTracking && originCoords && destCoords) {
      intervalRef.current = setInterval(() => {
        fetchRouteData(true);
      }, refreshIntervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isTracking, originCoords, destCoords, refreshIntervalMs, fetchRouteData]);

  const trafficTrend = useCallback((): 'improving' | 'worsening' | 'stable' | null => {
    if (etaHistory.length < 2) return null;
    return 'stable';
  }, [etaHistory])();

  const remainingDistance = routeInfo
    ? routeInfo.distanceMiles * (1 - currentProgress / 100)
    : 0;

  const remainingDurationSeconds = routeInfo
    ? routeInfo.durationSeconds * (1 - currentProgress / 100)
    : 0;

  const remainingDuration = formatDuration(remainingDurationSeconds);
  const adjustedETA = routeInfo
    ? formatTimeOfDay(new Date(Date.now() + remainingDurationSeconds * 1000))
    : null;

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
    adjustedDuration: remainingDuration,
    trafficTrend,
    remainingDistance: Math.round(remainingDistance * 10) / 10,
    remainingDuration,
    refreshNow,
  };
}
