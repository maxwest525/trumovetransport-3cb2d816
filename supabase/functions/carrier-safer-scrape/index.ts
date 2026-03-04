const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface InsurancePolicy {
  type: string;
  insurerName: string;
  policyNumber: string;
  coverageAmount: string;
  effectiveDate: string;
  cancellationDate: string;
  status: string;
}

interface AuthorityHistoryEntry {
  type: string;
  mcNumber: string;
  status: string;
  grantDate: string;
  revokeDate?: string;
}

interface ScrapedCarrierData {
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
  safetyReview?: {
    ratingDate: string;
    reviewDate: string;
    rating: string;
    reviewType: string;
  };
  licensingInsurance?: {
    property: { authorized: boolean; mcNumber: string };
    passenger: { authorized: boolean; mcNumber: string };
    householdGoods: { authorized: boolean; mcNumber: string };
    broker: { authorized: boolean; mcNumber: string };
  };
  insurancePolicies?: InsurancePolicy[];
  boc3Status?: string;
  boc3FilingDate?: string;
  authorityHistory?: AuthorityHistoryEntry[];
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
}

// JSON extraction schema for SMS Overview page
const smsJsonSchema = {
  type: "object",
  properties: {
    carrierName: { type: "string" },
    dotNumber: { type: "string" },
    address: { type: "string" },
    numberOfVehicles: { type: "number" },
    numberOfDrivers: { type: "number" },
    numberOfInspections: { type: "number" },
    safetyRating: { type: "string" },
    oosRates: {
      type: "object",
      properties: {
        vehicleOosPercent: { type: "number" },
        vehicleNationalAvg: { type: "number" },
        driverOosPercent: { type: "number" },
        driverNationalAvg: { type: "number" },
        hazmatOosPercent: { type: "number" },
        hazmatNationalAvg: { type: "number" },
      }
    },
    licensingInsurance: {
      type: "object",
      properties: {
        property: { type: "object", properties: { authorized: { type: "boolean" }, mcNumber: { type: "string" } } },
        passenger: { type: "object", properties: { authorized: { type: "boolean" }, mcNumber: { type: "string" } } },
        householdGoods: { type: "object", properties: { authorized: { type: "boolean" }, mcNumber: { type: "string" } } },
        broker: { type: "object", properties: { authorized: { type: "boolean" }, mcNumber: { type: "string" } } },
      }
    },
    basicMeasures: {
      type: "object",
      properties: {
        unsafeDriving: { type: "object", properties: { measure: { type: "number" }, inspectionsWithViolations: { type: "number" } } },
        hosCompliance: { type: "object", properties: { measure: { type: "number" }, inspectionsWithViolations: { type: "number" }, relevantInspections: { type: "number" } } },
        vehicleMaintenance: { type: "object", properties: { measure: { type: "number" }, inspectionsWithViolations: { type: "number" }, relevantInspections: { type: "number" } } },
        controlledSubstances: { type: "object", properties: { measure: { type: "number" }, inspectionsWithViolations: { type: "number" } } },
        driverFitness: { type: "object", properties: { measure: { type: "number" }, inspectionsWithViolations: { type: "number" }, relevantInspections: { type: "number" } } },
        crashIndicator: { type: "object", properties: { measure: { type: "number" } } },
        hazmatCompliance: { type: "object", properties: { measure: { type: "number" } } },
      }
    },
    totalViolations: { type: "number" },
    topViolations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          code: { type: "string" },
          description: { type: "string" },
          count: { type: "number" },
          oosCount: { type: "number" },
          basic: { type: "string" },
        }
      }
    },
    enforcementCases: { type: "string" },
    summaryTotalInspections: { type: "number" },
    summaryInspectionsWithoutViolations: { type: "number" },
    summaryInspectionsWithViolations: { type: "number" },
    summaryTotalCrashes: { type: "number" },
  }
};

// JSON extraction schema for Li-Public page
const liPublicJsonSchema = {
  type: "object",
  properties: {
    carrierName: { type: "string" },
    dotNumber: { type: "string" },
    boc3Status: { type: "string" },
    boc3FilingDate: { type: "string" },
    insurancePolicies: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", description: "Type of insurance e.g. BIPD, Cargo, Bond" },
          insurerName: { type: "string" },
          policyNumber: { type: "string" },
          coverageAmount: { type: "string" },
          effectiveDate: { type: "string" },
          cancellationDate: { type: "string" },
          status: { type: "string", description: "Active, Cancelled, Expired etc." },
        }
      }
    },
    authorityHistory: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", description: "Common, Contract, Broker" },
          mcNumber: { type: "string" },
          status: { type: "string" },
          grantDate: { type: "string" },
          revokeDate: { type: "string" },
        }
      }
    },
  }
};

