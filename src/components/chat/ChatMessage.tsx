import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface ChatMessageProps {
  sender: 'bot' | 'user';
  content: string;
  timestamp?: Date;
}

export default function ChatMessage({ sender, content, timestamp }: ChatMessageProps) {
  return (
    <div className={cn("chat-message", sender === 'bot' ? "is-bot" : "is-user")}>
      {sender === 'bot' && (
        <div className="chat-avatar bg-foreground rounded-full flex items-center justify-center w-8 h-8">
          <MessageCircle className="w-4 h-4 text-background" />
        </div>
      )}
      <div className="chat-bubble">
        <span className="chat-bubble-text">{content}</span>
        {timestamp && (
          <span className="chat-bubble-time">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
