import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Phone, Video, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import QuickReplies from "./QuickReplies";
import TypingIndicator from "./TypingIndicator";

// ZIP lookup
const ZIP_LOOKUP: Record<string, string> = {
  "90210": "Beverly Hills, CA", "90001": "Los Angeles, CA", "90012": "Los Angeles, CA",
  "92101": "San Diego, CA", "95101": "San Jose, CA", "94102": "San Francisco, CA",
  "10001": "New York, NY", "10016": "New York, NY", "10019": "New York, NY",
  "11201": "Brooklyn, NY", "10451": "Bronx, NY", "11101": "Queens, NY",
  "77001": "Houston, TX", "77002": "Houston, TX", "75201": "Dallas, TX",
  "78201": "San Antonio, TX", "73301": "Austin, TX", "78701": "Austin, TX",
  "33101": "Miami, FL", "33139": "Miami Beach, FL", "32801": "Orlando, FL",
  "60601": "Chicago, IL", "60602": "Chicago, IL", "60614": "Chicago, IL",
  "85001": "Phoenix, AZ", "98101": "Seattle, WA", "80201": "Denver, CO",
  "02101": "Boston, MA", "20001": "Washington, DC", "30301": "Atlanta, GA",
  "89101": "Las Vegas, NV", "97201": "Portland, OR", "48201": "Detroit, MI",
};

async function lookupZip(zip: string): Promise<string | null> {
  if (ZIP_LOOKUP[zip]) return ZIP_LOOKUP[zip];
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (res.ok) {
      const data = await res.json();
      return `${data.places[0]["place name"]}, ${data.places[0]["state abbreviation"]}`;
    }
  } catch {}
  return null;
}

const MOVE_SIZES = [
  { label: "Studio", value: "Studio" },
  { label: "1 Bedroom", value: "1 Bedroom" },
  { label: "2 Bedroom", value: "2 Bedroom" },
  { label: "3 Bedroom", value: "3 Bedroom" },
  { label: "4+ Bedroom", value: "4+ Bedroom" },
  { label: "Office", value: "Office" },
];

