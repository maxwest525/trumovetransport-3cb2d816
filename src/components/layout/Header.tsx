import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, X, Phone, Video, ChevronDown, User,
  Calculator, Calendar, MapPin, Shield, Scan, ArrowRight
} from "lucide-react";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";

// Import preview images
import previewAiScanner from "@/assets/preview-ai-scanner.jpg";
import previewVideoConsult from "@/assets/preview-video-consult.jpg";
import previewPropertyLookup from "@/assets/preview-property-lookup.jpg";
import previewCarrierVetting from "@/assets/preview-carrier-vetting.jpg";

// Mega-menu preview - clean image card
const MegaPreviewImage = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="mega-preview-img-wrap">
      {!loaded && <div className="mega-preview-skeleton" />}
      <img 
        src={src} 
        alt={alt} 
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  );
};

interface NavItem {
  href: string;
  label: string;
  hasDropdown?: boolean;
  subItems?: SubNavItem[];
  dropdownContent?: {
    icon: React.ElementType;
    title: string;
    tagline: string;
    cta: string;
    ctaHref?: string;
    previewImage: string;
    previewAlt: string;
  };
}

interface SubNavItem {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV: NavItem[] = [
  { href: "/site", label: "Home" },
  { 
    href: "/site/book", 
    label: "Connect With Us",
    hasDropdown: true,
    dropdownContent: {
      icon: Calendar,
      title: "Connect With Us",
      tagline: "Real humans. Zero pressure.",
      cta: "Schedule Free Call",
      previewImage: previewVideoConsult,
      previewAlt: "Video Consultation"
    },
    subItems: [
      {
        href: "/site/book",
        label: "Book a Call",
        description: "Schedule a free consultation",
        icon: Phone,
      }
    ]
  },
  { 
    href: "/site/online-estimate", 
    label: "AI Move Estimator",
    hasDropdown: true,
    dropdownContent: {
      icon: Calculator,
      title: "AI Move Estimator",
      tagline: "Point. Scan. Price.",
      cta: "Try It Now",
      previewImage: previewAiScanner,
      previewAlt: "AI Scanner"
    },
    subItems: [
      {
        href: "/site/scan-room",
        label: "Scan Your Room",
        description: "AI auto-detects your furniture",
        icon: Scan,
        badge: "Beta"
      },
      {
        href: "/site/online-estimate",
        label: "Build Manually",
        description: "Pick from 200+ items",
        icon: Calculator
      }
    ]
  },
  { 
    href: "/site/track", 
    label: "Shipment Tracking",
    hasDropdown: true,
    dropdownContent: {
      icon: MapPin,
      title: "Live Tracking",
      tagline: "GPS • Weather • ETA",
      cta: "Track Shipment",
      previewImage: previewPropertyLookup,
      previewAlt: "Live Tracking"
    }
  },
  { 
    href: "/site/carrier-vetting", 
    label: "Carrier Vetting",
    hasDropdown: true,
    dropdownContent: {
      icon: Shield,
      title: "Carrier Vetting",
      tagline: "FMCSA verified. Instant results.",
      cta: "Check Any Mover",
      previewImage: previewCarrierVetting,
      previewAlt: "Carrier Vetting"
    }
  },
];

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener for enhanced shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`header-main header-floating ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="header-inner">
          {/* Logo */}
          <Link to="/site" className="header-logo" aria-label="TruMove Home">
            <div className="logo-glow-wrapper">
              <img src={logo} alt="TruMove" />
              <div className="logo-letter-glow" aria-hidden="true">
                <span>M</span><span>O</span><span>V</span><span>E</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav with Mega-Menus */}
          <nav className="header-nav" aria-label="Primary">
            {NAV.map((item) => (
              <div 
                key={item.href}
                className="header-nav-item"
                onMouseEnter={() => item.hasDropdown && setActiveMenu(item.href)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link
                  to={item.href}
                  className={`header-nav-link ${location.pathname === item.href || item.subItems?.some(s => location.pathname === s.href) ? "is-active" : ""}`}
                  onClick={() => {
                    setActiveMenu(null);
                  }}
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDown className="w-3 h-3 header-nav-chevron" />}
                </Link>

                {/* Mega-Menu Dropdown */}
                {item.hasDropdown && activeMenu === item.href && (
                  <div className="header-mega-menu">
                    <div className="mega-menu-content">
                      {/* Header: icon + title + tagline */}
                      {item.dropdownContent && (
                        <div className="mega-menu-header-compact">
                          <div className="mega-menu-title-row">
                            <item.dropdownContent.icon className="w-4 h-4" />
                            <h3>{item.dropdownContent.title}</h3>
                          </div>
                          <span className="mega-menu-tagline">{item.dropdownContent.tagline}</span>
                        </div>
                      )}

                      {/* Navigation links */}
                      {item.subItems && item.subItems.length > 0 && (
                        <div className="mega-menu-links">
                          {item.subItems.map((subItem) => (
                            <Link 
                              key={subItem.href} 
                              to={subItem.href}
                              className="mega-menu-link-item"
                            >
                              <div className="mega-menu-link-icon">
                                <subItem.icon className="w-4 h-4" />
                              </div>
                              <div className="mega-menu-link-text">
                                <span className="mega-menu-link-label">
                                  {subItem.label}
                                  {subItem.badge && (
                                    <span className="mega-method-badge">{subItem.badge}</span>
                                  )}
                                </span>
                                <span className="mega-menu-link-desc">{subItem.description}</span>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 mega-menu-link-arrow" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Preview image */}
                      {item.dropdownContent && (
                        <MegaPreviewImage 
                          src={item.dropdownContent.previewImage} 
                          alt={item.dropdownContent.previewAlt} 
                        />
                      )}

                      {/* CTA button */}
                      {item.dropdownContent && (
                        <Link to={item.dropdownContent.ctaHref || item.href} className="mega-menu-cta-compact">
                          <span>{item.dropdownContent.cta}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Theme Toggle - inline with nav */}
            <div className="header-nav-item">
              <ThemeToggle />
            </div>
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
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`header-mobile-link ${location.pathname === item.href ? "is-active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="header-mobile-actions">
              <Link 
                to="/site/book" 
                className="header-mobile-btn is-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Video className="w-4 h-4" />
                <span>Book Video Consult</span>
              </Link>
              {/* Theme Toggle (Mobile) */}
              <div className="flex justify-center pt-4 border-t border-border/40 mt-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
