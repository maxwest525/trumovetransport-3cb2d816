import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, User, TrendingUp, TrendingDown, Minus, Search, RefreshCw, Shield, ShieldAlert, ShieldCheck, Filter, Phone, FileText, Mic, Radio, MessageSquare, Send, X, Download, CalendarIcon, ChevronDown, Volume2, VolumeX, Plus } from 'lucide-react';
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
  const [coachingTarget, setCoachingTarget] = useState<string>('Agent Smith');
  const [sendingCoaching, setSendingCoaching] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('pulse_alerts' as any).select('*').order('created_at', { ascending: false }).limit(500);
    if (!error && data) setAlerts(data as any);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

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

  const sendCoachingMessage = useCallback(async (message: string) => {
    if (!message.trim() || !coachingTarget) return;
    setSendingCoaching(true);
    try {
      const { error } = await supabase.from('pulse_agent_messages').insert({ agent_name: coachingTarget, message: message.trim() });
      if (error) throw error;
      toast.success(`Sent to ${coachingTarget}`);
      setCoachingMsg('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send');
    } finally {
      setSendingCoaching(false);
    }
  }, [coachingTarget]);

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

      <main className="max-w-7xl mx-auto p-6 w-full flex-1 flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ minHeight: '180px' }}>
          <PulseHighRiskAgents alerts={filteredAlerts} onAgentClick={(name) => setSelectedAgent(name)} />
          <PulseTopFlagsToday alerts={filteredAlerts} />
          <PulseSeverityBreakdown counts={severityCounts} />
          <PulseLiveActivityFeed items={activityFeed} />
        </div>

        {/* Agent Coaching Instructions */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-semibold">Send Agent Instructions</h3>
            <Select value={coachingTarget} onValueChange={setCoachingTarget}>
              <SelectTrigger className="w-[160px] h-7 text-[11px] ml-auto"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(uniqueAgents.length > 0 ? uniqueAgents : ['Agent Smith']).map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_QUICK_MESSAGES.map(msg => (
              <button key={msg} onClick={() => sendCoachingMessage(msg)} disabled={sendingCoaching} className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-border bg-secondary/30 hover:bg-primary/10 hover:border-primary/30 transition-colors disabled:opacity-40">
                {msg}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="text" value={coachingMsg} onChange={e => setCoachingMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendCoachingMessage(coachingMsg); }} placeholder="Type a custom instruction…" className="flex-1 h-8 px-3 text-xs bg-secondary/30 border border-border/40 rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
            <Button variant="default" size="sm" className="h-8 text-xs gap-1.5" disabled={!coachingMsg.trim() || sendingCoaching} onClick={() => sendCoachingMessage(coachingMsg)}>
              <Send className="w-3 h-3" /> Send
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2"><Filter className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs font-medium text-muted-foreground">Filter:</span></div>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="All Agents" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Agents</SelectItem>{uniqueAgents.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex items-center gap-2 flex-1 max-w-xs bg-secondary/30 rounded-md px-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="flex-1 h-8 bg-transparent text-xs placeholder:text-muted-foreground/60 focus:outline-none" />
          </div>
          {(selectedAgent !== 'all' || searchQuery) && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setSelectedAgent('all'); setSearchQuery(''); }}>Clear filters</Button>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
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
                    <div key={alert.id} className={`rounded-xl border border-border bg-card shadow-sm overflow-hidden cursor-pointer ${newAlertIds.has(alert.id) ? 'ring-2 ring-primary/50 animate-pulse' : ''} ${isExpanded ? 'ring-2 ring-primary/40' : ''}`} onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}>
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-secondary/30 border-b border-border">
                        <SevIcon className={`w-3.5 h-3.5 shrink-0 ${sevMeta.color}`} />
                        <span className="text-xs font-medium truncate w-24 shrink-0">{alert.agent_name}</span>
                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0 shrink-0">{alert.matched_text}</Badge>
                        <span className={`text-[9px] uppercase font-bold shrink-0 ${sevMeta.color}`}>{sevMeta.label}</span>
                        <span className="text-[9px] text-muted-foreground shrink-0">{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <ChevronDown className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                      {isExpanded && alert.context && (
                        <div className="px-4 pb-3 pt-2 border-t border-border/30 space-y-2 animate-in fade-in duration-200">
                          <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/20 rounded p-2">{alert.context}</p>
                          {alert.call_id && <Link to={`${basePath}/call/${alert.call_id}`} className="text-[10px] text-primary flex items-center gap-1 hover:underline font-medium"><FileText className="w-3 h-3" />View Call Review</Link>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </main>
    </div>
  );
};

export default PulseDashboard;
