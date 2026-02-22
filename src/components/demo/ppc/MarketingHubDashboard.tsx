import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Layout, TrendingUp, Target,
  DollarSign, BarChart3,
  ChevronRight
} from "lucide-react";
import { TrudyMarketingChat } from "./TrudyMarketingChat";
import { RecentCreations } from "./RecentCreations";
import { cn } from "@/lib/utils";
import { LandingPage } from "./types";

interface MarketingHubDashboardProps {
  onNavigate: (section: string) => void;
  onQuickCreate?: (type: 'ad' | 'landing' | 'campaign') => void;
  liveMode?: boolean;
  stats: {
    totalSpend: number;
    conversions: number;
    activePages: number;
    testsRunning: number;
  };
  recentPages?: LandingPage[];
  onViewPage?: (page: LandingPage) => void;
  onEditPage?: (page: LandingPage) => void;
}

export function MarketingHubDashboard({ 
  onNavigate, 
  onQuickCreate, 
  liveMode = false, 
  stats,
  recentPages = [],
  onViewPage,
  onEditPage
}: MarketingHubDashboardProps) {
  
  const handleCreateLandingPage = () => {
    if (onQuickCreate) {
      onQuickCreate('landing');
    }
  };

  const handleViewPage = (page: LandingPage) => {
    if (onViewPage) {
      onViewPage(page);
    } else {
      onNavigate('manage');
    }
  };

  const handleEditPage = (page: LandingPage) => {
    if (onEditPage) {
      onEditPage(page);
    } else {
      onNavigate('manage');
    }
  };

  return (
    <div className="flex h-full">
      {/* Left: Chat Interface - Takes Most of the Space (SMS-style) */}
      <div className="flex-1 flex flex-col min-w-0">
        <TrudyMarketingChat 
          onNavigate={onNavigate}
          onCreateLandingPage={handleCreateLandingPage}
        />
      </div>

      {/* Right: Compact Stats Sidebar */}
      <div className="w-[240px] border-l border-border bg-muted/20 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2.5 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Quick Stats</span>
            {liveMode && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-red-500/10 text-red-500 gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </Badge>
            )}
          </div>
        </div>

        {/* Stats List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Stats Cards */}
          <div className="space-y-2">
            {[
              { label: 'Total Spend', value: `$${stats.totalSpend.toLocaleString()}`, icon: DollarSign, color: 'hsl(var(--primary))' },
              { label: 'Conversions', value: stats.conversions.toString(), icon: Target, color: 'hsl(var(--primary))' },
              { label: 'Active Pages', value: stats.activePages.toString(), icon: Layout, color: 'hsl(217 91% 60%)' },
              { label: 'Tests Running', value: stats.testsRunning.toString(), icon: BarChart3, color: 'hsl(330 81% 60%)' },
            ].map((stat) => (
              <div 
                key={stat.label} 
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background border border-border cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => onNavigate('performance')}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}
                >
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Creations */}
          {recentPages.length > 0 && (
            <RecentCreations 
              pages={recentPages}
              onView={handleViewPage}
              onEdit={handleEditPage}
            />
          )}
        </div>

        {/* Quick Links */}
        <div className="p-3 border-t border-border space-y-2">
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-all group"
            onClick={() => onNavigate('performance')}
          >
            <CardContent className="p-2.5 flex items-center gap-2">
              <div 
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-primary/10"
              >
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors flex-1">Analytics</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-all group"
            onClick={() => onNavigate('landing')}
          >
            <CardContent className="p-2.5 flex items-center gap-2">
              <div 
                 className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-primary/10"
               >
                 <Layout className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors flex-1">Pages ({stats.activePages})</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
