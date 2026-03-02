import { FileText, CreditCard, Check, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type DocumentType = "estimate" | "ccach";

interface DocumentTabsProps {
  activeDocument: DocumentType;
  onDocumentChange: (doc: DocumentType) => void;
  completedDocuments: Record<DocumentType, boolean>;
}

const documents: { type: DocumentType; label: string; icon: typeof FileText }[] = [
  { type: "estimate", label: "Estimate Authorization", icon: FileText },
  { type: "ccach", label: "CC/ACH Authorization", icon: CreditCard },
];

export function DocumentTabs({ activeDocument, onDocumentChange, completedDocuments }: DocumentTabsProps) {
  const completedCount = Object.values(completedDocuments).filter(Boolean).length;
  
  return (
    <div className="space-y-2">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>{completedCount} of {documents.length} signed</span>
        <div className="flex gap-1">
          {documents.map(({ type }) => (
            <div
              key={type}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                completedDocuments[type] 
                  ? "bg-primary" 
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
      
      {documents.map(({ type, label, icon: Icon }) => {
        const isActive = activeDocument === type;
        const isCompleted = completedDocuments[type];

        return (
          <button
            key={type}
            onClick={() => onDocumentChange(type)}
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-lg border w-full text-left transition-all",
              isCompleted 
                ? "border-primary/30 bg-primary/5" 
                : isActive
                  ? "border-foreground/20 bg-foreground/5"
                  : "border-border hover:bg-muted/50"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 transition-colors",
                isCompleted
                  ? "bg-primary text-primary-foreground"
                  : isActive
                    ? "bg-foreground text-background"
                    : "border border-muted-foreground/40"
              )}
            >
              {isCompleted ? (
                <Check className="h-3 w-3" />
              ) : (
                <span>{documents.findIndex((d) => d.type === type) + 1}</span>
              )}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <Icon
                className={cn(
                  "h-3.5 w-3.5",
                  isCompleted ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  isCompleted ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {isCompleted && (
              <CircleCheck className="h-4 w-4 text-primary flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
