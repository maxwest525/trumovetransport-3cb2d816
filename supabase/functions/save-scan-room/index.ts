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
      firstName,
      lastName,
      email,
      phone,
      photos = [],
      items = [],
      totalWeight,
      totalCubicFeet,
    }: {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      photos: IncomingPhoto[];
      items: IncomingItem[];
      totalWeight?: number;
      totalCubicFeet?: number;
    } = body;

    if (!firstName || (!email && !phone)) {
      return new Response(
        JSON.stringify({ error: "First name and either email or phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Create the lead
    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .insert({
        first_name: firstName,
        last_name: lastName || "-",
        email: email || null,
        phone: phone || null,
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

    const leadId = lead.id;

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
        quantity: 1,
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

    // 4. Create a deal so it shows up in the pipeline
    await supabase.from("deals").insert({
      lead_id: leadId,
      stage: "new_lead",
      deal_value: 0,
    });

    return new Response(
      JSON.stringify({ success: true, leadId, uploaded: photoIdToUrl.size, items: items.length }),
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
