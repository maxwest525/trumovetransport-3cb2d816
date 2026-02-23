import { useState } from "react";
import { Zap, Eye, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type AutomationMode = 'autopilot' | 'review';

interface AutomationModeSelectorProps {
  onChange?: (mode: AutomationMode) => void;
  defaultMode?: AutomationMode;
}

export function AutomationModeSelector({ onChange, defaultMode = 'review' }: AutomationModeSelectorProps) {
  const [mode, setMode] = useState<AutomationMode>(defaultMode);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = (m: AutomationMode) => {
    if (m === 'autopilot' && mode !== 'autopilot') {
      setShowConfirm(true);
    } else {
      setMode(m);
      onChange?.(m);
    }
  };

  const confirmAutopilot = () => {
    setMode('autopilot');
    onChange?.('autopilot');
    setShowConfirm(false);
  };

  return (
    <>
      <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border bg-muted/30">
        <button
          onClick={() => handleClick('autopilot')}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
            mode === 'autopilot'
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          Autopilot
        </button>
        <button
          onClick={() => handleClick('review')}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
            mode === 'review'
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          Review First
        </button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <AlertDialogTitle className="text-lg">Enable Autopilot Mode?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>
                Autopilot will <span className="font-semibold text-foreground">automatically apply changes</span> to your campaigns based on real-time analytics data — without asking for your approval first.
              </p>
              <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2 text-xs">
                <div className="font-semibold text-foreground">This includes:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>Pausing underperforming ad sets & keywords</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>Reallocating budget toward higher-ROAS channels</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>Updating ad copy & landing page variants</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>Adjusting bids and geo-targeting in real time</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                You can switch back to <span className="font-medium text-foreground">Review First</span> at any time to regain manual control.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAutopilot}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
            >
              <Zap className="w-4 h-4 mr-1.5" />
              Enable Autopilot
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
