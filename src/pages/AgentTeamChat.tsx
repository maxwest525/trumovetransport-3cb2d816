import { useState, useEffect, useRef } from "react";
import AgentShell from "@/components/layout/AgentShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare, Users, Search, Send, Plus,
  Circle, MoreVertical, Phone, Video, UserPlus,
  CheckCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role?: string;
  is_online: boolean;
  last_seen: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: Profile;
}

interface Conversation {
  id: string;
  name: string | null;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  members?: Profile[];
  unread_count?: number;
}

const DEMO_PROFILES: Profile[] = [];
const DEMO_CONVERSATIONS: Conversation[] = [];
const DEMO_MESSAGES: Record<string, Message[]> = {};

export default function AgentTeamChat({ embedded = false }: { embedded?: boolean }) {
  const [activeTab, setActiveTab] = useState("messages");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(DEMO_CONVERSATIONS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles] = useState<Profile[]>(DEMO_PROFILES);
  const [currentUserId] = useState("current");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedConversation) {
      setMessages(DEMO_MESSAGES[selectedConversation.id] || []);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    const newMessage: Message = { id: `msg-${Date.now()}`, content: messageInput, sender_id: currentUserId, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, newMessage]);
    setMessageInput("");
    toast({ title: "Message sent", description: "Your message has been delivered." });
  };

  const handleStartConversation = (profile: Profile) => {
    const existingConv = conversations.find(c => !c.is_group && c.members?.some(m => m.id === profile.id));
    if (existingConv) {
      setSelectedConversation(existingConv);
      setActiveTab("messages");
    } else {
      const newConv: Conversation = { id: `conv-${Date.now()}`, name: null, is_group: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), members: [profile], unread_count: 0 };
      setConversations(prev => [newConv, ...prev]);
      setSelectedConversation(newConv);
      setActiveTab("messages");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getConversationName = (conv: Conversation) => conv.name || conv.members?.[0]?.display_name || "Unknown";
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const filteredConversations = conversations.filter(conv => getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredProfiles = profiles.filter(p => p.display_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const content = (
      <div className="flex h-[calc(100vh-3rem)] overflow-hidden">
        {/* Left sidebar */}
        <div className="w-80 border-r flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
              <TabsTrigger value="team" className="gap-1.5"><Users className="w-4 h-4" />Team</TabsTrigger>
              <TabsTrigger value="messages" className="gap-1.5"><MessageSquare className="w-4 h-4" />Chats</TabsTrigger>
            </TabsList>
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
              </div>
            </div>
            <TabsContent value="messages" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {filteredConversations.map((conv) => (
                    <button key={conv.id} onClick={() => setSelectedConversation(conv)} className={`w-full p-3 rounded-lg text-left transition-colors ${selectedConversation?.id === conv.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"}`}>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conv.members?.[0]?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">{conv.is_group ? conv.name?.[0] : getInitials(getConversationName(conv))}</AvatarFallback>
                          </Avatar>
                          {!conv.is_group && conv.members?.[0]?.is_online && <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-green-500 text-green-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm truncate">{getConversationName(conv)}</span>
                            <span className="text-[10px] text-muted-foreground">{conv.last_message && formatTime(conv.last_message.created_at)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground truncate pr-2">{conv.last_message?.content || "No messages yet"}</p>
                            {(conv.unread_count || 0) > 0 && <Badge className="h-5 min-w-5 flex items-center justify-center text-[10px] bg-primary">{conv.unread_count}</Badge>}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="team" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {filteredProfiles.map((profile) => (
                    <button key={profile.id} onClick={() => handleStartConversation(profile)} className="w-full p-3 rounded-lg text-left hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">{getInitials(profile.display_name)}</AvatarFallback>
                          </Avatar>
                          <Circle className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${profile.is_online ? "fill-green-500 text-green-500" : "fill-muted-foreground text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{profile.display_name}</span>
                            <Badge variant="outline" className="text-[10px] h-4">{profile.role}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{profile.is_online ? "Online" : `Last seen ${formatTime(profile.last_seen)}`}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <div className="p-2 border-t">
            <Button variant="outline" className="w-full gap-2"><Plus className="w-4 h-4" />New Group Chat</Button>
          </div>
        </div>

        {/* Right side - Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-3 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {selectedConversation.is_group ? selectedConversation.name?.[0] : getInitials(getConversationName(selectedConversation))}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{getConversationName(selectedConversation)}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.is_group ? `${selectedConversation.members?.length || 0} members` : selectedConversation.members?.[0]?.is_online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Video className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><UserPlus className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg, idx) => {
                    const isOwn = msg.sender_id === currentUserId;
                    const sender = profiles.find(p => p.id === msg.sender_id);
                    const showAvatar = !isOwn && (idx === 0 || messages[idx - 1]?.sender_id !== msg.sender_id);
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                        {!isOwn && showAvatar && <Avatar className="h-7 w-7"><AvatarFallback className="bg-muted text-xs">{sender ? getInitials(sender.display_name) : "?"}</AvatarFallback></Avatar>}
                        {!isOwn && !showAvatar && <div className="w-7" />}
                        <div className={`max-w-[70%] px-3 py-2 rounded-2xl ${isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                          <p className="text-sm">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : ""}`}>
                            <span className={`text-[10px] ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{formatTime(msg.created_at)}</span>
                            {isOwn && <CheckCheck className="w-3 h-3 text-primary-foreground/70" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="p-3 border-t bg-background">
                <div className="flex items-center gap-2">
                  <Input placeholder="Type a message..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()} className="flex-1" />
                  <Button onClick={handleSendMessage} disabled={!messageInput.trim()} size="icon"><Send className="w-4 h-4" /></Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Select a conversation</p>
                <p className="text-sm">or start a new one from the Team tab</p>
              </div>
            </div>
          )}
        </div>
      </div>
  );

  if (embedded) return content;

  return (
    <AgentShell breadcrumb=" / Team Chat">
      {content}
    </AgentShell>
  );
}
