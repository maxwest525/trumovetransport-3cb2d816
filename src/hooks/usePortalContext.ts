import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useUserRole } from "./useUserRole";

export type PortalContext = "agent" | "manager" | "admin" | "dispatch";

/**
 * Determines which portal context the user is in based on:
 * 1. URL query param ?ctx=agent|manager|admin
 * 2. The referrer path (if coming from /manager/* or /admin/*)
 * 3. The user's highest role as fallback
 */
export function usePortalContext(): PortalContext {
  const location = useLocation();
  const { highestRole } = useUserRole();

  return useMemo(() => {
    // Check query param
    const params = new URLSearchParams(location.search);
    const ctx = params.get("ctx");
    if (ctx === "manager" || ctx === "admin" || ctx === "agent") return ctx;

    // Check localStorage for last active context
    const saved = localStorage.getItem("truemove_portal_context");
    if (saved === "manager" || saved === "admin" || saved === "agent") return saved;

    // Fallback to highest role
    if (highestRole === "owner" || highestRole === "admin") return "admin";
    if (highestRole === "manager") return "manager";
    return "agent";
  }, [location.search, highestRole]);
}

/**
 * Call this when navigating within a portal to remember context.
 */
export function setPortalContext(ctx: PortalContext) {
  localStorage.setItem("truemove_portal_context", ctx);
}
