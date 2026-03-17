import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowRight, Shield, Truck, Scan, Route, Sparkles, Star,
  CheckCircle, Phone, Zap, Globe, BarChart3, Lock, Play,
  MapPin, CalendarIcon, ChevronDown, Video, ShieldCheck, CreditCard,
  Headphones, Search, Palette, Package, Navigation, Users, Settings, Link2, Rocket
} from "lucide-react";
import sampleRoomLiving from "@/assets/sample-room-living.jpg";
import HeroParticlesTeal from "@/components/HeroParticlesTeal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import logoImg from "@/assets/logo.png";
import heroDeviceMockup from "@/assets/hero-device-mockup.png";
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
    <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(200, 35%, 12%) 0%, hsl(195, 30%, 8%) 100%)" }}>
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-2xl" style={{ 
        background: "linear-gradient(135deg, hsl(175, 70%, 40%, 0.3), hsl(20, 90%, 55%, 0.2), hsl(175, 70%, 40%, 0.1))",
        padding: "1px",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "xor",
        WebkitMaskComposite: "xor",
        pointerEvents: "none",
      }} />
      
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "hsl(175, 70%, 40%, 0.12)", border: "1px solid hsl(175, 70%, 40%, 0.2)" }}>
              <Scan className="w-5 h-5" style={{ color: "hsl(175, 70%, 55%)" }} />
            </div>
            <h3 className="text-xl font-bold mb-1.5" style={{ color: "hsl(195, 30%, 95%)" }}>AI Room Scanner</h3>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "hsl(200, 20%, 50%)" }}>
              Point your camera at any room — AI identifies furniture, calculates weight and volume in seconds.
            </p>
          </div>
          <button
            onClick={startDemo}
            disabled={running}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
            style={{
              background: "hsl(175, 70%, 40%, 0.15)",
              border: "1px solid hsl(175, 70%, 40%, 0.3)",
              color: "hsl(175, 70%, 60%)",
            }}
          >
            {running ? <><Sparkles className="w-3.5 h-3.5 animate-spin" /> Scanning...</> : <><Play className="w-3.5 h-3.5" /> Run Demo</>}
          </button>
        </div>

        <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid hsl(200, 30%, 18%)" }}>
          <img src={sampleRoomLiving} alt="Room scan" className="w-full h-56 object-cover" />
          {running && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute left-0 right-0 h-0.5 animate-[scanLine_2s_ease-in-out_infinite]" style={{ background: "linear-gradient(to right, transparent, hsl(175, 70%, 50%), transparent)", opacity: 0.6 }} />
            </div>
          )}
          {DEMO_ITEMS.slice(0, count).map((item) => (
            <div
              key={item.name}
              className="absolute rounded-sm animate-[fadeIn_0.3s_ease-out]"
              style={{ top: item.top, left: item.left, width: item.w, height: item.h, border: "1px solid hsl(175, 70%, 50%, 0.6)" }}
            >
              <span className="absolute -top-5 left-0 text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap" style={{ background: "hsl(175, 70%, 40%, 0.9)", color: "white" }}>
                {item.name} · {item.conf}%
              </span>
              <span className="absolute top-0 left-0 w-2 h-2" style={{ borderTop: "2px solid hsl(175, 70%, 50%)", borderLeft: "2px solid hsl(175, 70%, 50%)" }} />
              <span className="absolute top-0 right-0 w-2 h-2" style={{ borderTop: "2px solid hsl(175, 70%, 50%)", borderRight: "2px solid hsl(175, 70%, 50%)" }} />
              <span className="absolute bottom-0 left-0 w-2 h-2" style={{ borderBottom: "2px solid hsl(175, 70%, 50%)", borderLeft: "2px solid hsl(175, 70%, 50%)" }} />
              <span className="absolute bottom-0 right-0 w-2 h-2" style={{ borderBottom: "2px solid hsl(175, 70%, 50%)", borderRight: "2px solid hsl(175, 70%, 50%)" }} />
            </div>
          ))}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between" style={{ background: "linear-gradient(to top, hsla(200, 30%, 5%, 0.85), transparent)" }}>
            <div className="flex items-center gap-3 text-xs" style={{ color: "hsl(200, 20%, 50%)" }}>
              <span className="font-semibold" style={{ color: "hsl(175, 70%, 55%)" }}>{count} items</span>
              <span>·</span>
              <span>{totalWeight} lbs</span>
            </div>
            {count > 0 && (
              <Link to="/site/scan-room" className="text-[10px] hover:underline" style={{ color: "hsl(175, 70%, 55%)" }}>
                Try Full Scanner →
              </Link>
            )}
          </div>
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

  const handleGetEstimate = () => {
    localStorage.setItem("tm_lead", JSON.stringify({
      fromZip, toZip, fromCity, toCity,
      moveDate: moveDate?.toISOString(), size,
      ts: Date.now()
    }));
    navigate("/site/online-estimate");
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("tm_lead_contact", JSON.stringify({
      name: contactName, email: contactEmail, phone: contactPhone, ts: Date.now()
    }));
    setContactSubmitted(true);
  };

  const formReady = fromZip.length === 5 && toZip.length === 5 && fromCity && toCity;

  // Colors
  const navy = "hsl(200, 30%, 8%)";
  const navyLight = "hsl(200, 25%, 12%)";
  const navyCard = "hsl(200, 28%, 11%)";
  const teal = "hsl(175, 70%, 42%)";
  const tealBright = "hsl(175, 70%, 55%)";
  const tealGlow = "hsl(175, 70%, 40%, 0.15)";
  const textPrimary = "hsl(195, 30%, 95%)";
  const textSecondary = "hsl(200, 20%, 50%)";
  const textMuted = "hsl(200, 15%, 35%)";
  const borderSubtle = "hsl(200, 25%, 16%)";
  const orange = "hsl(20, 90%, 55%)";

  const inputClass = `w-full h-11 rounded-lg px-3 text-sm transition-all focus:outline-none`;

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: navy, color: textPrimary }}>

      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "hsl(200, 30%, 8%, 0.9)", borderBottom: `1px solid ${borderSubtle}` }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/homepage-2" className="flex items-center gap-2.5">
            <img src={logoImg} alt="TruMove" className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">TruMove</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: textSecondary }}>
            <Link to="/site/online-estimate" className="hover:text-white transition-colors">Estimate</Link>
            <Link to="/site/scan-room" className="hover:text-white transition-colors">AI Scanner</Link>
            <Link to="/site/vetting" className="hover:text-white transition-colors">Carrier Vetting</Link>
            <Link to="/site/track" className="hover:text-white transition-colors">Track Shipment</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="hover:bg-white/5" style={{ color: textSecondary }}>
                Log in
              </Button>
            </Link>
            <Link to="/site/book">
              <Button size="sm" className="border-0 rounded-lg px-5 font-semibold" style={{ background: teal, color: "white" }}>
                Buy Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] rounded-full opacity-[0.08] blur-[120px]" style={{ background: "hsl(175, 80%, 35%)" }} />
          <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[70%] rounded-full opacity-[0.06] blur-[100px]" style={{ background: "hsl(200, 80%, 40%)" }} />
        </div>
        {/* Faded truck mockup behind hero text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src={heroDeviceMockup}
            alt=""
            aria-hidden="true"
            className="w-[90%] max-w-4xl opacity-[0.12]"
            style={{ filter: "blur(1px) saturate(1.2)", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }}
          />
        </div>
        <HeroParticlesTeal className="z-0" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ border: `1px solid hsl(175, 70%, 40%, 0.3)`, background: tealGlow }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: teal }}>
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-medium" style={{ color: tealBright }}>Introducing the latest version of TruMove AI</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
            AI-Powered Moving,{" "}
            <br className="hidden md:block" />
            <span style={{ background: `linear-gradient(135deg, ${tealBright}, hsl(200, 80%, 60%))`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              scaled like a pro
            </span>
          </h1>

          <p className="text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: textSecondary }}>
            Explore an intelligent moving platform that empowers you to get accurate quotes, vetted carriers, and real-time tracking — all in one place.
          </p>

          {/* CTA */}
          <Link to="/site/online-estimate">
            <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:brightness-110" style={{ background: teal, boxShadow: `0 0 40px hsl(175, 70%, 40%, 0.35), 0 4px 20px hsl(175, 70%, 40%, 0.2)` }}>
              Get Estimate
            </button>
          </Link>
        </div>

      </section>

      {/* ─── HERO PRODUCT SHOWCASE — Quote Form as "Device" ─── */}
      <section className="relative pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden" style={{
            background: `linear-gradient(180deg, ${navyCard} 0%, hsl(200, 30%, 6%) 100%)`,
            border: `1px solid hsl(200, 25%, 18%)`,
            boxShadow: `0 0 80px hsl(175, 70%, 35%, 0.12), 0 0 160px hsl(20, 80%, 50%, 0.06), 0 30px 60px hsl(200, 30%, 4%, 0.6)`,
          }}>
            {/* Orange/teal glow on edges */}
            <div className="absolute -top-1 -left-1 -right-1 h-1 rounded-t-3xl" style={{ background: `linear-gradient(90deg, ${orange}, ${teal}, ${orange})`, opacity: 0.6 }} />
            <div className="absolute -bottom-1 -left-1 -right-1 h-1 rounded-b-3xl" style={{ background: `linear-gradient(90deg, ${teal}, ${orange}, ${teal})`, opacity: 0.3 }} />

            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full" style={{ background: "hsl(0, 70%, 55%)" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "hsl(45, 90%, 55%)" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "hsl(145, 70%, 45%)" }} />
                <span className="ml-3 text-xs font-mono" style={{ color: textMuted }}>trumove.app/estimate</span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold mb-2">Get Your Instant Estimate</h2>
              <p className="text-sm mb-8" style={{ color: textSecondary }}>AI-powered pricing. No obligations. Takes 60 seconds.</p>

              <div className="space-y-5">
                {/* From / To */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider mb-2 block font-medium" style={{ color: textMuted }}>From ZIP</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textMuted }} />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={fromZip}
                        onChange={(e) => handleFromZip(e.target.value)}
                        placeholder="e.g. 10001"
                        className={inputClass}
                        style={{
                          background: "hsl(200, 30%, 10%)",
                          border: `1px solid ${borderSubtle}`,
                          color: textPrimary,
                          paddingLeft: "2.25rem",
                        }}
                      />
                    </div>
                    {fromCity && <span className="text-[10px] mt-1.5 block font-medium" style={{ color: tealBright }}>{fromCity}</span>}
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider mb-2 block font-medium" style={{ color: textMuted }}>To ZIP</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textMuted }} />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={toZip}
                        onChange={(e) => handleToZip(e.target.value)}
                        placeholder="e.g. 90001"
                        className={inputClass}
                        style={{
                          background: "hsl(200, 30%, 10%)",
                          border: `1px solid ${borderSubtle}`,
                          color: textPrimary,
                          paddingLeft: "2.25rem",
                        }}
                      />
                    </div>
                    {toCity && <span className="text-[10px] mt-1.5 block font-medium" style={{ color: tealBright }}>{toCity}</span>}
                  </div>
                </div>

                {/* Distance badge */}
                {distance > 0 && (
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg" style={{ background: tealGlow, border: `1px solid hsl(175, 70%, 40%, 0.2)` }}>
                    <Route className="w-4 h-4" style={{ color: tealBright }} />
                    <span className="text-sm font-semibold" style={{ color: tealBright }}>{distance.toLocaleString()} miles</span>
                    {estimatedDuration && <span className="text-xs ml-auto" style={{ color: textSecondary }}>{estimatedDuration}</span>}
                  </div>
                )}

                {/* Date + Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider mb-2 block font-medium" style={{ color: textMuted }}>Move Date</label>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <button className={`${inputClass} flex items-center justify-between text-left`} style={{
                          background: "hsl(200, 30%, 10%)",
                          border: `1px solid ${borderSubtle}`,
                          color: moveDate ? textPrimary : textMuted,
                        }}>
                          <span>{moveDate ? format(moveDate, "MMM d, yyyy") : "Select date"}</span>
                          <CalendarIcon className="w-4 h-4" style={{ color: textMuted }} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" style={{ background: navyLight, border: `1px solid ${borderSubtle}` }} align="start">
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
                    <label className="text-[11px] uppercase tracking-wider mb-2 block font-medium" style={{ color: textMuted }}>Home Size</label>
                    <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
                      <PopoverTrigger asChild>
                        <button className={`${inputClass} flex items-center justify-between text-left`} style={{
                          background: "hsl(200, 30%, 10%)",
                          border: `1px solid ${borderSubtle}`,
                          color: size ? textPrimary : textMuted,
                        }}>
                          <span>{size || "Select size"}</span>
                          <ChevronDown className="w-4 h-4" style={{ color: textMuted }} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-1" style={{ background: navyLight, border: `1px solid ${borderSubtle}` }} align="start">
                        {MOVE_SIZES.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => { setSize(s.value); setSizeOpen(false); }}
                            className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-white/[0.06]"
                            style={{ color: "hsl(200, 20%, 75%)" }}
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
                  <div className="rounded-xl p-5 text-center" style={{ background: tealGlow, border: `1px solid hsl(175, 70%, 40%, 0.25)` }}>
                    <span className="text-xs block mb-1" style={{ color: textSecondary }}>Estimated Range</span>
                    <span className="text-3xl font-bold" style={{ color: tealBright }}>
                      {formatCurrency(estimate.min)} – {formatCurrency(estimate.max)}
                    </span>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handleGetEstimate}
                  disabled={!formReady}
                  className="w-full h-12 rounded-xl text-base font-semibold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:brightness-110"
                  style={{
                    background: teal,
                    boxShadow: formReady ? `0 0 30px hsl(175, 70%, 40%, 0.3)` : "none",
                  }}
                >
                  {estimate ? "View Full Estimate" : "Get Your Estimate"} <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-center" style={{ color: textMuted }}>No credit card required · Free estimate · Takes 60 seconds</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4-ICON FEATURE STRIP ─── */}
      <section className="py-16" style={{ borderTop: `1px solid ${borderSubtle}` }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Search, label: "Scan and catalog", desc: "AI identifies thousands of furniture items in seconds." },
              { icon: Palette, label: "Design your move", desc: "Customized plans for every room, route, and timeline." },
              { icon: Package, label: "Deliver and protect", desc: "Full-coverage insurance with FMCSA-vetted carriers." },
              { icon: Navigation, label: "In-Transit tracking", desc: "Real-time GPS updates from pickup to delivery." },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: tealGlow, border: `1px solid hsl(175, 70%, 40%, 0.2)` }}>
                  <item.icon className="w-5 h-5" style={{ color: tealBright }} />
                </div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: textPrimary }}>{item.label}</h3>
                <p className="text-xs leading-relaxed" style={{ color: textSecondary }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SPLIT SECTION: "Precision at speed" + Scanner Demo ─── */}
      <section className="py-20 md:py-28" style={{ borderTop: `1px solid ${borderSubtle}` }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium" style={{ color: teal }}>Faster, Smarter, Automated</span>
          </div>
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left: Text */}
            <div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6" style={{ color: textPrimary }}>
                Precision at speed,<br />without the grind
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: textSecondary }}>
                Break free from the outdated way of moving. Our AI scans rooms, vets carriers, and delivers instant pricing — so you can focus on what matters.
              </p>
              <ul className="space-y-3">
                {[
                  "Computer-vision room scanning & cataloging",
                  "FMCSA-verified carriers with real compliance data",
                  "Real-time GPS tracking from pickup to delivery",
                  "Instant pricing based on weight, distance, & season",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "hsl(200, 20%, 60%)" }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: teal }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Scanner Demo */}
            <ScannerDemoCard />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS — 6 Cards ─── */}
      <section className="py-20 md:py-28" style={{ borderTop: `1px solid ${borderSubtle}` }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-4">
            <span className="text-xs font-medium" style={{ color: teal }}>Rapid Results</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: textPrimary }}>How it works</h2>
          <p className="text-sm mb-14 max-w-xl" style={{ color: textSecondary }}>
            With our AI-powered platform, you can manage your entire move in one seamless experience.
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: BarChart3, title: "Measure your inventory", desc: "AI scans rooms for weight, volume, and item count — eliminating manual guesswork entirely." },
              { icon: Shield, title: "Vet your carriers", desc: "Every carrier verified through FMCSA databases. Licenses, insurance, safety ratings all checked." },
              { icon: Users, title: "Team coordination", desc: "Real-time communication between you, your coordinator, and your driver throughout the move." },
              { icon: Globe, title: "Track your shipment", desc: "GPS tracking with live ETA updates, weather alerts, and instant driver communication." },
              { icon: Link2, title: "Connect all services", desc: "Integrate packing, storage, and vehicle transport into a single coordinated move plan." },
              { icon: Rocket, title: "Fast, easy setup", desc: "Get your estimate in 60 seconds. Book in under 5 minutes. No paperwork required." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl p-6 transition-all hover:border-white/10 group" style={{ background: navyCard, border: `1px solid ${borderSubtle}` }}>
                <item.icon className="w-5 h-5 mb-4" style={{ color: tealBright }} />
                <h3 className="text-sm font-semibold mb-2" style={{ color: textPrimary }}>{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: textSecondary }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 md:py-28" style={{ borderTop: `1px solid ${borderSubtle}` }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-3">
            <span className="text-xs font-medium" style={{ color: teal }}>See what customers say</span>
          </div>
          <p className="text-center text-sm max-w-2xl mx-auto mb-14" style={{ color: textSecondary }}>
            A friendly approach with great customer support from beginning to end. They're really responsive and the data-driven approach sets them apart.
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Sarah Morrison", role: "Homeowner", color: teal, quote: "Exceptional partner. TruMove consistently delivers outstanding results, our preferred choice." },
              { name: "Marilyn Ekström-Bortman", role: "Homeowner", color: "hsl(200, 70%, 55%)", quote: "Reliable, responsive. TruMove always exceeds our expectations, a dependable partner." },
              { name: "Jordyn Phillips", role: "Homeowner", color: "hsl(45, 85%, 55%)", quote: "Reliable, results-driven. TruMove consistently delivers top-notch service, exceeding expectations." },
              { name: "Corey Stanton", role: "Business", color: "hsl(20, 85%, 55%)", quote: "Trustworthy, effective. TruMove continually exceeds expectations, earning our highest recommendation." },
              { name: "Franco Rosser", role: "Homeowner", color: "hsl(280, 60%, 55%)", quote: "Outstanding results, every time. TruMove is our preference for quality and excellence." },
              { name: "Roger Lipshultz", role: "Business", color: "hsl(340, 70%, 55%)", quote: "Trustworthy partner. TruMove consistently provides outstanding results and service." },
            ].map((t) => (
              <div key={t.name} className="rounded-xl p-5" style={{ background: navyCard, border: `1px solid ${borderSubtle}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: t.color }}>
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <span className="text-sm font-semibold block" style={{ color: textPrimary }}>{t.name}</span>
                    <span className="text-[11px]" style={{ color: t.color }}>{t.role}</span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: textSecondary }}>{t.quote}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm mb-2" style={{ color: textSecondary }}>
              Exceeding expectations, reliable service. TruMove has proven to be the go-to choice for stress-free moving.
            </p>
            <p className="text-xs mb-6" style={{ color: textMuted }}>
              Invaluable support, lasting impact. 🏆
            </p>
            <Link to="/site/online-estimate">
              <button className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110" style={{ background: teal }}>
                Get Estimate
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="relative py-20 md:py-28" style={{ borderTop: `1px solid ${borderSubtle}` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-[20%] w-[60%] h-full rounded-full opacity-[0.04] blur-[120px]" style={{ background: "hsl(175, 70%, 35%)" }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-medium mb-3 block" style={{ color: teal }}>Don't delay</span>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6" style={{ color: textPrimary }}>
                Ready to join the<br />movement with AI?
              </h2>
              <p className="text-sm mb-8 max-w-md" style={{ color: textSecondary }}>
                From AI room scanning to FMCSA-vetted carriers, we've refined every detail to make each move seamlessly stress-free.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/site/online-estimate">
                  <button className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110" style={{ background: teal, boxShadow: `0 0 30px hsl(175, 70%, 40%, 0.25)` }}>
                    Get Estimate
                  </button>
                </Link>
              </div>
            </div>

            {/* Contact form */}
            <div className="rounded-2xl p-6 md:p-8" style={{ background: navyCard, border: `1px solid ${borderSubtle}` }}>
              {contactSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-10 h-10 mx-auto mb-4" style={{ color: tealBright }} />
                  <h3 className="text-lg font-semibold mb-2">We'll be in touch!</h3>
                  <p className="text-sm" style={{ color: textSecondary }}>A TruMove specialist will reach out within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <h3 className="text-base font-semibold mb-1">Request a Callback</h3>
                  <p className="text-xs mb-4" style={{ color: textSecondary }}>We'll call you back within the hour.</p>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full name"
                    required
                    className={inputClass}
                    style={{ background: "hsl(200, 30%, 10%)", border: `1px solid ${borderSubtle}`, color: textPrimary }}
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className={inputClass}
                    style={{ background: "hsl(200, 30%, 10%)", border: `1px solid ${borderSubtle}`, color: textPrimary }}
                  />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(formatPhoneNumber(e.target.value))}
                    placeholder="(555) 123-4567"
                    required
                    className={inputClass}
                    style={{ background: "hsl(200, 30%, 10%)", border: `1px solid ${borderSubtle}`, color: textPrimary }}
                  />
                  <button
                    type="submit"
                    disabled={!contactName || !contactEmail.includes("@") || !isValidPhoneNumber(contactPhone)}
                    className="w-full h-11 rounded-xl font-semibold text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: teal }}
                  >
                    <Phone className="w-4 h-4" /> Request Callback
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-12" style={{ borderTop: `1px solid ${borderSubtle}`, background: "hsl(200, 30%, 6%)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: teal }}>
                  <img src={logoImg} alt="TruMove" className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold">TruMove</span>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: textSecondary }}>
                TruMove is an AI-powered moving platform that delivers FMCSA-vetted carriers and real-time tracking for stress-free moves.
              </p>
              <div className="flex items-center gap-3">
                {["f", "in", "𝕏"].map((s) => (
                  <div key={s} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "hsl(200, 25%, 14%)", color: textSecondary, border: `1px solid ${borderSubtle}` }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: textPrimary }}>Company</h4>
              <div className="space-y-2.5">
                <Link to="/site/about" className="block text-xs transition-colors hover:text-white" style={{ color: textSecondary }}>About</Link>
                <Link to="/site/faq" className="block text-xs transition-colors hover:text-white" style={{ color: textSecondary }}>FAQ</Link>
                <Link to="/site/customer-service" className="block text-xs transition-colors hover:text-white" style={{ color: textSecondary }}>Customer Service</Link>
                <Link to="/site/book" className="block text-xs transition-colors hover:text-white" style={{ color: textSecondary }}>Book a Call</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: textPrimary }}>Services</h4>
              <div className="space-y-2.5">
                <Link to="/site/online-estimate" className="block text-xs transition-colors hover:text-white" style={{ color: textSecondary }}>Online Estimate</Link>
                <Link to="/site/scan-room" className="block text-xs transition-colors hover:text-white" style={{ color: textSecondary }}>AI Room Scanner</Link>
                <Link to="/site/vetting" className="block text-xs transition-colors hover:text-white" style={{ color: textSecondary }}>Carrier Vetting</Link>
                <Link to="/site/track" className="block text-xs transition-colors hover:text-white" style={{ color: textSecondary }}>Live Tracking</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: textPrimary }}>Legal</h4>
              <div className="space-y-2.5">
                <Link to="/site/privacy" className="block text-xs transition-colors hover:text-white" style={{ color: textSecondary }}>Privacy Policy</Link>
                <Link to="/site/terms" className="block text-xs transition-colors hover:text-white" style={{ color: textSecondary }}>Terms of Service</Link>
                <Link to="/portal" className="block text-xs transition-colors hover:text-white" style={{ color: textSecondary }}>Customer Portal</Link>
                <Link to="/site" className="block text-xs transition-colors hover:text-white" style={{ color: textSecondary }}>Classic Site</Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6" style={{ borderTop: `1px solid ${borderSubtle}` }}>
            <span className="text-xs" style={{ color: textMuted }}>© 2026 TruMove. All rights reserved.</span>
            <div className="flex items-center gap-4 text-xs" style={{ color: textMuted }}>
              <span>FMCSA Licensed</span>
              <span>·</span>
              <span>USDOT Compliant</span>
              <span>·</span>
              <span>Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
