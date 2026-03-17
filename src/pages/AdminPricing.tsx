import { useState, useEffect } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DollarSign, Save, Loader2, Truck, Weight, MapPin, Percent, ArrowRight, Package,
} from "lucide-react";

interface PricingSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
}

export default function AdminPricing() {
  const [settings, setSettings] = useState<PricingSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from("pricing_settings")
      .select("*")
      .order("setting_key")
      .then(({ data, error }) => {
        if (error) {
          toast.error("Failed to load pricing settings");
          console.error(error);
        }
        setSettings((data as PricingSetting[]) || []);
        setLoading(false);
      });
  }, []);

  const getSetting = (key: string) => settings.find((s) => s.setting_key === key);

  const updateSetting = (key: string, path: string, value: number) => {
    setSettings((prev) =>
      prev.map((s) => {
        if (s.setting_key !== key) return s;
        const updated = { ...s.setting_value };
        const parts = path.split(".");
        let obj = updated;
        for (let i = 0; i < parts.length - 1; i++) {
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = value;
        return { ...s, setting_value: updated };
      })
    );
    setDirty((prev) => new Set(prev).add(key));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      for (const key of dirty) {
        const setting = settings.find((s) => s.setting_key === key);
        if (!setting) continue;
        const { error } = await supabase
          .from("pricing_settings")
          .update({
            setting_value: setting.setting_value,
            updated_at: new Date().toISOString(),
            updated_by: user?.id || null,
          })
          .eq("setting_key", key);
        if (error) throw error;
      }
      setDirty(new Set());
      toast.success("Pricing settings saved");
    } catch (err: any) {
      toast.error("Failed to save", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell breadcrumb=" / Products & Pricing">
        <div className="p-6 max-w-4xl mx-auto space-y-5">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </AdminShell>
    );
  }

  const baseRate = getSetting("base_rate_per_cuft");
  const baseLb = getSetting("base_rate_per_lb");
  const depositPct = getSetting("minimum_deposit_pct");
  const depositBySource = getSetting("deposit_rules_by_source");
  const carrierRates = getSetting("carrier_rates");
  const weightFactors = getSetting("weight_factors");
  const pricingMins = getSetting("pricing_minimums");
  const distanceTiers = getSetting("distance_tiers");

  return (
    <AdminShell breadcrumb=" / Products & Pricing">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Products & Pricing
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configure pricing rules, carrier rates, and deposit requirements
            </p>
          </div>
          <Button onClick={handleSave} disabled={dirty.size === 0 || saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Base Rates */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Base Rates
              </h2>
              <div className="space-y-3">
                <NumField
                  label="Price per Cubic Foot"
                  prefix="$"
                  value={baseRate?.setting_value?.value}
                  onChange={(v) => updateSetting("base_rate_per_cuft", "value", v)}
                  step={0.25}
                />
                <NumField
                  label="Price per Pound"
                  prefix="$"
                  value={baseLb?.setting_value?.value}
                  onChange={(v) => updateSetting("base_rate_per_lb", "value", v)}
                  step={0.05}
                />
              </div>
            </CardContent>
          </Card>

          {/* Minimum Deposit */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" /> Deposit Requirements
              </h2>
              <div className="space-y-3">
                <NumField
                  label="Default Deposit %"
                  suffix="%"
                  value={depositPct?.setting_value?.value}
                  onChange={(v) => updateSetting("minimum_deposit_pct", "value", v)}
                  step={5}
                />
                <NumField
                  label="Minimum Deposit Floor"
                  prefix="$"
                  value={depositPct?.setting_value?.min_amount}
                  onChange={(v) => updateSetting("minimum_deposit_pct", "min_amount", v)}
                  step={50}
                />
              </div>
            </CardContent>
          </Card>

          {/* Deposit by Lead Source */}
          <Card className="border border-border shadow-sm md:col-span-2">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" /> Deposit % by Lead Source
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {depositBySource &&
                  Object.entries(depositBySource.setting_value).map(([source, val]) => (
                    <div key={source} className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground capitalize">
                        {source.replace("_", " ")}
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={val as number}
                          onChange={(e) =>
                            updateSetting("deposit_rules_by_source", source, Number(e.target.value))
                          }
                          className="h-9 text-sm pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Carrier Rates */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Carrier Rates
              </h2>
              <div className="space-y-3">
                <NumField
                  label="Default Rate per Mile"
                  prefix="$"
                  value={carrierRates?.setting_value?.default?.per_mile}
                  onChange={(v) => updateSetting("carrier_rates", "default.per_mile", v)}
                  step={0.05}
                />
                <NumField
                  label="Fuel Surcharge"
                  suffix="%"
                  value={carrierRates?.setting_value?.default?.fuel_surcharge_pct}
                  onChange={(v) => updateSetting("carrier_rates", "default.fuel_surcharge_pct", v)}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>

          {/* Weight Factors */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5" /> Weight Factors
              </h2>
              <div className="space-y-3">
                <NumField
                  label="Light Item Avg (lbs)"
                  value={weightFactors?.setting_value?.light_item_avg_lbs}
                  onChange={(v) => updateSetting("weight_factors", "light_item_avg_lbs", v)}
                  step={5}
                />
                <NumField
                  label="Medium Item Avg (lbs)"
                  value={weightFactors?.setting_value?.medium_item_avg_lbs}
                  onChange={(v) => updateSetting("weight_factors", "medium_item_avg_lbs", v)}
                  step={5}
                />
                <NumField
                  label="Heavy Item Avg (lbs)"
                  value={weightFactors?.setting_value?.heavy_item_avg_lbs}
                  onChange={(v) => updateSetting("weight_factors", "heavy_item_avg_lbs", v)}
                  step={10}
                />
                <NumField
                  label="Special Handling Multiplier"
                  suffix="×"
                  value={weightFactors?.setting_value?.special_handling_multiplier}
                  onChange={(v) => updateSetting("weight_factors", "special_handling_multiplier", v)}
                  step={0.1}
                />
              </div>
            </CardContent>
          </Card>

          {/* Distance Tiers */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Distance Tiers
              </h2>
              <div className="space-y-3">
                <NumField
                  label="Local Max (miles)"
                  value={distanceTiers?.setting_value?.local_max_miles}
                  onChange={(v) => updateSetting("distance_tiers", "local_max_miles", v)}
                  step={10}
                />
                <NumField
                  label="Regional Max (miles)"
                  value={distanceTiers?.setting_value?.regional_max_miles}
                  onChange={(v) => updateSetting("distance_tiers", "regional_max_miles", v)}
                  step={50}
                />
                <NumField
                  label="Local Multiplier"
                  suffix="×"
                  value={distanceTiers?.setting_value?.local_multiplier}
                  onChange={(v) => updateSetting("distance_tiers", "local_multiplier", v)}
                  step={0.05}
                />
                <NumField
                  label="Regional Multiplier"
                  suffix="×"
                  value={distanceTiers?.setting_value?.regional_multiplier}
                  onChange={(v) => updateSetting("distance_tiers", "regional_multiplier", v)}
                  step={0.05}
                />
                <NumField
                  label="Long Distance Multiplier"
                  suffix="×"
                  value={distanceTiers?.setting_value?.long_distance_multiplier}
                  onChange={(v) => updateSetting("distance_tiers", "long_distance_multiplier", v)}
                  step={0.05}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Minimums */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Pricing Minimums
              </h2>
              <div className="space-y-3">
                <NumField
                  label="Minimum Job Value"
                  prefix="$"
                  value={pricingMins?.setting_value?.minimum_job_value}
                  onChange={(v) => updateSetting("pricing_minimums", "minimum_job_value", v)}
                  step={50}
                />
                <NumField
                  label="Min Local Rate"
                  prefix="$"
                  value={pricingMins?.setting_value?.minimum_local_rate}
                  onChange={(v) => updateSetting("pricing_minimums", "minimum_local_rate", v)}
                  step={25}
                />
                <NumField
                  label="Min Long Distance Rate"
                  prefix="$"
                  value={pricingMins?.setting_value?.minimum_long_distance_rate}
                  onChange={(v) => updateSetting("pricing_minimums", "minimum_long_distance_rate", v)}
                  step={50}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

/* Reusable number field */
function NumField({
  label,
  value,
  onChange,
  step = 1,
  prefix,
  suffix,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          step={step}
          value={value ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`h-9 text-sm ${prefix ? "pl-7" : ""} ${suffix ? "pr-7" : ""}`}
        />
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}