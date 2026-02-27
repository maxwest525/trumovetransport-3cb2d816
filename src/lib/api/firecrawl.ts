import { supabase } from '@/integrations/supabase/client';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

type ScrapeOptions = {
  formats?: (
    | 'markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot' | 'branding' | 'summary'
    | { type: 'json'; schema?: object; prompt?: string }
  )[];
  onlyMainContent?: boolean;
  waitFor?: number;
  location?: { country?: string; languages?: string[] };
};

type SearchOptions = {
  limit?: number;
  lang?: string;
  country?: string;
  tbs?: string;
  scrapeOptions?: { formats?: ('markdown' | 'html')[] };
};

type MapOptions = {
  search?: string;
  limit?: number;
  includeSubdomains?: boolean;
};

type CrawlOptions = {
  limit?: number;
  maxDepth?: number;
  includePaths?: string[];
  excludePaths?: string[];
};

export interface ExtractedBranding {
  colorScheme?: string;
  logo?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    textPrimary?: string;
    textSecondary?: string;
  };
  fonts?: { family: string }[];
  typography?: {
    fontFamilies?: { primary?: string; heading?: string; code?: string };
    fontSizes?: { h1?: string; h2?: string; h3?: string; body?: string };
    fontWeights?: { regular?: number; medium?: number; bold?: number };
  };
  spacing?: {
    baseUnit?: number;
    borderRadius?: string;
  };
  components?: {
    buttonPrimary?: { background?: string; textColor?: string; borderRadius?: string };
    buttonSecondary?: { background?: string; textColor?: string; borderRadius?: string };
  };
  images?: {
    logo?: string;
    favicon?: string;
    ogImage?: string;
  };
}

export interface ScrapeResult {
  markdown?: string;
  html?: string;
  screenshot?: string;
  branding?: ExtractedBranding;
  metadata?: {
    title?: string;
    description?: string;
    sourceURL?: string;
  };
}

export const firecrawlApi = {
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse<ScrapeResult>> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    // Handle nested data structure
    const result = data?.data || data;
    return { success: data?.success ?? true, data: result, error: data?.error };
  },

  async search(query: string, options?: SearchOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  async map(url: string, options?: MapOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-map', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  async crawl(url: string, options?: CrawlOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-crawl', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
