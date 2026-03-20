import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Hand, ChevronRight, ChevronLeft } from 'lucide-react';
import ChatModal from './chat/ChatModal';
import { useIsMobile } from '@/hooks/use-mobile';
import trudyAvatar from '@/assets/trudy-avatar.png';

interface FloatingTruckChatProps {
  className?: string;
}

export default function FloatingTruckChat({ className = '' }: FloatingTruckChatProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [showButton] = useState(true);
  
  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem('tm_ai_helper_minimized') === 'true';
  });

  const [isScrollMinimized, setIsScrollMinimized] = useState(false);
  const isCurrentlyMinimized = isMinimized || isScrollMinimized;

  useEffect(() => {
    if (!isMobile || isMinimized || isScrollMinimized) return;
    const timer = setTimeout(() => {
      setIsScrollMinimized(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isMobile, isMinimized, isScrollMinimized]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100 && !isScrollMinimized) {
        setIsScrollMinimized(true);
      }
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

  if (isCurrentlyMinimized) {
    return (
      <>
        <button
          onClick={handleReopen}
          className="fixed bottom-24 right-0 z-50 
            px-2 py-4 
            bg-foreground text-background 
            rounded-l-xl
            border-2 border-r-0 border-foreground/30
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
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-24 right-6 z-50
          px-5 py-3.5 rounded-full
          bg-foreground text-background
          border-2 border-foreground/30
          shadow-[0_8px_32px_-4px_hsl(var(--tm-ink)/0.35),0_4px_16px_-2px_hsl(var(--tm-ink)/0.25)]
          flex items-center gap-3
          transition-all duration-300 ease-out
          hover:shadow-[0_12px_40px_-4px_hsl(var(--tm-ink)/0.45),0_6px_20px_-2px_hsl(var(--tm-ink)/0.3)]
          hover:scale-[1.03] hover:-translate-y-1
          focus:outline-none focus:ring-2 focus:ring-foreground/30 focus:ring-offset-2
          ${!showButton ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}
          ${className}
        `}
        aria-label="Trudy AI Moving Helper"
      >
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-background/30 bg-background/20">
          <img src={trudyAvatar} alt="Trudy" className="h-full w-full object-cover" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-2 ring-foreground">
            <Sparkles className="h-2.5 w-2.5 text-primary-foreground" />
          </span>
        </div>
        
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold leading-tight text-background">Chat with Trudy</span>
          <span className="text-xs leading-tight text-background/70 font-semibold">Let's Plan Your Move</span>
        </div>
        
        <span className="w-2 h-2 rounded-full bg-background/60 ml-1" />
        
        <button
          onClick={handleMinimize}
          className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center gap-0.5 hover:bg-accent hover:border-foreground/30 transition-colors group"
          aria-label="Minimize AI Helper"
        >
          <Hand className="w-3 h-3 text-muted-foreground group-hover:text-foreground group-hover:animate-wave" />
          <ChevronRight className="w-2.5 h-2.5 text-muted-foreground group-hover:text-foreground" />
        </button>
      </button>

      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} pagePath={location.pathname} />
    </>
  );
}
