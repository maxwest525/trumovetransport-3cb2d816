import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://esm.sh/zod@3.23.8";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOCUMENT_LABELS: Record<string, string> = {
  estimate: "Estimate Authorization",
  ccach: "CC/ACH Authorization",
  bol: "Bill of Lading",
};

const SendDocumentSchema = z.object({
  documentType: z.enum(["estimate", "ccach", "bol"], {
    errorMap: () => ({ message: "documentType must be one of: estimate, ccach, bol" }),
  }),
  customerName: z.string().trim().min(1, "customerName is required").max(200, "customerName too long"),
  customerEmail: z.string().trim().email("Invalid email address").max(255),
  customerPhone: z.string().trim().max(20).optional(),
  refNumber: z.string().trim().min(1, "refNumber is required").max(100, "refNumber too long"),
  deliveryMethod: z.enum(["email", "sms"], {
    errorMap: () => ({ message: "deliveryMethod must be 'email' or 'sms'" }),
  }),
  signingUrl: z.string().url("signingUrl must be a valid URL").max(2000),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const parsed = SendDocumentSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { documentType, customerName, customerEmail, refNumber, deliveryMethod, signingUrl } = parsed.data;

    if (deliveryMethod === "email" && !customerEmail) {
      return new Response(
        JSON.stringify({ error: "Email address is required for email delivery" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const documentLabel = DOCUMENT_LABELS[documentType] || documentType;

    // Escape HTML in user-provided values to prevent XSS in email
    const escapeHtml = (str: string) =>
      str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const safeCustomerName = escapeHtml(customerName);
    const safeRefNumber = escapeHtml(refNumber);
    const safeDocumentLabel = escapeHtml(documentLabel);

    // For email delivery, send via Resend
    if (deliveryMethod === "email") {
      const emailResponse = await resend.emails.send({
        from: "TruMove <noreply@trumove.lovable.app>",
        to: [customerEmail],
        subject: `Action Required: Sign Your ${safeDocumentLabel} - ${safeRefNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7C3AED; margin: 0;">TruMove</h1>
              <p style="color: #666; font-size: 14px;">Your Trusted Moving Partner</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h2 style="margin: 0 0 10px 0; font-size: 24px;">${safeDocumentLabel}</h2>
              <p style="margin: 0; opacity: 0.9;">Reference: ${safeRefNumber}</p>
            </div>
            
            <p>Hello ${safeCustomerName},</p>
            
            <p>Your <strong>${safeDocumentLabel}</strong> is ready for your signature. Please review and sign the document at your earliest convenience to proceed with your move.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${signingUrl}" style="display: inline-block; background: #7C3AED; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Review &amp; Sign Document
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              <strong>Document Details:</strong><br>
              &bull; Type: ${safeDocumentLabel}<br>
              &bull; Reference: ${safeRefNumber}<br>
              &bull; Recipient: ${safeCustomerName}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              This is an automated message from TruMove. If you have questions about this document, please contact your moving coordinator.<br><br>
              <a href="https://trumove.lovable.app" style="color: #7C3AED;">trumove.lovable.app</a>
            </p>
          </body>
          </html>
        `,
      });

      console.log("E-Sign email sent successfully:", emailResponse);

      return new Response(
        JSON.stringify({ 
          success: true, 
          method: "email",
          messageId: emailResponse.data?.id,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // For SMS delivery
    if (deliveryMethod === "sms") {
      console.log("SMS delivery simulated for:", refNumber);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          method: "sms",
          note: "SMS delivery simulated - integrate Twilio for production",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid delivery method" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    console.error("Error in send-esign-document function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
