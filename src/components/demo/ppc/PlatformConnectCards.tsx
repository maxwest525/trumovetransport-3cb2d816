import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, Link2, AlertCircle, TrendingUp, TrendingDown,
  RefreshCw, ExternalLink, Settings, Unlink
} from "lucide-react";
import { toast } from "sonner";
import { PlatformOAuthModal } from "./PlatformOAuthModal";
import { useMarketingPreferences } from "@/hooks/useMarketingPreferences";

interface PlatformConnectCardsProps {
  compact?: boolean;
}

const PLATFORM_LOGOS: Record<string, string> = {
  google: '🔍',
  meta: '📘',
  microsoft: '🪟',
  tiktok: '🎵',
};

export function PlatformConnectCards({ compact = false }: PlatformConnectCardsProps) {
  const { preferences, connectPlatform, disconnectPlatform, updatePlatformSync } = useMarketingPreferences();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [oauthModal, setOauthModal] = useState<{ open: boolean; platform: { id: string; name: string; logo: string } | null }>({
    open: false,
    platform: null,
  });

  const platforms = preferences.platformConnections.map(p => ({
    ...p,
    logo: PLATFORM_LOGOS[p.id] || '📊',
    trend: p.connected ? (Math.random() > 0.3 ? 'up' : 'stable') as 'up' | 'down' | 'stable' : undefined,
  }));

  const handleConnect = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      setOauthModal({
        open: true,
        platform: { id: platform.id, name: platform.name, logo: platform.logo },
      });
    }
  };

  const handleOAuthConnect = (accountData: { accountId: string; accountName: string }) => {
    if (oauthModal.platform) {
      connectPlatform(oauthModal.platform.id, accountData);
      toast.success(`${oauthModal.platform.name} connected!`, {
        description: 'Syncing campaign data...'
      });
    }
  };

  const handleDisconnect = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    disconnectPlatform(platformId);
    toast.success(`${platform?.name} disconnected`);
  };

  const handleRefresh = async (platformId: string) => {
    setSyncing(platformId);
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    updatePlatformSync(platformId);
    setSyncing(null);
    toast.success('Data refreshed');
  };

  if (compact) {
    return (
      <>
        <div className="grid grid-cols-4 gap-2">
          {platforms.map(platform => (
            <div
              key={platform.id}
              className={`p-2 rounded-lg border text-center transition-all ${
                platform.connected
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-muted/30 hover:border-primary/50'
              }`}
            >
              <span className="text-xl">{platform.logo}</span>
              <p className="text-[10px] font-medium mt-1">{platform.name}</p>
              {platform.connected ? (
                <Badge className="text-[8px] h-4 mt-1 bg-primary/10 text-primary">
                  {platform.roas?.toFixed(1)}x ROAS
                </Badge>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[9px] mt-1 text-primary"
                  onClick={() => handleConnect(platform.id)}
                >
                  Connect
                </Button>
              )}
            </div>
          ))}
        </div>
        
        <PlatformOAuthModal
          open={oauthModal.open}
          onOpenChange={(open) => setOauthModal(prev => ({ ...prev, open }))}
          platform={oauthModal.platform || { id: '', name: '', logo: '' }}
          onConnect={handleOAuthConnect}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            Connected Platforms
          </h3>
          <Badge variant="secondary" className="text-[10px]">
            {platforms.filter(p => p.connected).length}/{platforms.length} Active
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {platforms.map(platform => (
            <Card 
              key={platform.id}
              className={`overflow-hidden transition-all ${
                platform.connected
                  ? 'border-primary/30'
                  : 'border-dashed border-muted-foreground/30 hover:border-primary/50'
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{platform.logo}</span>
                    <div>
                      <p className="font-medium text-sm">{platform.name}</p>
                      {platform.connected && (
                        <p className="text-[10px] text-muted-foreground">
                          Synced {platform.lastSync}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {platform.connected && syncing !== platform.id && (
                    <Badge className="bg-primary/10 text-primary text-[10px]">
                      <Check className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  )}
                  {syncing === platform.id && (
                    <Badge className="bg-blue-500/10 text-blue-600 text-[10px]">
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Syncing
                    </Badge>
                  )}
                </div>

                {platform.connected ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="text-center p-1.5 rounded bg-muted/50">
                        <p className="text-xs font-bold flex items-center justify-center gap-1">
                          {platform.roas?.toFixed(1)}x
                          {platform.trend === 'up' && <TrendingUp className="w-3 h-3 text-primary" />}
                          {platform.trend === 'down' && <TrendingDown className="w-3 h-3 text-destructive" />}
                        </p>
                        <p className="text-[9px] text-muted-foreground">ROAS</p>
                      </div>
                      <div className="text-center p-1.5 rounded bg-muted/50">
                        <p className="text-xs font-bold">${((platform.spend || 0) / 1000).toFixed(1)}K</p>
                        <p className="text-[9px] text-muted-foreground">Spend</p>
                      </div>
                      <div className="text-center p-1.5 rounded bg-muted/50">
                        <p className="text-xs font-bold">{platform.conversions}</p>
                        <p className="text-[9px] text-muted-foreground">Conv</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleRefresh(platform.id)}
                        disabled={syncing === platform.id}
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${syncing === platform.id ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleDisconnect(platform.id)}
                      >
                        <Unlink className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    className="w-full gap-2 h-8 text-xs"
                    onClick={() => handleConnect(platform.id)}
                    style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' }}
                  >
                    <Link2 className="w-3 h-3" />
                    Connect {platform.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <PlatformOAuthModal
        open={oauthModal.open}
        onOpenChange={(open) => setOauthModal(prev => ({ ...prev, open }))}
        platform={oauthModal.platform || { id: '', name: '', logo: '' }}
        onConnect={handleOAuthConnect}
      />
    </>
  );
}
