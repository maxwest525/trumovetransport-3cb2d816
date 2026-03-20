/**
 * Hostname detection utilities.
 * 
 * Routing is no longer hostname-dependent:
 *   /       → CRM portal (always)
 *   /site/* → customer-facing website (always)
 *
 * These helpers are kept for any future hostname-specific logic
 * (e.g. branding, analytics, custom domains).
 */

const CRM_SUBDOMAIN = "crm";

export function isCrmDomain(): boolean {
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".lovable.app")) {
    return true;
  }
  return host.startsWith(`${CRM_SUBDOMAIN}.`);
}

export function isMainDomain(): boolean {
  return !isCrmDomain();
}
