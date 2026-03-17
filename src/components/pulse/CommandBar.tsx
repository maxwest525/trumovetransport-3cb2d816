import React from 'react';
import { Search, Download, Settings, Radio, Wifi, WifiOff, Calendar } from 'lucide-react';
import { usePulse } from '@/hooks/usePulseStore';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

export const CommandBar: React.FC = () => {
  const { searchQuery, setSearchQuery, apiConnected, toggleApiConnected } = usePulse();

  return (
    <header className="sticky top-0 z-50 h-12 flex items-center gap-3 px-4 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-2 shrink-0">
        <Radio className="w-5 h-5 text-primary" />
        <span className="font-bold text-base tracking-tight">Pulse AI</span>
        <span className="flex items-center gap-1 text-[10px] font-medium bg-compliance-pass/15 text-compliance-pass px-1.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-compliance-pass animate-pulse-live" />
          Live
        </span>
      </div>

      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customer, phone, policy ID, agent..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-secondary/60 border border-border/40 rounded-md placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Today</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </Button>

        <div className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full border ${
          apiConnected
            ? 'border-compliance-pass/30 text-compliance-pass bg-compliance-pass/10'
            : 'border-compliance-fail/30 text-compliance-fail bg-compliance-fail/10'
        }`}>
          {apiConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {apiConnected ? 'API Connected' : 'Disconnected'}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Settings className="w-3.5 h-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="end">
            <div className="flex items-center justify-between">
              <span className="text-xs">API Connected</span>
              <Switch checked={apiConnected} onCheckedChange={toggleApiConnected} />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};
