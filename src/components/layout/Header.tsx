import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Calculator, MapPin, Shield, MessageSquare, Mail, Phone, Video } from "lucide-react";
import logo from "@/assets/logo.png";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/site/online-estimate", label: "Virtual Inventory", icon: Calculator },
  { href: "/site/track", label: "Shipment Tracking", icon: MapPin },
  { href: "/site/vetting", label: "FMCSA Carrier Vetting", icon: Shield },
];

const CONTACT_ACTIONS = [
  { icon: MessageSquare, label: "Text", href: "sms:+1234567890" },
  { icon: Mail, label: "Email", href: "mailto:info@trumove.com" },
  { icon: Phone, label: "Phone", href: "tel:+1234567890" },
  { icon: Video, label: "Video", href: "/site/book" },
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

          {/* Contact Us - right */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className="text-white/70 text-xs font-semibold uppercase tracking-wider mr-1">Contact</span>
            {CONTACT_ACTIONS.map((action) => {
              const Icon = action.icon;
              const isExternal = action.href.startsWith("tel:") || action.href.startsWith("mailto:") || action.href.startsWith("sms:");
              
              if (isExternal) {
                return (
                  <a
                    key={action.label}
                    href={action.href}
                    title={action.label}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-[hsl(142,71%,45%)]/20 hover:text-[hsl(142,71%,45%)] text-white/80 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              }

              return (
                <Link
                  key={action.label}
                  to={action.href}
                  title={action.label}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-[hsl(142,71%,45%)]/20 hover:text-[hsl(142,71%,45%)] text-white/80 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </Link>
              );
            })}
          </div>

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
              <div className="border-t border-white/10 pt-3 mt-2">
                <span className="text-white/50 text-xs font-semibold uppercase tracking-wider px-3 mb-2 block">Contact Us</span>
                <div className="flex gap-3 px-3 pt-1">
                  {CONTACT_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    const isExternal = action.href.startsWith("tel:") || action.href.startsWith("mailto:") || action.href.startsWith("sms:");
                    const Component = isExternal ? "a" : Link;
                    const props = isExternal ? { href: action.href } : { to: action.href, onClick: () => setMobileMenuOpen(false) };
                    return (
                      <Component
                        key={action.label}
                        {...(props as any)}
                        title={action.label}
                        className="flex flex-col items-center gap-1 text-white/70 hover:text-[hsl(142,71%,45%)] transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px]">{action.label}</span>
                      </Component>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}