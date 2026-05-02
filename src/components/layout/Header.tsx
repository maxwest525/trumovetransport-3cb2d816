import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Calculator, MapPin, Shield, MessageSquare, Mail, Phone, Video, Car, Brain } from "lucide-react";
import logo from "@/assets/logo-navbar.png";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/scan-room", label: "Virtual Inventory", icon: Calculator },
  // { href: "/auto-transport", label: "Auto Transport", icon: Car },
  { href: "/track", label: "Shipment Tracking", icon: MapPin },
  { href: "/vetting", label: "FMCSA Carrier Vetting", icon: Shield },
  { href: "/customer-service", label: "Meet Trudy", icon: Brain },
  { href: "/book", label: "Contact Us", icon: Phone },
];

type MobileSpacing = "comfortable" | "compact";
type SpacingMode = MobileSpacing | "auto";
const SPACING_STORAGE_KEY = "header:mobileSpacing";
const SPACING_MODE_STORAGE_KEY = "header:mobileSpacingMode";

/**
 * Detect whether the user's device/system prefers larger, more accessible spacing.
 * Considers:
 *  - Browser root font-size scaled above the default 16px (Android "Font size" / desktop zoom).
 *  - iOS/macOS Dynamic Type via -webkit-text-size-adjust feedback (root em > 16).
 *  - prefers-reduced-motion: reduce — often correlates with accessibility-tuned setups.
 *  - Coarse pointer + small viewport — touch devices benefit from larger tap targets.
 */
function detectPreferredSpacing(): MobileSpacing {
  if (typeof window === "undefined") return "comfortable";
  try {
    const rootFontPx = parseFloat(
      getComputedStyle(document.documentElement).fontSize || "16"
    );
    // Larger-than-default text → comfortable for readability & tap accuracy
    if (rootFontPx > 17) return "comfortable";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return "comfortable";

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const veryNarrow = window.matchMedia("(max-width: 360px)").matches;
    // Tiny touch screens default to compact so all links fit without scrolling
    if (coarsePointer && veryNarrow) return "compact";

    return "comfortable";
  } catch {
    return "comfortable";
  }
}

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSpacing, setMobileSpacing] = useState<MobileSpacing>("comfortable");
  // "auto" = follow system/accessibility preference; otherwise = user override
  const [spacingMode, setSpacingMode] = useState<SpacingMode>("auto");

  // Load persisted preferences and resolve initial spacing
  useEffect(() => {
    let mode: SpacingMode = "auto";
    try {
      const storedMode = localStorage.getItem(SPACING_MODE_STORAGE_KEY);
      if (storedMode === "auto" || storedMode === "comfortable" || storedMode === "compact") {
        mode = storedMode;
      } else {
        // Backward compatibility: previous versions only stored an explicit value
        const legacy = localStorage.getItem(SPACING_STORAGE_KEY);
        if (legacy === "comfortable" || legacy === "compact") {
          mode = legacy;
        }
      }
    } catch {
      // localStorage unavailable — fall back to auto
    }
    setSpacingMode(mode);
    setMobileSpacing(mode === "auto" ? detectPreferredSpacing() : mode);
  }, []);

  // When in auto mode, react to live changes in system/accessibility preferences
  useEffect(() => {
    if (spacingMode !== "auto" || typeof window === "undefined") return;

    const update = () => setMobileSpacing(detectPreferredSpacing());
    update();

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerMq = window.matchMedia("(pointer: coarse)");
    const widthMq = window.matchMedia("(max-width: 360px)");
    motionMq.addEventListener?.("change", update);
    pointerMq.addEventListener?.("change", update);
    widthMq.addEventListener?.("change", update);
    window.addEventListener("resize", update);

    return () => {
      motionMq.removeEventListener?.("change", update);
      pointerMq.removeEventListener?.("change", update);
      widthMq.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
    };
  }, [spacingMode]);

  const selectSpacingMode = (mode: SpacingMode) => {
    setSpacingMode(mode);
    try {
      localStorage.setItem(SPACING_MODE_STORAGE_KEY, mode);
      if (mode === "auto") {
        localStorage.removeItem(SPACING_STORAGE_KEY);
      } else {
        localStorage.setItem(SPACING_STORAGE_KEY, mode);
      }
    } catch {
      // ignore persistence failure
    }
    if (mode !== "auto") {
      setMobileSpacing(mode);
    } else {
      setMobileSpacing(detectPreferredSpacing());
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`header-main header-floating ${isScrolled ? "is-scrolled" : ""} ${location.pathname === "/" ? "header-home-glow" : ""}`}
        data-mobile-spacing={mobileSpacing}
      >
        <div className="header-inner">
          {/* Logo - left */}
          <Link to="/" className="header-logo shrink-0" aria-label="TruMove Home">
            <img 
              src={logo} 
              alt="TruMove" 
              className="header-logo-glow"
            />
          </Link>

          {/* Desktop Nav Links - centered */}
          <nav className="header-nav" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <div key={item.label} className="header-nav-item">
                  <Link
                    to={item.href}
                    className={`header-nav-link text-[15px] ${isActive ? "is-active" : ""}`}
                  >
                    <Icon className="w-5 h-5 text-[hsl(142,71%,45%)]" />
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </nav>


          {/* Mobile Menu Toggle */}
          <button 
            type="button" 
            className="header-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="header-mobile-menu">
            <nav className="header-mobile-nav">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`header-mobile-link ${location.pathname === item.href ? "is-active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4 text-[hsl(142,71%,45%)]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Spacing variant toggle */}
            <div className="header-mobile-spacing-toggle" role="group" aria-label="Menu spacing">
              <span className="header-mobile-spacing-label">
                Spacing
                {spacingMode === "auto" && (
                  <span className="header-mobile-spacing-hint">
                    {" "}· Auto ({mobileSpacing})
                  </span>
                )}
              </span>
              <div className="header-mobile-spacing-options">
                <button
                  type="button"
                  className={`header-mobile-spacing-option ${spacingMode === "auto" ? "is-active" : ""}`}
                  onClick={() => selectSpacingMode("auto")}
                  aria-pressed={spacingMode === "auto"}
                  title="Match your device accessibility settings"
                >
                  Auto
                </button>
                <button
                  type="button"
                  className={`header-mobile-spacing-option ${spacingMode === "comfortable" ? "is-active" : ""}`}
                  onClick={() => selectSpacingMode("comfortable")}
                  aria-pressed={spacingMode === "comfortable"}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  className={`header-mobile-spacing-option ${spacingMode === "compact" ? "is-active" : ""}`}
                  onClick={() => selectSpacingMode("compact")}
                  aria-pressed={spacingMode === "compact"}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
