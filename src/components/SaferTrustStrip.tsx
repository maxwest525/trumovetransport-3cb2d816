import { Sparkles, MapPin, Video, Shield, Truck, Brain, Clock, DollarSign } from "lucide-react";

const FEATURE_TRUST_ITEMS = [
  { icon: Shield, text: "FMCSA Verified" },
  { icon: DollarSign, text: "Real-Time Pricing" },
  { icon: Clock, text: "24/7 Support" },
  { icon: Brain, text: "Zero Hidden Fees" },
];

export default function SaferTrustStrip() {
  return (
    <div className="safer-trust-strip">
      <div className="safer-trust-strip-inner">
        {FEATURE_TRUST_ITEMS.map((item, idx) => (
          <div key={item.text} className="safer-trust-item">
            <item.icon className="w-4 h-4" />
            <span>{item.text}</span>
            {idx < FEATURE_TRUST_ITEMS.length - 1 && (
              <span className="safer-trust-dot">•</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
