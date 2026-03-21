import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Sparkles,
  Shield,
  MessageSquare,
  MapPin,
  Video,
  Headphones,
  Route,
  Calendar,
  Home,
  Truck,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UnifiedDockProps {
  // Summary data
  fromCity: string;
  toCity: string;
  distance: number;
  moveDate: Date | null;
  size: string;
  propertyType: string;
  estimatedDuration: string | null;
  floor: number;
  hasElevator: boolean;
  
  // Form progress (0-100)
  progress: number;
  
  // Navigation
  onChatOpen: () => void;
  onEditClick?: () => void;
  
  // Visual state
  updatedFields: Set<string>;
}

const navItems = [
  { icon: Video, label: "Video Consult", href: "/book" },
  { icon: Shield, label: "Carrier Vetting", href: "/vetting" },
  { icon: MessageSquare, label: "AI Chat", href: null, action: "chat" },
  { icon: MapPin, label: "Shipment Tracking", href: "/track" },
  { icon: Sparkles, label: "AI Estimator", href: "/online-estimate" },
  { icon: Headphones, label: "Call Us", href: "tel:+16097277647" },
];

export default function UnifiedDock({
  fromCity,
  toCity,
  distance,
  moveDate,
  size,
  propertyType,
  estimatedDuration,
  floor,
  hasElevator,
  progress,
  onChatOpen,
  updatedFields,
}: UnifiedDockProps) {
  const location = useLocation();
  const dockRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  
  // 3D tilt state
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  // Nav magnification state
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [navHovered, setNavHovered] = useState(false);

  // Handle 3D tilt on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dockRef.current || !isHovered) return;
    
    const rect = dockRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setTilt({
      rotateX: y * -3,
      rotateY: x * 3,
    });
  }, [isHovered]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  // Handle nav magnification
  const handleNavMouseMove = useCallback((e: React.MouseEvent) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  }, []);

  const handleNavMouseLeave = useCallback(() => {
    setMouseX(null);
    setNavHovered(false);
  }, []);

  // Calculate icon scale based on proximity to mouse
  const getIconScale = (index: number): number => {
    if (mouseX === null || !navHovered) return 1;
    
    const iconWidth = 44;
    const iconCenter = index * iconWidth + iconWidth / 2;
    const distance = Math.abs(mouseX - iconCenter);
    const threshold = 60;
    const maxScale = 1.35;
    
    if (distance > threshold) return 1;
    return 1 + (maxScale - 1) * (1 - distance / threshold);
  };

  // Progress ring calculations
  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Check if we have any data to show
  const hasData = fromCity || toCity || distance > 0 || moveDate || size || propertyType;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        ref={dockRef}
        className="unified-dock"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
      >
        {/* Aurora Background */}
        <div className="unified-dock-aurora" />
        
        {/* Glass Layer */}
        <div className="unified-dock-glass" />
        
        {/* Content Container */}
        <div className="unified-dock-content">
          {/* LEFT: Summary Section */}
          <div className="unified-dock-summary">
            {/* Progress Ring */}
            <div className="unified-dock-progress-container">
              <svg className="unified-dock-progress-ring" viewBox="0 0 36 36">
                <circle
                  className="unified-dock-progress-bg"
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  strokeWidth="2.5"
                />
                <circle
                  className="unified-dock-progress-fill"
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <span className="unified-dock-progress-text">{Math.round(progress)}%</span>
            </div>
            
            {/* Summary Title */}
            <div className="unified-dock-summary-header">
              <span className="unified-dock-summary-title">Move Summary</span>
            </div>
            
            {/* Summary Data */}
            <div className="unified-dock-summary-grid">
              <div className={`unified-dock-row ${updatedFields.has('from') ? 'is-updated' : ''}`}>
                <span className="unified-dock-label">From</span>
                <span className="unified-dock-value">{fromCity || "-"}</span>
              </div>
              <div className={`unified-dock-row ${updatedFields.has('to') ? 'is-updated' : ''}`}>
                <span className="unified-dock-label">To</span>
                <span className="unified-dock-value">{toCity || "-"}</span>
              </div>
              <div className={`unified-dock-row ${updatedFields.has('distance') ? 'is-updated' : ''}`}>
                <span className="unified-dock-label">Distance</span>
                <span className="unified-dock-value">{distance > 0 ? `${distance.toLocaleString()} mi` : "-"}</span>
              </div>
              <div className={`unified-dock-row ${updatedFields.has('date') ? 'is-updated' : ''}`}>
                <span className="unified-dock-label">Date</span>
                <span className="unified-dock-value">{moveDate ? format(moveDate, "MMM d, yyyy") : "-"}</span>
              </div>
              <div className={`unified-dock-row ${updatedFields.has('size') ? 'is-updated' : ''}`}>
                <span className="unified-dock-label">Size</span>
                <span className="unified-dock-value">{size || "-"}</span>
              </div>
              <div className={`unified-dock-row ${updatedFields.has('propertyType') ? 'is-updated' : ''}`}>
                <span className="unified-dock-label">Property</span>
                <span className="unified-dock-value">
                  {propertyType 
                    ? `${propertyType === 'house' ? 'House' : 'Apt'}${propertyType === 'apartment' ? ` F${floor}` : ''}`
                    : "-"}
                </span>
              </div>
            </div>
          </div>
          
          {/* DIVIDER */}
          <div className="unified-dock-divider" />
          
          {/* RIGHT: Navigation Section */}
          <div 
            ref={navRef}
            className="unified-dock-nav"
            onMouseMove={handleNavMouseMove}
            onMouseEnter={() => setNavHovered(true)}
            onMouseLeave={handleNavMouseLeave}
          >
            {navItems.map((item, index) => {
              const isActive = item.href && location.pathname === item.href;
              const Icon = item.icon;
              const scale = getIconScale(index);
              
              const iconStyle = {
                transform: `scale(${scale}) translateY(${(scale - 1) * -8}px)`,
                zIndex: Math.round(scale * 10),
              };
              
              const itemContent = (
                <div 
                  className={`unified-dock-nav-item ${isActive ? 'is-active' : ''}`}
                  style={iconStyle}
                >
                  <span className="unified-dock-nav-icon">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </span>
                  <span className="unified-dock-nav-label">{item.label}</span>
                </div>
              );

              let element: React.ReactNode;

              if (item.action === "chat") {
                element = (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onChatOpen}
                        className="unified-dock-nav-trigger"
                      >
                        {itemContent}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              } else if (item.href?.startsWith("tel:")) {
                element = (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <a href={item.href} className="unified-dock-nav-trigger">
                        {itemContent}
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              } else {
                element = (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <Link to={item.href!} className="unified-dock-nav-trigger">
                        {itemContent}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return element;
            })}
          </div>
        </div>
        
        {/* Glowing Border Effect */}
        <div className="unified-dock-glow" />
      </div>
    </TooltipProvider>
  );
}
