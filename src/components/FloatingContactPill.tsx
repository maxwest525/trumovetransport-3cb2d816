import { useState, useRef, useEffect } from "react";
import { Phone, Video, Mic, X } from "lucide-react";
import { Link } from "react-router-dom";
import trudyAvatar from "@/assets/trudy-avatar.png";

export default function FloatingContactPill() {
  const [expanded, setExpanded] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    if (expanded) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [expanded]);

  return (
    <div ref={pillRef} className="fixed bottom-6 left-6 z-[80] flex flex-col-reverse items-start gap-2">
      {/* Main pill toggle */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="group floating-contact-pill"
        aria-label={expanded ? "Close contact options" : "Get in touch"}
      >
        <div className="floating-contact-pill-avatar">
          {expanded ? (
            <X className="w-4 h-4 text-background" />
          ) : (
            <img src={trudyAvatar} alt="Trudy" className="w-full h-full rounded-full object-cover" />
          )}
        </div>
        <span className="floating-contact-pill-label">
          {expanded ? "Close" : "Get in Touch"}
        </span>
        {!expanded && <span className="floating-contact-pill-dot" />}
      </button>

      {/* Expanded options */}
      {expanded && (
        <div className="floating-contact-options">
          <Link
            to="/book"
            onClick={() => setExpanded(false)}
            className="floating-contact-option"
          >
            <div className="floating-contact-option-icon floating-contact-option-video">
              <Video className="w-4 h-4" />
            </div>
            <div className="floating-contact-option-text">
              <span className="floating-contact-option-title">Video Consult</span>
              <span className="floating-contact-option-desc">Face-to-face planning</span>
            </div>
          </Link>

          <a
            href="tel:+16097277647"
            className="floating-contact-option"
            onClick={() => setExpanded(false)}
          >
            <div className="floating-contact-option-icon floating-contact-option-phone">
              <Phone className="w-4 h-4" />
            </div>
            <div className="floating-contact-option-text">
              <span className="floating-contact-option-title">Call Now</span>
              <span className="floating-contact-option-desc">(609) 727-7647</span>
            </div>
          </a>

          <button
            className="floating-contact-option"
            onClick={() => {
              setExpanded(false);
              // Find and click the Trudy FAB if it exists
              const trudyBtn = document.querySelector('[aria-label="Talk to Trudy"]') as HTMLButtonElement;
              if (trudyBtn) trudyBtn.click();
            }}
          >
            <div className="floating-contact-option-icon floating-contact-option-trudy">
              <Mic className="w-4 h-4" />
            </div>
            <div className="floating-contact-option-text">
              <span className="floating-contact-option-title">Talk to Trudy</span>
              <span className="floating-contact-option-desc">AI voice assistant</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
