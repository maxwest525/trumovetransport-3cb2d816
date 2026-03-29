/**
 * Lead Attribution & Session Intelligence
 * Captures UTM params, ad click IDs, device info, referrer, and session behavior.
 * Data persists in sessionStorage across navigations.
 */

const STORAGE_KEY = "tm_attribution";
const SESSION_START_KEY = "tm_session_start";
const PAGE_HISTORY_KEY = "tm_page_history";

interface AttributionData {
  // UTM parameters
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;

  // Ad click IDs
  gclid: string | null;   // Google Ads
  fbclid: string | null;  // Meta / Facebook
  msclkid: string | null; // Microsoft Ads

  // Referrer & landing
  referrer_url: string | null;
  landing_page: string | null;

  // Device & browser
  device_type: string;
  browser: string;
  os: string;
  screen_resolution: string;

  // Session behavior
  session_duration_seconds: number;
  pages_visited: number;
  page_path_history: string[];

  // Form engagement
  form_started_at: string | null;
  form_completed_at: string | null;

  // Pending integrations
  ip_geolocation: string | null; // Pending: IP Geolocation API
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return "mobile";
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  return "desktop";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  return "Other";
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux") && !ua.includes("Android")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  return "Other";
}

/**
 * Initialize attribution tracking on app mount.
 * Captures UTM params from URL (only on first load to avoid overwriting),
 * stores device info, and begins session tracking.
 */
export function initAttribution(): void {
  // Capture UTM params & click IDs from current URL (only if not already stored)
  const existing = sessionStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const params = new URLSearchParams(window.location.search);
    const data: Record<string, string | null> = {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_term: params.get("utm_term"),
      utm_content: params.get("utm_content"),
      gclid: params.get("gclid"),
      fbclid: params.get("fbclid"),
      msclkid: params.get("msclkid"),
      referrer_url: document.referrer || null,
      landing_page: window.location.pathname + window.location.search,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Start session timer
  if (!sessionStorage.getItem(SESSION_START_KEY)) {
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
  }

  // Track page visit
  trackPageVisit();
}

/**
 * Record current page path in history.
 */
export function trackPageVisit(): void {
  const historyRaw = sessionStorage.getItem(PAGE_HISTORY_KEY);
  const history: string[] = historyRaw ? JSON.parse(historyRaw) : [];
  const current = window.location.pathname;
  // Only add if different from last entry
  if (history[history.length - 1] !== current) {
    history.push(current);
    sessionStorage.setItem(PAGE_HISTORY_KEY, JSON.stringify(history));
  }
}

/**
 * Mark when a user starts engaging with a form (first keystroke / interaction).
 */
export function markFormStart(): void {
  if (!sessionStorage.getItem("tm_form_started_at")) {
    sessionStorage.setItem("tm_form_started_at", new Date().toISOString());
  }
}

/**
 * Mark form completion timestamp.
 */
export function markFormComplete(): void {
  sessionStorage.setItem("tm_form_completed_at", new Date().toISOString());
}

/**
 * Get all collected attribution data as a flat object ready for submission.
 */
export function getAttributionData(): AttributionData {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  const params = stored ? JSON.parse(stored) : {};

  const sessionStart = sessionStorage.getItem(SESSION_START_KEY);
  const sessionDuration = sessionStart
    ? Math.round((Date.now() - parseInt(sessionStart, 10)) / 1000)
    : 0;

  const historyRaw = sessionStorage.getItem(PAGE_HISTORY_KEY);
  const pageHistory: string[] = historyRaw ? JSON.parse(historyRaw) : [];

  return {
    // UTM
    utm_source: params.utm_source || null,
    utm_medium: params.utm_medium || null,
    utm_campaign: params.utm_campaign || null,
    utm_term: params.utm_term || null,
    utm_content: params.utm_content || null,

    // Ad click IDs
    gclid: params.gclid || null,
    fbclid: params.fbclid || null,
    msclkid: params.msclkid || null,

    // Referrer
    referrer_url: params.referrer_url || null,
    landing_page: params.landing_page || null,

    // Device
    device_type: detectDevice(),
    browser: detectBrowser(),
    os: detectOS(),
    screen_resolution: `${window.screen.width}x${window.screen.height}`,

    // Session
    session_duration_seconds: sessionDuration,
    pages_visited: pageHistory.length,
    page_path_history: pageHistory,

    // Form
    form_started_at: sessionStorage.getItem("tm_form_started_at") || null,
    form_completed_at: sessionStorage.getItem("tm_form_completed_at") || null,

    // Pending
    ip_geolocation: null, // Pending: IP Geolocation API integration
  };
}
