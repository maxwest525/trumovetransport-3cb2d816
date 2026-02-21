import { useConversation } from '@elevenlabs/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { PhoneOff, Loader2, X, Mic, Copy, Download, Check } from 'lucide-react';
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

  // Shared message list renderer
  const renderMessages = (entries: TranscriptEntry[]) => (
    <div ref={scrollRef} className="max-h-48 overflow-y-auto px-3 py-2 space-y-1.5">
      {entries.length === 0 && (
        <p className="text-[11px] text-muted-foreground text-center py-4">Start speaking…</p>
      )}
      {entries.map((e) => (
        <div key={e.id} className={`flex ${e.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-xl px-2.5 py-1.5 text-xs leading-relaxed ${
            e.speaker === 'user' ? 'bg-foreground text-background' : 'bg-muted text-foreground'
          }`}>{e.text}</div>
        </div>
      ))}
    </div>
  );

  // Shared header
  const renderHeader = (title: string, subtitle: string, onClose: () => void) => (
    <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
      <img src={trudyAvatar} alt="Trudy" className="h-6 w-6 rounded-full object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground leading-tight">{title}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">{subtitle}</p>
      </div>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
      {/* Post-call */}
      {showPostCall && !isConnected && savedTranscript.length > 0 && (
        <div className="w-72 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          {renderHeader('Call Ended', `${savedTranscript.length} messages`, () => setShowPostCall(false))}
          {renderMessages(savedTranscript)}
          <div className="flex gap-1.5 border-t border-border px-3 py-2">
            <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-muted px-2 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted/70 transition-colors">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
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
        <div className="w-72 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          {renderHeader('Trudy', conversation.isSpeaking ? 'Speaking…' : 'Listening…', () => setShowTranscript(false))}
          {renderMessages(transcript)}
        </div>
      )}

      {/* Minimized bar */}
      {isConnected && !showTranscript && (
        <button onClick={() => setShowTranscript(true)} className="flex items-center gap-2 rounded-full border border-border bg-card/95 backdrop-blur-xl px-3 py-1.5 shadow-md hover:bg-accent transition-colors text-xs font-medium text-foreground">
          <img src={trudyAvatar} alt="" className="h-5 w-5 rounded-full object-cover" />
          {conversation.isSpeaking ? 'Speaking…' : 'Listening…'}
        </button>
      )}

      {/* FAB */}
      <button
        onClick={isConnected ? stopConversation : startConversation}
        disabled={isConnecting}
        className={`flex items-center gap-2 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 ${
          isConnected
            ? 'bg-destructive text-destructive-foreground px-4 py-2.5'
            : isConnecting
            ? 'bg-muted text-muted-foreground px-4 py-2.5'
            : 'bg-foreground text-background pl-2.5 pr-4 py-2'
        }`}
        aria-label={isConnected ? 'End call' : 'Talk to Trudy'}
      >
        {isConnecting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs font-medium">Connecting…</span></>
        ) : isConnected ? (
          <><PhoneOff className="h-4 w-4" /><span className="text-xs font-medium">End Call</span></>
        ) : (
          <><Mic className="h-4 w-4" /><span className="text-xs font-medium">Talk to Trudy</span></>
        )}
      </button>
    </div>
  );
}
