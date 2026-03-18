import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Download, Printer, ArrowRight } from "lucide-react";
import { ESignConsentBanner } from "@/components/esign/ESignConsentBanner";
import logo from "@/assets/logo.png";

type SignatureField = "initial1" | "initial2" | "initial3" | "signature";

interface EstimateAuthDocumentProps {
  typedName: string;
  typedInitials: string;
  signatures: Record<SignatureField, boolean>;
  currentField: SignatureField;
  onSign: (field: SignatureField) => void;
  onSubmit: () => void;
  onContinueToNext?: () => void;
  isSubmitted?: boolean;
  refNumber: string;
  today: string;
  consentGiven?: boolean;
  onConsentChange?: (given: boolean) => void;
}

export function EstimateAuthDocument({
  typedName,
  typedInitials,
  signatures,
  currentField,
  onSign,
  onSubmit,
  onContinueToNext,
  isSubmitted = false,
  refNumber,
  today,
}: EstimateAuthDocumentProps) {
  const fieldRefs = {
    initial1: useRef<HTMLSpanElement>(null),
    initial2: useRef<HTMLSpanElement>(null),
    initial3: useRef<HTMLSpanElement>(null),
    signature: useRef<HTMLSpanElement>(null),
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
        onClick={() => canApply && onSign(field)}
        style={{
          ...style,
          ...(isActive && canApply && !isSigned ? { borderColor: "#d97706", backgroundColor: "#fef3c7" } : {}),
        }}
        className={`
          inline-flex items-center justify-center px-3 py-1 border-2 rounded
          transition-all cursor-pointer align-middle relative
          ${
            isSigned
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
          <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: "#b45309" }}>
            SIGN
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide whitespace-nowrap">initial</span>
        )}
      </span>
    );
  };

  return (
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
            <h1 className="text-lg font-bold tracking-tight text-foreground">ESTIMATE CONSENT & AUTHORIZATION</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mt-1">
              TruMove LLC • FMCSA Licensed Broker • MC-XXXXXXX
            </p>
          </div>
        </div>

        {/* Document Body */}
        <div className="px-10 py-6 space-y-6 text-sm leading-relaxed text-foreground">
          {/* Section 1 */}
          <section>
            <h2 className="font-bold text-xs text-foreground mb-2 uppercase tracking-wide">Section 1. Broker Disclosure</h2>

            <div className="space-y-3 pl-4">
              <p className="text-justify">
                <span className="font-semibold">1.1</span> TruMove LLC ("TruMove") is a federally licensed household goods
                transportation broker (FMCSA Broker License MC-XXXXXXX) and is not a motor carrier. TruMove arranges
                transportation services through independent, federally licensed and insured motor carriers and does not perform
                the physical transportation of goods.
              </p>

              <p className="text-justify">
                <span className="font-semibold">1.2</span> The performing motor carrier shall issue the bill of lading and assume
                full responsibility for transportation services rendered.
              </p>

              <p className="text-justify">
                I <InitialBox field="initial1" style={{ marginLeft: "2px", marginRight: "4px" }} /> acknowledge that TruMove LLC
                operates as a broker, not a motor carrier, and that an independent carrier will perform the actual transportation
                services.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-bold text-xs text-foreground mb-2 uppercase tracking-wide">Section 2. Estimate Terms</h2>

            <div className="space-y-3 pl-4">
              <p className="text-justify">
                <span className="font-semibold">2.1</span> The pricing provided herein constitutes a <em>non-binding estimate</em>{" "}
                unless expressly designated in writing as a binding estimate. This estimate is based on information provided by
                the customer regarding shipment inventory, dwelling type, access conditions, mileage, and move date.
              </p>

              <p className="text-justify">
                <span className="font-semibold">2.2</span> The estimate is generated using TruMove's proprietary pricing engine,
                which incorporates customer-provided shipment data, route variables, and historical pricing and weight data from
                federally regulated household goods shipments as reported through the U.S. Department of Transportation and
                FMCSA.
              </p>

              <p className="text-justify">
                <span className="font-semibold">2.3</span> Final charges may increase or decrease based on: (a) actual certified
                shipment weight; (b) services performed; (c) access conditions encountered; (d) items transported; and (e)
                carrier tariffs and applicable federal regulations.
              </p>

              <p className="text-justify">
                I understand that this is a non-binding estimate{" "}
                <InitialBox field="initial2" style={{ marginLeft: "4px", marginRight: "2px" }} /> and that final charges may
                differ based on actual shipment weight, services rendered, and conditions encountered.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-bold text-xs text-foreground mb-2 uppercase tracking-wide">
              Section 3. Additional Services & Charges
            </h2>

            <div className="space-y-3 pl-4">
              <p className="text-justify">
                <span className="font-semibold">3.1</span> Additional services not included in this estimate may result in
                supplemental charges. Such services include, but are not limited to: stair carries, elevator usage, long carries
                (&gt;75 ft), shuttle services, packing materials, specialty item handling, storage, and waiting time.
              </p>

              <p className="text-justify">
                <span className="font-semibold">3.2</span> Customer acknowledges that charges for additional services shall be
                disclosed prior to performance and added to the final invoice per carrier tariff.
              </p>

              <p className="text-justify">
                I acknowledge that additional services{" "}
                <InitialBox field="initial3" style={{ marginLeft: "4px", marginRight: "2px" }} /> may result in charges beyond
                this estimate, and that I will be informed of such charges prior to service.
              </p>
            </div>
          </section>

          {/* Signature Section */}
          <section className="border-t border-foreground/10 pt-6 mt-8">
            <h2 className="font-bold text-xs text-foreground mb-4 uppercase tracking-wide">Section 4. Customer Signature</h2>

            <div className="space-y-4">
              <p className="text-justify">
                By signing below, I acknowledge that I have read, understand, and agree to the terms and conditions set forth in
                this Estimate Authorization. I understand that TruMove LLC acts as a broker and that an independent motor carrier
                will perform the transportation services.
              </p>

              <div className="flex items-end gap-8 mt-6">
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Customer Signature</p>
                  <div
                    className={`
                    border-b-2 border-foreground/30 pb-1 min-h-[2rem] flex items-end
                    ${signatures.signature ? "" : "cursor-pointer hover:border-foreground/50"}
                  `}
                    onClick={() => canSign && !signatures.signature && onSign("signature")}
                  >
                    {signatures.signature ? (
                      <span className="text-2xl text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                        {typedName}
                      </span>
                    ) : currentField === "signature" && canSign ? (
                      <span
                        className="text-xs font-bold uppercase tracking-wide px-3 py-1 border-2 rounded"
                        style={{ borderColor: "#d97706", backgroundColor: "#fef3c7", color: "#b45309" }}
                      >
                        SIGN HERE
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50 text-sm">Sign here</span>
                    )}
                  </div>
                </div>

                <div className="w-40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Date</p>
                  <div className="border-b-2 border-foreground/30 pb-1 min-h-[2rem] flex items-end">
                    <span className="text-sm text-foreground">{today}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-muted">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="flex gap-2">
              {!isSubmitted ? (
                <Button
                  onClick={onSubmit}
                  disabled={!allSigned}
                  className="gap-2"
                  variant={allSigned ? "default" : "outline"}
                >
                  {allSigned ? (
                    <>
                      <Check className="h-4 w-4" />
                      Submit Authorization
                    </>
                  ) : (
                    "Complete All Signatures"
                  )}
                </Button>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <Check className="h-4 w-4" />
                    Submitted
                  </div>
                  {onContinueToNext && (
                    <Button onClick={onContinueToNext} className="gap-2">
                      Continue to Next Document
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
