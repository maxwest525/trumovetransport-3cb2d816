import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Truck, MessageCircle, Sparkles } from "lucide-react";

// Preview images
import previewAiScanner from "@/assets/preview-ai-scanner.jpg";
import previewCarrierVetting from "@/assets/preview-carrier-vetting.jpg";
import trudyVideoCall from "@/assets/trudy-video-call.jpg";
import previewPropertyLookup from "@/assets/preview-property-lookup.jpg";
import sampleRoomLiving from "@/assets/sample-room-living.jpg";
import scanRoomPreview from "@/assets/scan-room-preview.jpg";
import trudyAvatar from "@/assets/trudy-avatar.png";

type Feature = {
  title: string;
  desc: string;
  image?: string;
  customIcon?: React.ReactNode;
  route?: string;
  action?: "openChat";
};

// Truck with chat bubbles icon for Trudy AI card
const TruckChatIcon = () => (
  <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
    <div className="relative">
      <Truck className="w-16 h-16 text-foreground" />
      <div className="absolute -top-3 -right-3 flex gap-1">
        <MessageCircle className="w-6 h-6 text-primary fill-primary/20" />
        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
      </div>
    </div>
  </div>
);


const features: Feature[] = [
  {
    title: "Inventory Builder",
    desc: "Build your item list room by room for accurate pricing estimates.",
    image: sampleRoomLiving,
    route: "/online-estimate",
  },
  {
    title: "AI Room Scanner",
    desc: "Point your camera and AI detects furniture instantly.",
    image: scanRoomPreview,
    route: "/scan-room",
  },
  {
    title: "Shipment Tracking",
    desc: "Track your shipment in real-time with live updates and notifications.",
    image: previewPropertyLookup,
    route: "/track",
  },
  {
    title: "Smart Carrier Match",
    desc: "Our algorithm finds the best carrier for your route.",
    image: previewCarrierVetting,
    route: "/vetting",
  },
  {
    title: "TruMove Specialist",
    desc: "Live video consultation for personalized guidance.",
    image: trudyVideoCall,
    route: "/book",
  },
  {
    title: "FMCSA Verified",
    desc: "Real-time safety data checks from official databases.",
    image: previewCarrierVetting,
    route: "/vetting",
  },
  {
    title: "Trudy AI Assistant",
    desc: "Chat with our AI to get instant answers about your move.",
    customIcon: <TruckChatIcon />,
    action: "openChat",
  },
];

export default function FeatureCarousel() {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  // Autoplay with 4s interval, pauses on hover
  useEffect(() => {
    if (!api || isPaused) {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      return;
    }

    scrollIntervalRef.current = window.setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [api, isPaused]);

  // Pause autoplay on hover/interaction
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
    setHoveredIndex(null);
  }, []);

  const handleCardClick = (feature: Feature) => {
    if (feature.action === "openChat") {
      // Dispatch custom event to open FloatingTruckChat
      window.dispatchEvent(new CustomEvent('openTrudyChat'));
    } else {
      setSelectedFeature(feature);
    }
  };

  return (
    <div 
      className="features-carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Carousel
        setApi={setApi}
        opts={{ 
          align: "start", 
          loop: true, 
          dragFree: false, 
          duration: 25, 
          skipSnaps: false,
          dragThreshold: 10,
          inViewThreshold: 0.7
        }}
        className="features-carousel-container"
      >
        <CarouselContent className="features-carousel-content">
          {features.map((feature, index) => (
            <CarouselItem key={index} className="features-carousel-item">
              <div 
                className="features-carousel-card animate-fade-scale-in opacity-0"
                style={{ animationDelay: `${index * 80}ms` }}
                onClick={() => handleCardClick(feature)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCardClick(feature)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="features-carousel-card-header">
                  <div className="features-carousel-card-text">
                    <h3 className="features-carousel-card-title">{feature.title}</h3>
                    <p className="features-carousel-card-desc">{feature.desc}</p>
                  </div>
                </div>
                <div className="features-carousel-card-image-wrapper">
                  {feature.customIcon ? (
                    feature.customIcon
                  ) : (
                    <img src={feature.image} alt={`${feature.title} Preview`} />
                  )}
                </div>
                
                {/* Hover label */}
                {hoveredIndex === index && (
                  <span className="features-carousel-hover-label">
                    {feature.action === "openChat" ? "Click to chat" : "Click to explore"}
                  </span>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Feature Preview Modal */}
      <Dialog open={!!selectedFeature} onOpenChange={(open) => !open && setSelectedFeature(null)}>
        <DialogContent className="feature-preview-modal">
          <DialogTitle className="sr-only">{selectedFeature?.title}</DialogTitle>
          <DialogDescription className="sr-only">{selectedFeature?.desc}</DialogDescription>
          <DialogClose className="feature-preview-close">
            <X className="h-5 w-5" />
          </DialogClose>
          {selectedFeature && (
            <div className="feature-preview-content">
              <div className="feature-preview-image">
                <img src={selectedFeature.image} alt={selectedFeature.title} />
              </div>
              <div className="feature-preview-info">
                <h3>{selectedFeature.title}</h3>
                <p>{selectedFeature.desc}</p>
                <button 
                  className="feature-preview-cta"
                  onClick={() => {
                    setSelectedFeature(null);
                    if (selectedFeature.route) {
                      navigate(selectedFeature.route);
                    }
                  }}
                >
                  Explore Feature
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
