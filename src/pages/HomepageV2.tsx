import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowRight, Shield, Truck, Scan, Route, Sparkles, Star,
  CheckCircle, Phone, Zap, Globe, BarChart3, Lock, Play,
  MapPin, CalendarIcon, ChevronDown, Video, ShieldCheck, CreditCard,
  Headphones, ArrowDown
} from "lucide-react";
import sampleRoomLiving from "@/assets/sample-room-living.jpg";
import HeroParticlesTeal from "@/components/HeroParticlesTeal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import logoImg from "@/assets/logo.png";
import { calculateDistance } from "@/lib/distanceCalculator";
import { calculateEstimate, formatCurrency } from "@/lib/priceCalculator";
import { formatPhoneNumber, isValidPhoneNumber, getDigitsOnly } from "@/lib/phoneFormat";

// ZIP lookup
const ZIP_LOOKUP: Record<string, string> = {
  "90210": "Beverly Hills, CA", "90001": "Los Angeles, CA", "10001": "New York, NY",
  "10016": "New York, NY", "77001": "Houston, TX", "60601": "Chicago, IL",
  "33101": "Miami, FL", "85001": "Phoenix, AZ", "98101": "Seattle, WA",
  "80201": "Denver, CO", "02101": "Boston, MA", "20001": "Washington, DC",
  "33431": "Boca Raton, FL",
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
  { label: "1 Bed", value: "1 Bedroom" },
  { label: "2 Bed", value: "2 Bedroom" },
  { label: "3 Bed", value: "3 Bedroom" },
  { label: "4+ Bed", value: "4+ Bedroom" },
  { label: "Office", value: "Office" },
];

// ─── Scanner Demo Card ───
const DEMO_ITEMS = [
  { name: "3-Seat Sofa", weight: 350, cuft: 45, conf: 98, top: "42%", left: "1%", w: "34%", h: "50%" },
  { name: "Coffee Table", weight: 45, cuft: 8, conf: 96, top: "64%", left: "32%", w: "22%", h: "16%" },
  { name: "TV Console", weight: 80, cuft: 12, conf: 97, top: "32%", left: "28%", w: "36%", h: "26%" },
  { name: "Armchair", weight: 85, cuft: 18, conf: 94, top: "42%", left: "70%", w: "24%", h: "42%" },
  { name: "Floor Lamp", weight: 15, cuft: 4, conf: 91, top: "16%", left: "60%", w: "7%", h: "44%" },
];

