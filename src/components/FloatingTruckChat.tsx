import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Truck, Hand, ChevronLeft } from 'lucide-react';
import ChatModal from './chat/ChatModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingTruckChatProps {
  className?: string;
}

export default function FloatingTruckChat({ className = '' }: FloatingTruckChatProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem('tm_ai_helper_minimized') === 'true';
  });

  const [isScrollMinimized, setIsScrollMinimized] = useState(false);
  const isCurrentlyMinimized = isMinimized || isScrollMinimized;

  useEffect(() => {
    if (!isMobile || isMinimized || isScrollMinimized) return;
    const timer = setTimeout(() => setIsScrollMinimized(true), 3000);
    return () => clearTimeout(timer);
  }, [isMobile, isMinimized, isScrollMinimized]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100 && !isScrollMinimized) setIsScrollMinimized(true);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrollMinimized]);

  useEffect(() => {
    const handleOpenTrudyChat = () => {
      setIsOpen(true);
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
    setIsScrollMinimized(false);
    localStorage.removeItem('tm_ai_helper_minimized');
  };

  /* ─── Minimized: vertical tab on right edge ─── */
  if (isCurrentlyMinimized) {
    return (
      <>
        <button
          onClick={handleReopen}
          className="fixed bottom-24 right-0 z-50
            px-2 py-4
            bg-card/95 backdrop-blur-md
            rounded-l-xl
            border border-r-0 border-border/60
            shadow-lg
            flex flex-col items-center gap-2.5
            transition-all duration-300
            hover:px-3 hover:shadow-xl hover:border-primary/40
            group"
          aria-label="Open Trudy chat"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <div className="p-1.5 rounded-full bg-foreground/10 border border-border/60 group-hover:border-primary/40 transition-colors">
            <Hand className="w-4 h-4 text-muted-foreground group-hover:text-foreground animate-wave" />
          </div>
        </button>
        <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} pagePath={location.pathname} />
      </>
    );
  }

  /* ─── Expanded: pill button ─── */
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-24 right-6 z-50
          pl-4 pr-5 py-3 rounded-full
          bg-card/95 backdrop-blur-md
          border border-border/60
          shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.15),0_0_0_1px_hsl(var(--primary)/0.08)]
          flex items-center gap-3
          transition-all duration-300 ease-out
          hover:shadow-[0_8px_32px_-4px_hsl(var(--primary)/0.25),0_0_0_1px_hsl(var(--primary)/0.15)]
          hover:scale-[1.03] hover:-translate-y-0.5
          hover:border-primary/40
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2
          ${className}
        `}
        aria-label="Chat with Trudy"
      >
        {/* Truck icon circle */}
        <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-foreground border border-foreground/80">
          <Truck className="w-4 h-4 text-background" />
        </div>

        {/* Text */}
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold leading-tight text-foreground">Chat with Trudy</span>
          <span className="text-[11px] leading-tight text-primary font-semibold">Let's Plan Your Move</span>
        </div>

        {/* Minimize / hand button */}
        <button
          onClick={handleMinimize}
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full
            bg-card border border-border/60
            flex items-center justify-center
            hover:bg-accent hover:border-primary/40
            transition-colors group/min
            shadow-sm"
          aria-label="Minimize"
        >
          <Hand className="w-3.5 h-3.5 text-muted-foreground group-hover/min:text-foreground group-hover/min:animate-wave" />
        </button>
      </button>

      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} pagePath={location.pathname} />
    </>
  );
}
