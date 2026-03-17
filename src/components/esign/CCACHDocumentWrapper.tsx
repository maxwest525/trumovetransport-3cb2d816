import { CCACHAuthorizationForm } from "@/components/agent/CCACHAuthorizationForm";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

interface CCACHDocumentWrapperProps {
  typedName: string;
  onTypedNameChange: (name: string) => void;
  isSubmitted?: boolean;
  onSubmit?: () => void;
  onContinueToNext?: () => void;
}

export function CCACHDocumentWrapper({ 
  typedName, 
  onTypedNameChange,
  isSubmitted = false,
  onSubmit,
  onContinueToNext,
}: CCACHDocumentWrapperProps) {
  return (
    <div className="bg-white rounded-lg border border-border shadow-xl">
      <CCACHAuthorizationForm 
        externalTypedName={typedName}
        onExternalTypedNameChange={onTypedNameChange}
        embedded
      />
      
      {/* Footer with Continue button */}
      <div className="px-10 pb-6 flex items-center justify-end gap-2 border-t border-muted pt-4 mx-6">
        {!isSubmitted ? (
          <Button onClick={onSubmit} className="gap-2">
            <Check className="h-4 w-4" />
            Submit CC/ACH Authorization
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
  );
}