function parseNumber(str: string): number {
  if (!str) return 0;
  return parseInt(str.replace(/[^0-9]/g, '')) || 0;
}

function parseSaferMarkdown(markdown: string): Partial<ScrapedCarrierData> {
  const result: Partial<ScrapedCarrierData> = {};

  // MCS-150 Mileage (Year)
  const mileageMatch = markdown.match(/MCS-150 Mileage\s*\(?Year\)?[:\s|]*\*?\*?([0-9,]+)\s*\((\d{4})\)/i);
  if (mileageMatch) {
    result.mileage = mileageMatch[1].replace(/,/g, '');
    result.mileageYear = mileageMatch[2];
  }

  // DUNS Number
  const dunsMatch = markdown.match(/DUNS Number[:\s|]*([0-9-]+)/i);
  if (dunsMatch) {
    result.dunsNumber = dunsMatch[1];
  }

  // Entity Type
  const entityMatch = markdown.match(/Entity Type[:\s|]*([A-Z ]+?)[\s|]/i);
  if (entityMatch) {
    result.entityType = entityMatch[1].trim();
  }

  // State Carrier ID
  const stateIdMatch = markdown.match(/State Carrier ID Number[:\s|]*([^\s|]+)/i);
  if (stateIdMatch && stateIdMatch[1].trim()) {
    result.stateCarrierId = stateIdMatch[1].trim();
  }

  // Operating Authority Status text
  const authMatch = markdown.match(/Operating Authority Status[:\s|]*(AUTHORIZED FOR [^|*\n]+)/i);
  if (authMatch) {
    result.operatingAuthorityText = authMatch[1].trim();
  }

  return result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dotNumber } = await req.json();

    if (!dotNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'DOT number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scraping SAFER, SMS & Li-Public for DOT# ${dotNumber}`);

    // Scrape SAFER snapshot (markdown), SMS Overview (JSON extraction), and Li-Public (JSON extraction) in parallel
    const [saferResponse, smsResponse, liPublicResponse] = await Promise.all([
      fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${dotNumber}`,
          formats: ['markdown'],
          onlyMainContent: false,
          waitFor: 2000,
        }),
      }),
      fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `https://ai.fmcsa.dot.gov/SMS/Carrier/${dotNumber}/Overview.aspx`,
          formats: [{ type: 'json', schema: smsJsonSchema, prompt: 'Extract all carrier safety data, OOS rates with national averages, BASIC measures with violation counts, licensing/insurance authority types, violation summary with top violations, enforcement cases, and activity summary from this FMCSA SMS Overview page.' }],
          onlyMainContent: false,
          waitFor: 3000,
        }),
      }),
      fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `https://li-public.fmcsa.dot.gov/LIVIEW/pkg_carrquery.prc_getdetail?pv_aession_id=&pn_dotno=${dotNumber}`,
          formats: [{ type: 'json', schema: liPublicJsonSchema, prompt: 'Extract all insurance policy details including insurer names, policy numbers, coverage amounts, effective/cancellation dates, BOC-3 process agent filing status and date, and authority grant/revoke history from this FMCSA Licensing & Insurance page.' }],
          onlyMainContent: false,
          waitFor: 3000,
        }),
      }).catch(err => {
        console.error('Li-Public scrape request failed:', err);
        return null;
      }),
    ]);

    let mergedData: ScrapedCarrierData = {};

    // Parse SAFER markdown
    if (saferResponse.ok) {
      const saferJson = await saferResponse.json();
      const saferMarkdown = saferJson?.data?.markdown || saferJson?.markdown || '';
      if (saferMarkdown) {
        const saferData = parseSaferMarkdown(saferMarkdown);
        mergedData = { ...mergedData, ...saferData };
        console.log('SAFER parsed successfully');
      }
    } else {
      const errText = await saferResponse.text();
      console.error('SAFER scrape failed:', saferResponse.status, errText.substring(0, 200));
    }

    // Parse SMS JSON extraction
    if (smsResponse.ok) {
      const smsJson = await smsResponse.json();
      const smsData = smsJson?.data?.json || smsJson?.json || smsJson?.data?.extract || null;
      console.log('SMS raw response keys:', Object.keys(smsJson?.data || smsJson || {}));
      
      if (smsData) {
        console.log('SMS JSON extracted successfully, keys:', Object.keys(smsData));
        
        // OOS rates with national averages
        if (smsData.oosRates) {
          mergedData.oosRatesWithAverages = {
            vehicleOosPercent: smsData.oosRates.vehicleOosPercent || 0,
            vehicleNationalAvg: smsData.oosRates.vehicleNationalAvg || 0,
            driverOosPercent: smsData.oosRates.driverOosPercent || 0,
            driverNationalAvg: smsData.oosRates.driverNationalAvg || 0,
            hazmatOosPercent: smsData.oosRates.hazmatOosPercent || 0,
            hazmatNationalAvg: smsData.oosRates.hazmatNationalAvg || 0,
          };
        }

        // Licensing & Insurance
        if (smsData.licensingInsurance) {
          mergedData.licensingInsurance = smsData.licensingInsurance;
        }

        // BASIC measures
        if (smsData.basicMeasures) {
          mergedData.basicMeasures = smsData.basicMeasures;
        }

        // Violation summary
        if (smsData.totalViolations || smsData.topViolations) {
          mergedData.violationSummary = {
            totalViolations: smsData.totalViolations || 0,
            topViolations: (smsData.topViolations || []).slice(0, 10),
          };
        }

        // Enforcement cases
        if (smsData.enforcementCases) {
          mergedData.enforcementCases = smsData.enforcementCases;
        }

        // Summary of activities
        if (smsData.summaryTotalInspections !== undefined) {
          mergedData.summaryOfActivities = {
            mostRecentInvestigation: '',
            mostRecentInvestigationType: '',
            totalInspections: smsData.summaryTotalInspections || 0,
            inspectionsWithoutViolations: smsData.summaryInspectionsWithoutViolations || 0,
            inspectionsWithViolations: smsData.summaryInspectionsWithViolations || 0,
            totalCrashes: smsData.summaryTotalCrashes || 0,
          };
        }

        // Inspection details from SMS
        if (smsData.numberOfInspections) {
          mergedData.inspectionDetails = {
            totalInspections: smsData.numberOfInspections || 0,
            vehicleInspections: smsData.basicMeasures?.vehicleMaintenance?.relevantInspections || 0,
            vehicleOos: 0,
            driverInspections: smsData.numberOfInspections || 0,
            driverOos: 0,
            hazmatInspections: 0,
            hazmatOos: 0,
            iepInspections: 0,
          };
        }
      } else {
        // Fallback: try markdown parsing
        const smsMarkdown = smsJson?.data?.markdown || smsJson?.markdown || '';
        if (smsMarkdown) {
          console.log('SMS: Falling back to markdown parsing');
          // Basic markdown fallback for enforcement
          const enfMatch = smsMarkdown.match(/Enforcement Cases[\s\S]*?\n\n([^\n]+)/i);
          if (enfMatch) mergedData.enforcementCases = enfMatch[1].trim();
        }
      }
    } else {
      const errText = await smsResponse.text();
      console.error('SMS scrape failed:', smsResponse.status, errText.substring(0, 200));
    }

    // Parse Li-Public JSON extraction
    if (liPublicResponse && liPublicResponse.ok) {
      const liJson = await liPublicResponse.json();
      const liData = liJson?.data?.json || liJson?.json || liJson?.data?.extract || null;
      
      if (liData) {
        console.log('Li-Public JSON extracted successfully, keys:', Object.keys(liData));
        
        if (liData.boc3Status) {
          mergedData.boc3Status = liData.boc3Status;
        }
        if (liData.boc3FilingDate) {
          mergedData.boc3FilingDate = liData.boc3FilingDate;
        }
        if (liData.insurancePolicies && liData.insurancePolicies.length > 0) {
          mergedData.insurancePolicies = liData.insurancePolicies;
        }
        if (liData.authorityHistory && liData.authorityHistory.length > 0) {
          mergedData.authorityHistory = liData.authorityHistory;
        }
      }
    } else if (liPublicResponse) {
      const errText = await liPublicResponse.text();
      console.error('Li-Public scrape failed:', liPublicResponse?.status, errText.substring(0, 200));
    }

    return new Response(
      JSON.stringify({ success: true, data: mergedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in carrier-safer-scrape:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to scrape' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
