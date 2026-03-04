import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forwarded-for',
};

// Simple in-memory rate limiting (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60000;

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('cf-connecting-ip') || 'unknown';
}

const FMCSA_BASE_URL = 'https://mobile.fmcsa.dot.gov/qc/services';

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
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`FMCSA API error: ${response.status} ${response.statusText} - ${responseText.substring(0, 200)}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

async function searchByName(name: string, webKey: string): Promise<any[]> {
  const searchName = name.trim().replace(/\s+/g, '*');
  const encodedName = encodeURIComponent(searchName);
  const data = await fetchFMCSA(`/carriers/name/${encodedName}`, webKey);
  
  if (data?.content) return Array.isArray(data.content) ? data.content : [];
  if (Array.isArray(data)) return data;
  return [];
}

async function getCarrierByDOT(dotNumber: string, webKey: string): Promise<any> {
  const data = await fetchFMCSA(`/carriers/${dotNumber}`, webKey);
  return data?.content?.carrier || null;
}

async function getCarrierDetails(dotNumber: string, webKey: string): Promise<any> {
  // Fetch all endpoints in parallel
  const [
    carrierData,
    authorityData,
    basicsData,
    oosData,
    cargoData,
    operationData,
    docketData
  ] = await Promise.all([
    fetchFMCSA(`/carriers/${dotNumber}`, webKey),
    fetchFMCSA(`/carriers/${dotNumber}/authority`, webKey),
    fetchFMCSA(`/carriers/${dotNumber}/basics`, webKey),
    fetchFMCSA(`/carriers/${dotNumber}/oos`, webKey),
    fetchFMCSA(`/carriers/${dotNumber}/cargo-carried`, webKey),
    fetchFMCSA(`/carriers/${dotNumber}/operation-classification`, webKey),
    fetchFMCSA(`/carriers/${dotNumber}/docket-numbers`, webKey),
  ]);

  if (!carrierData?.content?.carrier) return null;

  const carrier = carrierData.content.carrier;
  const authority = authorityData?.content?.authorityDetails?.[0] || {};
  const basics = basicsData?.content?.basicsDetails || [];
  const oos = oosData?.content?.oosDetails?.[0] || {};
  const cargoCarried = cargoData?.content?.cargoCarried || [];
  const operationClassification = operationData?.content?.operationClassification || [];
  const docketNumbers = docketData?.content?.docketNumbers || [];

  // Parse BASIC scores with all new fields
  const getBasicScore = (basicName: string) => {
    const basic = basics.find((b: any) => b.basicName?.toLowerCase().includes(basicName.toLowerCase()));
    if (!basic) return null;
    return {
      measure: basic.basicsValue || 0,
      percentile: basic.percentile || 0,
      rdDeficient: basic.rdDeficient || 'N',
      rdsvDeficient: basic.rdsvDeficient || 'N',
      svDeficient: basic.svDeficient || 'N',
      snapShotDate: basic.snapShotDate || '',
      totalInspectionWithViolation: basic.totalInspectionWithViolation || 0,
      totalViolation: basic.totalViolation || 0,
    };
  };

  // Extract MC number
  let mcNumber = '';
  if (carrier.mcNumber) {
    mcNumber = `MC-${carrier.mcNumber}`;
  } else if (docketNumbers.length > 0) {
    const mc = docketNumbers.find((d: any) => d.docketNumberPrefix === 'MC');
    if (mc) mcNumber = `MC-${mc.docketNumber}`;
  }

  // Parse cargo types
  const cargoTypes = cargoCarried.map((c: any) => c.cargoCarriedDesc || c.cargoClassDesc || '').filter(Boolean);

  // Parse operation classifications
  const operationTypes = operationClassification.map((o: any) => o.operationClassDesc || '').filter(Boolean);

  // Parse all docket numbers
  const dockets = docketNumbers.map((d: any) => ({
    prefix: d.docketNumberPrefix || '',
    number: d.docketNumber?.toString() || '',
  }));

  return {
    carrier: {
      legalName: carrier.legalName || '',
      dbaName: carrier.dbaName || '',
      dotNumber: carrier.dotNumber?.toString() || dotNumber,
      mcNumber,
      allowToOperate: carrier.allowedToOperate || carrier.allowToOperate || 'N',
      outOfService: carrier.oosFlag || carrier.outOfService || 'N',
      outOfServiceDate: carrier.oosDate || carrier.outOfServiceDate || '',
      complaintCount: carrier.complaintCount || 0,
      address: {
        street: carrier.phyStreet || '',
        city: carrier.phyCity || '',
        state: carrier.phyState || '',
        zip: carrier.phyZipcode || carrier.phyZip || '',
        country: carrier.phyCountry || 'US',
      },
      phone: carrier.telephone || '',
    },
    authority: {
      commonStatus: authority.commonAuthorityStatus || 'UNKNOWN',
      contractStatus: authority.contractAuthorityStatus || 'NONE',
      brokerStatus: authority.brokerAuthorityStatus || 'NONE',
      bipdInsurance: authority.bipdInsuranceOnFile || '$0',
      cargoInsurance: authority.cargoInsuranceOnFile || '$0',
      bondInsurance: authority.bondInsuranceOnFile || '$0',
    },
    safety: {
      rating: carrier.safetyRating || 'NOT RATED',
      ratingDate: carrier.safetyRatingDate || '',
      reviewDate: carrier.reviewDate || '',
      reviewType: carrier.reviewType || '',
    },
    basics: {
      unsafeDriving: getBasicScore('unsafe'),
      hoursOfService: getBasicScore('hours'),
      vehicleMaintenance: getBasicScore('vehicle'),
      controlledSubstances: getBasicScore('controlled'),
      driverFitness: getBasicScore('fitness'),
      crashIndicator: getBasicScore('crash'),
    },
    oos: {
      vehicleOosRate: parseFloat(oos.vehicleOosRate) || 0,
      vehicleOosRateNationalAvg: parseFloat(oos.vehicleOosRateNationalAvg) || 20.72,
      driverOosRate: parseFloat(oos.driverOosRate) || 0,
      driverOosRateNationalAvg: parseFloat(oos.driverOosRateNationalAvg) || 5.51,
      vehicleInspections: oos.vehicleInsp || 0,
      driverInspections: oos.driverInsp || 0,
    },
    fleet: {
      powerUnits: carrier.totalPowerUnits || 0,
      drivers: carrier.totalDrivers || 0,
      mcs150Date: carrier.mcs150FormDate || '',
      busVehicle: carrier.busVehicle || 0,
      limoVehicle: carrier.limoVehicle || 0,
      miniBusVehicle: carrier.miniBusVehicle || 0,
      motorCoachVehicle: carrier.motorCoachVehicle || 0,
      vanVehicle: carrier.vanVehicle || 0,
      passengerVehicle: carrier.passengerVehicle || 0,
    },
    crashes: {
      fatal: carrier.fatalCrash || 0,
      injury: carrier.injCrash || 0,
      towAway: carrier.towawayCrash || 0,
      total: (carrier.fatalCrash || 0) + (carrier.injCrash || 0) + (carrier.towawayCrash || 0),
    },
    cargoTypes,
    operationTypes,
    docketNumbers: dockets,
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }

    const webKey = Deno.env.get('FMCSA_WEB_KEY');
    if (!webKey) {
      return new Response(
        JSON.stringify({ error: 'FMCSA API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const searchType = url.searchParams.get('type') || 'name';
    const query = url.searchParams.get('q') || '';
    const dot = url.searchParams.get('dot');

    // Full details by DOT
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
      const formatted = results.slice(0, 20).map((c: any) => ({
        dotNumber: c.dotNumber?.toString() || '',
        legalName: c.legalName || '',
        dbaName: c.dbaName || '',
        city: c.phyCity || '',
        state: c.phyState || '',
        phone: c.telephone || '',
      }));
      return new Response(
        JSON.stringify({ results: formatted }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search by DOT
    if (searchType === 'dot' && query) {
      const carrier = await getCarrierByDOT(query, webKey);
      if (!carrier) {
        return new Response(
          JSON.stringify({ results: [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ results: [{ dotNumber: carrier.dotNumber?.toString() || query, legalName: carrier.legalName || '', dbaName: carrier.dbaName || '', city: carrier.hqCity || carrier.phyCity || '', state: carrier.hqState || carrier.phyState || '', phone: carrier.phone || carrier.telephone || '' }] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search by MC
    if (searchType === 'mc' && query) {
      const mcNumber = query.replace(/[^0-9]/g, '');
      const data = await fetchFMCSA(`/carriers/docket-number/${mcNumber}`, webKey);
      if (data?.content) {
        const results = Array.isArray(data.content) ? data.content : [data.content];
        const formatted = results.slice(0, 20).map((c: any) => ({
          dotNumber: c.dotNumber?.toString() || c.carrier?.dotNumber?.toString() || '',
          legalName: c.legalName || c.carrier?.legalName || '',
          dbaName: c.dbaName || c.carrier?.dbaName || '',
          city: c.phyCity || c.carrier?.phyCity || '',
          state: c.phyState || c.carrier?.phyState || '',
          phone: c.telephone || c.carrier?.telephone || '',
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
