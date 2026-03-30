/**
 * Behavior Tracker - captures clicks, hovers, CTA interactions,
 * form field engagement, rage clicks, exit intent, scroll milestones,
 * and time-on-page per route. All data is buffered and synced to
 * the anonymous lead's attribution record periodically.
 */

import { supabase } from "@/integrations/supabase/client";

const ANON_LEAD_KEY = "tm_anonymous_lead_id";
const CONSENT_KEY = "tm_tracking_consent";
const BEHAVIOR_KEY = "tm_behavior_buffer";
const SYNC_INTERVAL = 30_000; // sync every 30s
const MAX_EVENTS = 200; // cap per category

interface ClickEvent {
  el: string; // tag#id.class or text snippet
  path: string;
  ts: number;
  x: number;
  y: number;
}

interface HoverEvent {
  el: string;
  path: string;
  ts: number;
  duration: number; // ms
}

interface CTAInteraction {
  label: string;
  href?: string;
  path: string;
  ts: number;
  type: "click" | "hover";
}

interface FormFieldInteraction {
  field: string;
  form?: string;
  path: string;
  ts: number;
  event: "focus" | "blur" | "change";
  timeSpent?: number; // ms from focus to blur
}

interface BehaviorBuffer {
  clicks: ClickEvent[];
  hovers: HoverEvent[];
  ctas: CTAInteraction[];
  formFields: FormFieldInteraction[];
  rageClicks: number;
  totalClicks: number;
  exitIntentCount: number;
  scrollMilestones: number[]; // 25, 50, 75, 100
  timeOnPage: Record<string, number>; // path → seconds
}

function emptyBuffer(): BehaviorBuffer {
  return {
    clicks: [],
    hovers: [],
    ctas: [],
    formFields: [],
    rageClicks: 0,
    totalClicks: 0,
    exitIntentCount: 0,
    scrollMilestones: [],
    timeOnPage: {},
  };
}

function getBuffer(): BehaviorBuffer {
  try {
    const raw = sessionStorage.getItem(BEHAVIOR_KEY);
    return raw ? JSON.parse(raw) : emptyBuffer();
  } catch {
    return emptyBuffer();
  }
}

function saveBuffer(buf: BehaviorBuffer) {
  sessionStorage.setItem(BEHAVIOR_KEY, JSON.stringify(buf));
}

function getElementDescriptor(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = el.className && typeof el.className === "string"
    ? "." + el.className.split(/\s+/).slice(0, 2).join(".")
    : "";
  const text = (el.textContent || "").trim().slice(0, 40);
  return `${tag}${id}${cls}${text ? ` "${text}"` : ""}`;
}

function isCTA(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === "a" || tag === "button") return true;
  if (el.getAttribute("role") === "button") return true;
  if (el.closest("button, a, [role='button']")) return true;
  return false;
}

function getCTALabel(el: HTMLElement): string {
  const btn = el.closest("button, a, [role='button']") as HTMLElement | null;
  const target = btn || el;
  return (
    target.getAttribute("aria-label") ||
    target.textContent?.trim().slice(0, 60) ||
    getElementDescriptor(target)
  );
}

// ─── Rage click detection ───
let lastClickTime = 0;
let rapidClickCount = 0;
const RAGE_THRESHOLD = 3;
const RAGE_WINDOW = 1500; // ms

// ─── Hover tracking ───
let hoverTarget: HTMLElement | null = null;
let hoverStart = 0;
const HOVER_MIN_MS = 500; // only track meaningful hovers

// ─── Form field tracking ───
let focusedField: { el: HTMLElement; ts: number } | null = null;

// ─── Time on page ───
let pageEnteredAt = Date.now();
let currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

// ─── Sync timer ───
let syncTimer: ReturnType<typeof setInterval> | null = null;

