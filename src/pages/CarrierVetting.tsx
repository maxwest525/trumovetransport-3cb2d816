import { useState, useCallback, useEffect } from 'react';


// Scroll to top on mount
const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};
import { useSearchParams } from 'react-router-dom';
import { Shield, Database, Radio, AlertTriangle, Users, Scale, Zap, Search, Info, ChevronDown, ExternalLink, FileCheck, TrendingUp, Truck, CheckCircle2, AlertCircle, Printer, Lock, Activity, ClipboardCheck, Share2, FileDown, Copy, Check, BadgeCheck } from 'lucide-react';
import logoImg from '@/assets/logo.png';

import SiteShell from '@/components/layout/SiteShell';

import { Button } from '@/components/ui/button';
import { ComparisonGrid } from '@/components/vetting/ComparisonGrid';
import { ComparisonSummaryTable } from '@/components/vetting/ComparisonSummaryTable';
import { CarrierSearch } from '@/components/vetting/CarrierSearch';
import { useToast } from '@/hooks/use-toast';
import { MOCK_CARRIERS, MOCK_CARRIER_GOOD, MOCK_CARRIER_BAD, MOCK_CARRIER_MIXED, type MockCarrierData } from '@/data/mockCarriers';
import { cn } from '@/lib/utils';
import { generateCarrierComparisonPdf } from '@/lib/carrierPdfExport';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface CarrierData {
  carrier: {
    legalName: string;
    dbaName: string;
    dotNumber: string;
    mcNumber: string;
    allowToOperate: string;
    outOfService: string;
    outOfServiceDate: string;
    complaintCount: number;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    phone: string;
  };
  authority: {
    commonStatus: string;
    contractStatus: string;
    brokerStatus: string;
    bipdInsurance: string;
    cargoInsurance: string;
    bondInsurance: string;
  };
  safety: {
    rating: string;
    ratingDate: string;
    reviewDate: string;
    reviewType: string;
  };
  basics: {
    unsafeDriving: { measure: number; percentile: number; rdDeficient?: string; rdsvDeficient?: string; svDeficient?: string; snapShotDate?: string; totalInspectionWithViolation?: number; totalViolation?: number } | null;
    hoursOfService: { measure: number; percentile: number; rdDeficient?: string; rdsvDeficient?: string; svDeficient?: string; snapShotDate?: string; totalInspectionWithViolation?: number; totalViolation?: number } | null;
    vehicleMaintenance: { measure: number; percentile: number; rdDeficient?: string; rdsvDeficient?: string; svDeficient?: string; snapShotDate?: string; totalInspectionWithViolation?: number; totalViolation?: number } | null;
    controlledSubstances: { measure: number; percentile: number; rdDeficient?: string; rdsvDeficient?: string; svDeficient?: string; snapShotDate?: string; totalInspectionWithViolation?: number; totalViolation?: number } | null;
    driverFitness: { measure: number; percentile: number; rdDeficient?: string; rdsvDeficient?: string; svDeficient?: string; snapShotDate?: string; totalInspectionWithViolation?: number; totalViolation?: number } | null;
    crashIndicator: { measure: number; percentile: number; rdDeficient?: string; rdsvDeficient?: string; svDeficient?: string; snapShotDate?: string; totalInspectionWithViolation?: number; totalViolation?: number } | null;
  };
  oos: {
    vehicleOosRate: number;
    vehicleOosRateNationalAvg: number;
    driverOosRate: number;
    driverOosRateNationalAvg: number;
    hazmatOosRate: number;
    hazmatOosRateNationalAvg: number;
    vehicleInspections: number;
    driverInspections: number;
    hazmatInspections: number;
    vehicleOosInsp: number;
    driverOosInsp: number;
    hazmatOosInsp: number;
  };
  fleet: {
    powerUnits: number;
    drivers: number;
    mcs150Date: string;
    busVehicle: number;
    limoVehicle: number;
    miniBusVehicle: number;
    motorCoachVehicle: number;
    vanVehicle: number;
    passengerVehicle: number;
  };
  crashes: {
    fatal: number;
    injury: number;
    towAway: number;
    total: number;
  };
  cargoTypes: string[];
  operationTypes: string[];
  docketNumbers: { prefix: string; number: string }[];
  // Scraped data from SAFER & SMS & Li-Public
  scraped?: {
    mileage?: string;
    mileageYear?: string;
    dunsNumber?: string;
    entityType?: string;
    stateCarrierId?: string;
    operatingAuthorityText?: string;
    inspectionDetails?: {
      vehicleInspections: number;
      vehicleOos: number;
      driverInspections: number;
      driverOos: number;
      hazmatInspections: number;
      hazmatOos: number;
      totalInspections: number;
      iepInspections: number;
    };
    oosRatesWithAverages?: {
      vehicleOosPercent: number;
      vehicleNationalAvg: number;
      driverOosPercent: number;
      driverNationalAvg: number;
      hazmatOosPercent: number;
      hazmatNationalAvg: number;
    };
    canadianInspections?: {
      vehicleInspections: number;
      vehicleOos: number;
      driverInspections: number;
      driverOos: number;
    };
    canadianCrashes?: {
      fatal: number;
      injury: number;
      towAway: number;
      total: number;
    };
    licensingInsurance?: {
      property: { authorized: boolean; mcNumber: string };
      passenger: { authorized: boolean; mcNumber: string };
      householdGoods: { authorized: boolean; mcNumber: string };
      broker: { authorized: boolean; mcNumber: string };
    };
    insurancePolicies?: {
      type: string;
      insurerName: string;
      policyNumber: string;
      coverageAmount: string;
      effectiveDate: string;
      cancellationDate: string;
      status: string;
    }[];
    boc3Status?: string;
    boc3FilingDate?: string;
    authorityHistory?: {
      type: string;
      mcNumber: string;
      status: string;
      grantDate: string;
      revokeDate?: string;
    }[];
    enforcementCases?: string;
    summaryOfActivities?: {
      mostRecentInvestigation: string;
      mostRecentInvestigationType: string;
      totalInspections: number;
      inspectionsWithoutViolations: number;
      inspectionsWithViolations: number;
      totalCrashes: number;
    };
    violationSummary?: {
      totalViolations: number;
      topViolations: { code: string; description: string; count: number; oosCount: number; basic: string }[];
    };
    basicMeasures?: {
      unsafeDriving?: { measure: number; inspectionsWithViolations?: number };
      hosCompliance?: { measure: number; inspectionsWithViolations?: number; relevantInspections?: number };
      vehicleMaintenance?: { measure: number; inspectionsWithViolations?: number; relevantInspections?: number };
      controlledSubstances?: { measure: number; inspectionsWithViolations?: number };
      driverFitness?: { measure: number; inspectionsWithViolations?: number; relevantInspections?: number };
      crashIndicator?: { measure: number };
      hazmatCompliance?: { measure: number };
    };
    isLoading?: boolean;
  };
}

