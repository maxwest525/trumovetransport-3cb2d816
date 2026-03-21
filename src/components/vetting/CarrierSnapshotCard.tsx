import { useState } from 'react';
import { Phone, MapPin, Truck, Shield, AlertTriangle, CheckCircle2, XCircle, Calendar, FileWarning, X, ChevronDown, ChevronUp, ExternalLink, Star, Ban, MessageSquareWarning, Package, Briefcase, Hash, Loader2, Gauge, Scale, ClipboardCheck, Activity, FileText, History, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { RedFlagBadge, generateRedFlags, type CarrierData as BaseCarrierData } from './RedFlagBadge';
import { cn } from '@/lib/utils';

// BASIC score descriptions for tooltips
const BASIC_DESCRIPTIONS: Record<string, string> = {
  'Unsafe Driving': 'Measures dangerous driving behaviors like speeding, reckless driving, and improper lane changes. Higher percentile = more violations.',
  'HOS Compliance': 'Tracks Hours of Service violations - drivers working too long without rest. Critical for fatigue-related safety.',
  'Vehicle Maintenance': 'Measures brake, light, and equipment defects found during inspections. Indicates fleet maintenance quality.',
  'Driver Fitness': 'Tracks driver qualification issues - licensing, medical certs, and training records.',
  'Crash Indicator': 'Measures crash involvement history. Higher percentile = more crashes relative to exposure.',
  'Controlled Substances': 'Tracks drug and alcohol violations. Any positive result is a serious red flag.'
};

// Extended type with full data
interface ExtendedCarrierData extends BaseCarrierData {
  carrier: {
    legalName: string;
    dbaName: string;
    dotNumber: string;
    mcNumber: string;
    allowToOperate?: string;
    outOfService?: string;
    outOfServiceDate?: string;
    complaintCount?: number;
    address: {
      city: string;
      state: string;
      street?: string;
      zip?: string;
      country?: string;
    };
    phone: string;
  };
  fleet: {
    powerUnits: number;
    drivers: number;
    mcs150Date: string;
    busVehicle?: number;
    limoVehicle?: number;
    miniBusVehicle?: number;
    motorCoachVehicle?: number;
    vanVehicle?: number;
    passengerVehicle?: number;
  };
  crashes: {
    fatal: number;
    injury: number;
    towAway: number;
    total: number;
  };
  cargoTypes?: string[];
  operationTypes?: string[];
  docketNumbers?: { prefix: string; number: string }[];
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

interface CarrierSnapshotCardProps {
  data: ExtendedCarrierData;
  onRemove?: () => void;
  className?: string;
}

// Calculate risk grade based on carrier data
function calculateRiskGrade(data: ExtendedCarrierData): { grade: string; label: string; color: string; isTruMoveVerified: boolean } {
  let score = 100;
  
  // Authority status (-40 for inactive/revoked)
  if (data.authority.commonStatus === 'REVOKED') score -= 50;
  else if (data.authority.commonStatus === 'INACTIVE' || data.authority.commonStatus === 'NOT AUTHORIZED') score -= 40;
  
  // Insurance gaps
  // FMCSA API returns values in thousands (e.g., "750" = $750,000)
  const bipdAmount = parseInt(data.authority.bipdInsurance?.replace(/[^0-9]/g, '') || '0') * 1000;
  const cargoAmount = parseInt(data.authority.cargoInsurance?.replace(/[^0-9]/g, '') || '0') * 1000;
  if (bipdAmount < 750000) score -= 15;
  if (cargoAmount < 100000) score -= 10;
  
  // BASIC scores (higher percentile = worse)
  const basicScores = [
    data.basics.unsafeDriving?.percentile,
    data.basics.hoursOfService?.percentile,
    data.basics.vehicleMaintenance?.percentile,
    data.basics.crashIndicator?.percentile,
    data.basics.driverFitness?.percentile,
  ].filter(s => s !== null && s !== undefined) as number[];
  
  const hasRedFlags = basicScores.some(p => p >= 65);
  
  basicScores.forEach(percentile => {
    if (percentile >= 75) score -= 8;
    else if (percentile >= 65) score -= 4;
  });
  
  // Crashes (-15 for fatal, -5 for injury)
  if (data.crashes.fatal > 0) score -= 15 * data.crashes.fatal;
  if (data.crashes.injury > 0) score -= 5 * Math.min(data.crashes.injury, 3);
  
  // Safety rating
  if (data.safety.rating === 'UNSATISFACTORY') score -= 25;
  else if (data.safety.rating === 'CONDITIONAL') score -= 15;
  
  // TruMove Verified: A+ or A grade, active authority, no red flags
  const isActive = data.authority.commonStatus === 'ACTIVE' || data.authority.commonStatus === 'AUTHORIZED';
  const isTruMoveVerified = score >= 80 && isActive && !hasRedFlags && data.crashes.fatal === 0;
  
  // Determine grade
  if (score >= 90) return { grade: 'A+', label: 'Excellent', color: 'text-green-500 bg-green-500/10 border-green-500/30', isTruMoveVerified };
  if (score >= 80) return { grade: 'A', label: 'Very Good', color: 'text-green-500 bg-green-500/10 border-green-500/30', isTruMoveVerified };
  if (score >= 70) return { grade: 'B', label: 'Good', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', isTruMoveVerified: false };
  if (score >= 60) return { grade: 'C', label: 'Moderate', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', isTruMoveVerified: false };
  if (score >= 45) return { grade: 'D', label: 'Concerning', color: 'text-orange-500 bg-orange-500/10 border-orange-500/30', isTruMoveVerified: false };
  return { grade: 'F', label: 'High Risk', color: 'text-red-500 bg-red-500/10 border-red-500/30', isTruMoveVerified: false };
}

function AuthorityBadge({ status }: { status: string }) {
  const isActive = status === 'ACTIVE' || status === 'AUTHORIZED';
  const isInactive = status === 'INACTIVE' || status === 'NOT AUTHORIZED';
  const isRevoked = status === 'REVOKED';

  if (isActive) {
    return (
      <div className="flex items-center gap-2 text-green-500">
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-semibold">ACTIVE</span>
      </div>
    );
  }

  if (isRevoked) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <XCircle className="w-5 h-5" />
        <span className="font-semibold">REVOKED</span>
      </div>
    );
  }

  if (isInactive) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <XCircle className="w-5 h-5" />
        <span className="font-semibold">INACTIVE</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <AlertTriangle className="w-5 h-5" />
      <span className="font-semibold">{status || 'UNKNOWN'}</span>
    </div>
  );
}

function AuthorityStatusChip({ status }: { status?: string }) {
  if (!status || status === 'NONE' || status === 'N') {
    return <span className="text-xs text-muted-foreground font-medium">None</span>;
  }
  const isActive = status === 'ACTIVE' || status === 'AUTHORIZED' || status === 'A';
  const isInactive = status === 'INACTIVE' || status === 'I' || status === 'NOT AUTHORIZED';
  const isRevoked = status === 'REVOKED';
  
  return (
    <span className={cn(
      'text-xs font-semibold',
      isActive ? 'text-green-600 dark:text-green-400' :
      isRevoked ? 'text-red-600 dark:text-red-400' :
      isInactive ? 'text-amber-600 dark:text-amber-400' :
      'text-muted-foreground'
    )}>
      {isActive ? 'Active' : isRevoked ? 'Revoked' : isInactive ? 'Inactive' : status}
    </span>
  );
}


function BasicScoreBar({ name, percentile, deficient, threshold = 65, totalInspectionWithViolation, totalViolation, snapShotDate }: { name: string; percentile: number | null; deficient?: boolean; threshold?: number; totalInspectionWithViolation?: number; totalViolation?: number; snapShotDate?: string }) {
  const description = BASIC_DESCRIPTIONS[name] || '';
  
  if (percentile === null) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between py-1.5 cursor-help">
            <span className="text-xs text-muted-foreground">{name}</span>
            <span className="text-xs text-muted-foreground">N/A</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="text-xs">{description || 'No data available for this BASIC.'}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const getColor = () => {
    if (percentile >= 75) return 'bg-red-500';
    if (percentile >= threshold) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="space-y-1 cursor-help">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {name}
              {deficient && (
                <AlertTriangle className="w-3 h-3 text-red-500" />
              )}
            </span>
            <span className={cn(
              'text-xs font-medium',
              percentile >= 75 ? 'text-red-500' : 
              percentile >= threshold ? 'text-amber-500' : 'text-green-500'
            )}>
              {percentile}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
            {/* Threshold marker */}
            <div className="absolute h-full w-px bg-foreground/40" style={{ left: `${threshold}%` }} />
            <div 
              className={cn('h-full rounded-full transition-all', getColor())}
              style={{ width: `${Math.min(percentile, 100)}%` }}
            />
          </div>
          {(totalInspectionWithViolation != null || totalViolation != null) && (
            <div className="text-[10px] text-muted-foreground leading-tight">
              {totalInspectionWithViolation != null && <span>{totalInspectionWithViolation} insp w/ violations</span>}
              {totalInspectionWithViolation != null && totalViolation != null && <span> · </span>}
              {totalViolation != null && <span>{totalViolation} total</span>}
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px]">
        <div className="text-xs space-y-1">
          <p>{description}</p>
          {deficient && <p className="text-red-400 font-medium">⚠ FMCSA intervention threshold exceeded</p>}
          <p className="text-muted-foreground">Threshold: {threshold}% | Score: {percentile}%</p>
          {snapShotDate && <p className="text-muted-foreground">Snapshot: {snapShotDate}</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function InsuranceBar({ label, amount, required }: { label: string; amount: string; required: number }) {
  // FMCSA API returns values in thousands (e.g., "750" = $750,000)
  const parseAmount = (value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, ''));
    return isNaN(num) ? 0 : num * 1000;
  };

  const amountNum = parseAmount(amount);
  const percentage = Math.min((amountNum / required) * 100, 100);
  const isSufficient = amountNum >= required;

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num}`;
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn(
          'text-xs font-medium',
          isSufficient ? 'text-green-500' : 'text-red-500'
        )}>
          {formatCurrency(amountNum)}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all',
            isSufficient ? 'bg-green-500' : 'bg-red-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-[10px] text-muted-foreground text-right">
        Required: {formatCurrency(required)}
      </div>
    </div>
  );
}

// Generate external review links with logos and labels
function ExternalLinks({ companyName, dotNumber }: { companyName: string; dotNumber: string }) {
  const encodedName = encodeURIComponent(companyName);
  
  return (
    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/50">
      <a
        href={`https://www.bbb.org/search?find_text=${encodedName}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        title="Check BBB Profile"
      >
        <img 
          src="https://www.bbb.org/TerminusContent/dist/img/business-profile/accreditation/ab-seal-horizontal.svg" 
          alt="BBB" 
          className="h-5 object-contain"
          onError={(e) => { e.currentTarget.outerHTML = '<span class="font-bold text-blue-600 text-sm">BBB</span>'; }}
        />
        <span className="text-[10px] font-medium text-muted-foreground">Reviews</span>
      </a>
      <a
        href={`https://www.google.com/search?q=${encodedName}+reviews`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        title="Google Reviews"
      >
        <img 
          src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
          alt="Google" 
          className="h-4 object-contain"
          onError={(e) => { e.currentTarget.outerHTML = '<span class="font-bold text-amber-600 text-sm">Google</span>'; }}
        />
        <span className="text-[10px] font-medium text-muted-foreground">Reviews</span>
      </a>
      <a
        href={`https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${dotNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        title="Official FMCSA SAFER"
      >
        <img 
          src="https://www.fmcsa.dot.gov/themes/custom/fmcsa/logo.svg" 
          alt="FMCSA" 
          className="h-4 object-contain dark:invert"
          onError={(e) => { e.currentTarget.outerHTML = '<span class="font-bold text-slate-600 text-sm">FMCSA</span>'; }}
        />
        <span className="text-[10px] font-medium text-muted-foreground">Records</span>
      </a>
    </div>
  );
}

export function CarrierSnapshotCard({ data, onRemove, className }: CarrierSnapshotCardProps) {
  return (
    <TooltipProvider>
      <CarrierSnapshotCardInner data={data} onRemove={onRemove} className={className} />
    </TooltipProvider>
  );
}

function CarrierSnapshotCardInner({ data, onRemove, className }: CarrierSnapshotCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const redFlags = generateRedFlags(data, data.scraped);
  const criticalFlags = redFlags.filter(f => f.severity === 'critical');
  const riskGrade = calculateRiskGrade(data);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  // Format insurance for summary
  const formatInsurance = () => {
    const bipdAmount = parseInt(data.authority.bipdInsurance?.replace(/[^0-9]/g, '') || '0') * 1000;
    if (bipdAmount >= 1000000) return `$${(bipdAmount / 1000000).toFixed(1)}M Insured`;
    if (bipdAmount >= 1000) return `$${(bipdAmount / 1000).toFixed(0)}K Insured`;
    return 'Insurance Unknown';
  };

  // Get the worst BASIC score for summary
  const getWorstBasic = () => {
    const scores = [
      { name: 'Crash', value: data.basics.crashIndicator?.percentile },
      { name: 'Unsafe', value: data.basics.unsafeDriving?.percentile },
      { name: 'HOS', value: data.basics.hoursOfService?.percentile },
    ].filter(s => s.value !== null && s.value !== undefined);
    
    if (scores.length === 0) return null;
    return scores.reduce((worst, current) => 
      (current.value! > (worst.value || 0)) ? current : worst
    );
  };

  const worstBasic = getWorstBasic();

  return (
    <div className="relative">

      <Card className={cn(
        'bg-card/80 backdrop-blur overflow-hidden transition-all shadow-md hover:shadow-lg',
        criticalFlags.length > 0 ? 'border-2 border-red-500/50 shadow-red-500/10' : 'border border-slate-300 dark:border-slate-600',
        className
      )}>
        <CardHeader className="pb-3 relative">
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {/* Carrier Identity - TruMove Verified ABOVE name */}
          <div className="space-y-1 pr-16">
            {/* TruMove Verified - Black badge style, positioned higher inside card */}
            {riskGrade.isTruMoveVerified && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-medium w-fit -mt-2 -mb-0.5">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span>TruMove Verified</span>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold text-lg text-foreground leading-tight">
                {data.carrier.dbaName || data.carrier.legalName}
              </h3>
              {data.carrier.dbaName && data.carrier.dbaName !== data.carrier.legalName && (
                <p className="text-xs text-muted-foreground">Legal: {data.carrier.legalName}</p>
              )}
            </div>
            
            {/* DOT & MC Numbers - Prominent */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono font-semibold">
                DOT {data.carrier.dotNumber}
              </Badge>
              {data.carrier.mcNumber && (
                <Badge variant="outline" className="text-xs font-mono">
                  {data.carrier.mcNumber}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Risk Grade - Fixed corner position with tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  'absolute top-3 right-10 flex items-center justify-center w-8 h-8 rounded-lg border-2 font-bold text-sm cursor-help',
                  riskGrade.color
                )}>
                  {riskGrade.grade}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[220px]">
                <div className="text-xs space-y-1">
                  <p className="font-semibold">{riskGrade.label} Safety Grade</p>
                  <p className="text-muted-foreground">
                    {riskGrade.grade === 'A+' && 'Exceptional safety record with top-tier metrics across all categories.'}
                    {riskGrade.grade === 'A' && 'Very good safety profile with minimal concerns.'}
                    {riskGrade.grade === 'B' && 'Good overall safety with some areas for improvement.'}
                    {riskGrade.grade === 'C' && 'Moderate safety performance with notable issues.'}
                    {riskGrade.grade === 'D' && 'Concerning safety record with significant red flags.'}
                    {riskGrade.grade === 'F' && 'High risk carrier with critical safety violations.'}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats - Always visible */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/60">
            <div className="text-xs font-semibold text-slate-900 dark:text-foreground mb-1 whitespace-nowrap">Authority Status</div>
            <AuthorityBadge status={data.authority.commonStatus} />
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/60">
            <div className="text-xs font-semibold text-slate-900 dark:text-foreground mb-1 whitespace-nowrap">BIPD Liability</div>
            <span className="text-sm font-semibold text-foreground">{formatInsurance()}</span>
          </div>
        </div>

        {/* Broker & Contract Authority */}
        {(data.authority.brokerStatus || data.authority.contractStatus) && (
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-muted/20 border border-border/50 text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Common</div>
              <AuthorityStatusChip status={data.authority.commonStatus} />
            </div>
            <div className="p-2 rounded-lg bg-muted/20 border border-border/50 text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Contract</div>
              <AuthorityStatusChip status={data.authority.contractStatus} />
            </div>
            <div className="p-2 rounded-lg bg-muted/20 border border-border/50 text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Broker</div>
              <AuthorityStatusChip status={data.authority.brokerStatus} />
            </div>
          </div>
        )}

        {/* OOS & Operational Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {data.carrier.outOfService === 'Y' && (
            <Badge variant="destructive" className="gap-1 text-xs">
              <Ban className="w-3 h-3" />
              Out of Service{data.carrier.outOfServiceDate ? ` - ${data.carrier.outOfServiceDate}` : ''}
            </Badge>
          )}
          {data.carrier.allowToOperate === 'N' && (
            <Badge variant="destructive" className="gap-1 text-xs">
              <XCircle className="w-3 h-3" />
              Not Allowed to Operate
            </Badge>
          )}
          {data.carrier.allowToOperate === 'Y' && data.carrier.outOfService !== 'Y' && (
            <Badge variant="outline" className="gap-1 text-xs text-green-600 border-green-500/30">
              <CheckCircle2 className="w-3 h-3" />
              Allowed to Operate
            </Badge>
          )}
          {(data.carrier.complaintCount ?? 0) > 0 && (
            <Badge variant="outline" className={cn('gap-1 text-xs', (data.carrier.complaintCount ?? 0) >= 20 ? 'text-amber-600 border-amber-500/30' : 'text-muted-foreground')}>
              <MessageSquareWarning className="w-3 h-3" />
              {data.carrier.complaintCount} complaint{(data.carrier.complaintCount ?? 0) !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Technical Quick Stats - Compact icons instead of pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-mono">
            <Truck className="w-3.5 h-3.5" />
            {data.fleet.powerUnits} units
          </span>
          <span className="flex items-center gap-1 font-mono">
            <span className="text-muted-foreground">•</span>
            {data.fleet.drivers} drivers
          </span>
          {worstBasic && worstBasic.value! >= 65 && (
            <span className="flex items-center gap-1 font-medium">
              <AlertTriangle className={cn(
                'w-3.5 h-3.5',
                worstBasic.value! >= 75 ? 'text-red-500' : 'text-amber-500'
              )} />
              <span className={worstBasic.value! >= 75 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}>
                {worstBasic.name}: {worstBasic.value}%
              </span>
            </span>
          )}
          {data.crashes.total > 0 && (
            <span className="flex items-center gap-1 font-medium">
              <AlertTriangle className={cn(
                'w-3.5 h-3.5',
                data.crashes.fatal > 0 ? 'text-red-500' : 'text-amber-500'
              )} />
              <span className={data.crashes.fatal > 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}>
                {data.crashes.total} crash{data.crashes.total > 1 ? 'es' : ''}
              </span>
            </span>
          )}
        </div>

        {/* Red Flags Summary */}
        {redFlags.length > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 dark:bg-red-500/10">
            <FileWarning className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span className="text-sm font-bold text-red-600 dark:text-red-400">
              {redFlags.length} Red Flag{redFlags.length > 1 ? 's' : ''} Detected
            </span>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between group"
            >
              <span className="text-sm font-medium">
                {isExpanded ? 'Hide Full Report' : 'View Full Report'}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 transition-transform" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-6 pt-4">
            {/* Red Flags Detail */}
            {redFlags.length > 0 && (
              <>
                <div className="space-y-3 pl-3 border-l-2 border-red-400 dark:border-red-500">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-foreground">
                    <FileWarning className="w-4 h-4 text-red-500" />
                    <span>Red Flag Details</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {redFlags.map((flag, i) => (
                      <RedFlagBadge key={i} message={flag.message} severity={flag.severity} />
                    ))}
                  </div>
                </div>
                <Separator className="bg-border/60" />
              </>
            )}

            {/* Insurance Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-foreground">
                <Shield className="w-4 h-4" />
                <span>Insurance Coverage Analysis</span>
              </div>
              <div className="space-y-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                <InsuranceBar 
                  label="Bodily Injury & Property Damage (BIPD)" 
                  amount={data.authority.bipdInsurance} 
                  required={750000} 
                />
                <InsuranceBar 
                  label="Cargo Insurance" 
                  amount={data.authority.cargoInsurance} 
                  required={100000} 
                />
                {data.authority.bondInsurance && data.authority.bondInsurance !== 'N/A' && (
                  <InsuranceBar 
                    label="Bond / Trust / Surety" 
                    amount={data.authority.bondInsurance} 
                    required={75000} 
                  />
                )}
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* BASIC Scores */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-foreground">
                <AlertTriangle className="w-4 h-4" />
                <span>CSA BASIC Safety Scores</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                <BasicScoreBar 
                  name="Unsafe Driving" 
                  percentile={data.basics.unsafeDriving?.percentile ?? null}
                  deficient={data.basics.unsafeDriving?.rdsvDeficient === 'Y' || data.basics.unsafeDriving?.svDeficient === 'Y'}
                  totalInspectionWithViolation={data.basics.unsafeDriving?.totalInspectionWithViolation}
                  totalViolation={data.basics.unsafeDriving?.totalViolation}
                  snapShotDate={data.basics.unsafeDriving?.snapShotDate}
                />
                <BasicScoreBar 
                  name="HOS Compliance" 
                  percentile={data.basics.hoursOfService?.percentile ?? null}
                  deficient={data.basics.hoursOfService?.rdsvDeficient === 'Y' || data.basics.hoursOfService?.svDeficient === 'Y'}
                  totalInspectionWithViolation={data.basics.hoursOfService?.totalInspectionWithViolation}
                  totalViolation={data.basics.hoursOfService?.totalViolation}
                  snapShotDate={data.basics.hoursOfService?.snapShotDate}
                />
                <BasicScoreBar 
                  name="Vehicle Maintenance" 
                  percentile={data.basics.vehicleMaintenance?.percentile ?? null}
                  deficient={data.basics.vehicleMaintenance?.rdsvDeficient === 'Y' || data.basics.vehicleMaintenance?.svDeficient === 'Y'}
                  totalInspectionWithViolation={data.basics.vehicleMaintenance?.totalInspectionWithViolation}
                  totalViolation={data.basics.vehicleMaintenance?.totalViolation}
                  snapShotDate={data.basics.vehicleMaintenance?.snapShotDate}
                />
                <BasicScoreBar 
                  name="Controlled Substances" 
                  percentile={data.basics.controlledSubstances?.percentile ?? null}
                  deficient={data.basics.controlledSubstances?.rdsvDeficient === 'Y' || data.basics.controlledSubstances?.svDeficient === 'Y'}
                  totalInspectionWithViolation={data.basics.controlledSubstances?.totalInspectionWithViolation}
                  totalViolation={data.basics.controlledSubstances?.totalViolation}
                  snapShotDate={data.basics.controlledSubstances?.snapShotDate}
                />
                <BasicScoreBar 
                  name="Driver Fitness" 
                  percentile={data.basics.driverFitness?.percentile ?? null}
                  deficient={data.basics.driverFitness?.rdsvDeficient === 'Y' || data.basics.driverFitness?.svDeficient === 'Y'}
                  totalInspectionWithViolation={data.basics.driverFitness?.totalInspectionWithViolation}
                  totalViolation={data.basics.driverFitness?.totalViolation}
                  snapShotDate={data.basics.driverFitness?.snapShotDate}
                />
                <BasicScoreBar 
                  name="Crash Indicator" 
                  percentile={data.basics.crashIndicator?.percentile ?? null}
                  deficient={data.basics.crashIndicator?.rdsvDeficient === 'Y' || data.basics.crashIndicator?.svDeficient === 'Y'}
                  totalInspectionWithViolation={data.basics.crashIndicator?.totalInspectionWithViolation}
                  totalViolation={data.basics.crashIndicator?.totalViolation}
                  snapShotDate={data.basics.crashIndicator?.snapShotDate}
                />
                {/* Hazmat Compliance BASIC from scraper */}
                {data.scraped?.basicMeasures?.hazmatCompliance && (
                  <BasicScoreBar 
                    name="Hazmat Compliance" 
                    percentile={data.scraped.basicMeasures.hazmatCompliance.measure}
                  />
                )}
              </div>
            </div>

            {/* OOS Rates vs National Average - from API data directly */}
            {(data.oos.vehicleOosRate > 0 || data.oos.driverOosRate > 0 || (data.oos.hazmatOosRate ?? 0) > 0) && (
              <>
                <Separator className="bg-border/60" />
                <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>OOS Rates vs National Average</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Vehicle', rate: data.oos.vehicleOosRate, avg: data.oos.vehicleOosRateNationalAvg },
                      { label: 'Driver', rate: data.oos.driverOosRate, avg: data.oos.driverOosRateNationalAvg },
                      ...(data.oos.hazmatOosRate != null && data.oos.hazmatOosRate > 0 ? [{ label: 'Hazmat', rate: data.oos.hazmatOosRate, avg: data.oos.hazmatOosRateNationalAvg ?? 4.44 }] : []),
                    ].map(row => {
                      const isAboveAvg = row.rate > row.avg;
                      return (
                        <div key={row.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className={cn('font-mono font-medium', isAboveAvg ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400')}>
                              {row.rate.toFixed(1)}% <span className="text-muted-foreground font-normal">vs {row.avg.toFixed(1)}%</span>
                            </span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
                            <div className="absolute h-full w-px bg-foreground/30" style={{ left: `${Math.min(row.avg, 100)}%` }} />
                            <div 
                              className={cn('h-full rounded-full', isAboveAvg ? 'bg-red-500' : 'bg-green-500')}
                              style={{ width: `${Math.min(row.rate, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Roadside Inspection Breakdown - from API data directly */}
            {((data.oos.vehicleInspections ?? 0) > 0 || (data.oos.driverInspections ?? 0) > 0) && (
              <>
                <Separator className="bg-border/60" />
                <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Roadside Inspections (24 months)</span>
                  </div>
                  <div className="space-y-1">
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider pb-1 border-b border-border/30">
                      <span>Type</span>
                      <span className="text-center">Inspections</span>
                      <span className="text-center">OOS</span>
                    </div>
                    {[
                      { label: 'Vehicle', insp: data.oos.vehicleInspections ?? 0, oos: data.oos.vehicleOosInsp ?? 0 },
                      { label: 'Driver', insp: data.oos.driverInspections ?? 0, oos: data.oos.driverOosInsp ?? 0 },
                      { label: 'Hazmat', insp: data.oos.hazmatInspections ?? 0, oos: data.oos.hazmatOosInsp ?? 0 },
                      ...((data.scraped?.inspectionDetails?.iepInspections ?? 0) > 0 ? [{ label: 'IEP', insp: data.scraped!.inspectionDetails!.iepInspections, oos: 0 }] : []),
                    ].map(row => (
                      <div key={row.label} className="grid grid-cols-3 gap-2 text-sm">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="text-center font-mono text-foreground">{row.insp}</span>
                        <span className={cn('text-center font-mono', row.oos > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground')}>
                          {row.oos}
                        </span>
                      </div>
                    ))}
                    <div className="grid grid-cols-3 gap-2 text-sm pt-1 border-t border-border/30 font-medium">
                      <span className="text-foreground">Total</span>
                      <span className="text-center font-mono text-foreground">{(data.oos.vehicleInspections ?? 0) + (data.oos.driverInspections ?? 0) + (data.oos.hazmatInspections ?? 0) + (data.scraped?.inspectionDetails?.iepInspections ?? 0)}</span>
                      <span className="text-center font-mono text-foreground">{(data.oos.vehicleOosInsp ?? 0) + (data.oos.driverOosInsp ?? 0) + (data.oos.hazmatOosInsp ?? 0)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator className="bg-border/60" />

            {/* Fleet & Crashes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Fleet Details</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Power Units</span>
                    <span className="font-medium font-mono text-foreground">{data.fleet.powerUnits}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Drivers</span>
                    <span className="font-medium font-mono text-foreground">{data.fleet.drivers}</span>
                  </div>
                  {/* Vehicle type breakdown */}
                  {(data.fleet.vanVehicle ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vans</span>
                      <span className="font-medium font-mono text-foreground">{data.fleet.vanVehicle}</span>
                    </div>
                  )}
                  {(data.fleet.busVehicle ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Buses</span>
                      <span className="font-medium font-mono text-foreground">{data.fleet.busVehicle}</span>
                    </div>
                  )}
                  {(data.fleet.motorCoachVehicle ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Motorcoaches</span>
                      <span className="font-medium font-mono text-foreground">{data.fleet.motorCoachVehicle}</span>
                    </div>
                  )}
                  {(data.fleet.limoVehicle ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Limousines</span>
                      <span className="font-medium font-mono text-foreground">{data.fleet.limoVehicle}</span>
                    </div>
                  )}
                  {(data.fleet.miniBusVehicle ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mini-Buses</span>
                      <span className="font-medium font-mono text-foreground">{data.fleet.miniBusVehicle}</span>
                    </div>
                  )}
                  {(data.fleet.passengerVehicle ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Passenger Vehicles</span>
                      <span className="font-medium font-mono text-foreground">{data.fleet.passengerVehicle}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Crash History (24 months)</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fatal</span>
                    <span className={cn('font-medium font-mono', data.crashes.fatal > 0 ? 'text-red-700 dark:text-red-400' : 'text-foreground')}>
                      {data.crashes.fatal}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Injury</span>
                    <span className={cn('font-medium font-mono', data.crashes.injury > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-foreground')}>
                      {data.crashes.injury}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tow-Away</span>
                    <span className="font-medium font-mono text-foreground">{data.crashes.towAway}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cargo Types & Operation Classification */}
            {((data.cargoTypes && data.cargoTypes.length > 0) || (data.operationTypes && data.operationTypes.length > 0)) && (
              <>
                <Separator className="bg-border/60" />
                <div className="grid grid-cols-2 gap-4">
                  {data.cargoTypes && data.cargoTypes.length > 0 && (
                    <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                        <Package className="w-3.5 h-3.5" />
                        <span>Cargo Carried</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {data.cargoTypes.map((cargo, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] font-normal">
                            {cargo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.operationTypes && data.operationTypes.length > 0 && (
                    <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Operation Type</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {data.operationTypes.map((op, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] font-normal">
                            {op}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Docket Numbers */}
            {data.docketNumbers && data.docketNumbers.length > 0 && (
              <>
                <Separator className="bg-border/60" />
                <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                    <Hash className="w-3.5 h-3.5" />
                    <span>Docket Numbers</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.docketNumbers.map((d, i) => (
                      <Badge key={i} variant="outline" className="text-xs font-mono">
                        {d.prefix}-{d.number}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Enhanced SAFER/SMS Data */}
            {data.scraped && !data.scraped.isLoading && (
              <>
                {/* Licensing & Insurance from SMS */}
                {data.scraped.licensingInsurance && (
                  <>
                    <Separator className="bg-border/60" />
                    <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                        <Scale className="w-3.5 h-3.5" />
                        <span>Authority Types</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(['property', 'passenger', 'householdGoods', 'broker'] as const).map(type => {
                          const info = data.scraped!.licensingInsurance![type];
                          const label = type === 'householdGoods' ? 'Household Goods' : type.charAt(0).toUpperCase() + type.slice(1);
                          return (
                            <div key={type} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{label}</span>
                              <span className={cn('font-medium text-xs', info.authorized ? 'text-green-600' : 'text-muted-foreground')}>
                                {info.authorized ? '✓ Yes' : '-'}
                                {info.mcNumber && <span className="ml-1 text-muted-foreground font-mono">({info.mcNumber})</span>}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Summary of Activities from SMS */}
                {data.scraped.summaryOfActivities && (
                  <>
                    <Separator className="bg-border/60" />
                    <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Activity Summary</span>
                      </div>
                      <div className="space-y-1">
                        {data.scraped.summaryOfActivities.mostRecentInvestigation && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Last Investigation</span>
                            <span className="font-medium text-foreground">
                              {data.scraped.summaryOfActivities.mostRecentInvestigation}
                              {data.scraped.summaryOfActivities.mostRecentInvestigationType && (
                                <span className="text-muted-foreground text-xs ml-1">({data.scraped.summaryOfActivities.mostRecentInvestigationType})</span>
                              )}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">With Violations</span>
                          <span className={cn('font-mono font-medium', data.scraped.summaryOfActivities.inspectionsWithViolations > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground')}>
                            {data.scraped.summaryOfActivities.inspectionsWithViolations}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Without Violations</span>
                          <span className="font-mono font-medium text-foreground">{data.scraped.summaryOfActivities.inspectionsWithoutViolations}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Crashes</span>
                          <span className={cn('font-mono font-medium', data.scraped.summaryOfActivities.totalCrashes > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground')}>
                            {data.scraped.summaryOfActivities.totalCrashes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Enforcement Cases */}
                {data.scraped.enforcementCases && (
                  <>
                    <Separator className="bg-border/60" />
                    <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Enforcement Cases (6 years)</span>
                      </div>
                      <p className={cn('text-sm', data.scraped.enforcementCases.toLowerCase().includes('no penalties') ? 'text-green-600' : 'text-amber-600')}>
                        {data.scraped.enforcementCases}
                      </p>
                    </div>
                  </>
                )}

                {/* Insurance Policies from Li-Public */}
                {data.scraped.insurancePolicies && data.scraped.insurancePolicies.length > 0 && (
                  <>
                    <Separator className="bg-border/60" />
                    <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Insurance Policies (L&I Detail)</span>
                      </div>
                      <div className="space-y-2">
                        {data.scraped.insurancePolicies.map((policy, i) => (
                          <div key={i} className="p-2 rounded bg-muted/30 border border-border/30 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-foreground">{policy.type}</span>
                              <Badge variant={policy.status?.toLowerCase() === 'active' ? 'default' : 'destructive'} className="text-[10px] h-5">
                                {policy.status || 'Unknown'}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {policy.insurerName && <div>Insurer: <span className="text-foreground">{policy.insurerName}</span></div>}
                              {policy.policyNumber && <div>Policy #: <span className="font-mono text-foreground">{policy.policyNumber}</span></div>}
                              {policy.coverageAmount && <div>Coverage: <span className="font-medium text-foreground">{policy.coverageAmount}</span></div>}
                              <div className="flex gap-3 mt-0.5">
                                {policy.effectiveDate && <span>Effective: {policy.effectiveDate}</span>}
                                {policy.cancellationDate && <span>Cancelled: <span className="text-red-500">{policy.cancellationDate}</span></span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* BOC-3 Status */}
                {data.scraped.boc3Status && (
                  <>
                    <Separator className="bg-border/60" />
                    <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>BOC-3 Process Agent</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Filing Status</span>
                        <span className={cn('font-medium', 
                          data.scraped.boc3Status.toLowerCase().includes('on file') ? 'text-green-600' : 'text-red-600'
                        )}>
                          {data.scraped.boc3Status}
                        </span>
                      </div>
                      {data.scraped.boc3FilingDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Filing Date</span>
                          <span className="font-mono text-foreground">{data.scraped.boc3FilingDate}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Authority History */}
                {data.scraped.authorityHistory && data.scraped.authorityHistory.length > 0 && (
                  <>
                    <Separator className="bg-border/60" />
                    <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                        <History className="w-3.5 h-3.5" />
                        <span>Authority History</span>
                      </div>
                      <div className="space-y-1.5">
                        {data.scraped.authorityHistory.map((auth, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{auth.type}</span>
                              {auth.mcNumber && <span className="font-mono text-xs text-muted-foreground">{auth.mcNumber}</span>}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant={auth.status?.toLowerCase() === 'active' ? 'default' : 'outline'} className="text-[10px] h-5">
                                {auth.status}
                              </Badge>
                              {auth.grantDate && <span className="text-muted-foreground">{auth.grantDate}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Violation Summary */}
                {data.scraped.violationSummary && data.scraped.violationSummary.totalViolations > 0 && (
                  <>
                    <Separator className="bg-border/60" />
                    <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Violation Summary</span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {data.scraped.violationSummary.totalViolations} total
                        </Badge>
                      </div>
                      {data.scraped.violationSummary.topViolations.length > 0 && (
                        <div className="space-y-1">
                          <div className="grid grid-cols-[1fr_40px_40px] gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider pb-1 border-b border-border/30">
                            <span>Violation</span>
                            <span className="text-center">#</span>
                            <span className="text-center">OOS</span>
                          </div>
                          {data.scraped.violationSummary.topViolations.slice(0, 8).map((v, i) => (
                            <div key={i} className="grid grid-cols-[1fr_40px_40px] gap-1 text-xs">
                              <span className="text-muted-foreground truncate" title={`${v.code} - ${v.description}`}>
                                {v.code}
                              </span>
                              <span className="text-center font-mono text-foreground">{v.count}</span>
                              <span className={cn('text-center font-mono', v.oosCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground')}>
                                {v.oosCount}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Canadian Inspections */}
                {data.scraped.canadianInspections && (data.scraped.canadianInspections.vehicleInspections > 0 || data.scraped.canadianInspections.driverInspections > 0) && (
                  <>
                    <Separator className="bg-border/60" />
                    <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Canadian Inspections</span>
                      </div>
                      <div className="space-y-1">
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider pb-1 border-b border-border/30">
                          <span>Type</span>
                          <span className="text-center">Inspections</span>
                          <span className="text-center">OOS</span>
                        </div>
                        {[
                          { label: 'Vehicle', insp: data.scraped.canadianInspections.vehicleInspections, oos: data.scraped.canadianInspections.vehicleOos },
                          { label: 'Driver', insp: data.scraped.canadianInspections.driverInspections, oos: data.scraped.canadianInspections.driverOos },
                        ].map(row => (
                          <div key={row.label} className="grid grid-cols-3 gap-2 text-sm">
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className="text-center font-mono text-foreground">{row.insp}</span>
                            <span className={cn('text-center font-mono', row.oos > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground')}>{row.oos}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Canadian Crashes */}
                {data.scraped.canadianCrashes && data.scraped.canadianCrashes.total > 0 && (
                  <>
                    <Separator className="bg-border/60" />
                    <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Canadian Crashes</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fatal</span>
                          <span className={cn('font-medium font-mono', data.scraped.canadianCrashes.fatal > 0 ? 'text-red-700 dark:text-red-400' : 'text-foreground')}>{data.scraped.canadianCrashes.fatal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Injury</span>
                          <span className={cn('font-medium font-mono', data.scraped.canadianCrashes.injury > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-foreground')}>{data.scraped.canadianCrashes.injury}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tow-Away</span>
                          <span className="font-medium font-mono text-foreground">{data.scraped.canadianCrashes.towAway}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Additional company info */}
                {(data.scraped.mileage || data.scraped.dunsNumber || data.scraped.entityType || data.scraped.stateCarrierId || data.scraped.operatingAuthorityText) && (
                  <>
                    <Separator className="bg-border/60" />
                    <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground mb-1">
                        <Gauge className="w-3.5 h-3.5" />
                        <span>Additional Details</span>
                      </div>
                      {data.scraped.entityType && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Entity Type</span>
                          <span className="font-medium text-foreground">{data.scraped.entityType}</span>
                        </div>
                      )}
                      {data.scraped.stateCarrierId && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">State Carrier ID</span>
                          <span className="font-mono text-foreground">{data.scraped.stateCarrierId}</span>
                        </div>
                      )}
                      {data.scraped.mileage && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Annual Mileage</span>
                          <span className="font-mono font-medium text-foreground">
                            {parseInt(data.scraped.mileage).toLocaleString()} mi
                            {data.scraped.mileageYear && <span className="text-muted-foreground text-xs ml-1">({data.scraped.mileageYear})</span>}
                          </span>
                        </div>
                      )}
                      {data.scraped.dunsNumber && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">DUNS Number</span>
                          <span className="font-mono text-foreground">{data.scraped.dunsNumber}</span>
                        </div>
                      )}
                      {data.scraped.operatingAuthorityText && (
                        <div className="text-sm mt-1">
                          <span className="text-muted-foreground block text-xs mb-0.5">Operating Authority</span>
                          <span className="text-foreground">{data.scraped.operatingAuthorityText}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Scraped data loading indicator */}
            {data.scraped?.isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 border border-border/50 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading enhanced SAFER, SMS & L&I data...</span>
              </div>
            )}

            {/* Location & Contact */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/20 border border-border/50">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>
                  {data.carrier.address.street && `${data.carrier.address.street}, `}
                  {data.carrier.address.city}, {data.carrier.address.state}
                  {data.carrier.address.zip && ` ${data.carrier.address.zip}`}
                  {data.carrier.address.country && data.carrier.address.country !== 'US' && ` ${data.carrier.address.country}`}
                </span>
              </div>
              {data.carrier.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>{data.carrier.phone}</span>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="flex flex-col gap-1 pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>MCS-150: {formatDate(data.fleet.mcs150Date)}</span>
                </div>
                <span>Safety Rating: {data.safety.rating || 'Not Rated'}</span>
              </div>
              {(data.safety.reviewDate || data.safety.reviewType) && (
                <div className="flex items-center justify-between">
                  {data.safety.reviewDate && <span>Review Date: {formatDate(data.safety.reviewDate)}</span>}
                  {data.safety.reviewType && <span>Review Type: {data.safety.reviewType}</span>}
                </div>
              )}
              {data.safety.ratingDate && (
                <span>Rating Date: {formatDate(data.safety.ratingDate)}</span>
              )}
            </div>

            {/* External Links */}
            <ExternalLinks 
              companyName={data.carrier.legalName} 
              dotNumber={data.carrier.dotNumber} 
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
    </div>
  );
}
