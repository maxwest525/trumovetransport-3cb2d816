import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forwarded-for',
};

// Simple in-memory rate limiting (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW = 60000; // 1 minute in ms

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('cf-connecting-ip') || 
         'unknown';
}

const FMCSA_BASE_URL = 'https://mobile.fmcsa.dot.gov/qc/services';

interface FMCSACarrierBasic {
  dotNumber: string;
  legalName: string;
  dbaName: string;
  carrierOperation: string;
  hqCountry: string;
  hqState: string;
  hqCity: string;
  hqZip: string;
  phone: string;
  mcs150FormDate: string;
  powerUnits: number;
  drivers: number;
}

interface CarrierResponse {
  carrier: {
    legalName: string;
    dbaName: string;
    dotNumber: string;
    mcNumber: string;
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
    unsafeDriving: { measure: number; percentile: number } | null;
    hoursOfService: { measure: number; percentile: number } | null;
    vehicleMaintenance: { measure: number; percentile: number } | null;
    controlledSubstances: { measure: number; percentile: number } | null;
    driverFitness: { measure: number; percentile: number } | null;
    crashIndicator: { measure: number; percentile: number } | null;
  };
  oos: {
    vehicleOosRate: number;
    vehicleOosRateNationalAvg: number;
    driverOosRate: number;
    driverOosRateNationalAvg: number;
    vehicleInspections: number;
    driverInspections: number;
  };
  fleet: {
    powerUnits: number;
    drivers: number;
    mcs150Date: string;
  };
  crashes: {
    fatal: number;
    injury: number;
    towAway: number;
    total: number;
  };
}

