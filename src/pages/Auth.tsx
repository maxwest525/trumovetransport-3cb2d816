import { useState, useEffect } from "react";
import SiteShell from "@/components/layout/SiteShell";
import { useToast } from "@/hooks/use-toast";
import { ESignSidebar } from "@/components/esign/ESignSidebar";
import { EstimateAuthDocument } from "@/components/esign/EstimateAuthDocument";
import { CCACHDocumentWrapper } from "@/components/esign/CCACHDocumentWrapper";
import type { DocumentType } from "@/components/esign/DocumentTabs";
import { toast as sonnerToast } from "sonner";

type SignatureField = "initial1" | "initial2" | "initial3" | "signature";

export default function Auth() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { toast } = useToast();
  const [typedName, setTypedName] = useState("");
  const [activeDocument, setActiveDocument] = useState<DocumentType>("estimate");
  const [signatures, setSignatures] = useState<Record<SignatureField, boolean>>({
    initial1: false,
    initial2: false,
    initial3: false,
    signature: false,
  });
  const [currentField, setCurrentField] = useState<SignatureField>("initial1");

  // Track completion of each document type
  const [completedDocuments, setCompletedDocuments] = useState<Record<DocumentType, boolean>>({
    estimate: false,
    ccach: false,
  });

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

  const refNumber = `TM-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

  const handleSign = (field: SignatureField) => {
    if (field === "signature" && typedName.length < 2) return;
    if (field !== "signature" && typedInitials.length < 1) return;

    setSignatures((prev) => ({ ...prev, [field]: true }));

    // Move to next field
    const fieldOrder: SignatureField[] = ["initial1", "initial2", "initial3", "signature"];
    const currentIndex = fieldOrder.indexOf(field);
    if (currentIndex < fieldOrder.length - 1) {
      const nextField = fieldOrder[currentIndex + 1];
      setCurrentField(nextField);
    }
  };

  const handleSubmit = () => {
    if (Object.values(signatures).every(Boolean)) {
      setCompletedDocuments((prev) => ({ ...prev, estimate: true }));
      toast({
        title: "Authorization Submitted",
        description: "Your signed authorization has been received. You will receive a confirmation email shortly.",
      });
    }
  };

  const handleCCACHSubmit = () => {
    setCompletedDocuments((prev) => ({ ...prev, ccach: true }));
    toast({
      title: "CC/ACH Authorization Submitted",
      description: "Your payment authorization has been received. All documents are complete.",
    });
  };

  const handleContinueToNext = () => {
    if (activeDocument === "estimate") {
      setActiveDocument("ccach");
      window.scrollTo(0, 0);
    }
  };

  const handleDocumentChange = (doc: DocumentType) => {
    setActiveDocument(doc);
    window.scrollTo(0, 0);
  };

  const allSigned = Object.values(signatures).every(Boolean);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const docName = activeDocument === "estimate" 
        ? "Estimate Authorization" 
        : activeDocument === "ccach" 
        ? "CC-ACH Authorization" 
        : "Bill of Lading";
      
      sonnerToast.success(`${docName} downloaded as PDF`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <SiteShell>
      <div className="min-h-screen bg-muted/30 py-8 px-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Back to Tools Button */}
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Tools
          </a>
          
          <div className="flex gap-6">
          {/* Left Sidebar */}
          <ESignSidebar
            typedName={typedName}
            onTypedNameChange={setTypedName}
            typedInitials={typedInitials}
            signatures={signatures}
            activeDocument={activeDocument}
            onDocumentChange={handleDocumentChange}
            completedDocuments={completedDocuments}
            allSigned={allSigned}
            recipientEmail="customer@example.com"
            refNumber={refNumber}
            onDownloadPdf={handleDownloadPdf}
            isDownloading={isDownloading}
          />

          {/* Document Container */}
          <div className="flex-1 max-w-[8.5in]">
            {activeDocument === "estimate" && (
              <EstimateAuthDocument
                typedName={typedName}
                typedInitials={typedInitials}
                signatures={signatures}
                currentField={currentField}
                onSign={handleSign}
                onSubmit={handleSubmit}
                onContinueToNext={handleContinueToNext}
                isSubmitted={completedDocuments.estimate}
                refNumber={refNumber}
                today={today}
              />
            )}

            {activeDocument === "ccach" && (
              <CCACHDocumentWrapper
                typedName={typedName}
                onTypedNameChange={setTypedName}
                isSubmitted={completedDocuments.ccach}
                onSubmit={handleCCACHSubmit}
              />
            )}
          </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
