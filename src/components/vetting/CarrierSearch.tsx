import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Building2, Loader2, Hash, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';


interface SearchResult {
  dotNumber: string;
  legalName: string;
  dbaName: string;
  city: string;
  state: string;
  phone: string;
}

interface CarrierSearchProps {
  onSelect: (dotNumber: string) => void;
  className?: string;
  isLoading?: boolean;
}

export function CarrierSearch({ onSelect, className, isLoading: externalLoading }: CarrierSearchProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'dot' | 'mc'>('name');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const fmcsaKeyRef = useRef<string | null>(null);
  
  const isLoading = isSearching || externalLoading;

  // Fetch FMCSA key from edge function on mount
  useEffect(() => {
    async function fetchKey() {
      try {
        const { data, error } = await supabase.functions.invoke('get-fmcsa-key');
        if (!error && data?.key) {
          fmcsaKeyRef.current = data.key;
        }
      } catch (e) {
        console.error('Failed to fetch FMCSA key:', e);
      }
    }
    fetchKey();
  }, []);

  const search = useCallback(async (searchQuery: string, type: 'name' | 'dot' | 'mc') => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Call FMCSA API directly from browser to avoid cloud IP blocking
      const FMCSA_BASE = 'https://mobile.fmcsa.dot.gov/qc/services';
      const webKey = fmcsaKeyRef.current;
      if (!webKey) {
        setError('FMCSA API key not available. Please try again.');
        setResults([]);
        setShowResults(true);
        return;
      }
      
      let apiUrl = '';
      if (type === 'name') {
        const encodedName = encodeURIComponent(searchQuery.trim());
        apiUrl = `${FMCSA_BASE}/carriers/name/${encodedName}?webKey=${webKey}`;
      } else if (type === 'dot') {
        apiUrl = `${FMCSA_BASE}/carriers/${searchQuery.trim()}?webKey=${webKey}`;
      } else if (type === 'mc') {
        const mcNumber = searchQuery.trim().replace(/[^0-9]/g, '');
        apiUrl = `${FMCSA_BASE}/carriers/docket-number/${mcNumber}?webKey=${webKey}`;
      }

      const response = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('FMCSA error:', response.status, responseText.substring(0, 200));
        setError('FMCSA search failed. Please try again.');
        setResults([]);
        setShowResults(true);
        return;
      }

      const data = await response.json();

      if (type === 'name') {
        const carriers = data?.content || [];
        const resultList = (Array.isArray(carriers) ? carriers : []).map((c: any) => ({
          dotNumber: c.dotNumber?.toString() || '',
          legalName: c.legalName || '',
          dbaName: c.dbaName || '',
          city: c.phyCity || '',
          state: c.phyState || '',
          phone: c.telephone || '',
        })).filter((c: SearchResult) => c.dotNumber);
        setResults(resultList.slice(0, 20));
        if (resultList.length === 0) {
          setError('No carriers found matching that name');
        }
      } else if (type === 'dot') {
        const carrier = data?.content?.carrier;
        if (carrier) {
          setResults([{
            dotNumber: carrier.dotNumber?.toString() || searchQuery,
            legalName: carrier.legalName || '',
            dbaName: carrier.dbaName || '',
            city: carrier.phyCity || '',
            state: carrier.phyState || '',
            phone: carrier.telephone || '',
          }]);
        } else {
          setResults([]);
          setError('No carrier found with that DOT number');
        }
      } else if (type === 'mc') {
        const content = data?.content;
        const carriers = Array.isArray(content) ? content : content?.carrier ? [content.carrier] : [];
        const resultList = carriers.map((c: any) => ({
          dotNumber: c.dotNumber?.toString() || '',
          legalName: c.legalName || '',
          dbaName: c.dbaName || '',
          city: c.phyCity || '',
          state: c.phyState || '',
          phone: c.telephone || '',
        })).filter((c: SearchResult) => c.dotNumber);
        setResults(resultList.slice(0, 20));
        if (resultList.length === 0) {
          setError('No carrier found with that MC number');
        }
      }
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to connect to FMCSA database. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        search(query, searchType);
      }, 300);
    } else {
      setResults([]);
      setShowResults(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchType, search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    onSelect(result.dotNumber);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  // Detect if in sidebar context
  const isSidebar = className?.includes('sidebar-search');

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="space-y-3">
        {/* Search Type Toggle - Compact buttons for sidebar, full for terminal */}
        <div className={cn('flex gap-1.5', isSidebar ? 'flex-wrap' : 'gap-2')}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'rounded-md font-medium transition-all active:scale-95',
              isSidebar ? 'h-7 px-2 text-xs flex-1 min-w-0' : 'h-9 px-3 text-sm',
              isSidebar
                ? (searchType === 'name' 
                    ? 'bg-foreground text-background border-2 border-foreground font-semibold shadow-sm' 
                    : 'bg-transparent text-muted-foreground border border-border hover:bg-muted hover:text-foreground active:bg-muted')
                : (searchType === 'name' 
                    ? 'text-slate-900 dark:text-white border-2 border-slate-900 dark:border-white bg-slate-100 dark:bg-transparent shadow-sm' 
                    : 'text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-400 dark:border-white/20')
            )}
            onClick={() => setSearchType('name')}
          >
            <Building2 className={cn(isSidebar ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1.5')} />
            Name
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'rounded-md font-medium transition-all active:scale-95',
              isSidebar ? 'h-7 px-2 text-xs flex-1 min-w-0' : 'h-9 px-3 text-sm',
              isSidebar
                ? (searchType === 'dot' 
                    ? 'bg-foreground text-background border-2 border-foreground font-semibold shadow-sm' 
                    : 'bg-transparent text-muted-foreground border border-border hover:bg-muted hover:text-foreground active:bg-muted')
                : (searchType === 'dot' 
                    ? 'text-slate-900 dark:text-white border-2 border-slate-900 dark:border-white bg-slate-100 dark:bg-transparent shadow-sm' 
                    : 'text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-400 dark:border-white/20')
            )}
            onClick={() => setSearchType('dot')}
          >
            <Hash className={cn(isSidebar ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1.5')} />
            DOT
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'rounded-md font-medium transition-all active:scale-95',
              isSidebar ? 'h-7 px-2 text-xs flex-1 min-w-0' : 'h-9 px-3 text-sm',
              isSidebar
                ? (searchType === 'mc' 
                    ? 'bg-foreground text-background border-2 border-foreground font-semibold shadow-sm' 
                    : 'bg-transparent text-muted-foreground border border-border hover:bg-muted hover:text-foreground active:bg-muted')
                : (searchType === 'mc' 
                    ? 'text-slate-900 dark:text-white border-2 border-slate-900 dark:border-white bg-slate-100 dark:bg-transparent shadow-sm' 
                    : 'text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-400 dark:border-white/20')
            )}
            onClick={() => setSearchType('mc')}
          >
            <Truck className={cn(isSidebar ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1.5')} />
            MC
          </Button>
        </div>

        {/* Search Input - Full Width */}
        <div className="relative">
          {isSidebar ? (
            <>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={
                  searchType === 'name' 
                    ? 'Company name...' 
                    : searchType === 'dot' 
                      ? 'DOT number...' 
                      : 'MC number...'
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setShowResults(true)}
                className="pl-9 pr-8 h-9 text-sm"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
              )}
            </>
          ) : (
            <>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-white/50" />
              <Input
                type="text"
                placeholder={
                  searchType === 'name' 
                    ? 'Search carrier by company name...' 
                    : searchType === 'dot' 
                      ? 'Enter DOT number...' 
                      : 'Enter MC number...'
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setShowResults(true)}
                className="pl-12 pr-12 h-12 text-base bg-slate-100 dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-primary/50 focus:ring-primary/20"
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-xs text-primary font-mono hidden sm:inline">Querying FMCSA.gov...</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      {showResults && (results.length > 0 || error) && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          {error ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {error}
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.dotNumber}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                  onClick={() => handleSelect(result)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{result.legalName}</p>
                      {result.dbaName && result.dbaName !== result.legalName && (
                        <p className="text-xs text-muted-foreground truncate">DBA: {result.dbaName}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {result.city}, {result.state}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      DOT# {result.dotNumber}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
