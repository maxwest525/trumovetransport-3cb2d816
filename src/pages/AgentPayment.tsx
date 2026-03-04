import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AgentShell from "@/components/layout/AgentShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard, Send, Loader2, CheckCircle2, DollarSign,
  Receipt, Mail, FileText, Lock, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

type PaymentMethod = "card" | "ach";
type PaymentMode = "charge" | "invoice";

export default function AgentPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillName = searchParams.get("name") || "";
  const prefillEmail = searchParams.get("email") || "";
  const leadId = searchParams.get("leadId") || "";

  const [mode, setMode] = useState<PaymentMode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const [form, setForm] = useState({
    customerName: prefillName,
    customerEmail: prefillEmail,
    amount: "",
    description: "Moving services",
    cardNumber: "", cardExpiry: "", cardCvc: "",
    routingNumber: "", accountNumber: "",
  });

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})/g, "$1 ").trim();
  };

  const handleChargeNow = async () => {
    if (!form.amount) { toast.error("Please enter an amount"); return; }
    if (!form.customerName) { toast.error("Please enter customer name"); return; }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
    toast.success("Payment processed successfully", { description: `$${Number(form.amount).toLocaleString()} charged to ${form.customerName}` });
  };

  const handleSendInvoice = async () => {
    if (!form.amount) { toast.error("Please enter an amount"); return; }
    if (!form.customerEmail) { toast.error("Please enter customer email for invoice"); return; }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setIsComplete(true);
    toast.success("Invoice sent successfully", { description: `$${Number(form.amount).toLocaleString()} invoice sent to ${form.customerEmail}` });
  };

  const goToCustomers = () => navigate(leadId ? `/agent/customers/${leadId}` : "/agent/customers");

  return (
    <AgentShell breadcrumb=" / Payment">
      <div className="p-6 max-w-md mx-auto space-y-6">
        {/* Workflow breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-foreground font-medium">New Customer</span>
          <ArrowRight className="w-3 h-3" />
          <span className="text-foreground font-medium">E-Sign</span>
          <ArrowRight className="w-3 h-3" />
          <span className="text-primary font-semibold">Payment</span>
          <ArrowRight className="w-3 h-3" />
          <span>My Customers</span>
        </div>

        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Collect Payment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Charge or invoice your customer</p>
        </div>

        {isComplete ? (
          <div className="py-8 text-center space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">{mode === "charge" ? "Payment Successful" : "Invoice Sent"}</p>
              <p className="text-sm text-muted-foreground mt-1">${Number(form.amount).toLocaleString()} • {form.customerName}</p>
            </div>
            <Badge variant="outline" className="text-xs gap-1">
              <FileText className="w-3 h-3" />Receipt #INV-{Math.floor(Math.random() * 9999).toString().padStart(4, "0")}
            </Badge>
            <div className="pt-4">
              <Button className="w-full gap-2" onClick={goToCustomers}>
                Continue to My Customers <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : !mode ? (
          <div className="space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Customer Name</Label>
                <Input value={form.customerName} onChange={e => updateField("customerName", e.target.value)} placeholder="John Smith" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Customer Email</Label>
                <Input type="email" value={form.customerEmail} onChange={e => updateField("customerEmail", e.target.value)} placeholder="john@email.com" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Amount ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="number" value={form.amount} onChange={e => updateField("amount", e.target.value)} placeholder="0.00" className="pl-9 text-lg font-semibold" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Input value={form.description} onChange={e => updateField("description", e.target.value)} placeholder="Moving services" />
              </div>
            </div>
            <Separator />
            <p className="text-sm font-medium text-muted-foreground">Choose payment method:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-5 flex-col gap-2 hover:border-primary hover:bg-primary/5" onClick={() => setMode("charge")} disabled={!form.amount}>
                <CreditCard className="w-6 h-6" />
                <span className="text-sm font-semibold">Charge Now</span>
                <span className="text-[10px] text-muted-foreground">Process card/ACH</span>
              </Button>
              <Button variant="outline" className="h-auto py-5 flex-col gap-2 hover:border-primary hover:bg-primary/5" onClick={() => setMode("invoice")} disabled={!form.amount}>
                <Receipt className="w-6 h-6" />
                <span className="text-sm font-semibold">Send Invoice</span>
                <span className="text-[10px] text-muted-foreground">Email invoice</span>
              </Button>
            </div>
          </div>
        ) : mode === "charge" ? (
          <div className="space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Charging</span>
              <span className="text-lg font-bold">${Number(form.amount).toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              <Button variant={paymentMethod === "card" ? "default" : "outline"} size="sm" className="flex-1 gap-1.5" onClick={() => setPaymentMethod("card")}>
                <CreditCard className="w-3.5 h-3.5" />Card
              </Button>
              <Button variant={paymentMethod === "ach" ? "default" : "outline"} size="sm" className="flex-1 gap-1.5" onClick={() => setPaymentMethod("ach")}>
                <DollarSign className="w-3.5 h-3.5" />ACH
              </Button>
            </div>
            {paymentMethod === "card" ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Card Number</Label>
                  <Input value={form.cardNumber} onChange={e => updateField("cardNumber", formatCardNumber(e.target.value))} placeholder="4242 4242 4242 4242" maxLength={19} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">Expiry</Label><Input value={form.cardExpiry} onChange={e => updateField("cardExpiry", e.target.value)} placeholder="MM/YY" maxLength={5} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">CVC</Label><Input value={form.cardCvc} onChange={e => updateField("cardCvc", e.target.value)} placeholder="123" maxLength={4} /></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5"><Label className="text-xs">Routing Number</Label><Input value={form.routingNumber} onChange={e => updateField("routingNumber", e.target.value)} placeholder="021000021" maxLength={9} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Account Number</Label><Input value={form.accountNumber} onChange={e => updateField("accountNumber", e.target.value)} placeholder="000123456789" /></div>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><Lock className="w-3 h-3" /><span>Demo mode — no real charges will be made</span></div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setMode(null)}>Back</Button>
              <Button className="flex-1 gap-2" onClick={handleChargeNow} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {isProcessing ? "Processing..." : "Charge Now"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Invoice for</span>
              <span className="text-lg font-bold">${Number(form.amount).toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-lg border border-border space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">To:</span><span className="font-medium">{form.customerName || "—"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Email:</span><span className="font-medium">{form.customerEmail || "—"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Description:</span><span className="font-medium">{form.description}</span></div>
              <Separator />
              <div className="flex justify-between text-sm font-semibold"><span>Total Due:</span><span>${Number(form.amount).toLocaleString()}</span></div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><Mail className="w-3 h-3" /><span>Invoice will be emailed with a payment link (demo mode)</span></div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setMode(null)}>Back</Button>
              <Button className="flex-1 gap-2" onClick={handleSendInvoice} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isProcessing ? "Sending..." : "Send Invoice"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AgentShell>
  );
}
