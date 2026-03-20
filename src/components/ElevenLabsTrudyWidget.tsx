import { useConversation } from '@elevenlabs/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { PhoneOff, Loader2, X, Mic, Copy, Download, Check, Video, ChevronUp, Phone, GripVertical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import trudyAvatar from '@/assets/trudy-avatar.png';
import VoiceWaveform from './VoiceWaveform';

const TRUDY_AGENT_ID = 'agent_0501khwa2t2pfj0s3echetmjhx4n';

interface TranscriptEntry {
  id: number;
  speaker: 'user' | 'trudy';
  text: string;
}

export default function ElevenLabsTrudyWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [optionsClosing, setOptionsClosing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showPostCall, setShowPostCall] = useState(false);
  const [savedTranscript, setSavedTranscript] = useState<TranscriptEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  // Draggable state
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragState = useRef<{ dragging: boolean; startX: number; startY: number; origX: number; origY: number }>({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const getDefaultPosition = useCallback(() => {
    return { x: window.innerWidth - 220, y: window.innerHeight - 100 };
  }, []);

  useEffect(() => {
    if (!position) setPosition(getDefaultPosition());
  }, [position, getDefaultPosition]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = position || getDefaultPosition();
    dragState.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position, getDefaultPosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 60, dragState.current.origX + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 60, dragState.current.origY + dy)),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragState.current.dragging = false;
  }, []);

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

  // Listen for programmatic start from other components
  useEffect(() => {
    const handleStart = () => { if (!isConnecting && conversation.status === 'disconnected') startConversation(); };
    window.addEventListener('trudy-start', handleStart);
    return () => window.removeEventListener('trudy-start', handleStart);
  }, [startConversation, isConnecting, conversation.status]);

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

  const isConnected = conversation.status === 'connected';

  const closeOptions = useCallback(() => {
    setOptionsClosing(true);
    setTimeout(() => { setShowOptions(false); setOptionsClosing(false); }, 250);
  }, []);

  const toggleOptions = useCallback(() => {
    if (showOptions) closeOptions();
    else setShowOptions(true);
  }, [showOptions, closeOptions]);

  // --- Shared UI pieces ---

  const panelClasses = 'w-[300px] rounded-2xl border border-border bg-card shadow-xl overflow-hidden';

  const renderMessages = (entries: TranscriptEntry[]) => (
    <div ref={scrollRef} className="max-h-52 overflow-y-auto px-3 py-2 space-y-1.5">
      {entries.length === 0 && (
        <p className="text-[11px] text-muted-foreground text-center py-6 italic">Start speaking…</p>
      )}
      {entries.map((e) => (
        <div key={e.id} className={`flex ${e.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs leading-relaxed ${
            e.speaker === 'user'
              ? 'bg-foreground text-background'
              : 'bg-muted text-foreground'
          }`}>{e.text}</div>
        </div>
      ))}
    </div>
  );

  const renderHeader = (title: string, subtitle: string, onClose: () => void, showWaveform = false) => (
    <div className="border-b border-border">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="relative flex-shrink-0">
          <img src={trudyAvatar} alt="Trudy" className="h-7 w-7 rounded-full object-cover border border-border" />
          {isConnected && (
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-[1.5px] ring-card" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground leading-tight">{title}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">{subtitle}</p>
        </div>
        <button onClick={onClose} className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Close">
          <X className="h-3 w-3" />
        </button>
      </div>
      {showWaveform && (
        <div className="px-3 pb-2">
          <VoiceWaveform isActive={isConnected} isSpeaking={conversation.isSpeaking} />
        </div>
      )}
    </div>
  );

  // Hide on portal pages
  const portalPrefixes = ['/agent/', '/admin/', '/manager/', '/kpi'];
  const isPortal = portalPrefixes.some(p => location.pathname.startsWith(p)) || location.pathname === '/kpi';
  if (isPortal) return null;

  const pos = position || getDefaultPosition();

  return (
    <div
      ref={containerRef}
      className="fixed z-[9999] flex flex-col items-end gap-2"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-100%, -100%)' }}
    >
      {/* Post-call */}
      {showPostCall && !isConnected && savedTranscript.length > 0 && (
        <div className={`${panelClasses} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
          {renderHeader('Call Ended', `${savedTranscript.length} messages`, () => setShowPostCall(false))}
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
          {renderHeader('Trudy', conversation.isSpeaking ? 'Speaking…' : 'Listening…', () => setShowTranscript(false), true)}
          {renderMessages(transcript)}
        </div>
      )}

      {/* Minimized bar */}
      {isConnected && !showTranscript && (
        <button onClick={() => setShowTranscript(true)} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-md hover:bg-accent transition-colors text-xs font-medium text-foreground">
          <img src={trudyAvatar} alt="" className="h-5 w-5 rounded-full object-cover" />
          {conversation.isSpeaking ? 'Speaking…' : 'Listening…'}
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        </button>
      )}

      {/* FAB row */}
      <div className="flex items-center gap-1.5">
        {/* Drag handle */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex items-center justify-center w-8 h-8 rounded-lg cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors touch-none select-none"
          aria-label="Drag to reposition"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {!isConnected && !isConnecting && (
          <button
            onClick={toggleOptions}
            className={`flex items-center justify-center w-10 h-10 rounded-lg border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm hover:bg-accent transition-all duration-200 ${showOptions && !optionsClosing ? 'rotate-180' : ''}`}
            aria-label="More options"
          >
            <ChevronUp className="h-4 w-4 text-muted-foreground rotate-180" />
          </button>
        )}
        <div className="group relative">
          <button
            onClick={isConnected ? stopConversation : startConversation}
            disabled={isConnecting}
            className={`relative flex items-center gap-2.5 rounded-xl shadow-lg transition-all duration-150 active:scale-[0.97] ${
              isConnected
                ? 'bg-destructive text-destructive-foreground px-5 py-3 shadow-destructive/30'
                : isConnecting
                ? 'bg-muted text-muted-foreground px-5 py-3'
                : 'bg-primary text-primary-foreground px-5 py-3 hover:bg-primary/90 shadow-primary/40 hover:shadow-primary/60 hover:shadow-xl'
            }`}
            aria-label={isConnected ? 'End call' : 'Talk to Trudy'}
          >
            {/* Pulse ring for idle state */}
            {!isConnected && !isConnecting && (
              <span className="absolute inset-0 rounded-xl animate-ping bg-primary/20 pointer-events-none" style={{ animationDuration: '2s' }} />
            )}
            {isConnecting ? (
              <><Loader2 className="h-[18px] w-[18px] animate-spin" /><span className="text-[13px] font-semibold tracking-tight">Connecting…</span></>
            ) : isConnected ? (
              <><PhoneOff className="h-[18px] w-[18px]" /><span className="text-[13px] font-semibold tracking-tight">End Call</span></>
            ) : (
              <>
                <img src={trudyAvatar} alt="" className="h-6 w-6 rounded-full object-cover border border-primary-foreground/30" />
                <span className="text-[13px] font-semibold tracking-tight">Talk to Trudy</span>
                <Mic className="h-4 w-4 opacity-70" />
              </>
            )}
          </button>
          {/* Hover tooltip */}
          {!isConnected && !isConnecting && (
            <div className="absolute bottom-full right-0 mb-2 w-48 rounded-lg border border-border/60 bg-card/90 backdrop-blur-sm shadow-md px-3 py-2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
              <p className="text-[11px] font-medium text-foreground leading-tight">AI Voice Assistant</p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">Instant quotes, tracking, scheduling — powered by voice AI.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown below */}
      {showOptions && !isConnected && !isConnecting && (
        <div className={`flex flex-col items-end gap-1 ${optionsClosing ? 'animate-out fade-out slide-out-to-bottom-2 duration-200 fill-mode-forwards' : ''}`}>
          <a
            href="tel:+16097277647"
            onClick={() => closeOptions()}
            className={`flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm px-3.5 py-2 hover:bg-accent transition-all ${
              optionsClosing ? '' : 'animate-in fade-in slide-in-from-top-2 duration-200'
            }`}
            style={optionsClosing ? {} : { animationDelay: '0ms', animationFillMode: 'both' }}
          >
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-foreground tracking-tight">(609) 727-7647</span>
          </a>
          <button
            onClick={() => { closeOptions(); navigate('/site/book'); }}
            className={`flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm px-3.5 py-2 hover:bg-accent transition-all ${
              optionsClosing ? '' : 'animate-in fade-in slide-in-from-top-2 duration-200'
            }`}
            style={optionsClosing ? {} : { animationDelay: '50ms', animationFillMode: 'both' }}
          >
            <Video className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-foreground tracking-tight">Video Consult</span>
          </button>
        </div>
      )}
    </div>
  );
}
