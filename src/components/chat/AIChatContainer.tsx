import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { RefreshCw, Bot } from "lucide-react";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import { PageContext, QuickAction, detectKeywordContext } from "./pageContextConfig";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatContainerProps {
  agentId?: string;
  onSwitchToQuickQuote?: () => void;
  pageContext?: PageContext;
}

const defaultContext: PageContext = {
  key: 'general',
  firstMessage: "Hi! I'm Trudy, your TruMove AI assistant. I can help you with moving questions, explain our services, or connect you with a specialist. What can I help you with today?",
  quickActions: [],
  agentContext: "General moving assistance.",
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trudy-chat`;

export default function AIChatContainer({ agentId, onSwitchToQuickQuote, pageContext = defaultContext }: AIChatContainerProps) {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [contextualActions, setContextualActions] = useState<QuickAction[]>([]);
  const hasInitialized = useRef(false);

  // Auto-scroll
  useEffect(() => {
    const container = messagesEndRef.current?.closest('.chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isThinking]);

  // Initialize with welcome message
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const welcomeMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: pageContext.firstMessage,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
      setIsReady(true);
    }
  }, [pageContext.firstMessage]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isThinking) return;

    // Add user message to UI
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Detect keywords for contextual actions
    const keywordContext = detectKeywordContext(text);
    if (keywordContext) {
      setContextualActions(keywordContext.quickReplies);
    } else {
      setContextualActions([]);
    }

    // Build conversation history for API
    const updatedHistory = [...conversationHistory, { role: "user" as const, content: text }];
    setConversationHistory(updatedHistory);
    setIsThinking(true);
    setError(null);

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
          pageContext: pageContext.agentContext,
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

      const upsertAssistant = (nextChunk: string) => {
        assistantSoFar += nextChunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id.includes("-stream")) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { id: `msg-${Date.now()}-stream`, role: "assistant", content: assistantSoFar, timestamp: new Date() }];
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
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              setIsThinking(false);
              upsertAssistant(content);
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
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }

      // Save assistant response to conversation history
      if (assistantSoFar) {
        setConversationHistory(prev => [...prev, { role: "assistant", content: assistantSoFar }]);
      }
    } catch (err) {
      console.error("Trudy chat error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsThinking(false);
    }
  }, [conversationHistory, isThinking, pageContext.agentContext]);

  const handleQuickAction = useCallback((quickAction: QuickAction) => {
    switch (quickAction.action) {
      case 'quote':
        onSwitchToQuickQuote?.();
        break;
      case 'navigate':
        if (quickAction.target) navigate(quickAction.target);
        break;
      case 'call':
        window.location.href = "tel:+18001234567";
        break;
      case 'message':
        if (quickAction.message) handleSend(quickAction.message);
        break;
    }
  }, [navigate, onSwitchToQuickQuote, handleSend]);

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-avatar-small bg-foreground flex items-center justify-center">
            <Bot className="w-5 h-5 text-background" />
          </div>
          <div className="chat-header-info">
            <span className="chat-header-name">Trudy with TruMove</span>
            <span className="chat-header-status">
              <span className={cn("chat-status-dot", isReady && "bg-sky-500")}></span>
              {isReady ? "Online" : "Starting..."}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-4 gap-2 px-4">
            <p className="text-destructive text-sm text-center">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("chat-message", msg.role === "assistant" ? "is-bot" : "is-user")}
          >
            {msg.role === "assistant" && (
              <div className="chat-avatar bg-foreground flex items-center justify-center">
                <Bot className="w-5 h-5 text-background" />
              </div>
            )}
            <div className="chat-bubble">
              <div className="chat-bubble-text prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && <TypingIndicator />}

        {/* Quick Actions */}
        {isReady && !isThinking && (
          <>
            {messages.length === 1 && pageContext.quickActions.length > 0 && contextualActions.length === 0 && (
              <div className="flex flex-wrap gap-2 px-4 py-3">
                {pageContext.quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                        index === 0
                          ? "bg-foreground/10 text-foreground hover:bg-foreground/20"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}

            {contextualActions.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider w-full mb-1">Suggested for you</span>
                {contextualActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        handleQuickAction(action);
                        setContextualActions([]);
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                        index === 0
                          ? "bg-foreground/10 text-foreground hover:bg-foreground/20 ring-1 ring-foreground/20"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        placeholder="Ask me anything about your move..."
        onSend={handleSend}
        disabled={isThinking}
      />
    </div>
  );
}
