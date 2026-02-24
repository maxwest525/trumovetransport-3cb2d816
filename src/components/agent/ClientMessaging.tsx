import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Mail, MessageSquare, Send, FileText, Copy, Check, UserRound, ChevronsUpDown, Plus, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPhoneNumber } from "@/lib/phoneFormat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [newLead, setNewLead] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [isCreatingLead, setIsCreatingLead] = useState(false);

  const queryClient = useQueryClient();

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

  const handleCreateLead = async () => {
    if (!newLead.firstName || !newLead.lastName) {
      toast.error("First and last name are required");
      return;
    }
    setIsCreatingLead(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .insert({
          first_name: newLead.firstName,
          last_name: newLead.lastName,
          email: newLead.email || null,
          phone: newLead.phone || null,
          status: "new",
        })
        .select("id, first_name, last_name, email, phone")
        .single();
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["leads-for-messaging"] });
      handleCustomerSelect(data.id);
      setShowNewLeadForm(false);
      setNewLead({ firstName: "", lastName: "", email: "", phone: "" });
      setCustomerPickerOpen(false);
      toast.success(`Lead ${data.first_name} ${data.last_name} created`);
    } catch (err: any) {
      toast.error("Failed to create lead", { description: err.message });
    } finally {
      setIsCreatingLead(false);
    }
  };

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

  const lowerQuery = searchQuery.toLowerCase();
  const filteredEmailTemplates = EMAIL_TEMPLATES.filter(
    (t) => t.name.toLowerCase().includes(lowerQuery) || t.body.toLowerCase().includes(lowerQuery)
  );
  const filteredSmsTemplates = SMS_TEMPLATES.filter(
    (t) => t.name.toLowerCase().includes(lowerQuery) || t.body.toLowerCase().includes(lowerQuery)
  );
  return (
    <div className="space-y-5">
      {/* Page Header with Search */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold shrink-0">Customer Chat</h2>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search messages, templates…"
            className="pl-9 h-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Picker */}
      <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
          <UserRound className="w-4 h-4" />
          Send to:
        </div>
        <Popover open={customerPickerOpen} onOpenChange={setCustomerPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={customerPickerOpen}
              className="w-72 justify-between bg-background font-normal"
            >
              {selectedLead
                ? `${selectedLead.first_name} ${selectedLead.last_name}`
                : "Search customers…"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search by name…" />
              <CommandList>
                <CommandEmpty>No customers found.</CommandEmpty>
                <CommandGroup>
                  {leads.map((lead) => (
                    <CommandItem
                      key={lead.id}
                      value={`${lead.first_name} ${lead.last_name}`}
                      onSelect={() => {
                        handleCustomerSelect(lead.id);
                        setCustomerPickerOpen(false);
                        setShowNewLeadForm(false);
                      }}
                    >
                      <span className="font-medium">{lead.first_name} {lead.last_name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {activeTab === "email" ? (lead.email || "no email") : (lead.phone || "no phone")}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
              {/* Create New Lead */}
              <div className="border-t p-2">
                {!showNewLeadForm ? (
                  <button
                    type="button"
                    onClick={() => setShowNewLeadForm(true)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-primary hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create new lead
                  </button>
                ) : (
                  <div className="space-y-2 p-1">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="First name *"
                        value={newLead.firstName}
                        onChange={(e) => setNewLead(p => ({ ...p, firstName: e.target.value }))}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="Last name *"
                        value={newLead.lastName}
                        onChange={(e) => setNewLead(p => ({ ...p, lastName: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <Input
                      placeholder="Email"
                      value={newLead.email}
                      onChange={(e) => setNewLead(p => ({ ...p, email: e.target.value }))}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Phone"
                      value={newLead.phone}
                      onChange={(e) => setNewLead(p => ({ ...p, phone: e.target.value }))}
                      className="h-8 text-xs"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={() => {
                          setShowNewLeadForm(false);
                          setNewLead({ firstName: "", lastName: "", email: "", phone: "" });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-xs gap-1"
                        onClick={handleCreateLead}
                        disabled={isCreatingLead || !newLead.firstName || !newLead.lastName}
                      >
                        {isCreatingLead ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        Create
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Command>
          </PopoverContent>
        </Popover>
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
                {filteredEmailTemplates.map((template) => (
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
                {filteredSmsTemplates.map((template) => (
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
