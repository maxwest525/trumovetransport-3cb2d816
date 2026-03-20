import { Video, Phone, Mail, MessageSquare, Search, PhoneCall, Headset, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

interface ContactHubProps {
  onStartVideoCall: () => void;
  bookingCode: string;
  setBookingCode: (code: string) => void;
  onJoinRoom: () => void;
}

export function ContactHub({
  onStartVideoCall,
  bookingCode,
  setBookingCode,
  onJoinRoom,
}: ContactHubProps) {
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Simulate booking lookup with loading state
  useEffect(() => {
    if (bookingCode.trim().length >= 4) {
      setIsLookingUp(true);
      const timer = setTimeout(() => {
        setIsLookingUp(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [bookingCode]);

  const handleVoiceCall = () => {
    window.location.href = "tel:+18005551234";
  };

  const handleEmail = () => {
    window.location.href = "mailto:support@trumove.com?subject=Moving Inquiry";
  };

  const handleText = () => {
    window.location.href = "sms:+18005551234";
  };

  return (
    <div className="flex flex-col items-center h-full p-4 sm:p-8 relative">
      {/* Logo - positioned at top */}
      <div className="pt-4">
        <img 
          src={logo} 
          alt="TruMove" 
          className="h-12 mx-auto brightness-0 invert animate-[pulse_3s_ease-in-out_infinite]"
        />
      </div>

      {/* Header */}
      <div className="mt-4 sm:mt-8 text-center">
        <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
          Ready to Connect
        </h3>
        <p className="text-white/70 text-base max-w-lg mx-auto leading-relaxed">
          Choose how you'd like to reach our moving specialists
        </p>
      </div>


      {/* Primary Action Buttons - Centered between header and booking input */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 w-full max-w-3xl">
        {/* Video Call */}
        <button
          onClick={onStartVideoCall}
          className="group flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-xl bg-white/5 border-2 border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-200 animate-fade-scale-in opacity-0"
          style={{ animationDelay: '100ms' }}
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/15 group-hover:shadow-[0_0_20px_hsl(0_0%_100%/0.15)] transition-all duration-300">
            <Video className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold text-white">Video Call</span>
        </button>

        {/* Voice Call */}
        <button
          onClick={handleVoiceCall}
          className="group flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-xl bg-white/5 border-2 border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-200 animate-fade-scale-in opacity-0"
          style={{ animationDelay: '200ms' }}
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/15 group-hover:shadow-[0_0_20px_hsl(0_0%_100%/0.15)] transition-all duration-300">
            <PhoneCall className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold text-white">Voice Call</span>
        </button>

        {/* Email */}
        <button
          onClick={handleEmail}
          className="group flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-xl bg-white/5 border-2 border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-200 animate-fade-scale-in opacity-0"
          style={{ animationDelay: '300ms' }}
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/15 group-hover:shadow-[0_0_20px_hsl(0_0%_100%/0.15)] transition-all duration-300">
            <Mail className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold text-white">Email Us</span>
        </button>

        {/* Text/SMS */}
        <button
          onClick={handleText}
          className="group flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-xl bg-white/5 border-2 border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-200 animate-fade-scale-in opacity-0"
          style={{ animationDelay: '400ms' }}
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/15 group-hover:shadow-[0_0_20px_hsl(0_0%_100%/0.15)] transition-all duration-300">
            <Send className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold text-white">Text Us</span>
        </button>
        </div>
      </div>

      {/* Booking ID Search - Compact at bottom */}
      <div className="pb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 max-w-sm mx-auto">
          {isLookingUp ? (
            <Loader2 className="w-3.5 h-3.5 text-primary shrink-0 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5 text-white/60 shrink-0" />
          )}
          <Input
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value)}
            placeholder="Have a Booking ID or Shipping #?"
            className="flex-1 h-7 bg-transparent border-0 text-white text-xs placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onJoinRoom();
              }
            }}
          />
          <Button
            size="sm"
            onClick={onJoinRoom}
            disabled={!bookingCode.trim() || isLookingUp}
            className={cn(
              "h-6 px-2.5 font-semibold text-[11px] transition-all",
              bookingCode.trim() && !isLookingUp
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-foreground text-background hover:bg-foreground/90"
            )}
          >
            {isLookingUp ? <Loader2 className="w-3 h-3 animate-spin" /> : "Join"}
          </Button>
        </div>
      </div>
    </div>
  );
}