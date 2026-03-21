import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, Bot, User, RefreshCw, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'trudy';
  content: string;
  timestamp: Date;
  suggestions?: string[];
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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trudy-chat`;

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

function getSuggestions(content: string): string[] {
  const lower = content.toLowerCase();
  if (lower.includes('quote') || lower.includes('estimate') || lower.includes('price'))
    return ['How much for a local move?', 'What affects the price?'];
  if (lower.includes('track') || lower.includes('shipment') || lower.includes('status'))
    return ['When will it arrive?', 'Can I get updates via text?'];
  if (lower.includes('schedule') || lower.includes('book') || lower.includes('date'))
    return ['What dates are available?', 'Can I reschedule?'];
  if (lower.includes('carrier') || lower.includes('safety') || lower.includes('insurance'))
    return ['How do you vet carriers?', 'Is my stuff insured?'];
  return ['Get a moving quote', 'How does it work?'];
}

function MessageBubble({ message, isLast, onSuggestionClick }: { message: Message; isLast: boolean; onSuggestionClick?: (s: string) => void }) {
  const isTrudy = message.role === 'trudy';
  return (
    <div className="space-y-2">
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
          {isTrudy ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            message.content
          )}
        </div>
      </div>
      {isTrudy && isLast && message.suggestions && message.suggestions.length > 0 && (
        <div className="ml-9 flex flex-wrap gap-1.5 animate-in fade-in duration-500 delay-300">
          {message.suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestionClick?.(s)}
              className="text-[11px] font-medium text-foreground/70 bg-muted/60 hover:bg-foreground hover:text-background border border-border/60 hover:border-foreground px-2.5 py-1.5 rounded-full transition-all duration-200"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrudyChatBox() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [conversationHistory, setConversationHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isReady] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const updatedHistory = [...conversationHistory, { role: "user" as const, content: text }];
    setConversationHistory(updatedHistory);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedHistory,
          pageContext: "User is on the Meet Trudy / Customer Service page. Help with moving questions, but direct pricing inquiries to a specialist.",
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "Connection error" }));
        throw new Error(errData.error || "Failed to connect");
      }

      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      const upsertTrudy = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "trudy" && last.id.includes("-stream")) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { id: `${Date.now()}-stream`, role: "trudy", content: assistantSoFar, timestamp: new Date() }];
        });
      };

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              setIsTyping(false);
              upsertTrudy(content);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertTrudy(content);
          } catch { /* ignore */ }
        }
      }

      if (assistantSoFar) {
        setConversationHistory(prev => [...prev, { role: "assistant", content: assistantSoFar }]);
        // Attach follow-up suggestions to the last Trudy message
        const suggestions = getSuggestions(assistantSoFar);
        setMessages(prev => prev.map((m, i) => i === prev.length - 1 && m.role === 'trudy' ? { ...m, suggestions } : m));
      }
    } catch (err) {
      console.error("Trudy chat error:", err);
      setMessages(prev => [...prev, {
        id: `${Date.now()}-error`,
        role: 'trudy',
        content: "Sorry, I'm having trouble connecting right now. Please try again or call us at (609) 727-7647.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
      // Re-focus input so user can keep typing without clicking back in
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [conversationHistory, isTyping]);

  const handleSend = useCallback(() => {
    sendMessage(input.trim());
  }, [input, sendMessage]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    sendMessage(prompt);
  }, [sendMessage]);

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
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card bg-emerald-500" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground leading-none">Trudy</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  AI Move Coordinator · Online
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[9px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="px-4 py-4 space-y-4 overflow-y-auto"
          style={{ height: 340, scrollBehavior: 'smooth' }}
        >
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id} message={msg} isLast={i === messages.length - 1} onSuggestionClick={handleQuickPrompt} />
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
              placeholder="Ask Trudy anything…"
              disabled={isTyping}
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none disabled:opacity-50"
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

      <p className="text-center text-[9px] text-muted-foreground/50 mt-2">
        Powered by TruMove AI · Responses are AI-generated
      </p>
    </div>
  );
}