const FEATURES = [
  {
    icon: Radio,
    title: 'Live FMCSA Data',
    description: 'Real-time authority status, insurance verification, and safety ratings',
    detail: 'Connects directly to the SAFER Web Services database for up-to-the-minute carrier information.'
  },
  {
    icon: AlertTriangle,
    title: 'Red Flag Detection',
    description: 'Automatic warnings for high-risk carriers based on safety metrics',
    detail: 'Flags: Revoked authority, lapsed insurance, high crash rates, CSA BASIC scores above intervention thresholds.'
  },
  {
    icon: Users,
    title: 'Side-by-Side Compare',
    description: 'Compare up to 4 carriers simultaneously',
    detail: 'View safety grades, insurance coverage, and compliance records in a comparison grid.'
  },
  {
    icon: Scale,
    title: 'Fleet Intelligence',
    description: 'Fleet size, crash history, and out-of-service rates',
    detail: 'Power units, drivers, MCS-150 filing date, OOS percentages vs national averages.'
  }
];

// Trust Strip content - expanded for better visual distribution
const DATA_SOURCES = [
  {
    icon: Database,
    title: 'SAFER Web Services',
    description: 'Official FMCSA database'
  },
  {
    icon: Activity,
    title: 'Real-Time Updates',
    description: 'Continuous data refresh'
  },
  {
    icon: ClipboardCheck,
    title: 'CSA BASIC Scores',
    description: 'Safety accountability metrics'
  },
  {
    icon: Lock,
    title: 'Authority Verification',
    description: 'Operating status confirmed'
  },
  {
    icon: Shield,
    title: 'Insurance Coverage',
    description: 'BIPD & cargo verified'
  }
];

