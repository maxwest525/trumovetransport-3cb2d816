import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Calculator, MapPin, Shield } from "lucide-react";
import logoImg from "@/assets/logo.png";

interface CommandCenterNavProps {
  /** Optional page-specific title override (defaults to "TruMove Command Center") */
  title?: string;
}

const navLinks = [
  { href: "/site", label: "Home", icon: Home },
  
  { href: "/site/online-estimate", label: "AI Move Estimator", icon: Calculator, matchAlso: ["/site/scan-room"] },
  { href: "/site/track", label: "Shipment Tracking", icon: MapPin },
  { href: "/site/vetting", label: "Carrier Vetting", icon: Shield, matchAlso: ["/site/carrier-vetting"] },
];

export default function CommandCenterNav({ title = "TruMove Command Center" }: CommandCenterNavProps) {
  const location = useLocation();

  const isActive = (item: typeof navLinks[0]) => {
    if (location.pathname === item.href) return true;
    if (item.matchAlso?.some(p => location.pathname === p)) return true;
    return false;
  };

  return (
    <div className="sticky top-[102px] z-40">
      <header className="tracking-header">
        {/* Left - Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <img src={logoImg} alt="TruMove" className="h-6 brightness-0 invert" />
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/90">
            {title}
          </span>
        </div>

        {/* Center - Navigation Links */}
        <nav className="flex-1 flex items-center justify-evenly ml-6">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2.5 px-4 py-1.5 rounded-lg text-[13px] font-extrabold uppercase tracking-[0.1em] transition-all ${
                  active
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 text-[hsl(142,71%,45%)]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </div>
  );
}
