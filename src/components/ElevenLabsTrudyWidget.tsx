import { useConversation } from '@elevenlabs/react';
import { useState, useCallback } from 'react';
import { Phone, PhoneOff, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import trudyAvatar from '@/assets/trudy-avatar.png';

const TRUDY_AGENT_ID = 'agent_0501khwa2t2pfj0s3echetmjhx4n';

export default function ElevenLabsTrudyWidget() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to Trudy');
      setIsExpanded(true);
    },
    onDisconnect: () => {
      console.log('Disconnected from Trudy');
      setIsExpanded(false);
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
      {/* Status pill when connected */}
      {isExpanded && isConnected && (
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <img src={trudyAvatar} alt="Trudy" className="h-6 w-6 rounded-full object-cover" />
          <span className="text-sm font-medium text-foreground">
            {conversation.isSpeaking ? 'Trudy is speaking…' : 'Listening…'}
          </span>
          <span className={`h-2 w-2 rounded-full ${conversation.isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
        </div>
      )}

      {/* Main button */}
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

        {/* Pulse ring when connected */}
        {isConnected && (
          <span className="absolute inset-0 rounded-full border-2 border-destructive animate-ping opacity-30" />
        )}
      </button>
    </div>
  );
}
