import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, User, TrendingUp, TrendingDown, Minus, Search, RefreshCw, Shield, ShieldAlert, ShieldCheck, Filter, Phone, FileText, Mic, Radio, MessageSquare, Send, X, Download, CalendarIcon, ChevronDown, Volume2, VolumeX, Plus, Headphones, Settings2 } from 'lucide-react';
import { format, startOfDay, endOfDay, subDays, subHours } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import PulseHighRiskAgents from '@/components/pulse/dashboard/PulseHighRiskAgents';
import PulseTopFlagsToday from '@/components/pulse/dashboard/PulseTopFlagsToday';
import PulseSeverityBreakdown from '@/components/pulse/dashboard/PulseSeverityBreakdown';
import PulseLiveActivityFeed, { PulseFeedItem } from '@/components/pulse/dashboard/PulseLiveActivityFeed';
import { ArrowLeft } from 'lucide-react';

type Severity = 'low' | 'medium' | 'high' | 'critical';
interface DbAlert { id: string; agent_name: string; client_name: string; keyword: string; matched_text: string; match_type: string; context: string | null; severity: string; created_at: string; call_id: string | null; }

const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  low: { label: 'Low', color: 'text-muted-foreground', bg: 'bg-muted/50 border-muted-foreground/20', icon: ShieldCheck },
  medium: { label: 'Medium', color: 'text-compliance-review', bg: 'bg-compliance-review/10 border-compliance-review/30', icon: Shield },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/30', icon: ShieldAlert },
  critical: { label: 'Critical', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: AlertTriangle },
};

const DEFAULT_QUICK_MESSAGES = [
  'Slow down — speak more clearly',
  'Use the required disclosure script',
  'Mirror the customer\'s language',
  'De-escalate — show empathy first',
  'Verify customer identity before proceeding',
  'Offer the retention deal',
];

