import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Play, Pause, Search, Download, ExternalLink, Clock, User,
  Filter, X, Disc, SkipBack, SkipForward, Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Recording {
  id: string;
  callId: string;
  contactName: string;
  contactPhone: string;
  agentName: string;
  duration: number;
  outcome: string;
  campaign: string;
  date: string;
}

// TODO: Fetch from DB
const recordings: Recording[] = [];

const AGENTS: string[] = [];
const CAMPAIGNS: string[] = [];
const OUTCOMES_FILTER: string[] = [];

const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const fmtDate = (d: string) => {
  const dt = new Date(d);
  const now = new Date();
  const diffH = Math.floor((now.getTime() - dt.getTime()) / 3600000);
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  if (diffH < 48) return "Yesterday";
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function RecordingsLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAgent, setFilterAgent] = useState("all");
  const [filterCampaign, setFilterCampaign] = useState("all");
  const [filterOutcome, setFilterOutcome] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const filtered = recordings.filter(r => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!r.contactName.toLowerCase().includes(q) && !r.contactPhone.includes(q) && !r.agentName.toLowerCase().includes(q)) return false;
    }
    if (filterAgent !== "all" && r.agentName !== filterAgent) return false;
    if (filterCampaign !== "all" && r.campaign !== filterCampaign) return false;
    if (filterOutcome !== "all" && r.outcome !== filterOutcome) return false;
    return true;
  });

  const totalDuration = filtered.reduce((sum, r) => sum + r.duration, 0);
  const hasActiveFilters = filterAgent !== "all" || filterCampaign !== "all" || filterOutcome !== "all";

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
      setPlaybackProgress(0);
    } else {
      setPlayingId(id);
      setPlaybackProgress(0);
      // Simulate playback progress
      let p = 0;
      const rec = recordings.find(r => r.id === id);
      const dur = rec?.duration || 60;
      const interval = setInterval(() => {
        p += 1;
        setPlaybackProgress(Math.min(p / dur * 100, 100));
        if (p >= dur) { clearInterval(interval); setPlayingId(null); setPlaybackProgress(0); }
      }, 1000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Disc className="w-5 h-5 text-primary" /> Recordings
          </h2>
          <p className="text-xs text-muted-foreground">
            {filtered.length} recordings · {fmtDur(totalDuration)} total
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search contact, phone, agent…" className="pl-8 h-9 text-sm bg-background" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Button variant={hasActiveFilters ? "default" : "outline"} size="sm" className="gap-1.5 h-9" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-3.5 h-3.5" /> Filters
          {hasActiveFilters && <Badge className="text-[9px] h-4 px-1 ml-0.5 bg-background/20 text-primary-foreground">!</Badge>}
        </Button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterAgent} onValueChange={setFilterAgent}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Agent" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All Agents</SelectItem>
              {AGENTS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterCampaign} onValueChange={setFilterCampaign}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Campaign" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All Campaigns</SelectItem>
              {CAMPAIGNS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterOutcome} onValueChange={setFilterOutcome}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Outcome" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All Outcomes</SelectItem>
              {OUTCOMES_FILTER.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground"
              onClick={() => { setFilterAgent("all"); setFilterCampaign("all"); setFilterOutcome("all"); }}>
              <X className="w-3 h-3" /> Clear
            </Button>
          )}
        </div>
      )}

      {/* Recordings List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Disc className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No recordings match your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(rec => {
            const isPlaying = playingId === rec.id;
            return (
              <div key={rec.id} className={cn(
                "rounded-xl border bg-card transition-all",
                isPlaying ? "border-primary/30 shadow-sm" : "border-border hover:bg-muted/30"
              )}>
                <div className="flex items-center gap-3 p-3">
                  {/* Play button */}
                  <button
                    onClick={() => togglePlay(rec.id)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      isPlaying ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"
                    )}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{rec.contactName}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{rec.outcome}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-0.5"><User className="w-3 h-3" />{rec.agentName}</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{fmtDur(rec.duration)}</span>
                      <span>{rec.campaign}</span>
                      <span>{fmtDate(rec.date)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" title="Download">
                      <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" title="Share link">
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                {/* Playback bar */}
                {isPlaying && (
                  <div className="px-3 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground font-mono w-10 text-right">
                        {fmtDur(Math.floor(playbackProgress / 100 * rec.duration))}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${playbackProgress}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono w-10">
                        {fmtDur(rec.duration)}
                      </span>
                      <Volume2 className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
