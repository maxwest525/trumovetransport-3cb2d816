import { useConversation } from '@elevenlabs/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { PhoneOff, Loader2, X, Mic, Copy, Download, Check, Video, ChevronUp, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import trudyAvatar from '@/assets/trudy-avatar.png';

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
    setTimeout(() => {
      setShowOptions(false);
      setOptionsClosing(false);
    }, 250);
  }, []);

  const toggleOptions = useCallback(() => {
    if (showOptions) closeOptions();
    else setShowOptions(true);
  }, [showOptions, closeOptions]);

  // Glass panel base classes
  const glassPanel = 'rounded-2xl border border-primary/20 bg-background/80 backdrop-blur-2xl shadow-[0_8px_40px_hsl(var(--primary)/0.08),0_2px_12px_hsl(var(--foreground)/0.06)]';

  const renderMessages = (entries: TranscriptEntry[]) => (
    <div ref={scrollRef} className="max-h-52 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin">
      {entries.length === 0 && (
        <p className="text-[11px] text-muted-foreground text-center py-6 italic">Start speaking…</p>
      )}
      {entries.map((e) => (
        <div key={e.id} className={`flex ${e.speaker === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
          <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed transition-all ${
            e.speaker === 'user'
              ? 'bg-primary text-primary-foreground shadow-[0_2px_8px_hsl(var(--primary)/0.25)]'
              : 'bg-muted/60 text-foreground border border-border/50'
          }`}>{e.text}</div>
        </div>
      ))}
    </div>
  );

  const renderHeader = (title: string, subtitle: string, onClose: () => void) => (
    <div className="flex items-center gap-3 border-b border-primary/10 px-4 py-3">
      <div className="relative">
        <img src={trudyAvatar} alt="Trudy" className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.2)]" />
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight tracking-tight">{title}</p>
        <p className="text-[10px] text-primary font-medium leading-tight">{subtitle}</p>
      </div>
      <button onClick={onClose} className="h-7 w-7 rounded-full flex items-center justify-center bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200" aria-label="Close">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  // Hide on portal pages
  const portalPrefixes = ['/agent/', '/admin/', '/manager/', '/kpi'];
  const isPortal = portalPrefixes.some(p => location.pathname.startsWith(p)) || location.pathname === '/kpi';
  if (isPortal) return null;

  return (
    <div className="fixed bottom-20 right-5 z-[9999] flex flex-col items-end gap-2.5">
      {/* Post-call panel */}
      {showPostCall && !isConnected && savedTranscript.length > 0 && (
        <div className={`w-80 ${glassPanel} overflow-hidden animate-scale-in`}>
          {renderHeader('Call Ended', `${savedTranscript.length} messages`, () => setShowPostCall(false))}
          {renderMessages(savedTranscript)}
          <div className="flex gap-2 border-t border-primary/10 px-4 py-3">
            <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-muted/60 border border-border/50 px-3 py-2 text-[11px] font-semibold text-foreground hover:bg-muted transition-all duration-200">
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-3 py-2 text-[11px] font-semibold hover:brightness-110 shadow-[0_2px_10px_hsl(var(--primary)/0.3)] transition-all duration-200">
              <Download className="h-3 w-3" />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Live transcript panel */}
      {isConnected && showTranscript && (
        <div className={`w-80 ${glassPanel} overflow-hidden animate-scale-in`}>
          {renderHeader('Trudy', conversation.isSpeaking ? 'Speaking…' : 'Listening…', () => setShowTranscript(false))}
          {renderMessages(transcript)}
          {/* Subtle live indicator bar */}
          <div className="h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-pulse" />
        </div>
      )}

      {/* Minimized bar when connected */}
      {isConnected && !showTranscript && (
        <button
          onClick={() => setShowTranscript(true)}
          className={`flex items-center gap-2.5 rounded-full ${glassPanel} px-4 py-2 hover:border-primary/40 transition-all duration-300 group`}
        >
          <div className="relative">
            <img src={trudyAvatar} alt="" className="h-6 w-6 rounded-full object-cover ring-2 ring-primary/30" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-1 ring-background" />
          </div>
          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
            {conversation.isSpeaking ? 'Speaking…' : 'Listening…'}
          </span>
        </button>
      )}

      {/* Options popup */}
      {showOptions && !isConnected && !isConnecting && (
        <div className={`flex flex-col items-end gap-2 ${optionsClosing ? 'animate-fade-out' : ''}`}>
          <a
            href="tel:+16097277647"
            onClick={() => closeOptions()}
            className={`flex items-center gap-2.5 rounded-full ${glassPanel} border-emerald-500/20 px-4 py-2.5 hover:border-emerald-500/40 hover:shadow-[0_4px_20px_hsl(142_71%_45%/0.12)] transition-all duration-300 ${
              optionsClosing ? '' : 'animate-scale-in'
            }`}
            style={optionsClosing ? {} : { animationDelay: '50ms', animationFillMode: 'both' }}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_2px_8px_hsl(142_71%_45%/0.3)]">
              <Phone className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-foreground">Call Us</span>
          </a>
          <button
            onClick={() => { closeOptions(); navigate('/book'); }}
            className={`flex items-center gap-2.5 rounded-full ${glassPanel} border-blue-500/20 px-4 py-2.5 hover:border-blue-500/40 hover:shadow-[0_4px_20px_hsl(217_91%_60%/0.12)] transition-all duration-300 ${
              optionsClosing ? '' : 'animate-scale-in'
            }`}
            style={optionsClosing ? {} : { animationDelay: '0ms', animationFillMode: 'both' }}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-[0_2px_8px_hsl(217_91%_60%/0.3)]">
              <Video className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-foreground">Video Consult</span>
          </button>
        </div>
      )}

      {/* FAB row */}
      <div className="flex items-center gap-2">
        {!isConnected && !isConnecting && (
          <button
            onClick={toggleOptions}
            className={`flex items-center justify-center w-10 h-10 rounded-full border border-primary/20 bg-background/80 backdrop-blur-xl shadow-[0_4px_16px_hsl(var(--primary)/0.08)] hover:border-primary/40 hover:shadow-[0_4px_20px_hsl(var(--primary)/0.15)] transition-all duration-300 ${showOptions && !optionsClosing ? 'rotate-180' : ''}`}
            aria-label="More options"
          >
            <ChevronUp className="h-4 w-4 text-primary" />
          </button>
        )}
        <button
          onClick={isConnected ? stopConversation : startConversation}
          disabled={isConnecting}
          className={`group flex items-center gap-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
            isConnected
              ? 'bg-destructive text-destructive-foreground px-5 py-3 shadow-[0_4px_20px_hsl(var(--destructive)/0.3)]'
              : isConnecting
              ? 'bg-muted text-muted-foreground px-5 py-3'
              : 'bg-primary text-primary-foreground pl-3 pr-5 py-2.5 shadow-[0_4px_24px_hsl(var(--primary)/0.35)] hover:shadow-[0_6px_32px_hsl(var(--primary)/0.45)]'
          }`}
          aria-label={isConnected ? 'End call' : 'Talk to Trudy'}
        >
          {isConnecting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs font-semibold">Connecting…</span></>
          ) : isConnected ? (
            <><PhoneOff className="h-4 w-4" /><span className="text-xs font-semibold">End Call</span></>
          ) : (
            <>
              <div className="relative">
                <img src={trudyAvatar} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-primary-foreground/30" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary-foreground ring-1 ring-primary" />
              </div>
              <span className="text-xs font-semibold">Talk to Trudy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