function ScannerDemoCard() {
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);

  const startDemo = useCallback(() => {
    if (running) return;
    setRunning(true);
    setCount(0);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setCount(i);
      if (i >= DEMO_ITEMS.length) {
        clearInterval(iv);
        setTimeout(() => { setRunning(false); setCount(0); }, 3000);
      }
    }, 800);
  }, [running]);

  const totalWeight = DEMO_ITEMS.slice(0, count).reduce((s, x) => s + x.weight, 0);

  return (
    <div className="md:col-span-2 group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 overflow-hidden hover:border-[hsl(175,70%,40%)/0.3] transition-all duration-500">
      <div className="absolute top-0 right-0 w-[50%] h-[60%] bg-[hsl(175,70%,30%)] opacity-[0.05] blur-[80px] group-hover:opacity-[0.1] transition-opacity" />
      <div className="relative flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="w-10 h-10 rounded-xl bg-[hsl(175,70%,40%)/0.1] border border-[hsl(175,70%,40%)/0.2] flex items-center justify-center mb-4">
            <Scan className="w-5 h-5 text-[hsl(175,70%,50%)]" />
          </div>
          <h3 className="text-xl font-semibold mb-1">AI Room Scanner</h3>
          <p className="text-white/40 text-sm max-w-sm">Point your camera at any room — AI identifies furniture, calculates weight and volume in seconds.</p>
        </div>
        <button
          onClick={startDemo}
          disabled={running}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(175,70%,40%)/0.15] border border-[hsl(175,70%,40%)/0.3] text-[hsl(175,70%,55%)] text-xs font-medium hover:bg-[hsl(175,70%,40%)/0.25] transition-colors disabled:opacity-50"
        >
          {running ? <><Sparkles className="w-3.5 h-3.5 animate-spin" /> Scanning...</> : <><Play className="w-3.5 h-3.5" /> Run Demo</>}
        </button>
      </div>
      <div className="relative rounded-xl border border-white/[0.06] bg-[hsl(200,15%,6%)] overflow-hidden">
        <img src={sampleRoomLiving} alt="Room scan" className="w-full h-56 object-cover" />
        {running && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[hsl(175,70%,50%)] to-transparent opacity-60 animate-[scanLine_2s_ease-in-out_infinite]" />
          </div>
        )}
        {DEMO_ITEMS.slice(0, count).map((item) => (
          <div
            key={item.name}
            className="absolute border border-[hsl(175,70%,50%)/0.6] rounded-sm animate-[fadeIn_0.3s_ease-out]"
            style={{ top: item.top, left: item.left, width: item.w, height: item.h }}
          >
            <span className="absolute -top-5 left-0 text-[10px] px-1.5 py-0.5 rounded bg-[hsl(175,70%,40%)/0.9] text-white font-medium whitespace-nowrap">
              {item.name} · {item.conf}%
            </span>
            <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[hsl(175,70%,50%)]" />
            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[hsl(175,70%,50%)]" />
            <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[hsl(175,70%,50%)]" />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[hsl(175,70%,50%)]" />
          </div>
        ))}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span className="text-[hsl(175,70%,55%)] font-semibold">{count} items</span>
            <span>·</span>
            <span>{totalWeight} lbs</span>
          </div>
          {count > 0 && (
            <Link to="/scan-room" className="text-[10px] text-[hsl(175,70%,55%)] hover:underline">
              Try Full Scanner →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function HomepageV2() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Quote form state
  const [fromZip, setFromZip] = useState("");
  const [toZip, setToZip] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [moveDate, setMoveDate] = useState<Date | null>(null);
  const [size, setSize] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // ZIP handlers
  const handleFromZip = useCallback(async (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 5);
    setFromZip(clean);
    if (clean.length === 5) {
      const city = await lookupZip(clean);
      setFromCity(city || "");
    } else setFromCity("");
  }, []);

  const handleToZip = useCallback(async (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 5);
    setToZip(clean);
    if (clean.length === 5) {
      const city = await lookupZip(clean);
      setToCity(city || "");
    } else setToCity("");
  }, []);

  // Estimate calculation
  const distance = useMemo(() => calculateDistance(fromZip, toZip), [fromZip, toZip]);
  const moveType = distance > 150 ? "long-distance" : "local";

  const estimate = useMemo(() => {
    if (!size || distance <= 0) return null;
    const sizeWeights: Record<string, number> = {
      'Studio': 2000, '1 Bedroom': 3000, '2 Bedroom': 5000,
      '3 Bedroom': 7000, '4+ Bedroom': 10000, 'Office': 4000,
    };
    const weight = sizeWeights[size] || 4000;
    return calculateEstimate(weight, distance, moveType);
  }, [size, distance, moveType]);

  const estimatedDuration = useMemo(() => {
    if (distance <= 0) return null;
    if (distance < 50) return "1 day";
    if (distance < 200) return "1-2 days";
    if (distance < 500) return "2-3 days";
    if (distance < 1000) return "3-5 days";
    if (distance < 2000) return "5-7 days";
    return "7-10 days";
  }, [distance]);

  // Handle quote submission
  const handleGetEstimate = () => {
    localStorage.setItem("tm_lead", JSON.stringify({
      fromZip, toZip, fromCity, toCity,
      moveDate: moveDate?.toISOString(), size,
      ts: Date.now()
    }));
    navigate("/online-estimate");
  };

  // Contact form
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("tm_lead_contact", JSON.stringify({
      name: contactName, email: contactEmail, phone: contactPhone, ts: Date.now()
    }));
    setContactSubmitted(true);
  };

  const formReady = fromZip.length === 5 && toZip.length === 5 && fromCity && toCity;

  // Shared styles
  const inputClass = "w-full h-11 bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(175,70%,40%)/0.5] focus:ring-1 focus:ring-[hsl(175,70%,40%)/0.2] transition-colors";

  return (
    <div className="min-h-screen bg-[hsl(200,15%,8%)] text-white font-sans overflow-x-hidden">
      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[hsl(200,15%,8%)/0.85] border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/homepage-2" className="flex items-center gap-2.5">
            <img src={logoImg} alt="TruMove" className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">TruMove</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <Link to="/online-estimate" className="hover:text-white transition-colors">Estimate</Link>
            <Link to="/scan-room" className="hover:text-white transition-colors">AI Scanner</Link>
            <Link to="/vetting" className="hover:text-white transition-colors">Carrier Vetting</Link>
            <Link to="/track" className="hover:text-white transition-colors">Track Shipment</Link>
            <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/agent-login">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5">
                Sign In
              </Button>
            </Link>
            <Link to="/book">
              <Button size="sm" className="bg-[hsl(175,70%,40%)] hover:bg-[hsl(175,70%,35%)] text-white border-0 rounded-lg px-5">
                Book a Call
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO WITH QUOTE FORM */}
      <section className="relative pt-16 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Mesh gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] rounded-full bg-[hsl(175,80%,30%)] opacity-[0.07] blur-[120px]" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[70%] rounded-full bg-[hsl(200,80%,35%)] opacity-[0.06] blur-[100px]" />
          <div className="absolute top-[30%] right-[20%] w-[30%] h-[40%] rounded-full bg-[hsl(160,60%,25%)] opacity-[0.05] blur-[80px]" />
        </div>
        <HeroParticlesTeal className="z-0" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
            {/* Left: Headline + trust */}
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(175,70%,40%)/0.3] bg-[hsl(175,70%,40%)/0.08] mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[hsl(175,70%,50%)]" />
                <span className="text-xs font-medium text-[hsl(175,70%,60%)]">AI-Powered Moving Platform</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5">
                Move smarter,{" "}
                <span className="bg-gradient-to-r from-[hsl(175,80%,50%)] to-[hsl(200,80%,55%)] bg-clip-text text-transparent">
                  not harder.
                </span>
              </h1>
              <p className="text-base md:text-lg text-white/50 max-w-md mb-8 leading-relaxed">
                AI scans your home, matches FMCSA-vetted carriers, and gives you instant pricing — all before a single box is packed.
              </p>
              <div className="flex flex-wrap items-center gap-5 text-xs text-white/40">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[hsl(175,70%,50%)]" /> FMCSA Verified</span>
                <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[hsl(175,70%,50%)]" /> 256-bit Encryption</span>
                <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-[hsl(175,70%,50%)]" /> 4.9/5 Rating</span>
              </div>
            </div>

            {/* Right: Quote Form Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 md:p-8 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-1">Get Your Estimate</h2>
              <p className="text-xs text-white/40 mb-6">Instant AI-powered pricing. No obligations.</p>

              <div className="space-y-4">
                {/* From / To */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-white/50 uppercase tracking-wider mb-1.5 block">From ZIP</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={fromZip}
                        onChange={(e) => handleFromZip(e.target.value)}
                        placeholder="e.g. 10001"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                    {fromCity && <span className="text-[10px] text-[hsl(175,70%,55%)] mt-1 block">{fromCity}</span>}
                  </div>
                  <div>
                    <label className="text-[11px] text-white/50 uppercase tracking-wider mb-1.5 block">To ZIP</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={toZip}
                        onChange={(e) => handleToZip(e.target.value)}
                        placeholder="e.g. 90001"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                    {toCity && <span className="text-[10px] text-[hsl(175,70%,55%)] mt-1 block">{toCity}</span>}
                  </div>
                </div>

                {/* Distance badge */}
                {distance > 0 && (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[hsl(175,70%,40%)/0.08] border border-[hsl(175,70%,40%)/0.15]">
                    <Route className="w-4 h-4 text-[hsl(175,70%,55%)]" />
                    <span className="text-sm font-medium text-[hsl(175,70%,55%)]">{distance.toLocaleString()} miles</span>
                    {estimatedDuration && <span className="text-xs text-white/40 ml-auto">{estimatedDuration}</span>}
                  </div>
                )}

                {/* Date + Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-white/50 uppercase tracking-wider mb-1.5 block">Move Date</label>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <button className={`${inputClass} flex items-center justify-between text-left`}>
                          <span className={moveDate ? "text-white" : "text-white/30"}>
                            {moveDate ? format(moveDate, "MMM d, yyyy") : "Select date"}
                          </span>
                          <CalendarIcon className="w-3.5 h-3.5 text-white/30" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[hsl(200,15%,12%)] border-white/10" align="start">
                        <Calendar
                          mode="single"
                          selected={moveDate || undefined}
                          onSelect={(d) => { setMoveDate(d || null); setDateOpen(false); }}
                          disabled={(d) => d < new Date()}
                          className="text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-[11px] text-white/50 uppercase tracking-wider mb-1.5 block">Home Size</label>
                    <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
                      <PopoverTrigger asChild>
                        <button className={`${inputClass} flex items-center justify-between text-left`}>
                          <span className={size ? "text-white" : "text-white/30"}>
                            {size || "Select size"}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-1 bg-[hsl(200,15%,12%)] border-white/10" align="start">
                        {MOVE_SIZES.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => { setSize(s.value); setSizeOpen(false); }}
                            className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/[0.06] rounded-md transition-colors"
                          >
                            {s.label}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Estimate result */}
                {estimate && (
                  <div className="rounded-lg bg-[hsl(175,70%,40%)/0.1] border border-[hsl(175,70%,40%)/0.2] p-4 text-center">
                    <span className="text-xs text-white/50 block mb-1">Estimated Range</span>
                    <span className="text-2xl font-bold text-[hsl(175,70%,55%)]">
                      {formatCurrency(estimate.min)} – {formatCurrency(estimate.max)}
                    </span>
                  </div>
                )}

                {/* CTA */}
                <Button
                  onClick={handleGetEstimate}
                  disabled={!formReady}
                  className="w-full h-12 bg-[hsl(175,70%,40%)] hover:bg-[hsl(175,70%,35%)] text-white border-0 rounded-xl text-base font-semibold shadow-[0_0_30px_hsl(175,70%,40%,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {estimate ? "View Full Estimate" : "Get Your Estimate"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-[10px] text-white/25 text-center">No credit card required · Free estimate · Takes 60 seconds</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO FEATURE GRID */}
      <section id="features" className="relative py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to move</h2>
            <p className="text-white/40 max-w-lg mx-auto">Precision at speed, without the grind.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <ScannerDemoCard />

            {/* Carrier Vetting card */}
            <div
              onClick={() => navigate("/vetting")}
              className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 overflow-hidden hover:border-[hsl(175,70%,40%)/0.3] transition-all duration-500 cursor-pointer"
            >
              <div className="absolute bottom-0 left-0 w-[60%] h-[50%] bg-[hsl(200,80%,35%)] opacity-[0.05] blur-[60px] group-hover:opacity-[0.1] transition-opacity" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-[hsl(200,70%,40%)/0.1] border border-[hsl(200,70%,40%)/0.2] flex items-center justify-center mb-5">
                  <Shield className="w-5 h-5 text-[hsl(200,70%,55%)]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Carrier Vetting</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Every carrier is verified through FMCSA's SAFER database. Licenses, insurance, complaints, and safety ratings checked.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    { label: "Carriers Vetted", value: "12,400+" },
                    { label: "Claims Ratio", value: "< 0.3%" },
                    { label: "Avg Rating", value: "4.9/5" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between border-b border-white/[0.04] pb-2.5">
                      <span className="text-xs text-white/30">{stat.label}</span>
                      <span className="text-sm font-semibold text-[hsl(175,70%,55%)]">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <span className="text-xs text-[hsl(175,70%,55%)] mt-4 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Check a carrier <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Bottom row - 3 feature cards linking to pages */}
            <div
              onClick={() => navigate("/track")}
              className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 overflow-hidden hover:border-[hsl(175,70%,40%)/0.3] transition-all duration-500 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[hsl(175,70%,40%)/0.1] border border-[hsl(175,70%,40%)/0.2] flex items-center justify-center mb-4">
                <Route className="w-4 h-4 text-[hsl(175,70%,55%)]" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">Real-Time Tracking</h3>
              <p className="text-white/40 text-sm leading-relaxed">GPS tracking with live ETA updates, weather alerts, and driver communication.</p>
              <span className="text-xs text-[hsl(175,70%,55%)] mt-3 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Track now <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            <div
              onClick={() => navigate("/online-estimate")}
              className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 overflow-hidden hover:border-[hsl(175,70%,40%)/0.3] transition-all duration-500 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[hsl(200,70%,40%)/0.1] border border-[hsl(200,70%,40%)/0.2] flex items-center justify-center mb-4">
                <BarChart3 className="w-4 h-4 text-[hsl(200,70%,55%)]" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">Instant Pricing</h3>
              <p className="text-white/40 text-sm leading-relaxed">AI-calculated estimates based on distance, weight, season, and market rates.</p>
              <span className="text-xs text-[hsl(200,70%,55%)] mt-3 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Get estimate <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            <div
              onClick={() => navigate("/book")}
              className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 overflow-hidden hover:border-[hsl(175,70%,40%)/0.3] transition-all duration-500 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[hsl(160,70%,40%)/0.1] border border-[hsl(160,70%,40%)/0.2] flex items-center justify-center mb-4">
                <Video className="w-4 h-4 text-[hsl(160,70%,55%)]" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">Video Consultation</h3>
              <p className="text-white/40 text-sm leading-relaxed">Live walk-through with a moving specialist for an accurate, personalized quote.</p>
              <span className="text-xs text-[hsl(160,70%,55%)] mt-3 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Book a call <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* WHY TRUMOVE - Feature Details */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why TruMove</h2>
            <p className="text-white/40 max-w-lg mx-auto">Built different. Verified always.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Scan, title: "Computer Vision Inventory", desc: "Our neural network detects furniture, estimates cubic footage, and calculates weight — eliminating guesswork." },
              { icon: Video, title: "Live Video Walk-Through", desc: "A specialist joins you via video to walk your home room-by-room. They catch details photos miss." },
              { icon: ShieldCheck, title: "FMCSA Safety Intelligence", desc: "Real-time data from SAFER Web Services — checking authority, crash history, and compliance ratings." },
              { icon: Shield, title: "License Verification Engine", desc: "Every carrier validated for active MC and USDOT numbers. Revoked or lapsed licenses get flagged instantly." },
              { icon: CreditCard, title: "Coverage Validation", desc: "We confirm cargo, liability, and bodily injury coverage meets or exceeds federal minimums." },
              { icon: Zap, title: "Zero Black Box", desc: "Real-time status updates, no hidden fees, no corporate runaround. You see exactly what we see." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-6 hover:border-white/[0.12] transition-colors">
                <f.icon className="w-5 h-5 text-[hsl(175,70%,55%)] mb-4" />
                <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative py-24 border-t border-white/[0.04]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[30%] w-[40%] h-[60%] rounded-full bg-[hsl(175,60%,25%)] opacity-[0.04] blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-white/40 max-w-lg mx-auto">Three steps. Zero chaos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Scan Your Space", desc: "Open the AI scanner and point your camera at each room. We detect and catalog everything automatically.", icon: Scan, link: "/scan-room" },
              { step: "02", title: "Get Matched", desc: "Our algorithm matches your move profile with FMCSA-vetted carriers optimized for your route and timeline.", icon: Shield, link: "/vetting" },
              { step: "03", title: "Move with Confidence", desc: "Track your shipment in real-time, communicate with your driver, and enjoy a stress-free move.", icon: Truck, link: "/track" },
            ].map((item) => (
              <div
                key={item.step}
                onClick={() => navigate(item.link)}
                className="relative group cursor-pointer"
              >
                <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 h-full hover:border-[hsl(175,70%,40%)/0.2] transition-all">
                  <span className="text-5xl font-black text-white/[0.04] absolute top-4 right-6">{item.step}</span>
                  <div className="w-12 h-12 rounded-xl bg-[hsl(175,70%,40%)/0.1] border border-[hsl(175,70%,40%)/0.15] flex items-center justify-center mb-6">
                    <item.icon className="w-5 h-5 text-[hsl(175,70%,50%)]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                  <span className="text-xs text-[hsl(175,70%,55%)] mt-4 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Get started <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by thousands</h2>
            <p className="text-white/40">Real moves, real reviews.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah K.", location: "NYC → LA", quote: "The AI scanner was mind-blowing. It cataloged my entire apartment in under 5 minutes.", rating: 5 },
              { name: "James T.", location: "Chicago → Miami", quote: "Best moving experience I've ever had. The real-time tracking gave me total peace of mind.", rating: 5 },
              { name: "Lisa M.", location: "Austin → Seattle", quote: "Saved $1,200 compared to other quotes. The carrier they matched me with was fantastic.", rating: 5 },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[hsl(45,90%,55%)] text-[hsl(45,90%,55%)]" />
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div>
                  <span className="text-sm font-medium">{t.name}</span>
                  <span className="text-xs text-white/30 ml-2">{t.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + CONTACT FORM */}
      <section id="contact" className="relative py-24 border-t border-white/[0.04]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-[20%] w-[60%] h-full bg-[hsl(175,70%,30%)] opacity-[0.04] blur-[120px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: CTA text */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to move<br />the right way?</h2>
              <p className="text-white/40 text-lg mb-8">
                Get your AI-powered estimate in under 60 seconds. Or talk to a specialist.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/online-estimate">
                  <Button className="h-12 px-8 bg-[hsl(175,70%,40%)] hover:bg-[hsl(175,70%,35%)] text-white border-0 rounded-xl text-base font-semibold shadow-[0_0_30px_hsl(175,70%,40%,0.25)]">
                    Get Estimate <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/customer-service">
                  <Button variant="outline" className="h-12 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-base">
                    <Headphones className="w-4 h-4 mr-2" /> Contact Us
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Quick contact form */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 md:p-8">
              {contactSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-10 h-10 text-[hsl(175,70%,50%)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">We'll be in touch!</h3>
                  <p className="text-sm text-white/40">A TruMove specialist will reach out within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <h3 className="text-base font-semibold mb-1">Request a Callback</h3>
                  <p className="text-xs text-white/40 mb-4">We'll call you back within the hour.</p>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full name"
                    required
                    className={inputClass}
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className={inputClass}
                  />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(formatPhoneNumber(e.target.value))}
                    placeholder="(555) 123-4567"
                    required
                    className={inputClass}
                  />
                  <Button
                    type="submit"
                    disabled={!contactName || !contactEmail.includes("@") || !isValidPhoneNumber(contactPhone)}
                    className="w-full h-11 bg-[hsl(175,70%,40%)] hover:bg-[hsl(175,70%,35%)] text-white border-0 rounded-xl font-semibold disabled:opacity-40"
                  >
                    <Phone className="w-4 h-4 mr-2" /> Request Callback
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src={logoImg} alt="TruMove" className="h-6 w-6" />
                <span className="text-sm font-semibold">TruMove</span>
              </div>
              <p className="text-xs text-white/30 leading-relaxed">AI-powered moving platform. FMCSA-vetted carriers, instant estimates, real-time tracking.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">Services</h4>
              <div className="space-y-2">
                <Link to="/online-estimate" className="block text-xs text-white/30 hover:text-white/60 transition-colors">Online Estimate</Link>
                <Link to="/scan-room" className="block text-xs text-white/30 hover:text-white/60 transition-colors">AI Room Scanner</Link>
                <Link to="/vetting" className="block text-xs text-white/30 hover:text-white/60 transition-colors">Carrier Vetting</Link>
                <Link to="/track" className="block text-xs text-white/30 hover:text-white/60 transition-colors">Live Tracking</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">Company</h4>
              <div className="space-y-2">
                <Link to="/about" className="block text-xs text-white/30 hover:text-white/60 transition-colors">About</Link>
                <Link to="/faq" className="block text-xs text-white/30 hover:text-white/60 transition-colors">FAQ</Link>
                <Link to="/customer-service" className="block text-xs text-white/30 hover:text-white/60 transition-colors">Customer Service</Link>
                <Link to="/book" className="block text-xs text-white/30 hover:text-white/60 transition-colors">Book a Call</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">Legal</h4>
              <div className="space-y-2">
                <Link to="/privacy" className="block text-xs text-white/30 hover:text-white/60 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="block text-xs text-white/30 hover:text-white/60 transition-colors">Terms of Service</Link>
                <Link to="/portal" className="block text-xs text-white/30 hover:text-white/60 transition-colors">Customer Portal</Link>
                <Link to="/" className="block text-xs text-white/30 hover:text-white/60 transition-colors">Classic Site</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.04] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs text-white/25">© 2026 TruMove. All rights reserved.</span>
            <div className="flex items-center gap-4 text-xs text-white/25">
              <span>FMCSA Licensed</span>
              <span>·</span>
              <span>USDOT Compliant</span>
              <span>·</span>
              <span>Insured & Bonded</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
