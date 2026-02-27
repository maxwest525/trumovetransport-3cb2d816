import { useState, useEffect } from "react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Badge } from "@/components/ui/badge";
 import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
 import { 
   Sparkles, RefreshCw, ArrowRight, CheckCircle2, Star, 
   Shield, Clock, Phone, Zap, Users, TrendingUp, Play,
  ChevronDown, Quote, Award, Truck, Pencil, X, Check,
  MapPin, Search, Target, Globe, BarChart3, Hash, DollarSign,
  Calculator, Video, ThumbsUp, Building, Home, Package, ArrowDown,
   Download, Palette, Copy, Maximize2, Minimize2, FileText, Eye, EyeOff, Filter as FilterIcon,
   FileUp, Database, Rocket, ChevronLeft, ChevronRight, Loader2, ExternalLink
 } from "lucide-react";
import { Upload, MousePointerClick, PieChart, UserCheck, Map, TrendingDown, Lock, Timer, ArrowUp, Heart } from "lucide-react";
 import jsPDF from "jspdf";
 import autoTable from "jspdf-autotable";
 import logoImg from "@/assets/logo.png";
import ScaledPreview from "@/components/ui/ScaledPreview";
import {
  TruMoveLogo, 
  PoweredByBadge, 
  TruMoveGuaranteeBadge,
  TrustBadgeStrip,
  SocialProofTicker,
  CountdownTimer,
  UrgencyBanner,
  ThreeStepProcess,
  TripleGuaranteeSection,
  VideoTestimonialGrid,
  ComparisonTableSection,
  FAQSection,
  FinalCTASection,
  TruMoveFooter
} from "./TruMoveBrandingElements";
import { TemplatePreviewCard } from "./TemplatePreviewCard";
import { PostGenerationEditor } from "./PostGenerationEditor";
import { BrandExtractor } from "./BrandExtractor";
import { ExtractedBranding } from "@/lib/api/firecrawl";

// Heatmap positions per template
const TEMPLATE_HEATMAP_POSITIONS: Record<string, {
  id: string;
  element: string;
  top: string;
  left: string;
  width: string;
  height: string;
  intensity: 'high' | 'medium' | 'low';
}[]> = {
  "quote-funnel": [
    { id: "cta-primary", element: "Primary CTA Button", top: "55%", left: "50%", width: "200px", height: "50px", intensity: "high" },
    { id: "quote-form", element: "Quote Form Fields", top: "45%", left: "50%", width: "280px", height: "100px", intensity: "high" },
    { id: "trust-badges", element: "Trust Badges", top: "70%", left: "50%", width: "300px", height: "30px", intensity: "medium" },
    { id: "testimonials", element: "Testimonials", top: "85%", left: "50%", width: "250px", height: "60px", intensity: "low" },
  ],
  "comparison": [
    { id: "comparison-table", element: "Comparison Table", top: "45%", left: "50%", width: "400px", height: "180px", intensity: "high" },
    { id: "cta-primary", element: "Primary CTA Button", top: "75%", left: "50%", width: "180px", height: "45px", intensity: "high" },
    { id: "feature-row", element: "Feature Rows", top: "50%", left: "50%", width: "350px", height: "80px", intensity: "medium" },
  ],
  "calculator": [
    { id: "calculator-form", element: "Calculator Form", top: "40%", left: "30%", width: "280px", height: "200px", intensity: "high" },
    { id: "calculate-btn", element: "Calculate Button", top: "65%", left: "30%", width: "200px", height: "45px", intensity: "high" },
    { id: "result-area", element: "Result Display", top: "45%", left: "70%", width: "200px", height: "150px", intensity: "medium" },
  ],
  "testimonial": [
    { id: "video-testimonial", element: "Video Testimonials", top: "35%", left: "50%", width: "350px", height: "120px", intensity: "high" },
    { id: "testimonial-cards", element: "Testimonial Cards", top: "55%", left: "50%", width: "400px", height: "150px", intensity: "medium" },
    { id: "cta-primary", element: "Primary CTA Button", top: "85%", left: "50%", width: "200px", height: "45px", intensity: "high" },
  ],
  "local-seo": [
    { id: "hero-cta", element: "Hero CTA Form", top: "50%", left: "50%", width: "300px", height: "180px", intensity: "high" },
    { id: "local-badges", element: "Local Trust Badges", top: "25%", left: "50%", width: "280px", height: "40px", intensity: "medium" },
    { id: "location-info", element: "Location Info", top: "15%", left: "50%", width: "150px", height: "30px", intensity: "low" },
  ],
  "long-form": [
    { id: "sticky-cta", element: "Sticky CTA Footer", top: "95%", left: "50%", width: "350px", height: "50px", intensity: "high" },
    { id: "content-sections", element: "Content Sections", top: "40%", left: "50%", width: "400px", height: "200px", intensity: "medium" },
    { id: "toc-nav", element: "Table of Contents", top: "18%", left: "50%", width: "300px", height: "60px", intensity: "low" },
  ],
};

// Helper to draw a simple pie chart in jsPDF
function drawPieChart(
  doc: jsPDF, 
  centerX: number, 
  centerY: number, 
  radius: number, 
  data: { value: number; color: [number, number, number]; label: string }[]
) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let startAngle = -Math.PI / 2; // Start from top
  
  data.forEach((slice) => {
    const sliceAngle = (slice.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    
    // Draw slice
    doc.setFillColor(slice.color[0], slice.color[1], slice.color[2]);
    
    // Create path for pie slice
    const steps = 30;
    const points: [number, number][] = [[centerX, centerY]];
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (sliceAngle * i) / steps;
      points.push([
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      ]);
    }
    points.push([centerX, centerY]);
    
    // Draw filled polygon
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    const xCoords = points.map(p => p[0]);
    const yCoords = points.map(p => p[1]);
    
    // Use triangle approach for each segment
    for (let i = 1; i < points.length - 1; i++) {
      doc.triangle(
        points[0][0], points[0][1],
        points[i][0], points[i][1],
        points[i + 1][0], points[i + 1][1],
        'F'
      );
    }
    
    startAngle = endAngle;
  });
  
  // Draw white center for donut effect
  doc.setFillColor(255, 255, 255);
  const innerRadius = radius * 0.5;
  doc.circle(centerX, centerY, innerRadius, 'F');
}

// Helper to draw a bar chart in jsPDF
function drawBarChart(
  doc: jsPDF,
  startX: number,
  startY: number,
  width: number,
  height: number,
  data: { value: number; label: string; color: [number, number, number] }[]
) {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - (data.length - 1) * 4) / data.length;
  const chartBottom = startY + height;
  
  // Draw axis
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(startX, chartBottom, startX + width, chartBottom);
  
  data.forEach((item, i) => {
    const barHeight = (item.value / maxValue) * (height - 15);
    const barX = startX + i * (barWidth + 4);
    const barY = chartBottom - barHeight;
    
    // Draw bar
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.roundedRect(barX, barY, barWidth, barHeight, 1, 1, 'F');
    
    // Draw value on top
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.text(item.value.toString(), barX + barWidth / 2, barY - 2, { align: 'center' });
    
    // Draw label below
    doc.setFontSize(6);
    doc.setTextColor(120, 120, 120);
    const labelLines = doc.splitTextToSize(item.label, barWidth + 2);
    doc.text(labelLines[0].substring(0, 10), barX + barWidth / 2, chartBottom + 5, { align: 'center' });
  });
}
import { AnalyticsPrefillData } from "./UnifiedAnalyticsDashboard";

interface AILandingPageGeneratorProps {
  isGenerating: boolean;
  onGenerate: () => void;
  prefillData?: AnalyticsPrefillData | null;
  autoOpenFullScreen?: boolean;
}
 
const LANDING_PAGE_TEMPLATES = [
  { 
    id: "quote-funnel", 
    name: "Quote Funnel", 
    description: "High-converting quote request page with urgency triggers",
    conversion: "12.4%",
    style: "Dark hero, bold CTAs"
  },
  { 
    id: "comparison", 
    name: "Comparison Page", 
    description: "Compare services side-by-side with competitor pricing",
    conversion: "9.8%",
    style: "Clean, trust-focused"
  },
  { 
    id: "calculator", 
    name: "Cost Calculator", 
    description: "Interactive tool that captures leads through utility",
    conversion: "15.2%",
    style: "Tool-first, minimal"
  },
  { 
    id: "testimonial", 
    name: "Testimonial Heavy", 
    description: "Social proof focused with video testimonials",
    conversion: "11.1%",
    style: "Warm, personal"
  },
  { 
    id: "local-seo", 
    name: "Local SEO Lander", 
    description: "Geo-targeted for specific city/region searches",
    conversion: "14.7%",
    style: "Location-specific"
  },
  { 
    id: "long-form", 
    name: "Long-Form Sales", 
    description: "Detailed sales page with objection handling",
    conversion: "8.3%",
    style: "Comprehensive"
  },
];

// Color theme definitions
const COLOR_THEMES = [
  {
    id: "default",
    name: "Default",
    primary: "#3B82F6",
    primaryDark: "#1D4ED8",
    secondary: "#0F172A",
    accent: "#7C3AED",
    accentLight: "#A855F7",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    primary: "#3B82F6",
    primaryDark: "#1D4ED8",
    secondary: "#0C4A6E",
    accent: "#06B6D4",
    accentLight: "#22D3EE",
  },
  {
    id: "sunset",
    name: "Sunset Orange",
    primary: "#F97316",
    primaryDark: "#EA580C",
    secondary: "#7C2D12",
    accent: "#FBBF24",
    accentLight: "#FCD34D",
  },
  {
    id: "forest",
    name: "Forest Teal",
    primary: "#0D9488",
    primaryDark: "#0F766E",
    secondary: "#064E3B",
    accent: "#34D399",
    accentLight: "#6EE7B7",
  },
  {
    id: "royal",
    name: "Royal Purple",
    primary: "#8B5CF6",
    primaryDark: "#7C3AED",
    secondary: "#1E1B4B",
    accent: "#EC4899",
    accentLight: "#F472B6",
  },
  {
    id: "crimson",
    name: "Crimson Red",
    primary: "#EF4444",
    primaryDark: "#DC2626",
    secondary: "#450A0A",
    accent: "#F59E0B",
    accentLight: "#FBBF24",
  },
  {
    id: "midnight",
    name: "Midnight Black",
    primary: "#6366F1",
    primaryDark: "#4F46E5",
    secondary: "#020617",
    accent: "#A5F3FC",
    accentLight: "#CFFAFE",
  },
  {
    id: "coral",
    name: "Coral Pink",
    primary: "#F43F5E",
    primaryDark: "#E11D48",
    secondary: "#881337",
    accent: "#FB7185",
    accentLight: "#FDA4AF",
  },
];

interface EditableSection {
  id: string;
  type: 'headline' | 'subheadline' | 'body' | 'cta' | 'testimonial';
  content: string;
}

 // Imported dataset types
 interface KeywordPerformance {
   keyword: string;
   clicks: number;
   impressions: number;
   ctr: number;
   conversions: number;
   cost: number;
   position: number;
   trend: 'up' | 'down' | 'stable';
   winningReason: string;
 }
 
 interface GeographicData {
   region: string;
   state: string;
   clicks: number;
   conversions: number;
   convRate: number;
   revenue: number;
   topCity: string;
 }
 
 interface DemographicData {
   segment: string;
   percentage: number;
   clicks: number;
   conversions: number;
   avgOrderValue: number;
   device: string;
 }
 
 interface ClickBehavior {
   element: string;
   clicks: number;
   percentage: number;
   heatmapIntensity: 'high' | 'medium' | 'low';
   conversionImpact: string;
 }
 
 interface ImportedDataset {
   keywords: KeywordPerformance[];
   geographic: GeographicData[];
   demographic: DemographicData[];
   clickBehavior: ClickBehavior[];
   dateRange: string;
   totalClicks: number;
   totalConversions: number;
   totalRevenue: number;
 }
 
 // Mock imported data
 const MOCK_IMPORTED_DATA: ImportedDataset = {
   dateRange: "Jan 1 - Feb 5, 2025",
   totalClicks: 24847,
   totalConversions: 1892,
   totalRevenue: 284600,
   keywords: [
     { keyword: "long distance moving company", clicks: 4521, impressions: 89420, ctr: 5.06, conversions: 412, cost: 8245, position: 2.1, trend: 'up', winningReason: "High intent + low competition. Users searching this are 3.2x more likely to convert." },
     { keyword: "cross country movers near me", clicks: 3892, impressions: 67340, ctr: 5.78, conversions: 387, cost: 7120, position: 1.8, trend: 'up', winningReason: "Local modifier 'near me' signals immediate need. 42% higher conversion rate." },
     { keyword: "moving cost calculator", clicks: 5124, impressions: 124500, ctr: 4.12, conversions: 298, cost: 4890, position: 3.2, trend: 'stable', winningReason: "Tool-based intent captures early funnel. Lower CPA despite lower conversion rate." },
     { keyword: "cheap movers", clicks: 6234, impressions: 156780, ctr: 3.98, conversions: 245, cost: 11200, position: 4.1, trend: 'down', winningReason: "High volume but price-sensitive audience. Consider for brand awareness only." },
     { keyword: "ai moving estimate", clicks: 1847, impressions: 23400, ctr: 7.89, conversions: 289, cost: 2340, position: 1.2, trend: 'up', winningReason: "Emerging keyword with 340% YoY growth. Early mover advantage, lowest CPA." },
     { keyword: "furniture moving service", clicks: 2129, impressions: 45670, ctr: 4.66, conversions: 178, cost: 3980, position: 2.8, trend: 'stable', winningReason: "Specific service intent. Users often bundle with full-service moves." },
   ],
   geographic: [
     { region: "West", state: "California", clicks: 6847, conversions: 521, convRate: 7.61, revenue: 78150, topCity: "Los Angeles" },
     { region: "South", state: "Texas", clicks: 5234, conversions: 398, convRate: 7.60, revenue: 59700, topCity: "Houston" },
     { region: "South", state: "Florida", clicks: 4892, conversions: 367, convRate: 7.50, revenue: 55050, topCity: "Miami" },
     { region: "Northeast", state: "New York", clicks: 3567, conversions: 289, convRate: 8.10, revenue: 43350, topCity: "New York City" },
     { region: "West", state: "Arizona", clicks: 2134, conversions: 167, convRate: 7.82, revenue: 25050, topCity: "Phoenix" },
     { region: "Midwest", state: "Illinois", clicks: 1873, conversions: 150, convRate: 8.01, revenue: 22500, topCity: "Chicago" },
   ],
   demographic: [
     { segment: "Homeowners 35-54", percentage: 38, clicks: 9442, conversions: 812, avgOrderValue: 3240, device: "Desktop 62%" },
     { segment: "Young Professionals 25-34", percentage: 28, clicks: 6957, conversions: 492, avgOrderValue: 2180, device: "Mobile 71%" },
     { segment: "Retirees 55+", percentage: 18, clicks: 4472, conversions: 378, avgOrderValue: 4120, device: "Desktop 78%" },
     { segment: "First-time Movers 18-24", percentage: 12, clicks: 2982, conversions: 156, avgOrderValue: 1450, device: "Mobile 89%" },
     { segment: "Corporate Relocation", percentage: 4, clicks: 994, conversions: 54, avgOrderValue: 8900, device: "Desktop 91%" },
   ],
   clickBehavior: [
     { element: "Primary CTA Button", clicks: 8934, percentage: 35.9, heatmapIntensity: 'high', conversionImpact: "+47% of all conversions" },
     { element: "Quote Form Fields", clicks: 6721, percentage: 27.0, heatmapIntensity: 'high', conversionImpact: "89% form completion rate" },
     { element: "Trust Badges", clicks: 3892, percentage: 15.7, heatmapIntensity: 'medium', conversionImpact: "Users who click convert 2.3x more" },
     { element: "Pricing Section", clicks: 2834, percentage: 11.4, heatmapIntensity: 'medium', conversionImpact: "Reduces bounce by 34%" },
     { element: "Testimonials", clicks: 1567, percentage: 6.3, heatmapIntensity: 'low', conversionImpact: "Increases time on page 45s" },
     { element: "Navigation Links", clicks: 899, percentage: 3.6, heatmapIntensity: 'low', conversionImpact: "Often leads to exit - consider removing" },
   ],
 };
 