export default function CarrierVetting() {
  useScrollToTop();
  const [carriers, setCarriers] = useState<CarrierData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Fetch scraped SAFER/SMS data in background
  const fetchScrapedData = useCallback(async (dotNumber: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/carrier-safer-scrape`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dotNumber }),
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCarriers(prev => prev.map(c => 
            c.carrier.dotNumber === dotNumber 
              ? { ...c, scraped: { ...result.data, isLoading: false } }
              : c
          ));
        }
      }
    } catch (err) {
      console.error('Scrape failed for DOT#', dotNumber, err);
      // Non-critical - just remove loading state
      setCarriers(prev => prev.map(c => 
        c.carrier.dotNumber === dotNumber && c.scraped?.isLoading
          ? { ...c, scraped: { ...c.scraped, isLoading: false } }
          : c
      ));
    }
  }, []);

  // Fetch carrier details function - defined first so it can be used in useEffect
  const fetchCarrierDetails = useCallback(async (dotNumber: string): Promise<CarrierData | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/carrier-lookup?dot=${dotNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Carrier not found');
        }
        const responseText = await response.text();
        if (responseText.includes('Webkey not found')) {
          throw new Error('FMCSA_API_UNAVAILABLE');
        }
        throw new Error('Failed to fetch carrier details');
      }

      const data = await response.json();
      if (data?.content === 'Webkey not found') {
        throw new Error('FMCSA_API_UNAVAILABLE');
      }
      
      // Mark scraped as loading, then fire background scrape
      data.scraped = { isLoading: true };
      return data;
    } catch (error) {
      console.error('Error fetching carrier:', error);
      throw error;
    }
  }, []);

  // Load carriers from URL params on mount
  useEffect(() => {
    const dotNumbers = searchParams.get('dots');
    if (dotNumbers && carriers.length === 0) {
      const dots = dotNumbers.split(',').filter(Boolean);
      dots.forEach(dot => {
        const demoCarrier = MOCK_CARRIERS.find(c => c.carrier.dotNumber === dot);
        if (demoCarrier) {
          setCarriers(prev => {
            if (prev.some(c => c.carrier.dotNumber === dot)) return prev;
            if (prev.length >= 4) return prev;
            return [...prev, demoCarrier as CarrierData];
          });
        } else {
          fetchCarrierDetails(dot).then(data => {
            if (data) {
              setCarriers(prev => {
                if (prev.some(c => c.carrier.dotNumber === dot)) return prev;
                if (prev.length >= 4) return prev;
                return [...prev, data];
              });
            }
          }).catch(console.error);
        }
      });
    }
  }, [searchParams, fetchCarrierDetails]);

  // Generate share URL
  const generateShareUrl = useCallback(() => {
    if (carriers.length === 0) return '';
    const dotNumbers = carriers.map(c => c.carrier.dotNumber).join(',');
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?dots=${dotNumbers}`;
  }, [carriers]);

  // Copy share URL to clipboard
  const handleCopyShareUrl = useCallback(async () => {
    const url = generateShareUrl();
    if (!url) return;
    
    try {
      await navigator.clipboard.writeText(url);
      setHasCopiedShare(true);
      toast({
        title: 'Link copied!',
        description: 'Share URL has been copied to clipboard.',
      });
      setTimeout(() => setHasCopiedShare(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the URL manually.',
        variant: 'destructive'
      });
    }
  }, [generateShareUrl, toast]);

  // Export PDF
  const handleExportPdf = useCallback(() => {
    if (carriers.length === 0) return;
    try {
      generateCarrierComparisonPdf(carriers);
      toast({
        title: 'PDF Generated',
        description: 'Your carrier comparison report has been downloaded.',
      });
    } catch (err) {
      toast({
        title: 'Export failed',
        description: 'Could not generate PDF. Please try again.',
        variant: 'destructive'
      });
    }
  }, [carriers, toast]);

  // Load individual demo carrier
  const loadDemoCarrier = useCallback((carrier: MockCarrierData) => {
    // Check if already added
    if (carriers.some(c => c.carrier.dotNumber === carrier.carrier.dotNumber)) {
      toast({
        title: 'Already added',
        description: `${carrier.carrier.legalName} is already in your comparison.`,
        variant: 'destructive'
      });
      return;
    }

    // Check max limit
    if (carriers.length >= 4) {
      toast({
        title: 'Maximum reached',
        description: 'You can compare up to 4 carriers at once. Remove one to add another.',
        variant: 'destructive'
      });
      return;
    }

    setCarriers(prev => [...prev, carrier as CarrierData]);
    toast({
      title: 'Carrier Added',
      description: `${carrier.carrier.legalName} added to comparison.`,
    });
  }, [carriers, toast]);


  const handleAddCarrier = useCallback(async (dotNumber: string) => {
    // Check if already added
    if (carriers.some(c => c.carrier.dotNumber === dotNumber)) {
      toast({
        title: 'Already added',
        description: 'This carrier is already in your comparison.',
        variant: 'destructive'
      });
      return;
    }

    // Check max limit
    if (carriers.length >= 4) {
      toast({
        title: 'Maximum reached',
        description: 'You can compare up to 4 carriers at once.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setApiError(null);
    try {
      const data = await fetchCarrierDetails(dotNumber);
      if (data) {
        setCarriers(prev => [...prev, data]);
        // Fire background scrape for enhanced data
        fetchScrapedData(dotNumber);
        toast({
          title: 'Carrier added',
          description: `${data.carrier.legalName} has been added to comparison.`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load carrier data';
      
      // Check for FMCSA API unavailability
      if (errorMessage === 'FMCSA_API_UNAVAILABLE') {
        setApiError('The FMCSA SAFER Web Services API is currently unavailable. This may be due to scheduled maintenance or a temporary outage. Please try again later or use the demo carriers below to explore the tool.');
        toast({
          title: 'FMCSA API Unavailable',
          description: 'The federal carrier database is temporarily unavailable. Try demo carriers instead.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [carriers, fetchCarrierDetails, toast]);

  const handleRemoveCarrier = useCallback((index: number) => {
    setCarriers(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setCarriers([]);
  }, []);

  const handlePrintReport = useCallback(() => {
    window.print();
  }, []);

  return (
    <SiteShell hideTrustStrip>
      <div className="min-h-screen carrier-vetting-page">
        

        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-7xl mx-auto">
          {/* Hero Section - always visible */}
          <div className="flex flex-col items-center justify-center text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-3 whitespace-nowrap">
              FMCSA-Verified <span className="tru-qb-title-accent">Carrier Safety Records</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real-time FMCSA safety data • Insurance verification • DOT lookup
            </p>
          </div>

          {/* FMCSA Terminal - Always Visible */}
          <div className="fmcsa-terminal max-w-2xl mx-auto mb-6">
            <div className="fmcsa-terminal-header">
              <div className="fmcsa-terminal-dots">
                <span></span><span></span><span></span>
              </div>
              <span className="fmcsa-terminal-title">SAFER DATABASE QUERY</span>
              <div className="ml-auto flex items-center gap-2">
                <img src="https://www.fmcsa.dot.gov/themes/custom/fmcsa/logo.svg" alt="FMCSA" className="h-5 brightness-0 invert opacity-70" />
              </div>
            </div>
            <div className="fmcsa-terminal-body">
              <div className="mb-5 text-center">
                <h3 
                  className="text-xl md:text-2xl font-bold tracking-wide text-slate-900 dark:text-white/80"
                  style={{ 
                    letterSpacing: '0.05em'
                  }}
                >
                  FMCSA-Verified Carrier Safety Records
                </h3>
              </div>
              <CarrierSearch onSelect={handleAddCarrier} isLoading={isLoading} />
              <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed mt-4 text-center">
                All carriers are filtered and continuously monitored per official FMCSA Safety Measurement System (SMS) criteria and federal compliance standards. Click any card for detailed report including Behavior Analysis and Safety Improvement Categories (BASICs), roadside inspection results, crash involvement, and safety fitness evaluation.
              </p>
            </div>
          </div>

          {/* API Error Alert */}
          {apiError && (
            <div className="mb-8 max-w-3xl mx-auto animate-fade-in">
              <div className="p-4 rounded-lg border border-amber-500/50 bg-amber-500/10 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-1">FMCSA API Temporarily Unavailable</h4>
                  <p className="text-sm text-muted-foreground">{apiError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 gap-2"
                    onClick={() => setApiError(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Section Header */}
          <div className="mt-12 mb-10 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-border" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {carriers.length === 0 ? 'Search Results' : 'Comparison View'}
              </span>
              <div className="w-8 h-px bg-border" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
              {carriers.length === 0 ? 'Carrier FMCSA Results' : `Comparing ${carriers.length} Carrier${carriers.length > 1 ? 's' : ''}`}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
              {carriers.length === 0 ? (
                <>
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-slate-900 dark:text-foreground" />
                    Real-time data
                  </span>
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-slate-900 dark:text-foreground" />
                    Red flag alerts
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-slate-900 dark:text-foreground" />
                    Fleet intelligence
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-900 dark:text-foreground" />
                    Side-by-side comparison
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-slate-900 dark:text-foreground" />
                    Live FMCSA data
                  </span>
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-slate-900 dark:text-foreground" />
                    Automated risk detection
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Empty State Placeholder - Only show when no carriers */}
          {carriers.length === 0 && (
            <div className="mb-8 animate-fade-in">
              {/* Placeholder Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className="relative p-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-border/60 bg-slate-50/50 dark:bg-muted/20 min-h-[300px] flex flex-col items-center justify-center text-center group hover:border-slate-400 dark:hover:border-border hover:bg-slate-100/50 dark:hover:bg-muted/30 transition-all duration-300 shadow-sm"
                    style={{ 
                      animation: `pulse-subtle 3s ease-in-out infinite`,
                      animationDelay: `${i * 0.5}s`
                    }}
                  >
                    {/* Floating animation wrapper */}
                    <div 
                      className="flex flex-col items-center"
                      style={{ 
                        animation: `float-gentle 4s ease-in-out infinite`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    >
                      {/* Placeholder Icon */}
                      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-muted/50 border-2 border-slate-200 dark:border-border/50 flex items-center justify-center mb-5 group-hover:border-slate-300 dark:group-hover:border-border transition-colors shadow-inner">
                        <Truck className="w-10 h-10 text-slate-400 dark:text-muted-foreground/40 group-hover:text-slate-500 transition-colors" />
                      </div>
                      
                      {/* Slot Label */}
                      <div className="px-4 py-1.5 rounded-full bg-slate-200/70 dark:bg-muted/50 border border-slate-300 dark:border-border/50">
                        <p className="text-sm font-semibold text-slate-600 dark:text-muted-foreground">
                          Carrier Slot {i}
                        </p>
                      </div>

                      {/* Helper text */}
                      <p className="mt-3 text-xs text-slate-500 dark:text-muted-foreground/60">
                        Search above or try a demo
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Demo Carrier Buttons */}
              <div className="mt-8 max-w-2xl mx-auto">
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Try it out with sample carriers:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDemoCarrier(MOCK_CARRIER_GOOD)}
                    className="gap-2 border-slate-300 dark:border-border hover:border-slate-400 dark:hover:border-border/80 hover:bg-slate-50 dark:hover:bg-muted/30"
                  >
                    <CheckCircle2 className="w-4 h-4 text-foreground" />
                    <span>Sunrise Movers</span>
                    <span className="text-xs text-muted-foreground">(Safe)</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDemoCarrier(MOCK_CARRIER_BAD)}
                    className="gap-2 border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>Fast & Cheap</span>
                    <span className="text-xs text-muted-foreground">(Risky)</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDemoCarrier(MOCK_CARRIER_MIXED)}
                    className="gap-2 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Regional Van Lines</span>
                    <span className="text-xs text-muted-foreground">(Mixed)</span>
                  </Button>
                </div>
              </div>
              
              {/* How It Works Section */}
              <div className="mt-10 max-w-3xl mx-auto">
                <h3 className="text-center text-sm font-semibold text-foreground mb-6">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center mx-auto mb-3 shadow-md">
                      <span className="text-sm font-bold text-white dark:text-slate-900">1</span>
                    </div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Search by DOT or Name</h4>
                    <p className="text-xs text-muted-foreground">Enter a carrier's DOT number or company name in the search above</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center mx-auto mb-3 shadow-md">
                      <span className="text-sm font-bold text-white dark:text-slate-900">2</span>
                    </div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Review Safety Data</h4>
                    <p className="text-xs text-muted-foreground">See instant FMCSA safety scores, insurance status, and red flags</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center mx-auto mb-3 shadow-md">
                      <span className="text-sm font-bold text-white dark:text-slate-900">3</span>
                    </div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Compare Up to 4</h4>
                    <p className="text-xs text-muted-foreground">Add multiple carriers to compare their safety records side-by-side</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Header - Only when carriers exist */}
          {carriers.length > 0 && (
            <div className="mt-12 mb-10 text-center">
              <div className="inline-block px-8 py-6 bg-gradient-to-b from-muted/50 to-transparent rounded-xl border border-border/50">
                <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                    Carrier Safety Comparison
                  </h2>
                  <div className="flex items-center gap-2 print:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyShareUrl}
                      className="gap-2"
                    >
                      {hasCopiedShare ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                      {hasCopiedShare ? 'Copied!' : 'Share'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPdf}
                      className="gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrintReport}
                      className="gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed max-w-6xl">
                  Pursuant to 49 U.S.C. 31144 and 49 CFR Part 385, displayed carriers are evaluated and monitored under the FMCSA Safety Measurement System (SMS), which quantifies performance across Behavior Analysis and Safety Improvement Categories (BASICs) using roadside inspection data, crash records, and compliance history from federal sources. All records are subject to ongoing review for adherence to the safety fitness standard. Click any carrier card to examine the detailed safety profile.
                </p>
              </div>
            </div>
          )}

          {/* Results Section */}
          {carriers.length > 0 && (
            <div className="flex gap-6">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Summary Table - Quick scannable comparison */}
                {carriers.length >= 2 && (
                  <ComparisonSummaryTable carriers={carriers} />
                )}

                {/* Comparison Grid */}
                <ComparisonGrid
                  carriers={carriers}
                  onRemove={handleRemoveCarrier}
                  onAdd={handleAddCarrier}
                  isLoading={isLoading}
                  maxCarriers={4}
                />

                {/* Tips Section */}
                {carriers.length < 2 && (
                  <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-start gap-3">
                      <Search className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground text-sm">Pro Tip</p>
                        <p className="text-sm text-muted-foreground">
                          Add another carrier to compare their safety metrics side-by-side. 
                          This helps customers see why TruMove partners are the safer choice.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-[120px] space-y-4">
                  {/* Add Carrier */}
                  {carriers.length < 4 && (
                    <div className="p-3 rounded-xl border border-border bg-card">
                      <h3 className="text-xs font-semibold text-foreground mb-2">Add Carrier for Comparison</h3>
                      <CarrierSearch 
                        onSelect={handleAddCarrier} 
                        isLoading={isLoading}
                        className="sidebar-search"
                      />
                      {/* Clear All - Pill button with border */}
                      {carriers.length > 0 && (
                        <button 
                          onClick={clearAll}
                          className="w-full mt-2 text-[10px] text-muted-foreground hover:text-destructive bg-muted/50 hover:bg-destructive/10 border border-border text-center py-1 px-2 rounded-full transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  )}

                  {/* Risk Grade Legend */}
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-3">Safety Grade Legend</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-6 flex items-center justify-center rounded bg-green-500/10 text-green-600 font-bold">A+</span>
                        <span className="text-muted-foreground">Excellent - Top-tier</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-6 flex items-center justify-center rounded bg-green-500/10 text-green-600 font-bold">A</span>
                        <span className="text-muted-foreground">Very Good</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-6 flex items-center justify-center rounded bg-emerald-500/10 text-emerald-600 font-bold">B</span>
                        <span className="text-muted-foreground">Good - Generally safe</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-6 flex items-center justify-center rounded bg-amber-500/10 text-amber-600 font-bold">C</span>
                        <span className="text-muted-foreground">Moderate - Some issues</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-6 flex items-center justify-center rounded bg-orange-500/10 text-orange-600 font-bold">D</span>
                        <span className="text-muted-foreground">Concerning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-6 flex items-center justify-center rounded bg-red-500/10 text-red-600 font-bold">F</span>
                        <span className="text-muted-foreground">High Risk - Avoid</span>
                      </div>
                    </div>
                  </div>

                  {/* CSA BASIC Scores Legend */}
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      CSA BASIC Safety Scores
                    </h3>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-foreground w-16 shrink-0">Unsafe</span>
                        <span>Speeding, reckless driving</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-foreground w-16 shrink-0">HOS</span>
                        <span>Hours of Service fatigue</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-foreground w-16 shrink-0">Vehicle</span>
                        <span>Brake, equipment defects</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-foreground w-16 shrink-0">Fitness</span>
                        <span>Licensing, medical certs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-foreground w-16 shrink-0">Crash</span>
                        <span>Crash involvement</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-foreground w-16 shrink-0">Drugs</span>
                        <span>Substance violations</span>
                      </div>
                      <p className="pt-2 text-[11px] border-t border-border/50 mt-2">
                        Higher percentiles indicate worse performance relative to peers. Scores ≥65% may trigger FMCSA intervention.
                      </p>
                    </div>
                  </div>
                  
                  {/* Insurance Coverage Analysis */}
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Insurance Coverage Analysis
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Federal minimums: $750K BIPD for general freight, $5M for hazmat. Cargo insurance varies by commodity.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Dropdown - Fixed position */}
        <div className="fixed bottom-6 right-6 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-background shadow-lg border-border"
              >
                <Truck className="w-4 h-4 mr-2" />
                Demo
                <ChevronDown className="w-3 h-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => loadDemoCarrier(MOCK_CARRIER_GOOD)}>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-5 flex items-center justify-center rounded bg-green-500/10 text-green-600 text-xs font-bold">A+</span>
                  <span>Sunrise Moving (Good)</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadDemoCarrier(MOCK_CARRIER_BAD)}>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-5 flex items-center justify-center rounded bg-red-500/10 text-red-600 text-xs font-bold">F</span>
                  <span>Fast & Cheap (Bad)</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => loadDemoCarrier(MOCK_CARRIER_MIXED)}>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-5 flex items-center justify-center rounded bg-amber-500/10 text-amber-600 text-xs font-bold">C</span>
                  <span>Regional Van Lines (Mixed)</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                MOCK_CARRIERS.forEach(c => loadDemoCarrier(c));
              }}>
                <span className="text-muted-foreground">Load All Demo Carriers</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>
      </div>
    </SiteShell>
  );
}
