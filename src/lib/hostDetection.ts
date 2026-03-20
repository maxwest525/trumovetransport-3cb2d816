/**
 * Hostname-based routing detection.
 *
 * Main domain  (trumoveinc.com / www.trumoveinc.com) → customer-facing website
 * CRM subdomain (crm.trumoveinc.com)                → internal CRM / portal
 *
 * During local dev or on Lovable preview URLs the CRM experience is default
 * (preserving current behaviour).
 */

const CRM_SUBDOMAIN = "crm";

export function isCrmDomain(): boolean {
  const host = window.location.hostname; // e.g. "crm.trumoveinc.com"

  // Local / preview → treat as CRM so dev experience stays the same
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app")
  ) {
    return true;
  }

  // Check for crm.* subdomain
  return host.startsWith(`${CRM_SUBDOMAIN}.`);
}

export function isMainDomain(): boolean {
  return !isCrmDomain();
}