interface Message {
  id: string;
  sender: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface ChatContainerProps {
  initialFromLocation?: string;
  initialToLocation?: string;
}

type ConversationStep = 
  | 'greeting'
  | 'from-zip'
  | 'to-zip'
  | 'date'
  | 'size'
  | 'vehicle'
  | 'packing'
  | 'estimate'
  | 'email'
  | 'phone'
  | 'complete';

export default function ChatContainer({ initialFromLocation, initialToLocation }: ChatContainerProps) {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<ConversationStep>('greeting');
  const [isTyping, setIsTyping] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const [formData, setFormData] = useState({
    fromZip: "", toZip: "", moveDate: null as Date | null,
    size: "", hasCar: null as boolean | null, needsPacking: null as boolean | null,
    email: "", phone: ""
  });
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");

  // Validation helpers
  const zipOk = (z: string) => /^\d{5}$/.test(z.trim());
  const phoneOk = (p: string) => (p.replace(/\D/g, "")).length >= 10;
  const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  // Calculate estimate
  const calculateEstimate = () => {
    let base = 1500;
    if (formData.size === "Studio") base = 800;
    else if (formData.size === "1 Bedroom") base = 1200;
    else if (formData.size === "2 Bedroom") base = 2200;
    else if (formData.size === "3 Bedroom") base = 3500;
    else if (formData.size === "4+ Bedroom") base = 5000;
    else if (formData.size === "Office") base = 3000;
    if (formData.hasCar) base += 800;
    if (formData.needsPacking) base += 600;
    const variance = base * 0.2;
    return { min: Math.round(base - variance), max: Math.round(base + variance) };
  };

  // Scroll to bottom within container only (not entire page)
  useEffect(() => {
    const container = messagesEndRef.current?.closest('.chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping]);

  // Initialize with greeting - check for pre-filled locations
  useEffect(() => {
    const hasFromLocation = initialFromLocation && initialFromLocation.trim().length > 0;
    const hasToLocation = initialToLocation && initialToLocation.trim().length > 0;
    
    if (hasFromLocation && hasToLocation) {
      // Both locations provided - skip to date
      setFromCity(initialFromLocation);
      setToCity(initialToLocation);
      setFormData(prev => ({ ...prev, fromZip: initialFromLocation, toZip: initialToLocation }));
      addBotMessage(`Hi! I see you're moving from ${initialFromLocation} to ${initialToLocation}. 🚚`);
      setTimeout(() => {
        addBotMessage("When are you planning to move?");
        setCurrentStep('date');
      }, 800);
    } else if (hasFromLocation) {
      // Only from location provided - skip to destination
      setFromCity(initialFromLocation);
      setFormData(prev => ({ ...prev, fromZip: initialFromLocation }));
      addBotMessage(`Hi! I see you're moving from ${initialFromLocation}. 🚚`);
      setTimeout(() => {
        addBotMessage("Where are you moving TO? Just type your ZIP code or city.");
        setCurrentStep('to-zip');
      }, 800);
    } else {
      // No locations - standard greeting
      addBotMessage("Hi! I'm your TruMove assistant. Ready to get your instant move quote in under 2 minutes. 🚚");
      setTimeout(() => {
        addBotMessage("First up — where are you moving FROM? Just type your ZIP code.");
        setCurrentStep('from-zip');
      }, 800);
    }
  }, [initialFromLocation, initialToLocation]);

  const addBotMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        content,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 400 + Math.random() * 300);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const handleUserInput = async (value: string) => {
    addUserMessage(value);

    switch (currentStep) {
      case 'from-zip':
        if (zipOk(value)) {
          const city = await lookupZip(value);
          setFormData(prev => ({ ...prev, fromZip: value }));
          setFromCity(city || "");
          setTimeout(() => {
            addBotMessage(city 
              ? `Got it — ${city}! And where are you moving TO?`
              : `Got it — ZIP ${value}! And where are you moving TO?`
            );
            setCurrentStep('to-zip');
          }, 300);
        } else {
          setTimeout(() => addBotMessage("Hmm, that doesn't look like a valid ZIP code. Try a 5-digit US ZIP like 90210."), 300);
        }
        break;

      case 'to-zip':
        if (zipOk(value)) {
          const city = await lookupZip(value);
          setFormData(prev => ({ ...prev, toZip: value }));
          setToCity(city || "");
          setTimeout(() => {
            const routeText = fromCity && city 
              ? `${fromCity.split(',')[0]} → ${city.split(',')[0]}`
              : `ZIP ${formData.fromZip} → ZIP ${value}`;
            addBotMessage(`Perfect! ${routeText}. When are you planning to move?`);
            setCurrentStep('date');
          }, 300);
        } else {
          setTimeout(() => addBotMessage("That doesn't look quite right. Enter a 5-digit ZIP code for your destination."), 300);
        }
        break;

      case 'email':
        if (emailOk(value)) {
          setFormData(prev => ({ ...prev, email: value }));
          setTimeout(() => {
            addBotMessage("Almost there! What's the best phone number to reach you? (For move-day coordination only)");
            setCurrentStep('phone');
          }, 300);
        } else {
          setTimeout(() => addBotMessage("Please enter a valid email address so we can send your quote details."), 300);
        }
        break;

      case 'phone':
        if (phoneOk(value)) {
          setFormData(prev => ({ ...prev, phone: value }));
          setTimeout(() => {
            addBotMessage("You're all set! Here are your options to proceed:");
            setCurrentStep('complete');
          }, 300);
        } else {
          setTimeout(() => addBotMessage("Please enter a valid phone number (at least 10 digits)."), 300);
        }
        break;
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setFormData(prev => ({ ...prev, moveDate: date }));
    setDatePopoverOpen(false);
    addUserMessage(format(date, "MMMM d, yyyy"));
    setTimeout(() => {
      addBotMessage("Great timing! What size is your current place?");
      setCurrentStep('size');
    }, 300);
  };

  const handleSizeSelect = (value: string) => {
    setFormData(prev => ({ ...prev, size: value }));
    addUserMessage(value);
    setTimeout(() => {
      addBotMessage(`${value}, got it. Do you have any vehicles that need to be transported?`);
      setCurrentStep('vehicle');
    }, 300);
  };

  const handleVehicleSelect = (value: string) => {
    const hasCar = value === 'yes';
    setFormData(prev => ({ ...prev, hasCar }));
    addUserMessage(hasCar ? "Yes, I have a vehicle" : "No vehicles");
    setTimeout(() => {
      addBotMessage(hasCar 
        ? "We'll add vehicle transport to your quote. Do you need help with packing, or handling that yourself?"
        : "No problem! Do you need help with packing, or handling that yourself?"
      );
      setCurrentStep('packing');
    }, 300);
  };

  const handlePackingSelect = (value: string) => {
    const needsPacking = value === 'yes';
    setFormData(prev => ({ ...prev, needsPacking }));
    addUserMessage(needsPacking ? "Yes, I need packing help" : "I'll pack myself");
    
    setTimeout(() => {
      const estimate = calculateEstimate();
      addBotMessage(`Perfect! Based on your details, here's your estimate:`);
      setTimeout(() => {
        addBotMessage(`💰 $${estimate.min.toLocaleString()} - $${estimate.max.toLocaleString()}`);
        setTimeout(() => {
          addBotMessage("To lock in exact pricing and see vetted mover options, what's your email?");
          setCurrentStep('email');
        }, 600);
      }, 600);
    }, 300);
  };

  const handleIntent = (intent: string) => {
    localStorage.setItem("tm_lead", JSON.stringify({
      intent,
      ...formData,
      moveDate: formData.moveDate?.toISOString(),
      fromCity,
      toCity,
      ts: Date.now()
    }));

    if (intent === "specialist") {
      window.location.href = "tel:+18001234567";
    } else if (intent === "virtual") {
      navigate("/book");
    } else if (intent === "builder") {
      navigate("/online-estimate");
    }
  };

  const getInputPlaceholder = () => {
    switch (currentStep) {
      case 'from-zip': return "Enter your ZIP code...";
      case 'to-zip': return "Enter destination ZIP...";
      case 'email': return "your@email.com";
      case 'phone': return "(555) 123-4567";
      default: return "Type your answer...";
    }
  };

  const getInputType = () => {
    if (currentStep === 'email') return 'email';
    if (currentStep === 'phone') return 'tel';
    return 'text';
  };

  const showInput = ['from-zip', 'to-zip', 'email', 'phone'].includes(currentStep);
  const showDatePicker = currentStep === 'date';
  const showSizeOptions = currentStep === 'size';
  const showVehicleOptions = currentStep === 'vehicle';
  const showPackingOptions = currentStep === 'packing';
  const showCTAs = currentStep === 'complete';

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-avatar-small">
            <svg viewBox="0 0 24 24" fill="none" className="chat-avatar-icon">
              <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="chat-header-info">
            <span className="chat-header-name">TruMove Assistant</span>
            <span className="chat-header-status">
              <span className="chat-status-dot"></span>
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map(msg => (
          <ChatMessage
            key={msg.id}
            sender={msg.sender}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}
        {isTyping && <TypingIndicator />}

        {/* Date Picker */}
        {showDatePicker && !isTyping && (
          <div className="chat-action-area">
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button type="button" className="chat-date-btn">
                  <CalendarIcon className="chat-date-icon" />
                  <span>Pick a date</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="chat-date-popover" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.moveDate || undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <QuickReplies
              options={[
                { label: "Within 2 weeks", value: "2weeks" },
                { label: "This month", value: "month" },
                { label: "1-2 months", value: "2months" },
                { label: "Just exploring", value: "exploring" }
              ]}
              onSelect={(val) => {
                let date = new Date();
                if (val === "2weeks") date.setDate(date.getDate() + 14);
                else if (val === "month") date.setDate(date.getDate() + 21);
                else if (val === "2months") date.setMonth(date.getMonth() + 1);
                else date.setMonth(date.getMonth() + 3);
                handleDateSelect(date);
              }}
            />
          </div>
        )}

        {/* Size Options */}
        {showSizeOptions && !isTyping && (
          <div className="chat-action-area">
            <QuickReplies options={MOVE_SIZES} onSelect={handleSizeSelect} />
          </div>
        )}

        {/* Vehicle Options */}
        {showVehicleOptions && !isTyping && (
          <div className="chat-action-area">
            <QuickReplies
              options={[
                { label: "Yes, I have a vehicle", value: "yes" },
                { label: "No vehicles", value: "no" }
              ]}
              onSelect={handleVehicleSelect}
            />
          </div>
        )}

        {/* Packing Options */}
        {showPackingOptions && !isTyping && (
          <div className="chat-action-area">
            <QuickReplies
              options={[
                { label: "Yes, I need packing help", value: "yes" },
                { label: "I'll pack myself", value: "no" }
              ]}
              onSelect={handlePackingSelect}
            />
          </div>
        )}

        {/* Final CTAs */}
        {showCTAs && !isTyping && (
          <div className="chat-cta-area">
            <button type="button" className="chat-cta-btn is-primary" onClick={() => handleIntent("specialist")}>
              <Phone className="chat-cta-icon" />
              <span>Talk to a Specialist</span>
            </button>
            <button type="button" className="chat-cta-btn" onClick={() => handleIntent("virtual")}>
              <Video className="chat-cta-icon" />
              <span>Schedule Video Call</span>
            </button>
            <button type="button" className="chat-cta-btn is-secondary" onClick={() => handleIntent("builder")}>
              <span>Build Full Inventory</span>
              <ArrowRight className="chat-cta-icon" />
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {showInput && (
        <ChatInput
          placeholder={getInputPlaceholder()}
          onSend={handleUserInput}
          inputType={getInputType()}
          disabled={isTyping}
        />
      )}

    </div>
  );
}
