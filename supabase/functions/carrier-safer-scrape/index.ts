const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ScrapedCarrierData {
  mileage?: string;
  mileageYear?: string;
  dunsNumber?: string;
  entityType?: string;
  mailingAddress?: string;
  stateCarrierId?: string;
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
  enforcementCases?: string;
  summaryOfActivities?: {
    mostRecentInvestigation: string;
    mostRecentInvestigationType: string;
    totalInspections: number;
    inspectionsWithoutViolations: number;
    inspectionsWithViolations: number;
    totalCrashes: number;
  };
  operatingAuthorityText?: string;
}

function parseNumber(str: string): number {
  if (!str) return 0;
  return parseInt(str.replace(/[^0-9]/g, '')) || 0;
}

function parseSaferMarkdown(markdown: string): ScrapedCarrierData {
  const result: ScrapedCarrierData = {};

  // MCS-150 Mileage (Year)
  const mileageMatch = markdown.match(/MCS-150 Mileage \\(Year\\)[:\s|]*\*?\*?([0-9,]+)\s*\((\d{4})\)/i);
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

  // US Inspection details table
  const inspMatch = markdown.match(/Inspections\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*\n\s*\|\s*Out of Service\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)/i);
  if (inspMatch) {
    result.inspectionDetails = {
      vehicleInspections: parseInt(inspMatch[1]) || 0,
      driverInspections: parseInt(inspMatch[2]) || 0,
      hazmatInspections: parseInt(inspMatch[3]) || 0,
      iepInspections: parseInt(inspMatch[4]) || 0,
      vehicleOos: parseInt(inspMatch[5]) || 0,
      driverOos: parseInt(inspMatch[6]) || 0,
      hazmatOos: parseInt(inspMatch[7]) || 0,
      totalInspections: 0,
    };
    // Total inspections from the line above
    const totalMatch = markdown.match(/Total Inspections:\s*([0-9,]+)/i);
    if (totalMatch) {
      result.inspectionDetails.totalInspections = parseNumber(totalMatch[1]);
    }
  }

  // Crashes table
  // Already have from QC API but this confirms

  // Canadian inspection data
  const caSection = markdown.match(/Canadian Inspection results[\s\S]*?Inspection Type\s*\|\s*Vehicle\s*\|\s*Driver\s*\|\s*\n[\s\S]*?Inspections\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*\n\s*\|\s*Out of Service\s*\|\s*(\d+)\s*\|\s*(\d+)/i);
  if (caSection) {
    result.canadianInspections = {
      vehicleInspections: parseInt(caSection[1]) || 0,
      driverInspections: parseInt(caSection[2]) || 0,
      vehicleOos: parseInt(caSection[3]) || 0,
      driverOos: parseInt(caSection[4]) || 0,
    };
  }

  // Canadian crashes
  const caCrashSection = markdown.match(/Crashes results for[\s\S]*?Fatal\s*\|\s*Injury\s*\|\s*Tow\s*\|\s*Total[\s\S]*?Crashes\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)/i);
  if (caCrashSection) {
    result.canadianCrashes = {
      fatal: parseInt(caCrashSection[1]) || 0,
      injury: parseInt(caCrashSection[2]) || 0,
      towAway: parseInt(caCrashSection[3]) || 0,
      total: parseInt(caCrashSection[4]) || 0,
    };
  }

  // Safety Rating section
  const ratingDateMatch = markdown.match(/Rating Date:\s*\|\s*([0-9/]+)/i);
  const reviewDateMatch = markdown.match(/Review Date:\s*\|\s*([0-9/]+)/i);
  const ratingMatch = markdown.match(/Rating:\s*\|\s*(\w+)/i);
  const reviewTypeMatch = markdown.match(/Type:\s*\|\s*([^|]+)/i);
  if (ratingDateMatch || ratingMatch) {
    result.safetyReview = {
      ratingDate: ratingDateMatch?.[1] || '',
      reviewDate: reviewDateMatch?.[1] || '',
      rating: ratingMatch?.[1] || '',
      reviewType: reviewTypeMatch?.[1]?.trim() || '',
    };
  }

  return result;
}

