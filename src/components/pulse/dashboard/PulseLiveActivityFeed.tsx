import React from 'react';
import { Activity, AlertTriangle, MessageSquare, Phone, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNowStrict } from 'date-fns';

export interface PulseFeedItem {
  id: string;
  type: 'alert' | 'barge' | 'message' | 'coach';
  agent: string;
  detail: string;
  severity?: string;
  timestamp: string;
}

interface PulseLiveActivityFeedProps {
  items: PulseFeedItem[];
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  alert: { icon: AlertTriangle, color: 'text-destructive' },
  barge: { icon: Phone, color: 'text-orange-500' },
  message: { icon: MessageSquare, color: 'text-primary' },
  coach: { icon: Eye, color: 'text-compliance-review' },
};

const PulseLiveActivityFeed: React.FC<PulseLiveActivityFeedProps> = ({ items }) => {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-secondary/30">
        <Activity className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] font-semibold">Live Activity Feed</span>
        {items.length > 0 && (
          <span className="ml-auto flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary/60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
        )}
      </div>
      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <p className="text-[10px] text-muted-foreground text-center py-6">No recent activity</p>
        ) : (
          <div className="divide-y divide-border/30">
            {items.slice(0, 20).map(item => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.alert;
              const Icon = cfg.icon;
              let timeAgo = '';
              try { timeAgo = formatDistanceToNowStrict(new Date(item.timestamp), { addSuffix: true }); } catch { timeAgo = ''; }
              return (
                <div key={item.id} className="flex items-start gap-2 px-3 py-2 hover:bg-accent/30 transition-colors">
                  <Icon className={`w-3 h-3 mt-0.5 shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] leading-tight">
                      <span className="font-semibold">{item.agent}</span>{' '}
                      <span className="text-muted-foreground">{item.detail}</span>
                    </p>
                    <p className="text-[9px] text-muted-foreground/70 mt-0.5">{timeAgo}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default PulseLiveActivityFeed;
