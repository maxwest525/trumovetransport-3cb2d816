import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Truck, Sparkles, Hand, ChevronRight, ChevronLeft } from 'lucide-react';
import ChatModal from './chat/ChatModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingTruckChatProps {
  className?: string;
}

export default function FloatingTruckChat({ className = '' }: FloatingTruckChatProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [showButton] = useState(true);
  
  // Manual minimized state with localStorage persistence
  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem('tm_ai_helper_minimized') === 'true';
  });

  // Scroll-triggered minimization (temporary, not persisted)
  const [isScrollMinimized, setIsScrollMinimized] = useState(false);

  // Combined minimized state
  const isCurrentlyMinimized = isMinimized || isScrollMinimized;

  // Auto-minimize on mobile after 3 seconds
  useEffect(() => {
    if (!isMobile || isMinimized || isScrollMinimized) return;
    const timer = setTimeout(() => {
      setIsScrollMinimized(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isMobile, isMinimized, isScrollMinimized]);

  // Scroll listener to auto-minimize
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Minimize when scrolling down past 100px threshold
      if (currentScrollY > 100 && !isScrollMinimized) {
        setIsScrollMinimized(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrollMinimized]);

  // Listen for custom event to open chat from anywhere (e.g., FeatureCarousel)
  useEffect(() => {
    const handleOpenTrudyChat = () => {
      setIsOpen(true);
      // Also un-minimize if needed
      setIsMinimized(false);
      setIsScrollMinimized(false);
      localStorage.removeItem('tm_ai_helper_minimized');
    };

    window.addEventListener('openTrudyChat', handleOpenTrudyChat);
    return () => window.removeEventListener('openTrudyChat', handleOpenTrudyChat);
  }, []);

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(true);
    localStorage.setItem('tm_ai_helper_minimized', 'true');
  };

  const handleReopen = () => {
    setIsMinimized(false);
    setIsScrollMinimized(false); // Also clear scroll-triggered state
    localStorage.removeItem('tm_ai_helper_minimized');
  };

  // When minimized - show a vertical strip on the right edge
  if (isCurrentlyMinimized) {
    return (
      <>
        <button
          onClick={handleReopen}
          className="fixed bottom-24 right-0 z-50 
            px-2 py-4 
            bg-foreground text-background 
            rounded-l-xl
            border-2 border-r-0 border-primary/30
            shadow-lg 
            flex flex-col items-center gap-2
            transition-all duration-300 
            hover:px-3 hover:shadow-xl
            group"
          aria-label="Open AI Helper"
        >
          <div className="p-1 rounded-full border border-background/50">
            <ChevronLeft className="w-4 h-4 text-background/70 group-hover:text-background transition-colors" />
          </div>
          <div className="p-1 rounded-full border border-background/50">
            <Hand className="w-5 h-5 text-background animate-wave" />
          </div>
        </button>
        <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} pagePath={location.pathname} />
      </>
    );
  }

  return (
    <>
      {/* Floating Pill Button - High visibility with pulse animation */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-24 right-6 z-50
          px-5 py-3.5 rounded-full
          bg-foreground text-background
          border-2 border-primary/30
          shadow-[0_8px_32px_-4px_hsl(var(--primary)/0.4),0_4px_16px_-2px_hsl(var(--tm-ink)/0.3)]
          flex items-center gap-3
          transition-all duration-300 ease-out
          hover:shadow-[0_12px_40px_-4px_hsl(var(--primary)/0.5),0_6px_20px_-2px_hsl(var(--tm-ink)/0.35)]
          hover:scale-[1.03] hover:-translate-y-1
          focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2
          ${!showButton ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}
          ${className}
        `}
        aria-label="Trudy AI Moving Helper"
      >
        {/* Truck Icon Container */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-background/20 border border-background/30">
          <Truck className="w-5 h-5 text-background animate-truck-bounce" />
          {/* Sparkle indicator */}
          <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-background animate-pulse" />
        </div>
        
        {/* Text Label */}
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold leading-tight text-background">Chat with Trudy</span>
          <span className="text-xs leading-tight text-primary font-semibold">Let's Plan Your Move</span>
        </div>
        
        {/* Status indicator - smaller and more subtle */}
        <span className="w-2 h-2 rounded-full bg-primary ml-1" />
        
        {/* Minimize button with hand + arrow */}
        <button
          onClick={handleMinimize}
          className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center gap-0.5 hover:bg-primary/20 hover:border-primary/40 transition-colors group"
          aria-label="Minimize AI Helper"
        >
          <Hand className="w-3 h-3 text-muted-foreground group-hover:text-foreground group-hover:animate-wave" />
          <ChevronRight className="w-2.5 h-2.5 text-muted-foreground group-hover:text-foreground" />
        </button>
      </button>

      {/* Chat Modal */}
      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} pagePath={location.pathname} />
    </>
  );
}
