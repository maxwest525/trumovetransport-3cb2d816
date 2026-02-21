import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AddActivityFormProps {
  dealId: string;
  leadId: string | null;
  onAdded: () => void;
}

const TYPES = [
  { value: "call", label: "Log Call" },
  { value: "email", label: "Email" },
  { value: "note", label: "Note" },
  { value: "follow_up", label: "Follow-up" },
  { value: "meeting", label: "Meeting" },
  { value: "text", label: "Text" },
];

export function AddActivityForm({ dealId, leadId, onAdded }: AddActivityFormProps) {
  const [type, setType] = useState("note");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim()) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("activities" as any).insert({
      deal_id: dealId,
      lead_id: leadId,
      agent_id: user?.id,
      type,
      subject,
      description: description || null,
    } as any);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSubject("");
      setDescription("");
      onAdded();
    }
  };

  return (
    <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-8 text-sm" />
      <Textarea placeholder="Details (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="text-sm min-h-[60px]" />
      <Button size="sm" onClick={handleSubmit} disabled={loading || !subject.trim()}>
        {loading ? "Saving..." : "Add Activity"}
      </Button>
    </div>
  );
}
