import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Calculator, MapPin, Shield } from "lucide-react";
import logo from "@/assets/logo.png";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/site", label: "Home", icon: Home },
  { href: "/site/online-estimate", label: "Move Estimator", icon: Calculator },
  { href: "/site/track", label: "Shipment Tracking", icon: MapPin },
  { href: "/site/vetting", label: "Carrier Vetting", icon: Shield },
];

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
          {/* Logo - left */}
          <Link to="/site" className="header-logo shrink-0" aria-label="TruMove Home">
            <img 
              src={logo} 
              alt="TruMove" 
              style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,1)) drop-shadow(0 0 50px rgba(255,255,255,1)) drop-shadow(0 0 100px rgba(255,255,255,1)) drop-shadow(0 0 160px rgba(255,255,255,1)) drop-shadow(0 0 240px rgba(255,255,255,0.9)) drop-shadow(0 0 320px rgba(255,255,255,0.7))' }}
            />
          </Link>

          {/* Desktop Nav Links - centered */}
          <nav className="header-nav flex-1 justify-center gap-2" aria-label="Primary">
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

          {/* Spacer to balance logo on the left */}
          <div className="hidden md:block shrink-0" style={{ width: '120px' }} />

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
          </div>
        )}
      </header>
    </>
  );
}
