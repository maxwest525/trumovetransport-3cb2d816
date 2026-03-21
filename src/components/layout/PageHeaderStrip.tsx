import { type ElementType } from "react";
import logo from "@/assets/logo.png";

interface TrustItem {
  icon: ElementType;
  text: string;
}

interface PageHeaderStripProps {
  title: string;
  trustItems: TrustItem[];
  rightLabel?: string;
  rightValue?: string;
}

export default function PageHeaderStrip({
  title,
  trustItems,
  rightLabel = "Session ID",
  rightValue,
}: PageHeaderStripProps) {
  const fallbackValue = `TM-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`;

  return (
    <header className="video-consult-header">
      {/* Left - Logo + Title */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="TruMove" className="h-5 brightness-0 invert" />
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary-foreground/90">
          {title}
        </span>
      </div>

      {/* Center - Trust Items */}
      <div className="video-consult-header-trust">
        {trustItems.map((item, idx) => (
          <span key={item.text} className="contents">
            <div className="video-consult-header-trust-item">
              <item.icon className="w-4 h-4" />
              <span>{item.text}</span>
            </div>
            {idx < trustItems.length - 1 && (
              <span className="video-consult-trust-dot">•</span>
            )}
          </span>
        ))}
      </div>

      {/* Right - ID */}
      <div className="text-right hidden md:block">
        <div className="text-[11px] text-primary-foreground/70 uppercase tracking-wider">
          {rightLabel}
        </div>
        <div className="text-sm font-mono text-primary-foreground">
          {rightValue ?? fallbackValue}
        </div>
      </div>
    </header>
  );
}
