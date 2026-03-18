import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Send, Mail, FileText, UserPlus, Check, Loader2, Download, Phone } from "lucide-react";
import { toast } from "sonner";
import { DocumentTabs, type DocumentType } from "./DocumentTabs";
import { ESignStatusCard } from "./ESignStatusCard";
import { ClientSearchModal, type ClientData } from "@/components/agent/ClientSearchModal";

type SignatureField = "initial1" | "initial2" | "initial3" | "signature";

interface ESignSidebarProps {
  typedName: string;
  onTypedNameChange: (name: string) => void;
  typedInitials: string;
  signatures: Record<SignatureField, boolean>;
  activeDocument: DocumentType;
  onDocumentChange: (doc: DocumentType) => void;
  completedDocuments: Record<DocumentType, boolean>;
  onSendPdfEmail?: () => Promise<void>;
  onDownloadPdf?: () => Promise<void>;
  isSendingEmail?: boolean;
  isDownloading?: boolean;
  allSigned?: boolean;
  recipientEmail?: string;
  refNumber?: string;
}

export function ESignSidebar({
  typedName,
  onTypedNameChange,
  typedInitials,
  signatures,
  activeDocument,
  onDocumentChange,
  completedDocuments,
  onSendPdfEmail,
  onDownloadPdf,
  isSendingEmail = false,
  isDownloading = false,
  allSigned = false,
  recipientEmail,
  refNumber = "DOC-2026-0001",
}: ESignSidebarProps) {
  const [showClientSearch, setShowClientSearch] = useState(false);

  const handleClientSelect = (client: ClientData) => {
    onTypedNameChange(client.name);
  };

  return (
    <div className="w-72 flex-shrink-0 space-y-4">
      <ClientSearchModal
        open={showClientSearch}
        onClose={() => setShowClientSearch(false)}
        onSelect={handleClientSelect}
      />

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

      {/* Verbal Verification Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full h-10 gap-2 border-foreground/20 hover:bg-foreground hover:text-background transition-all group"
        onClick={() => toast.success("Verbal verification recorded")}
      >
        <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-medium">Verbal Verification</span>
      </Button>

      {/* Customer Name Card */}
      <Card className="border border-border bg-background shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Your Full Legal Name</label>
              <Button onClick={() => setShowClientSearch(true)} variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1">
                <UserPlus className="w-3 h-3" />
                Import
              </Button>
            </div>
            <Input
              placeholder="e.g. John Smith"
              value={typedName}
              onChange={(e) => onTypedNameChange(e.target.value)}
              className="bg-background border-foreground/20 h-10 text-base"
            />

            {/* Signature/Initials Preview */}
            <div className="flex gap-3 pt-1">
              <div className="flex-1 border border-foreground/20 rounded px-3 py-2 bg-muted/10">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Signature</span>
                <div className="text-lg text-foreground truncate min-h-[1.5rem]" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  {typedName || <span className="text-muted-foreground/50 text-sm">—</span>}
                </div>
              </div>

              <div className="w-16 border border-foreground/20 rounded px-3 py-2 bg-muted/10">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Initials</span>
                <div className="text-lg text-foreground min-h-[1.5rem]" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  {typedInitials || <span className="text-muted-foreground/50 text-sm">—</span>}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground text-xs uppercase tracking-wide">How to Sign</p>
            <p>1. Enter your full legal name above</p>
            <p>
              2. Click each highlighted <span className="font-mono text-xs border px-1 rounded">initial</span> box
            </p>
            <p>3. Sign and submit at the bottom</p>
          </div>
        </CardContent>
      </Card>

      {/* Document Selection */}
      <Card className="border border-border bg-background shadow-sm">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Documents to Sign</h3>
          <DocumentTabs
            activeDocument={activeDocument}
            onDocumentChange={onDocumentChange}
            completedDocuments={completedDocuments}
          />
        </CardContent>
      </Card>

      {/* Document Status Card - Shows receipt/signature confirmations */}
      <ESignStatusCard
        documentTitle={
          activeDocument === "estimate" 
            ? "Estimate Authorization" 
            : activeDocument === "ccach" 
            ? "CC/ACH Authorization" 
            : "Bill of Lading"
        }
        recipientEmail={recipientEmail}
        recipientName={typedName}
        isSigned={allSigned}
        refNumber={refNumber}
      />
    </div>
  );
}
