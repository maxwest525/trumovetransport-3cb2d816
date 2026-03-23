import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConversation } from '@elevenlabs/react';
import { Hand, ChevronLeft, Mic, PhoneOff, Loader2, X, Copy, Download, Check, MessageCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import VoiceWaveform from './VoiceWaveform';

const TRUDY_AGENT_ID = 'agent_0501khwa2t2pfj0s3echetmjhx4n';

interface TranscriptEntry {
  id: number;
  speaker: 'user' | 'trudy';
  text: string;
}

export default function FloatingTruckChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Remove any ElevenLabs SDK-injected widget elements from the DOM
  useEffect(() => {
    const isOrphanedSdkSwitch = (el: Element) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.tagName.toLowerCase() !== 'button' || el.getAttribute('role') !== 'switch') return false;
      if (el.closest('.tru-floating-truck-chat, [data-radix-popper-content-wrapper], [data-sonner-toaster], [data-state]')) return false;

      const text = el.textContent?.trim() ?? '';
      const width = el.offsetWidth || el.getBoundingClientRect().width;
      const height = el.offsetHeight || el.getBoundingClientRect().height;
      const hasElevenLabsParent = Boolean(el.closest('elevenlabs-convai, [data-elevenlabs], [class*="convai"], [class*="elevenlabs"], [id*="elevenlabs"]'));

      return hasElevenLabsParent || (!text && width <= 64 && height <= 40);
    };

    const removeWidgetArtifacts = () => {
      document
        .querySelectorAll('elevenlabs-convai, [data-elevenlabs], [class*="convai"], [class*="elevenlabs"], [id*="elevenlabs"]')
        .forEach((el) => {
          if (!el.closest('.tru-floating-truck-chat')) {
            el.remove();
          }
        });

      document.querySelectorAll('button[role="switch"]').forEach((el) => {
        if (isOrphanedSdkSwitch(el)) {
          el.remove();
        }
      });
    };

    removeWidgetArtifacts();

    const observer = new MutationObserver(() => {
      removeWidgetArtifacts();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const [isMinimized, setIsMinimized] = useState(() =>
    localStorage.getItem('tm_ai_helper_minimized') === 'true'
  );
  const [isScrollMinimized, setIsScrollMinimized] = useState(false);
  const isCurrentlyMinimized = isMinimized || isScrollMinimized;

  // Voice state
  const [isConnecting, setIsConnecting] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showPostCall, setShowPostCall] = useState(false);
  const [savedTranscript, setSavedTranscript] = useState<TranscriptEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  const conversation = useConversation({
    onConnect: () => {
      setShowTranscript(true);
      setShowPostCall(false);
      setTranscript([]);
    },
    onDisconnect: () => {
      const current = transcriptRef.current;
      if (current.length > 0) {
        setSavedTranscript([...current]);
        setShowPostCall(true);
        setShowTranscript(false);
      }
    },
    onMessage: (message: any) => {
      if (message.type === 'user_transcript') {
        const text = message.user_transcription_event?.user_transcript;
        if (text) setTranscript(prev => [...prev, { id: ++idRef.current, speaker: 'user', text }]);
      } else if (message.type === 'agent_response') {
        const text = message.agent_response_event?.agent_response;
        if (text) setTranscript(prev => [...prev, { id: ++idRef.current, speaker: 'trudy', text }]);
      } else if (message.type === 'agent_response_correction') {
        const corrected = message.agent_response_correction_event?.corrected_agent_response;
        if (corrected) {
          setTranscript(prev => {
            const updated = [...prev];
            for (let i = updated.length - 1; i >= 0; i--) {
              if (updated[i].speaker === 'trudy') { updated[i] = { ...updated[i], text: corrected }; break; }
            }
            return updated;
          });
        }
      }
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Connection Error', description: 'Failed to connect to Trudy.' });
    },
  });

  const isConnected = conversation.status === 'connected';

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [transcript]);

  const startConversation = useCallback(async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId: TRUDY_AGENT_ID, connectionType: 'webrtc' });
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        toast({ variant: 'destructive', title: 'Microphone Required', description: 'Allow mic access to talk with Trudy.' });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, isConnecting]);

  const stopConversation = useCallback(async () => { await conversation.endSession(); }, [conversation]);

  // Listen for programmatic start
  useEffect(() => {
    const handleStart = () => { if (!isConnecting && conversation.status === 'disconnected') startConversation(); };
    window.addEventListener('trudy-start', handleStart);
    window.addEventListener('openTrudyChat', handleStart);
    return () => {
      window.removeEventListener('trudy-start', handleStart);
      window.removeEventListener('openTrudyChat', handleStart);
    };
  }, [startConversation, isConnecting, conversation.status]);

  // Auto-minimize on mobile after delay / scroll
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

  // Helpers
  const formatText = (entries: TranscriptEntry[]) => entries.map(e => `${e.speaker === 'trudy' ? 'Trudy' : 'You'}: ${e.text}`).join('\n');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(formatText(savedTranscript));
    setCopied(true);
    toast({ title: 'Copied!' });
    setTimeout(() => setCopied(false), 2000);
  }, [savedTranscript]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([formatText(savedTranscript)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trudy-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [savedTranscript]);

  // Hide on portal pages
  const portalPrefixes = ['/agent/', '/admin/', '/manager/', '/kpi'];
  const isPortal = portalPrefixes.some(p => location.pathname.startsWith(p)) || location.pathname === '/kpi';
  if (isPortal) return null;

  const panelClasses = 'w-[300px] rounded-2xl border border-border bg-card shadow-xl overflow-hidden';

  const renderMessages = (entries: TranscriptEntry[]) => (
    <div ref={scrollRef} className="max-h-52 overflow-y-auto px-3 py-2 space-y-1.5">
      {entries.length === 0 && (
        <p className="text-[11px] text-muted-foreground text-center py-6 italic">Start speaking…</p>
      )}
      {entries.map((e) => (
        <div key={e.id} className={`flex ${e.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs leading-relaxed ${
            e.speaker === 'user' ? 'bg-foreground text-background' : 'bg-muted text-foreground'
          }`}>{e.text}</div>
        </div>
      ))}
    </div>
  );

  /* ─── Minimized: vertical tab on right edge ─── */
  if (isCurrentlyMinimized && !isConnected) {
    return (
      <button
        onClick={handleReopen}
        className="fixed bottom-28 right-0 z-50 sm:bottom-24
          px-2 py-4
          bg-card/95 backdrop-blur-md
          rounded-l-xl
          border border-r-0 border-border/60
          shadow-lg
          flex flex-col items-center gap-2.5
          transition-all duration-300
          hover:px-3 hover:shadow-xl hover:border-primary/40
          group"
        aria-label="Open Trudy"
      >
        <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <div className="p-1.5 rounded-full bg-foreground/10 border border-border/60 group-hover:border-primary/40 transition-colors">
          <Hand className="w-4 h-4 text-muted-foreground group-hover:text-foreground animate-wave" />
        </div>
      </button>
    );
  }

  return (
    <div className="tru-floating-truck-chat fixed bottom-20 right-3 z-[9999] flex flex-col items-end gap-2 sm:bottom-5 sm:right-5 md:bottom-20">
      {/* Post-call transcript */}
      {showPostCall && !isConnected && savedTranscript.length > 0 && (
        <div className={`${panelClasses} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
          <div className="border-b border-border">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                <Mic className="w-3.5 h-3.5 text-background" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight">Call Ended</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{savedTranscript.length} messages</p>
              </div>
              <button onClick={() => setShowPostCall(false)} className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          {renderMessages(savedTranscript)}
          <div className="flex gap-1.5 border-t border-border px-3 py-2">
            <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-muted px-2 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted/70 transition-colors">
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-foreground text-background px-2 py-1.5 text-[11px] font-medium hover:bg-foreground/90 transition-colors">
              <Download className="h-3 w-3" />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Live transcript */}
      {isConnected && showTranscript && (
        <div className={`${panelClasses} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
          <div className="border-b border-border">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="relative w-7 h-7 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                <Mic className="w-3.5 h-3.5 text-background" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-[1.5px] ring-card" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight">Trudy</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{conversation.isSpeaking ? 'Speaking…' : 'Listening…'}</p>
              </div>
              <button onClick={() => setShowTranscript(false)} className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="px-3 pb-2">
              <VoiceWaveform isActive={isConnected} isSpeaking={conversation.isSpeaking} />
            </div>
          </div>
          {renderMessages(transcript)}
        </div>
      )}

      {/* Minimized active call bar */}
      {isConnected && !showTranscript && (
        <button onClick={() => setShowTranscript(true)} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-md hover:bg-accent transition-colors text-xs font-medium text-foreground">
          <Mic className="h-3.5 w-3.5" />
          {conversation.isSpeaking ? 'Speaking…' : 'Listening…'}
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        </button>
      )}

      {/* Main pill button */}
      <div className="relative">
        <button
          onClick={isConnected ? stopConversation : startConversation}
          disabled={isConnecting}
          className={`
            pl-4 pr-5 py-3 rounded-full
            border border-border/60
            shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.15),0_0_0_1px_hsl(var(--primary)/0.08)]
            flex items-center gap-3
            transition-all duration-300 ease-out
            hover:shadow-[0_8px_32px_-4px_hsl(var(--primary)/0.25),0_0_0_1px_hsl(var(--primary)/0.15)]
            hover:scale-[1.03] hover:-translate-y-0.5
            hover:border-primary/40
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2
            ${isConnected
              ? 'bg-destructive text-destructive-foreground border-destructive/60'
              : isConnecting
              ? 'bg-muted text-muted-foreground'
              : 'bg-card/95 backdrop-blur-md'
            }
          `}
          aria-label={isConnected ? 'End call' : 'Talk to Trudy'}
        >
          {/* Icon circle */}
          <div className={`relative flex items-center justify-center w-9 h-9 rounded-full ${
            isConnected ? 'bg-destructive-foreground/20 border border-destructive-foreground/30' : 'bg-foreground border border-foreground/80'
          }`}>
            {isConnecting ? (
              <Loader2 className="w-4 h-4 text-background animate-spin" />
            ) : isConnected ? (
              <PhoneOff className="w-4 h-4 text-destructive-foreground" />
            ) : (
              <Mic className="w-4 h-4 text-background" />
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col items-start">
            <span className={`text-sm font-bold leading-tight ${isConnected ? 'text-destructive-foreground' : 'text-foreground'}`}>
              {isConnecting ? 'Connecting…' : isConnected ? 'End Call' : 'Talk to Trudy'}
            </span>
            {!isConnected && !isConnecting && (
              <span className="text-[11px] leading-tight text-primary font-semibold">AI Voice Assistant</span>
            )}
            {isConnected && (
              <span className="text-[11px] leading-tight text-destructive-foreground/70 font-semibold">
                {conversation.isSpeaking ? 'Speaking…' : 'Listening…'}
              </span>
            )}
          </div>
        </button>

        {/* Minimize / hand button - only when idle */}
        {!isConnected && !isConnecting && (
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
        )}
      </div>

    </div>
  );
}
