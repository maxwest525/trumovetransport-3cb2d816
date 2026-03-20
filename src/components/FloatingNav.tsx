import { useLocation, Link } from "react-router-dom";
import { Sparkles, Shield, MessageSquare, MapPin, Video, Headphones, LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import logoImg from "@/assets/logo-navbar.png";

interface FloatingNavProps {
  onChatOpen?: () => void;
  iconsOnly?: boolean;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string | null;
  action?: string;
}

const navItems: NavItem[] = [
  { icon: Video, label: "Video Consult", href: "/book" },
  { icon: Shield, label: "Carrier Vetting", href: "/vetting" },
  { icon: MessageSquare, label: "AI Chat", href: null, action: "chat" },
  { icon: MapPin, label: "Shipment Tracking", href: "/track" },
  { icon: Sparkles, label: "AI Estimator", href: "/online-estimate" },
  { icon: Headphones, label: "Call Us", href: "tel:+16097277647" },
];

export default function FloatingNav({ onChatOpen, iconsOnly = false }: FloatingNavProps) {
  const location = useLocation();

  const renderNavItem = (item: NavItem) => {
    const isActive = item.href && location.pathname === item.href;
    const Icon = item.icon;
    
    const itemClasses = `tru-static-nav-item ${isActive ? 'is-active' : ''}`;

    const content = (
      <>
        <Icon className="w-5 h-5" strokeWidth={2} />
        {!iconsOnly && <span>{item.label}</span>}
      </>
    );

    let element: React.ReactNode;

    if (item.action === "chat") {
      element = (
        <button
          key={item.label}
          onClick={onChatOpen}
          className={itemClasses}
        >
          {content}
        </button>
      );
    } else if (item.href?.startsWith("tel:")) {
      element = (
        <a
          key={item.label}
          href={item.href}
          className={itemClasses}
        >
          {content}
        </a>
      );
    } else {
      element = (
        <Link
          key={item.label}
          to={item.href!}
          className={itemClasses}
        >
          {content}
        </Link>
      );
    }

    if (iconsOnly) {
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            {element}
          </TooltipTrigger>
          <TooltipContent 
            side="left" 
            className="bg-card border border-border text-foreground text-xs font-medium px-3 py-1.5"
          >
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return element;
  };

  return (
    <nav className={`tru-static-nav-menu ${iconsOnly ? 'icons-only' : ''}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/" className="tru-static-nav-logo" aria-label="TruMove Home">
            <img src={logoImg} alt="TruMove" />
          </Link>
        </TooltipTrigger>
        <TooltipContent 
          side="left" 
          className="bg-card border border-border text-foreground text-xs font-medium px-3 py-1.5"
        >
          Home
        </TooltipContent>
      </Tooltip>
      
      {navItems.map(renderNavItem)}
    </nav>
  );
}
