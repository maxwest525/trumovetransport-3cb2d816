import { useLocation, Link } from "react-router-dom";
import { Sparkles, Shield, MessageSquare, MapPin, Video, Headphones, User, LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import logoImg from "@/assets/logo.png";

interface FloatingNavProps {
  onChatOpen?: () => void;
  iconsOnly?: boolean;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string | null;
  action?: string;
  isAgentLogin?: boolean;
}

const navItems: NavItem[] = [
  { icon: Video, label: "Video Consult", href: "/site/book" },
  { icon: Shield, label: "Carrier Vetting", href: "/site/vetting" },
  { icon: MessageSquare, label: "AI Chat", href: null, action: "chat" },
  { icon: MapPin, label: "Shipment Tracking", href: "/site/track" },
  { icon: Sparkles, label: "AI Estimator", href: "/site/online-estimate" },
  { icon: Headphones, label: "Call Us", href: "tel:+16097277647" },
  { icon: User, label: "Portal", href: "/", isAgentLogin: true },
];

export default function FloatingNav({ onChatOpen, iconsOnly = false }: FloatingNavProps) {
  const location = useLocation();

  const renderNavItem = (item: NavItem) => {
    const isActive = item.href && location.pathname === item.href;
    const Icon = item.icon;
    
    const itemClasses = `tru-static-nav-item ${isActive ? 'is-active' : ''} ${item.isAgentLogin ? 'is-agent-login' : ''}`;

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

    // Wrap in tooltip when icons only mode
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
      {/* TruMove Logo at top */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/site" className="tru-static-nav-logo" aria-label="TruMove Home">
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
      
      {/* Navigation items */}
      {navItems.map(renderNavItem)}
    </nav>
  );
}
