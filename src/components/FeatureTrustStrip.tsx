import { Home, MapPin, Video, Shield, BadgeCheck } from "lucide-react";

const FEATURE_ITEMS = [
  { icon: Home, text: "AI Room Scanner" },
  { icon: MapPin, text: "Live GPS Tracking" },
  { icon: Video, text: "Video Consultations" },
  { icon: Shield, text: "Carrier Vetting" },
  { icon: BadgeCheck, text: "Verified Estimates" },
];

export default function FeatureTrustStrip() {
  return (
    <div className="feature-trust-strip">
      <div className="feature-trust-strip-inner">
        {FEATURE_ITEMS.map((item) => (
          <div key={item.text} className="feature-trust-item">
            <item.icon className="w-4 h-4" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
