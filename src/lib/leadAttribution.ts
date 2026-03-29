/**
 * Lead Attribution & Session Intelligence
 * Captures every possible client-side signal for lead scoring,
 * marketing attribution, and behavioral analysis.
 */

const STORAGE_KEY = "tm_attribution";
const SESSION_START_KEY = "tm_session_start";
const PAGE_HISTORY_KEY = "tm_page_history";
const VISIT_COUNT_KEY = "tm_visit_count";
const TAB_BLUR_KEY = "tm_tab_blur_count";
const SCROLL_DEPTH_KEY = "tm_max_scroll_depth";

interface AttributionData {
  // UTM parameters
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;

  // Ad click IDs
  gclid: string | null;
  fbclid: string | null;
  msclkid: string | null;

  // Referrer & landing
  referrer_url: string | null;
  landing_page: string | null;

  // Device & browser
  device_type: string;
  browser: string;
  os: string;
  screen_resolution: string;
  viewport_size: string;
  user_agent: string;
  timezone: string;
  browser_language: string;
  connection_type: string | null;
  is_touch_device: boolean;
  color_depth: number;
  hardware_concurrency: number;
  do_not_track: boolean;
  pdf_viewer_enabled: boolean;
  cookies_enabled: boolean;

  // Session behavior
  session_duration_seconds: number;
  pages_visited: number;
  page_path_history: string[];
  visit_count: number;
  tab_blur_count: number;
  max_scroll_depth: number;
  ad_blocker_detected: boolean;

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

function detectConnectionType(): string | null {
  const nav = navigator as any;
  if (nav.connection) {
    return nav.connection.effectiveType || nav.connection.type || null;
  }
  return null; // Not supported in this browser
}

function detectAdBlocker(): boolean {
  try {
    const testAd = document.createElement("div");
    testAd.innerHTML = "&nbsp;";
    testAd.className = "adsbox ad-placement ad-banner";
    testAd.style.position = "absolute";
    testAd.style.left = "-9999px";
    document.body.appendChild(testAd);
    const blocked = testAd.offsetHeight === 0;
    document.body.removeChild(testAd);
    return blocked;
  } catch {
    return false;
  }
}

/**
 * Initialize attribution tracking on app mount.
 */
export function initAttribution(): void {
  // Capture UTM params & click IDs (only on first load)
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

  // Session timer
  if (!sessionStorage.getItem(SESSION_START_KEY)) {
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
  }

  // Visit count (persists across sessions via localStorage)
  const visits = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10) + 1;
  localStorage.setItem(VISIT_COUNT_KEY, visits.toString());
  sessionStorage.setItem(VISIT_COUNT_KEY, visits.toString());

  // Tab blur tracking
  if (!sessionStorage.getItem(TAB_BLUR_KEY)) {
    sessionStorage.setItem(TAB_BLUR_KEY, "0");
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      const current = parseInt(sessionStorage.getItem(TAB_BLUR_KEY) || "0", 10);
      sessionStorage.setItem(TAB_BLUR_KEY, (current + 1).toString());
    }
  });

  // Scroll depth tracking
  if (!sessionStorage.getItem(SCROLL_DEPTH_KEY)) {
    sessionStorage.setItem(SCROLL_DEPTH_KEY, "0");
  }
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    const currentMax = parseInt(sessionStorage.getItem(SCROLL_DEPTH_KEY) || "0", 10);
    if (scrollPercent > currentMax) {
      sessionStorage.setItem(SCROLL_DEPTH_KEY, scrollPercent.toString());
    }
  }, { passive: true });

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
  if (history[history.length - 1] !== current) {
    history.push(current);
    sessionStorage.setItem(PAGE_HISTORY_KEY, JSON.stringify(history));
  }
}

/**
 * Mark form engagement start (first interaction).
 */
export function markFormStart(): void {
  if (!sessionStorage.getItem("tm_form_started_at")) {
    sessionStorage.setItem("tm_form_started_at", new Date().toISOString());
  }
}

/**
 * Mark form completion.
 */
export function markFormComplete(): void {
  sessionStorage.setItem("tm_form_completed_at", new Date().toISOString());
}

/**
 * Get all collected attribution data.
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

    // Device & environment
    device_type: detectDevice(),
    browser: detectBrowser(),
    os: detectOS(),
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    user_agent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
    browser_language: navigator.language || "Unknown",
    connection_type: detectConnectionType(),
    is_touch_device: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    color_depth: window.screen.colorDepth || 0,
    hardware_concurrency: navigator.hardwareConcurrency || 0,
    do_not_track: navigator.doNotTrack === "1",
    pdf_viewer_enabled: !!(navigator as any).pdfViewerEnabled,
    cookies_enabled: navigator.cookieEnabled,

    // Session behavior
    session_duration_seconds: sessionDuration,
    pages_visited: pageHistory.length,
    page_path_history: pageHistory,
    visit_count: parseInt(sessionStorage.getItem(VISIT_COUNT_KEY) || "1", 10),
    tab_blur_count: parseInt(sessionStorage.getItem(TAB_BLUR_KEY) || "0", 10),
    max_scroll_depth: parseInt(sessionStorage.getItem(SCROLL_DEPTH_KEY) || "0", 10),
    ad_blocker_detected: detectAdBlocker(),

    // Form
    form_started_at: sessionStorage.getItem("tm_form_started_at") || null,
    form_completed_at: sessionStorage.getItem("tm_form_completed_at") || null,

    // Pending
    ip_geolocation: null, // Pending: IP Geolocation API
  };
}
