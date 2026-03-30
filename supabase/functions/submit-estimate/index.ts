import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      name, email, phone,
      fromLocation, toLocation,
      homeSize, moveDate,
      fromPropertyType, toPropertyType,
      fromFloor, toFloor,
      fromHasElevator, toHasElevator,
      hasVehicleTransport, needsPackingService,
      items,
      distance, moveType,
      estimateMin, estimateMax,
      totalWeight, totalCubicFeet,
      leadSource, contactPreference, moveUrgency,
      smsConsent, smsConsentTimestamp, smsConsentIp,
      attribution,
      anonymousLeadId,
    } = await req.json();

    if (!name || !email || !fromLocation || !toLocation) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(" ") || "-";

    let leadId: string;

    // Check if we should merge into an existing anonymous lead
    if (anonymousLeadId) {
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id, tags")
        .eq("id", anonymousLeadId)
        .single();

      if (existingLead) {
        // Merge: update the anonymous lead with real contact info
        const existingTags = (existingLead.tags || []).filter((t: string) => t !== "anonymous");
        const { error: updateErr } = await supabase
          .from("leads")
          .update({
            first_name: firstName,
            last_name: lastName,
            email,
            phone: phone || null,
            origin_address: fromLocation,
            destination_address: toLocation,
            move_date: moveDate || null,
            estimated_weight: totalWeight || null,
            estimated_value: estimateMax || null,
            notes: `Online Estimate: ${items?.length || 0} items, ${totalCubicFeet || 0} cu ft, est. $${estimateMin}-$${estimateMax}`,
            tags: [...existingTags, "online-estimate", "merged"],
          })
          .eq("id", anonymousLeadId);

        if (updateErr) {
          console.error("Lead merge error:", updateErr);
          throw new Error("Failed to merge lead");
        }

        leadId = anonymousLeadId;

        // Update existing attribution with form timing
        const attr = attribution || {};
        await supabase
          .from("lead_attribution")
          .update({
            form_started_at: attr.form_started_at || null,
            form_completed_at: attr.form_completed_at || null,
            lead_source_self_reported: leadSource || null,
            preferred_contact_method: contactPreference || null,
            move_urgency: moveUrgency || null,
            sms_consent: smsConsent || false,
            sms_consent_timestamp: smsConsentTimestamp || null,
            sms_consent_ip: smsConsentIp || null,
            // Update session data with latest
            session_duration_seconds: attr.session_duration_seconds || 0,
            pages_visited: attr.pages_visited || 0,
            page_path_history: attr.page_path_history || [],
            max_scroll_depth: attr.max_scroll_depth || 0,
            tab_blur_count: attr.tab_blur_count || 0,
          })
          .eq("lead_id", anonymousLeadId);
      } else {
        // Anonymous lead not found - create fresh
        leadId = await createNewLead(supabase, {
          firstName, lastName, email, phone, fromLocation, toLocation,
          moveDate, totalWeight, estimateMax, estimateMin, totalCubicFeet, items,
        });
        await insertAttribution(supabase, leadId, attribution, { leadSource, contactPreference, moveUrgency, smsConsent, smsConsentTimestamp, smsConsentIp });
      }
    } else {
      // No anonymous lead - create fresh
      leadId = await createNewLead(supabase, {
        firstName, lastName, email, phone, fromLocation, toLocation,
        moveDate, totalWeight, estimateMax, estimateMin, totalCubicFeet, items,
      });
      await insertAttribution(supabase, leadId, attribution, { leadSource, contactPreference, moveUrgency, smsConsent, smsConsentTimestamp, smsConsentIp });
    }

    // Insert move details
    await supabase.from("move_details").insert({
      lead_id: leadId,
      property_type: fromPropertyType || "house",
      bedrooms: homeSize === "studio" ? 0 : homeSize === "1br" ? 1 : homeSize === "2br" ? 2 : homeSize === "3br" ? 3 : 4,
      floors: fromFloor || 1,
      has_stairs: (fromFloor || 1) > 1 && !fromHasElevator,
      has_elevator: fromHasElevator || false,
      is_apartment: fromPropertyType === "apartment",
      packing_service: needsPackingService || false,
      auto_transport: hasVehicleTransport || false,
    });

    // Insert inventory items
    if (items && items.length > 0) {
      const inventoryRows = items.map((item: any) => ({
        lead_id: leadId,
        item_name: item.name,
        room: item.room || "Living Room",
        quantity: item.quantity || 1,
        weight: (item.weightEach || 0) * (item.quantity || 1),
        cubic_feet: item.cubicFeet || 0,
        special_handling: item.specialHandling || false,
        image_url: item.imageUrl || null,
      }));
      const { error: invErr } = await supabase.from("lead_inventory").insert(inventoryRows);
      if (invErr) console.error("Inventory insert error:", invErr);
    }

    // Create deal
    await supabase.from("deals").insert({
      lead_id: leadId,
      stage: "new_lead",
      deal_value: estimateMax || 0,
    });

    // Send email notification
    const inventoryList = (items || [])
      .map((item: any) => `• ${item.name} (${item.room}) - Qty: ${item.quantity}, ${((item.weightEach || 0) * (item.quantity || 1))} lbs`)
      .join("\n");

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">🚚 New Online Estimate Submission</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="font-size: 16px; color: #0284c7; margin-top: 0;">Contact Information</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #6b7280; width: 120px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${name}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Email</td><td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #0284c7;">${email}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Phone</td><td style="padding: 6px 0;"><a href="tel:${phone || ''}" style="color: #0284c7;">${phone || "N/A"}</a></td></tr>
          </table>
          <h2 style="font-size: 16px; color: #0284c7;">Move Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #6b7280; width: 120px;">From</td><td style="padding: 6px 0;">${fromLocation}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">To</td><td style="padding: 6px 0;">${toLocation}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Distance</td><td style="padding: 6px 0;">${distance || "—"} miles (${moveType || "—"})</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Move Date</td><td style="padding: 6px 0;">${moveDate || "Not specified"}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Home Size</td><td style="padding: 6px 0;">${homeSize || "—"}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Packing</td><td style="padding: 6px 0;">${needsPackingService ? "Yes" : "No"}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Auto Transport</td><td style="padding: 6px 0;">${hasVehicleTransport ? "Yes" : "No"}</td></tr>
          </table>
          <h2 style="font-size: 16px; color: #0284c7;">Inventory (${items?.length || 0} items, ${totalWeight?.toLocaleString() || 0} lbs)</h2>
          <pre style="background: #f9fafb; padding: 16px; border-radius: 8px; font-size: 13px; line-height: 1.6; white-space: pre-wrap; border: 1px solid #e5e7eb;">${inventoryList || "No items added"}</pre>
          <div style="margin-top: 20px; padding: 16px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
            <h3 style="margin: 0 0 8px; font-size: 15px; color: #0284c7;">Estimated Range</h3>
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #0c4a6e;">$${estimateMin?.toLocaleString() || "—"} — $${estimateMax?.toLocaleString() || "—"}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">Lead ID: ${leadId} · Generated by TruMove Online Estimate Tool</p>
        </div>
      </div>`;

    await supabase.functions.invoke("send-deal-email", {
      body: {
        to: "leads@trumoveinc.com",
        subject: `New Online Estimate: ${name} — ${fromLocation} → ${toLocation}`,
        htmlBody,
      },
    });

    return new Response(JSON.stringify({ success: true, leadId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("submit-estimate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function createNewLead(supabase: any, d: any): Promise<string> {
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      first_name: d.firstName,
      last_name: d.lastName,
      email: d.email,
      phone: d.phone || null,
      origin_address: d.fromLocation,
      destination_address: d.toLocation,
      move_date: d.moveDate || null,
      estimated_weight: d.totalWeight || null,
      estimated_value: d.estimateMax || null,
      source: "website",
      status: "new",
      notes: `Online Estimate: ${d.items?.length || 0} items, ${d.totalCubicFeet || 0} cu ft, est. $${d.estimateMin}-$${d.estimateMax}`,
      tags: ["online-estimate"],
    })
    .select("id")
    .single();

  if (error) {
    console.error("Lead insert error:", error);
    throw new Error("Failed to create lead");
  }
  return lead.id;
}

async function insertAttribution(supabase: any, leadId: string, attribution: any, extra: any) {
  const attr = attribution || {};
  await supabase.from("lead_attribution").insert({
    lead_id: leadId,
    utm_source: attr.utm_source || null,
    utm_medium: attr.utm_medium || null,
    utm_campaign: attr.utm_campaign || null,
    utm_term: attr.utm_term || null,
    utm_content: attr.utm_content || null,
    gclid: attr.gclid || null,
    fbclid: attr.fbclid || null,
    msclkid: attr.msclkid || null,
    referrer_url: attr.referrer_url || null,
    landing_page: attr.landing_page || null,
    device_type: attr.device_type || null,
    browser: attr.browser || null,
    os: attr.os || null,
    screen_resolution: attr.screen_resolution || null,
    viewport_size: attr.viewport_size || null,
    user_agent: attr.user_agent || null,
    timezone: attr.timezone || null,
    browser_language: attr.browser_language || null,
    connection_type: attr.connection_type || null,
    is_touch_device: attr.is_touch_device || false,
    color_depth: attr.color_depth || null,
    hardware_concurrency: attr.hardware_concurrency || null,
    do_not_track: attr.do_not_track || false,
    pdf_viewer_enabled: attr.pdf_viewer_enabled || false,
    cookies_enabled: attr.cookies_enabled ?? true,
    ip_geolocation: null,
    session_duration_seconds: attr.session_duration_seconds || 0,
    pages_visited: attr.pages_visited || 0,
    page_path_history: attr.page_path_history || [],
    visit_count: attr.visit_count || 1,
    tab_blur_count: attr.tab_blur_count || 0,
    max_scroll_depth: attr.max_scroll_depth || 0,
    ad_blocker_detected: attr.ad_blocker_detected || false,
    form_started_at: attr.form_started_at || null,
    form_completed_at: attr.form_completed_at || null,
    lead_source_self_reported: extra.leadSource || null,
    preferred_contact_method: extra.contactPreference || null,
    move_urgency: extra.moveUrgency || null,
    sms_consent: extra.smsConsent || false,
    sms_consent_timestamp: extra.smsConsentTimestamp || null,
    sms_consent_ip: extra.smsConsentIp || null,
  });
}
