import { useState, useEffect, useCallback } from "react";
import DraggableModal from "@/components/ui/DraggableModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, Phone, Calendar, MessageSquare, BarChart3, 
  FileText, Mail, Video, Headphones, Clock, 
  CheckCircle2, ArrowRight, ExternalLink, TrendingUp,
  PhoneIncoming, PhoneOutgoing, Voicemail,
  UserPlus, DollarSign, Truck, MapPin, Bell,
  Filter, MoreHorizontal, Plus,
  Activity, Target, RefreshCw, Sparkles, CalendarDays, X
} from "lucide-react";
 import { 
   Clipboard, FileSpreadsheet, Package, Calculator, 
   Shield, Zap, Globe, Settings, Mic, Monitor, 
   Share2, Briefcase, Building2, Send
 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AgentCoachingWidget } from "@/components/coaching/AgentCoachingWidget";
interface IntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: "granot" | "ringcentral";
}

const GRANOT_FEATURES = [
   { icon: Clipboard, title: "Job Management", desc: "Complete job lifecycle from estimate to delivery" },
   { icon: FileSpreadsheet, title: "Tariff & Pricing", desc: "Rate tables, accessorials, and auto-calculations" },
   { icon: Users, title: "Customer Database", desc: "Full shipper profiles with move history" },
   { icon: Calendar, title: "Dispatch Board", desc: "Visual crew scheduling and resource allocation" },
   { icon: Calculator, title: "Estimating Tools", desc: "Cubic feet calculator and inventory sheets" },
   { icon: FileText, title: "Document Generation", desc: "BOL, estimates, invoices, and contracts" },
   { icon: Truck, title: "Fleet Management", desc: "Vehicle tracking, maintenance, and DOT compliance" },
   { icon: BarChart3, title: "Claims & Receivables", desc: "A/R aging, claims processing, and collections" },
];

const RINGCENTRAL_FEATURES = [
   { icon: Phone, title: "RingCentral MVP", desc: "Business phone with SMS, fax, and voicemail" },
   { icon: Video, title: "RingCentral Video", desc: "HD video meetings with 200+ participants" },
   { icon: MessageSquare, title: "Team Messaging", desc: "Persistent chat, file sharing, and tasks" },
   { icon: Headphones, title: "Contact Center", desc: "Omnichannel routing, IVR, and queues" },
   { icon: Globe, title: "Global Office", desc: "Local numbers in 100+ countries" },
   { icon: Share2, title: "App Integrations", desc: "300+ integrations including Salesforce, Teams" },
   { icon: Shield, title: "Security & Compliance", desc: "HIPAA, SOC 2, encrypted communications" },
   { icon: Zap, title: "AI Capabilities", desc: "Transcription, sentiment analysis, coaching" },
];

const GRANOT_DEMO_LEADS = [
  { name: "Sarah Johnson", status: "Hot", value: "$4,200", move: "NYC → Miami", phone: "(555) 123-4567", email: "sarah.j@email.com" },
  { name: "Michael Chen", status: "Warm", value: "$2,800", move: "LA → Seattle", phone: "(555) 234-5678", email: "m.chen@email.com" },
  { name: "Emily Rodriguez", status: "New", value: "$3,500", move: "Chicago → Denver", phone: "(555) 345-6789", email: "emily.r@email.com" },
  { name: "David Kim", status: "Hot", value: "$5,100", move: "Boston → Austin", phone: "(555) 456-7890", email: "d.kim@email.com" },
];

const GRANOT_DEMO_STATS = [
   { label: "Open Jobs", value: "47", change: "+12%", icon: Package },
   { label: "In Transit", value: "12", change: "+3", icon: Truck },
   { label: "Pending A/R", value: "$142K", change: "-8%", icon: DollarSign },
   { label: "This Month", value: "$89K", change: "+18%", icon: TrendingUp },
];

const GRANOT_RECENT_ACTIVITY = [
   { type: "job", text: "Job #4521 moved to In Transit", time: "2 min ago", icon: Truck },
   { type: "estimate", text: "Estimate sent: Sarah Johnson", time: "15 min ago", icon: FileText },
   { type: "booking", text: "Deposit received: David Kim", time: "1 hr ago", icon: DollarSign },
   { type: "dispatch", text: "Crew Alpha dispatched", time: "2 hrs ago", icon: MapPin },
   { type: "claim", text: "Claim filed: Job #4498", time: "3 hrs ago", icon: Shield },
];

