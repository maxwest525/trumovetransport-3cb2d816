import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, Bot, User, Mic, MicOff } from 'lucide-react';

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
      {/* Avatar */}
      {isTrudy ? (
        <div className="w-7 h-7 rounded-full bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-3.5 h-3.5 text-foreground/60" />
        </div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0">
          <User className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-3.5 py-2.5 text-[12px] leading-relaxed ${
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

interface TrudyChatBoxProps {
  onSwitchToLive?: () => void;
}

export default function TrudyChatBox({ onSwitchToLive }: TrudyChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const simulateResponse = useCallback((userMsg: string) => {
    setIsTyping(true);
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      let response = "I can help with that! Let me pull up the details for you. In the meantime, you can also call us at (609) 727-7647 for immediate assistance.";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('quote') || lower.includes('estimate') || lower.includes('price')) {
        response = "I'd love to get you a quote! I'll need your origin address, destination, and approximate move date. You can also try our AI Move Estimator — just snap photos of your rooms and get an instant estimate.";
      } else if (lower.includes('track') || lower.includes('shipment') || lower.includes('where')) {
        response = "I can pull up your shipment right away! Please share your tracking number or the name on the order. Our live tracking shows real-time GPS, ETA, weather conditions, and weigh station alerts.";
      } else if (lower.includes('schedule') || lower.includes('book') || lower.includes('reschedule')) {
        response = "Let's get your move scheduled! I have availability this week and next. What dates work best for you? We recommend booking at least 2 weeks in advance for the best rates.";
      } else if (lower.includes('carrier') || lower.includes('safety') || lower.includes('vet')) {
        response = "Great question! Every carrier in our network is FMCSA-verified. We check safety ratings, complaint history, insurance coverage, and operating authority. I can show you the safety report for any carrier.";
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'trudy',
        content: response,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, delay);
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    simulateResponse(text);
  }, [input, isTyping, simulateResponse]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    if (isTyping) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    simulateResponse(prompt);
  }, [isTyping, simulateResponse]);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Chat container */}
      <div className="rounded-2xl border border-foreground/[0.08] bg-card/80 backdrop-blur-sm shadow-[0_8px_32px_-8px_hsl(var(--foreground)/0.1),0_16px_48px_-12px_hsl(var(--foreground)/0.06)] overflow-hidden">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-foreground/70" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-foreground/70 border-2 border-card" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-foreground leading-none">Trudy</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">AI Move Coordinator · Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {onSwitchToLive && (
                <button
                  onClick={onSwitchToLive}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-foreground/80 hover:text-foreground bg-muted/60 hover:bg-foreground hover:text-background border border-border/60 hover:border-foreground px-2.5 py-1 rounded-full transition-all duration-200 hover:shadow-[0_2px_8px_-2px_hsl(var(--foreground)/0.2)]"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Talk to Real Trudy
                </button>
              )}
              <span className="text-[9px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                Demo
              </span>
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
        {messages.length <= 1 && !isTyping && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 animate-in fade-in duration-500">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleQuickPrompt(prompt)}
                className="text-[10px] font-medium text-foreground/70 bg-muted/60 hover:bg-foreground hover:text-background border border-border/60 hover:border-foreground px-2.5 py-1.5 rounded-full transition-all duration-200 hover:shadow-[0_2px_8px_-2px_hsl(var(--foreground)/0.2)]"
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
              placeholder="Ask Trudy anything…"
              disabled={isTyping}
              className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-30 hover:opacity-80 active:scale-90 transition-all duration-150"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle footer */}
      <p className="text-center text-[9px] text-muted-foreground/50 mt-2">
        Powered by TruMove AI · Responses are AI-generated
      </p>
    </div>
  );
}
