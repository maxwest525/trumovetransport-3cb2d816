import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Two-phase redemption flow:
//   1. POST { token }                       -> returns { challenge: 'phone_last4' | 'email' }
//                                              (no PII, no scan data)
//   2. POST { token, verification: '1234' } -> validates and returns saved scan
//
// Failed verification attempts are throttled to 1 per second per token. There
// is no permanent lockout — repeated guessing is just rate-limited.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json().catch(() => ({}));
    const token: string | undefined = body?.token;
    const verification: string | undefined =
      typeof body?.verification === "string" ? body.verification.trim() : undefined;

    if (!token || typeof token !== "string") {
      return jsonResponse({ error: "Token is required" }, 400);
    }

    const { data: tokenRow, error: tokenErr } = await supabase
      .from("scan_resume_tokens")
      .select(
        "id, lead_id, expires_at, used_at, verification_method, phone_last4, email_hint, failed_attempts, last_attempt_at",
      )
      .eq("token", token)
      .maybeSingle();

    if (tokenErr || !tokenRow) {
      return jsonResponse({ error: "Invalid token" }, 404);
    }

    if (tokenRow.used_at) {
      return jsonResponse(
        { error: "This resume link has already been used" },
        410,
      );
    }

    if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
      return jsonResponse({ error: "This resume link has expired" }, 410);
    }

    // Phase 1: client just wants to know what verification challenge to render.
    if (!verification) {
      return jsonResponse({
        challenge: tokenRow.verification_method,
        // Hint at the email shape so the user knows which inbox to check.
        // Never expose the phone, even partially.
        emailHintMasked:
          tokenRow.verification_method === "email"
            ? maskEmail(tokenRow.email_hint || "")
            : null,
      });
    }

    // Phase 2: verify. Throttle to 1 attempt per second per token. We don't
    // permanently lock — just slow guessing down.
    if (tokenRow.last_attempt_at) {
      const sinceLast = Date.now() - new Date(tokenRow.last_attempt_at).getTime();
      if (sinceLast < 1000) {
        return jsonResponse(
          { error: "Too many attempts. Please wait a moment and try again." },
          429,
        );
      }
    }

    const expected =
      tokenRow.verification_method === "phone_last4"
        ? (tokenRow.phone_last4 || "").trim()
        : (tokenRow.email_hint || "").trim().toLowerCase();
    const actual =
      tokenRow.verification_method === "phone_last4"
        ? verification.replace(/\D/g, "")
        : verification.toLowerCase();

    if (!expected || expected !== actual) {
      // Stamp the failure so the next attempt is throttled.
      await supabase
        .from("scan_resume_tokens")
        .update({
          failed_attempts: (tokenRow.failed_attempts || 0) + 1,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", tokenRow.id);

      return jsonResponse(
        {
          error:
            tokenRow.verification_method === "phone_last4"
              ? "That doesn't match the phone number on file."
              : "That doesn't match the email on file.",
        },
        401,
      );
    }

    // Verified — load the saved scan in parallel.
    const [leadRes, photosRes, inventoryRes] = await Promise.all([
      supabase
        .from("leads")
        .select("id, first_name, last_name, email, phone")
        .eq("id", tokenRow.lead_id)
        .maybeSingle(),
      supabase
        .from("lead_scan_photos")
        .select("id, photo_url, room_label, detected_boxes, item_count, created_at")
        .eq("lead_id", tokenRow.lead_id)
        .order("created_at", { ascending: true }),
      supabase
        .from("lead_inventory")
        .select(
          "id, item_name, room, quantity, cubic_feet, weight, source, source_photo_url, detection_box, confidence",
        )
        .eq("lead_id", tokenRow.lead_id)
        .order("created_at", { ascending: true }),
    ]);

    if (!leadRes.data) {
      return jsonResponse({ error: "Lead no longer exists" }, 404);
    }

    // Best-effort audit trail. We use forwarded headers so we capture the
    // real client IP behind Supabase's edge proxy.
    const redeemedIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      null;
    const redeemedUserAgent = req.headers.get("user-agent") || null;

    await supabase
      .from("scan_resume_tokens")
      .update({
        used_at: new Date().toISOString(),
        redeemed_ip: redeemedIp,
        redeemed_user_agent: redeemedUserAgent,
      })
      .eq("id", tokenRow.id);

    return jsonResponse({
      leadId: tokenRow.lead_id,
      lead: leadRes.data,
      photos: photosRes.data ?? [],
      inventory: inventoryRes.data ?? [],
    });
  } catch (error) {
    console.error("redeem-scan-resume-token error:", error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Mask "john.doe@example.com" -> "j••••e@example.com" so the customer can
// recognize the right inbox without leaking the full address publicly.
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "";
  if (local.length <= 2) return `${local[0] || ""}•@${domain}`;
  return `${local[0]}${"•".repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`;
}
