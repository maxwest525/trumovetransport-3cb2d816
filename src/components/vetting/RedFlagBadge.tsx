import { AlertTriangle, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RedFlagSeverity = 'critical' | 'warning' | 'info';

interface RedFlagBadgeProps {
  message: string;
  severity: RedFlagSeverity;
  className?: string;
}

export function RedFlagBadge({ message, severity, className }: RedFlagBadgeProps) {
  const iconMap = {
    critical: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const iconColorMap = {
    critical: 'text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.5)]',
    warning: 'text-amber-500 drop-shadow-[0_0_3px_rgba(245,158,11,0.5)]',
    info: 'text-blue-500 drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]'
  };

  const Icon = iconMap[severity];

  return (
    <div className={cn(
      'flex items-center gap-1.5 text-xs',
      className
    )}>
      <Icon className={cn("w-4 h-4 shrink-0 stroke-[2.5]", iconColorMap[severity])} />
      <span className="font-semibold text-slate-900 dark:text-slate-100">{message}</span>
    </div>
  );
}

// Helper function to generate red flags from carrier data
export interface CarrierData {
  carrier: {
    allowToOperate?: string;
    outOfService?: string;
    outOfServiceDate?: string;
    complaintCount?: number;
  };
  authority: {
    commonStatus: string;
    contractStatus?: string;
    brokerStatus?: string;
    bipdInsurance: string;
    cargoInsurance: string;
    bondInsurance?: string;
  };
  safety: {
    rating: string;
    reviewDate?: string;
    reviewType?: string;
    ratingDate?: string;
  };
  basics: {
    unsafeDriving: { percentile: number; rdDeficient?: string; rdsvDeficient?: string; svDeficient?: string; snapShotDate?: string; totalInspectionWithViolation?: number; totalViolation?: number } | null;
    hoursOfService: { percentile: number; rdDeficient?: string; rdsvDeficient?: string; svDeficient?: string; snapShotDate?: string; totalInspectionWithViolation?: number; totalViolation?: number } | null;
    vehicleMaintenance: { percentile: number; rdDeficient?: string; rdsvDeficient?: string; svDeficient?: string; snapShotDate?: string; totalInspectionWithViolation?: number; totalViolation?: number } | null;
    controlledSubstances: { percentile: number; rdDeficient?: string; rdsvDeficient?: string; svDeficient?: string; snapShotDate?: string; totalInspectionWithViolation?: number; totalViolation?: number } | null;
    driverFitness: { percentile: number; rdDeficient?: string; rdsvDeficient?: string; svDeficient?: string; snapShotDate?: string; totalInspectionWithViolation?: number; totalViolation?: number } | null;
    crashIndicator: { percentile: number; rdDeficient?: string; rdsvDeficient?: string; svDeficient?: string; snapShotDate?: string; totalInspectionWithViolation?: number; totalViolation?: number } | null;
  };
  oos: {
    vehicleOosRate: number;
    vehicleOosRateNationalAvg: number;
    driverOosRate: number;
    driverOosRateNationalAvg: number;
    hazmatOosRate?: number;
    hazmatOosRateNationalAvg?: number;
    vehicleInspections?: number;
    driverInspections?: number;
    hazmatInspections?: number;
    vehicleOosInsp?: number;
    driverOosInsp?: number;
    hazmatOosInsp?: number;
  };
  fleet: {
    mcs150Date: string;
  };
  crashes: {
    fatal: number;
    total: number;
  };
}

export interface RedFlag {
  message: string;
  severity: RedFlagSeverity;
}

export interface ScrapedData {
  boc3Status?: string;
  boc3FilingDate?: string;
  insurancePolicies?: {
    type: string;
    status: string;
    insurerName?: string;
    policyNumber?: string;
    coverageAmount?: string;
    effectiveDate?: string;
    cancellationDate?: string;
  }[];
  isLoading?: boolean;
}

export function generateRedFlags(data: CarrierData, scraped?: ScrapedData): RedFlag[] {
  const flags: RedFlag[] = [];

  // FMCSA API returns insurance values in thousands (e.g., "75" = $75,000, "750" = $750,000)
  const parseInsurance = (value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, ''));
    return isNaN(num) ? 0 : num * 1000;
  };

  // Determine if this is a broker-only entity (no carrier authority, only broker authority)
  const isBrokerOnly = data.authority.brokerStatus === 'ACTIVE' &&
    (data.authority.commonStatus === 'NONE' || data.authority.commonStatus === 'INACTIVE' || !data.authority.commonStatus) &&
    (data.authority.contractStatus === 'NONE' || data.authority.contractStatus === 'INACTIVE' || !data.authority.contractStatus);

  // Not allowed to operate
  if (data.carrier.allowToOperate === 'N') {
    flags.push({ message: 'NOT allowed to operate', severity: 'critical' });
  }

  // Out of service
  if (data.carrier.outOfService === 'Y') {
    const dateStr = data.carrier.outOfServiceDate ? ` (since ${data.carrier.outOfServiceDate})` : '';
    flags.push({ message: `Out of Service order${dateStr}`, severity: 'critical' });
  }

  // Authority status checks - for brokers, check broker authority instead
  if (isBrokerOnly) {
    if (data.authority.brokerStatus === 'INACTIVE' || data.authority.brokerStatus === 'REVOKED') {
      flags.push({ message: `Broker Authority ${data.authority.brokerStatus}`, severity: 'critical' });
    }
    // Brokers need $75K surety bond, not $750K BIPD
    const bondAmount = parseInsurance(data.authority.bondInsurance || '0');
    if (bondAmount < 75000) {
      flags.push({ message: 'Bond/Surety below $75K broker minimum', severity: 'critical' });
    }
  } else {
    // Carrier authority checks
    if (data.authority.commonStatus === 'INACTIVE' || data.authority.commonStatus === 'NOT AUTHORIZED') {
      flags.push({ message: 'Authority INACTIVE', severity: 'critical' });
    }
    if (data.authority.commonStatus === 'REVOKED') {
      flags.push({ message: 'Authority REVOKED', severity: 'critical' });
    }
    // Carriers need $750K BIPD liability
    const bipdAmount = parseInsurance(data.authority.bipdInsurance);
    if (bipdAmount < 750000) {
      flags.push({ message: 'Liability below $750K minimum', severity: 'critical' });
    }
  }

  // Safety rating
  if (data.safety.rating === 'UNSATISFACTORY') {
    flags.push({ message: 'Unsatisfactory Safety Rating', severity: 'critical' });
  }
  if (data.safety.rating === 'CONDITIONAL') {
    flags.push({ message: 'Conditional Safety Rating', severity: 'warning' });
  }

  // Complaint count
  if (data.carrier.complaintCount && data.carrier.complaintCount >= 20) {
    flags.push({ message: `${data.carrier.complaintCount} FMCSA complaints`, severity: 'warning' });
  } else if (data.carrier.complaintCount && data.carrier.complaintCount >= 50) {
    flags.push({ message: `${data.carrier.complaintCount} FMCSA complaints`, severity: 'critical' });
  }

  // BASIC scores with FMCSA deficiency flags
  const basicChecks = [
    { name: 'Unsafe Driving', data: data.basics.unsafeDriving },
    { name: 'HOS Compliance', data: data.basics.hoursOfService },
    { name: 'Vehicle Maintenance', data: data.basics.vehicleMaintenance },
    { name: 'Controlled Substances', data: data.basics.controlledSubstances },
    { name: 'Driver Fitness', data: data.basics.driverFitness },
    { name: 'Crash Indicator', data: data.basics.crashIndicator }
  ];

  basicChecks.forEach(({ name, data: basicData }) => {
    if (!basicData) return;
    
    // Check FMCSA intervention thresholds
    if (basicData.rdsvDeficient === 'Y') {
      flags.push({ message: `${name}: FMCSA intervention threshold exceeded`, severity: 'critical' });
    } else if (basicData.svDeficient === 'Y') {
      flags.push({ message: `${name}: Serious violation in last 12 months`, severity: 'critical' });
    } else if (basicData.rdDeficient === 'Y') {
      flags.push({ message: `${name}: On-road performance threshold violated`, severity: 'warning' });
    } else if (basicData.percentile >= 75) {
      flags.push({ message: `High ${name} score (${basicData.percentile}%)`, severity: 'critical' });
    } else if (basicData.percentile >= 65) {
      flags.push({ message: `Elevated ${name} (${basicData.percentile}%)`, severity: 'warning' });
    }
  });

  // OOS rates
  if (data.oos.vehicleOosRate > data.oos.vehicleOosRateNationalAvg * 1.5) {
    flags.push({ message: `Vehicle OOS rate ${data.oos.vehicleOosRate.toFixed(1)}% (above avg)`, severity: 'warning' });
  }
  if (data.oos.driverOosRate > data.oos.driverOosRateNationalAvg * 1.5) {
    flags.push({ message: `Driver OOS rate ${data.oos.driverOosRate.toFixed(1)}% (above avg)`, severity: 'warning' });
  }

  // MCS-150 freshness
  if (data.fleet.mcs150Date) {
    const mcsDate = new Date(data.fleet.mcs150Date);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    if (mcsDate < twoYearsAgo) {
      flags.push({ message: 'MCS-150 outdated (2+ years)', severity: 'warning' });
    }
  }

  // Fatal crashes
  if (data.crashes.fatal > 0) {
    flags.push({ message: `${data.crashes.fatal} fatal crash(es) recorded`, severity: 'critical' });
  }

  // Scraped Li-Public data checks
  if (scraped && !scraped.isLoading) {
    // BOC-3 filing missing
    if (scraped.boc3Status) {
      const status = scraped.boc3Status.toLowerCase();
      if (status.includes('no') || status === 'n' || status === 'none' || !status.includes('yes')) {
        flags.push({ message: 'No BOC-3 process agent on file', severity: 'critical' });
      }
    }

    // Cancelled insurance policies
    if (scraped.insurancePolicies && scraped.insurancePolicies.length > 0) {
      const cancelledPolicies = scraped.insurancePolicies.filter(p => {
        const s = (p.status || '').toLowerCase();
        return s.includes('cancel') || s.includes('revoke') || s.includes('expired');
      });
      const activePolicies = scraped.insurancePolicies.filter(p => {
        const s = (p.status || '').toLowerCase();
        return s.includes('active') || s.includes('effective');
      });

      if (cancelledPolicies.length > 0 && activePolicies.length === 0) {
        flags.push({ message: 'All insurance policies cancelled/expired', severity: 'critical' });
      } else if (cancelledPolicies.length > 0) {
        flags.push({ message: `${cancelledPolicies.length} cancelled insurance polic${cancelledPolicies.length === 1 ? 'y' : 'ies'}`, severity: 'warning' });
      }
    }
  }

  return flags;
}
