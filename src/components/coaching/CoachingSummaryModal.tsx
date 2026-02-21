import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminCoachingSummary } from "@/components/coaching/AdminCoachingSummary";

interface CoachingSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CoachingSummaryModal({ open, onOpenChange }: CoachingSummaryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold">Team Performance</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <AdminCoachingSummary isLiveMode={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