// Animated activity items for live mode
const GRANOT_LIVE_ACTIVITY = [
  { type: "booking", text: "New booking: Marcus Lee - Chicago → Miami", time: "Just now", icon: DollarSign },
  { type: "job", text: "Job #4587 status: Loaded", time: "Just now", icon: Truck },
  { type: "estimate", text: "Quote request: Jessica Wang", time: "Just now", icon: FileText },
  { type: "dispatch", text: "Crew Beta assigned to Job #4590", time: "Just now", icon: MapPin },
  { type: "payment", text: "Payment received: $3,200", time: "Just now", icon: DollarSign },
  { type: "lead", text: "New lead from website form", time: "Just now", icon: Users },
];

const GRANOT_UPCOMING_MOVES = [
   { customer: "Robert Taylor", from: "Phoenix, AZ", to: "Portland, OR", date: "Feb 10", crew: "Driver: Mike S.", status: "Packed", weight: "8,500 lbs" },
   { customer: "Lisa Wang", from: "Denver, CO", to: "San Diego, CA", date: "Feb 11", crew: "Driver: James L.", status: "In Transit", weight: "12,200 lbs" },
   { customer: "David Kim", from: "Boston, MA", to: "Austin, TX", date: "Feb 12", crew: "Driver: Tony R.", status: "Estimated", weight: "6,800 lbs" },
];

const GRANOT_PIPELINE_STAGES = [
   { stage: "Estimate", count: 12, value: "$38K", color: "#3B82F6" },
   { stage: "Booked", count: 18, value: "$52K", color: "#FBBF24" },
   { stage: "Packed", count: 9, value: "$31K", color: "#F97316" },
   { stage: "In Transit", count: 5, value: "$16K", color: "#8B5CF6" },
   { stage: "Delivered", count: 23, value: "$89K", color: "#4CAF50" },
];

const RINGCENTRAL_DEMO_CALLS = [
  { type: "incoming", name: "Sarah Johnson", duration: "4:32", time: "2 min ago", status: "answered" },
  { type: "outgoing", name: "Michael Chen", duration: "2:15", time: "15 min ago", status: "completed" },
  { type: "missed", name: "Unknown", duration: "-", time: "32 min ago", status: "missed" },
  { type: "voicemail", name: "Emily Rodriguez", duration: "0:45", time: "1 hr ago", status: "voicemail" },
];

const RINGCENTRAL_DEMO_STATS = [
   { label: "Total Calls", value: "847", sub: "This week" },
   { label: "Active Users", value: "24", sub: "Online now" },
   { label: "Avg Handle", value: "4:12", sub: "Per call" },
   { label: "SLA Met", value: "94.2%", sub: "Target: 90%" },
];