async function fetchFMCSA(endpoint: string, webKey: string): Promise<any> {
  const url = `${FMCSA_BASE_URL}${endpoint}?webKey=${webKey}`;
  console.log(`Fetching FMCSA URL: ${url.replace(webKey, 'HIDDEN')}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; CarrierVettingApp/1.0)',
        'Referer': 'https://mobile.fmcsa.dot.gov/qc/services/',
      }
    });
    
    console.log(`FMCSA Response status: ${response.status}`);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`FMCSA API error: ${response.status} ${response.statusText} - ${responseText.substring(0, 200)}`);
      return null;
    }
    const data = await response.json();
    console.log(`FMCSA Response data keys: ${Object.keys(data).join(', ')}`);
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

async function searchByName(name: string, webKey: string): Promise<any[]> {
  // FMCSA name search - try with asterisk wildcard for partial matching
  const searchName = name.trim().replace(/\s+/g, '*');
  const encodedName = encodeURIComponent(searchName);
  console.log(`Searching by name: "${name}" -> encoded: "${encodedName}"`);
  
  const data = await fetchFMCSA(`/carriers/name/${encodedName}`, webKey);
  
  if (data?.content) {
    console.log(`Found ${data.content.length} results`);
    return data.content;
  }
  
  // If no content array, check if it's wrapped differently
  if (Array.isArray(data)) {
    console.log(`Found ${data.length} results (array format)`);
    return data;
  }
  
  console.log('No results found in FMCSA response');
  return [];
}

async function getCarrierByDOT(dotNumber: string, webKey: string): Promise<FMCSACarrierBasic | null> {
  const data = await fetchFMCSA(`/carriers/${dotNumber}`, webKey);
  return data?.content?.carrier || null;
}

async function getCarrierDetails(dotNumber: string, webKey: string): Promise<CarrierResponse | null> {
  // Fetch all data in parallel
  const [
    carrierData,
    authorityData,
    basicsData,
    oosData
  ] = await Promise.all([
    fetchFMCSA(`/carriers/${dotNumber}`, webKey),
    fetchFMCSA(`/carriers/${dotNumber}/authority`, webKey),
    fetchFMCSA(`/carriers/${dotNumber}/basics`, webKey),
    fetchFMCSA(`/carriers/${dotNumber}/oos`, webKey)
  ]);

  if (!carrierData?.content?.carrier) {
    return null;
  }

  const carrier = carrierData.content.carrier;
  const authority = authorityData?.content?.authorityDetails?.[0] || {};
  const basics = basicsData?.content?.basicsDetails || [];
  const oos = oosData?.content?.oosDetails?.[0] || {};

  // Parse BASIC scores
  const getBasicScore = (basicName: string) => {
    const basic = basics.find((b: any) => b.basicName?.toLowerCase().includes(basicName.toLowerCase()));
    if (!basic) return null;
    return {
      measure: basic.basicsValue || 0,
      percentile: basic.percentile || 0
    };
  };

  // Extract MC number from carrier operation description or dba name
  let mcNumber = '';
  if (carrier.mcNumber) {
    mcNumber = `MC-${carrier.mcNumber}`;
  }

  return {
    carrier: {
      legalName: carrier.legalName || '',
      dbaName: carrier.dbaName || '',
      dotNumber: carrier.dotNumber?.toString() || dotNumber,
      mcNumber: mcNumber,
      address: {
        street: carrier.phyStreet || '',
        city: carrier.phyCity || '',
        state: carrier.phyState || '',
        zip: carrier.phyZipcode || '',
        country: carrier.phyCountry || 'US'
      },
      phone: carrier.telephone || ''
    },
    authority: {
      commonStatus: authority.commonAuthorityStatus || 'UNKNOWN',
      contractStatus: authority.contractAuthorityStatus || 'NONE',
      brokerStatus: authority.brokerAuthorityStatus || 'NONE',
      bipdInsurance: authority.bipdInsuranceOnFile || '$0',
      cargoInsurance: authority.cargoInsuranceOnFile || '$0',
      bondInsurance: authority.bondInsuranceOnFile || '$0'
    },
    safety: {
      rating: carrier.safetyRating || 'NOT RATED',
      ratingDate: carrier.safetyRatingDate || '',
      reviewDate: carrier.reviewDate || '',
      reviewType: carrier.reviewType || ''
    },
    basics: {
      unsafeDriving: getBasicScore('unsafe'),
      hoursOfService: getBasicScore('hours'),
      vehicleMaintenance: getBasicScore('vehicle'),
      controlledSubstances: getBasicScore('controlled'),
      driverFitness: getBasicScore('fitness'),
      crashIndicator: getBasicScore('crash')
    },
    oos: {
      vehicleOosRate: parseFloat(oos.vehicleOosRate) || 0,
      vehicleOosRateNationalAvg: parseFloat(oos.vehicleOosRateNationalAvg) || 20.72,
      driverOosRate: parseFloat(oos.driverOosRate) || 0,
      driverOosRateNationalAvg: parseFloat(oos.driverOosRateNationalAvg) || 5.51,
      vehicleInspections: oos.vehicleInsp || 0,
      driverInspections: oos.driverInsp || 0
    },
    fleet: {
      powerUnits: carrier.totalPowerUnits || 0,
      drivers: carrier.totalDrivers || 0,
      mcs150Date: carrier.mcs150FormDate || ''
    },
    crashes: {
      fatal: carrier.fatalCrash || 0,
      injury: carrier.injCrash || 0,
      towAway: carrier.towawayCrash || 0,
      total: (carrier.fatalCrash || 0) + (carrier.injCrash || 0) + (carrier.towawayCrash || 0)
    }
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }

    const webKey = Deno.env.get('FMCSA_WEB_KEY');
    if (!webKey) {
      console.error('FMCSA_WEB_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'FMCSA API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const searchType = url.searchParams.get('type') || 'name';
    const query = url.searchParams.get('q') || '';
    const dot = url.searchParams.get('dot');

    console.log(`Carrier lookup request: type=${searchType}, q=${query}, dot=${dot}`);

    // If DOT number provided, get full details
    if (dot) {
      const details = await getCarrierDetails(dot, webKey);
      if (!details) {
        return new Response(
          JSON.stringify({ error: 'Carrier not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify(details),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search by name
    if (searchType === 'name' && query) {
      const results = await searchByName(query, webKey);
      // Limit and format results for search
      const formatted = results.slice(0, 20).map((c: any) => ({
        dotNumber: c.dotNumber?.toString() || '',
        legalName: c.legalName || '',
        dbaName: c.dbaName || '',
        city: c.phyCity || '',
        state: c.phyState || '',
        phone: c.telephone || ''
      }));
      
      // If no results and FMCSA returned empty, suggest DOT search
      if (formatted.length === 0) {
        console.log('No results from FMCSA name search - API may be having issues');
      }
      
      return new Response(
        JSON.stringify({ results: formatted }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search by DOT number
    if (searchType === 'dot' && query) {
      const carrier = await getCarrierByDOT(query, webKey);
      if (!carrier) {
        return new Response(
          JSON.stringify({ results: [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ 
          results: [{
            dotNumber: carrier.dotNumber?.toString() || query,
            legalName: carrier.legalName || '',
            dbaName: carrier.dbaName || '',
            city: carrier.hqCity || '',
            state: carrier.hqState || '',
            phone: carrier.phone || ''
          }]
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search by MC number
    if (searchType === 'mc' && query) {
      // MC number search - FMCSA API uses docket number endpoint
      const mcNumber = query.replace(/[^0-9]/g, ''); // Strip non-numeric chars
      console.log(`Searching by MC number: ${mcNumber}`);
      
      const data = await fetchFMCSA(`/carriers/docket-number/${mcNumber}`, webKey);
      
      if (data?.content) {
        const results = Array.isArray(data.content) ? data.content : [data.content];
        const formatted = results.slice(0, 20).map((c: any) => ({
          dotNumber: c.dotNumber?.toString() || c.carrier?.dotNumber?.toString() || '',
          legalName: c.legalName || c.carrier?.legalName || '',
          dbaName: c.dbaName || c.carrier?.dbaName || '',
          city: c.phyCity || c.carrier?.phyCity || '',
          state: c.phyState || c.carrier?.phyState || '',
          phone: c.telephone || c.carrier?.telephone || ''
        })).filter((c: any) => c.dotNumber);
        
        return new Response(
          JSON.stringify({ results: formatted }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ results: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request. Provide either ?dot=XXXXXXX, ?type=mc&q=XXXXXXX, or ?type=name&q=company_name' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in carrier-lookup:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
