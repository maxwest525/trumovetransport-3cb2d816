import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paperclip, X, Package, Scale } from "lucide-react";
import { toast } from "sonner";
import { EstimateAuthDocument } from "@/components/esign/EstimateAuthDocument";
import { CCACHDocumentWrapper } from "@/components/esign/CCACHDocumentWrapper";
import { BOLDocumentWrapper } from "@/components/esign/BOLDocumentWrapper";
import { type InventoryItem, calculateTotalWeight, calculateTotalCubicFeet } from "@/lib/priceCalculator";

type SignatureField = "initial1" | "initial2" | "initial3" | "signature";

interface ESignViewModalProps {
  open: boolean;
  onClose: () => void;
  documentType: "estimate" | "ccach" | "bol";
  customerName: string;
  refNumber: string;
}

export function ESignViewModal({
  open,
  onClose,
  documentType,
  customerName,
  refNumber,
}: ESignViewModalProps) {
  const [typedName, setTypedName] = useState(customerName);
  const [typedInitials, setTypedInitials] = useState(
    customerName
      .split(" ")
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase()
  );
  const [signatures, setSignatures] = useState<Record<SignatureField, boolean>>({
    initial1: false,
    initial2: false,
    initial3: false,
    signature: false,
  });
  const [currentField, setCurrentField] = useState<SignatureField>("initial1");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attachedInventory, setAttachedInventory] = useState<InventoryItem[] | null>(null);

  const handleAttachInventory = () => {
    const scannedInventory = localStorage.getItem('tm_scanned_inventory');
    const estimateInventory = localStorage.getItem('trumove_inventory');
    let inventoryData: InventoryItem[] | null = null;
    if (scannedInventory) {
      try { inventoryData = JSON.parse(scannedInventory); } catch (e) { console.error(e); }
    } else if (estimateInventory) {
      try { inventoryData = JSON.parse(estimateInventory); } catch (e) { console.error(e); }
    }
    if (inventoryData && inventoryData.length > 0) {
      setAttachedInventory(inventoryData);
      toast.success(`Attached ${inventoryData.length} inventory items`);
    } else {
      toast.error("No inventory found. Complete an estimate first to generate inventory.");
    }
  };

  const handleRemoveInventory = () => {
    setAttachedInventory(null);
    toast.success("Inventory removed from document");
  };

  const totalItems = attachedInventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalWeight = attachedInventory ? calculateTotalWeight(attachedInventory) : 0;
  const totalCubicFeet = attachedInventory ? calculateTotalCubicFeet(attachedInventory) : 0;

  const fieldOrder: SignatureField[] = ["initial1", "initial2", "initial3", "signature"];

  const handleSign = (field: SignatureField) => {
    setSignatures((prev) => ({ ...prev, [field]: true }));
    const currentIndex = fieldOrder.indexOf(field);
    const nextUnsigned = fieldOrder.find(
      (f, i) => i > currentIndex && !signatures[f]
    );
    if (nextUnsigned) setCurrentField(nextUnsigned);
  };

  const handleSubmit = () => setIsSubmitted(true);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const label = documentType === "estimate" ? "Estimate Authorization" : documentType === "ccach" ? "CC/ACH Authorization" : "Bill of Lading";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="flex items-center gap-2">
            {label}
            <Badge variant="outline" className="text-[10px] font-mono">
              {refNumber}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="px-4 pb-6">
            {documentType === "estimate" ? (
              <EstimateAuthDocument
                typedName={typedName}
                typedInitials={typedInitials}
                signatures={signatures}
                currentField={currentField}
                onSign={handleSign}
                onSubmit={handleSubmit}
                isSubmitted={isSubmitted}
                refNumber={refNumber}
                today={today}
              />
            ) : documentType === "ccach" ? (
              <CCACHDocumentWrapper
                typedName={typedName}
                onTypedNameChange={setTypedName}
                isSubmitted={isSubmitted}
                onSubmit={handleSubmit}
              />
            ) : (
              <BOLDocumentWrapper
                typedName={typedName}
                onTypedNameChange={setTypedName}
                isSubmitted={isSubmitted}
                onSubmit={handleSubmit}
              />
            )}

            {/* Inventory Attachment Section */}
            {attachedInventory && attachedInventory.length > 0 && (
              <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Attached Inventory</span>
                  </div>
                  <button onClick={handleRemoveInventory} className="p-1 text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove inventory">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{totalItems}</span>
                    <span className="text-muted-foreground">items</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{totalWeight.toLocaleString()}</span>
                    <span className="text-muted-foreground">lbs</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{totalCubicFeet}</span>
                    <span className="text-muted-foreground">cu ft</span>
                  </div>
                </div>
                <div className="mt-3 max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                    {attachedInventory.slice(0, 12).map((item) => (
                      <div key={item.id} className="flex items-center gap-1.5 text-xs py-1 px-2 bg-background rounded border border-border/50">
                        {item.imageUrl && <img src={item.imageUrl} alt="" className="w-4 h-4 object-contain" />}
                        <span className="truncate flex-1">{item.name}</span>
                        <span className="text-muted-foreground">×{item.quantity}</span>
                      </div>
                    ))}
                    {attachedInventory.length > 12 && (
                      <div className="flex items-center justify-center text-xs text-muted-foreground py-1 px-2">
                        +{attachedInventory.length - 12} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              {!attachedInventory ? (
                <Button onClick={handleAttachInventory} variant="outline" size="sm" className="gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attach Inventory
                </Button>
              ) : (
                <Button onClick={handleRemoveInventory} variant="outline" size="sm" className="gap-2 text-muted-foreground">
                  <X className="h-4 w-4" />
                  Remove Inventory
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
