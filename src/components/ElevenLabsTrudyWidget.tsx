import { useConversation } from '@elevenlabs/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Loader2, X, Mic, Copy, Download, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import trudyAvatar from '@/assets/trudy-avatar.png';

const TRUDY_AGENT_ID = 'agent_0501khwa2t2pfj0s3echetmjhx4n';

interface TranscriptEntry {
  id: number;
  speaker: 'user' | 'trudy';
  text: string;
}

export default function ElevenLabsTrudyWidget() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showPostCall, setShowPostCall] = useState(false);
  const [savedTranscript, setSavedTranscript] = useState<TranscriptEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [partialUser, setPartialUser] = useState('');
  const [partialAgent, setPartialAgent] = useState('');
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const postCallScrollRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to Trudy');
      setIsExpanded(true);
      setShowTranscript(true);
      setShowPostCall(false);
      setTranscript([]);
    },
    onDisconnect: () => {
      console.log('Disconnected from Trudy');
      setIsExpanded(false);
      setPartialUser('');
      setPartialAgent('');
      // Show post-call panel if there's transcript content
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
        if (text) {
          setPartialUser('');
          setTranscript(prev => [...prev, { id: ++idRef.current, speaker: 'user', text }]);
        }
      } else if (message.type === 'agent_response') {
        const text = message.agent_response_event?.agent_response;
        if (text) {
          setPartialAgent('');
          setTranscript(prev => [...prev, { id: ++idRef.current, speaker: 'trudy', text }]);
        }
      } else if (message.type === 'agent_response_correction') {
        const corrected = message.agent_response_correction_event?.corrected_agent_response;
        if (corrected) {
          setTranscript(prev => {
            const updated = [...prev];
            let lastTrudy = -1;
            for (let i = updated.length - 1; i >= 0; i--) {
              if (updated[i].speaker === 'trudy') { lastTrudy = i; break; }
            }
            if (lastTrudy >= 0) updated[lastTrudy] = { ...updated[lastTrudy], text: corrected };
            return updated;
          });
        }
      }
    },
    onError: (error) => {
      console.error('Trudy error:', error);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Failed to connect to Trudy. Please try again.',
      });
    },
  });

  // Keep ref in sync with transcript state
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [transcript, partialUser, partialAgent]);

  const startConversation = useCallback(async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: TRUDY_AGENT_ID,
        connectionType: 'webrtc',
      });
    } catch (err: any) {
      console.error('Failed to start conversation:', err);
      if (err.name === 'NotAllowedError') {
        toast({
          variant: 'destructive',
          title: 'Microphone Required',
          description: 'Please allow microphone access to talk with Trudy.',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, isConnecting]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const formatTranscriptText = useCallback((entries: TranscriptEntry[]) => {
    return entries.map(e => `${e.speaker === 'trudy' ? 'Trudy' : 'You'}: ${e.text}`).join('\n');
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(formatTranscriptText(savedTranscript));
    setCopied(true);
    toast({ title: 'Copied!', description: 'Transcript copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  }, [savedTranscript, formatTranscriptText]);

  const handleDownload = useCallback(() => {
    const text = formatTranscriptText(savedTranscript);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trudy-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: 'Transcript saved as text file.' });
  }, [savedTranscript, formatTranscriptText]);

  const isConnected = conversation.status === 'connected';

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Post-call transcript panel */}
      {showPostCall && !isConnected && savedTranscript.length > 0 && (
        <div className="w-80 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-muted/30">
            <img src={trudyAvatar} alt="Trudy" className="h-7 w-7 rounded-full object-cover ring-2 ring-border" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">Call Ended</p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {savedTranscript.length} message{savedTranscript.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setShowPostCall(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close transcript"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div ref={postCallScrollRef} className="max-h-48 overflow-y-auto px-4 py-3 space-y-2">
            {savedTranscript.map((entry) => (
              <div key={entry.id} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                {entry.speaker === 'trudy' && (
                  <img src={trudyAvatar} alt="" className="h-5 w-5 rounded-full object-cover mr-1.5 mt-1 flex-shrink-0" />
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  entry.speaker === 'user'
                    ? 'bg-foreground text-background rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
                  {entry.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t border-border px-4 py-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-muted hover:bg-muted/80 px-3 py-2 text-xs font-medium text-foreground transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 px-3 py-2 text-xs font-medium transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
        </div>
      )}
      {isConnected && showTranscript && (
        <div className="w-80 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-muted/30">
            <div className="relative">
              <img src={trudyAvatar} alt="Trudy" className="h-8 w-8 rounded-full object-cover ring-2 ring-border" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-foreground border-2 border-card" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">Trudy</p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {conversation.isSpeaking ? 'Speaking…' : 'Listening to you…'}
              </p>
            </div>
            <button
              onClick={() => setShowTranscript(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Minimize transcript"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Voice activity indicator */}
          <div className="flex items-center justify-center gap-1 py-2.5 border-b border-border/50">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-foreground/60 transition-all duration-150"
                style={{
                  height: conversation.isSpeaking
                    ? `${12 + Math.sin(Date.now() / 200 + i * 1.2) * 10}px`
                    : '4px',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
            <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              {conversation.isSpeaking ? 'Trudy' : 'You'}
            </span>
            {[...Array(5)].map((_, i) => (
              <span
                key={`r-${i}`}
                className="w-1 rounded-full bg-foreground/60 transition-all duration-150"
                style={{
                  height: !conversation.isSpeaking
                    ? `${12 + Math.sin(Date.now() / 200 + i * 1.2) * 10}px`
                    : '4px',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="max-h-52 overflow-y-auto px-4 py-3 space-y-2">
            {transcript.length === 0 && !partialUser && !partialAgent && (
              <p className="text-[11px] text-muted-foreground text-center py-6">
                Start speaking — your conversation will appear here
              </p>
            )}
            {transcript.map((entry) => (
              <div key={entry.id} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                {entry.speaker === 'trudy' && (
                  <img src={trudyAvatar} alt="" className="h-5 w-5 rounded-full object-cover mr-1.5 mt-1 flex-shrink-0" />
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  entry.speaker === 'user'
                    ? 'bg-foreground text-background rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
                  {entry.text}
                </div>
              </div>
            ))}
            {partialAgent && (
              <div className="flex justify-start">
                <img src={trudyAvatar} alt="" className="h-5 w-5 rounded-full object-cover mr-1.5 mt-1 flex-shrink-0" />
                <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground italic">
                  {partialAgent}
                </div>
              </div>
            )}
            {partialUser && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-foreground/70 px-3 py-2 text-xs leading-relaxed text-background italic">
                  {partialUser}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active call bar (when transcript minimized) */}
      {isConnected && !showTranscript && (
        <button
          onClick={() => setShowTranscript(true)}
          className="flex items-center gap-2 rounded-full border border-border bg-card/95 backdrop-blur-xl px-4 py-2 shadow-lg hover:bg-accent transition-colors animate-in fade-in slide-in-from-bottom-2"
        >
          <img src={trudyAvatar} alt="Trudy" className="h-6 w-6 rounded-full object-cover" />
          <span className="text-xs font-medium text-foreground">
            {conversation.isSpeaking ? 'Trudy is speaking…' : 'Listening…'}
          </span>
          <span className="flex gap-0.5">
            {[...Array(3)].map((_, i) => (
              <span key={i} className="w-0.5 h-3 rounded-full bg-foreground/50 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
        </button>
      )}

      {/* Main FAB */}
      <div className="flex items-center gap-2.5">
        {/* Label pill — idle state only */}
        {!isConnected && !isConnecting && (
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/95 backdrop-blur-xl pl-2 pr-3.5 py-1.5 shadow-lg animate-in fade-in slide-in-from-right-3 cursor-pointer hover:bg-accent transition-colors" onClick={startConversation}>
            <img src={trudyAvatar} alt="Trudy" className="h-7 w-7 rounded-full object-cover" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground leading-tight">Talk to Trudy</span>
              <span className="text-[10px] text-muted-foreground leading-tight">AI voice assistant</span>
            </div>
          </div>
        )}

        {/* Button */}
        <button
          onClick={isConnected ? stopConversation : startConversation}
          disabled={isConnecting}
          className={`group relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
            isConnected
              ? 'bg-destructive text-destructive-foreground'
              : isConnecting
                ? 'bg-muted text-muted-foreground'
                : 'bg-foreground text-background'
          }`}
          aria-label={isConnected ? 'End call with Trudy' : 'Talk to Trudy'}
        >
          {isConnecting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isConnected ? (
            <PhoneOff className="h-5 w-5" />
          ) : (
            <Mic className="h-6 w-6" />
          )}

          {/* Pulse rings when connected */}
          {isConnected && (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-destructive/40 animate-ping" />
              <span className="absolute -inset-1 rounded-full border border-destructive/20 animate-pulse" />
            </>
          )}

          {/* Subtle ring when idle */}
          {!isConnected && !isConnecting && (
            <span className="absolute -inset-1 rounded-full border border-foreground/10 animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
}
