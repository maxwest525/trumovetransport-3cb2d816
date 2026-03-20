import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: number;
  text: string;
  from: "bot" | "user";
}

const initialMessages: Message[] = [
  { id: 1, text: "Hey! 👋 I'm Trudy, your TruMove transport assistant. How can I help you today?", from: "bot" },
];

const autoReplies: Record<string, string> = {
  quote: "I can help with that! Use the Quote Wizard above to get an instant estimate, or share your pickup and delivery cities here and I'll walk you through it.",
  price: "Pricing depends on distance, vehicle type, and transport method. Most shipments range from $500–$1,500. Want me to help you get a precise quote?",
  track: "You can track your shipment in real-time once it's booked. Your advisor will send you a tracking link via text and email.",
  time: "Most shipments are picked up within 1–7 days and delivered in 3–10 days depending on the route. Expedited options are available!",
  default: "Great question! A transport advisor can help you with that. Want to request a callback? Just scroll down to the contact form below.",
};

function getReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("quote") || lower.includes("estimate") || lower.includes("cost")) return autoReplies.quote;
  if (lower.includes("price") || lower.includes("how much") || lower.includes("expensive")) return autoReplies.price;
  if (lower.includes("track") || lower.includes("where") || lower.includes("status")) return autoReplies.track;
  if (lower.includes("long") || lower.includes("time") || lower.includes("when") || lower.includes("fast")) return autoReplies.time;
  return autoReplies.default;
}

export function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(2);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: idRef.current++, text, from: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const reply: Message = { id: idRef.current++, text: getReply(text), from: "bot" };
      setMessages(prev => [...prev, reply]);
    }, 800);
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_30px_-6px_hsl(var(--primary)/0.6)] hover:shadow-[0_0_40px_-4px_hsl(var(--primary)/0.8)] hover:scale-110 transition-all duration-300"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-[340px] sm:w-[380px] rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "min(500px, calc(100dvh - 120px))" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Trudy</p>
                  <p className="text-[10px] text-muted-foreground">TruMove Assistant · Online</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="px-3 py-2.5 border-t border-border/40 bg-card/80 backdrop-blur-sm">
              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-background/60 border-border/40 text-sm h-9"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="premium"
                  className="shrink-0 w-9 h-9"
                  disabled={!input.trim()}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
