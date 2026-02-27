import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AddLeadDealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

interface VendorOption {
  id: string;
  name: string;
}

export function AddLeadDealForm({ open, onOpenChange, onAdded }: AddLeadDealFormProps) {
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    source: "website",
    vendor_id: "",
    origin_address: "",
    destination_address: "",
    move_date: "",
    deal_value: "",
  });

  useEffect(() => {
    if (open) {
      supabase.from("lead_vendors").select("id, name").eq("status", "active").order("name").then(({ data }) => {
        setVendors((data as VendorOption[]) || []);
      });
    }
  }, [open]);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Create lead
    const { data: lead, error: leadErr } = await supabase.from("leads" as any).insert({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email || null,
      phone: form.phone || null,
      source: form.source,
      vendor_id: form.vendor_id || null,
      assigned_agent_id: user?.id,
      origin_address: form.origin_address || null,
      destination_address: form.destination_address || null,
      move_date: form.move_date || null,
    } as any).select().single();

    if (leadErr) {
      toast({ title: "Error creating lead", description: leadErr.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Create deal
    const { error: dealErr } = await supabase.from("deals" as any).insert({
      lead_id: (lead as any).id,
      assigned_agent_id: user?.id,
      deal_value: form.deal_value ? parseFloat(form.deal_value) : 0,
      stage: "new_lead",
    } as any);

    setLoading(false);
    if (dealErr) {
      toast({ title: "Error creating deal", description: dealErr.message, variant: "destructive" });
    } else {
      toast({ title: "Lead & deal created" });
      setForm({ first_name: "", last_name: "", email: "", phone: "", source: "website", vendor_id: "", origin_address: "", destination_address: "", move_date: "", deal_value: "" });
      onOpenChange(false);
      onAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Lead + Deal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">First Name *</Label><Input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} className="h-8" /></div>
            <div><Label className="text-xs">Last Name *</Label><Input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} className="h-8" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-8" /></div>
            <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-8" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Source</Label>
              <Select value={form.source} onValueChange={(v) => update("source", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="ppc">PPC</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Lead Vendor</Label>
              <Select value={form.vendor_id} onValueChange={(v) => update("vendor_id", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label className="text-xs">Deal Value ($)</Label><Input type="number" value={form.deal_value} onChange={(e) => update("deal_value", e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Origin Address</Label><Input value={form.origin_address} onChange={(e) => update("origin_address", e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Destination Address</Label><Input value={form.destination_address} onChange={(e) => update("destination_address", e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Move Date</Label><Input type="date" value={form.move_date} onChange={(e) => update("move_date", e.target.value)} className="h-8" /></div>
        </div>
        <Button onClick={handleSubmit} disabled={loading}>{loading ? "Creating..." : "Create Lead & Deal"}</Button>
      </DialogContent>
    </Dialog>
  );
}
