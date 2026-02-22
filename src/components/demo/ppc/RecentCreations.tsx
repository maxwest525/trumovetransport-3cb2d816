import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, MoreHorizontal, Eye, Pencil, Trash2,
  TrendingUp, TrendingDown, Clock, ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LandingPage } from "./types";

interface RecentCreationsProps {
  pages: LandingPage[];
  onView: (page: LandingPage) => void;
  onEdit: (page: LandingPage) => void;
  onDelete?: (page: LandingPage) => void;
}

export function RecentCreations({ pages, onView, onEdit, onDelete }: RecentCreationsProps) {
  // Get last 3 pages sorted by creation date
  const recentPages = [...pages]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  if (recentPages.length === 0) {
    return null;
  }

  const getStatusColor = (status: LandingPage['status']) => {
    switch (status) {
      case 'active': return 'bg-primary/20 text-primary';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400';
      case 'draft': return 'bg-muted text-muted-foreground';
    }
  };

  const getPerformanceIndicator = (perf: LandingPage['performance']) => {
    switch (perf) {
      case 'excellent': return { color: 'text-primary', label: '↑ Top performer' };
      case 'good': return { color: 'text-blue-500', label: '→ On track' };
      case 'poor': return { color: 'text-red-500', label: '↓ Needs attention' };
      case 'new': return { color: 'text-purple-500', label: '✨ New' };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Recent Creations
        </h3>
        <Badge variant="outline" className="text-[10px]">
          {pages.length} total
        </Badge>
      </div>

      <div className="space-y-2">
        {recentPages.map((page) => {
          const perf = getPerformanceIndicator(page.performance);
          return (
            <Card 
              key={page.id} 
              className="group cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => onView(page)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">
                      {page.name}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={cn("text-[9px] px-1.5 py-0", getStatusColor(page.status))}
                    >
                      {page.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="truncate">{page.template}</span>
                    <span>•</span>
                    <span className={perf.color}>{perf.label}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0 hidden sm:block">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {page.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-primary" />
                    ) : page.trend === 'down' ? (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    ) : null}
                    <span>{page.conversionRate.toFixed(1)}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{page.conversions} conv</p>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(page); }}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(page); }}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`https://${page.url}`, '_blank'); }}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open
                    </DropdownMenuItem>
                    {onDelete && (
                      <DropdownMenuItem 
                        className="text-destructive" 
                        onClick={(e) => { e.stopPropagation(); onDelete(page); }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
