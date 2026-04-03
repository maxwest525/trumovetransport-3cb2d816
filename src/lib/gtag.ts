/**
 * Google Analytics 4 — conversion event helpers
 * Measurement ID: G-7Z5PCWENR3
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function fire(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

/* ── Conversion events ─────────────────────────────── */

/** Fired when the full estimate/quote form is submitted */
export function trackQuoteSubmission(params?: {
  moveType?: string;
  distance?: number;
  estimateMin?: number;
  estimateMax?: number;
}) {
  fire("generate_lead", {
    event_category: "quote",
    event_label: "estimate_form",
    currency: "USD",
    value: params?.estimateMin ?? 0,
    ...params,
  });
}

/** Fired when the lead-capture modal (pre-inventory) is completed */
export function trackLeadCapture(flow: "manual" | "ai") {
  fire("sign_up", {
    event_category: "lead",
    event_label: `lead_capture_${flow}`,
    method: flow,
  });
}

/** Fired when a user taps / clicks a phone-call CTA */
export function trackPhoneCall(source: string) {
  fire("contact", {
    event_category: "engagement",
    event_label: `phone_call_${source}`,
    method: "phone",
    link_url: "tel:+16097277647",
  });
}

/** Fired when the contact / support form on the homepage is sent */
export function trackContactForm() {
  fire("generate_lead", {
    event_category: "contact",
    event_label: "contact_form",
  });
}

/** Fired when a user books a video consultation */
export function trackVideoConsultBooked() {
  fire("schedule", {
    event_category: "booking",
    event_label: "video_consult",
  });
}
