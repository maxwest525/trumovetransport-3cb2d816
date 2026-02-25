import { Sparkles } from "lucide-react";

const FEATURE_ITEMS = [
  { icon: Sparkles, text: "AI-Powered Moving" },
];

export default function FeatureTrustStrip() {
  return (
    <div className="feature-trust-strip">
      <div className="feature-trust-strip-inner">
        {FEATURE_ITEMS.map((item, idx) => (
          <div key={item.text} className="feature-trust-item text-lg font-extrabold tracking-wider">
            <item.icon className="w-6 h-6" />
            <span>{item.text}</span>
            {idx < FEATURE_ITEMS.length - 1 && (
              <span className="feature-trust-dot">•</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
