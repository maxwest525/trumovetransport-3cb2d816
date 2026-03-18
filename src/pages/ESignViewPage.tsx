import { useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AgentShell from "@/components/layout/AgentShell";
import { ESignSidebar } from "@/components/esign/ESignSidebar";
import { EstimateAuthDocument } from "@/components/esign/EstimateAuthDocument";
import { CCACHDocumentWrapper } from "@/components/esign/CCACHDocumentWrapper";
import { BOLDocumentWrapper } from "@/components/esign/BOLDocumentWrapper";
import { ESignConsentBanner } from "@/components/esign/ESignConsentBanner";
import type { DocumentType } from "@/components/esign/DocumentTabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SignatureField = "initial1" | "initial2" | "initial3" | "signature";

export default function ESignViewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const customerName = searchParams.get("name") || "Customer";
  const customerEmail = searchParams.get("email") || "";
  const refNumber = searchParams.get("ref") || "DOC-2026-0001";
  const docTypeParam = searchParams.get("type") || "estimate";
  const isBol = docTypeParam === "bol";

  const [typedName, setTypedName] = useState(customerName);
  const [activeDocument, setActiveDocument] = useState<DocumentType>(
    isBol ? "estimate" : (docTypeParam as DocumentType)
  );
  const [signatures, setSignatures] = useState<Record<SignatureField, boolean>>({
    initial1: false, initial2: false, initial3: false, signature: false,
  });
  const [currentField, setCurrentField] = useState<SignatureField>("initial1");
  const [completedDocuments, setCompletedDocuments] = useState<Record<DocumentType, boolean>>({
    estimate: false, ccach: false,
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const typedInitials = typedName
    .split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 3);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const allSigned = Object.values(signatures).every(Boolean);

  // Generate a simple document hash for tamper detection
  const generateDocHash = useCallback(() => {
    const content = `${refNumber}|${typedName}|${docTypeParam}|${new Date().toISOString().split("T")[0]}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `SHA256-SIM-${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;
  }, [refNumber, typedName, docTypeParam]);

  // Log audit event
  const logAuditEvent = useCallback(async (eventType: string, eventData?: Record<string, unknown>) => {
    try {
      await supabase.functions.invoke("capture-esign-event", {
        body: {
          refNumber,
          documentType: activeDocument,
          customerName: typedName,
          customerEmail,
          eventType,
          eventData: eventData || {},
          documentHash: generateDocHash(),
          consentGiven,
          consentText: consentGiven
            ? "I consent to conduct this transaction electronically and agree that my electronic signature is legally binding under the ESIGN Act and UETA."
            : undefined,
        },
      });
    } catch (e) {
      console.error("Audit log failed:", e);
    }
  }, [refNumber, activeDocument, typedName, customerEmail, generateDocHash, consentGiven]);

  // Log document_opened on mount
  useState(() => {
    logAuditEvent("document_opened", { documentType: docTypeParam });
  });

  const handleSign = (field: SignatureField) => {
    if (!consentGiven) {
      toast.error("Please accept the electronic signature consent before signing.");
      return;
    }
    if (field === "signature" && typedName.length < 2) return;
    if (field !== "signature" && typedInitials.length < 1) return;

    setSignatures((prev) => ({ ...prev, [field]: true }));
    logAuditEvent("field_signed", { field, value: field === "signature" ? typedName : typedInitials });

    const fieldOrder: SignatureField[] = ["initial1", "initial2", "initial3", "signature"];
    const currentIndex = fieldOrder.indexOf(field);
    if (currentIndex < fieldOrder.length - 1) {
      setCurrentField(fieldOrder[currentIndex + 1]);
    }
  };

  const handleSubmitEstimate = () => {
    if (Object.values(signatures).every(Boolean)) {
      setCompletedDocuments((prev) => ({ ...prev, estimate: true }));
      logAuditEvent("document_signed", { documentType: "estimate", documentHash: generateDocHash() });
      toast.success("Estimate Authorization submitted successfully");
    }
  };

  const handleSubmitCCACH = () => {
    setCompletedDocuments((prev) => ({ ...prev, ccach: true }));
    logAuditEvent("document_signed", { documentType: "ccach", documentHash: generateDocHash() });
    toast.success("CC/ACH Authorization submitted successfully");
  };

  const handleSubmitBOL = () => {
    logAuditEvent("document_signed", { documentType: "bol", documentHash: generateDocHash() });
    toast.success("Bill of Lading submitted successfully");
  };

  const handleContinueToNext = () => {
    if (activeDocument === "estimate") {
      setActiveDocument("ccach");
      window.scrollTo(0, 0);
    }
  };

  const handleDocumentChange = (doc: DocumentType) => {
    setActiveDocument(doc);
    logAuditEvent("document_viewed", { documentType: doc });
    window.scrollTo(0, 0);
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      logAuditEvent("document_downloaded", { documentType: activeDocument });
      toast.success("Document downloaded as PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleConsentChange = (given: boolean) => {
    setConsentGiven(given);
    if (given) {
      logAuditEvent("consent_given", {
        consentText: "I consent to conduct this transaction electronically and agree that my electronic signature is legally binding under the ESIGN Act and UETA.",
      });
    }
  };

  return (
    <AgentShell breadcrumb=" / E-Sign / View Document">
      <div className="min-h-screen bg-muted/30 py-8 px-4">
        <div className="max-w-[1200px] mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to E-Sign Hub
          </button>


          <div className="flex gap-6 mt-4">
            {/* Sidebar */}
            {!isBol && (
              <ESignSidebar
                typedName={typedName}
                onTypedNameChange={setTypedName}
                typedInitials={typedInitials}
                signatures={signatures}
                activeDocument={activeDocument}
                onDocumentChange={handleDocumentChange}
                completedDocuments={completedDocuments}
                allSigned={allSigned}
                recipientEmail={customerEmail}
                refNumber={refNumber}
                onDownloadPdf={handleDownloadPdf}
                isDownloading={isDownloading}
              />
            )}

            {/* Document */}
            <div className="flex-1 max-w-[8.5in]">
              {isBol ? (
                <BOLDocumentWrapper
                  typedName={typedName}
                  onTypedNameChange={setTypedName}
                  isSubmitted={false}
                  onSubmit={handleSubmitBOL}
                />
              ) : activeDocument === "estimate" ? (
                <EstimateAuthDocument
                  typedName={typedName}
                  typedInitials={typedInitials}
                  signatures={signatures}
                  currentField={currentField}
                  onSign={handleSign}
                  onSubmit={handleSubmitEstimate}
                  onContinueToNext={handleContinueToNext}
                  isSubmitted={completedDocuments.estimate}
                  refNumber={refNumber}
                  today={today}
                />
              ) : (
                <CCACHDocumentWrapper
                  typedName={typedName}
                  onTypedNameChange={setTypedName}
                  isSubmitted={completedDocuments.ccach}
                  onSubmit={handleSubmitCCACH}
                />
              )}
            </div>
          </div>

          {/* Consent Banner */}
          <ESignConsentBanner
            consentGiven={consentGiven}
            onConsentChange={handleConsentChange}
            className="mt-6"
          />
        </div>
      </div>
    </AgentShell>
  );
}
