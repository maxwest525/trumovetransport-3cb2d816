import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, TrendingDown, DollarSign, X, Bell,
  ChevronRight, AlertCircle, CheckCircle2, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'performance_drop' | 'conversion_drop';
  platform: string;
  title: string;
  description: string;
  severity: 'warning' | 'critical' | 'info';
  metric?: {
    current: number;
    threshold: number;
    unit: string;
  };
  timestamp: Date;
  dismissed: boolean;
}

interface BudgetAlertsProps {
  liveMode?: boolean;
  budgets?: Record<string, number>;
  currentSpend?: Record<string, number>;
}

const INITIAL_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'budget_warning',
    platform: 'Google Ads',
    title: 'Budget 85% spent',
    description: 'Google Ads is approaching daily budget limit',
    severity: 'warning',
    metric: { current: 425, threshold: 500, unit: '$' },
    timestamp: new Date(Date.now() - 300000),
    dismissed: false
  },
  {
    id: '2',
    type: 'performance_drop',
    platform: 'Meta Business',
    title: 'CTR dropped 18%',
    description: 'Click-through rate decreased significantly in the last 4 hours',
    severity: 'warning',
    metric: { current: 2.8, threshold: 3.4, unit: '%' },
    timestamp: new Date(Date.now() - 900000),
    dismissed: false
  }
];

export function BudgetAlerts({ liveMode = false, budgets = {}, currentSpend = {} }: BudgetAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [collapsed, setCollapsed] = useState(false);

  // Live mode - simulate new alerts
  useEffect(() => {
    if (!liveMode) return;

    const interval = setInterval(() => {
      // Randomly add alerts in live mode
      if (Math.random() > 0.85) {
        const newAlertTypes = [
          {
            type: 'conversion_drop' as const,
            platform: 'Google Ads',
            title: 'Conversion rate declining',
            description: 'Conversions dropped 12% in the last hour',
            severity: 'warning' as const,
            metric: { current: 3.2, threshold: 3.8, unit: '%' }
          },
          {
            type: 'budget_exceeded' as const,
            platform: 'Meta Business',
            title: 'Budget limit reached',
            description: 'Daily budget exhausted - ads paused',
            severity: 'critical' as const,
            metric: { current: 520, threshold: 500, unit: '$' }
          }
        ];

        const randomAlert = newAlertTypes[Math.floor(Math.random() * newAlertTypes.length)];
        
        const newAlert: Alert = {
          id: Date.now().toString(),
          ...randomAlert,
          timestamp: new Date(),
          dismissed: false
        };

        setAlerts(prev => {
          // Don't duplicate similar alerts
          if (prev.some(a => a.type === newAlert.type && a.platform === newAlert.platform && !a.dismissed)) {
            return prev;
          }
          return [newAlert, ...prev].slice(0, 5);
        });
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [liveMode]);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
  };

  const activeAlerts = alerts.filter(a => !a.dismissed);
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;

  if (activeAlerts.length === 0) {
    return (
      <Card className="border-dashed border-border bg-muted/20">
        <CardContent className="p-4 flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
             <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">All systems normal</p>
            <p className="text-xs text-muted-foreground">No budget or performance alerts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'budget_exceeded': return DollarSign;
      case 'budget_warning': return AlertTriangle;
      case 'performance_drop': return TrendingDown;
      case 'conversion_drop': return TrendingDown;
      default: return AlertCircle;
    }
  };

  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        icon: 'text-red-500',
        badge: 'bg-red-500/20 text-red-500'
      };
      case 'warning': return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon: 'text-amber-500',
        badge: 'bg-amber-500/20 text-amber-500'
      };
      default: return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        icon: 'text-blue-500',
        badge: 'bg-blue-500/20 text-blue-500'
      };
    }
  };

  const getTimeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <Card className="border border-border overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <span className="font-medium text-sm">Alerts</span>
          {criticalCount > 0 && (
            <Badge className="text-[10px] h-5 bg-red-500/20 text-red-500 border-red-500/30">
              {criticalCount} critical
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="text-[10px] h-5 bg-amber-500/20 text-amber-500 border-amber-500/30">
              {warningCount} warning
            </Badge>
          )}
        </div>
        {liveMode && (
          <Badge variant="outline" className="text-[10px] gap-1 h-5 border-primary/50">
            <Zap className="w-3 h-3" />
            Monitoring
          </Badge>
        )}
      </div>

      {/* Alerts List */}
      {!collapsed && (
        <div className="divide-y divide-border">
          {activeAlerts.slice(0, 3).map((alert) => {
            const Icon = getAlertIcon(alert.type);
            const styles = getSeverityStyles(alert.severity);

            return (
              <div 
                key={alert.id}
                className={cn(
                  "p-3 flex items-start gap-3 transition-all",
                  styles.bg
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", styles.bg)}>
                  <Icon className={cn("w-4 h-4", styles.icon)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">{alert.title}</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5">
                      {alert.platform}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                  
                  {alert.metric && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">Current:</span>
                        <span className={cn("font-semibold", styles.icon)}>
                          {alert.metric.unit === '$' && '$'}{alert.metric.current}{alert.metric.unit !== '$' && alert.metric.unit}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-xs">/</span>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">Limit:</span>
                        <span className="font-semibold text-foreground">
                          {alert.metric.unit === '$' && '$'}{alert.metric.threshold}{alert.metric.unit !== '$' && alert.metric.unit}
                        </span>
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    {getTimeSince(alert.timestamp)}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissAlert(alert.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {!collapsed && activeAlerts.length > 3 && (
        <div className="px-4 py-2 bg-muted/20 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full h-7 text-xs gap-1">
            View all {activeAlerts.length} alerts
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      )}
    </Card>
  );
}