// ============ GRANOT CRM DEMO ============
function GranotDemoVisual() {
  const [activeView, setActiveView] = useState<"dashboard" | "pipeline" | "calendar" | "activity">("dashboard");
  const [selectedLead, setSelectedLead] = useState<number | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveStats, setLiveStats] = useState(GRANOT_DEMO_STATS);
  const [liveActivity, setLiveActivity] = useState(GRANOT_RECENT_ACTIVITY);
  const [liveJobCounts, setLiveJobCounts] = useState(GRANOT_PIPELINE_STAGES);
  const [showCoachingWidget, setShowCoachingWidget] = useState(false);

  // Animated data updates similar to Marketing Suite
  useEffect(() => {
    if (!isLiveMode) return;

    const statsInterval = setInterval(() => {
      setLiveStats(prev => prev.map(stat => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        let newValue = stat.value;
        let newChange = stat.change;
        
        if (stat.label === "Open Jobs") {
          const val = parseInt(stat.value) + delta;
          newValue = String(Math.max(40, val));
          newChange = delta > 0 ? `+${Math.abs(delta)}` : `${delta}`;
        } else if (stat.label === "In Transit") {
          const val = parseInt(stat.value) + (Math.random() > 0.7 ? delta : 0);
          newValue = String(Math.max(8, val));
        } else if (stat.label === "Pending A/R") {
          const val = parseInt(stat.value.replace(/\D/g, '')) + (delta * Math.floor(Math.random() * 5));
          newValue = `$${val}K`;
        } else if (stat.label === "This Month") {
          const val = parseInt(stat.value.replace(/\D/g, '')) + (delta * Math.floor(Math.random() * 3));
          newValue = `$${Math.max(80, val)}K`;
        }
        
        return { ...stat, value: newValue, change: newChange };
      }));
    }, 3000);

    const activityInterval = setInterval(() => {
      const newItem = GRANOT_LIVE_ACTIVITY[Math.floor(Math.random() * GRANOT_LIVE_ACTIVITY.length)];
      setLiveActivity(prev => [newItem, ...prev.slice(0, 4)]);
    }, 5000);

    const pipelineInterval = setInterval(() => {
      setLiveJobCounts(prev => prev.map(stage => {
        const delta = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newCount = Math.max(3, stage.count + delta);
        const newValue = `$${Math.round(newCount * 3.2)}K`;
        return { ...stage, count: newCount, value: newValue };
      }));
    }, 4000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(activityInterval);
      clearInterval(pipelineInterval);
    };
  }, [isLiveMode]);

  return (
    <div className="rounded-xl overflow-hidden relative" style={{ border: "2px solid #1B365D", background: "#FFFFFF" }}>
      {/* Granot Header - Navy/Green branding */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: "linear-gradient(90deg, #1B365D 0%, #2E4A7D 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#4CAF50" }}>
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Granot</span>
          <Badge className="text-[10px]" style={{ background: "#4CAF50", color: "white" }}>CRM</Badge>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCoachingWidget(!showCoachingWidget)}
            className={cn(
              "p-1.5 rounded-lg transition-colors relative",
              showCoachingWidget ? "bg-white/30" : "hover:bg-white/10"
            )}
            title="Call Coach"
          >
            <Headphones className="w-4 h-4 text-white/80" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors relative">
            <Bell className="w-4 h-4 text-white/80" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: "#4CAF50" }} />
          </button>
          <button 
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={cn(
              "px-2 py-1 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1",
              isLiveMode ? "bg-green-500 text-white" : "bg-white/20 text-white/80 hover:bg-white/30"
            )}
          >
            <Sparkles className="w-3 h-3" />
            {isLiveMode ? "Live" : "Demo"}
          </button>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: "#4CAF50", color: "white" }}>JD</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 px-3 py-2" style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
        {[
           { id: "dashboard", label: "Dashboard", icon: BarChart3 },
           { id: "pipeline", label: "Jobs", icon: Package },
           { id: "calendar", label: "Dispatch", icon: Truck },
           { id: "activity", label: "Activity", icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as typeof activeView)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeView === tab.id ? "#1B365D" : "transparent",
              color: activeView === tab.id ? "white" : "#64748B",
            }}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-4 max-h-[350px] overflow-y-auto" style={{ background: "#FFFFFF" }}>
        {/* Dashboard View */}
        {activeView === "dashboard" && (
          <div className="space-y-3">
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-2">
              {(isLiveMode ? liveStats : GRANOT_DEMO_STATS).map((stat) => (
                <div key={stat.label} className={cn(
                  "p-3 rounded-lg hover:shadow-md transition-all cursor-pointer",
                  isLiveMode && "animate-pulse"
                )} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <div className="flex items-center justify-between mb-1">
                    <stat.icon className="w-4 h-4" style={{ color: "#1B365D" }} />
                    <span className={cn(
                      "text-[10px] font-medium transition-all",
                      isLiveMode && "animate-bounce"
                    )} style={{ color: "#4CAF50" }}>{stat.change}</span>
                  </div>
                  <div className={cn(
                    "text-xl font-bold transition-all",
                    isLiveMode && "text-shadow-sm"
                  )} style={{ color: "#1B365D" }}>{stat.value}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-3">
              {/* Hot Leads */}
               <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
                 <div className="px-3 py-2 flex items-center justify-between" style={{ background: "#1B365D" }}>
                   <span className="text-xs font-semibold text-white">Active Jobs</span>
                  <Plus className="w-3 h-3 text-white/70" />
                </div>
                <div className="divide-y" style={{ borderColor: "#E2E8F0" }}>
                  {GRANOT_DEMO_LEADS.map((lead, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedLead(selectedLead === i ? null : i)}
                      className="px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50"
                      style={{ background: selectedLead === i ? "#F0FDF4" : "transparent" }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5E9" }}>
                          <Users className="w-3.5 h-3.5" style={{ color: "#4CAF50" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs text-gray-900 truncate">{lead.name}</div>
                          <div className="text-[10px] text-gray-500 truncate">{lead.move}</div>
                        </div>
                        <Badge 
                          className="text-[9px]"
                          style={{ 
                            background: lead.status === "Hot" ? "#EF4444" : lead.status === "Warm" ? "#F59E0B" : "#6B7280",
                            color: "white"
                          }}
                        >
                          {lead.value}
                        </Badge>
                      </div>
                      {selectedLead === i && (
                        <div className="mt-2 pt-2 space-y-1" style={{ borderTop: "1px solid #E2E8F0" }}>
                          <div className="flex items-center gap-2 text-[10px] text-gray-600">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-600">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </div>
                          <div className="flex gap-1 mt-2">
                            <button className="flex-1 py-1 rounded text-[10px] font-medium text-white" style={{ background: "#4CAF50" }}>
                              Call
                            </button>
                            <button className="flex-1 py-1 rounded text-[10px] font-medium" style={{ background: "#E2E8F0", color: "#1B365D" }}>
                              Email
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
                <div className="px-3 py-2 flex items-center justify-between relative" style={{ background: "#1B365D" }}>
                  <span className="text-xs font-semibold text-white">Recent Activity</span>
                  <RefreshCw className={cn(
                    "w-3 h-3 text-white/70",
                    isLiveMode && "animate-spin"
                  )} />
                  {isLiveMode && (
                    <span className="absolute top-1 right-8 w-2 h-2 rounded-full bg-green-400 animate-ping" />
                  )}
                </div>
                <div className="divide-y" style={{ borderColor: "#E2E8F0" }}>
                  {(isLiveMode ? liveActivity : GRANOT_RECENT_ACTIVITY).slice(0, 4).map((item, i) => (
                    <div key={`${item.text}-${i}`} className={cn(
                      "px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-all",
                      isLiveMode && i === 0 && "bg-green-50 animate-fade-in"
                    )}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ 
                        background: item.type === "booking" ? "#E8F5E9" : item.type === "lead" ? "#E3F2FD" : "#F5F5F5"
                      }}>
                        <item.icon className="w-3 h-3" style={{ 
                          color: item.type === "booking" ? "#4CAF50" : item.type === "lead" ? "#2196F3" : "#757575"
                        }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-900 truncate">{item.text}</div>
                        <div className="text-[10px] text-gray-500">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Chart */}
            <div className="rounded-lg p-3" style={{ border: "1px solid #E2E8F0" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-700">Weekly Performance</span>
                <TrendingUp className="w-4 h-4" style={{ color: "#4CAF50" }} />
              </div>
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full rounded-t transition-all hover:opacity-80"
                      style={{ height: `${h}%`, background: "linear-gradient(180deg, #4CAF50 0%, #1B365D 100%)" }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[9px] text-gray-500">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>
        )}

        {/* Pipeline View */}
        {activeView === "pipeline" && (
          <div className="space-y-3">
            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
              <div className="px-3 py-2" style={{ background: "#1B365D" }}>
                 <span className="text-xs font-semibold text-white">Job Pipeline</span>
              </div>
              <div className="p-3 space-y-2">
                {(isLiveMode ? liveJobCounts : GRANOT_PIPELINE_STAGES).map((stage, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-gray-600 truncate">{stage.stage}</div>
                    <div className={cn(
                      "flex-1 h-6 rounded-full overflow-hidden relative transition-all",
                      isLiveMode && "shadow-sm"
                    )} style={{ background: "#F1F5F9" }}>
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ width: `${(stage.count / 23) * 100}%`, background: stage.color }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-2">
                        <span className="text-[10px] font-medium text-gray-700">{stage.count}</span>
                        <span className="text-[10px] font-medium text-gray-700">{stage.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(isLiveMode ? liveJobCounts : GRANOT_PIPELINE_STAGES).map((stage, i) => (
                <div key={i} className={cn(
                  "rounded-lg p-2 text-center transition-all",
                  isLiveMode && "hover:shadow-md"
                )} style={{ border: "1px solid #E2E8F0" }}>
                  <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: stage.color }} />
                  <div className={cn(
                    "text-lg font-bold transition-all",
                    isLiveMode && "animate-pulse"
                  )} style={{ color: "#1B365D" }}>{stage.count}</div>
                  <div className="text-[9px] text-gray-500 truncate">{stage.stage}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar View */}
        {activeView === "calendar" && (
          <div className="space-y-3">
            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
              <div className="px-3 py-2" style={{ background: "#1B365D" }}>
                 <span className="text-xs font-semibold text-white">Dispatch Board</span>
              </div>
              <div className="divide-y" style={{ borderColor: "#E2E8F0" }}>
                {GRANOT_UPCOMING_MOVES.map((move, i) => (
                  <div key={i} className="px-3 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                          <Truck className="w-4 h-4" style={{ color: "#4CAF50" }} />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{move.customer}</div>
                          <div className="text-[10px] text-gray-500">{move.crew}</div>
                        </div>
                      </div>
                      <Badge 
                        className="text-[9px]"
                        style={{ 
                             background: move.status === "In Transit" ? "#E8F5E9" : move.status === "Packed" ? "#FFF8E1" : "#E3F2FD",
                             color: move.status === "In Transit" ? "#4CAF50" : move.status === "Packed" ? "#F59E0B" : "#2196F3"
                        }}
                      >
                        {move.status}
                      </Badge>
                    </div>
                       <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>{move.from}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{move.to}</span>
                    </div>
                       <div className="flex items-center justify-between text-[10px]">
                         <span className="text-gray-400">{move.crew}</span>
                         <span className="font-medium" style={{ color: "#1B365D" }}>{move.weight} • {move.date}</span>
                       </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity View */}
        {activeView === "activity" && (
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
            <div className="px-3 py-2 flex items-center justify-between" style={{ background: "#1B365D" }}>
              <span className="text-xs font-semibold text-white">Activity Log</span>
              <Filter className="w-3 h-3 text-white/70" />
            </div>
            <ScrollArea className="h-[280px]">
              <div className="divide-y" style={{ borderColor: "#E2E8F0" }}>
                {[...GRANOT_RECENT_ACTIVITY, ...GRANOT_RECENT_ACTIVITY].map((item, i) => (
                  <div key={i} className="px-3 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ 
                      background: item.type === "booking" ? "#E8F5E9" : item.type === "lead" ? "#E3F2FD" : "#F5F5F5"
                    }}>
                      <item.icon className="w-4 h-4" style={{ 
                        color: item.type === "booking" ? "#4CAF50" : item.type === "lead" ? "#2196F3" : "#757575"
                      }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900">{item.text}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.time}</div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Live Demo Badge */}
      <div className="flex items-center justify-center gap-2 py-2" style={{ background: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
        <div className={cn(
          "w-2 h-2 rounded-full",
          isLiveMode ? "animate-ping bg-green-500" : "animate-pulse"
        )} style={{ background: isLiveMode ? undefined : "#4CAF50" }} />
        <span className={cn(
          "text-[10px] uppercase tracking-wide",
          isLiveMode ? "text-green-600 font-medium" : "text-gray-500"
        )}>{isLiveMode ? "Live Data Simulation" : "Demo Mode"}</span>
      </div>

      {/* Coaching Widget Overlay */}
      {showCoachingWidget && (
        <div className="absolute bottom-16 right-4 z-50 shadow-2xl">
          <AgentCoachingWidget 
            customerName="Sarah Johnson"
            moveRoute="NYC → Miami"
            callDuration="4:32"
            onMinimize={() => setShowCoachingWidget(false)}
          />
        </div>
      )}
    </div>
  );
}

// ============ RINGCENTRAL DEMO ============
function RingCentralDemoVisual() {
  const [activeTab, setActiveTab] = useState<"calls" | "messages" | "video">("calls");
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveStats, setLiveStats] = useState(RINGCENTRAL_DEMO_STATS);
  const [liveCalls, setLiveCalls] = useState(RINGCENTRAL_DEMO_CALLS);

  useEffect(() => {
    if (!isLiveMode) return;

    const statsInterval = setInterval(() => {
      setLiveStats(prev => prev.map(stat => {
        if (stat.label === "Total Calls") {
          const val = parseInt(stat.value) + Math.floor(Math.random() * 3);
          return { ...stat, value: String(val) };
        } else if (stat.label === "Active Users") {
          const delta = Math.random() > 0.5 ? 1 : -1;
          const val = Math.max(20, parseInt(stat.value) + delta);
          return { ...stat, value: String(val) };
        } else if (stat.label === "Avg Handle") {
          const mins = 3 + Math.floor(Math.random() * 3);
          const secs = Math.floor(Math.random() * 60);
          return { ...stat, value: `${mins}:${secs.toString().padStart(2, '0')}` };
        } else if (stat.label === "SLA Met") {
          const val = 92 + Math.random() * 6;
          return { ...stat, value: `${val.toFixed(1)}%` };
        }
        return stat;
      }));
    }, 2500);

    const callsInterval = setInterval(() => {
      const types = ["incoming", "outgoing", "missed", "voicemail"] as const;
      const names = ["Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kim", "Unknown", "Support Line"];
      const statuses = ["answered", "completed", "missed", "voicemail"] as const;
      
      const newCall = {
        type: types[Math.floor(Math.random() * types.length)],
        name: names[Math.floor(Math.random() * names.length)],
        duration: `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        time: "Just now",
        status: statuses[Math.floor(Math.random() * statuses.length)],
      };
      
      setLiveCalls(prev => [newCall, ...prev.slice(0, 3)]);
    }, 6000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(callsInterval);
    };
  }, [isLiveMode]);

  const RC_MESSAGES: { from: string; preview: string; time: string; unread: boolean; participants: number }[] = [];
   
   const RC_MEETINGS = [
     { title: "Weekly Sales Standup", time: "2:00 PM", duration: "30 min", participants: 8, status: "upcoming" },
     { title: "Client Demo: Acme Corp", time: "3:30 PM", duration: "1 hr", participants: 4, status: "upcoming" },
     { title: "Q1 Planning Session", time: "Tomorrow 10 AM", duration: "2 hrs", participants: 15, status: "scheduled" },
   ];

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "2px solid #0684BC", background: "#FFFFFF" }}>
      {/* RingCentral Header - Orange/Blue branding */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: "linear-gradient(90deg, #FF6A00 0%, #FF8533 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "white" }}>
            <Phone className="w-5 h-5" style={{ color: "#FF6A00" }} />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">RingCentral</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-[10px]" style={{ background: "white", color: "#FF6A00" }}>MVP</Badge>
          <button 
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={cn(
              "px-2 py-1 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1",
              isLiveMode ? "bg-green-500 text-white" : "bg-white/20 text-white/80 hover:bg-white/30"
            )}
          >
            <Sparkles className="w-3 h-3" />
            {isLiveMode ? "Live" : "Demo"}
          </button>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium text-white">AG</div>
        </div>
      </div>

      {/* Tab Navigation - RingCentral Blue */}
      <div className="flex" style={{ background: "#0684BC" }}>
        {[
          { id: "calls", label: "Phone", icon: Phone },
          { id: "messages", label: "Message", icon: MessageSquare },
          { id: "video", label: "Video", icon: Video },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors relative"
            style={{ color: "white", opacity: activeTab === tab.id ? 1 : 0.7 }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "#FF6A00" }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-h-[350px] overflow-y-auto">
        {activeTab === "calls" && (
          <div>
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-px" style={{ background: "#E5E7EB" }}>
              {(isLiveMode ? liveStats : RINGCENTRAL_DEMO_STATS).map((stat) => (
                <div key={stat.label} className={cn(
                  "p-3 text-center transition-all",
                  isLiveMode && "animate-pulse"
                )} style={{ background: "#F8FAFC" }}>
                  <div className={cn(
                    "text-lg font-bold transition-all",
                    isLiveMode && stat.label === "Total Calls" && "text-green-600"
                  )} style={{ color: isLiveMode && stat.label === "Total Calls" ? undefined : "#0684BC" }}>{stat.value}</div>
                   <div className="text-[10px] font-medium text-gray-600">{stat.label}</div>
                   <div className="text-[9px] text-gray-400">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Call Log */}
            <div className="divide-y" style={{ borderColor: "#E5E7EB" }}>
              {(isLiveMode ? liveCalls : RINGCENTRAL_DEMO_CALLS).map((call, i) => {
                const Icon = call.type === "incoming" ? PhoneIncoming : 
                             call.type === "outgoing" ? PhoneOutgoing :
                             call.type === "voicemail" ? Voicemail : Phone;
                return (
                  <div key={`${call.name}-${i}`} className={cn(
                    "px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-all cursor-pointer",
                    isLiveMode && i === 0 && "bg-orange-50 animate-fade-in"
                  )}>
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: call.status === "missed" ? "#FEE2E2" : 
                                   call.status === "voicemail" ? "#FEF3C7" : "#E0F7FA"
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ 
                        color: call.status === "missed" ? "#DC2626" : 
                               call.status === "voicemail" ? "#D97706" : "#0684BC"
                      }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{call.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{call.type} call</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-gray-900">{call.duration}</div>
                      <div className="text-xs text-gray-500">{call.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dial Button */}
            <div className="p-4 flex justify-center">
              <button 
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                style={{ background: "#FF6A00" }}
              >
                <Phone className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="divide-y" style={{ borderColor: "#E5E7EB" }}>
            {RC_MESSAGES.map((msg, i) => (
              <div 
                key={i} 
                className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
                style={{ background: msg.unread ? "#FFF7ED" : "transparent" }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#0684BC" }}>
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{msg.from}</span>
                    {msg.unread && <span className="w-2 h-2 rounded-full" style={{ background: "#FF6A00" }} />}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{msg.preview}</div>
                   <div className="text-[10px] text-gray-400 mt-0.5">{msg.participants} participants</div>
                </div>
                <div className="text-xs text-gray-400">{msg.time}</div>
              </div>
            ))}
            <div className="p-4 flex justify-center">
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white"
                style={{ background: "#0684BC" }}
              >
                 <Send className="w-4 h-4" />
                New Message
              </button>
            </div>
          </div>
        )}

        {activeTab === "video" && (
          <div className="p-4 space-y-4">
             {/* Upcoming Meetings */}
             <div className="space-y-2">
               {RC_MEETINGS.map((meeting, i) => (
                 <div 
                   key={i}
                   className="rounded-xl p-3 hover:shadow-md transition-all cursor-pointer" 
                   style={{ 
                     background: i === 0 ? "#FFF7ED" : "#F8FAFC", 
                     border: i === 0 ? "1px solid #FDBA74" : "1px solid #E5E7EB" 
                   }}
                 >
                   <div className="flex items-center justify-between mb-1">
                     <span className="font-medium text-sm text-gray-900">{meeting.title}</span>
                     {i === 0 && <Badge style={{ background: "#FF6A00", color: "white" }} className="text-[10px]">Next</Badge>}
                   </div>
                   <div className="flex items-center gap-3 text-xs text-gray-500">
                     <span className="flex items-center gap-1">
                       <Clock className="w-3 h-3" />
                       {meeting.time}
                     </span>
                     <span>{meeting.duration}</span>
                     <span className="flex items-center gap-1">
                       <Users className="w-3 h-3" />
                       {meeting.participants}
                     </span>
                   </div>
                   {i === 0 && (
                     <button 
                       className="w-full mt-3 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                       style={{ background: "#0684BC" }}
                     >
                       <Video className="w-4 h-4" />
                       Join Now
                     </button>
                   )}
                 </div>
               ))}
            </div>
             
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 rounded-xl text-center hover:bg-gray-50 transition-colors" style={{ border: "1px solid #E5E7EB" }}>
                <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: "#E0F7FA" }}>
                  <Video className="w-5 h-5" style={{ color: "#0684BC" }} />
                </div>
                 <div className="text-sm font-medium text-gray-900">Instant Meeting</div>
                 <div className="text-[10px] text-gray-500">Start now, invite later</div>
              </button>
              <button className="p-4 rounded-xl text-center hover:bg-gray-50 transition-colors" style={{ border: "1px solid #E5E7EB" }}>
                <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: "#FFF7ED" }}>
                  <Calendar className="w-5 h-5" style={{ color: "#FF6A00" }} />
                </div>
                 <div className="text-sm font-medium text-gray-900">Schedule Meeting</div>
                 <div className="text-[10px] text-gray-500">Plan ahead with calendar</div>
              </button>
            </div>
             
             {/* RingCentral Video Features */}
             <div className="rounded-xl p-3" style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}>
               <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-2">RingCentral Video Features</div>
               <div className="grid grid-cols-4 gap-2">
                 {[
                   { icon: Monitor, label: "Screen Share" },
                   { icon: Mic, label: "AI Transcription" },
                   { icon: FileText, label: "Meeting Notes" },
                   { icon: Shield, label: "E2E Encrypted" },
                 ].map((feat) => (
                   <div key={feat.label} className="text-center">
                     <feat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: "#0684BC" }} />
                     <div className="text-[9px] text-gray-600">{feat.label}</div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Active Call Widget */}
      <div className="p-3 flex items-center justify-between" style={{ background: "#10B981" }}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full bg-white/20 flex items-center justify-center",
            isLiveMode ? "animate-ping" : "animate-pulse"
          )}>
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">Active Call</div>
            <div className="text-xs text-white/80">John Smith • {isLiveMode ? "03:12" : "02:34"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <Voicemail className="w-4 h-4 text-white" />
          </button>
          <button className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors">
            <Phone className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ DEMO SCHEDULING DIALOG ============
interface DemoScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: "granot" | "ringcentral";
}

function DemoScheduleDialog({ open, onOpenChange, integration }: DemoScheduleDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isGranot = integration === "granot";
  const brandColor = isGranot ? "#4CAF50" : "#FF6A00";
  const brandName = isGranot ? "Granot CRM" : "RingCentral";

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success(`Demo request submitted! A ${brandName} specialist will contact you within 24 hours.`);
      
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
        setName("");
        setEmail("");
        setPhone("");
        setCompany("");
        setPreferredTime("");
      }, 2000);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" style={{ color: brandColor }} />
            Schedule a Demo
          </DialogTitle>
          <DialogDescription>
            Book a personalized demo with a {brandName} specialist to see how it can transform your business.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: `${brandColor}20` }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: brandColor }} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Demo Scheduled!</h3>
            <p className="text-sm text-muted-foreground">
              We'll send a confirmation email with calendar invite shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="demo-name" className="text-xs">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="demo-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="demo-company" className="text-xs">Company</Label>
                <Input
                  id="demo-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name"
                  className="h-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="demo-email" className="text-xs">Email <span className="text-destructive">*</span></Label>
              <Input
                id="demo-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="demo-phone" className="text-xs">Phone</Label>
                <Input
                  id="demo-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="demo-time" className="text-xs">Preferred Time</Label>
                <Input
                  id="demo-time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder="e.g., Mornings EST"
                  className="h-9"
                />
              </div>
            </div>

            <div className="rounded-lg p-3" style={{ background: `${brandColor}10`, border: `1px solid ${brandColor}30` }}>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: brandColor }} />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">What to expect:</p>
                  <ul className="space-y-0.5">
                    <li>• 30-minute personalized product walkthrough</li>
                    <li>• Q&A with a {isGranot ? "moving industry" : "communications"} specialist</li>
                    <li>• Custom pricing based on your needs</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full gap-2 text-white"
              style={{ background: brandColor }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarDays className="w-4 h-4" />
                  Request Demo
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============ INTEGRATION MODAL ============
export function IntegrationModal({ open, onOpenChange, integration }: IntegrationModalProps) {
  const [showDemoSchedule, setShowDemoSchedule] = useState(false);
  const isGranot = integration === "granot";
  const features = isGranot ? GRANOT_FEATURES : RINGCENTRAL_FEATURES;
  const title = isGranot ? "Granot CRM" : "RingCentral";
  const subtitle = isGranot 
     ? "Complete moving & storage management software"
     : "Business communications platform - MVP, Video, Contact Center";

  return (
    <>
    <DemoScheduleDialog 
      open={showDemoSchedule} 
      onOpenChange={setShowDemoSchedule} 
      integration={integration} 
    />
    <DraggableModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      storageKey={`tm_modal_${integration}`}
      defaultWidth={800}
      defaultHeight={650}
      minWidth={500}
      minHeight={400}
      maxWidth={1000}
      maxHeight={850}
      headerStyle={{ 
        background: isGranot 
          ? "linear-gradient(135deg, #1B365D 0%, #2E4A7D 100%)" 
          : "linear-gradient(90deg, #FF6A00 0%, #FF8533 100%)"
      }}
      title={
        <div className="flex items-center gap-3">
          {isGranot ? (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#4CAF50" }}>
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "white" }}>
              <Phone className="w-5 h-5" style={{ color: "#FF6A00" }} />
            </div>
          )}
          <div>
            <span className="block text-white font-semibold">{title}</span>
            <span className="text-sm font-normal text-white/80">{subtitle}</span>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ExternalLink className="w-4 h-4" />
              Visit Website
            </Button>
            <Button 
              variant="outline"
              size="sm" 
              className="gap-2"
              onClick={() => setShowDemoSchedule(true)}
            >
              <CalendarDays className="w-4 h-4" />
              Request Demo
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary"
              size="sm" 
              className="gap-2"
              onClick={() => {
                setShowDemoSchedule(true);
              }}
            >
              <Phone className="w-4 h-4" />
              Book a Call
            </Button>
            <Button 
              size="sm" 
              className="gap-2 text-white"
              style={{ background: isGranot ? "#4CAF50" : "#FF6A00" }}
            >
              Connect {title}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      }
    >
      <div className="p-6 flex-1 overflow-y-auto">
        <Tabs defaultValue="demo">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="mt-4">
            {isGranot ? <GranotDemoVisual /> : <RingCentralDemoVisual />}
          </TabsContent>

          <TabsContent value="features" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature) => (
                <div 
                  key={feature.title}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div 
                    className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: isGranot ? "#1B365D20" : "#FF6A0020" }}
                  >
                    <feature.icon className="w-4 h-4" style={{ color: isGranot ? "#1B365D" : "#FF6A00" }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                   <span className="font-semibold">{isGranot ? "Essential" : "Core"}</span>
                   <Badge variant="secondary">{isGranot ? "$199/mo" : "$30/user/mo"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isGranot 
                     ? "Up to 3 users, job management, basic reporting, customer database"
                     : "Message, video, phone for small teams. 100 toll-free minutes."}
                </p>
              </div>
              <div 
                className="p-4 rounded-lg border-2"
                style={{ 
                  borderColor: isGranot ? "#4CAF50" : "#FF6A00",
                  background: isGranot ? "#4CAF5010" : "#FF6A0010"
                }}
              >
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-2">
                     <span className="font-semibold">{isGranot ? "Professional" : "Advanced"}</span>
                     <Badge className="text-[9px]" style={{ background: isGranot ? "#1B365D" : "#0684BC", color: "white" }}>Popular</Badge>
                   </div>
                   <Badge style={{ background: isGranot ? "#4CAF50" : "#FF6A00", color: "white" }}>{isGranot ? "$399/mo" : "$35/user/mo"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isGranot 
                     ? "Up to 10 users, dispatch board, claims, fleet tracking, integrations"
                     : "Advanced call handling, CRM integrations, 1000 toll-free minutes."}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                   <span className="font-semibold">{isGranot ? "Enterprise" : "Ultra"}</span>
                  <Badge variant="secondary">Custom</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isGranot 
                     ? "Unlimited users, multi-location, API access, dedicated support"
                     : "Unlimited storage, device analytics, custom integrations, SLA."}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DraggableModal>
    </>
  );
}

export function IntegrationTabs() {
  const [granotOpen, setGranotOpen] = useState(false);
  const [ringcentralOpen, setRingcentralOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setGranotOpen(true)}
          className="integration-tab integration-tab-granot"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Granot CRM</span>
        </button>
        <button
          onClick={() => setRingcentralOpen(true)}
          className="integration-tab integration-tab-ringcentral"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>RingCentral</span>
        </button>
      </div>

      <IntegrationModal 
        open={granotOpen} 
        onOpenChange={setGranotOpen} 
        integration="granot" 
      />
      <IntegrationModal 
        open={ringcentralOpen} 
        onOpenChange={setRingcentralOpen} 
        integration="ringcentral" 
      />
    </>
  );
}
