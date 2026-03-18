import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, Bot, User, RefreshCw, Loader2 } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'trudy';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'trudy',
    content: "Hi! I'm Trudy, your AI move coordinator. I can help with instant quotes, shipment tracking, scheduling, carrier vetting, and more. What can I help you with today?",
    timestamp: new Date(),
  },
];

const QUICK_PROMPTS = [
  'Get a moving quote',
  'Track my shipment',
  'Schedule a move',
  'Carrier safety info',
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-7 h-7 rounded-full bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center flex-shrink-0">
        <Bot className="w-3.5 h-3.5 text-foreground/60" />
      </div>
      <div className="bg-muted/60 border border-border/60 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-1.5 h-1.5 rounded-full bg-foreground/30"
              style={{
                animation: `trudy-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const isTrudy = message.role === 'trudy';
  return (
    <div
      className={`flex items-end gap-2.5 ${isTrudy ? '' : 'flex-row-reverse'} ${
        isLast ? 'animate-in fade-in slide-in-from-bottom-3 duration-300' : ''
      }`}
    >
      {isTrudy ? (
        <div className="w-7 h-7 rounded-full bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-3.5 h-3.5 text-foreground/60" />
        </div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0">
          <User className="w-3.5 h-3.5" />
        </div>
      )}
      <div
        className={`max-w-[75%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
          isTrudy
            ? 'bg-muted/60 border border-border/60 text-foreground rounded-2xl rounded-bl-md'
            : 'bg-foreground text-background rounded-2xl rounded-br-md shadow-[0_2px_8px_-2px_hsl(var(--foreground)/0.25)]'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function TrudyChatBox() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingResponseRef = useRef('');

  const conversation = useConversation({
    textOnly: true,
    onConnect: () => {
      console.log('ElevenLabs conversation connected');
      setConnectionState('connected');
    },
    onDisconnect: () => {
      console.log('ElevenLabs conversation disconnected');
      if (connectionState === 'connected') {
        setConnectionState('idle');
      }
    },
    onError: (error) => {
      console.error('ElevenLabs conversation error:', error);
      setConnectionState('error');
      setIsTyping(false);
    },
    onMessage: (message: any) => {
      console.log('ElevenLabs message:', message);
      
      if (message.type === 'agent_response') {
        const agentText = message.agent_response_event?.agent_response;
        if (agentText) {
          pendingResponseRef.current = agentText;
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'trudy',
            content: agentText,
            timestamp: new Date(),
          }]);
          setIsTyping(false);
        }
      } else if (message.type === 'agent_response_correction') {
        const corrected = message.agent_response_correction_event?.corrected_agent_response;
        if (corrected) {
          setMessages(prev => {
            const updated = [...prev];
            for (let i = updated.length - 1; i >= 0; i--) {
              if (updated[i].role === 'trudy') {
                updated[i] = { ...updated[i], content: corrected };
                break;
              }
            }
            return updated;
          });
        }
      }
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const connectToAgent = useCallback(async () => {
    setConnectionState('connecting');
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-conversation-token');
      
      if (error || !data?.signed_url) {
        console.error('Failed to get signed URL:', error);
        const errorMsg = error?.message || "";
        if (errorMsg.includes("401") || errorMsg.includes("missing_permissions")) {
          console.warn("ElevenLabs API key missing permissions — showing graceful fallback");
        }
        setConnectionState('error');
        return;
      }

      await conversation.startSession({
        signedUrl: data.signed_url,
      });
    } catch (err) {
      console.error('Failed to connect:', err);
      setConnectionState('error');
    }
  }, [conversation]);

  // Auto-connect on mount
  useEffect(() => {
    if (connectionState === 'idle') {
      connectToAgent();
    }
    return () => {
      if (conversation.status === 'connected') {
        conversation.endSession();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping || connectionState !== 'connected') return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    conversation.sendUserMessage(text);
  }, [input, isTyping, connectionState, conversation]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    if (isTyping || connectionState !== 'connected') return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    conversation.sendUserMessage(prompt);
  }, [isTyping, connectionState, conversation]);

  const statusBadge = () => {
    switch (connectionState) {
      case 'connecting':
        return (
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            Connecting
          </span>
        );
      case 'connected':
        return (
          <span className="flex items-center gap-1 text-[9px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        );
      case 'error':
        return (
          <button
            onClick={connectToAgent}
            className="flex items-center gap-1 text-[9px] text-destructive bg-destructive/10 hover:bg-destructive/20 px-2 py-0.5 rounded-full font-medium transition-colors"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            Retry
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl border border-foreground/[0.08] bg-card/80 backdrop-blur-sm shadow-[0_8px_32px_-8px_hsl(var(--foreground)/0.1),0_16px_48px_-12px_hsl(var(--foreground)/0.06)] overflow-hidden">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-foreground/70" />
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
                  connectionState === 'connected' ? 'bg-emerald-500' : 'bg-foreground/30'
                }`} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground leading-none">Trudy</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  AI Move Coordinator · {connectionState === 'connected' ? 'Online' : connectionState === 'connecting' ? 'Connecting…' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {statusBadge()}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="px-4 py-4 space-y-4 overflow-y-auto"
          style={{ height: 340, scrollBehavior: 'smooth' }}
        >
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id} message={msg} isLast={i === messages.length - 1} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && !isTyping && connectionState === 'connected' && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 animate-in fade-in duration-500">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleQuickPrompt(prompt)}
                className="text-[11px] font-medium text-foreground/70 bg-muted/60 hover:bg-foreground hover:text-background border border-border/60 hover:border-foreground px-2.5 py-1.5 rounded-full transition-all duration-200 hover:shadow-[0_2px_8px_-2px_hsl(var(--foreground)/0.2)]"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-3 py-2.5 border-t border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={connectionState === 'connected' ? 'Ask Trudy anything…' : 'Connecting to Trudy…'}
              disabled={isTyping || connectionState !== 'connected'}
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || connectionState !== 'connected'}
              className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-30 hover:opacity-80 active:scale-90 transition-all duration-150"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-[9px] text-muted-foreground/50 mt-2">
        Powered by TruMove AI · Responses are AI-generated
      </p>
    </div>
  );
}