export function AILandingPageGenerator({ isGenerating, onGenerate, prefillData, autoOpenFullScreen }: AILandingPageGeneratorProps) {
   const [showLandingPage, setShowLandingPage] = useState(true);
   const [businessName, setBusinessName] = useState("TruMove");
   const [targetAudience, setTargetAudience] = useState("Homeowners planning long-distance moves");
   const [mainOffer, setMainOffer] = useState("Get a guaranteed quote in 60 seconds with AI-powered pricing");
  const [targetLocation, setTargetLocation] = useState("California, Texas, Florida");
   const [generationStep, setGenerationStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("quote-funnel");
  const [selectedTheme, setSelectedTheme] = useState("default");
  
  // Editable sections
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sections, setSections] = useState<EditableSection[]>([
    { id: 'main-headline', type: 'headline', content: 'Stop Overpaying for Your Move.' },
    { id: 'sub-headline', type: 'subheadline', content: 'Get AI-Powered Pricing Now.' },
    { id: 'hero-body', type: 'body', content: 'Join 50,000+ families who saved an average of $847 on their move. Our AI scans your inventory and matches you with verified carriers in seconds.' },
    { id: 'cta-primary', type: 'cta', content: 'Get My Free Quote' },
    { id: 'testimonial-1', type: 'testimonial', content: 'I was quoted $4,200 by another company. TruMove got me the same service for $3,350. The AI inventory scanner was scary accurate!' },
  ]);
  const [tempEditValue, setTempEditValue] = useState("");
   
   // Data import state
   const [showDataImport, setShowDataImport] = useState(false);
   const [importedData, setImportedData] = useState<ImportedDataset | null>(null);
   const [activeDataTab, setActiveDataTab] = useState<'keywords' | 'geographic' | 'demographic' | 'clicks'>('keywords');
   const [isPopoutOpen, setIsPopoutOpen] = useState(false);
   const [isSideBySide, setIsSideBySide] = useState(false);
   
   // Keyword filter state
   const [keywordTrendFilter, setKeywordTrendFilter] = useState<'all' | 'up' | 'down' | 'stable'>('all');
   const [keywordConversionFilter, setKeywordConversionFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
   
   // Heatmap overlay state
   const [showHeatmapOverlay, setShowHeatmapOverlay] = useState(false);
   const [showVideoPreview, setShowVideoPreview] = useState(false);
   
   // Track which fields were auto-populated from analytics
   const [autoPopulatedFields, setAutoPopulatedFields] = useState<Set<string>>(new Set());
    
  // Auto-populate from analytics prefill data
  useEffect(() => {
    if (prefillData) {
      const populatedFields = new Set<string>();
      
      if (prefillData.audience) {
        setTargetAudience(prefillData.audience);
        populatedFields.add('audience');
      }
      
      if (prefillData.locations && prefillData.locations.length > 0) {
        setTargetLocation(prefillData.locations.slice(0, 3).join(", "));
        populatedFields.add('location');
      }
      
      // Update main offer based on top keyword
      if (prefillData.topKeyword) {
        const keywordCapitalized = prefillData.topKeyword.charAt(0).toUpperCase() + prefillData.topKeyword.slice(1);
        setMainOffer(`Get the best ${keywordCapitalized.toLowerCase()} quotes instantly with AI-powered pricing`);
        populatedFields.add('offer');
      }
      
      // Update headline based on location
      if (prefillData.topLocation) {
        setSections(prev => prev.map(s => 
          s.id === 'main-headline' 
            ? { ...s, content: `${prefillData.topLocation}'s #1 Rated Moving Service` }
            : s
        ));
        populatedFields.add('headline');
      }
      
      if (prefillData.keywords && prefillData.keywords.length > 0) {
        populatedFields.add('keywords');
      }
      
      setAutoPopulatedFields(populatedFields);
    }
  }, [prefillData]);
   const [customHeatmapPositions, setCustomHeatmapPositions] = useState<typeof TEMPLATE_HEATMAP_POSITIONS["quote-funnel"]>(
     TEMPLATE_HEATMAP_POSITIONS["quote-funnel"]
   );
   const [editingHeatmapId, setEditingHeatmapId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [showPostGenEditor, setShowPostGenEditor] = useState(false);
  const [showBrandExtractor, setShowBrandExtractor] = useState(false);
  const [customBranding, setCustomBranding] = useState<ExtractedBranding | null>(null);

    // Update heatmap positions when template changes
    useEffect(() => {
      setCustomHeatmapPositions(TEMPLATE_HEATMAP_POSITIONS[selectedTemplate] || TEMPLATE_HEATMAP_POSITIONS["quote-funnel"]);
    }, [selectedTemplate]);

    // Auto-open full screen when coming from auto-build
    useEffect(() => {
      if (autoOpenFullScreen && !showLandingPage) {
        // Trigger immediate generation
        setGenerationStep(1);
        onGenerate();
        const steps = [1, 2, 3, 4, 5];
        steps.forEach((step, index) => {
          setTimeout(() => {
            setGenerationStep(step);
            if (step === 5) {
              setTimeout(() => {
                setShowLandingPage(true);
                setIsPopoutOpen(true);
                setGenerationStep(0);
              }, 400);
            }
          }, (index + 1) * 400);
        });
      }
    }, [autoOpenFullScreen]);

  // Get current template index for navigation
  const currentTemplateIndex = LANDING_PAGE_TEMPLATES.findIndex(t => t.id === selectedTemplate);
  
  const goToPrevTemplate = () => {
    const prevIndex = currentTemplateIndex > 0 ? currentTemplateIndex - 1 : LANDING_PAGE_TEMPLATES.length - 1;
    setSelectedTemplate(LANDING_PAGE_TEMPLATES[prevIndex].id);
    setIsPublished(false);
  };
  
  const goToNextTemplate = () => {
    const nextIndex = currentTemplateIndex < LANDING_PAGE_TEMPLATES.length - 1 ? currentTemplateIndex + 1 : 0;
    setSelectedTemplate(LANDING_PAGE_TEMPLATES[nextIndex].id);
    setIsPublished(false);
  };
  
  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success("Connecting to hosting...");
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Optimizing assets...");
    await new Promise(r => setTimeout(r, 800));
    toast.success("Deploying to CDN...");
    await new Promise(r => setTimeout(r, 600));
    setIsPublishing(false);
    setIsPublished(true);
    
    toast.success("🎉 Landing page published!", {
      description: "Your page is now live"
    });
  };
  

   // Get current heatmap positions
   const getCurrentHeatmapPositions = () => {
     return customHeatmapPositions;
   };

   // Update heatmap position
   const updateHeatmapPosition = (id: string, field: string, value: string) => {
     setCustomHeatmapPositions(prev => 
       prev.map(pos => pos.id === id ? { ...pos, [field]: value } : pos)
     );
   };
 
    const handleGenerateLandingPage = () => {
      setGenerationStep(1);
      onGenerate();
      
      // Simulate generation steps then open full-screen
      const steps = [1, 2, 3, 4, 5];
      steps.forEach((step, index) => {
        setTimeout(() => {
          setGenerationStep(step);
          if (step === 5) {
            setTimeout(() => {
              setShowLandingPage(true);
              setIsPopoutOpen(true);
              setGenerationStep(0);
            }, 400);
          }
        }, (index + 1) * 400);
      });
    };
 
   // Simulate data import
   const handleImportData = () => {
     toast.success("Data imported successfully!", {
       description: "Analyzing keyword performance, geographic & demographic insights..."
     });
     setTimeout(() => {
       setImportedData(MOCK_IMPORTED_DATA);
       // Auto-populate form fields from imported data
       const topStates = MOCK_IMPORTED_DATA.geographic.slice(0, 3).map(g => g.state).join(", ");
       setTargetLocation(topStates);
       
       // Set target audience from top demographic
       const topDemo = MOCK_IMPORTED_DATA.demographic[0];
       if (topDemo) {
         setTargetAudience(`${topDemo.segment} (${topDemo.device})`);
       }
     }, 1500);
   };
 
   // Filter keywords based on current filters
   const getFilteredKeywords = () => {
     if (!importedData) return [];
     return importedData.keywords.filter(kw => {
       // Trend filter
       if (keywordTrendFilter !== 'all' && kw.trend !== keywordTrendFilter) return false;
       
       // Conversion rate filter
       const convRate = (kw.conversions / kw.clicks) * 100;
       if (keywordConversionFilter === 'high' && convRate < 8) return false;
       if (keywordConversionFilter === 'medium' && (convRate < 5 || convRate >= 8)) return false;
       if (keywordConversionFilter === 'low' && convRate >= 5) return false;
       
       return true;
     });
   };
 
   // Export analytics as PDF
   const exportAnalyticsPdf = () => {
     if (!importedData) {
       toast.error("No data to export. Import analytics data first.");
       return;
     }
     
     const doc = new jsPDF();
     const pageWidth = doc.internal.pageSize.getWidth();
     
     // Title
     doc.setFontSize(22);
     doc.setTextColor(124, 58, 237);
     doc.text("Landing Page Analytics Report", pageWidth / 2, 20, { align: "center" });
     
     doc.setFontSize(10);
     doc.setTextColor(100);
     doc.text(`Generated: ${new Date().toLocaleDateString()} • Data Range: ${importedData.dateRange}`, pageWidth / 2, 28, { align: "center" });
     
     // Overview Stats
     doc.setFontSize(14);
     doc.setTextColor(30);
     doc.text("Performance Overview", 14, 42);
     
     doc.setFontSize(11);
     doc.setTextColor(60);
     doc.text(`Total Clicks: ${importedData.totalClicks.toLocaleString()}`, 14, 52);
     doc.text(`Total Conversions: ${importedData.totalConversions.toLocaleString()}`, 80, 52);
     doc.text(`Total Revenue: $${importedData.totalRevenue.toLocaleString()}`, 150, 52);
     doc.text(`Conversion Rate: ${((importedData.totalConversions / importedData.totalClicks) * 100).toFixed(2)}%`, 14, 60);
     
     // Keywords Table
     doc.setFontSize(14);
     doc.setTextColor(30);
     doc.text("Top Performing Keywords", 14, 75);
     
     autoTable(doc, {
       startY: 80,
       head: [['Keyword', 'Clicks', 'Conv.', 'CTR', 'Trend', 'Why It Wins']],
       body: importedData.keywords.map(kw => [
         kw.keyword,
         kw.clicks.toLocaleString(),
         kw.conversions.toString(),
         `${kw.ctr.toFixed(2)}%`,
         kw.trend === 'up' ? '↑' : kw.trend === 'down' ? '↓' : '→',
         kw.winningReason.substring(0, 50) + '...'
       ]),
       styles: { fontSize: 8 },
       headStyles: { fillColor: [124, 58, 237] },
       columnStyles: { 5: { cellWidth: 50 } }
     });
     
     // Geographic Performance
     const geoY = (doc as any).lastAutoTable.finalY + 15;
     doc.setFontSize(14);
     doc.setTextColor(30);
     doc.text("Geographic Performance", 14, geoY);
     
     autoTable(doc, {
       startY: geoY + 5,
       head: [['State', 'Region', 'Clicks', 'Conversions', 'Conv Rate', 'Revenue', 'Top City']],
       body: importedData.geographic.map(geo => [
         geo.state,
         geo.region,
         geo.clicks.toLocaleString(),
         geo.conversions.toString(),
         `${geo.convRate.toFixed(2)}%`,
         `$${geo.revenue.toLocaleString()}`,
         geo.topCity
       ]),
       styles: { fontSize: 8 },
       headStyles: { fillColor: [236, 72, 153] }
     });
     
     // Demographics
     const demoY = (doc as any).lastAutoTable.finalY + 15;
     doc.setFontSize(14);
     doc.setTextColor(30);
     doc.text("Demographic Insights", 14, demoY);
     
     autoTable(doc, {
       startY: demoY + 5,
       head: [['Segment', 'Share', 'Clicks', 'Conversions', 'Avg Order', 'Device']],
       body: importedData.demographic.map(demo => [
         demo.segment,
         `${demo.percentage}%`,
         demo.clicks.toLocaleString(),
         demo.conversions.toString(),
         `$${demo.avgOrderValue.toLocaleString()}`,
         demo.device
       ]),
       styles: { fontSize: 8 },
       headStyles: { fillColor: [59, 130, 246] }
     });
     
     // Click Behavior
     const clickY = (doc as any).lastAutoTable.finalY + 15;
     doc.setFontSize(14);
     doc.setTextColor(30);
     doc.text("Click Behavior & Heatmap Analysis", 14, clickY);
     
     autoTable(doc, {
       startY: clickY + 5,
       head: [['Element', 'Clicks', 'Share', 'Intensity', 'Impact']],
       body: importedData.clickBehavior.map(click => [
         click.element,
         click.clicks.toLocaleString(),
         `${click.percentage}%`,
         click.heatmapIntensity === 'high' ? '🔥 Hot' : click.heatmapIntensity === 'medium' ? '⚡ Warm' : '❄️ Cool',
         click.conversionImpact
       ]),
       styles: { fontSize: 8 },
       headStyles: { fillColor: [239, 68, 68] }
     });
     
     // AI Recommendations
     doc.addPage();
     doc.setFontSize(18);
     doc.setTextColor(124, 58, 237);
     doc.text("AI-Powered Recommendations", pageWidth / 2, 20, { align: "center" });
     
     const recommendations = [
       {
         title: "1. Double Down on Emerging Keywords",
         desc: `The keyword "ai moving estimate" shows 340% YoY growth with the lowest CPA ($8.09). Increase budget allocation by 40% and create dedicated landing page variants.`
       },
       {
         title: "2. Optimize for Mobile Young Professionals",
         desc: `25-34 age segment converts at high rate on mobile (71% mobile usage). Ensure mobile page speed <2s and implement one-tap calling CTAs.`
       },
       {
         title: "3. Geo-Target High-Value Markets",
         desc: `New York shows highest conversion rate (8.10%) despite lower volume. Consider increasing regional bids and adding city-specific landing pages.`
       },
       {
         title: "4. Leverage Trust Badge Interaction",
         desc: `Users who click trust badges convert 2.3x more. Make badges more prominent above the fold and add interactive tooltip explanations.`
       },
       {
         title: "5. Reduce Navigation Friction",
         desc: `Navigation links show low engagement (3.6%) and often lead to exit. Consider removing or minimizing navigation on focused landing pages.`
       },
       {
         title: "6. Target Corporate Relocation Segment",
         desc: `Corporate relocations show $8,900 avg order value (highest). Create B2B focused landing page variant with case studies and volume pricing.`
       }
     ];
     
     let recY = 35;
     recommendations.forEach(rec => {
       doc.setFontSize(12);
       doc.setTextColor(30);
       doc.text(rec.title, 14, recY);
       doc.setFontSize(10);
       doc.setTextColor(80);
       const lines = doc.splitTextToSize(rec.desc, pageWidth - 28);
       doc.text(lines, 14, recY + 7);
       recY += 25 + (lines.length * 4);
     });
     
     // Footer
     doc.setFontSize(9);
     doc.setTextColor(150);
     doc.text("Generated by TruMove AI Marketing Suite", pageWidth / 2, 285, { align: "center" });
     
     // Page 3: Visual Charts
     doc.addPage();
     doc.setFontSize(18);
     doc.setTextColor(124, 58, 237);
     doc.text("Visual Analytics", pageWidth / 2, 20, { align: "center" });
     
     // Click Distribution Pie Chart
     doc.setFontSize(12);
     doc.setTextColor(30);
     doc.text("Click Distribution by Element", 40, 40);
     
     const pieData = importedData.clickBehavior.slice(0, 5).map((click, i) => ({
       value: click.clicks,
       color: [
         [239, 68, 68],    // red
         [249, 115, 22],   // orange
         [234, 179, 8],    // yellow
          [59, 130, 246],   // blue
          [139, 92, 246],   // purple
        ][i] as [number, number, number],
        label: click.element
     }));
     
     drawPieChart(doc, 50, 85, 30, pieData);
     
     // Legend for pie chart
     let legendY = 50;
     pieData.forEach((item) => {
       doc.setFillColor(item.color[0], item.color[1], item.color[2]);
       doc.rect(90, legendY - 3, 6, 6, 'F');
       doc.setFontSize(8);
       doc.setTextColor(60);
       doc.text(`${item.label} (${((item.value / importedData.totalClicks) * 100).toFixed(1)}%)`, 100, legendY);
       legendY += 10;
     });
     
     // Conversion by Demographic Bar Chart
     doc.setFontSize(12);
     doc.setTextColor(30);
     doc.text("Conversions by Demographic", 40, 130);
     
     const demoBarData = importedData.demographic.map((demo, i) => ({
       value: demo.conversions,
       label: demo.segment.split(' ')[0],
       color: [
          [59, 130, 246],   // blue
          [139, 92, 246],   // purple
          [56, 189, 248],   // sky
         [245, 158, 11],   // amber
         [236, 72, 153],   // pink
       ][i] as [number, number, number]
     }));
     
     drawBarChart(doc, 25, 140, pageWidth - 50, 50, demoBarData);
     
     // Geographic Performance Bar Chart
     doc.setFontSize(12);
     doc.setTextColor(30);
     doc.text("Revenue by State", 40, 210);
     
     const geoBarData = importedData.geographic.slice(0, 5).map((geo, i) => ({
       value: Math.round(geo.revenue / 1000),
       label: geo.state,
       color: [
         [124, 58, 237],   // purple
         [236, 72, 153],   // pink
         [59, 130, 246],   // blue
         [16, 185, 129],   // teal
         [245, 158, 11],   // amber
       ][i] as [number, number, number]
     }));
     
     drawBarChart(doc, 25, 220, pageWidth - 50, 50, geoBarData);
     
     doc.setFontSize(8);
     doc.setTextColor(100);
     doc.text("Values in thousands ($K)", pageWidth / 2, 275, { align: "center" });
     
     doc.save(`landing-page-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
     toast.success("Analytics PDF exported successfully!");
   };
 
  const startEditing = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setEditingSection(sectionId);
      setTempEditValue(section.content);
    }
  };

  const saveEdit = () => {
    if (editingSection) {
      setSections(prev => prev.map(s => 
        s.id === editingSection ? { ...s, content: tempEditValue } : s
      ));
      setEditingSection(null);
      setTempEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setTempEditValue("");
  };

  const getSection = (id: string) => sections.find(s => s.id === id)?.content || "";

  // Get current theme colors
  const getThemeColors = () => {
    if (customBranding?.colors) {
      const primary = customBranding.colors.primary || "#3B82F6";
      const accent = customBranding.colors.accent || primary;
      const primaryDark = darkenHex(primary, 0.25);
      const accentLight = lightenHex(accent, 0.3);
      const isLightScheme = customBranding.colorScheme === "light" || isLightColor(customBranding.colors.background || "#FFFFFF");
      const secondary = isLightScheme ? "#0F172A" : (customBranding.colors.background || "#0F172A");
      const brandBackground = customBranding.colors.background || "#FFFFFF";
      const brandText = customBranding.colors.textPrimary || "#0F172A";
      const brandTextSecondary = customBranding.colors.textSecondary || "#64748B";
      return {
        id: "custom",
        name: "Custom",
        primary,
        primaryDark,
        secondary,
        accent,
        accentLight,
        brandBackground,
        brandText,
        brandTextSecondary,
        // Full style data
        typography: customBranding.typography,
        spacing: customBranding.spacing,
        components: customBranding.components,
      };
    }
    return COLOR_THEMES.find(t => t.id === selectedTheme) || COLOR_THEMES[0];
  };

  // Color utility helpers
  function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r,g,b].map(c => Math.max(0,Math.min(255,Math.round(c))).toString(16).padStart(2,'0')).join('');
  }
  function darkenHex(hex: string, amount: number): string {
    const [r,g,b] = hexToRgb(hex);
    return rgbToHex(r*(1-amount), g*(1-amount), b*(1-amount));
  }
  function lightenHex(hex: string, amount: number): string {
    const [r,g,b] = hexToRgb(hex);
    return rgbToHex(r+(255-r)*amount, g+(255-g)*amount, b+(255-b)*amount);
  }
  function isLightColor(hex: string): boolean {
    const [r,g,b] = hexToRgb(hex);
    return (r*299 + g*587 + b*114) / 1000 > 160;
  }

  const theme = getThemeColors();

  // Section style helpers for non-hero areas — inline styles override hardcoded Tailwind classes
  const hasBrandTheme = !!(theme as any).brandBackground;
  const brandFont = customBranding?.typography?.fontFamilies?.primary;
  const brandHeadingFont = customBranding?.typography?.fontFamilies?.heading || brandFont;
  const sectionStyles = hasBrandTheme ? {
    light: { background: (theme as any).brandBackground, color: (theme as any).brandText, fontFamily: brandFont } as React.CSSProperties,
    alt: { background: darkenHex((theme as any).brandBackground, 0.04), color: (theme as any).brandText, fontFamily: brandFont } as React.CSSProperties,
    dark: { background: '#0F172A', color: '#fff', fontFamily: brandFont } as React.CSSProperties,
    textMain: { color: (theme as any).brandText, fontFamily: brandHeadingFont, ...(customBranding?.typography?.fontSizes?.h2 ? { fontSize: customBranding.typography.fontSizes.h2 } : {}) } as React.CSSProperties,
    textSub: { color: (theme as any).brandTextSecondary, fontFamily: brandFont, ...(customBranding?.typography?.fontSizes?.body ? { fontSize: customBranding.typography.fontSizes.body } : {}) } as React.CSSProperties,
    border: { borderColor: `${(theme as any).brandText}15` } as React.CSSProperties,
    h1: { fontFamily: brandHeadingFont, ...(customBranding?.typography?.fontSizes?.h1 ? { fontSize: customBranding.typography.fontSizes.h1 } : {}), ...(customBranding?.typography?.fontWeights?.bold ? { fontWeight: customBranding.typography.fontWeights.bold } : {}) } as React.CSSProperties,
  } : {
    light: {} as React.CSSProperties,
    alt: {} as React.CSSProperties,
    dark: {} as React.CSSProperties,
    textMain: {} as React.CSSProperties,
    textSub: {} as React.CSSProperties,
    border: {} as React.CSSProperties,
    h1: {} as React.CSSProperties,
  };

  // Brand colors object to pass to shared components
  const brandColors = hasBrandTheme ? {
    primary: theme.primary,
    primaryDark: theme.primaryDark,
    accent: theme.accent,
    background: (theme as any).brandBackground,
    textPrimary: (theme as any).brandText,
    textSecondary: (theme as any).brandTextSecondary,
    typography: (theme as any).typography,
    spacing: (theme as any).spacing,
    components: (theme as any).components,
  } : undefined;

  // Derived brand style helpers for inline template sections
  const bs = {
    fontFamily: customBranding?.typography?.fontFamilies?.primary,
    headingFont: customBranding?.typography?.fontFamilies?.heading || customBranding?.typography?.fontFamilies?.primary,
    h1Size: customBranding?.typography?.fontSizes?.h1,
    h2Size: customBranding?.typography?.fontSizes?.h2,
    h3Size: customBranding?.typography?.fontSizes?.h3,
    bodySize: customBranding?.typography?.fontSizes?.body,
    fontWeightBold: customBranding?.typography?.fontWeights?.bold,
    fontWeightMedium: customBranding?.typography?.fontWeights?.medium,
    borderRadius: customBranding?.spacing?.borderRadius,
    btnRadius: customBranding?.components?.buttonPrimary?.borderRadius || customBranding?.spacing?.borderRadius,
    btnBg: customBranding?.components?.buttonPrimary?.background || theme.primary,
    btnColor: customBranding?.components?.buttonPrimary?.textColor || '#FFFFFF',
  };

  const handleApplyBranding = (branding: ExtractedBranding) => {
    setCustomBranding(branding);
    setSelectedTheme("custom");
  };

  // Generate template-specific HTML content
  const generateHtmlContent = () => {
    const templateName = LANDING_PAGE_TEMPLATES.find(t => t.id === selectedTemplate)?.name || "Landing Page";
    const themeName = COLOR_THEMES.find(t => t.id === selectedTheme)?.name || "Default";
    
    // Common CSS styles
    const commonStyles = `
    :root {
      --primary: ${theme.primary};
      --primary-dark: ${theme.primaryDark};
      --secondary: ${theme.secondary};
      --accent: ${theme.accent};
      --accent-light: ${theme.accentLight};
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .btn-primary { padding: 1rem 2rem; font-size: 1.125rem; font-weight: 700; color: white; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); border: none; border-radius: 0.5rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none; }
    .btn-primary:hover { opacity: 0.9; }
    .input { width: 100%; padding: 0.75rem 1rem; border-radius: 0.5rem; border: 1px solid #E2E8F0; margin-bottom: 0.75rem; font-size: 1rem; }
    .badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .badge-primary { background: rgba(124, 58, 237, 0.1); color: var(--primary); }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
    @media (max-width: 768px) { .container { padding: 0 1rem; } }`;

    // Template-specific body content
    const getTemplateBody = () => {
      switch (selectedTemplate) {
        case "quote-funnel":
          return `
    <section style="background: linear-gradient(135deg, ${theme.secondary} 0%, #1E293B 50%, ${theme.secondary} 100%); padding: 4rem 2rem; text-align: center; color: white; position: relative;">
      <div style="position: absolute; top: 1rem; left: 1rem;">
        <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #3B82F6; border: 1px solid rgba(59, 130, 246, 0.3);">✓ FMCSA Licensed</span>
      </div>
      <div style="position: absolute; top: 1rem; right: 1rem;">
        <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3);">⭐ 4.9/5 Rating</span>
      </div>
      <h1 style="font-size: 2.5rem; font-weight: 900; margin-bottom: 1rem;">
        ${getSection('main-headline')}<br>
        <span style="background: linear-gradient(90deg, ${theme.primary}, ${theme.accentLight}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${getSection('sub-headline')}</span>
      </h1>
      <p style="font-size: 1.125rem; color: #CBD5E1; margin-bottom: 2rem; max-width: 42rem; margin-left: auto; margin-right: auto;">${getSection('hero-body')}</p>
      <div style="max-width: 28rem; margin: 0 auto; background: rgba(255,255,255,0.1); backdrop-filter: blur(8px); border-radius: 1rem; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.2);">
        <input type="text" class="input" placeholder="Moving from (ZIP code)" style="background: rgba(255,255,255,0.9); border: none; color: #1E293B;">
        <input type="text" class="input" placeholder="Moving to (ZIP code)" style="background: rgba(255,255,255,0.9); border: none; color: #1E293B;">
        <button class="btn-primary" style="width: 100%;">${getSection('cta-primary')} →</button>
        <p style="font-size: 0.75rem; color: #94A3B8; margin-top: 0.75rem; text-align: center;">🔒 No credit card required • Instant results</p>
      </div>
      <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 2rem; color: #94A3B8; font-size: 0.875rem; flex-wrap: wrap;">
        <span>🛡️ Price Lock Guarantee</span>
        <span>⏱️ 60-Second Quotes</span>
        <span>👥 50,000+ Moves</span>
      </div>
    </section>
    <section style="padding: 3rem 2rem;">
      <h2 style="text-align: center; font-size: 1.5rem; font-weight: 700; margin-bottom: 2rem;">Get Your Quote in 3 Simple Steps</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; max-width: 48rem; margin: 0 auto;">
        <div style="text-align: center;">
          <div style="width: 3.5rem; height: 3.5rem; border-radius: 50%; background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%); color: white; font-weight: 700; font-size: 1.25rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem;">1</div>
          <h3 style="font-weight: 600; margin-bottom: 0.25rem;">Enter Your Route</h3>
          <p style="font-size: 0.875rem; color: #64748B;">Tell us where you're moving</p>
        </div>
        <div style="text-align: center;">
          <div style="width: 3.5rem; height: 3.5rem; border-radius: 50%; background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%); color: white; font-weight: 700; font-size: 1.25rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem;">2</div>
          <h3 style="font-weight: 600; margin-bottom: 0.25rem;">AI Scans Your Home</h3>
          <p style="font-size: 0.875rem; color: #64748B;">Instant inventory estimate</p>
        </div>
        <div style="text-align: center;">
          <div style="width: 3.5rem; height: 3.5rem; border-radius: 50%; background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%); color: white; font-weight: 700; font-size: 1.25rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem;">3</div>
          <h3 style="font-weight: 600; margin-bottom: 0.25rem;">Compare & Book</h3>
          <p style="font-size: 0.875rem; color: #64748B;">Choose verified carriers</p>
        </div>
      </div>
    </section>`;

        case "comparison":
          return `
    <section style="padding: 3rem 2rem; text-align: center; background: linear-gradient(to bottom, #F8FAFC, white);">
      <span class="badge badge-primary" style="margin-bottom: 1rem;">Compare & Save</span>
      <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem;">How We Stack Up Against the Competition</h1>
      <p style="font-size: 1.125rem; color: #64748B; max-width: 42rem; margin: 0 auto 2rem;">See why 50,000+ families chose ${businessName} over traditional moving brokers</p>
    </section>
    <section style="padding: 2rem;">
      <table style="width: 100%; max-width: 48rem; margin: 0 auto; border-collapse: collapse; border: 1px solid #E2E8F0; border-radius: 0.75rem; overflow: hidden;">
        <thead>
          <tr style="background: #F1F5F9;">
            <th style="padding: 1rem; text-align: left;">Feature</th>
            <th style="padding: 1rem; text-align: center; background: ${theme.primary}; color: white;">${businessName}</th>
            <th style="padding: 1rem; text-align: center;">Competitor A</th>
            <th style="padding: 1rem; text-align: center;">Competitor B</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-top: 1px solid #E2E8F0;">
            <td style="padding: 1rem;">AI Inventory Scanning</td>
            <td style="padding: 1rem; text-align: center; background: ${theme.primary}10;">✅</td>
            <td style="padding: 1rem; text-align: center;">❌</td>
            <td style="padding: 1rem; text-align: center;">❌</td>
          </tr>
          <tr style="border-top: 1px solid #E2E8F0;">
            <td style="padding: 1rem;">Price Lock Guarantee</td>
            <td style="padding: 1rem; text-align: center; background: ${theme.primary}10;">✅</td>
            <td style="padding: 1rem; text-align: center;">❌</td>
            <td style="padding: 1rem; text-align: center;">❌</td>
          </tr>
          <tr style="border-top: 1px solid #E2E8F0;">
            <td style="padding: 1rem;">Real-Time Tracking</td>
            <td style="padding: 1rem; text-align: center; background: ${theme.primary}10;">✅</td>
            <td style="padding: 1rem; text-align: center;">✅</td>
            <td style="padding: 1rem; text-align: center;">✅</td>
          </tr>
          <tr style="border-top: 1px solid #E2E8F0;">
            <td style="padding: 1rem;">24/7 Support</td>
            <td style="padding: 1rem; text-align: center; background: ${theme.primary}10;">✅</td>
            <td style="padding: 1rem; text-align: center;">❌</td>
            <td style="padding: 1rem; text-align: center;">✅</td>
          </tr>
        </tbody>
      </table>
      <div style="text-align: center; margin-top: 2rem;">
        <a href="#" class="btn-primary">${getSection('cta-primary')} →</a>
      </div>
    </section>`;

        case "calculator":
          return `
    <header style="padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0;">
      <h1 style="font-size: 1.5rem; font-weight: 700;">${businessName}</h1>
      <span class="badge badge-primary">🧮 Free Calculator</span>
    </header>
    <section style="padding: 3rem 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; max-width: 900px; margin: 0 auto;">
      <div>
        <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">Moving Cost Calculator</h2>
        <p style="color: #64748B; margin-bottom: 1.5rem;">Get an instant estimate based on your move details. No email required.</p>
        <div style="background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">From</label>
          <input type="text" class="input" placeholder="Origin city or ZIP">
          <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">To</label>
          <input type="text" class="input" placeholder="Destination city or ZIP">
          <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Home Size</label>
          <select class="input" style="width: 100%;">
            <option>Studio / 1 Bedroom</option>
            <option>2 Bedroom</option>
            <option>3 Bedroom</option>
            <option>4+ Bedroom</option>
          </select>
          <button class="btn-primary" style="width: 100%; margin-top: 0.5rem; background: linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentLight} 100%);">🧮 Calculate My Cost</button>
        </div>
      </div>
      <div style="display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center; padding: 3rem; border: 2px dashed #E2E8F0; border-radius: 1rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">💰</div>
          <p style="color: #94A3B8;">Your estimate will appear here</p>
          <p style="font-size: 0.75rem; color: #CBD5E1; margin-top: 0.5rem;">Enter your details to get started</p>
        </div>
      </div>
    </section>`;

        case "testimonial":
          return `
    <section style="padding: 3rem 2rem; text-align: center; background: linear-gradient(to bottom, ${theme.primary}10, white);">
      <div style="display: flex; justify-content: center; gap: 0.25rem; margin-bottom: 1rem;">
        ${[1,2,3,4,5].map(() => `<span style="color: ${theme.primary}; font-size: 2rem;">★</span>`).join('')}
      </div>
      <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.75rem;">Real Families. Real Stories.</h1>
      <p style="font-size: 1.125rem; color: #64748B;">See why we're rated 4.9/5 by over 50,000 customers</p>
    </section>
    <section style="padding: 2rem; max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
      ${[
        { name: "Sarah M.", location: "Austin, TX", quote: "Saved $847 on my cross-country move!" },
        { name: "Michael C.", location: "Denver, CO", quote: "The AI scanner was incredibly accurate." },
        { name: "Emily R.", location: "Seattle, WA", quote: "Best moving experience ever. Period." },
        { name: "David K.", location: "Miami, FL", quote: "24/7 support made all the difference." },
      ].map(t => `
        <div style="padding: 1.5rem; border-radius: 1rem; background: white; border: 1px solid #E2E8F0;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
            <div style="width: 3rem; height: 3rem; border-radius: 50%; background: linear-gradient(135deg, ${theme.primary}, ${theme.accent}); color: white; font-weight: 700; display: flex; align-items: center; justify-content: center;">${t.name[0]}</div>
            <div>
              <div style="font-weight: 600;">${t.name}</div>
              <div style="font-size: 0.875rem; color: #64748B;">${t.location}</div>
            </div>
          </div>
          <p style="color: #475569; font-style: italic;">"${t.quote}"</p>
        </div>
      `).join('')}
    </section>
    <div style="text-align: center; padding: 2rem;">
      <a href="#" class="btn-primary">Join 50,000+ Happy Families →</a>
    </div>`;

        case "local-seo":
          return `
    <section style="padding: 4rem 2rem; text-align: center; background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%); color: white;">
      <span class="badge" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); margin-bottom: 1rem;">📍 ${targetLocation || "California"} Movers</span>
      <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem;">#1 Rated Moving Company in ${targetLocation || "California"}</h1>
      <p style="font-size: 1.125rem; opacity: 0.9; max-width: 42rem; margin: 0 auto 2rem;">Trusted by local families for over 10 years. Licensed, insured, and ready to make your move stress-free.</p>
      <div style="max-width: 28rem; margin: 0 auto; background: white; border-radius: 1rem; padding: 1.5rem; color: #1E293B;">
        <h3 style="font-weight: 600; margin-bottom: 1rem;">Get a Free Local Quote</h3>
        <input type="text" class="input" placeholder="Your ZIP code" style="text-align: center;">
        <input type="text" class="input" placeholder="Phone number" style="text-align: center;">
        <button class="btn-primary" style="width: 100%;">Get My Quote →</button>
        <p style="font-size: 0.75rem; color: #64748B; margin-top: 0.75rem;">Serving all of ${targetLocation || "California"}</p>
      </div>
    </section>
    <section style="padding: 2rem; background: #F8FAFC; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center;">
      <div><div style="font-size: 1.5rem; font-weight: 700;">🏢</div><div style="font-size: 1.25rem; font-weight: 700;">Downtown LA</div><div style="font-size: 0.75rem; color: #64748B;">Local Office</div></div>
      <div><div style="font-size: 1.5rem; font-weight: 700;">📦</div><div style="font-size: 1.25rem; font-weight: 700;">12,847</div><div style="font-size: 0.75rem; color: #64748B;">Moves Completed</div></div>
      <div><div style="font-size: 1.5rem; font-weight: 700;">⏱️</div><div style="font-size: 1.25rem; font-weight: 700;">< 2 hours</div><div style="font-size: 0.75rem; color: #64748B;">Avg Response</div></div>
      <div><div style="font-size: 1.5rem; font-weight: 700;">⭐</div><div style="font-size: 1.25rem; font-weight: 700;">4.9/5</div><div style="font-size: 0.75rem; color: #64748B;">Rating</div></div>
    </section>
    <section style="padding: 2rem; text-align: center;">
      <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">Areas We Serve</h2>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem;">
        ${["Los Angeles", "San Diego", "San Francisco", "Sacramento", "San Jose", "Oakland", "Fresno", "Long Beach"].map(city => `<span class="badge" style="background: #F1F5F9; color: #475569; padding: 0.5rem 1rem;">${city}</span>`).join('')}
      </div>
    </section>`;

        case "long-form":
          return `
    <article style="max-width: 48rem; margin: 0 auto; padding: 3rem 2rem;">
      <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #64748B; margin-bottom: 1rem;">The Complete Guide</p>
      <h1 style="font-size: 2.5rem; font-weight: 700; line-height: 1.2; margin-bottom: 1.5rem;">Everything You Need to Know Before Hiring a Moving Company in 2025</h1>
      <p style="font-size: 1.125rem; color: #64748B; margin-bottom: 1rem;">A comprehensive guide to saving money, avoiding scams, and finding the perfect mover for your needs.</p>
      <p style="font-size: 0.875rem; color: #94A3B8;">15 min read • Updated Feb 2025</p>
    </article>
    <nav style="padding: 1.5rem 2rem; background: #F8FAFC; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0;">
      <div style="max-width: 48rem; margin: 0 auto;">
        <h3 style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.75rem;">In This Guide:</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.875rem;">
          <a href="#" style="color: ${theme.primary}; text-decoration: none;">1. Understanding Moving Costs</a>
          <a href="#" style="color: ${theme.primary}; text-decoration: none;">2. Red Flags to Watch For</a>
          <a href="#" style="color: ${theme.primary}; text-decoration: none;">3. How to Compare Quotes</a>
          <a href="#" style="color: ${theme.primary}; text-decoration: none;">4. The AI Advantage</a>
        </div>
      </div>
    </nav>
    <article style="max-width: 48rem; margin: 0 auto; padding: 2rem;">
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">1. Understanding Moving Costs</h2>
        <p style="color: #475569; margin-bottom: 1rem;">The average cost of a long-distance move ranges from $2,000 to $5,000, depending on distance, weight, and time of year. Here's how to budget effectively...</p>
        <div style="padding: 1rem; border-radius: 0.75rem; background: ${theme.primary}10; border: 1px solid ${theme.primary}30;">
          <p style="font-size: 0.875rem; color: ${theme.primaryDark};">💡 <strong>Pro Tip:</strong> Get quotes at least 4-6 weeks before your move date for the best rates.</p>
        </div>
      </section>
      <section>
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">2. Red Flags to Watch For</h2>
        <ul style="list-style: none; padding: 0;">
          <li style="display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.75rem; color: #475569;"><span style="color: #EF4444;">✗</span> Large deposits required upfront</li>
          <li style="display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.75rem; color: #475569;"><span style="color: #EF4444;">✗</span> No physical address or office</li>
          <li style="display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.75rem; color: #475569;"><span style="color: #EF4444;">✗</span> Quotes given over the phone without inspection</li>
          <li style="display: flex; align-items: flex-start; gap: 0.5rem; color: #475569;"><span style="color: #EF4444;">✗</span> No FMCSA registration number</li>
        </ul>
      </section>
    </article>
    <footer style="position: sticky; bottom: 0; padding: 1rem 2rem; background: white; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; max-width: 48rem; margin: 0 auto;">
      <div>
        <p style="font-weight: 600;">Ready to get started?</p>
        <p style="font-size: 0.875rem; color: #64748B;">Get your free AI-powered quote in 60 seconds</p>
      </div>
      <a href="#" class="btn-primary">${getSection('cta-primary')} →</a>
    </footer>`;

        default:
          return `<section style="padding: 4rem 2rem; text-align: center;"><h1 style="font-size: 2rem; font-weight: 700;">${businessName}</h1><p style="color: #64748B; margin: 1rem 0;">${mainOffer}</p><a href="#" class="btn-primary">${getSection('cta-primary')} →</a></section>`;
      }
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} - ${templateName}</title>
  <meta name="description" content="${mainOffer}">
  <style>${commonStyles}</style>
</head>
<body>
  ${getTemplateBody()}
  <!-- Generated by ${businessName} AI Landing Page Generator -->
  <!-- Template: ${templateName} | Theme: ${themeName} -->
</body>
</html>`;
  };

  // Export landing page as HTML file download
  const exportAsHtml = () => {
    const htmlContent = generateHtmlContent();
    
    // Create and download the file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName.toLowerCase().replace(/\s/g, '-')}-${selectedTemplate}-landing-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Landing page exported!", {
      description: "HTML file downloaded successfully"
    });
  };

  // Copy HTML to clipboard
  const copyHtmlToClipboard = async () => {
    const htmlContent = generateHtmlContent();
    
    try {
      await navigator.clipboard.writeText(htmlContent);
      toast.success("HTML copied to clipboard!", {
        description: "Paste it anywhere to use"
      });
    } catch (err) {
      toast.error("Failed to copy", {
        description: "Please try the download option instead"
      });
    }
  };

  const EditableText = ({ sectionId, className, as: Component = 'span' }: { sectionId: string; className?: string; as?: 'span' | 'p' | 'h1' | 'h2' }) => {
    const isEditing = editingSection === sectionId;
    const content = getSection(sectionId);
    const section = sections.find(s => s.id === sectionId);
    const sectionType = section?.type || 'body';
    
    if (isEditing) {
      return (
        <div className="w-full">
          <div className="relative inline-flex items-center gap-2 w-full">
            {Component === 'p' || Component === 'span' ? (
              <Textarea
                value={tempEditValue}
                onChange={(e) => setTempEditValue(e.target.value)}
                className="text-sm bg-white text-slate-900 border-2 border-purple-500 rounded-lg p-2 min-h-[60px] w-full"
                autoFocus
              />
            ) : (
              <Input
                value={tempEditValue}
                onChange={(e) => setTempEditValue(e.target.value)}
                className="text-lg font-bold bg-white text-slate-900 border-2 border-purple-500 rounded-lg p-2 w-full"
                autoFocus
              />
            )}
            <div className="flex gap-1">
              <button 
                onClick={saveEdit}
                className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={cancelEdit}
                className="p-1.5 rounded-lg bg-slate-500 text-white hover:bg-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
        </div>
      );
    }

    return (
      <Component 
        className={`${className} group relative cursor-pointer hover:bg-purple-500/20 rounded px-1 -mx-1 transition-colors`}
        onClick={() => startEditing(sectionId)}
      >
        {content}
        <Pencil className="w-3 h-3 absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-purple-400 transition-opacity" />
      </Component>
    );
  };

  // Template-specific landing page renders
  const renderQuoteFunnelPage = () => (
    <div className="bg-white dark:bg-slate-900 relative">
      {/* Sticky Header */}
      <header className="relative z-10 bg-white/95 border-b-2" style={{ borderColor: theme.primary }}>
        <div className="flex items-center justify-between px-6 py-3">
          <TruMoveLogo className="h-8" />
          <div className="flex items-center gap-4">
             <a href="tel:1-800-TRUMOVE" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors">
              <Phone className="w-4 h-4" />
              <span className="font-semibold text-sm">1-800-TRUMOVE</span>
            </a>
            <Button size="sm" style={{ background: theme.primary }}>Get a Quote</Button>
          </div>
        </div>
      </header>

      {/* Urgency Banner */}
      <div className="py-2.5 text-center text-white" style={{ background: `linear-gradient(90deg, #DC2626, #EA580C)` }}>
        <span className="flex items-center justify-center gap-2 text-sm font-medium">
          <Zap className="w-4 h-4 animate-pulse" />
          🔥 Limited Time: $200 Off Long-Distance Moves — Only 3 Spots Left This Week!
          <Zap className="w-4 h-4 animate-pulse" />
        </span>
      </div>

       {/* Hero Section - Mesh gradient with animated orbs */}
       <div 
         className="relative px-8 py-24 text-center overflow-hidden"
         style={{ background: `linear-gradient(135deg, ${theme.secondary} 0%, #0a0e1a 40%, ${theme.secondary} 100%)` }}
       >
         {/* Animated mesh gradient orbs */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] animate-pulse" 
             style={{ background: theme.primary, top: '-20%', left: '-10%' }} />
           <div className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[100px] animate-pulse" 
             style={{ background: theme.accent, bottom: '-15%', right: '-5%', animationDelay: '1s' }} />
           <div className="absolute w-[300px] h-[300px] rounded-full opacity-10 blur-[80px] animate-pulse" 
             style={{ background: theme.accentLight, top: '30%', right: '20%', animationDelay: '2s' }} />
           {/* Grain texture overlay */}
           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />
         </div>

         <div className="absolute top-4 left-4 flex gap-2 flex-wrap z-10">
           <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-sm">
             <CheckCircle2 className="w-3 h-3 mr-1" />
             FMCSA Licensed
           </Badge>
           <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-sm">
             <Shield className="w-3 h-3 mr-1" />
             Bonded & Insured
           </Badge>
         </div>
         <div className="absolute top-4 right-4 z-10">
           <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm">
             ⭐ 4.9/5 Rating • 50K+ Moves
           </Badge>
         </div>

         <div className="relative z-10">
           <TruMoveLogo className="h-12 mx-auto mb-6 brightness-0 invert" />
           
           <Badge className="mb-6 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-4 py-1.5 backdrop-blur-sm">
             <Sparkles className="w-3.5 h-3.5 mr-1.5" />
             AI-Powered Moving Technology
           </Badge>
           
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-[0.95] max-w-4xl mx-auto tracking-tight" style={{ fontFamily: bs.headingFont, ...(bs.h1Size ? { fontSize: bs.h1Size } : {}), ...(bs.fontWeightBold ? { fontWeight: bs.fontWeightBold } : {}) }}>
              <EditableText sectionId="main-headline" as="span" className="block" />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${theme.primary}, ${theme.accentLight}, ${theme.primary})` }}>
                <EditableText sectionId="sub-headline" as="span" />
              </span>
            </h1>
            
            <div className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto" style={{ fontFamily: bs.fontFamily, ...(bs.bodySize ? { fontSize: bs.bodySize } : {}) }}>
              <EditableText sectionId="hero-body" as="p" />
            </div>

           {/* Feature checkmarks */}
           <div className="flex items-center justify-center gap-6 mb-10 text-sm">
             {[
               "Instant AI-Powered Quotes",
               "Verified Carriers Only", 
               "Price Lock Guarantee",
               "24/7 Live Support"
             ].map((item, i) => (
               <span key={i} className="flex items-center gap-1.5 text-white/90">
                 <CheckCircle2 className="w-4 h-4" style={{ color: theme.primary }} />
                 {item}
               </span>
             ))}
           </div>

           {/* Glassmorphism Quote Form */}
            <div 
              className="max-w-lg mx-auto p-8 border shadow-2xl relative overflow-hidden"
              style={{ 
                background: 'rgba(255,255,255,0.06)', 
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderColor: `rgba(255,255,255,0.12)`,
                boxShadow: `0 0 80px ${theme.primary}25, 0 32px 64px rgba(0,0,0,0.4)`,
                borderRadius: bs.borderRadius || '1.5rem',
              }}
            >
              {/* Animated border glow */}
              <div className="absolute -inset-[1px] opacity-40" style={{
                background: `linear-gradient(135deg, ${theme.primary}60, transparent 40%, transparent 60%, ${theme.accentLight}60)`,
                borderRadius: bs.borderRadius || '1.5rem',
              }} />
              <div className="relative">
                <h3 className="text-white font-bold text-xl mb-4" style={{ fontFamily: bs.headingFont, ...(bs.h3Size ? { fontSize: bs.h3Size } : {}) }}>Get Your Free TruMove Quote</h3>
                <div className="space-y-3 mb-4">
                  <Input placeholder="Moving from (ZIP code)" className="bg-white/95 border-0 text-slate-900 py-5" style={{ borderRadius: bs.btnRadius || '0.75rem', fontFamily: bs.fontFamily }} />
                  <Input placeholder="Moving to (ZIP code)" className="bg-white/95 border-0 text-slate-900 py-5" style={{ borderRadius: bs.btnRadius || '0.75rem', fontFamily: bs.fontFamily }} />
                  <Input placeholder="Phone number" className="bg-white/95 border-0 text-slate-900 py-5" style={{ borderRadius: bs.btnRadius || '0.75rem', fontFamily: bs.fontFamily }} />
                </div>
                <Button 
                  className="w-full py-7 text-lg font-bold gap-2 shadow-lg" 
                  style={{ 
                    background: `linear-gradient(135deg, ${bs.btnBg} 0%, ${theme.primaryDark} 100%)`,
                    boxShadow: `0 8px 32px ${theme.primary}50`,
                    borderRadius: bs.btnRadius || '0.75rem',
                    color: bs.btnColor,
                    fontFamily: bs.fontFamily,
                    fontWeight: bs.fontWeightBold,
                  }}
                >
                  <EditableText sectionId="cta-primary" as="span" /> <ArrowRight className="w-5 h-5" />
                </Button>
               <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400">
                 <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Secure</span>
                 <span>•</span>
                 <span>No Credit Card</span>
                 <span>•</span>
                 <span>Instant Results</span>
               </div>
             </div>
           </div>

           {/* As Seen In - scrolling logos */}
           <div className="mt-16 flex items-center justify-center gap-10 text-slate-500">
             <span className="text-xs uppercase tracking-widest text-slate-600">As seen in</span>
             {["Forbes", "Inc.", "TechCrunch", "WSJ"].map(name => (
               <span key={name} className="font-bold text-lg opacity-30 hover:opacity-60 transition-opacity cursor-default">{name}</span>
             ))}
           </div>
         </div>
      </div>

      {/* Social Proof Ticker */}
      <div className="bg-slate-900 text-white py-3 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {[
            "Sarah from Austin just saved $847 on her move",
            "Michael in Denver got a quote in 47 seconds", 
            "The Johnson family completed their TruMove today",
            "Emily from Seattle rated TruMove 5 stars",
            "1,247 quotes generated today",
            "David from Miami just booked his move",
            "Sarah from Austin just saved $847 on her move",
            "Michael in Denver got a quote in 47 seconds",
          ].map((proof, i) => (
            <span key={i} className="mx-8 flex items-center gap-2">
              <span style={{ color: theme.primary }}>●</span>
              <span className="text-sm">{proof}</span>
            </span>
          ))}
        </div>
      </div>

       {/* Trust Badge Strip */}
       <div className="flex justify-center items-center gap-8 py-5 border-b border-slate-200 bg-slate-50" style={{ ...sectionStyles.alt, ...sectionStyles.border }}>
         {[
           { icon: Shield, text: "FMCSA Licensed" },
           { icon: Award, text: "BBB A+ Rated" },
           { icon: Users, text: "50,000+ Moves" },
           { icon: Star, text: "4.9/5 Rating" },
         ].map((badge, i) => (
           <div key={i} className="flex items-center gap-2">
             <badge.icon className="w-4 h-4" style={{ color: theme.primary }} />
             <span className="text-sm font-medium text-slate-700" style={sectionStyles.textSub}>{badge.text}</span>
           </div>
         ))}
       </div>

       {/* 3-Step Process */}
       <div className="py-16 px-8 bg-white" style={sectionStyles.light}>
         <div className="text-center mb-12">
           <Badge className="mb-4" style={{ background: `${theme.primary}15`, color: theme.primary, borderColor: `${theme.primary}30` }}>
             How TruMove Works
           </Badge>
           <h2 className="text-3xl font-bold text-slate-900 mb-3" style={sectionStyles.textMain}>3 Simple Steps to Your Perfect Move</h2>
           <p className="text-lg text-slate-600" style={sectionStyles.textSub}>Powered by TruMove AI technology</p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="absolute top-14 left-20 right-20 h-0.5 hidden md:block" style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent}, ${theme.primary})` }} />
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: 1, icon: "📱", title: "Scan Your Home", description: "Use our AI scanner to instantly inventory your belongings" },
              { number: 2, icon: "🔍", title: "Get Matched", description: "TruMove AI matches you with verified carriers in seconds" },
              { number: 3, icon: "🚚", title: "Move Stress-Free", description: "Track your move in real-time with TruTrack technology" },
            ].map((step, i) => (
              <div key={i} className="relative text-center">
                <div 
                  className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl shadow-lg relative z-10"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, boxShadow: `0 8px 32px ${theme.primary}40` }}
                >
                  {step.icon}
                </div>
                <div className="absolute -top-2 right-1/3 w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center z-20">
                  {step.number}
                </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-2" style={sectionStyles.textMain}>{step.title}</h3>
                 <p className="text-sm text-slate-600" style={sectionStyles.textSub}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-10">
          <PoweredByBadge />
        </div>
      </div>

       {/* Video Testimonials */}
       <div className="py-16 px-8 bg-slate-50" style={sectionStyles.alt}>
         <div className="text-center mb-12">
           <Badge className="mb-4 bg-purple-500/10 text-purple-600 border border-purple-500/30">Real Stories</Badge>
           <h2 className="text-3xl font-bold text-slate-900 mb-3" style={sectionStyles.textMain}>Watch Real TruMove Stories</h2>
           <p className="text-lg text-slate-600" style={sectionStyles.textSub}>See why families across America trust TruMove</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Sarah M.", location: "Austin, TX", saved: "$847", thumbnail: "👩‍💼" },
            { name: "Michael C.", location: "Denver, CO", saved: "$623", thumbnail: "👨‍💻" },
            { name: "Emily R.", location: "Seattle, WA", saved: "$1,200", thumbnail: "👩‍🎨" },
            { name: "David K.", location: "Miami, FL", saved: "$445", thumbnail: "👨‍🔧" },
          ].map((t, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-5xl relative">
                {t.thumbnail}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 ml-1" style={{ color: theme.primary }} />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-0.5 mb-2">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                 <p className="font-bold text-slate-900 text-sm" style={sectionStyles.textMain}>{t.name}</p>
                 <p className="text-xs text-slate-500" style={sectionStyles.textSub}>{t.location}</p>
                <Badge className="mt-2 text-[10px]" style={{ background: `${theme.primary}15`, color: theme.primary }}>
                  Saved {t.saved}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <ComparisonTableSection brandColors={brandColors} />

       {/* Calculator Preview */}
       <div className="py-16 px-8 bg-slate-50" style={sectionStyles.alt}>
         <div className="max-w-4xl mx-auto text-center">
           <Badge className="mb-4" style={{ background: `${theme.accent}15`, color: theme.accent }}>
             <Calculator className="w-3 h-3 mr-1" /> Cost Estimator
           </Badge>
           <h2 className="text-3xl font-bold text-slate-900 mb-3" style={sectionStyles.textMain}>See Your TruMove Price Instantly</h2>
           <p className="text-lg text-slate-600 mb-8" style={sectionStyles.textSub}>Our AI calculates your exact cost based on distance, inventory, and timing</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Avg. Savings", value: "$847", icon: DollarSign },
              { label: "Quote Time", value: "47 sec", icon: Timer },
              { label: "Happy Customers", value: "50K+", icon: Heart },
            ].map((stat, i) => (
               <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm" style={{ ...sectionStyles.light, ...sectionStyles.border }}>
                 <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: theme.primary }} />
                 <div className="text-3xl font-black text-slate-900" style={sectionStyles.textMain}>{stat.value}</div>
                 <div className="text-sm text-slate-500" style={sectionStyles.textSub}>{stat.label}</div>
               </div>
            ))}
          </div>
        </div>
      </div>

      {/* Triple Guarantee */}
      <TripleGuaranteeSection brandColors={brandColors} />

      {/* FAQ Section */}
      <FAQSection brandColors={brandColors} />

      {/* Final CTA */}
      <FinalCTASection theme={theme} brandColors={brandColors} />

      {/* Footer */}
      <TruMoveFooter brandColors={brandColors} />

      {/* Chat CTA Banner (non-fixed for preview compatibility) */}
      <div className="py-4 px-8 bg-slate-900 flex items-center justify-center gap-3" style={sectionStyles.dark}>
        <div 
          className="flex items-center gap-2 px-6 py-3 rounded-full text-white shadow-lg cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})` }}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center relative">
            <Truck className="w-4 h-4" />
            <Sparkles className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-amber-300" />
          </div>
          <span className="font-medium">Chat with Trudy</span>
        </div>
      </div>
    </div>
  );

  const renderComparisonPage = () => (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Sticky Header */}
      <header className="relative z-10 bg-white border-b-2 shadow-sm" style={{ borderColor: theme.primary }}>
        <div className="flex items-center justify-between px-6 py-3">
          <img src={logoImg} alt={businessName} className="h-8" />
          <div className="flex items-center gap-4">
             <a href="tel:1-800-TRUMOVE" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors">
              <Phone className="w-4 h-4" />
              <span className="font-semibold">1-800-TRUMOVE</span>
            </a>
            <Button size="sm" className="text-white" style={{ background: theme.primary }}>Get a Quote</Button>
          </div>
        </div>
      </header>

      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-2 px-4 text-center">
        <span className="flex items-center justify-center gap-2 text-sm font-medium">
          <Zap className="w-4 h-4 animate-pulse" />
          See Why 50,000+ Families Chose {businessName} Over the Competition
          <Zap className="w-4 h-4 animate-pulse" />
        </span>
      </div>

      {/* Social Proof Ticker */}
      <SocialProofTicker />

      {/* Dark Hero — Asymmetric split with floating comparison cards */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${theme.secondary} 0%, #0a0e1a 60%, ${theme.primaryDark}80 100%)` }}>
        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(${theme.primary}40 1px, transparent 1px), linear-gradient(90deg, ${theme.primary}40 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        {/* Floating glow */}
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]" style={{ background: theme.primary, top: '-10%', right: '10%' }} />
        
        <div className="relative z-10 px-8 py-20 grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="text-left">
            <Badge className="mb-4 bg-white/10 text-white border border-white/20 backdrop-blur-sm">
              <Award className="w-3 h-3 mr-1" /> #1 Rated Moving Company
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-[0.95] tracking-tight" style={sectionStyles.h1}>
              We Win on<br/><span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${theme.primary}, ${theme.accentLight})` }}>Every Metric</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-md">
              Stop guessing. See the facts. Compare {businessName}'s technology, pricing, and service guarantees against traditional movers.
            </p>
            <div className="flex gap-3">
              <Button className="py-5 px-8 text-lg font-bold gap-2 text-white rounded-xl" style={{ background: theme.primary, boxShadow: `0 8px 32px ${theme.primary}40` }}>
                Get My Free Quote <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="py-5 px-6 text-lg font-bold gap-2 border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl">
                <Phone className="w-5 h-5" /> Call Now
              </Button>
            </div>
          </div>
          {/* Floating stat cards — bento grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Avg. Savings", value: "$847", icon: "💰" },
              { label: "Customer Rating", value: "4.9/5", icon: "⭐" },
              { label: "Moves Completed", value: "50K+", icon: "🚚" },
              { label: "Quote Speed", value: "47sec", icon: "⚡" },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-2xl border border-white/10 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Badge Strip */}
      <TrustBadgeStrip theme="light" brandColors={brandColors} />

      {/* Animated Comparison Table Section */}
       <div className="py-16 px-8 bg-white dark:bg-slate-900" style={sectionStyles.light}>
         <div className="text-center mb-10">
           <Badge className="mb-4" style={{ background: `${theme.primary}20`, color: theme.primary }}>
             <CheckCircle2 className="w-3 h-3 mr-1" /> Side-by-Side Comparison
           </Badge>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3" style={sectionStyles.textMain}>
             The {businessName} Advantage
           </h2>
           <p className="text-lg text-slate-600 dark:text-slate-400" style={sectionStyles.textSub}>
             See exactly how we stack up against traditional moving companies
           </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl">
          <div className="grid grid-cols-4 text-sm font-semibold">
            <div className="p-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Feature</div>
            <div className="p-5 text-center text-white flex flex-col items-center gap-1" style={{ background: theme.primary }}>
              <img src={logoImg} alt={businessName} className="h-6 brightness-0 invert mb-1" />
              <span className="text-xs opacity-80">AI-Powered</span>
            </div>
            <div className="p-5 text-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              Traditional<br/><span className="text-xs opacity-70">Movers</span>
            </div>
            <div className="p-5 text-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              DIY<br/><span className="text-xs opacity-70">Moving</span>
            </div>
          </div>
          {[
            { feature: "AI Inventory Scanning", us: true, a: false, b: false, exclusive: true },
            { feature: "Real-Time GPS Tracking", us: true, a: false, b: false, exclusive: true },
            { feature: "Guaranteed Price Lock", us: true, a: false, b: false, exclusive: true },
            { feature: "Instant Online Quotes", us: true, a: false, b: true },
            { feature: "FMCSA Verified Carriers", us: true, a: true, b: false },
            { feature: "Full Insurance Coverage", us: true, a: true, b: false },
            { feature: "24/7 Live Support", us: true, a: false, b: false },
            { feature: "Flexible Scheduling", us: true, a: true, b: true },
          ].map((row, i) => (
            <div key={i} className={`grid grid-cols-4 border-t border-slate-200 dark:border-slate-700 text-sm ${i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900'}`}>
              <div className="p-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                {row.feature}
                {row.exclusive && (
                  <Badge className="text-[10px] px-1.5 py-0 border-0" style={{ background: `${theme.primary}20`, color: theme.primary }}>
                    Exclusive
                  </Badge>
                )}
              </div>
              <div className="p-4 text-center" style={{ background: `${theme.primary}08` }}>
                {row.us ? (
                  <div className="flex justify-center">
                    <CheckCircle2 className="w-6 h-6 animate-pulse" style={{ color: theme.primary }} />
                  </div>
                ) : <X className="w-5 h-5 text-slate-300 mx-auto" />}
              </div>
              <div className="p-4 text-center">
                {row.a ? <CheckCircle2 className="w-5 h-5 text-slate-400 mx-auto" /> : <span className="text-slate-300">—</span>}
              </div>
              <div className="p-4 text-center">
                {row.b ? <CheckCircle2 className="w-5 h-5 text-slate-400 mx-auto" /> : <span className="text-slate-300">—</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitor Pricing Breakdown */}
       <div className="py-16 px-8 bg-slate-50 dark:bg-slate-800" style={sectionStyles.alt}>
         <div className="text-center mb-10">
           <Badge className="mb-4 bg-amber-500/10 text-amber-600 border border-amber-500/30">
             <DollarSign className="w-3 h-3 mr-1" /> Price Comparison
           </Badge>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3" style={sectionStyles.textMain}>
             Average Savings: $847
           </h2>
           <p className="text-lg text-slate-600 dark:text-slate-400" style={sectionStyles.textSub}>
             Real pricing data from verified customer moves
           </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
            <div className="text-center mb-4">
              <p className="text-sm text-slate-500 mb-1">Traditional Movers</p>
              <p className="text-4xl font-bold text-slate-400">$4,247</p>
              <p className="text-xs text-red-500">+ hidden fees</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400" /> Price changes on moving day</li>
              <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400" /> No real-time tracking</li>
              <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400" /> Limited support hours</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl border-4 shadow-xl relative" style={{ borderColor: theme.primary, background: `linear-gradient(135deg, ${theme.primary}10, white)` }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="text-white shadow-lg" style={{ background: theme.primary }}>
                <Star className="w-3 h-3 mr-1" /> Best Value
              </Badge>
            </div>
            <div className="text-center mb-4 pt-2">
              <img src={logoImg} alt={businessName} className="h-6 mx-auto mb-2" />
              <p className="text-4xl font-bold" style={{ color: theme.primary }}>$3,400</p>
              <p className="text-xs text-green-600 font-medium">Guaranteed price</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" style={{ color: theme.primary }} /> Locked-in pricing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" style={{ color: theme.primary }} /> Live GPS tracking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" style={{ color: theme.primary }} /> 24/7 support</li>
            </ul>
            <Button className="w-full mt-4 py-5 font-bold text-white" style={{ background: theme.primary }}>
              Get This Price <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
            <div className="text-center mb-4">
              <p className="text-sm text-slate-500 mb-1">DIY Rental Truck</p>
              <p className="text-4xl font-bold text-slate-400">$2,100</p>
              <p className="text-xs text-amber-500">+ your time & labor</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2"><X className="w-4 h-4 text-amber-400" /> 20+ hours of work</li>
              <li className="flex items-center gap-2"><X className="w-4 h-4 text-amber-400" /> Risk of damage</li>
              <li className="flex items-center gap-2"><X className="w-4 h-4 text-amber-400" /> Physical strain</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Video Testimonials from Comparison Shoppers */}
      <VideoTestimonialGrid brandColors={brandColors} />

      {/* 3-Step Process */}
      <ThreeStepProcess theme="light" brandColors={brandColors} />

      {/* Triple Guarantee */}
      <TripleGuaranteeSection brandColors={brandColors} />

      {/* FAQ Section */}
       <div className="py-16 px-8 bg-slate-50 dark:bg-slate-800" style={sectionStyles.alt}>
         <div className="text-center mb-12">
           <Badge className="mb-4 bg-amber-500/10 text-amber-600 border border-amber-500/30">Questions?</Badge>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3" style={sectionStyles.textMain}>Frequently Asked Questions</h2>
           <p className="text-lg text-slate-600 dark:text-slate-400" style={sectionStyles.textSub}>Everything you need to know about comparing movers</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {[
            { q: "How is TruMove different from brokers?", a: "Unlike brokers who sell your info to multiple carriers, TruMove connects you directly with verified movers. One quote, one company, zero surprises." },
            { q: "Why are your prices lower?", a: "Our AI technology eliminates costly in-home estimates and optimizes truck routes. We pass these savings directly to you." },
            { q: "What if I find a lower price elsewhere?", a: "We'll match it! Plus, we guarantee our quoted price won't change on moving day." },
          ].map((faq, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5" style={{ ...sectionStyles.light, ...sectionStyles.border }}>
               <p className="font-semibold text-slate-900 dark:text-white mb-2" style={sectionStyles.textMain}>{faq.q}</p>
               <p className="text-slate-600 dark:text-slate-400 text-sm" style={sectionStyles.textSub}>{faq.a}</p>
             </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <FinalCTASection theme={theme} brandColors={brandColors} />

      {/* Footer */}
      <TruMoveFooter brandColors={brandColors} />
    </div>
  );

  const renderCalculatorPage = () => (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Sticky Header */}
      <header className="relative z-10 bg-white border-b-2 shadow-sm" style={{ borderColor: theme.primary }}>
        <div className="flex items-center justify-between px-6 py-3">
          <img src={logoImg} alt={businessName} className="h-8" />
          <div className="flex items-center gap-4">
            <Badge style={{ background: `${theme.accent}20`, color: theme.accent }}>
              <Calculator className="w-3 h-3 mr-1" /> Free Calculator
            </Badge>
             <a href="tel:1-800-TRUMOVE" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors">
              <Phone className="w-4 h-4" />
              <span className="font-semibold">1-800-TRUMOVE</span>
            </a>
          </div>
        </div>
      </header>

      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 px-4 text-center">
        <span className="flex items-center justify-center gap-2 text-sm font-medium">
          <Sparkles className="w-4 h-4 animate-pulse" />
          Calculate & Save Up to $847 on Your Move
          <Sparkles className="w-4 h-4 animate-pulse" />
        </span>
      </div>

      {/* Hero — Bento grid calculator layout */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, #0a0e1a 0%, ${theme.secondary} 50%, ${theme.primaryDark}60 100%)` }}>
        {/* Mesh gradient blobs */}
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]" style={{ background: theme.accent, top: '-15%', left: '50%' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-[80px]" style={{ background: theme.primary, bottom: '-10%', left: '-5%' }} />

        <div className="relative z-10 px-8 py-16 max-w-6xl mx-auto">
          {/* Top bento stats row */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: "Avg. Savings", value: "$847", color: theme.primary },
              { label: "Quote Time", value: "47 sec", color: theme.accent },
              { label: "Happy Customers", value: "50K+", color: theme.accentLight },
              { label: "Accuracy Rate", value: "95%+", color: theme.primary },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl border border-white/10 backdrop-blur-sm text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <Badge className="mb-4 bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                <Calculator className="w-3 h-3 mr-1" /> AI-Powered Pricing
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-[0.95] tracking-tight" style={sectionStyles.h1}>
                Know Your<br/><span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${theme.primary}, ${theme.accentLight})` }}>Moving Cost</span><br/>in Seconds
              </h1>
              <p className="text-lg text-white/70 mb-6 max-w-md">
                Our AI analyzes thousands of moves to give you the most accurate estimate — no email or phone call required.
              </p>
              <div className="flex items-center gap-6 text-white/60 text-sm">
                 <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" style={{ color: theme.primary }} /> Instant results</span>
                 <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" style={{ color: theme.primary }} /> No spam</span>
                 <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" style={{ color: theme.primary }} /> 100% free</span>
              </div>
            </div>

            {/* Glassmorphism Calculator Form */}
            <div className="rounded-3xl p-8 border" style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: 'rgba(255,255,255,0.1)',
              boxShadow: `0 32px 64px rgba(0,0,0,0.4), 0 0 60px ${theme.primary}15`
            }}>
              <h3 className="text-xl font-bold text-white mb-6 text-center">Moving Cost Calculator</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/70 mb-1 block">Moving From</label>
                  <Input placeholder="Enter city or ZIP code" className="bg-white/90 border-0 py-5 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70 mb-1 block">Moving To</label>
                  <Input placeholder="Enter city or ZIP code" className="bg-white/90 border-0 py-5 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70 mb-1 block">Home Size</label>
                  <select className="w-full p-4 rounded-xl border-0 bg-white/90 text-slate-900">
                    <option>Studio / 1 Bedroom</option>
                    <option>2 Bedroom</option>
                    <option>3 Bedroom</option>
                    <option>4+ Bedroom</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70 mb-1 block">Moving Date</label>
                  <Input type="date" className="bg-white/90 border-0 py-5 rounded-xl text-slate-900" />
                </div>
                <Button className="w-full py-6 text-lg font-bold gap-2 text-white rounded-xl" style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`, boxShadow: `0 8px 32px ${theme.primary}40` }}>
                  <Calculator className="w-5 h-5" /> Calculate My Cost
                </Button>
                <p className="text-xs text-white/40 text-center">🔒 Your information is secure and never shared</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badge Strip */}
      <TrustBadgeStrip theme="light" brandColors={brandColors} />

      {/* Similar Moves Social Proof */}
       <div className="py-16 px-8 bg-slate-50 dark:bg-slate-800" style={sectionStyles.alt}>
         <div className="text-center mb-10">
           <Badge className="mb-4 bg-green-500/10 text-green-600 border border-green-500/30">
             <Users className="w-3 h-3 mr-1" /> Recent Moves
           </Badge>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3" style={sectionStyles.textMain}>
             Similar Moves Near You
           </h2>
           <p className="text-lg text-slate-600 dark:text-slate-400" style={sectionStyles.textSub}>
             See what others paid for moves like yours
           </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { from: "Los Angeles, CA", to: "Austin, TX", size: "3 Bedroom", cost: "$3,247", saved: "$892" },
            { from: "New York, NY", to: "Miami, FL", size: "2 Bedroom", cost: "$2,890", saved: "$654" },
            { from: "Chicago, IL", to: "Denver, CO", size: "4 Bedroom", cost: "$4,120", saved: "$1,104" },
          ].map((move, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm" style={{ ...sectionStyles.light, ...sectionStyles.border }}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4" style={{ color: theme.primary }} />
                <span className="text-sm text-slate-600">{move.from}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="text-sm text-slate-600">{move.to}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{move.size}</span>
                <Badge className="bg-blue-100 text-blue-700 text-xs">Saved {move.saved}</Badge>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{move.cost}</p>
              <div className="flex items-center gap-1 mt-2">
                {[1,2,3,4,5].map(j => <Star key={j} className="w-3 h-3" style={{ fill: theme.primary, color: theme.primary }} />)}
                <span className="text-xs text-slate-500 ml-1">Verified move</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What Happens Next */}
      <ThreeStepProcess theme="light" brandColors={brandColors} />

      {/* Savings Breakdown Visualization */}
       <div className="py-16 px-8 bg-white dark:bg-slate-900" style={sectionStyles.light}>
         <div className="text-center mb-10">
           <Badge className="mb-4 bg-purple-500/10 text-purple-600 border border-purple-500/30">
             <DollarSign className="w-3 h-3 mr-1" /> Cost Breakdown
           </Badge>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3" style={sectionStyles.textMain}>
             Where Your Money Goes
           </h2>
           <p className="text-lg text-slate-600 dark:text-slate-400" style={sectionStyles.textSub}>
             Transparent pricing with no hidden fees
           </p>
         </div>

        <div className="max-w-2xl mx-auto">
          <div className="space-y-4">
            {[
              { label: "Transportation", percentage: 45, color: theme.primary },
              { label: "Labor", percentage: 30, color: theme.accent },
              { label: "Insurance & Fees", percentage: 15, color: theme.primaryDark },
              { label: "Packing Materials", percentage: 10, color: theme.accentLight },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                  <span className="text-slate-500">{item.percentage}%</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${item.percentage}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Triple Guarantee */}
      <TripleGuaranteeSection brandColors={brandColors} />

      {/* FAQ */}
       <div className="py-16 px-8 bg-slate-50 dark:bg-slate-800" style={sectionStyles.alt}>
         <div className="text-center mb-12">
           <Badge className="mb-4 bg-amber-500/10 text-amber-600 border border-amber-500/30">Questions?</Badge>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3" style={sectionStyles.textMain}>Calculator FAQ</h2>
         </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {[
            { q: "How accurate is this calculator?", a: "Our AI has analyzed over 100,000 moves to provide estimates within 5-10% of final costs. Get an in-home estimate for exact pricing." },
            { q: "Is my information secure?", a: "Absolutely. We use 256-bit encryption and never share your data with third parties." },
            { q: "Will I get spam calls?", a: "Never. We only contact you if you request a detailed quote." },
          ].map((faq, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5" style={{ ...sectionStyles.light, ...sectionStyles.border }}>
               <p className="font-semibold text-slate-900 dark:text-white mb-2" style={sectionStyles.textMain}>{faq.q}</p>
               <p className="text-slate-600 dark:text-slate-400 text-sm" style={sectionStyles.textSub}>{faq.a}</p>
             </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <FinalCTASection theme={theme} brandColors={brandColors} />

      {/* Footer */}
      <TruMoveFooter brandColors={brandColors} />
    </div>
  );

  const renderTestimonialPage = () => (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Sticky Header */}
      <header className="relative z-10 bg-white border-b-2 shadow-sm" style={{ borderColor: theme.primary }}>
        <div className="flex items-center justify-between px-6 py-3">
          <img src={logoImg} alt={businessName} className="h-8" />
          <div className="flex items-center gap-4">
             <a href="tel:1-800-TRUMOVE" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors">
              <Phone className="w-4 h-4" />
              <span className="font-semibold">1-800-TRUMOVE</span>
            </a>
            <Button size="sm" className="text-white" style={{ background: theme.primary }}>Get a Quote</Button>
          </div>
        </div>
      </header>

      {/* Hero — Warm gradient with floating glassmorphism rating card */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(145deg, ${theme.secondary} 0%, #0a0e1a 50%, ${theme.primaryDark}60 100%)` }}>
        {/* Warm mesh gradient */}
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: '#FBBF24', top: '-20%', left: '30%' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]" style={{ background: theme.primary, bottom: '-10%', right: '20%' }} />
        
        <div className="relative z-10 px-8 py-20 grid md:grid-cols-5 gap-12 items-center max-w-6xl mx-auto">
          {/* Left content — 3 cols */}
          <div className="md:col-span-3 text-left">
            <Badge className="mb-4 bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1 fill-amber-300" /> Verified by 50,000+ Customers
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-[0.95] tracking-tight" style={sectionStyles.h1}>
              Real Families.<br/>
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, #FBBF24, ${theme.primary})` }}>
                Real Stories.
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-lg mb-8">
              Over 50,000 families have trusted us with their most precious belongings. Here's what they have to say.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Badge className="py-2 px-4 bg-white/5 text-white border border-white/10 backdrop-blur-sm">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-2" /> 4.9 on Google
              </Badge>
              <Badge className="py-2 px-4 bg-white/5 text-white border border-white/10 backdrop-blur-sm">
                <Star className="w-4 h-4 mr-2" style={{ fill: "#FF1A1A", color: "#FF1A1A" }} /> 4.8 on Yelp
              </Badge>
              <Badge className="py-2 px-4 bg-white/5 text-white border border-white/10 backdrop-blur-sm">
                <Award className="w-4 h-4 mr-2" /> BBB A+ Rated
              </Badge>
            </div>
          </div>
          {/* Right — floating glassmorphism rating card — 2 cols */}
          <div className="md:col-span-2">
            <div className="rounded-3xl p-8 border text-center" style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: 'rgba(255,255,255,0.1)',
              boxShadow: `0 32px 64px rgba(0,0,0,0.4), 0 0 80px rgba(251,191,36,0.1)`
            }}>
              <div className="flex justify-center mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-10 h-10" style={{ fill: "#FBBF24", color: "#FBBF24" }} />)}
              </div>
              <div className="mb-2">
                <span className="text-7xl font-black text-white">4.9</span>
                <span className="text-3xl text-white/50">/5</span>
              </div>
              <p className="text-white/50 text-sm mb-6">from 12,847 verified reviews</p>
              <div className="space-y-2">
                {[
                  { label: "Service", pct: 98 },
                  { label: "Punctuality", pct: 96 },
                  { label: "Value", pct: 95 },
                  { label: "Communication", pct: 99 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>{item.label}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: `linear-gradient(90deg, #FBBF24, ${theme.primary})` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Metrics Strip */}
      <div className="py-6 px-8 bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700" style={{ ...sectionStyles.alt, ...sectionStyles.border }}>
        <div className="flex justify-center items-center gap-10">
          {[
            { value: "50,000+", label: "Happy Customers" },
            { value: "99%", label: "Would Recommend" },
            { value: "$847", label: "Avg. Savings" },
            { value: "4.9/5", label: "Average Rating" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold" style={{ color: theme.primary }}>{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Video Testimonial Carousel */}
       <div className="py-16 px-8" style={sectionStyles.light}>
         <div className="text-center mb-10">
           <Badge className="mb-4 bg-red-500/10 text-red-600 border border-red-500/30">
             <Play className="w-3 h-3 mr-1" /> Video Stories
           </Badge>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3" style={sectionStyles.textMain}>
             Watch Their Stories
           </h2>
           <p className="text-lg text-slate-600 dark:text-slate-400" style={sectionStyles.textSub}>
             Real customers share their TruMove experience
           </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { name: "The Johnson Family", location: "LA → Austin", thumbnail: "👨‍👩‍👧‍👦", duration: "2:34" },
            { name: "Sarah Mitchell", location: "NYC → Miami", thumbnail: "👩‍💼", duration: "1:58" },
            { name: "David & Lisa Chen", location: "Chicago → Denver", thumbnail: "👫", duration: "3:12" },
          ].map((video, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow border border-slate-200 dark:border-slate-700">
              <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-6xl relative">
                {video.thumbnail}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: theme.primary }}>
                    <Play className="w-7 h-7 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map(j => <Star key={j} className="w-3 h-3" style={{ fill: "#FBBF24", color: "#FBBF24" }} />)}
                </div>
                <p className="font-bold text-slate-900 dark:text-white">{video.name}</p>
                <p className="text-sm text-slate-500">{video.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Written Testimonials Masonry Grid */}
       <div className="py-16 px-8 bg-slate-50 dark:bg-slate-800" style={sectionStyles.alt}>
         <div className="text-center mb-10">
           <Badge className="mb-4 bg-green-500/10 text-green-600 border border-green-500/30">
             <Quote className="w-3 h-3 mr-1" /> Written Reviews
           </Badge>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3" style={sectionStyles.textMain}>
             What Our Customers Say
           </h2>
         </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { name: "Sarah M.", location: "Austin, TX", quote: "I was quoted $4,200 by another company. TruMove got me the same service for $3,350. The AI inventory scanner was scary accurate!", stars: 5 },
            { name: "Michael C.", location: "Denver, CO", quote: "The real-time tracking was a game changer. I knew exactly where my stuff was the entire time. No anxiety!", stars: 5 },
            { name: "Emily R.", location: "Seattle, WA", quote: "Best moving experience ever. Period. The team was professional, quick, and nothing was damaged.", stars: 5 },
            { name: "David K.", location: "Miami, FL", quote: "24/7 support made all the difference. Had a question at 11pm and got an answer in minutes.", stars: 5 },
            { name: "Jennifer L.", location: "Phoenix, AZ", quote: "Saved us so much stress! The quote we got was exactly what we paid. No surprise fees.", stars: 5 },
            { name: "Robert T.", location: "Portland, OR", quote: "Third time using TruMove and they never disappoint. Highly recommend to anyone planning a move.", stars: 5 },
          ].map((t, i) => (
             <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm" style={{ ...sectionStyles.light, ...sectionStyles.border }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{t.name}</div>
                  <div className="text-sm text-slate-500">{t.location}</div>
                </div>
                <div className="ml-auto flex">
                  {Array(t.stars).fill(0).map((_, j) => <Star key={j} className="w-4 h-4" style={{ fill: "#FBBF24", color: "#FBBF24" }} />)}
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">"{t.quote}"</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-3 h-3" style={{ color: theme.primary }} />
                Verified Customer
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before & After Story Highlights */}
       <div className="py-16 px-8 bg-white dark:bg-slate-900" style={sectionStyles.light}>
         <div className="text-center mb-10">
           <Badge className="mb-4" style={{ background: `${theme.primary}20`, color: theme.primary }}>
             <ThumbsUp className="w-3 h-3 mr-1" /> Success Stories
           </Badge>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3" style={sectionStyles.textMain}>
             Moving Nightmares We Solved
           </h2>
         </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            { 
              before: "Quoted $5,500 by traditional movers with hidden fees", 
              after: "Paid $3,890 with TruMove - all inclusive",
              customer: "The Martinez Family",
              saved: "$1,610"
            },
            { 
              before: "Previous mover 'lost' 3 boxes of irreplaceable items", 
              after: "Every single item accounted for with GPS tracking",
              customer: "Lisa & Tom Henderson",
              saved: "Peace of mind"
            },
          ].map((story, i) => (
            <div key={i} className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30">
                  <p className="text-xs font-semibold text-red-600 mb-1">BEFORE</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{story.before}</p>
                </div>
                 <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30">
                   <p className="text-xs font-semibold text-green-600 mb-1">AFTER</p>
                   <p className="text-sm text-green-700 dark:text-green-300">{story.after}</p>
                 </div>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-slate-600 dark:text-slate-400">{story.customer}</span>
                 <Badge className="bg-green-100 text-green-700">Saved: {story.saved}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Your Story CTA */}
      <div className="py-16 px-8" style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)` }}>
        <div className="text-center max-w-2xl mx-auto">
          <Heart className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Have a TruMove Story?
          </h2>
          <p className="text-lg text-white/80 mb-6">
            Share your experience and get $100 off your next move!
          </p>
          <Button className="py-5 px-8 text-lg font-bold gap-2 bg-white hover:bg-slate-100" style={{ color: theme.primary }}>
            Share Your Story <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Triple Guarantee */}
      <TripleGuaranteeSection brandColors={brandColors} />

      {/* Final CTA */}
      <FinalCTASection theme={theme} brandColors={brandColors} />

      {/* Footer */}
      <TruMoveFooter brandColors={brandColors} />
    </div>
  );

  const renderLocalSeoPage = () => {
    const location = targetLocation || "California";
    const cities = location === "California" 
      ? ["Los Angeles", "San Diego", "San Francisco", "Sacramento", "San Jose", "Oakland", "Fresno", "Long Beach"]
      : location === "Texas"
      ? ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso", "Arlington", "Plano"]
      : ["Miami", "Tampa", "Orlando", "Jacksonville", "Fort Lauderdale", "St. Petersburg", "Hialeah", "Tallahassee"];

    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        {/* Sticky Header with Local Phone */}
        <header className="relative z-10 bg-white border-b-2 shadow-sm" style={{ borderColor: theme.primary }}>
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt={businessName} className="h-8" />
              <Badge className="text-xs" style={{ background: `${theme.primary}20`, color: theme.primary }}>
                <MapPin className="w-3 h-3 mr-1" /> {location}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <a href="tel:1-800-TRUMOVE" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors">
                <Phone className="w-4 h-4" />
                <span className="font-semibold">1-800-TRUMOVE</span>
              </a>
              <Button size="sm" className="text-white" style={{ background: theme.primary }}>Free Local Quote</Button>
            </div>
          </div>
        </header>

        {/* Urgency Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2 px-4 text-center">
          <span className="flex items-center justify-center gap-2 text-sm font-medium">
            <Award className="w-4 h-4 animate-pulse" />
            #1 Rated Moving Company in {location} for 10+ Years
            <Award className="w-4 h-4 animate-pulse" />
          </span>
        </div>

        {/* Location Hero — Floating city badges with mesh gradient */}
        <div className="relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${theme.secondary} 0%, #0a0e1a 50%, ${theme.primaryDark}60 100%)` }}>
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(${theme.primary}60 1px, transparent 1px), linear-gradient(90deg, ${theme.primary}60 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }} />
          {/* Glow orbs */}
          <div className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: theme.primary, top: '-20%', right: '0%' }} />
          <div className="absolute w-[300px] h-[300px] rounded-full opacity-15 blur-[80px]" style={{ background: '#06B6D4', bottom: '-10%', left: '10%' }} />

          {/* Floating city name badges — decorative */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {cities.slice(0, 6).map((city, i) => (
              <div key={city} className="absolute px-3 py-1 rounded-full border border-white/10 text-white/15 text-xs backdrop-blur-sm" style={{
                top: `${15 + (i * 12) % 60}%`,
                left: i % 2 === 0 ? `${5 + i * 3}%` : undefined,
                right: i % 2 !== 0 ? `${5 + i * 3}%` : undefined,
                transform: `rotate(${(i - 3) * 4}deg)`,
                background: 'rgba(255,255,255,0.03)',
              }}>
                <MapPin className="w-2.5 h-2.5 inline mr-1" />{city}
              </div>
            ))}
          </div>
          
          <div className="relative z-10 px-8 py-20 grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="text-left">
              <Badge className="mb-4 bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                <MapPin className="w-3 h-3 mr-1" /> Serving All of {location}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-[0.95] tracking-tight" style={sectionStyles.h1}>
                {location}'s Most<br/><span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${theme.primary}, #06B6D4)` }}>Trusted Movers</span>
              </h1>
              <p className="text-lg text-white/70 mb-6 max-w-md">
                Local experts who know every neighborhood, every route, and every way to save you money on your move.
              </p>
              <div className="flex items-center gap-6 text-white/60 text-sm flex-wrap">
                 <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" style={{ color: theme.primary }} /> Licensed & Insured</span>
                 <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" style={{ color: theme.primary }} /> Local Crews</span>
                 <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" style={{ color: theme.primary }} /> Same-Day Quotes</span>
              </div>
            </div>

            {/* Glassmorphism Local Quote Form */}
            <div className="rounded-3xl p-8 border" style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: 'rgba(255,255,255,0.1)',
              boxShadow: `0 32px 64px rgba(0,0,0,0.4), 0 0 60px ${theme.primary}15`
            }}>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white">Get a Free Local Quote</h3>
                <p className="text-sm text-white/50">Serving all of {location} • Response in &lt;2 hours</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/70 mb-1 block">Your ZIP Code</label>
                  <Input placeholder="Enter your ZIP" className="bg-white/90 border-0 py-5 rounded-xl text-center text-lg text-slate-900" />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70 mb-1 block">Phone Number</label>
                  <Input placeholder="(555) 123-4567" type="tel" className="bg-white/90 border-0 py-5 rounded-xl text-center text-lg text-slate-900" />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70 mb-1 block">Moving Date</label>
                  <Input type="date" className="bg-white/90 border-0 py-5 rounded-xl text-slate-900" />
                </div>
                <Button className="w-full py-6 text-lg font-bold gap-2 text-white rounded-xl" style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`, boxShadow: `0 8px 32px ${theme.primary}40` }}>
                  Get My Free Quote <ArrowRight className="w-5 h-5" />
                </Button>
                <p className="text-xs text-white/40 text-center">🔒 No spam • No obligation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Local Trust Signals */}
         <div className="py-8 px-8 bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700" style={{ ...sectionStyles.alt, ...sectionStyles.border }}>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
             {[
               { icon: Building, label: "Local Office", value: location === "California" ? "Downtown LA" : location === "Texas" ? "Houston Office" : "Miami HQ" },
               { icon: Users, label: "Local Moves", value: "12,847" },
               { icon: Clock, label: "Avg Response", value: "< 2 hours" },
               { icon: Star, label: "Local Rating", value: "4.9/5" },
             ].map((item, i) => (
               <div key={i} className="text-center">
                 <item.icon className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
                 <div className="text-2xl font-bold text-slate-900 dark:text-white" style={sectionStyles.textMain}>{item.value}</div>
                 <div className="text-xs text-slate-500" style={sectionStyles.textSub}>{item.label}</div>
               </div>
             ))}
          </div>
        </div>

        {/* Service Area Map */}
         <div className="py-16 px-8 bg-white dark:bg-slate-900" style={sectionStyles.light}>
           <div className="text-center mb-10">
             <Badge className="mb-4" style={{ background: `${theme.primary}20`, color: theme.primary }}>
               <MapPin className="w-3 h-3 mr-1" /> Service Areas
             </Badge>
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3" style={sectionStyles.textMain}>
               We Serve All of {location}
             </h2>
             <p className="text-lg text-slate-600 dark:text-slate-400" style={sectionStyles.textSub}>
               Local experts in every major city and neighborhood
             </p>
           </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cities.map((city, i) => (
                 <div 
                   key={city} 
                   className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center hover:border-blue-400 transition-colors cursor-pointer"
                   style={{ ...sectionStyles.alt, ...sectionStyles.border }}
                 >
                   <MapPin className="w-5 h-5 mx-auto mb-2" style={{ color: theme.primary }} />
                   <p className="font-medium text-slate-900 dark:text-white" style={sectionStyles.textMain}>{city}</p>
                  <p className="text-xs text-slate-500">+{Math.floor(Math.random() * 500 + 500)} moves</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-slate-500 mt-6">
              + 200 more cities and neighborhoods across {location}
            </p>
          </div>
        </div>

        {/* Local Testimonials */}
         <div className="py-16 px-8 bg-slate-50 dark:bg-slate-800" style={sectionStyles.alt}>
           <div className="text-center mb-10">
             <Badge className="mb-4 bg-amber-500/10 text-amber-600 border border-amber-500/30">
               <Star className="w-3 h-3 mr-1" /> Local Reviews
             </Badge>
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3" style={sectionStyles.textMain}>
               What {location} Families Say
             </h2>
           </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Maria G.", city: cities[0], quote: `Best movers in ${cities[0]}! On time, professional, and affordable.` },
              { name: "James R.", city: cities[1], quote: `Moved our office in ${cities[1]} with zero downtime. Incredible service!` },
              { name: "Lisa T.", city: cities[2], quote: `Third time using them for moves in ${location}. Always exceed expectations.` },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm" style={{ ...sectionStyles.light, ...sectionStyles.border }}>
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(j => <Star key={j} className="w-4 h-4" style={{ fill: "#FBBF24", color: "#FBBF24" }} />)}
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: theme.primary }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.city}, {location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Local Partnership Badges */}
        <div className="py-10 px-8 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700" style={{ ...sectionStyles.light, ...sectionStyles.border }}>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <Badge className="py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {location} Chamber of Commerce
            </Badge>
            <Badge className="py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              BBB A+ Accredited
            </Badge>
            <Badge className="py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              FMCSA Licensed
            </Badge>
            <Badge className="py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {location} Moving Association
            </Badge>
          </div>
        </div>

        {/* Local FAQ */}
         <div className="py-16 px-8 bg-slate-50 dark:bg-slate-800" style={sectionStyles.alt}>
           <div className="text-center mb-12">
             <Badge className="mb-4 bg-amber-500/10 text-amber-600 border border-amber-500/30">Questions?</Badge>
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3" style={sectionStyles.textMain}>{location} Moving FAQ</h2>
           </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {[
              { q: `How much does a local move in ${location} cost?`, a: `Local moves in ${location} typically range from $500-$2,500 depending on home size and distance. Get an exact quote in minutes!` },
              { q: `Do you service all of ${location}?`, a: `Yes! We have local crews throughout ${location}, including ${cities.slice(0, 4).join(", ")}, and many more cities.` },
              { q: `How far in advance should I book?`, a: `We recommend 2-4 weeks for local moves, though we can often accommodate same-week requests.` },
            ].map((faq, i) => (
               <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5" style={{ ...sectionStyles.light, ...sectionStyles.border }}>
                 <p className="font-semibold text-slate-900 dark:text-white mb-2" style={sectionStyles.textMain}>{faq.q}</p>
                 <p className="text-slate-600 dark:text-slate-400 text-sm" style={sectionStyles.textSub}>{faq.a}</p>
               </div>
            ))}
          </div>
        </div>

        {/* Triple Guarantee */}
        <TripleGuaranteeSection brandColors={brandColors} />

        {/* Final CTA */}
        <FinalCTASection theme={theme} brandColors={brandColors} />

        {/* Footer */}
        <TruMoveFooter brandColors={brandColors} />
      </div>
    );
  };

  const renderLongFormPage = () => (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Minimal Sticky Header */}
      <header className="relative z-10 bg-white/95 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto">
          <img src={logoImg} alt={businessName} className="h-7" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">15 min read</span>
            <Button size="sm" className="text-white" style={{ background: theme.primary }}>Get a Quote</Button>
          </div>
        </div>
        {/* Reading Progress Bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <div className="h-full w-1/3 transition-all duration-300" style={{ background: theme.primary }} />
        </div>
      </header>

      {/* Editorial Hero — Magazine style with grain texture */}
      <div className="relative overflow-hidden">
        {/* Subtle grain texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />
        {/* Decorative accent line */}
        <div className="absolute top-0 left-0 w-1 h-full" style={{ background: `linear-gradient(180deg, ${theme.primary}, transparent)` }} />
        
        <div className="px-8 py-20 max-w-4xl mx-auto relative z-10">
          <div className="mb-12">
            {/* Asymmetric editorial layout */}
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})` }}>
                T
              </div>
              <div>
                <Badge className="mb-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  The Complete Guide • Updated Feb 2025 • 15 min read
                </Badge>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-[1.05] tracking-tight" style={sectionStyles.h1}>
                  Everything You Need to Know Before Hiring a Moving Company in 2025
                </h1>
              </div>
            </div>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
              A comprehensive guide to saving money, avoiding scams, and finding the perfect mover for your needs.
            </p>
            
            {/* Author strip — editorial style */}
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700" style={{ background: `${theme.primary}05` }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ background: theme.primary }}>
                T
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Written by the TruMove Research Team</p>
                <p className="text-xs text-slate-500">Based on 50,000+ customer moves and industry data</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <CheckCircle2 className="w-3 h-3" style={{ color: theme.primary }} />
                Verified experts
              </div>
            </div>
          </div>

          {/* Quick Stats — bento grid */}
          <div className="grid grid-cols-3 gap-3 mb-12">
            {[
              { value: "$847", label: "Avg. Savings", icon: "💰" },
              { value: "50K+", label: "Moves Analyzed", icon: "📊" },
              { value: "99%", label: "Accuracy Rate", icon: "🎯" },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center" style={{ background: `${theme.primary}05` }}>
                <div className="text-xl mb-1">{stat.icon}</div>
                <p className="text-2xl font-black" style={{ color: theme.primary }}>{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable TOC */}
       <div className="px-8 py-8 bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700" style={{ ...sectionStyles.alt, ...sectionStyles.border }}>
         <div className="max-w-3xl mx-auto">
           <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2" style={sectionStyles.textMain}>
            <FileText className="w-5 h-5" style={{ color: theme.primary }} />
            What You'll Learn
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { num: 1, title: "Understanding Moving Costs", time: "3 min" },
              { num: 2, title: "Red Flags to Watch For", time: "2 min" },
              { num: 3, title: "How to Compare Quotes", time: "3 min" },
              { num: 4, title: "The AI Advantage", time: "2 min" },
              { num: 5, title: "Packing Tips & Tricks", time: "3 min" },
              { num: 6, title: "Your Moving Day Checklist", time: "2 min" },
            ].map((item) => (
              <div key={item.num} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors cursor-pointer" style={{ ...sectionStyles.light, ...sectionStyles.border }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: theme.primary }}>
                  {item.num}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white text-sm" style={sectionStyles.textMain}>{item.title}</p>
                </div>
                <span className="text-xs text-slate-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-8 py-16 max-w-3xl mx-auto space-y-16" style={sectionStyles.light}>
        {/* Section 1 */}
        <section>
          <Badge className="mb-4" style={{ background: `${theme.primary}20`, color: theme.primary }}>Section 1</Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6" style={sectionStyles.textMain}>Understanding Moving Costs</h2>
           <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed" style={sectionStyles.textSub}>
            The average cost of a long-distance move ranges from <strong>$2,000 to $5,000</strong>, depending on distance, 
            weight, and time of year. Understanding these factors is crucial for budgeting effectively.
          </p>
          
          {/* Pull Quote */}
          <div className="my-8 p-6 border-l-4 bg-slate-50 dark:bg-slate-800" style={{ borderColor: theme.primary }}>
            <p className="text-xl italic text-slate-700 dark:text-slate-300">
              "The #1 mistake people make is getting quotes too late. Booking 4-6 weeks out can save you 15-20%."
            </p>
            <p className="text-sm text-slate-500 mt-2">— TruMove Moving Experts</p>
          </div>

           <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed" style={sectionStyles.textSub}>
            Key factors that affect your moving cost include:
          </p>
          
          <ul className="space-y-3 mb-6">
            {[
              "Distance: Long-distance moves are priced per mile",
              "Weight/Volume: More stuff = higher costs",
              "Time of Year: Summer and month-ends are peak seasons",
              "Special Items: Pianos, antiques, and fragile items cost extra",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: theme.primary }} />
                {item}
              </li>
            ))}
          </ul>

          {/* Callout Box */}
           <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
             <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <span><strong>💡 Pro Tip:</strong> Use an AI-powered inventory scanner to get the most accurate quote. TruMove's scanner is accurate within 5% of final costs.</span>
            </p>
          </div>
        </section>

        {/* Inline CTA */}
        <div className="p-6 rounded-2xl text-center" style={{ background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.accent}15 100%)` }}>
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Want to know your exact cost?</p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Get an AI-powered quote in 60 seconds</p>
          <Button className="py-4 px-6 font-bold gap-2 text-white" style={{ background: theme.primary }}>
            Get My Free Quote <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Section 2 */}
        <section>
          <Badge className="mb-4 bg-red-100 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-800">Section 2</Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6" style={sectionStyles.textMain}>Red Flags to Watch For</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed" style={sectionStyles.textSub}>
            Moving scams cost Americans over $100 million annually. Here's how to protect yourself:
          </p>
          
          <div className="space-y-4">
            {[
              { flag: "Large deposits required upfront", why: "Legitimate movers charge on delivery, not before" },
              { flag: "No physical address or office", why: "Fly-by-night operations disappear with your stuff" },
              { flag: "Quotes given over the phone without inspection", why: "Accurate quotes require seeing your inventory" },
              { flag: "No FMCSA registration number", why: "Federal law requires all interstate movers to be registered" },
              { flag: "Pressure to sign immediately", why: "Legitimate companies give you time to compare" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900">
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-300">{item.flag}</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{item.why}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Video Break Section */}
        <div className="p-8 rounded-2xl bg-slate-900 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: theme.primary }}>
            <Play className="w-10 h-10 text-white ml-1" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Watch: How to Spot a Moving Scam</h3>
          <p className="text-slate-400 mb-4">3-minute video with our expert tips</p>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <Video className="w-4 h-4 mr-2" /> Watch Now
          </Button>
        </div>

        {/* TL;DR Summary Section */}
         <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700" style={{ ...sectionStyles.alt, ...sectionStyles.border }}>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2" style={sectionStyles.textMain}>
             ⚡ TL;DR Summary
          </h3>
          <ul className="space-y-2">
            {[
              "Get quotes 4-6 weeks early to save 15-20%",
              "Always verify FMCSA registration",
              "Never pay large deposits upfront",
              "Use AI tools for accurate inventory",
              "Compare at least 3 quotes",
              "Read reviews on multiple platforms",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4" style={{ color: theme.primary }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Triple Guarantee */}
      <TripleGuaranteeSection brandColors={brandColors} />

      {/* Final CTA */}
      <FinalCTASection theme={theme} brandColors={brandColors} />

      {/* Sticky Bottom CTA Bar (Mobile-First) */}
      <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg md:hidden" style={{ ...sectionStyles.light, ...sectionStyles.border }}>
        <Button className="w-full py-4 font-bold gap-2 text-white" style={{ background: theme.primary }}>
          Get My Free Quote <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Footer */}
      <TruMoveFooter brandColors={brandColors} />
    </div>
  );

  const renderSelectedTemplate = () => {
    const templateContent = (() => {
      switch (selectedTemplate) {
        case "quote-funnel": return renderQuoteFunnelPage();
        case "comparison": return renderComparisonPage();
        case "calculator": return renderCalculatorPage();
        case "testimonial": return renderTestimonialPage();
        case "local-seo": return renderLocalSeoPage();
        case "long-form": return renderLongFormPage();
        default: return renderQuoteFunnelPage();
      }
    })();

    return templateContent;
  };

   if (showLandingPage) {
     return (
       <>
         <div className="space-y-4">
         {/* Control Bar */}
           <div className="flex flex-col gap-3 p-3 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="gap-1" style={{ background: "#3B82F620", color: "#3B82F6" }}>
                <CheckCircle2 className="w-3 h-3" />
                AI Generated
              </Badge>

              {/* Template Switcher */}
              <div className="flex items-center gap-1 bg-muted rounded-lg border border-border p-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToPrevTemplate}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-[130px] h-7 text-xs border-0 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANDING_PAGE_TEMPLATES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToNextTemplate}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Color Theme Selector */}
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger className="w-[160px] h-9">
                  <Palette className="w-3.5 h-3.5 mr-2" />
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_THEMES.map((colorTheme) => (
                    <SelectItem key={colorTheme.id} value={colorTheme.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ background: `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.accent})` }}
                        />
                        {colorTheme.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant={showBrandExtractor ? "default" : "outline"} 
                size="sm" 
                onClick={() => setShowBrandExtractor(!showBrandExtractor)}
                className="gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {showBrandExtractor ? 'Close Styler' : 'Style Extractor'}
              </Button>

              <Button variant="outline" size="sm" onClick={() => setShowLandingPage(false)}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={exportAsHtml}>
                <Download className="w-3 h-3 mr-1" />
                Export HTML
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setShowPostGenEditor(!showPostGenEditor)}
                className="gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                {showPostGenEditor ? 'Close Editor' : 'Edit Page'}
              </Button>
               <Button 
                 variant="default" 
                 size="sm" 
                 onClick={() => setIsPopoutOpen(true)}
                 className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 shadow-lg"
               >
                 <Maximize2 className="w-4 h-4" />
                 View Full Screen
               </Button>
            </div>
          </div>

          {/* Brand Extractor Panel */}
          {showBrandExtractor && (
            <div className="rounded-xl border border-border overflow-hidden bg-card p-4">
              <BrandExtractor 
                onApplyTheme={handleApplyBranding}
                currentThemeId={customBranding ? "custom" : selectedTheme}
              />
            </div>
          )}
 
          {/* Editor Panel + Preview */}
          {showPostGenEditor && (
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <PostGenerationEditor
                sections={sections.map(s => ({
                  id: s.id,
                  label: s.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                  type: s.type,
                  content: s.content,
                  maxLength: s.type === 'headline' ? 60 : s.type === 'body' ? 300 : 100
                }))}
                onSave={(updatedSections) => {
                  setSections(updatedSections.map(s => ({
                    id: s.id,
                    type: s.type,
                    content: s.content
                  })));
                  setShowPostGenEditor(false);
                }}
                onCancel={() => setShowPostGenEditor(false)}
                businessName={businessName}
                targetLocation={targetLocation}
              />
            </div>
          )}

         {/* Generated Landing Page Preview - Scrollable */}
          <div className="rounded-xl border-2 border-purple-300 overflow-hidden shadow-lg relative">
           {/* Browser Chrome */}
           <div className="flex items-center gap-2 px-3 py-2 bg-muted border-b border-border">
             <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-red-400" />
               <div className="w-3 h-3 rounded-full bg-amber-400" />
               <div className="w-3 h-3 rounded-full bg-green-400" />
             </div>
             <div className="flex-1 mx-4">
               <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground font-mono">
                 https://{businessName.toLowerCase().replace(/\s/g, '')}.com/{selectedTemplate}
               </div>
             </div>
           </div>
 
           {/* Actual Landing Page Content - scrollable preview */}
           <ScaledPreview scrollable className="max-h-[70vh]">
             {renderSelectedTemplate()}
           </ScaledPreview>
          </div>
         </div>
 
        {/* Full Screen Preview Dialog */}
        {isPopoutOpen && (
          <div className={`fixed inset-0 z-50 bg-background flex flex-col ${hasBrandTheme ? 'brand-override-active' : ''}`}>
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                  <Sparkles className="w-3 h-3" />
                  {LANDING_PAGE_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                </Badge>
                
                {/* Template Switcher */}
                <div className="flex items-center gap-1 bg-muted rounded-lg border border-border p-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToPrevTemplate}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Select value={selectedTemplate} onValueChange={(v) => { setSelectedTemplate(v); setIsPublished(false); }}>
                    <SelectTrigger className="w-[120px] h-7 text-xs border-0 bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANDING_PAGE_TEMPLATES.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToNextTemplate}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <Select value={selectedTheme} onValueChange={(v) => { setSelectedTheme(v); setIsPublished(false); }}>
                  <SelectTrigger className="w-[110px] h-8 text-xs">
                    <Palette className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_THEMES.map((colorTheme) => (
                      <SelectItem key={colorTheme.id} value={colorTheme.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ background: `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.accent})` }}
                          />
                          {colorTheme.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant={showPostGenEditor ? "default" : "outline"}
                  size="sm" 
                  onClick={() => setShowPostGenEditor(!showPostGenEditor)}
                  className="gap-1 text-xs"
                >
                  <Pencil className="w-3 h-3" />
                  {showPostGenEditor ? 'Close Editor' : 'Edit Page'}
                </Button>
                <Button variant="outline" size="sm" onClick={exportAsHtml} className="gap-1 text-xs">
                  <Download className="w-3 h-3" /> Export
                </Button>
                <Button variant="outline" size="sm" onClick={copyHtmlToClipboard} className="gap-1 text-xs">
                  <Copy className="w-3 h-3" /> Copy
                </Button>

                {!isPublished ? (
                  <Button 
                    size="sm" 
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="gap-1 text-xs text-white"
                    style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)" }}
                  >
                    {isPublishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Rocket className="w-3 h-3" />}
                    {isPublishing ? 'Publishing...' : 'Publish Page'}
                  </Button>
                ) : (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Published
                  </Badge>
                )}
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsPopoutOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Content area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Editor Panel (side) */}
              {showPostGenEditor && (
                <div className="w-full max-w-sm border-r border-border bg-card overflow-y-auto shrink-0">
                  <PostGenerationEditor
                    sections={sections.map(s => ({
                      id: s.id,
                      label: s.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                      type: s.type,
                      content: s.content,
                      maxLength: s.type === 'headline' ? 60 : s.type === 'body' ? 300 : 100
                    }))}
                    onSave={(updatedSections) => {
                      setSections(updatedSections.map(s => ({
                        id: s.id,
                        type: s.type,
                        content: s.content
                      })));
                    }}
                    onCancel={() => setShowPostGenEditor(false)}
                    businessName={businessName}
                    targetLocation={targetLocation}
                  />
                </div>
              )}
              
              {/* Full page preview - scrolls from top */}
              <div className="flex-1 overflow-auto" ref={(el) => { if (el) el.scrollTop = 0; }}>
                <ScaledPreview scrollable contentWidth={1440} className="min-h-full">
                  {renderSelectedTemplate()}
                </ScaledPreview>
              </div>
            </div>
          </div>
        )}
       </>
     );
   }


   // Smart template filtering: recommended (>10% conversion) vs rest
   const recommendedTemplates = LANDING_PAGE_TEMPLATES.filter(t => parseFloat(t.conversion) >= 10);
   const otherTemplates = LANDING_PAGE_TEMPLATES.filter(t => parseFloat(t.conversion) < 10);

   const handleTemplateClick = (templateId: string) => {
     setSelectedTemplate(templateId);
     setGenerationStep(1);
     onGenerate();
     
     // Brief loading then open full-screen
     const steps = [1, 2, 3, 4, 5];
     steps.forEach((step, index) => {
       setTimeout(() => {
         setGenerationStep(step);
         if (step === 5) {
           setTimeout(() => {
             setShowLandingPage(true);
             setIsPopoutOpen(true);
             setGenerationStep(0);
           }, 400);
         }
       }, (index + 1) * 400);
     });
   };

   return (
      <div className="space-y-4">
        {/* Auto-Populated Data Banner */}
        {autoPopulatedFields.size > 0 && (
          <div className="p-4 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-pink-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  Auto-filled from Analytics Data
                  <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30">
                    {autoPopulatedFields.size} fields
                  </Badge>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Pre-populated with insights from your analytics.
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground"
                onClick={() => setAutoPopulatedFields(new Set())}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

       {/* Loading overlay */}
       {generationStep > 0 && (
         <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
           <div className="bg-card rounded-2xl border border-border shadow-2xl p-8 max-w-sm w-full space-y-6">
             <div className="text-center space-y-2">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto">
                 <Sparkles className="w-8 h-8 text-white animate-pulse" />
               </div>
               <h3 className="text-lg font-bold text-foreground">Building your page...</h3>
               <p className="text-sm text-muted-foreground">
                 {LANDING_PAGE_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
               </p>
             </div>
             <div className="space-y-2">
               {[
                 { step: 1, label: "Analyzing inputs" },
                 { step: 2, label: "Generating copy" },
                 { step: 3, label: "Building structure" },
                 { step: 4, label: "Adding trust elements" },
                 { step: 5, label: "Optimizing conversions" },
               ].map((item) => (
                 <div 
                   key={item.step} 
                   className={`flex items-center gap-2 text-sm transition-all ${
                     generationStep >= item.step ? "text-foreground" : "text-muted-foreground/40"
                   }`}
                 >
                   {generationStep > item.step ? (
                     <CheckCircle2 className="w-4 h-4 text-green-500" />
                   ) : generationStep === item.step ? (
                     <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
                   ) : (
                     <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                   )}
                   {item.label}
                 </div>
               ))}
             </div>
           </div>
         </div>
       )}

       {/* Recommended Templates */}
       <div className="rounded-xl border border-border bg-card p-5">
         <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
           <Star className="w-4 h-4 text-amber-500" />
           Recommended Templates
         </h4>
         <p className="text-xs text-muted-foreground mb-4">
           Top performers based on analytics — click to build instantly
         </p>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           {recommendedTemplates.map((template) => (
             <button
               key={template.id}
               onClick={() => handleTemplateClick(template.id)}
               disabled={generationStep > 0}
               className="group text-left p-4 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary hover:shadow-lg transition-all relative overflow-hidden"
             >
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                 <span className="font-semibold text-sm text-foreground">{template.name}</span>
                 <Badge className="ml-auto text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                   {template.conversion}
                 </Badge>
               </div>
               <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
               <div className="flex items-center gap-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                 <Sparkles className="w-3 h-3" />
                 Click to build
                 <ArrowRight className="w-3 h-3" />
               </div>
             </button>
           ))}
         </div>
       </div>

       {/* More Templates (Accordion) */}
       {otherTemplates.length > 0 && (
         <details className="rounded-xl border border-border bg-card overflow-hidden">
           <summary className="p-4 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden">
             <ChevronDown className="w-4 h-4 transition-transform [[open]>&]:rotate-180" />
             More templates ({otherTemplates.length})
           </summary>
           <div className="px-4 pb-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {otherTemplates.map((template) => (
                 <button
                   key={template.id}
                   onClick={() => handleTemplateClick(template.id)}
                   disabled={generationStep > 0}
                   className="group text-left p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all"
                 >
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                     <span className="font-semibold text-sm text-foreground">{template.name}</span>
                     <Badge variant="secondary" className="ml-auto text-[10px]">
                       {template.conversion}
                     </Badge>
                   </div>
                   <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                   <div className="flex items-center gap-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                     <Sparkles className="w-3 h-3" />
                     Click to build
                     <ArrowRight className="w-3 h-3" />
                   </div>
                 </button>
               ))}
             </div>
           </div>
         </details>
       )}
     </div>
   );
 }