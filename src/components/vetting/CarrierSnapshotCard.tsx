import { useState } from 'react';
import { Phone, MapPin, Truck, Shield, AlertTriangle, CheckCircle2, XCircle, Calendar, FileWarning, X, ChevronDown, ChevronUp, ExternalLink, Star, Ban, MessageSquareWarning, Package, Briefcase, Hash } from 'lucide-react';
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
  const bipdAmount = parseInt(data.authority.bipdInsurance?.replace(/[^0-9]/g, '') || '0');
  const cargoAmount = parseInt(data.authority.cargoInsurance?.replace(/[^0-9]/g, '') || '0');
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

function BasicScoreBar({ name, percentile, threshold = 65 }: { name: string; percentile: number | null; threshold?: number }) {
  if (percentile === null) {
    return (
      <div className="flex items-center justify-between py-1.5">
        <span className="text-xs text-muted-foreground">{name}</span>
        <span className="text-xs text-muted-foreground">N/A</span>
      </div>
    );
  }

  const getColor = () => {
    if (percentile >= 75) return 'bg-red-500';
    if (percentile >= threshold) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{name}</span>
        <span className={cn(
          'text-xs font-medium',
          percentile >= 75 ? 'text-red-500' : 
          percentile >= threshold ? 'text-amber-500' : 'text-green-500'
        )}>
          {percentile}%
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn('h-full rounded-full transition-all', getColor())}
          style={{ width: `${Math.min(percentile, 100)}%` }}
        />
      </div>
    </div>
  );
}

function InsuranceBar({ label, amount, required }: { label: string; amount: string; required: number }) {
  const parseAmount = (value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, ''));
    return isNaN(num) ? 0 : num;
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
  const redFlags = generateRedFlags(data);
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
    const bipdAmount = parseInt(data.authority.bipdInsurance?.replace(/[^0-9]/g, '') || '0');
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

        {/* OOS & Operational Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {data.carrier.outOfService === 'Y' && (
            <Badge variant="destructive" className="gap-1 text-xs">
              <Ban className="w-3 h-3" />
              Out of Service{data.carrier.outOfServiceDate ? ` — ${data.carrier.outOfServiceDate}` : ''}
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
                />
                <BasicScoreBar 
                  name="HOS Compliance" 
                  percentile={data.basics.hoursOfService?.percentile ?? null} 
                />
                <BasicScoreBar 
                  name="Vehicle Maintenance" 
                  percentile={data.basics.vehicleMaintenance?.percentile ?? null} 
                />
                <BasicScoreBar 
                  name="Controlled Substances" 
                  percentile={data.basics.controlledSubstances?.percentile ?? null} 
                />
                <BasicScoreBar 
                  name="Driver Fitness" 
                  percentile={data.basics.driverFitness?.percentile ?? null} 
                />
                <BasicScoreBar 
                  name="Crash Indicator" 
                  percentile={data.basics.crashIndicator?.percentile ?? null} 
                />
              </div>
            </div>

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

            {/* Location & Contact */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/20 border border-border/50">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{data.carrier.address.city}, {data.carrier.address.state}</span>
              </div>
              {data.carrier.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>{data.carrier.phone}</span>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>MCS-150: {formatDate(data.fleet.mcs150Date)}</span>
              </div>
              <span>Safety Rating: {data.safety.rating || 'Not Rated'}</span>
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
