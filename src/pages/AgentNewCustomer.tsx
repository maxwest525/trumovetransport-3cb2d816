import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AgentShell from "@/components/layout/AgentShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2, CheckCircle2, Send, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AgentNewCustomer() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState<{ id: string; name: string; email: string; phone: string } | null>(null);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    source: "phone" as string, originAddress: "", destinationAddress: "",
    moveDate: "", estimatedValue: "", notes: "",
  });

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setForm({ firstName: "", lastName: "", email: "", phone: "", source: "phone", originAddress: "", destinationAddress: "", moveDate: "", estimatedValue: "", notes: "" });
    setCreatedCustomer(null);
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

      const customer = { id: lead.id, name: `${form.firstName} ${form.lastName}`, email: form.email, phone: form.phone };
      setCreatedCustomer(customer);
      toast.success(`Customer ${customer.name} created successfully`);
    } catch (err: any) {
      console.error("Error creating customer:", err);
      toast.error("Failed to create customer", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AgentShell breadcrumb=" / New Customer">
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          {createdCustomer ? "Customer Created" : "Create New Customer"}
        </h1>

        {createdCustomer ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <CheckCircle2 className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold">{createdCustomer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {createdCustomer.email && <span>{createdCustomer.email} • </span>}
                  {createdCustomer.phone && <span>{createdCustomer.phone}</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Added to pipeline as New Lead</p>
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">What would you like to do next?</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/agent/workspace")}>
                <Send className="w-5 h-5" /><span className="text-xs font-medium">Send E-Sign</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/agent/payments")}>
                <CreditCard className="w-5 h-5" /><span className="text-xs font-medium">Collect Payment</span>
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => navigate("/agent/dashboard")}>Done</Button>
              <Button variant="outline" className="flex-1" onClick={resetForm}>Create Another</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">First Name *</Label><Input value={form.firstName} onChange={e => updateField("firstName", e.target.value)} placeholder="John" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Last Name *</Label><Input value={form.lastName} onChange={e => updateField("lastName", e.target.value)} placeholder="Smith" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={e => updateField("email", e.target.value)} placeholder="john@email.com" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => updateField("phone", e.target.value)} placeholder="(555) 123-4567" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
              <div className="space-y-1.5"><Label className="text-xs">Estimated Value ($)</Label><Input type="number" value={form.estimatedValue} onChange={e => updateField("estimatedValue", e.target.value)} placeholder="3500" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Origin Address</Label><Input value={form.originAddress} onChange={e => updateField("originAddress", e.target.value)} placeholder="123 Main St, City, ST" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Destination Address</Label><Input value={form.destinationAddress} onChange={e => updateField("destinationAddress", e.target.value)} placeholder="456 Oak Ave, City, ST" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Move Date</Label><Input type="date" value={form.moveDate} onChange={e => updateField("moveDate", e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={e => updateField("notes", e.target.value)} placeholder="Any additional notes..." rows={2} /></div>
            <Button className="w-full gap-2" onClick={handleCreate} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {isSaving ? "Creating..." : "Create Customer"}
            </Button>
          </div>
        )}
      </div>
    </AgentShell>
  );
}
