import { Package, AlertTriangle, Phone, ArrowRight, Video, Scan } from "lucide-react";
import { Link } from "react-router-dom";

interface InventoryIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  distance: number;
  moveType: 'local' | 'long-distance' | 'auto';
}

export default function InventoryIntroModal({ 
  isOpen, 
  onClose, 
}: InventoryIntroModalProps) {
  if (!isOpen) return null;

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
                Your inventory directly affects your price
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
                  Accurate Inventory = Accurate Quote
                </p>
                <p className="text-sm tru-info-text">
                  The cubic footage of your items is the primary factor in calculating your moving cost. 
                  Please take your time to add all furniture, boxes, and appliances to ensure your quote is as accurate as possible. 
                  Missing or underestimated items may result in additional charges on move day.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Primary CTA - Start Building */}
            <button
              type="button"
              onClick={onClose}
              className="tru-modal-primary-btn"
            >
              <Package className="w-5 h-5" />
              Start Building My Inventory
              <ArrowRight className="w-4 h-4" />
            </button>
            
            {/* Secondary CTAs */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/site/scan-room"
                className="tru-modal-secondary-btn"
              >
                <Scan className="w-4 h-4" />
                AI Room Scanner
              </Link>
              <a
                href="tel:1-800-555-0123"
                className="tru-modal-secondary-btn"
              >
                <Phone className="w-4 h-4" />
                Prefer to talk?
              </a>
              <Link
                to="/site/book"
                className="tru-modal-secondary-btn"
              >
                <Video className="w-4 h-4" />
                Book Video Consult
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
