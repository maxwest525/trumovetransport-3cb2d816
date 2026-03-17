import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, Home, Footprints, Package, Sparkles, Loader2, Truck } from "lucide-react";
import MoveSummaryPanel from "@/components/agent/MoveSummaryPanel";

export default function AgentMoveDetails() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [lead, setLead] = useState<any>(null);

  const [form, setForm] = useState({
    property_type: "house",
    bedrooms: 2,
    floors: 1,
    has_stairs: false,
    stair_flights: 0,
    has_elevator: false,
    long_carry_ft: 0,
    is_apartment: false,
    special_packaging: false,
    fragile_items: false,
    special_treatment_notes: "",
    packing_service: false,
    auto_transport: false,
  });

  const [aiEstimate, setAiEstimate] = useState<{ cuFt?: number; weight?: number; pricePerCuFt?: number } | null>(null);

  useEffect(() => {
    if (!leadId) return;
    // Load lead
    supabase.from("leads").select("*").eq("id", leadId).single().then(({ data }) => {
      if (data) setLead(data);
    });
    // Load existing move details
    supabase.from("move_details").select("*").eq("lead_id", leadId).maybeSingle().then(({ data }) => {
      if (data) {
        setForm({
          property_type: data.property_type,
          bedrooms: data.bedrooms,
          floors: data.floors,
          has_stairs: data.has_stairs,
          stair_flights: data.stair_flights,
          has_elevator: data.has_elevator,
          long_carry_ft: data.long_carry_ft,
          is_apartment: data.is_apartment,
          special_packaging: data.special_packaging,
          fragile_items: data.fragile_items,
          special_treatment_notes: data.special_treatment_notes || "",
          packing_service: data.packing_service,
          auto_transport: (data as any).auto_transport ?? false,
        });
      }
    });
  }, [leadId]);

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleAiEstimate = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-move-estimate", {
        body: {
          bedrooms: form.bedrooms,
          floors: form.floors,
          property_type: form.property_type,
          is_apartment: form.is_apartment,
          has_stairs: form.has_stairs,
          stair_flights: form.stair_flights,
          special_packaging: form.special_packaging,
          fragile_items: form.fragile_items,
          packing_service: form.packing_service,
          origin: lead?.origin_address || "",
          destination: lead?.destination_address || "",
          move_date: lead?.move_date || "",
        },
      });
      if (error) throw error;
      setAiEstimate(data);
      toast.success("AI estimate generated");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to get AI estimate");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!leadId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("move_details").upsert({
        lead_id: leadId,
        ...form,
      }, { onConflict: "lead_id" });
      if (error) throw error;

      // Update lead with AI estimates if available
      if (aiEstimate) {
        const updates: any = {};
        if (aiEstimate.pricePerCuFt) updates.price_per_cuft = aiEstimate.pricePerCuFt;
        if (aiEstimate.weight) updates.estimated_weight = aiEstimate.weight;
        if (Object.keys(updates).length > 0) {
          await supabase.from("leads").update(updates).eq("id", leadId);
        }
      }

      toast.success("Move details saved");
      navigate(`/agent/inventory/${leadId}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => navigate(`/agent/inventory/${leadId}`);

  // Season detection
  const getSeason = () => {
    const month = lead?.move_date ? new Date(lead.move_date + "T00:00:00").getMonth() : new Date().getMonth();
    if (month >= 4 && month <= 8) return { label: "Peak Season", color: "text-destructive", bg: "bg-destructive/10" };
    if (month >= 2 && month <= 3 || month >= 9 && month <= 10) return { label: "Shoulder Season", color: "text-amber-600", bg: "bg-amber-500/10" };
    return { label: "Off Season", color: "text-emerald-600", bg: "bg-emerald-500/10" };
  };
  const season = getSeason();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto flex gap-8">
        {/* Main form */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Move Details</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Property info & special requirements for{" "}
              <span className="font-medium text-foreground">{lead?.first_name} {lead?.last_name}</span>
            </p>
          </div>

          {/* Season & Distance Info Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${season.color} ${season.bg}`}>
              {season.label}
            </span>
            {lead?.origin_address && lead?.destination_address && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-muted-foreground bg-muted/60">
                <Truck className="w-3 h-3" />
                {lead.origin_address.split(",")[0]} → {lead.destination_address.split(",")[0]}
              </span>
            )}
          </div>

          {/* Property Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Home className="w-4 h-4 text-primary" /> Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Property Type</Label>
                  <Select value={form.property_type} onValueChange={v => set("property_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="storage">Storage Unit</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Bedrooms</Label>
                  <Input type="number" min={0} max={20} value={form.bedrooms} onChange={e => set("bedrooms", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Floors in Property</Label>
                  <Input type="number" min={1} max={100} value={form.floors} onChange={e => set("floors", Number(e.target.value))} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label className="text-xs">Apartment / High-Rise?</Label>
                  <Switch checked={form.is_apartment} onCheckedChange={v => set("is_apartment", v)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access & Carry */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Footprints className="w-4 h-4 text-primary" /> Access & Long Carry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label className="text-xs">Has Stairs?</Label>
                  <Switch checked={form.has_stairs} onCheckedChange={v => set("has_stairs", v)} />
                </div>
                {form.has_stairs && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Flights of Stairs</Label>
                    <Input type="number" min={0} max={50} value={form.stair_flights} onChange={e => set("stair_flights", Number(e.target.value))} />
                  </div>
                )}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label className="text-xs">Has Elevator?</Label>
                  <Switch checked={form.has_elevator} onCheckedChange={v => set("has_elevator", v)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Long Carry — Truck to Door (ft)</Label>
                  <Input type="number" min={0} max={1000} placeholder="e.g. 75" value={form.long_carry_ft || ""} onChange={e => set("long_carry_ft", Number(e.target.value))} />
                  <p className="text-[10px] text-muted-foreground">Distance from where the truck parks to the front door</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Handling */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Special Handling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label className="text-xs">Special Packaging Needed</Label>
                  <Switch checked={form.special_packaging} onCheckedChange={v => set("special_packaging", v)} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label className="text-xs">Fragile Items</Label>
                  <Switch checked={form.fragile_items} onCheckedChange={v => set("fragile_items", v)} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border col-span-2">
                  <Label className="text-xs">Full Packing Service</Label>
                  <Switch checked={form.packing_service} onCheckedChange={v => set("packing_service", v)} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border col-span-2">
                  <div>
                    <Label className="text-xs">Auto Transport</Label>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Vehicle shipping included with this move</p>
                  </div>
                  <Switch checked={form.auto_transport} onCheckedChange={v => set("auto_transport", v)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Special Treatment Notes</Label>
                <Textarea
                  placeholder="Piano, antiques, pool table, gun safe, hot tub, etc."
                  value={form.special_treatment_notes}
                  onChange={e => set("special_treatment_notes", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Estimate */}
          <Card className="border-primary/20 bg-primary/[0.02]">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" /> AI Move Estimate
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Get AI-powered cu ft, weight & pricing based on property details, season, and distance
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleAiEstimate} disabled={aiLoading} className="gap-1.5">
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {aiLoading ? "Estimating…" : "Get Estimate"}
                </Button>
              </div>
              {aiEstimate && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-background border">
                    <p className="text-xl font-bold text-foreground">{aiEstimate.cuFt?.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Est. Cu Ft</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background border">
                    <p className="text-xl font-bold text-foreground">{aiEstimate.weight?.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Est. Lbs</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background border">
                    <p className="text-xl font-bold text-primary">${aiEstimate.pricePerCuFt?.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">$/Cu Ft</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" onClick={handleSkip} className="text-xs text-muted-foreground">
              Skip for now
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Save & Continue to Inventory
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <MoveSummaryPanel lead={lead || undefined} />
      </div>
    </div>
  );
}
