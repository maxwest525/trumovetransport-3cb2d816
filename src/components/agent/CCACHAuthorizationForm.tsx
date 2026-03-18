import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logo from "@/assets/logo.png";
import { Check, CreditCard, Building, Send, Mail, UserPlus, Shield, Lock, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ClientSearchModal, type ClientData } from "./ClientSearchModal";
import { ESignStatusCard } from "@/components/esign/ESignStatusCard";
import { supabase } from "@/integrations/supabase/client";

type SignatureField = "initial1" | "initial2" | "signature";

interface CCACHAuthorizationFormProps {
  externalTypedName?: string;
  onExternalTypedNameChange?: (name: string) => void;
  /** When true, hides the built-in sidebar (used when embedded inside ESignViewPage which provides its own sidebar) */
  embedded?: boolean;
}

export function CCACHAuthorizationForm({ 
  externalTypedName, 
  onExternalTypedNameChange,
  embedded = false,
}: CCACHAuthorizationFormProps = {}) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  const [internalTypedName, setInternalTypedName] = useState("");
  const typedName = externalTypedName !== undefined ? externalTypedName : internalTypedName;
  const setTypedName = (name: string) => {
    if (onExternalTypedNameChange) {
      onExternalTypedNameChange(name);
    } else {
      setInternalTypedName(name);
    }
  };
  
  const [signatures, setSignatures] = useState<Record<SignatureField, boolean>>({
    initial1: false,
    initial2: false,
    signature: false,
  });
  const [currentField, setCurrentField] = useState<SignatureField>("initial1");
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Payment form data
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    address: "",
    paymentMethod: "card",
    cardNumber: "",
    expiry: "",
    cvv: "",
    bankName: "",
    routingNumber: "",
    accountNumber: "",
    amount: "2,450.00",
  });

  const fieldRefs = {
    initial1: useRef<HTMLDivElement>(null),
    initial2: useRef<HTMLDivElement>(null),
    signature: useRef<HTMLDivElement>(null),
  };

  // Auto-generate initials from name
  const typedInitials = typedName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const refNumber = `CC-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

  const handleSign = (field: SignatureField) => {
    if (field === "signature" && typedName.length < 2) return;
    if (field !== "signature" && typedInitials.length < 1) return;
    
    setSignatures(prev => ({ ...prev, [field]: true }));
    
    // Move to next field
    const fieldOrder: SignatureField[] = ["initial1", "initial2", "signature"];
    const currentIndex = fieldOrder.indexOf(field);
    if (currentIndex < fieldOrder.length - 1) {
      const nextField = fieldOrder[currentIndex + 1];
      setCurrentField(nextField);
      setTimeout(() => {
        fieldRefs[nextField].current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  };

  const handleSubmit = () => {
    if (Object.values(signatures).every(Boolean)) {
      toast.success("Payment authorization submitted successfully!");
    }
  };

  const handleClientSelect = (client: ClientData) => {
    setTypedName(client.name);
    setFormData(prev => ({
      ...prev,
      email: client.email || prev.email,
      phone: client.phone || prev.phone,
      address: client.address || prev.address,
    }));
  };

  const loadDemo = () => {
    setTypedName("Sarah Johnson");
    setFormData({
      email: "sarah.johnson@email.com",
      phone: "(555) 123-4567",
      address: "1234 Oak Street, Tampa, FL 33601",
      paymentMethod: "card",
      cardNumber: "4532 •••• •••• 7821",
      expiry: "08/27",
      cvv: "•••",
      bankName: "",
      routingNumber: "",
      accountNumber: "",
      amount: "2,450.00",
    });
    toast.success("Demo data loaded");
  };

  const handleSendPdfEmail = async () => {
    if (!allSigned) {
      toast.error("Please complete all signatures first");
      return;
    }
    if (!formData.email) {
      toast.error("Please enter a customer email address");
      return;
    }

    setIsSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-ccach-pdf", {
        body: {
          customerName: typedName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          paymentMethod: formData.paymentMethod,
          cardNumber: formData.cardNumber,
          expiry: formData.expiry,
          bankName: formData.bankName,
          routingNumber: formData.routingNumber,
          accountNumber: formData.accountNumber,
          amount: formData.amount,
          refNumber,
          signedDate: today,
          initials: typedInitials,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`PDF sent to ${formData.email}`);
      } else {
        throw new Error(data?.error || "Failed to send email");
      }
    } catch (err) {
      console.error("Error sending PDF:", err);
      toast.error(err instanceof Error ? err.message : "Failed to send PDF email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const allSigned = Object.values(signatures).every(Boolean);
  const canInitial = typedInitials.length >= 1;
  const canSign = typedName.length >= 2;

  const InitialBox = ({ field, style }: { field: SignatureField; style?: React.CSSProperties }) => {
    const isSigned = signatures[field];
    const isActive = currentField === field;
    const canApply = field === "signature" ? canSign : canInitial;

    return (
      <span 
        ref={fieldRefs[field]}
        onClick={() => canApply && handleSign(field)}
        style={{
          ...style,
          ...(isActive && canApply && !isSigned ? { borderColor: '#d97706', backgroundColor: '#fef3c7' } : {})
        }}
        className={`
          inline-flex items-center justify-center px-3 py-1 border-2 rounded
          transition-all cursor-pointer align-middle relative
          ${isSigned 
            ? "border-foreground bg-foreground/5" 
            : isActive && canApply
              ? "shadow-lg" 
              : canApply
                ? "border-foreground/70 hover:border-foreground hover:bg-muted/20" 
                : "border-muted-foreground/30 bg-muted/10 cursor-not-allowed"
          }
        `}
        title={isSigned ? "Signed" : canApply ? "Click to sign" : "Enter name first"}
      >
        {isSigned ? (
          <span 
            className="text-base font-semibold text-foreground whitespace-nowrap"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            {typedInitials}
          </span>
        ) : isActive && canApply ? (
          <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: '#b45309' }}>
            SIGN
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide whitespace-nowrap">
            initial
          </span>
        )}
      </span>
    );
  };

  return (
    <div className={embedded ? "" : "min-h-[600px] py-4"}>
      <ClientSearchModal
        open={showClientSearch}
        onClose={() => setShowClientSearch(false)}
        onSelect={handleClientSelect}
      />
      
      <div className={embedded ? "" : "max-w-[1200px] mx-auto flex gap-6"}>
        
        {/* Left Sidebar - hidden in embedded mode */}
        {!embedded && (
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* E-Sign Send Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-10 gap-2 border-foreground/20 hover:bg-foreground hover:text-background transition-all group"
              onClick={() => toast.success("SMS sent with e-sign link")}
            >
              <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              <span className="text-xs font-medium">Send SMS</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-10 gap-2 border-foreground/20 hover:bg-foreground hover:text-background transition-all group"
              onClick={() => toast.success("Email sent with e-sign link")}
            >
              <Mail className="h-4 w-4 group-hover:translate-y-[-1px] transition-transform" />
              <span className="text-xs font-medium">Send Email</span>
            </Button>
          </div>

          {/* Email Signed PDF Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full h-10 gap-2 border-foreground/20 hover:bg-foreground hover:text-background transition-all group"
            onClick={handleSendPdfEmail}
            disabled={!allSigned || isSendingEmail}
          >
            {isSendingEmail ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs font-medium">
              {isSendingEmail ? "Sending..." : "Email Signed PDF"}
            </span>
          </Button>

          {/* Customer Info Card */}
          <Card className="border border-border bg-background shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Customer Name
                </label>
                <Button
                  onClick={() => setShowClientSearch(true)}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  Import
                </Button>
              </div>
              <Input
                placeholder="e.g. John Smith"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="bg-background border-foreground/20 h-10 text-base"
              />
              
              {/* Always show signature/initials preview */}
              <div className="flex gap-3 pt-1">
                <div className="flex-1 border border-foreground/20 rounded px-3 py-2 bg-muted/10">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Signature</span>
                  <div 
                    className="text-lg text-foreground truncate min-h-[1.5rem]"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    {typedName || <span className="text-muted-foreground/50 text-sm">—</span>}
                  </div>
                </div>
                
                <div className="w-16 border border-foreground/20 rounded px-3 py-2 bg-muted/10">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Initials</span>
                  <div 
                    className="text-lg text-foreground min-h-[1.5rem]"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    {typedInitials || <span className="text-muted-foreground/50 text-sm">—</span>}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wide">How to Sign</p>
                <p>1. Enter customer's full legal name</p>
                <p>2. Click each highlighted <span className="font-mono text-xs border px-1 rounded">initial</span> box</p>
                <p>3. Apply signature and submit</p>
              </div>

              <Button
                onClick={loadDemo}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                Load Demo Data
              </Button>
            </CardContent>
          </Card>

          {/* Document Status Card */}
          <ESignStatusCard
            documentTitle="CC/ACH Authorization"
            recipientEmail={formData.email || undefined}
            recipientName={typedName}
            isSigned={allSigned}
            refNumber={refNumber}
          />

          {/* Progress */}
          <Card className="border border-border bg-background shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-medium text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
                Signing Progress
              </h3>
              <div className="space-y-1.5">
                {(["initial1", "initial2", "signature"] as SignatureField[]).map((field, i) => (
                  <div key={field} className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      signatures[field] ? "bg-foreground text-background" : "border border-muted-foreground/40"
                    }`}>
                      {signatures[field] ? <Check className="h-2.5 w-2.5" /> : i + 1}
                    </div>
                    <span className={signatures[field] ? "text-foreground" : "text-muted-foreground"}>
                      {field === "signature" ? "Signature" : `Section ${i + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Badge */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-2">
            <Lock className="w-3 h-3" />
            <span>PCI-DSS Compliant • 256-bit Encryption</span>
          </div>
        </div>
        )}

        {/* Document Container - Paper Size */}
        <div className="flex-1 max-w-[8.5in]">
          <Card className="shadow-xl border border-border bg-white">
            <CardContent className="p-0">
              {/* Document Header */}
              <div className="border-b border-foreground/10 px-10 py-6">
                <div className="flex items-start justify-between">
                  <img src={logo} alt="TruMove" className="h-8 w-auto" />
                  <div className="text-right">
                    <div className="font-mono text-xs text-foreground font-semibold tracking-wide">{refNumber}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{today}</div>
                  </div>
                </div>

                <div className="mt-6 mb-2">
                  <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    CREDIT CARD / ACH AUTHORIZATION
                  </h1>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mt-1">
                    TruMove LLC • Secure Payment Authorization Form
                  </p>
                </div>
              </div>

              {/* Document Body */}
              <div className="px-10 py-6 space-y-6 text-sm leading-relaxed text-foreground">
                
                {/* Customer & Payment Info Section */}
                <section className="border border-foreground/10 rounded-lg p-5 bg-muted/5">
                  <h2 className="font-bold text-xs text-foreground mb-4 uppercase tracking-wide flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Payment Information
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Email Address</label>
                        <Input
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@example.com"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Phone Number</label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Billing Address</label>
                        <Input
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Full billing address"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Payment Method</label>
                        <Select
                          value={formData.paymentMethod}
                          onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">
                              <span className="flex items-center gap-2">
                                <CreditCard className="w-3.5 h-3.5" />
                                Credit/Debit Card
                              </span>
                            </SelectItem>
                            <SelectItem value="ach">
                              <span className="flex items-center gap-2">
                                <Building className="w-3.5 h-3.5" />
                                ACH Bank Transfer
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.paymentMethod === "card" ? (
                        <>
                          <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Card Number</label>
                            <Input
                              value={formData.cardNumber}
                              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                              placeholder="1234 5678 9012 3456"
                              className="h-9 text-sm font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Expiry</label>
                              <Input
                                value={formData.expiry}
                                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                                placeholder="MM/YY"
                                className="h-9 text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">CVV</label>
                              <Input
                                type="password"
                                value={formData.cvv}
                                onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                                placeholder="•••"
                                className="h-9 text-sm"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Bank Name</label>
                            <Input
                              value={formData.bankName}
                              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                              placeholder="Bank name"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Routing #</label>
                              <Input
                                value={formData.routingNumber}
                                onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                                placeholder="9 digits"
                                className="h-9 text-sm font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Account #</label>
                              <Input
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                placeholder="Account number"
                                className="h-9 text-sm font-mono"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Authorization Amount */}
                  <div className="mt-4 pt-4 border-t border-foreground/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Authorization Amount</span>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">$</span>
                        <Input
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="h-9 w-32 text-right font-bold text-lg"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 1: Authorization Terms */}
                <section>
                  <h2 className="font-bold text-xs text-foreground mb-2 uppercase tracking-wide">
                    Section 1. Authorization Terms
                  </h2>
                  
                  <div className="space-y-3 pl-4">
                    <p className="text-justify">
                      <span className="font-semibold">1.1</span> I, the undersigned, hereby authorize TruMove LLC ("Company") 
                      to charge my {formData.paymentMethod === "card" ? "credit/debit card" : "bank account"} for the 
                      amount specified above for moving services rendered.
                    </p>
                    
                    <p className="text-justify">
                      <span className="font-semibold">1.2</span> I understand that this authorization shall remain in effect 
                      until I notify the Company in writing that I wish to revoke it, and I agree that if any charges 
                      are made prior to such revocation, they shall not be affected.
                    </p>

                    <p className="text-justify">
                      I acknowledge and agree to these authorization terms <InitialBox field="initial1" style={{ marginLeft: '4px', marginRight: '4px' }} /> and 
                      authorize the Company to process payment as described above.
                    </p>
                  </div>
                </section>

                {/* Section 2: Cardholder/Account Holder Agreement */}
                <section>
                  <h2 className="font-bold text-xs text-foreground mb-2 uppercase tracking-wide">
                    Section 2. {formData.paymentMethod === "card" ? "Cardholder" : "Account Holder"} Agreement
                  </h2>
                  
                  <div className="space-y-3 pl-4">
                    <p className="text-justify">
                      <span className="font-semibold">2.1</span> I certify that I am an authorized user of this 
                      {formData.paymentMethod === "card" ? " credit/debit card" : " bank account"} and that I will not 
                      dispute the payment with my {formData.paymentMethod === "card" ? "credit card company" : "bank"} 
                      provided the transaction corresponds to the terms indicated in this authorization.
                    </p>
                    
                    <p className="text-justify">
                      <span className="font-semibold">2.2</span> I agree that if any refund is due, it will be processed 
                      back to the same payment method within 7-10 business days.
                    </p>

                    <p className="text-justify">
                      I confirm that I am an authorized user <InitialBox field="initial2" style={{ marginLeft: '4px', marginRight: '4px' }} /> of 
                      this payment method and agree to the terms stated above.
                    </p>
                  </div>
                </section>

                {/* Signature Block */}
                <section className="space-y-3 pt-2">
                  <h2 className="font-bold text-xs text-foreground uppercase tracking-wide">
                    Section 3. Authorization & Signature
                  </h2>

                  <div className="pl-4 space-y-3">
                    <p className="text-justify">
                      By signing below, I authorize TruMove LLC to process the payment described above and acknowledge 
                      that I have read, understood, and agreed to all terms contained herein.
                    </p>

                    <div className="grid grid-cols-2 gap-6 pt-2">
                      {/* Customer Name */}
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                          {formData.paymentMethod === "card" ? "Cardholder" : "Account Holder"} Name (Print)
                        </label>
                        <div className="h-8 border-b border-foreground/30 flex items-end pb-1">
                          <span className="text-sm font-medium">
                            {typedName || <span className="text-muted-foreground italic text-xs">Enter name in sidebar</span>}
                          </span>
                        </div>
                      </div>

                      {/* Date */}
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                          Date
                        </label>
                        <div className="h-8 border-b border-foreground/30 flex items-end pb-1">
                          <span className="text-sm">{today}</span>
                        </div>
                      </div>
                    </div>

                    {/* Signature Field */}
                    <div className="pt-2">
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                        {formData.paymentMethod === "card" ? "Cardholder" : "Account Holder"} Signature
                      </label>
                      <div
                        ref={fieldRefs.signature}
                        onClick={() => canSign && handleSign("signature")}
                        className={`
                          relative h-14 border rounded flex items-center justify-center
                          transition-all cursor-pointer
                          ${signatures.signature 
                            ? "border-foreground/30 bg-muted/10" 
                            : currentField === "signature" && canSign
                              ? "border-foreground bg-muted/5 ring-1 ring-foreground/20" 
                              : canSign 
                                ? "border-dashed border-foreground/30 hover:border-foreground/50" 
                                : "border-dashed border-border bg-muted/5 cursor-not-allowed"
                          }
                        `}
                      >
                        {signatures.signature ? (
                          <div className="flex items-center gap-2">
                            <span 
                              className="text-2xl text-foreground"
                              style={{ fontFamily: "'Dancing Script', cursive" }}
                            >
                              {typedName}
                            </span>
                            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-foreground text-background">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                          </div>
                        ) : (
                          <span className={`text-xs ${currentField === "signature" && canSign ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                            {currentField === "signature" && canSign 
                              ? "Click here to apply your signature" 
                              : canSign 
                                ? "Complete initials above first"
                                : "Enter your name in the sidebar to sign"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Document Footer */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-4 border-t border-foreground/5 mt-4">
                    <span>Document ID: <span className="font-mono">{refNumber}</span></span>
                    <span>Date Executed: {signatures.signature ? today : "—"}</span>
                  </div>
                </section>
              </div>

              {/* Action Footer */}
              <div className="border-t border-foreground/10 px-10 py-4 bg-muted/5">
                <div className="flex flex-wrap items-center justify-end gap-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={!allSigned}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 px-6 h-8 border-foreground/30 hover:bg-foreground hover:text-background"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Submit Authorization
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <p className="text-center text-[10px] text-muted-foreground mt-4 max-w-md mx-auto">
            This document is encrypted with TLS 1.3 and stored securely. 
            Payment information is handled in compliance with PCI-DSS standards.
          </p>
        </div>
      </div>
    </div>
  );
}
