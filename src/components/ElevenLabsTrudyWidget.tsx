import { useConversation } from '@elevenlabs/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { PhoneOff, Loader2, X, Mic, Copy, Download, Check, Video, Phone } from 'lucide-react';
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
  const [showTranscript, setShowTranscript] = useState(false);
  const [showPostCall, setShowPostCall] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [savedTranscript, setSavedTranscript] = useState<TranscriptEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  // Drag state
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const dragRef = useRef<{ active: boolean; sx: number; sy: number; ox: number; oy: number }>({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 });

  useEffect(() => {
    if (!initialized) {
      setPos({ x: window.innerWidth - 24, y: window.innerHeight - 24 });
      setInitialized(true);
    }
  }, [initialized]);

  const onDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = { active: true, sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    setPos({
      x: Math.max(80, Math.min(window.innerWidth - 24, dragRef.current.ox + (e.clientX - dragRef.current.sx))),
      y: Math.max(40, Math.min(window.innerHeight - 24, dragRef.current.oy + (e.clientY - dragRef.current.sy))),
    });
  }, []);

  const onDragEnd = useCallback(() => { dragRef.current.active = false; }, []);

  const conversation = useConversation({
    onConnect: () => { setShowTranscript(true); setShowPostCall(false); setTranscript([]); },
    onDisconnect: () => {
      const current = transcriptRef.current;
      if (current.length > 0) { setSavedTranscript([...current]); setShowPostCall(true); setShowTranscript(false); }
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
    onError: () => { toast({ variant: 'destructive', title: 'Connection Error', description: 'Failed to connect to Trudy.' }); },
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
      if (err.name === 'NotAllowedError') toast({ variant: 'destructive', title: 'Microphone Required', description: 'Allow mic access to talk with Trudy.' });
    } finally { setIsConnecting(false); }
  }, [conversation, isConnecting]);

  const stopConversation = useCallback(async () => { await conversation.endSession(); }, [conversation]);

  useEffect(() => {
    const handleStart = () => { if (!isConnecting && conversation.status === 'disconnected') startConversation(); };
    window.addEventListener('trudy-start', handleStart);
    return () => window.removeEventListener('trudy-start', handleStart);
  }, [startConversation, isConnecting, conversation.status]);

  const formatText = (entries: TranscriptEntry[]) => entries.map(e => `${e.speaker === 'trudy' ? 'Trudy' : 'You'}: ${e.text}`).join('\n');
  const handleCopy = useCallback(() => { navigator.clipboard.writeText(formatText(savedTranscript)); setCopied(true); toast({ title: 'Copied!' }); setTimeout(() => setCopied(false), 2000); }, [savedTranscript]);
  const handleDownload = useCallback(() => {
    const blob = new Blob([formatText(savedTranscript)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `trudy-${new Date().toISOString().slice(0, 10)}.txt`; a.click(); URL.revokeObjectURL(url);
  }, [savedTranscript]);

  const isConnected = conversation.status === 'connected';

  const portalPrefixes = ['/agent/', '/admin/', '/manager/', '/kpi'];
  const isPortal = portalPrefixes.some(p => location.pathname.startsWith(p)) || location.pathname === '/kpi';
  if (isPortal) return null;

  const panelClasses = 'w-[300px] rounded-2xl border border-border bg-card shadow-xl overflow-hidden';

  const renderMessages = (entries: TranscriptEntry[]) => (
    <div ref={scrollRef} className="max-h-52 overflow-y-auto px-3 py-2 space-y-1.5">
      {entries.length === 0 && <p className="text-[11px] text-muted-foreground text-center py-6 italic">Start speaking…</p>}
      {entries.map((e) => (
        <div key={e.id} className={`flex ${e.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs leading-relaxed ${e.speaker === 'user' ? 'bg-foreground text-background' : 'bg-muted text-foreground'}`}>{e.text}</div>
        </div>
      ))}
    </div>
  );

  const renderHeader = (title: string, subtitle: string, onClose: () => void, showWaveform = false) => (
    <div className="border-b border-border">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="relative flex-shrink-0">
          <img src={trudyAvatar} alt="Trudy" className="h-7 w-7 rounded-full object-cover border border-border" />
          {isConnected && <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-[1.5px] ring-card" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground leading-tight">{title}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">{subtitle}</p>
        </div>
        <button onClick={onClose} className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-3 w-3" /></button>
      </div>
      {showWaveform && <div className="px-3 pb-2"><VoiceWaveform isActive={isConnected} isSpeaking={conversation.isSpeaking} /></div>}
    </div>
  );

  return (
    <div
      className="fixed z-[9999] flex flex-col items-end gap-2"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-100%, -100%)' }}
    >
      {/* Transcript panels */}
      {showPostCall && !isConnected && savedTranscript.length > 0 && (
        <div className={`${panelClasses} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
          {renderHeader('Call Ended', `${savedTranscript.length} messages`, () => setShowPostCall(false))}
          {renderMessages(savedTranscript)}
          <div className="flex gap-1.5 border-t border-border px-3 py-2">
            <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-muted px-2 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted/70 transition-colors">
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />} {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-foreground text-background px-2 py-1.5 text-[11px] font-medium hover:bg-foreground/90 transition-colors">
              <Download className="h-3 w-3" /> Save
            </button>
          </div>
        </div>
      )}

      {isConnected && showTranscript && (
        <div className={`${panelClasses} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
          {renderHeader('Trudy', conversation.isSpeaking ? 'Speaking…' : 'Listening…', () => setShowTranscript(false), true)}
          {renderMessages(transcript)}
        </div>
      )}

      {isConnected && !showTranscript && (
        <button onClick={() => setShowTranscript(true)} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-md hover:bg-accent transition-colors text-xs font-medium text-foreground">
          <img src={trudyAvatar} alt="" className="h-5 w-5 rounded-full object-cover" />
          {conversation.isSpeaking ? 'Speaking…' : 'Listening…'}
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        </button>
      )}

      {/* Options popover */}
      {showOptions && !isConnected && !isConnecting && (
        <div className="flex flex-col items-end gap-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <a href="tel:+16097277647" onClick={() => setShowOptions(false)}
            className="flex items-center gap-2 rounded-full bg-card border border-border shadow-md px-3.5 py-2 hover:bg-accent transition-colors">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-foreground">(609) 727-7647</span>
          </a>
          <button onClick={() => { setShowOptions(false); navigate('/site/book'); }}
            className="flex items-center gap-2 rounded-full bg-card border border-border shadow-md px-3.5 py-2 hover:bg-accent transition-colors">
            <Video className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-foreground">Video Consult</span>
          </button>
        </div>
      )}

      {/* Main floating pill */}
      <div
        className="relative group flex items-center gap-2 select-none"
        style={{ touchAction: 'none' }}
      >
        <div
          className={`relative flex items-center rounded-2xl shadow-2xl transition-all duration-200 ${
            isConnected
              ? 'bg-destructive shadow-destructive/40'
              : isConnecting
              ? 'bg-muted shadow-md'
              : 'bg-primary shadow-primary/40 hover:shadow-primary/60 hover:shadow-2xl hover:scale-[1.02]'
          }`}
        >
          {/* Drag handle area */}
          <div
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            className="flex items-center pl-1.5 py-1.5 cursor-grab active:cursor-grabbing"
          >
            <div className="relative">
              <img src={trudyAvatar} alt="Trudy" className="h-11 w-11 rounded-xl object-cover ring-2 ring-background/20" />
              {isConnected && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive-foreground opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive-foreground" />
                </span>
              )}
            </div>
          </div>

          {/* Text + action */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isConnected) stopConversation();
              else if (!isConnecting) startConversation();
            }}
            disabled={isConnecting}
            className="flex items-center gap-2 pl-2.5 pr-5 py-3.5 rounded-r-2xl"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm font-bold text-muted-foreground">Connecting…</span>
              </>
            ) : isConnected ? (
              <>
                <PhoneOff className="h-4 w-4 text-destructive-foreground" />
                <span className="text-sm font-bold text-destructive-foreground">End Call</span>
              </>
            ) : (
              <>
                <Mic className="h-[18px] w-[18px] text-primary-foreground" />
                <span className="text-sm font-bold text-primary-foreground whitespace-nowrap">Talk to Trudy</span>
              </>
            )}
          </button>
        </div>

        {/* Extra actions toggle */}
        {!isConnected && !isConnecting && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowOptions(v => !v); }}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-card border border-border shadow-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="More contact options"
          >
            <Phone className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Hover tooltip */}
        {!isConnected && !isConnecting && (
          <div className="absolute bottom-full right-0 mb-3 w-44 rounded-xl bg-card border border-border shadow-lg px-3 py-2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-[11px] font-semibold text-foreground leading-tight">AI Voice Assistant</p>
            <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">Quotes, tracking & scheduling. Drag to move.</p>
          </div>
        )}
      </div>
    </div>
  );
}
