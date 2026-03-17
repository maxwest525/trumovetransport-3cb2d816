import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AgentShell from "@/components/layout/AgentShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2, ArrowRight, Sparkles, MapPin, Calendar, Phone, Mail, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MoveSummaryPanel from "@/components/agent/MoveSummaryPanel";
import { toast } from "sonner";

const DEMO_DATA = {
  firstName: "Marcus", lastName: "Rivera",
  email: "marcus.rivera@gmail.com", phone: "(305) 555-8421",
  source: "website", originAddress: "1842 Ocean Drive, Miami, FL 33139",
  destinationAddress: "456 Peachtree St NE, Atlanta, GA 30308",
  moveDate: "2026-04-15", estimatedValue: "4200",
  notes: "3BR/2BA apartment, 2nd floor with elevator. Has a piano that needs special handling.",
};

export default function AgentNewCustomer() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    source: "phone" as string, originAddress: "", destinationAddress: "",
    moveDate: "", estimatedValue: "", notes: "",
  });

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const fillDemo = () => {
    setForm(DEMO_DATA);
    toast.success("Demo data loaded");
  };

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName) {
      toast.error("First and last name are required");
      return;
    }
    setIsSaving(true);
    try {
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert({
          first_name: form.firstName, last_name: form.lastName,
          email: form.email || null, phone: form.phone || null,
          source: form.source as any, origin_address: form.originAddress || null,
          destination_address: form.destinationAddress || null,
          move_date: form.moveDate || null,
          estimated_value: form.estimatedValue ? Number(form.estimatedValue) : null,
          notes: form.notes || null, status: "new",
        })
        .select().single();
      if (leadError) throw leadError;

      const { error: dealError } = await supabase
        .from("deals")
        .insert({ lead_id: lead.id, stage: "new_lead", deal_value: form.estimatedValue ? Number(form.estimatedValue) : null });
      if (dealError) throw dealError;

      toast.success(`Customer ${form.firstName} ${form.lastName} created`);
      navigate(`/agent/move-details/${lead.id}`);
    } catch (err: any) {
      console.error("Error creating customer:", err);
      toast.error("Failed to create customer", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = form.firstName && form.lastName;

  return (
    <AgentShell breadcrumb=" / New Lead">
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        {/* Workflow breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-primary font-semibold">New Lead</span>
          <ArrowRight className="w-3 h-3" />
          <span>Customer Detail</span>
          <ArrowRight className="w-3 h-3" />
          <span>E-Sign / Payment</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Create New Lead
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Enter customer details to start the onboarding flow</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={fillDemo}>
            <Sparkles className="w-3.5 h-3.5" />
            Fill Demo
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Form */}
          <div className="flex-1 min-w-0">
            <Card className="border border-border shadow-sm">
              <CardContent className="p-6 space-y-5">
                {/* Contact Info */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Contact Information
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">First Name <span className="text-destructive">*</span></Label>
                      <Input value={form.firstName} onChange={e => updateField("firstName", e.target.value)} placeholder="John" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Last Name <span className="text-destructive">*</span></Label>
                      <Input value={form.lastName} onChange={e => updateField("lastName", e.target.value)} placeholder="Smith" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
                      <Input type="email" value={form.email} onChange={e => updateField("email", e.target.value)} placeholder="john@email.com" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</Label>
                      <Input value={form.phone} onChange={e => updateField("phone", e.target.value)} placeholder="(555) 123-4567" />
                    </div>
                  </div>
                </div>

                {/* Move Details */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Move Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Origin Address</Label>
                      <Input value={form.originAddress} onChange={e => updateField("originAddress", e.target.value)} placeholder="123 Main St, City, ST" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Destination Address</Label>
                      <Input value={form.destinationAddress} onChange={e => updateField("destinationAddress", e.target.value)} placeholder="456 Oak Ave, City, ST" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Move Date</Label>
                      <Input type="date" value={form.moveDate} onChange={e => updateField("moveDate", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Estimated Value ($)</Label>
                      <Input type="number" value={form.estimatedValue} onChange={e => updateField("estimatedValue", e.target.value)} placeholder="3,500" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Lead Source</Label>
                      <Select value={form.source} onValueChange={v => updateField("source", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="ppc">PPC</SelectItem>
                          <SelectItem value="walk_in">Walk-in</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Notes</Label>
                  <Textarea value={form.notes} onChange={e => updateField("notes", e.target.value)} placeholder="Special items, access notes, etc..." rows={2} />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2 h-11" onClick={() => navigate("/agent/customers")} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button className="flex-1 gap-2 h-11" onClick={handleCreate} disabled={isSaving || !isValid}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {isSaving ? "Saving..." : "Save Lead"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky summary sidebar */}
          <MoveSummaryPanel form={form} />
        </div>
      </div>
    </AgentShell>
  );
}
