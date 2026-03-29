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
      // Enhanced attribution fields
      leadSource, contactPreference, moveUrgency,
      smsConsent, smsConsentTimestamp, smsConsentIp,
      attribution,
    } = await req.json();

    if (!name || !email || !fromLocation || !toLocation) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Create lead
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(" ") || "-";

    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        origin_address: fromLocation,
        destination_address: toLocation,
        move_date: moveDate || null,
        estimated_weight: totalWeight || null,
        estimated_value: estimateMax || null,
        source: "website",
        status: "new",
        notes: `Online Estimate: ${items?.length || 0} items, ${totalCubicFeet || 0} cu ft, est. $${estimateMin}-$${estimateMax}`,
        tags: ["online-estimate"],
      })
      .select("id")
      .single();

    if (leadErr) {
      console.error("Lead insert error:", leadErr);
      throw new Error("Failed to create lead");
    }

    const leadId = lead.id;

    // 2. Insert move details
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

    // 3. Insert inventory items
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

    // 4. Create deal
    await supabase.from("deals").insert({
      lead_id: leadId,
      stage: "new_lead",
      deal_value: estimateMax || 0,
    });

    // 5. Send email notification via send-deal-email
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

    // Fire and forget email
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