const PulseDashboard: React.FC<{ embedded?: boolean; basePath?: string }> = ({ embedded = false, basePath = '/pulse' }) => {
  const [alerts, setAlerts] = useState<DbAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfDay(new Date()));
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [datePreset, setDatePreset] = useState<string>('today');
  const [activityFeed, setActivityFeed] = useState<PulseFeedItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set());
  const [coachingMsg, setCoachingMsg] = useState('');
  const [sendingCoaching, setSendingCoaching] = useState(false);
  const [liveTranscriptAgent, setLiveTranscriptAgent] = useState<string>('Agent Smith');
  const [transcriptViewMode, setTranscriptViewMode] = useState<'flagged' | 'full'>('flagged');
  const [liveCallData, setLiveCallData] = useState<{ id: string; agent_name: string; client_name: string; transcript: string; flagged_keywords: string[]; status: string } | null>(null);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('pulse_alerts' as any).select('*').order('created_at', { ascending: false }).limit(500);
    if (!error && data) setAlerts(data as any);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // Fetch live call for transcript panel
  const fetchLiveCall = useCallback(async (agentName: string) => {
    const { data } = await supabase.from('pulse_calls' as any).select('id, agent_name, client_name, transcript, flagged_keywords, status').eq('agent_name', agentName).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (data) setLiveCallData(data as any);
    else setLiveCallData(null);
  }, []);

  useEffect(() => { fetchLiveCall(liveTranscriptAgent); }, [liveTranscriptAgent, fetchLiveCall]);

  // Realtime for live call updates
  useEffect(() => {
    const channel = supabase.channel('pulse-calls-live-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pulse_calls' }, () => { fetchLiveCall(liveTranscriptAgent); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [liveTranscriptAgent, fetchLiveCall]);

  useEffect(() => {
    const channel = supabase.channel('pulse-alerts-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pulse_alerts' }, (payload) => {
        const newAlert = payload.new as DbAlert;
        setAlerts(prev => [newAlert, ...prev].slice(0, 500));
        setActivityFeed(prev => [{ id: `alert-${newAlert.id}`, type: 'alert' as const, agent: newAlert.agent_name, detail: `flagged "${newAlert.keyword}" (${newAlert.severity})`, severity: newAlert.severity, timestamp: newAlert.created_at }, ...prev].slice(0, 50));
        setNewAlertIds(prev => new Set(prev).add(newAlert.id));
        setTimeout(() => setNewAlertIds(prev => { const next = new Set(prev); next.delete(newAlert.id); return next; }), 3000);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pulse_alerts' }, () => { fetchAlerts(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAlerts]);

  const applyDatePreset = useCallback((preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    switch (preset) {
      case 'all': setDateFrom(undefined); setDateTo(undefined); break;
      case '1h': setDateFrom(subHours(now, 1)); setDateTo(undefined); break;
      case 'today': setDateFrom(startOfDay(now)); setDateTo(undefined); break;
      case '7d': setDateFrom(subDays(now, 7)); setDateTo(undefined); break;
      case '30d': setDateFrom(subDays(now, 30)); setDateTo(undefined); break;
    }
  }, []);

  const uniqueAgents = useMemo(() => [...new Set(alerts.map(a => a.agent_name))].sort(), [alerts]);
  const filteredAlerts = useMemo(() => alerts.filter(a => {
    if (selectedAgent !== 'all' && a.agent_name !== selectedAgent) return false;
    if (selectedSeverity !== 'all' && a.severity !== selectedSeverity) return false;
    const ts = new Date(a.created_at);
    if (dateFrom && ts < dateFrom) return false;
    if (dateTo && ts > endOfDay(dateTo)) return false;
    if (searchQuery) { const q = searchQuery.toLowerCase(); return a.keyword.toLowerCase().includes(q) || a.matched_text.toLowerCase().includes(q) || a.agent_name.toLowerCase().includes(q); }
    return true;
  }), [alerts, selectedAgent, selectedSeverity, dateFrom, dateTo, searchQuery]);

  const severityCounts = useMemo(() => ({
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
  }), [alerts]);

  const exportCsv = () => {
    const headers = ['Timestamp', 'Severity', 'Agent', 'Matched', 'Keyword', 'Match Type', 'Context'];
    const rows = filteredAlerts.map(a => [a.created_at, a.severity, a.agent_name, a.matched_text, a.keyword, a.match_type, `"${(a.context || '').replace(/"/g, '""')}"`]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `pulse-alerts-${new Date().toISOString().slice(0, 10)}.csv`; link.click();
    URL.revokeObjectURL(url);
  };

  const clearAlerts = async () => {
    await supabase.from('pulse_alerts' as any).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    setAlerts([]);
  };

  const sendCoachingMessage = useCallback(async (agentName: string, message: string) => {
    if (!message.trim() || !agentName) return;
    setSendingCoaching(true);
    try {
      const { error } = await supabase.from('pulse_agent_messages').insert({ agent_name: agentName, message: message.trim() });
      if (error) throw error;
      toast.success(`Sent to ${agentName}`);
      setCoachingMsg('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send');
    } finally {
      setSendingCoaching(false);
    }
  }, []);

  const handleBarge = useCallback((agentName: string) => {
    toast.info(`Barged into ${agentName}'s call`, { description: 'You are now listening to the live call' });
    setLiveTranscriptAgent(agentName);
    setActivityFeed(prev => [{ id: `barge-${Date.now()}`, type: 'alert' as const, agent: agentName, detail: 'manager barged into call', severity: 'high', timestamp: new Date().toISOString() }, ...prev].slice(0, 50));
  }, []);

  // Parse transcript lines for display
  const transcriptLines = useMemo(() => {
    if (!liveCallData?.transcript) return [];
    return liveCallData.transcript.split('\n').filter(Boolean).map((line, i) => ({ id: `line-${i}`, text: line, index: i }));
  }, [liveCallData]);

  const flaggedLines = useMemo(() => {
    if (!liveCallData?.flagged_keywords?.length || !transcriptLines.length) return [];
    return transcriptLines.filter(line => liveCallData.flagged_keywords.some(kw => line.text.toLowerCase().includes(kw.toLowerCase())));
  }, [transcriptLines, liveCallData]);

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords?.length) return text;
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;
    const sortedKws = [...keywords].sort((a, b) => b.length - a.length);
    const regex = new RegExp(`(${sortedKws.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const splits = remaining.split(regex);
    splits.forEach((part, i) => {
      if (sortedKws.some(kw => kw.toLowerCase() === part.toLowerCase())) {
        parts.push(<Badge key={`kw-${i}`} variant="destructive" className="text-[9px] px-1.5 py-0 mx-0.5 inline">{part}</Badge>);
      } else {
        parts.push(part);
      }
    });
    return parts;
  };

  return (
    <div className={cn(embedded ? "flex flex-col" : "min-h-screen bg-background text-foreground flex flex-col")}>
      {!embedded && (
        <header className="sticky top-0 z-40 h-14 flex items-center gap-3 px-6 border-b border-border bg-background/80 backdrop-blur-xl">
          <Link to="/pulse" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-3.5 h-3.5" /></Link>
          <AlertTriangle className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg tracking-tight">Pulse Dashboard</span>
          <Badge variant="destructive" className="text-[10px]">BETA</Badge>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" disabled={filteredAlerts.length === 0} onClick={exportCsv}><Download className="w-3.5 h-3.5" />Export CSV</Button>
          <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={fetchAlerts}><RefreshCw className="w-3 h-3" /></Button>
        </header>
      )}

      <main className="max-w-[1600px] mx-auto p-6 w-full flex-1 flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ minHeight: '180px' }}>
          <PulseHighRiskAgents alerts={filteredAlerts} onAgentClick={(name) => setSelectedAgent(name)} />
          <PulseTopFlagsToday alerts={filteredAlerts} />
          <PulseSeverityBreakdown counts={severityCounts} />
          <PulseLiveActivityFeed items={activityFeed} />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2"><Filter className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs font-medium text-muted-foreground">Filter:</span></div>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="All Agents" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Agents</SelectItem>{uniqueAgents.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
          <button onClick={() => applyDatePreset('all')} className={`h-8 px-3 text-xs rounded-md border ${datePreset === 'all' ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-secondary/40'}`}>All Time</button>
          <div className="flex items-center gap-2 flex-1 max-w-xs bg-secondary/30 rounded-md px-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="flex-1 h-8 bg-transparent text-xs placeholder:text-muted-foreground/60 focus:outline-none" />
          </div>
          {(selectedAgent !== 'all' || searchQuery) && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setSelectedAgent('all'); setSearchQuery(''); }}>Clear filters</Button>
          )}
        </div>

        {/* Two-column layout: Flagged Interactions + Live Transcript */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0">
          {/* Left: Flagged Interactions */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
              <h3 className="text-xs font-semibold flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-destructive" />Flagged Interactions{filteredAlerts.length > 0 && <Badge variant="secondary" className="text-[10px]">{filteredAlerts.length}</Badge>}</h3>
              <span className="text-[10px] text-muted-foreground">Live • Real-time updates</span>
            </div>
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground"><RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin opacity-30" /><p className="text-xs">Loading alerts...</p></div>
              ) : filteredAlerts.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground"><AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-20" /><p className="text-sm font-medium">No flagged interactions</p><p className="text-xs mt-1">Detections will appear here in real time.</p></div>
              ) : (
                <div className="space-y-2 p-3">
                  {filteredAlerts.map(alert => {
                    const sev = (alert.severity as Severity) || 'medium';
                    const sevMeta = SEVERITY_META[sev] || SEVERITY_META.medium;
                    const SevIcon = sevMeta.icon;
                    const isExpanded = expandedAlertId === alert.id;
                    return (
                      <div key={alert.id} className={`rounded-xl border border-border bg-card shadow-sm overflow-hidden ${newAlertIds.has(alert.id) ? 'ring-2 ring-primary/50 animate-pulse' : ''} ${isExpanded ? 'ring-2 ring-primary/40' : ''}`}>
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/30 border-b border-border cursor-pointer" onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}>
                          <SevIcon className={`w-3.5 h-3.5 shrink-0 ${sevMeta.color}`} />
                          <span className="text-xs font-medium truncate shrink-0">{alert.agent_name}</span>
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0 shrink-0">{alert.matched_text}</Badge>
                          <span className={`text-[9px] uppercase font-bold shrink-0 ${sevMeta.color}`}>{sevMeta.label}</span>
                          <span className="text-[9px] text-muted-foreground shrink-0">{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <ChevronDown className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          {/* Action buttons */}
                          <div className="flex items-center gap-1 ml-auto shrink-0" onClick={e => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 gap-1" onClick={() => handleBarge(alert.agent_name)}>
                              <Headphones className="w-3 h-3" /> Barge
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 gap-1">
                                  <MessageSquare className="w-3 h-3" /> Msg
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-64">
                                <div className="p-2 space-y-1">
                                  <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">Quick message to {alert.agent_name}</p>
                                  {DEFAULT_QUICK_MESSAGES.map(msg => (
                                    <DropdownMenuItem key={msg} className="text-xs cursor-pointer" onClick={() => sendCoachingMessage(alert.agent_name, msg)}>
                                      {msg}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                  <div className="flex items-center gap-1.5 pt-1">
                                    <input type="text" placeholder="Add custom message…" className="flex-1 h-7 px-2 text-[11px] bg-secondary/30 border border-border/40 rounded placeholder:text-muted-foreground/50 focus:outline-none" onKeyDown={e => { if (e.key === 'Enter') { sendCoachingMessage(alert.agent_name, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }} />
                                    <button className="h-7 w-7 flex items-center justify-center rounded bg-primary text-primary-foreground hover:opacity-90" onClick={e => { const input = (e.currentTarget.previousElementSibling as HTMLInputElement); sendCoachingMessage(alert.agent_name, input.value); input.value = ''; }}><Plus className="w-3 h-3" /></button>
                                  </div>
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 gap-1">
                                  <Settings2 className="w-3 h-3" /> Coach
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-64">
                                <div className="p-2 space-y-1">
                                  <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">Coaching suggestions</p>
                                  {DEFAULT_QUICK_MESSAGES.map(msg => (
                                    <DropdownMenuItem key={msg} className="text-xs cursor-pointer" onClick={() => sendCoachingMessage(alert.agent_name, msg)}>
                                      {msg}
                                    </DropdownMenuItem>
                                  ))}
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="px-4 pb-3 pt-2 border-t border-border/30 space-y-2 animate-in fade-in duration-200">
                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><User className="w-3 h-3" /> Client: {alert.client_name}</span>
                              <span className="flex items-center gap-1">T Type: {alert.match_type === 'keyword' ? 'Word match' : alert.match_type === 'phrase' ? 'Phrase match' : 'Regex match'}</span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(alert.created_at).toLocaleString()}</span>
                              <span>Pattern: <span className="font-semibold text-foreground">{alert.keyword}</span></span>
                            </div>
                            {alert.context && (
                              <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/20 rounded p-2">
                                {highlightKeywords(alert.context, [alert.matched_text])}
                              </p>
                            )}
                            {alert.call_id && <Link to={`${basePath}/call/${alert.call_id}`} className="text-[10px] text-primary flex items-center gap-1 hover:underline font-medium"><FileText className="w-3 h-3" />View Full Transcript</Link>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right: Live Transcript */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
              <h3 className="text-xs font-semibold flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-primary" />Live Transcript</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-md border border-border overflow-hidden">
                  <button onClick={() => setTranscriptViewMode('flagged')} className={`px-2.5 py-1 text-[10px] font-semibold transition-colors ${transcriptViewMode === 'flagged' ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Flagged</button>
                  <button onClick={() => setTranscriptViewMode('full')} className={`px-2.5 py-1 text-[10px] font-semibold transition-colors ${transcriptViewMode === 'full' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>Full</button>
                </div>
                <Select value={liveTranscriptAgent} onValueChange={setLiveTranscriptAgent}>
                  <SelectTrigger className="w-[150px] h-7 text-[11px]"><User className="w-3 h-3 mr-1" /><SelectValue placeholder="Select agent..." /></SelectTrigger>
                  <SelectContent>
                    {(uniqueAgents.length > 0 ? uniqueAgents : ['Agent Smith']).map(a => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {liveCallData ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Agent header in transcript */}
                <div className="px-4 py-3 border-b border-border/30 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-compliance-pass opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-compliance-pass" /></div>
                    <span className="text-xs font-semibold">{liveCallData.agent_name}</span>
                    <span className="text-[10px] text-muted-foreground">→ {liveCallData.client_name}</span>
                    <div className="flex items-center gap-1 ml-auto" onClick={e => e.stopPropagation()}>
                      <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 gap-1" onClick={() => handleBarge(liveCallData.agent_name)}>
                        <Headphones className="w-3 h-3" /> Barge
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 gap-1"><MessageSquare className="w-3 h-3" /> Msg</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                          <div className="p-2 space-y-1">
                            {DEFAULT_QUICK_MESSAGES.map(msg => (
                              <DropdownMenuItem key={msg} className="text-xs cursor-pointer" onClick={() => sendCoachingMessage(liveCallData.agent_name, msg)}>{msg}</DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <div className="flex items-center gap-1.5 pt-1">
                              <input type="text" placeholder="Add custom message…" className="flex-1 h-7 px-2 text-[11px] bg-secondary/30 border border-border/40 rounded placeholder:text-muted-foreground/50 focus:outline-none" onKeyDown={e => { if (e.key === 'Enter') { sendCoachingMessage(liveCallData.agent_name, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }} />
                              <button className="h-7 w-7 flex items-center justify-center rounded bg-primary text-primary-foreground hover:opacity-90" onClick={e => { const input = (e.currentTarget.previousElementSibling as HTMLInputElement); sendCoachingMessage(liveCallData.agent_name, input.value); input.value = ''; }}><Plus className="w-3 h-3" /></button>
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 gap-1"><Settings2 className="w-3 h-3" /> Coach</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                          <div className="p-2 space-y-1">
                            {DEFAULT_QUICK_MESSAGES.map(msg => (
                              <DropdownMenuItem key={msg} className="text-xs cursor-pointer" onClick={() => sendCoachingMessage(liveCallData.agent_name, msg)}>{msg}</DropdownMenuItem>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {liveCallData.flagged_keywords?.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />
                      {liveCallData.flagged_keywords.map((kw, i) => (
                        <Badge key={`${kw}-${i}`} variant="destructive" className="text-[9px] px-1.5 py-0">{kw}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 space-y-3">
                    {/* Flagged Lines Section */}
                    {transcriptViewMode === 'flagged' && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-destructive" /> Flagged Lines{flaggedLines.length > 0 && <Badge variant="destructive" className="text-[9px] h-4 px-1.5">{flaggedLines.length}</Badge>}</h4>
                        {flaggedLines.length === 0 ? (
                          <p className="text-xs text-muted-foreground/50 italic text-center py-4">No flagged lines detected</p>
                        ) : flaggedLines.map(line => (
                          <div key={line.id} className="px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/20">
                            <p className="text-xs leading-relaxed">
                              <span className="text-[10px] font-semibold text-muted-foreground mr-2">CLIENT:</span>
                              {highlightKeywords(line.text, liveCallData.flagged_keywords || [])}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Full Transcript Section */}
                    {transcriptViewMode === 'full' && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5"><FileText className="w-3 h-3 text-primary" /> Full Transcript{transcriptLines.length > 0 && <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{transcriptLines.length} lines</Badge>}</h4>
                        {transcriptLines.length === 0 ? (
                          <p className="text-xs text-muted-foreground/50 italic text-center py-4">No transcript data</p>
                        ) : transcriptLines.map(line => {
                          const isFlagged = liveCallData.flagged_keywords?.some(kw => line.text.toLowerCase().includes(kw.toLowerCase()));
                          return (
                            <div key={line.id} className={`px-3 py-2 rounded-lg border ${isFlagged ? 'bg-destructive/5 border-destructive/20' : 'border-border/20'}`}>
                              <p className="text-xs leading-relaxed">
                                <span className="text-[10px] font-semibold text-muted-foreground mr-2">CLIENT:</span>
                                {highlightKeywords(line.text, liveCallData.flagged_keywords || [])}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
                <Radio className="w-10 h-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No active call</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Select an agent to view their live transcript</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PulseDashboard;
