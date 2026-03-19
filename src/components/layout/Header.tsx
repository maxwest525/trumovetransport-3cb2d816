import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, X, Phone, Video, Mail, MessageSquare
} from "lucide-react";
import logo from "@/assets/logo.png";


interface CtaItem {
  href: string;
  label: string;
  icon: React.ElementType;
  isExternal?: boolean;
}

const CTA_ITEMS: CtaItem[] = [
  { href: "tel:+18001234567", label: "Call Now", icon: Phone, isExternal: true },
  { href: "/site/book", label: "Video Consult", icon: Video },
  { href: "mailto:support@trumove.com", label: "Email Support", icon: Mail, isExternal: true },
  { href: "sms:+18001234567", label: "Text a Rep", icon: MessageSquare, isExternal: true },
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
          {/* Logo */}
          <Link to="/site" className="header-logo" aria-label="TruMove Home">
            <img 
              src={logo} 
              alt="TruMove" 
              style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,1)) drop-shadow(0 0 50px rgba(255,255,255,1)) drop-shadow(0 0 100px rgba(255,255,255,1)) drop-shadow(0 0 160px rgba(255,255,255,1)) drop-shadow(0 0 240px rgba(255,255,255,0.9)) drop-shadow(0 0 320px rgba(255,255,255,0.7))' }}
            />
          </Link>

          {/* Desktop CTA Buttons */}
          <nav className="header-nav flex-1 justify-evenly" aria-label="Primary">
            {CTA_ITEMS.map((item) => {
              const Icon = item.icon;
              if (item.isExternal) {
                return (
                  <div key={item.label} className="header-nav-item">
                    <a href={item.href} className="header-nav-link text-[15px]">
                      <Icon className="w-5 h-5 text-[hsl(142,71%,45%)]" />
                      {item.label}
                    </a>
                  </div>
                );
              }
              return (
                <div key={item.label} className="header-nav-item">
                  <Link
                    to={item.href}
                    className={`header-nav-link text-[15px] ${location.pathname === item.href ? "is-active" : ""}`}
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
              {CTA_ITEMS.map((item) => {
                const Icon = item.icon;
                if (item.isExternal) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="header-mobile-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4 text-[hsl(142,71%,45%)]" />
                      {item.label}
                    </a>
                  );
                }
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
