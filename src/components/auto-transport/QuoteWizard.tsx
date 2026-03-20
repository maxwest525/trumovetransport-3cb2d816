import { useState, useRef, useCallback, useEffect } from "react";
import { Check, ChevronRight, ChevronLeft, ChevronDown, Scan, Route, ScanLine, MapPin, Car, Box, Phone, Mail, User, Sparkles, Pencil, CalendarIcon, Loader2, HandMetal } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import usMapImg from "@/assets/us-map.png";

const years = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];
const makes = ["Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Nissan", "Porsche", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"];
const modelsByMake: Record<string, string[]> = {
  Acura: ["ILX", "TLX", "Integra", "MDX", "RDX"],
  Audi: ["A3", "A4", "A6", "Q3", "Q5", "Q7", "e-tron"],
  BMW: ["3 Series", "5 Series", "X3", "X5", "X7", "i4", "iX"],
  Buick: ["Encore", "Envision", "Enclave"],
  Cadillac: ["CT4", "CT5", "XT4", "XT5", "Escalade"],
  Chevrolet: ["Malibu", "Camaro", "Corvette", "Equinox", "Traverse", "Silverado", "Tahoe", "Suburban"],
  Chrysler: ["300", "Pacifica"],
  Dodge: ["Charger", "Challenger", "Durango", "Hornet"],
  Ford: ["Mustang", "F-150", "Explorer", "Bronco", "Escape", "Edge", "Expedition", "Maverick"],
  GMC: ["Terrain", "Acadia", "Yukon", "Sierra", "Canyon"],
  Honda: ["Accord", "Civic", "CR-V", "Pilot", "HR-V", "Passport", "Ridgeline"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Ioniq 5", "Kona"],
  Infiniti: ["Q50", "Q60", "QX50", "QX60", "QX80"],
  Jeep: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Gladiator"],
  Kia: ["Forte", "K5", "Sportage", "Sorento", "Telluride", "EV6", "Soul"],
  Lexus: ["IS", "ES", "RX", "NX", "GX", "LX"],
  Lincoln: ["Corsair", "Nautilus", "Aviator", "Navigator"],
  Mazda: ["Mazda3", "Mazda6", "CX-5", "CX-9", "CX-50", "MX-5 Miata"],
  "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "GLS", "EQS"],
  Nissan: ["Altima", "Sentra", "Maxima", "Rogue", "Pathfinder", "Frontier", "Titan", "Z"],
  Porsche: ["911", "Cayenne", "Macan", "Taycan", "Panamera"],
  Ram: ["1500", "2500", "3500"],
  Subaru: ["Impreza", "Legacy", "Outback", "Forester", "Crosstrek", "Ascent", "WRX"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck"],
  Toyota: ["Camry", "Corolla", "RAV4", "Highlander", "4Runner", "Tacoma", "Tundra", "Supra", "GR86"],
  Volkswagen: ["Jetta", "Passat", "Golf", "Tiguan", "Atlas", "ID.4", "Taos"],
  Volvo: ["S60", "S90", "XC40", "XC60", "XC90"],
};

const modelVehicleType: Record<string, string> = {
  ILX: "Sedan", TLX: "Sedan", Integra: "Sedan", MDX: "SUV", RDX: "SUV",
  A3: "Sedan", A4: "Sedan", A6: "Sedan", Q3: "SUV", Q5: "SUV", Q7: "SUV", "e-tron": "SUV",
  "3 Series": "Sedan", "5 Series": "Sedan", X3: "SUV", X5: "SUV", X7: "SUV", i4: "Sedan", iX: "SUV",
  Encore: "SUV", Envision: "SUV", Enclave: "SUV",
  CT4: "Sedan", CT5: "Sedan", XT4: "SUV", XT5: "SUV", Escalade: "SUV",
  Malibu: "Sedan", Camaro: "Coupe", Corvette: "Coupe", Equinox: "SUV", Traverse: "SUV", Silverado: "Truck", Tahoe: "SUV", Suburban: "SUV",
  "300": "Sedan", Pacifica: "Van",
  Charger: "Sedan", Challenger: "Coupe", Durango: "SUV", Hornet: "SUV",
  Mustang: "Coupe", "F-150": "Truck", Explorer: "SUV", Bronco: "SUV", Escape: "SUV", Edge: "SUV", Expedition: "SUV", Maverick: "Truck",
  Terrain: "SUV", Acadia: "SUV", Yukon: "SUV", Sierra: "Truck", Canyon: "Truck",
  Accord: "Sedan", Civic: "Sedan", "CR-V": "SUV", Pilot: "SUV", "HR-V": "SUV", Passport: "SUV", Ridgeline: "Truck",
  Elantra: "Sedan", Sonata: "Sedan", Tucson: "SUV", "Santa Fe": "SUV", Palisade: "SUV", "Ioniq 5": "SUV", Kona: "SUV",
  Q50: "Sedan", Q60: "Coupe", QX50: "SUV", QX60: "SUV", QX80: "SUV",
  Wrangler: "SUV", "Grand Cherokee": "SUV", Cherokee: "SUV", Compass: "SUV", Gladiator: "Truck",
  Forte: "Sedan", K5: "Sedan", Sportage: "SUV", Sorento: "SUV", Telluride: "SUV", EV6: "SUV", Soul: "SUV",
  IS: "Sedan", ES: "Sedan", RX: "SUV", NX: "SUV", GX: "SUV", LX: "SUV",
  Corsair: "SUV", Nautilus: "SUV", Aviator: "SUV", Navigator: "SUV",
  Mazda3: "Sedan", Mazda6: "Sedan", "CX-5": "SUV", "CX-9": "SUV", "CX-50": "SUV", "MX-5 Miata": "Coupe",
  "C-Class": "Sedan", "E-Class": "Sedan", "S-Class": "Sedan", GLA: "SUV", GLC: "SUV", GLE: "SUV", GLS: "SUV", EQS: "Sedan",
  Altima: "Sedan", Sentra: "Sedan", Maxima: "Sedan", Rogue: "SUV", Pathfinder: "SUV", Frontier: "Truck", Titan: "Truck", Z: "Coupe",
  "911": "Coupe", Cayenne: "SUV", Macan: "SUV", Taycan: "Sedan", Panamera: "Sedan",
  "1500": "Truck", "2500": "Truck", "3500": "Truck",
  Impreza: "Sedan", Legacy: "Sedan", Outback: "SUV", Forester: "SUV", Crosstrek: "SUV", Ascent: "SUV", WRX: "Sedan",
  "Model 3": "Sedan", "Model S": "Sedan", "Model X": "SUV", "Model Y": "SUV", Cybertruck: "Truck",
  Camry: "Sedan", Corolla: "Sedan", RAV4: "SUV", Highlander: "SUV", "4Runner": "SUV", Tacoma: "Truck", Tundra: "Truck", Supra: "Coupe", GR86: "Coupe",
  Jetta: "Sedan", Passat: "Sedan", Golf: "Sedan", Tiguan: "SUV", Atlas: "SUV", "ID.4": "SUV", Taos: "SUV",
  S60: "Sedan", S90: "Sedan", XC40: "SUV", XC60: "SUV", XC90: "SUV",
};
const locations = ["Miami FL", "Orlando FL", "Atlanta GA", "Dallas TX", "Los Angeles CA", "New York NY"];
const timeframes = ["ASAP", "1–3 days", "4–7 days", "Scheduled date"];

const cityPositions: Record<string, { x: number; y: number }> = {
  "Miami FL": { x: 80, y: 88 },
  "Orlando FL": { x: 78, y: 78 },
  "Atlanta GA": { x: 72, y: 62 },
  "Dallas TX": { x: 45, y: 72 },
  "Los Angeles CA": { x: 12, y: 62 },
  "New York NY": { x: 85, y: 35 },
};

const distances: Record<string, Record<string, number>> = {
  "Miami FL": { "New York NY": 1280, "Los Angeles CA": 2750, "Dallas TX": 1310, "Atlanta GA": 660, "Orlando FL": 235 },
  "New York NY": { "Miami FL": 1280, "Los Angeles CA": 2790, "Dallas TX": 1550, "Atlanta GA": 870, "Orlando FL": 1070 },
  "Los Angeles CA": { "Miami FL": 2750, "New York NY": 2790, "Dallas TX": 1440, "Atlanta GA": 2170, "Orlando FL": 2500 },
  "Dallas TX": { "Miami FL": 1310, "New York NY": 1550, "Los Angeles CA": 1440, "Atlanta GA": 780, "Orlando FL": 1100 },
  "Atlanta GA": { "Miami FL": 660, "New York NY": 870, "Los Angeles CA": 2170, "Dallas TX": 780, "Orlando FL": 440 },
  "Orlando FL": { "Miami FL": 235, "New York NY": 1070, "Los Angeles CA": 2500, "Dallas TX": 1100, "Atlanta GA": 440 },
};

const getDistance = (from: string, to: string): number => {
  return distances[from]?.[to] || distances[to]?.[from] || 1000;
};

const getTransitDays = (miles: number): { min: number; max: number } => {
  if (miles < 500) return { min: 2, max: 4 };
  if (miles < 1000) return { min: 3, max: 5 };
  if (miles < 2000) return { min: 5, max: 8 };
  return { min: 7, max: 10 };
};

export interface QuoteData {
  year: string;
  make: string;
  model: string;
  vehicleType: string;
  running: string;
  size: string;
  from: string;
  to: string;
  timeframe: string;
  transportType: string;
}

interface QuoteWizardProps {
  onGetEstimate?: () => void;
  quoteData: QuoteData;
  setQuoteData: React.Dispatch<React.SetStateAction<QuoteData>>;
  variant?: "compact" | "expanded";
}

const damageOptions = [
  { id: "scratches", label: "Existing scratches" },
  { id: "dents", label: "Minor dents" },
  { id: "chips", label: "Windshield chips" },
  { id: "curb", label: "Wheel curb rash" },
];

export function QuoteWizard({ onGetEstimate, quoteData, setQuoteData, variant = "expanded" }: QuoteWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [direction, setDirection] = useState(0);
  const [selectedDamage, setSelectedDamage] = useState<string[]>([]);
  const [damageNote, setDamageNote] = useState("");
  const [showQuickContact, setShowQuickContact] = useState(false);
  const [showConditionDetails, setShowConditionDetails] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [bypassSubmitted, setBypassSubmitted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isSwiping = useRef(false);

  const ROUTE_STEP = 2;
  const totalSteps = 2;

  useEffect(() => {
    setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      const firstInput = container.querySelector<HTMLElement>(
        'input:not([type="hidden"]), select, [role="combobox"], button[role="combobox"]'
      );
      firstInput?.focus({ preventScroll: true });
    }, 350);
  }, [step, showQuickContact]);

  const canAdvanceFromStep1 = quoteData.year && quoteData.make && quoteData.model;

  const goNext = useCallback(() => {
    if (step === 1 && !canAdvanceFromStep1) {
      toast({ title: "Please select year, make, and model to continue", variant: "destructive" });
      return;
    }
    if (step < totalSteps) {
      setDirection(1);
      setStep(s => s + 1);
    }
  }, [step, canAdvanceFromStep1]);

  const goBack = useCallback(() => {
    if (showQuickContact) {
      setShowQuickContact(false);
      return;
    }
    if (step > 1) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  }, [step, showQuickContact]);

  const goToStep = useCallback((target: number) => {
    if (target < step) {
      setDirection(-1);
      setStep(target);
    }
  }, [step]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      isSwiping.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !isSwiping.current) {
      touchStartRef.current = null;
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    touchStartRef.current = null;
    isSwiping.current = false;
    if (dx < -50) goNext();
    else if (dx > 50) goBack();
  }, [goNext, goBack]);

  const toggleDamage = (id: string) => {
    setSelectedDamage(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleSubmitQuote = () => {
    if (!quoteData.from || !quoteData.to) {
      toast({ title: "Please select origin and destination to continue", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    onGetEstimate?.();
  };

  const handleBypassSubmit = () => {
    if (!contactName.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    if (!contactPhone.trim() || !/^[\d\s\-\+\(\)]{7,20}$/.test(contactPhone.trim())) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    if (!contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setBypassSubmitted(true);
    setShowQuickContact(false);
    onGetEstimate?.();
  };

  const steps = [
    { number: 1, label: "Vehicle", icon: <ScanLine className="w-4 h-4" strokeWidth={1.5} /> },
    { number: 2, label: "Route", icon: <Route className="w-4 h-4" strokeWidth={1.5} /> },
  ];

  const miles = getDistance(quoteData.from, quoteData.to);
  const transit = getTransitDays(miles);
  const fromPos = cityPositions[quoteData.from];
  const toPos = cityPositions[quoteData.to];

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-[0_0_80px_-20px_hsl(var(--primary)/0.12)]" ref={containerRef}>
      {/* Progress bar */}
      <div className="flex gap-0 border-b border-border/40">
        {steps.map((s) => (
          <button
            key={s.number}
            onClick={() => {
              if (s.number < step && !submitted && !bypassSubmitted) {
                goToStep(s.number);
              }
            }}
            className={cn(
              "flex-1 py-3 px-2 flex flex-col items-center gap-1 text-[10px] uppercase tracking-wider transition-all",
              step === s.number ? "bg-primary/10 text-primary font-semibold border-b-2 border-primary" :
              step > s.number ? "text-primary/70 cursor-pointer hover:bg-primary/5" :
              "text-muted-foreground/50"
            )}
          >
            <span className="hidden sm:block">{s.label}</span>
            <span className="sm:hidden">{s.icon}</span>
          </button>
        ))}
        {step === 1 && !submitted && !bypassSubmitted && !showQuickContact && (
          <button
            onClick={() => setShowQuickContact(true)}
            className="flex items-center gap-1.5 px-3 py-3 text-[10px] uppercase tracking-wider text-primary hover:bg-primary/5 transition-all border-l border-border/40"
          >
            <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Talk to agent</span>
          </button>
        )}
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" custom={direction}>
          {/* Quick Contact View */}
          {showQuickContact && step < 2 ? (
            <motion.div
              key="quick-contact"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-4 sm:p-6 space-y-4"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold mb-1">Quick Contact</p>
                <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                  Talk to an Agent
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Quick call, clear options, then you decide.</p>
              </div>

              <div className="space-y-3 max-w-md">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Your name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="pl-9 bg-secondary border-border/60 h-11" maxLength={100} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="tel" placeholder="Phone number" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="pl-9 bg-secondary border-border/60 h-11" maxLength={20} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" placeholder="Email address" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="pl-9 bg-secondary border-border/60 h-11" maxLength={255} />
                  </div>
                </div>

                <Button variant="premium" onClick={handleBypassSubmit} className="w-full h-12 text-sm">
                  <Phone className="w-4 h-4" />
                  Have an agent call me
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Step 1: Vehicle */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="grid grid-cols-1 lg:grid-cols-2"
                >
                  {/* Left: Form */}
                  <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold mb-1">Step 1 of {totalSteps} · Vehicle</p>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                        Select Your Vehicle
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Year</Label>
                        <Select value={quoteData.year || undefined} onValueChange={(v) => setQuoteData(d => ({ ...d, year: v }))}>
                          <SelectTrigger className="bg-secondary border-border/60"><SelectValue placeholder="Select year" /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Make</Label>
                        <Select value={quoteData.make || undefined} onValueChange={(v) => { const firstModel = modelsByMake[v][0]; setQuoteData(d => ({ ...d, make: v, model: firstModel, vehicleType: modelVehicleType[firstModel] || "Sedan" })); }}>
                          <SelectTrigger className="bg-secondary border-border/60"><SelectValue placeholder="Select make" /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {makes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Model</Label>
                        <Select value={quoteData.model || undefined} onValueChange={(v) => setQuoteData(d => ({ ...d, model: v, vehicleType: modelVehicleType[v] || "Sedan" }))}>
                          <SelectTrigger className="bg-secondary border-border/60"><SelectValue placeholder="Select model" /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {modelsByMake[quoteData.make]?.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Transport Type */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Transport Type</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Open", "Enclosed"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setQuoteData(d => ({ ...d, transportType: type }))}
                            className={cn(
                              "flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all",
                              quoteData.transportType === type
                                ? "bg-foreground/[0.07] border-foreground/30 text-foreground"
                                : "bg-secondary/40 border-border/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                            )}
                          >
                            {type === "Open" ? <Car className="w-4 h-4" strokeWidth={1.5} /> : <Box className="w-4 h-4" strokeWidth={1.5} />}
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Condition Report — collapsible */}
                    <div className="rounded-xl border border-border/60 overflow-hidden">
                      <button
                        onClick={() => setShowConditionDetails(!showConditionDetails)}
                        className="flex items-center justify-between w-full p-3 sm:p-4 bg-secondary/30 hover:bg-secondary/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Scan className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                          <span className="text-sm font-medium text-foreground">Condition Report</span>
                          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Optional</span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showConditionDetails && "rotate-180")} strokeWidth={1.5} />
                      </button>

                      <AnimatePresence>
                        {showConditionDetails && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 sm:p-4 space-y-3 border-t border-border/40">
                              <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Does it run?</Label>
                                <Select value={quoteData.running || undefined} onValueChange={(v) => setQuoteData(d => ({ ...d, running: v }))}>
                                  <SelectTrigger className="bg-secondary border-border/60"><SelectValue placeholder="Select condition" /></SelectTrigger>
                                  <SelectContent className="bg-card border-border">
                                    <SelectItem value="Runs">Runs & drives</SelectItem>
                                    <SelectItem value="Doesn't Run">Doesn't run</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {damageOptions.map(d => (
                                  <label
                                    key={d.id}
                                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/40 border border-border/30 cursor-pointer hover:bg-secondary/60 transition-colors"
                                  >
                                    <Checkbox
                                      checked={selectedDamage.includes(d.id)}
                                      onCheckedChange={() => toggleDamage(d.id)}
                                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <span className="text-xs sm:text-sm text-foreground">{d.label}</span>
                                  </label>
                                ))}
                              </div>
                              <Input
                                value={damageNote}
                                onChange={(e) => setDamageNote(e.target.value)}
                                placeholder="Additional notes (optional)"
                                className="bg-secondary/40 border-border/40 text-sm h-9"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {quoteData.make && quoteData.model && (
                      <button
                        type="button"
                        onClick={() => {
                          const yearTrigger = containerRef.current?.querySelector<HTMLElement>('[role="combobox"]');
                          yearTrigger?.focus({ preventScroll: true });
                          yearTrigger?.click();
                        }}
                        className="flex lg:hidden items-center gap-2.5 mt-1 px-3 py-2 rounded-xl bg-secondary/40 border border-border/30 hover:bg-secondary/60 transition-colors w-full text-left group"
                      >
                        <Car className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate">{quoteData.year} {quoteData.make} {quoteData.model}</p>
                          <p className="text-[10px] text-muted-foreground">{quoteData.vehicleType || "Vehicle"} · {quoteData.transportType || "Open"}</p>
                        </div>
                        <Pencil className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" strokeWidth={1.5} />
                      </button>
                    )}
                    <Button
                      variant="premium"
                      onClick={goNext}
                      disabled={!canAdvanceFromStep1}
                      className="w-full h-11 text-sm mt-2"
                    >
                      Next Step
                      <ChevronRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
                    </Button>
                  </div>

                  {/* Right: 3D Vehicle Viewer — hidden on mobile */}
                  <div className="hidden lg:flex flex-col relative bg-gradient-to-b from-secondary/40 via-card to-muted/30 dark:from-[hsl(155_8%_13%)] dark:via-card dark:to-[hsl(160_10%_8%)] border-l border-border/40 min-h-[400px]">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_55%,hsl(var(--primary)/0.05),transparent)]" />
                    {/* @ts-ignore */}
                    <model-viewer
                      src="/models/car.glb"
                      alt={`${quoteData.year} ${quoteData.make} ${quoteData.model} 3D preview`}
                      camera-controls
                      auto-rotate
                      rotation-per-second="18deg"
                      camera-orbit="30deg 68deg 105%"
                      loading="eager"
                      reveal="auto"
                      environment-image="/models/studio.hdr"
                      skybox-image=""
                      shadow-intensity="1.8"
                      shadow-softness="1"
                      exposure="1.3"
                      tone-mapping="commerce"
                      style={{ width: '100%', height: '100%', backgroundColor: 'transparent', minHeight: '280px', flex: 1 }}
                    />
                    <div className="absolute bottom-3 left-3 bg-background/70 backdrop-blur-md rounded-lg px-3 py-1.5 border border-border/40">
                      <p className="text-xs font-semibold text-foreground">{quoteData.year || "Year"} {quoteData.make || "Make"} {quoteData.model || "Model"}</p>
                      <p className="text-[10px] text-muted-foreground">{quoteData.vehicleType || "Vehicle"} · {quoteData.transportType || "Transport"}</p>
                    </div>

                    {/* Spec panel at bottom */}
                    <div className="grid grid-cols-3 gap-px bg-border/60 border-t border-border/60 text-xs">
                      <div className="p-2.5 bg-card text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Est. Weight</p>
                        <p className="font-medium text-foreground text-xs">
                          {quoteData.vehicleType === "Truck" ? "5,500 lbs" : quoteData.vehicleType === "SUV" ? "4,800 lbs" : quoteData.vehicleType === "Van" ? "4,200 lbs" : "3,600 lbs"}
                        </p>
                      </div>
                      <div className="p-2.5 bg-card text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Dimensions</p>
                        <p className="font-medium text-foreground text-xs">
                          {quoteData.vehicleType === "Truck" ? "19.5' × 6.5'" : quoteData.vehicleType === "SUV" ? "16.5' × 6.2'" : quoteData.vehicleType === "Van" ? "17' × 6.3'" : "15.5' × 5.9'"}
                        </p>
                      </div>
                      <div className="p-2.5 bg-card text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Clearance</p>
                        <p className="font-medium text-foreground text-xs">
                          {quoteData.vehicleType === "Truck" ? "76 in" : quoteData.vehicleType === "SUV" ? "70 in" : quoteData.vehicleType === "Van" ? "72 in" : "57 in"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Route */}
              {step === ROUTE_STEP && (
                <motion.div
                  key="step-route"
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="grid grid-cols-1 lg:grid-cols-2"
                >
                  <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold mb-1">Step {ROUTE_STEP} of {totalSteps} · Route</p>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                        Plan Your Route
                      </h3>
                    </div>

                    {quoteData.make && quoteData.model && (
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="flex lg:hidden items-center gap-2.5 px-3 py-2 rounded-xl bg-secondary/40 border border-border/30 hover:bg-secondary/60 transition-colors w-full text-left group"
                      >
                        <Car className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate">{quoteData.year} {quoteData.make} {quoteData.model}</p>
                          <p className="text-[10px] text-muted-foreground">{quoteData.vehicleType || "Vehicle"} · {quoteData.transportType || "Open"}</p>
                        </div>
                        <Pencil className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" strokeWidth={1.5} />
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">From</Label>
                        <Select value={quoteData.from || undefined} onValueChange={(v) => setQuoteData(d => ({ ...d, from: v }))}>
                          <SelectTrigger className="bg-secondary border-border/60"><SelectValue placeholder="Select origin" /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">To</Label>
                        <Select value={quoteData.to || undefined} onValueChange={(v) => setQuoteData(d => ({ ...d, to: v }))}>
                          <SelectTrigger className="bg-secondary border-border/60"><SelectValue placeholder="Select destination" /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {locations.filter(l => l !== quoteData.from).map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Pickup Date</Label>
                        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal bg-secondary border-border/60 h-10",
                                !pickupDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={pickupDate}
                              onSelect={(date) => { setPickupDate(date); setDatePickerOpen(false); }}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Pickup Timeframe</Label>
                        <Select value={quoteData.timeframe || undefined} onValueChange={(v) => setQuoteData(d => ({ ...d, timeframe: v }))}>
                          <SelectTrigger className="bg-secondary border-border/60"><SelectValue placeholder="Select timeframe" /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {timeframes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {quoteData.from && quoteData.to && (
                      <div className="bg-secondary/30 border border-border/40 rounded-xl p-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                            <span className="text-foreground font-medium">{quoteData.from}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <span>{miles.toLocaleString()} mi</span>
                            <span>·</span>
                            <span>{transit.min}–{transit.max} days</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-medium">{quoteData.to}</span>
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" onClick={goBack} className="text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-4 h-4 mr-1" strokeWidth={1.5} />
                        Back
                      </Button>
                      <Button
                        variant="premium"
                        onClick={handleSubmitQuote}
                        disabled={!quoteData.from || !quoteData.to}
                        className="flex-1 h-11 text-sm"
                      >
                        <Sparkles className="w-4 h-4 mr-1" strokeWidth={1.5} />
                        Get My Quote
                      </Button>
                    </div>
                  </div>

                  {/* Right: Map */}
                  <div className="hidden lg:flex relative border-l border-border/40 bg-secondary/20 items-center justify-center p-4">
                    <div className="relative w-full max-w-md">
                      <img src={usMapImg} alt="US Route Map" className="w-full opacity-30" />
                      {fromPos && toPos && (() => {
                        const dx = toPos.x - fromPos.x;
                        const dy = toPos.y - fromPos.y;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        return (
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <line x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y} stroke="hsl(var(--primary) / 0.15)" strokeWidth="0.8" />
                            <line x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y} stroke="hsl(var(--primary))" strokeWidth="0.5" strokeDasharray={length} strokeDashoffset={length} strokeLinecap="round">
                              <animate attributeName="stroke-dashoffset" from={length} to="0" dur="2s" fill="freeze" begin="0.3s" calcMode="spline" keySplines="0.25 0.1 0.25 1" keyTimes="0;1" />
                            </line>
                            <circle r="1" fill="hsl(var(--primary))" opacity="0">
                              <animate attributeName="opacity" from="0" to="1" dur="0.01s" fill="freeze" begin="0.3s" />
                              <animateMotion dur="2s" fill="freeze" begin="0.3s" calcMode="spline" keySplines="0.25 0.1 0.25 1" keyTimes="0;1" path={`M${fromPos.x},${fromPos.y} L${toPos.x},${toPos.y}`} />
                              <animate attributeName="opacity" from="1" to="0" dur="0.3s" fill="freeze" begin="2.3s" />
                            </circle>
                          </svg>
                        );
                      })()}
                      {fromPos && (
                        <div className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2" style={{ left: `${fromPos.x}%`, top: `${fromPos.y}%` }}>
                          <div className="w-3 h-3 rounded-full bg-primary border-2 border-background shadow-lg" />
                          <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary/40 animate-ping" />
                        </div>
                      )}
                      {toPos && (
                        <div className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2" style={{ left: `${toPos.x}%`, top: `${toPos.y}%` }}>
                          <div className="w-3 h-3 rounded-full bg-foreground border-2 border-background shadow-lg" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {showQuickContact && !submitted && !bypassSubmitted && (
        <div className="flex items-center px-4 sm:px-6 py-3 border-t border-border/40">
          <Button variant="ghost" onClick={() => setShowQuickContact(false)} className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" strokeWidth={1.5} />
            Back to wizard
          </Button>
        </div>
      )}
    </div>
  );
}