function hasConsent(): boolean {
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

function getLeadId(): string | null {
  return localStorage.getItem(ANON_LEAD_KEY);
}

/**
 * Sync buffered behavior data to the lead_attribution row.
 */
async function syncToBackend() {
  const leadId = getLeadId();
  if (!leadId || !hasConsent()) return;

  const buf = getBuffer();
  if (
    buf.totalClicks === 0 &&
    buf.clicks.length === 0 &&
    buf.hovers.length === 0 &&
    buf.ctas.length === 0 &&
    buf.formFields.length === 0
  )
    return;

  // Record final time-on-page for current path
  const now = Date.now();
  const elapsed = Math.round((now - pageEnteredAt) / 1000);
  buf.timeOnPage[currentPath] = (buf.timeOnPage[currentPath] || 0) + elapsed;
  pageEnteredAt = now;

  try {
    await supabase
      .from("lead_attribution")
      .update({
        click_events: buf.clicks.slice(-MAX_EVENTS) as any,
        hover_events: buf.hovers.slice(-MAX_EVENTS) as any,
        cta_interactions: buf.ctas.slice(-MAX_EVENTS) as any,
        form_field_interactions: buf.formFields.slice(-MAX_EVENTS) as any,
        rage_clicks: buf.rageClicks,
        total_clicks: buf.totalClicks,
        exit_intent_count: buf.exitIntentCount,
        scroll_milestones: buf.scrollMilestones as any,
        total_time_on_page: buf.timeOnPage as any,
        last_activity_at: new Date().toISOString(),
        // Also update latest session behavioral data
        session_duration_seconds: Math.round((Date.now() - parseInt(sessionStorage.getItem("tm_session_start") || "0", 10)) / 1000),
        max_scroll_depth: parseInt(sessionStorage.getItem("tm_max_scroll_depth") || "0", 10),
        pages_visited: JSON.parse(sessionStorage.getItem("tm_page_history") || "[]").length,
        page_path_history: JSON.parse(sessionStorage.getItem("tm_page_history") || "[]"),
        tab_blur_count: parseInt(sessionStorage.getItem("tm_tab_blur_count") || "0", 10),
      })
      .eq("lead_id", leadId);
  } catch (e) {
    console.error("Behavior sync failed:", e);
  }
}

/**
 * Initialize all behavioral tracking listeners.
 * Call once after cookie consent is accepted.
 */
export function initBehaviorTracking(): void {
  if (typeof window === "undefined") return;
  if (!hasConsent()) return;

  const buf = getBuffer();

  // ─── Click tracking ───
  document.addEventListener("click", (e) => {
    if (!hasConsent()) return;
    const el = e.target as HTMLElement;
    const b = getBuffer();

    b.totalClicks++;

    // Rage click detection
    const now = Date.now();
    if (now - lastClickTime < RAGE_WINDOW) {
      rapidClickCount++;
      if (rapidClickCount >= RAGE_THRESHOLD) {
        b.rageClicks++;
        rapidClickCount = 0;
      }
    } else {
      rapidClickCount = 1;
    }
    lastClickTime = now;

    // Record click event
    b.clicks.push({
      el: getElementDescriptor(el),
      path: window.location.pathname,
      ts: now,
      x: Math.round(e.clientX),
      y: Math.round(e.clientY),
    });

    // CTA tracking
    if (isCTA(el)) {
      const ctaEl = el.closest("button, a, [role='button']") as HTMLElement || el;
      b.ctas.push({
        label: getCTALabel(el),
        href: ctaEl.getAttribute("href") || undefined,
        path: window.location.pathname,
        ts: now,
        type: "click",
      });
    }

    saveBuffer(b);
  }, { passive: true, capture: true });

  // ─── Hover tracking (meaningful hovers > 500ms) ───
  document.addEventListener("mouseover", (e) => {
    if (!hasConsent()) return;
    const el = e.target as HTMLElement;
    if (isCTA(el) || el.tagName === "IMG" || el.closest("[data-track-hover]")) {
      hoverTarget = el;
      hoverStart = Date.now();
    }
  }, { passive: true });

  document.addEventListener("mouseout", (e) => {
    if (!hasConsent() || !hoverTarget) return;
    const el = e.target as HTMLElement;
    if (el === hoverTarget || hoverTarget.contains(el)) {
      const duration = Date.now() - hoverStart;
      if (duration >= HOVER_MIN_MS) {
        const b = getBuffer();
        b.hovers.push({
          el: getElementDescriptor(hoverTarget),
          path: window.location.pathname,
          ts: hoverStart,
          duration,
        });

        if (isCTA(hoverTarget)) {
          b.ctas.push({
            label: getCTALabel(hoverTarget),
            path: window.location.pathname,
            ts: hoverStart,
            type: "hover",
          });
        }

        saveBuffer(b);
      }
      hoverTarget = null;
    }
  }, { passive: true });

  // ─── Form field tracking ───
  document.addEventListener("focusin", (e) => {
    if (!hasConsent()) return;
    const el = e.target as HTMLElement;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
      focusedField = { el, ts: Date.now() };
      const b = getBuffer();
      b.formFields.push({
        field: el.getAttribute("name") || el.getAttribute("placeholder") || el.getAttribute("type") || "unknown",
        form: el.closest("form")?.getAttribute("id") || el.closest("form")?.getAttribute("class")?.split(" ")[0] || undefined,
        path: window.location.pathname,
        ts: Date.now(),
        event: "focus",
      });
      saveBuffer(b);
    }
  }, { passive: true });

  document.addEventListener("focusout", (e) => {
    if (!hasConsent()) return;
    const el = e.target as HTMLElement;
    if (focusedField && focusedField.el === el) {
      const b = getBuffer();
      b.formFields.push({
        field: el.getAttribute("name") || el.getAttribute("placeholder") || el.getAttribute("type") || "unknown",
        form: el.closest("form")?.getAttribute("id") || undefined,
        path: window.location.pathname,
        ts: Date.now(),
        event: "blur",
        timeSpent: Date.now() - focusedField.ts,
      });
      saveBuffer(b);
      focusedField = null;
    }
  }, { passive: true });

  // ─── Exit intent (mouse leaves viewport top) ───
  document.addEventListener("mouseout", (e) => {
    if (!hasConsent()) return;
    if ((e as MouseEvent).clientY <= 0) {
      const b = getBuffer();
      b.exitIntentCount++;
      saveBuffer(b);
    }
  }, { passive: true });

  // ─── Scroll milestones ───
  const recordedMilestones = new Set<number>();
  window.addEventListener("scroll", () => {
    if (!hasConsent()) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (docHeight <= 0) return;
    const pct = Math.round((scrollTop / docHeight) * 100);
    
    [25, 50, 75, 100].forEach((ms) => {
      if (pct >= ms && !recordedMilestones.has(ms)) {
        recordedMilestones.add(ms);
        const b = getBuffer();
        if (!b.scrollMilestones.includes(ms)) {
          b.scrollMilestones.push(ms);
          saveBuffer(b);
        }
      }
    });
  }, { passive: true });

  // ─── Page navigation tracking (time on page) ───
  const origPushState = history.pushState.bind(history);
  history.pushState = function (...args) {
    // Record time on previous page
    const b = getBuffer();
    const elapsed = Math.round((Date.now() - pageEnteredAt) / 1000);
    b.timeOnPage[currentPath] = (b.timeOnPage[currentPath] || 0) + elapsed;
    saveBuffer(b);

    pageEnteredAt = Date.now();
    currentPath = typeof args[2] === "string" ? new URL(args[2], window.location.origin).pathname : window.location.pathname;

    return origPushState(...args);
  };

  window.addEventListener("popstate", () => {
    const b = getBuffer();
    const elapsed = Math.round((Date.now() - pageEnteredAt) / 1000);
    b.timeOnPage[currentPath] = (b.timeOnPage[currentPath] || 0) + elapsed;
    saveBuffer(b);
    pageEnteredAt = Date.now();
    currentPath = window.location.pathname;
  });

  // ─── Periodic sync ───
  if (!syncTimer) {
    syncTimer = setInterval(syncToBackend, SYNC_INTERVAL);
  }

  // ─── Sync on page unload ───
  window.addEventListener("beforeunload", () => {
    syncToBackend();
  });

  // ─── Sync on visibility change (tab hidden) ───
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      syncToBackend();
    }
  });
}

/**
 * Force a sync now (e.g. before form submission).
 */
export function flushBehaviorData(): Promise<void> {
  return syncToBackend();
}
