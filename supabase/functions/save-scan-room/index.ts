import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type IncomingPhoto = {
  id: string;
  dataUrl: string;
  name?: string;
  roomLabel?: string;
  boxes?: Array<{ id: number; name: string; confidence: number; x: number; y: number; width: number; height: number }>;
  itemCount?: number;
};

type IncomingItem = {
  name: string;
  room: string;
  weight: number;
  cubicFeet: number;
  quantity?: number;
  confidence?: number;
  photoLocalId?: string;
  detectionBox?: { x: number; y: number; width: number; height: number };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json();
    const {
      anonymousLeadId,
      firstName,
      lastName,
      email,
      phone,
      photos = [],
      items = [],
      totalWeight,
      totalCubicFeet,
    }: {
      anonymousLeadId?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      photos: IncomingPhoto[];
      items: IncomingItem[];
      totalWeight?: number;
      totalCubicFeet?: number;
    } = body;

    let leadId: string | null = null;

    // 1a. Try to use existing anonymous lead (auto-save flow)
    if (anonymousLeadId) {
      const { data: existing } = await supabase
        .from("leads")
        .select("id, first_name, last_name, email, phone, tags")
        .eq("id", anonymousLeadId)
        .maybeSingle();

      if (existing) {
        leadId = existing.id;
        // Upgrade the anonymous lead with any contact info we have
        const updates: Record<string, unknown> = {};
        if (firstName && firstName.trim() && existing.first_name === "Anonymous") {
          updates.first_name = firstName.trim();
        }
        if (lastName && lastName.trim() && (!existing.last_name || existing.last_name === "Visitor")) {
          updates.last_name = lastName.trim();
        }
        if (email && email.trim() && !existing.email) updates.email = email.trim();
        if (phone && phone.trim() && !existing.phone) updates.phone = phone.trim();

        const tags = new Set([...(existing.tags || []), "scan-room", "ai-detected"]);
        updates.tags = Array.from(tags);
        if (totalWeight) updates.estimated_weight = totalWeight;
        updates.notes = `AI room scan - ${items.length} items detected across ${photos.length} photo(s)`;

        await supabase.from("leads").update(updates).eq("id", leadId);
      }
    }

    // 1b. Otherwise create a fresh lead (visitor with no consent / no anonymous id yet)
    if (!leadId) {
      const { data: lead, error: leadErr } = await supabase
        .from("leads")
        .insert({
          first_name: firstName?.trim() || "Anonymous",
          last_name: lastName?.trim() || "Scan",
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          source: "website",
          status: "new",
          estimated_weight: totalWeight ?? null,
          notes: `AI room scan - ${items.length} items detected across ${photos.length} photo(s)`,
          tags: ["scan-room", "ai-detected"],
        })
        .select("id")
        .single();

      if (leadErr || !lead) {
        console.error("Lead insert error:", leadErr);
        return new Response(
          JSON.stringify({ error: "Could not create lead", detail: leadErr?.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      leadId = lead.id;
    }

    // 2. Upload each photo to storage and remember the public URL keyed by local id
    const photoIdToUrl = new Map<string, string>();

    for (const photo of photos) {
      try {
        if (!photo.dataUrl?.startsWith("data:")) continue;
        const match = photo.dataUrl.match(/^data:(.+?);base64,(.+)$/);
        if (!match) continue;
        const contentType = match[1];
        const base64 = match[2];
        const ext = contentType.split("/")[1]?.split(";")[0] || "jpg";
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const path = `${leadId}/${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("scan-room-photos")
          .upload(path, bytes, { contentType, upsert: false });

        if (upErr) {
          console.error("Photo upload error:", upErr);
          continue;
        }

        const { data: pub } = supabase.storage.from("scan-room-photos").getPublicUrl(path);
        const publicUrl = pub.publicUrl;
        photoIdToUrl.set(photo.id, publicUrl);

        // Record this scan photo for the lead
        await supabase.from("lead_scan_photos").insert({
          lead_id: leadId,
          photo_url: publicUrl,
          room_label: photo.roomLabel || photo.name || null,
          detected_boxes: photo.boxes || [],
          item_count: photo.itemCount ?? 0,
        });
      } catch (e) {
        console.error("Photo processing error:", e);
      }
    }

    // 3. Insert inventory rows, tagged as ai-scan and linked back to source photo
    if (items.length > 0) {
      const rows = items.map((it) => ({
        lead_id: leadId,
        item_name: it.name,
        room: it.room || "Living Room",
        quantity: Math.max(1, it.quantity ?? 1),
        cubic_feet: it.cubicFeet || 0,
        weight: it.weight || 0,
        source: "ai-scan",
        source_photo_url: it.photoLocalId ? photoIdToUrl.get(it.photoLocalId) ?? null : null,
        detection_box: it.detectionBox ?? null,
        confidence: it.confidence ?? null,
      }));
      const { error: invErr } = await supabase.from("lead_inventory").insert(rows);
      if (invErr) console.error("Inventory insert error:", invErr);
    }

    // 4. Ensure a deal exists for this lead (don't duplicate if already created)
    const { data: existingDeal } = await supabase
      .from("deals")
      .select("id")
      .eq("lead_id", leadId)
      .limit(1)
      .maybeSingle();

    if (!existingDeal) {
      await supabase.from("deals").insert({
        lead_id: leadId,
        stage: "new_lead",
        deal_value: 0,
      });
    }

    // Return the local-id -> permanent public URL mapping so the client can rebuild
    // its scan history with URLs that survive a refresh.
    const photoMap: Record<string, string> = {};
    for (const [k, v] of photoIdToUrl.entries()) photoMap[k] = v;

    return new Response(
      JSON.stringify({
        success: true,
        leadId,
        uploaded: photoIdToUrl.size,
        items: items.length,
        photoMap,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("save-scan-room error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
