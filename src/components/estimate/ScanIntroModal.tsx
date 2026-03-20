import { Scan, AlertTriangle, Phone, ArrowRight, Video } from "lucide-react";

interface ScanIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartScan: () => void;
}

export default function ScanIntroModal({ 
  isOpen, 
  onClose,
  onStartScan,
}: ScanIntroModalProps) {
  if (!isOpen) return null;

  const handleStartScan = () => {
    onClose();
    onStartScan();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Warning Header - Executive Style */}
        <div className="tru-inventory-warning-header">
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-wide">
                Important Notice
              </h3>
              <p className="text-sm text-white/90 font-medium">
                AI scan accuracy affects your quote
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Price Impact Warning */}
          <div className="tru-inventory-info-box">
            <div className="flex gap-3">
              <div>
                <p className="font-bold tru-info-title mb-1">
                  Complete Scan = Accurate Quote
                </p>
                <p className="text-sm tru-info-text">
                  Our AI will identify furniture, boxes, and appliances from your video scan. 
                  For best results, slowly pan through each room and ensure all items are visible. 
                  You can review and adjust the detected inventory before finalizing your quote. 
                  Missing items may result in additional charges on move day.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Primary CTA - Start Scan */}
            <button
              type="button"
              onClick={handleStartScan}
              className="tru-modal-primary-btn"
            >
              <Scan className="w-5 h-5" />
              Start AI Inventory Scan
              <ArrowRight className="w-4 h-4" />
            </button>
            
            {/* Secondary CTAs */}
            <div className="flex items-center justify-center gap-3">
              <a
                href="tel:1-800-555-0123"
                className="tru-modal-secondary-btn"
              >
                <Phone className="w-4 h-4" />
                Prefer to talk?
              </a>
              <a
                href="/book"
                className="tru-modal-secondary-btn"
              >
                <Video className="w-4 h-4" />
                Book Video Consult
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}