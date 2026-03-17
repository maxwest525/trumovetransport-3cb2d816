import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Layout, TrendingUp, Target,
  DollarSign, BarChart3,
  ChevronRight, MessageSquare, Sparkles, Rocket, Wand2,
  Zap, Activity, FlaskConical
} from "lucide-react";
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

  const entryOptions = [
    {
      id: 'trudy',
      title: 'Tell Trudy',
      subtitle: 'Describe what you want and she\'ll build it',
      icon: MessageSquare,
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      glowColor: 'hsl(270 80% 60% / 0.15)',
      action: () => onNavigate('trudy-chat'),
    },
    {
      id: 'manual',
      title: 'Build & Brand',
      subtitle: 'Clone any brand style, pick a template, and publish',
      icon: Wand2,
      gradient: 'from-sky-400 via-cyan-500 to-blue-500',
      glowColor: 'hsl(200 80% 50% / 0.15)',
      action: () => handleCreateLandingPage(),
    },
    {
      id: 'auto',
      title: 'Just Build It For Me',
      subtitle: 'Most optimized pages based on your data',
      icon: Rocket,
      gradient: 'from-amber-400 via-orange-500 to-rose-500',
      glowColor: 'hsl(25 90% 55% / 0.15)',
      action: () => onNavigate('auto-build'),
    },
    {
      id: 'abtest',
      title: 'A/B Testing',
      subtitle: 'Run experiments and optimize conversions',
      icon: FlaskConical,
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      glowColor: 'hsl(170 80% 45% / 0.15)',
      action: () => onNavigate('abtest'),
    },
  ];

  const statItems = [
    { label: 'Spend', value: `$${stats.totalSpend.toLocaleString()}`, icon: DollarSign, color: 'from-sky-400 to-sky-600', textColor: 'text-sky-500' },
    { label: 'Conversions', value: stats.conversions.toString(), icon: Target, color: 'from-pink-400 to-rose-600', textColor: 'text-pink-500' },
    { label: 'Active Pages', value: stats.activePages.toString(), icon: Layout, color: 'from-blue-400 to-indigo-600', textColor: 'text-blue-500' },
    { label: 'Tests Running', value: stats.testsRunning.toString(), icon: TrendingUp, color: 'from-violet-400 to-purple-600', textColor: 'text-violet-500' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        {/* Header with sparkle accent */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 border border-violet-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-xs font-medium text-violet-600 dark:text-violet-400">AI-Powered Marketing</span>
            <Zap className="w-3 h-3 text-fuchsia-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">What would you like to do?</h2>
          <p className="text-sm text-muted-foreground">Choose how you'd like to get started</p>
        </div>

        {/* 4 Entry Options with colored glows */}
        <div className="grid grid-cols-2 gap-4">
          {entryOptions.map((option, idx) => (
            <Card
              key={option.id}
              onClick={option.action}
              className="group cursor-pointer border border-border/50 hover:border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative"
              style={{
                animationDelay: `${idx * 75}ms`,
              }}
            >
              {/* Subtle gradient background on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: option.glowColor }}
              />
              <CardContent className="p-5 space-y-3 relative z-10">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                  option.gradient
                )}>
                  <option.icon className="w-6 h-6 text-white drop-shadow-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-foreground transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{option.subtitle}</p>
                </div>
                <div className="flex items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
              {/* Bottom accent line */}
              <div className={cn(
                "h-0.5 w-full bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                option.gradient
              )} />
            </Card>
          ))}
        </div>

        {/* Quick Stats Row with colored icons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statItems.map((stat, idx) => (
            <div 
              key={stat.label} 
              className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 hover:border-border transition-all group"
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0 shadow-sm",
                stat.color
              )}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-bold", stat.textColor)}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics inline row */}
        <button
          onClick={() => onNavigate('performance')}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card hover:border-border hover:bg-muted/30 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Review & adjust your marketing analytics strategy
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Recent Creations */}
        {recentPages.length > 0 && (
          <RecentCreations 
            pages={recentPages}
            onView={handleViewPage}
            onEdit={handleEditPage}
          />
        )}
      </div>
    </div>
  );
}
