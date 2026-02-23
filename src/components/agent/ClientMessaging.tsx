import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Send, FileText, Copy, Check, UserRound } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPhoneNumber } from "@/lib/phoneFormat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EMAIL_TEMPLATES = [
  {
    id: "booking-confirm",
    name: "Booking Confirmation",
    subject: "Your Move is Confirmed - {booking_id}",
    body: `Dear {customer_name},

Thank you for choosing TruMove for your upcoming relocation!

We're pleased to confirm your booking:
• Booking ID: {booking_id}
• Move Date: {move_date}
• Pickup: {origin_address}
• Delivery: {dest_address}
• Estimated Weight: {weight}

Our team will arrive between {time_window}. Please ensure someone is available to provide access.

If you have any questions, reply to this email or call us at (800) 555-MOVE.

Best regards,
The TruMove Team`,
  },
  {
    id: "day-before",
    name: "Day Before Reminder",
    subject: "Your Move is Tomorrow! - {booking_id}",
    body: `Hi {customer_name},

Just a friendly reminder that your move is scheduled for tomorrow!

📅 Date: {move_date}
⏰ Arrival Window: {time_window}
📍 Pickup: {origin_address}

Please have the following ready:
✓ Clear pathways for our crew
✓ Fragile items marked
✓ Payment method confirmed
✓ Someone available to sign paperwork

Questions? Call us anytime at (800) 555-MOVE.

See you tomorrow!
TruMove Team`,
  },
  {
    id: "followup",
    name: "Post-Move Follow-up",
    subject: "How Was Your Move? - {booking_id}",
    body: `Dear {customer_name},

We hope your move went smoothly! Your satisfaction is our top priority.

We'd love to hear about your experience. Could you take a moment to:
⭐ Leave us a review: [Review Link]
📝 Complete our quick survey: [Survey Link]

If you experienced any issues or have concerns, please reply to this email immediately and we'll address them right away.

Thank you for choosing TruMove!

Warm regards,
The TruMove Team`,
  },
];

const SMS_TEMPLATES = [
  {
    id: "sms-confirm",
    name: "Booking Confirmed",
    body: `TruMove: Your move is confirmed for {move_date}! Booking #{booking_id}. Reply HELP for assistance.`,
  },
  {
    id: "sms-otw",
    name: "On The Way",
    body: `TruMove: Your crew is on the way! ETA: {eta}. Track live: {tracking_link}`,
  },
  {
    id: "sms-arrived",
    name: "Crew Arrived",
    body: `TruMove: Your crew has arrived at {origin_address}. Please meet them at the entrance.`,
  },
  {
    id: "sms-complete",
    name: "Move Complete",
    body: `TruMove: Your move is complete! Thank you for choosing us. Questions? Call (800) 555-MOVE`,
  },
];

export function ClientMessaging() {
  const [activeTab, setActiveTab] = useState("email");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [recipient, setRecipient] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const { data: leads = [] } = useQuery({
    queryKey: ["leads-for-messaging"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, first_name, last_name, email, phone")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (activeTab === "email") {
      const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        setEmailSubject(template.subject);
        setMessageBody(template.body);
      }
    } else {
      const template = SMS_TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        setMessageBody(template.body);
      }
    }
    toast.success("Template loaded");
  };

  const handleCustomerSelect = (leadId: string) => {
    setSelectedCustomer(leadId);
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setRecipient(activeTab === "email" ? (lead.email || "") : (lead.phone || ""));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageBody);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!recipient) {
      toast.error("Please enter a recipient");
      return;
    }
    if (!messageBody) {
      toast.error("Please enter a message");
      return;
    }
    toast.success(`${activeTab === "email" ? "Email" : "SMS"} sent successfully!`);
  };

  const selectedLead = leads.find((l) => l.id === selectedCustomer);

  return (
    <div className="space-y-5">
      {/* Customer Picker */}
      <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
          <UserRound className="w-4 h-4" />
          Send to:
        </div>
        <Select value={selectedCustomer} onValueChange={handleCustomerSelect}>
          <SelectTrigger className="w-64 bg-background">
            <SelectValue placeholder="Choose a customer…" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {leads.length === 0 ? (
              <SelectItem value="_none" disabled>No leads found</SelectItem>
            ) : (
              leads.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{lead.first_name} {lead.last_name}</span>
                    <span className="text-muted-foreground text-xs">
                      {activeTab === "email" ? (lead.email || "no email") : (lead.phone || "no phone")}
                    </span>
                  </span>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {selectedLead && (
          <span className="text-xs text-muted-foreground">
            → {activeTab === "email" ? selectedLead.email : selectedLead.phone}
          </span>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            SMS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Email Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {EMAIL_TEMPLATES.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className={cn(
                      "w-full justify-start border-foreground/20",
                      selectedTemplate === template.id 
                        ? "bg-foreground text-background border-foreground" 
                        : "hover:bg-foreground hover:text-background"
                    )}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    {template.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Compose */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Compose Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input
                    type="email"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="customer@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject line"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Message</Label>
                    <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <Textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder="Type your message..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSend} variant="outline" className="gap-2 border-foreground/20 hover:bg-foreground hover:text-background">
                    <Send className="w-4 h-4" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sms" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  SMS Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {SMS_TEMPLATES.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className={cn(
                      "w-full justify-start border-foreground/20",
                      selectedTemplate === template.id 
                        ? "bg-foreground text-background border-foreground" 
                        : "hover:bg-foreground hover:text-background"
                    )}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    {template.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Compose */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Compose SMS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={recipient}
                    onChange={(e) => setRecipient(formatPhoneNumber(e.target.value))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Message ({messageBody.length}/160 characters)</Label>
                    <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <Textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder="Type your SMS message..."
                    rows={4}
                    maxLength={320}
                  />
                  {messageBody.length > 160 && (
                    <p className="text-xs text-amber-500">
                      ⚠️ Message exceeds 160 chars - will be sent as {Math.ceil(messageBody.length / 160)} segments
                    </p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSend} variant="outline" className="gap-2 border-foreground/20 hover:bg-foreground hover:text-background">
                    <Send className="w-4 h-4" />
                    Send SMS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