function parseSmsMarkdown(markdown: string): Partial<ScrapedCarrierData> {
  const result: Partial<ScrapedCarrierData> = {};

  // Licensing and Insurance table
  const liSection = markdown.match(/Licensing and Insurance[\s\S]*?\| Type \| Yes\/No \| MC#\/MX# \|[\s\S]*?\| Broker \|[^\n]*/i);
  if (liSection) {
    const section = liSection[0];
    const parseRow = (type: string) => {
      const match = section.match(new RegExp(`${type}\\\\s*\\\\|\\\\s*(Yes|No)\\\\s*\\\\|\\\\s*([^|\\\\n]*)`, 'i'));
      return {
        authorized: match?.[1]?.toLowerCase() === 'yes',
        mcNumber: match?.[2]?.trim() || '',
      };
    };
    result.licensingInsurance = {
      property: parseRow('Property'),
      passenger: parseRow('Passenger'),
      householdGoods: parseRow('Household Goods'),
      broker: parseRow('Broker'),
    };
  }

  // Enforcement Cases
  const enfMatch = markdown.match(/Enforcement Cases[\s\S]*?\n\n([^\n]+)/i);
  if (enfMatch) {
    result.enforcementCases = enfMatch[1].trim();
  }

  // Summary of Activities
  const investMatch = markdown.match(/Most Recent Investigation:\s*\n\s*([0-9/]+)\s*\(([^)]+)\)/i);
  const totalInspMatch = markdown.match(/Total Inspections:\s*\n\s*([0-9,]+)/i);
  const withoutViolMatch = markdown.match(/without Violations.*?:\\s*\n\s*([0-9,]+)/i);
  const withViolMatch = markdown.match(/with Violations.*?:\\s*\n\s*([0-9,]+)/i);
  const totalCrashMatch = markdown.match(/Total Crashes[\s\S]*?:\s*(\d+)/i);

  if (investMatch || totalInspMatch) {
    result.summaryOfActivities = {
      mostRecentInvestigation: investMatch?.[1] || '',
      mostRecentInvestigationType: investMatch?.[2] || '',
      totalInspections: parseNumber(totalInspMatch?.[1] || '0'),
      inspectionsWithoutViolations: parseNumber(withoutViolMatch?.[1] || '0'),
      inspectionsWithViolations: parseNumber(withViolMatch?.[1] || '0'),
      totalCrashes: parseNumber(totalCrashMatch?.[1] || '0'),
    };
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

    console.log(`Scraping SAFER & SMS for DOT# ${dotNumber}`);

    // Scrape both SAFER snapshot and SMS Overview in parallel
    const [saferResponse, smsResponse] = await Promise.all([
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
          formats: ['markdown'],
          onlyMainContent: false,
          waitFor: 3000,
        }),
      }),
    ]);

    let saferData: ScrapedCarrierData = {};
    let smsData: Partial<ScrapedCarrierData> = {};

    if (saferResponse.ok) {
      const saferJson = await saferResponse.json();
      const saferMarkdown = saferJson?.data?.markdown || saferJson?.markdown || '';
      if (saferMarkdown) {
        saferData = parseSaferMarkdown(saferMarkdown);
        console.log('SAFER parsed successfully');
      }
    } else {
      const errText = await saferResponse.text();
      console.error('SAFER scrape failed:', saferResponse.status, errText.substring(0, 200));
    }

    if (smsResponse.ok) {
      const smsJson = await smsResponse.json();
      const smsMarkdown = smsJson?.data?.markdown || smsJson?.markdown || '';
      if (smsMarkdown) {
        smsData = parseSmsMarkdown(smsMarkdown);
        console.log('SMS parsed successfully');
      }
    } else {
      const errText = await smsResponse.text();
      console.error('SMS scrape failed:', smsResponse.status, errText.substring(0, 200));
    }

    // Merge data, SMS takes priority for fields it has
    const mergedData: ScrapedCarrierData = {
      ...saferData,
      ...smsData,
      // Keep saferData fields that smsData doesn't have
      mileage: saferData.mileage,
      mileageYear: saferData.mileageYear,
      dunsNumber: saferData.dunsNumber,
      entityType: saferData.entityType,
      stateCarrierId: saferData.stateCarrierId,
      inspectionDetails: saferData.inspectionDetails,
      canadianInspections: saferData.canadianInspections,
      canadianCrashes: saferData.canadianCrashes,
      operatingAuthorityText: saferData.operatingAuthorityText,
    };

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
