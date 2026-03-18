import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Monitor, Phone, Rocket, Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface AgentToolLauncherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOOLS = [
  { key: "granot", label: "Granot CRM", icon: Monitor, url: "https://granot.com" },
  { key: "convoso", label: "Convoso Dialer", icon: Phone, url: "https://convoso.com" },
];

const TRUDY_GREETINGS = [
  "Hey! Want me to grab you a coffee before you start?",
  "Morning superstar! Coffee run before we crush it?",
  "Oh hey, you're here! Need a coffee? I'm offering… maybe.",
  "Welcome back! Can I interest you in a hot cup of coffee?",
];

const TRUDY_YES_RESPONSES = [
  "Oh sweetie… I'm literally a bunch of code running on a server somewhere. I can't even hold a mug! But I appreciate the optimism.",
  "Hahahaha! You really just asked an AI for coffee. I don't even have hands! This is the highlight of my day though.",
  "Sure! Let me just reach out and… oh wait. I'm software. Living inside your computer. Nice try though, really.",
  "I would LOVE to, but I exist inside a server rack in some data center. Rain check? Like, forever?",
  "Aww you're so polite! But babe, I'm an AI. The closest I get to coffee is processing the word 'coffee'. Which I just did. You're welcome.",
  "Hold on let me just — nope. No arms. No legs. No body. Just vibes and sarcasm. Sorry!",
];

const TRUDY_NO_RESPONSES = [
  "Fine. More for nobody, I guess. Since I can't drink it anyway. 😤",
  "Rude. I mean I can't make it but still… rude.",
  "Okay cool, reject the AI's hospitality. See if I care. (I do care.)",
  "Your loss! Well, technically nobody's loss since I can't make coffee. But emotionally? My loss.",
];

async function playTrudySpeech(text: string): Promise<void> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) throw new Error("TTS failed");

    const data = await response.json();
    const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
    const audio = new Audio(audioUrl);
    await audio.play();
  } catch (err) {
    console.warn("Trudy TTS unavailable:", err);
  }
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Animated sound wave bars
function SoundWave({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-4 shrink-0">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-primary"
          animate={active ? {
            height: [4, 12 + Math.random() * 4, 6, 14 + Math.random() * 2, 4],
          } : { height: 4 }}
          transition={active ? {
            duration: 0.6 + i * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
          } : { duration: 0.3 }}
        />
      ))}
    </div>
  );
}

export default function AgentToolLauncherModal({ open, onOpenChange }: AgentToolLauncherModalProps) {
  const navigate = useNavigate();
  const [trudyState, setTrudyState] = useState<"ask" | "response">("ask");
  const [trudyMsg, setTrudyMsg] = useState("");
  const [trudyAsk, setTrudyAsk] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasSpokenRef = useRef(false);

  // Trudy asks a random coffee question out loud when modal opens
  useEffect(() => {
    if (open && !hasSpokenRef.current) {
      hasSpokenRef.current = true;
      const greeting = pick(TRUDY_GREETINGS);
      setTrudyAsk(greeting);
      setIsSpeaking(true);
      playTrudySpeech(greeting).finally(() => setIsSpeaking(false));
    }
  }, [open]);

  const handleCoffeeYes = useCallback(async () => {
    const msg = pick(TRUDY_YES_RESPONSES);
    setTrudyMsg(msg);
    setTrudyState("response");
    setIsSpeaking(true);
    await playTrudySpeech(msg);
    setIsSpeaking(false);
  }, []);

  const handleCoffeeNo = useCallback(async () => {
    const msg = pick(TRUDY_NO_RESPONSES);
    setTrudyMsg(msg);
    setTrudyState("response");
    setIsSpeaking(true);
    await playTrudySpeech(msg);
    setIsSpeaking(false);
  }, []);

  const handleLaunchAll = () => {
    TOOLS.forEach((tool) => window.open(tool.url, "_blank"));
    sessionStorage.setItem("agent_tools_launched", "true");
    onOpenChange(false);
  };

  // If tools already launched this session, skip the modal
  useEffect(() => {
    if (open && sessionStorage.getItem("agent_tools_launched") === "true") {
      onOpenChange(false);
    }
  }, [open, onOpenChange]);

  const handleGoToDashboard = () => {
    onOpenChange(false);
    navigate("/agent/dashboard");
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => {
        setTrudyState("ask");
        setTrudyMsg("");
        setTrudyAsk("");
        hasSpokenRef.current = false;
      }, 300);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-border rounded-2xl">
        {/* Trudy section — top of modal, her own space */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-primary/3 px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            {/* Trudy avatar */}
            <div className="relative shrink-0">
              <motion.div
                animate={isSpeaking ? { scale: [1, 1.08, 1] } : {}}
                transition={isSpeaking ? { duration: 1.2, repeat: Infinity } : {}}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center"
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
              {/* Online dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
            </div>

            {/* Speech bubble */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-foreground">Trudy</span>
                <span className="text-[9px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded-full">AI Assistant</span>
                <SoundWave active={isSpeaking} />
              </div>

              <AnimatePresence mode="wait">
                {trudyState === "ask" ? (
                  <motion.div
                    key="ask"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      {trudyAsk || TRUDY_GREETINGS[0]}
                    </p>
                    <div className="flex gap-2 mt-2.5">
                      <button
                        onClick={handleCoffeeYes}
                        className="text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-1 rounded-full"
                      >
                        ☕ Yes please!
                      </button>
                      <button
                        onClick={handleCoffeeNo}
                        className="text-[11px] text-muted-foreground bg-muted/60 hover:bg-muted transition-colors px-3 py-1 rounded-full"
                      >
                        Nah I'm good
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="response"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      {trudyMsg}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Tools section */}
        <div className="px-6 pb-4 pt-4 space-y-3 border-t border-border">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Your Tools</p>
          <div className="flex flex-col gap-1.5">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.key} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{tool.label}</span>
                </div>
              );
            })}
          </div>

          <Button
            onClick={handleLaunchAll}
            className="w-full h-11 rounded-xl gap-2 font-semibold"
            size="lg"
          >
            <Rocket className="h-4 w-4" />
            Launch All
          </Button>
        </div>

        <div className="border-t border-border px-6 py-2.5 text-center">
          <button
            onClick={handleGoToDashboard}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Go to Dashboard →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
