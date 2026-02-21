import { useConversation } from '@elevenlabs/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Loader2 } from 'lucide-react';
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
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [partialUser, setPartialUser] = useState('');
  const [partialAgent, setPartialAgent] = useState('');
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to Trudy');
      setIsExpanded(true);
      setTranscript([]);
    },
    onDisconnect: () => {
      console.log('Disconnected from Trudy');
      setIsExpanded(false);
      setPartialUser('');
      setPartialAgent('');
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

  const isConnected = conversation.status === 'connected';

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Transcript panel when connected */}
      {isExpanded && isConnected && (
        <div className="w-80 rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <img src={trudyAvatar} alt="Trudy" className="h-7 w-7 rounded-full object-cover" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-foreground">Trudy</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {conversation.isSpeaking ? 'Speaking…' : 'Listening…'}
              </span>
            </div>
            <span className={`h-2 w-2 rounded-full ${conversation.isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
          </div>

          {/* Transcript messages */}
          <div ref={scrollRef} className="max-h-64 overflow-y-auto px-4 py-3 space-y-2.5 scrollbar-thin">
            {transcript.length === 0 && !partialUser && !partialAgent && (
              <p className="text-xs text-muted-foreground text-center py-4">Conversation will appear here…</p>
            )}
            {transcript.map((entry) => (
              <div key={entry.id} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  entry.speaker === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}>
                  {entry.text}
                </div>
              </div>
            ))}
            {partialAgent && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground italic">
                  {partialAgent}
                </div>
              </div>
            )}
            {partialUser && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-xl bg-primary/70 px-3 py-2 text-xs leading-relaxed text-primary-foreground italic">
                  {partialUser}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main button with label */}
      <div className="flex items-center gap-2">
        {!isConnected && !isConnecting && (
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-lg animate-in fade-in slide-in-from-right-2">
            Talk to Trudy
          </span>
        )}
        <button
          onClick={isConnected ? stopConversation : startConversation}
          disabled={isConnecting}
          className={`group relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
            isConnected
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-primary text-primary-foreground'
          }`}
          aria-label={isConnected ? 'End call with Trudy' : 'Talk to Trudy'}
        >
          {isConnecting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isConnected ? (
            <PhoneOff className="h-6 w-6" />
          ) : (
            <Phone className="h-6 w-6" />
          )}
          {isConnected && (
            <span className="absolute inset-0 rounded-full border-2 border-destructive animate-ping opacity-30" />
          )}
        </button>
      </div>
    </div>
  );
}
