import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, ListFilter, Zap, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { AgentCallStatus, Queue, DialList } from "./types";

const QUEUES: Queue[] = [
  { id: "q1", name: "Sales Queue", type: "sales" },
  { id: "q2", name: "Retention Queue", type: "retention" },
  { id: "q3", name: "Support Queue", type: "support" },
];

const LISTS: DialList[] = [
  { id: "l1", name: "My Call List", campaignId: null, contactCount: 24 },
  { id: "l2", name: "Scheduled Callbacks", campaignId: null, contactCount: 7 },
  { id: "l3", name: "New Leads", campaignId: "c1", contactCount: 38 },
  { id: "l4", name: "Follow-ups", campaignId: "c1", contactCount: 15 },
  { id: "l5", name: "Manual Dials", campaignId: null, contactCount: 0 },
];

interface DialerSidebarProps {
  agentStatus: AgentCallStatus;
  onStatusChange: (status: AgentCallStatus) => void;
  selectedQueue: string;
  onQueueChange: (id: string) => void;
  selectedList: string;
  onListChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function DialerSidebar({
  agentStatus, onStatusChange,
  selectedQueue, onQueueChange,
  selectedList, onListChange,
  searchQuery, onSearchChange,
}: DialerSidebarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isReady = agentStatus === "ready";

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0 overflow-y-auto">
      {/* Agent Status */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
          <Badge variant={isReady ? "default" : "secondary"} className={cn(
            "text-[10px] px-2",
            isReady && "bg-green-600 hover:bg-green-700 text-white"
          )}>
            {isReady ? "Ready" : "Not Ready"}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-foreground font-medium">Available for calls</span>
          <Switch checked={isReady} onCheckedChange={(v) => onStatusChange(v ? "ready" : "not_ready")} />
        </div>
      </div>

      {/* Queue Selector */}
      <div className="p-4 border-b border-border space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Queue</span>
        <Select value={selectedQueue} onValueChange={onQueueChange}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {QUEUES.map(q => (
              <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lists */}
      <div className="p-4 border-b border-border space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lists</span>
        <div className="space-y-1">
          {LISTS.map(list => (
            <button
              key={list.id}
              onClick={() => onListChange(list.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                selectedList === list.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <span className="truncate">{list.name}</span>
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 shrink-0 ml-2">
                {list.contactCount}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search contacts…"
            className="pl-8 h-9 text-sm bg-background"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:bg-muted/50 transition-colors">
            <span className="flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5" />
              Filters
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", filtersOpen && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            <Select>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Campaign" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="spring">Spring Promo</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Attempts" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="0">0 attempts</SelectItem>
                <SelectItem value="1">1 attempt</SelectItem>
                <SelectItem value="2">2+ attempts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Power Dialer CTA */}
      <div className="mt-auto p-4 border-t border-border">
        <Button className="w-full gap-2" size="sm" disabled={!isReady}>
          <Zap className="w-4 h-4" />
          Start Power Dialer
        </Button>
      </div>
    </aside>
  );
}
