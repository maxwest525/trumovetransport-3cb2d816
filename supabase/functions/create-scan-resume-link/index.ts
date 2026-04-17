import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Generates a one-time resume token bound to a lead. Only authenticated staff
// who can already access the lead through RLS may create a token. Optionally
// emails the resume link directly to the lead's contact address via Resend.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use the caller's JWT so RLS validates that they have access to this lead.
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const leadId: string | undefined = body?.leadId;
    const deliveryMethod: "copy" | "email" =
      body?.deliveryMethod === "email" ? "email" : "copy";
    // Optional public site URL the customer should land on. Falls back to the request origin.
    const siteUrl: string =
      typeof body?.siteUrl === "string" && body.siteUrl.startsWith("http")
        ? body.siteUrl.replace(/\/+$/, "")
        : (req.headers.get("origin") ?? "").replace(/\/+$/, "");
    const ttlHours: number =
      typeof body?.ttlHours === "number" && body.ttlHours > 0 && body.ttlHours <= 168
        ? body.ttlHours
        : 24;

    if (!leadId) {
      return new Response(JSON.stringify({ error: "leadId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Confirm the caller can read this lead (RLS will enforce it).
    const { data: lead, error: leadErr } = await userClient
      .from("leads")
      .select("id, first_name, last_name, email")
      .eq("id", leadId)
      .maybeSingle();

    if (leadErr || !lead) {
      return new Response(
        JSON.stringify({ error: "Lead not found or no access" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // If the caller wants email delivery, we need a recipient on file.
    if (deliveryMethod === "email" && !lead.email) {
      return new Response(
        JSON.stringify({ error: "Lead has no email on file" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Use the service role to insert the token row so the policy bypass also
    // gives us a clean, atomic insert with the canonical creator id.
    const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
    const token = crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();

    const { error: insertErr } = await adminClient
      .from("scan_resume_tokens")
      .insert({
        token,
        lead_id: leadId,
        created_by: user.id,
        expires_at: expiresAt,
      });

    if (insertErr) {
      console.error("Token insert error:", insertErr);
      return new Response(
        JSON.stringify({ error: "Could not create token" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const resumeUrl = `${siteUrl || "https://www.trumoveinc.com"}/scan-room?resume=${token}`;
    let emailDelivered = false;
    let emailError: string | null = null;

    // Optional: deliver the link via email so the customer can resume in one tap.
    if (deliveryMethod === "email") {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (!RESEND_API_KEY) {
        emailError = "Email service not configured";
      } else {
        const firstName = (lead.first_name || "").trim() || "there";
        const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f6f7f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr><td style="padding:28px 32px;background:#0f172a;color:#ffffff;">
          <div style="font-size:18px;font-weight:700;letter-spacing:-0.01em;">TruMove</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:22px;color:#0f172a;line-height:1.3;">Resume your room scan, ${escapeHtml(firstName)}</h1>
          <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.55;">
            Your TruMove specialist saved your AI room scan. Click the button below to pick up where you left off and review the items we detected.
          </p>
          <p style="margin:24px 0;text-align:center;">
            <a href="${resumeUrl}" style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:8px;font-weight:600;font-size:15px;">
              Resume my scan
            </a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.55;">
            This link is single-use and expires in ${ttlHours} hours. If the button doesn't work, paste this URL into your browser:
          </p>
          <p style="margin:0 0 24px;word-break:break-all;font-size:12px;color:#0ea5e9;">${resumeUrl}</p>
          <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.55;">
            You're receiving this because you started a free move estimate with TruMove. If you didn't request this, you can ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "TruMove <onboarding@resend.dev>",
              to: [lead.email],
              subject: "Resume your TruMove room scan",
              html,
            }),
          });
          if (!res.ok) {
            const txt = await res.text();
            console.error("Resend error:", txt);
            emailError = "Email could not be sent";
          } else {
            emailDelivered = true;
          }
        } catch (e) {
          console.error("Resend fetch failed:", e);
          emailError = "Email could not be sent";
        }
      }
    }

    return new Response(
      JSON.stringify({
        token,
        expiresAt,
        resumeUrl,
        deliveryMethod,
        emailDelivered,
        emailError,
        recipientEmail: deliveryMethod === "email" ? lead.email : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("create-scan-resume-link error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// Minimal HTML escaping for values interpolated into the template.
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
