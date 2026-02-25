import React from "react";
import { Home, MapPin, Video, Shield, Truck, BadgeCheck } from "lucide-react";

const FEATURE_ITEMS = [
  { icon: Home, text: "AI Room Scanner" },
  { icon: MapPin, text: "Live GPS Tracking" },
  { icon: Video, text: "Video Consultations" },
  { icon: Shield, text: "Carrier Vetting" },
  { icon: Truck, text: "Nationwide Coverage" },
  { icon: BadgeCheck, text: "Verified Estimates" },
];

export default function FeatureTrustStrip() {
  return (
    <div className="feature-trust-strip">
      <div className="feature-trust-strip-inner">
        {FEATURE_ITEMS.map((item, idx) => (
          <React.Fragment key={item.text}>
            <div className="feature-trust-item">
              <item.icon className="w-4 h-4" />
              <span>{item.text}</span>
            </div>
            {idx < FEATURE_ITEMS.length - 1 && (
              <span className="feature-trust-dot">•</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
