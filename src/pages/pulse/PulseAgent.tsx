import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, Clock, User, AlertTriangle, Shield, ShieldAlert, ShieldCheck, Mic, MicOff, StopCircle, SendHorizonal, Keyboard, FileText, MessageSquare, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePulseSpeechRecognition } from '@/hooks/usePulseSpeechRecognition';
import { Link } from 'react-router-dom';

type Severity = 'low' | 'medium' | 'high' | 'critical';
interface FlaggedKeyword { keyword: string; severity: Severity; timestamp: string; context: string; }
interface WatchEntry { id: string; pattern: string; type: 'keyword' | 'phrase' | 'regex'; }

const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  low: { label: 'Low', color: 'text-muted-foreground', bg: 'bg-muted/50', icon: ShieldCheck },
  medium: { label: 'Medium', color: 'text-compliance-review', bg: 'bg-compliance-review/10', icon: Shield },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: ShieldAlert },
  critical: { label: 'Critical', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle },
};

const AGENT_NAME = 'Agent Smith';

function checkMatch(text: string, entry: WatchEntry): string | null {
  const lower = text.toLowerCase();
  if (entry.type === 'keyword') {
    const re = new RegExp(`\\b${entry.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const m = lower.match(re);
    return m ? m[0] : null;
  }
  if (entry.type === 'phrase') {
    const idx = lower.indexOf(entry.pattern.toLowerCase());
    return idx >= 0 ? text.substring(idx, idx + entry.pattern.length) : null;
  }
  if (entry.type === 'regex') {
    try { const re = new RegExp(entry.pattern, 'i'); const m = text.match(re); return m ? m[0] : null; } catch { return null; }
  }
  return null;
}

const PulseAgent: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { isListening, transcript, interimText, isSupported, start, stop, clear, appendText } = usePulseSpeechRecognition();
  const [liveCallId, setLiveCallId] = useState<string | null>(null);
  const [liveFlags, setLiveFlags] = useState<FlaggedKeyword[]>([]);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callActive, setCallActive] = useState(false);
  const lastCheckedRef = useRef(0);
  const [dbCalls, setDbCalls] = useState<any[]>([]);
  const [manualText, setManualText] = useState('');

  const getWatchEntries = useCallback(async (): Promise<WatchEntry[]> => {
    try { const saved = localStorage.getItem('pulse-watch-entries'); if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length > 0) return parsed; } } catch {}
    try {
      const { data } = await supabase.from('pulse_watch_patterns' as any).select('patterns').eq('config_key', 'default').maybeSingle();
      if (data && (data as any).patterns) { const p = (data as any).patterns as WatchEntry[]; if (Array.isArray(p) && p.length > 0) { localStorage.setItem('pulse-watch-entries', JSON.stringify(p)); return p; } }
    } catch {}
    return [];
  }, []);

  const getNotifSettings = useCallback(async () => {
    try { const saved = localStorage.getItem('pulse-notif-settings'); if (saved) return JSON.parse(saved); } catch {}
    try { const { data } = await supabase.from('pulse_notification_settings' as any).select('settings').eq('config_key', 'default').maybeSingle(); if (data && (data as any).settings) return (data as any).settings; } catch {}
    return null;
  }, []);

  const handleManualSubmit = useCallback(() => { if (!manualText.trim() || !callActive) return; appendText(manualText.trim()); setManualText(''); }, [manualText, callActive, appendText]);

  const fetchDbCalls = useCallback(async () => {
    const { data } = await supabase.from('pulse_calls' as any).select('id, agent_name, created_at, status, flagged_keywords').order('created_at', { ascending: false }).limit(20);
    if (data) setDbCalls(data);
  }, []);

  useEffect(() => { fetchDbCalls(); }, [fetchDbCalls]);

  const startCall = useCallback(async () => {
    clear(); setLiveFlags([]); lastCheckedRef.current = 0;
    const { data, error } = await supabase.from('pulse_calls' as any).insert({ agent_name: AGENT_NAME, status: 'active', transcript: '' } as any).select('id').single();
    if (error || !data) { toast.error('Failed to create call record'); return; }
    setLiveCallId((data as any).id); setCallStartTime(new Date()); setCallActive(true);
    if (isSupported) start(); fetchDbCalls();
  }, [clear, start, fetchDbCalls, isSupported]);

  useEffect(() => {
    if (!callActive || !liveCallId) return;
    const timer = setInterval(async () => { if (transcript) await supabase.from('pulse_calls' as any).update({ transcript } as any).eq('id', liveCallId); }, 3000);
    return () => clearInterval(timer);
  }, [callActive, liveCallId, transcript]);

  const stopCall = useCallback(async () => {
    stop(); setCallActive(false);
    if (liveCallId && callStartTime) {
      const duration = Math.round((Date.now() - callStartTime.getTime()) / 1000);
      await supabase.from('pulse_calls' as any).update({ status: 'completed', ended_at: new Date().toISOString(), duration_seconds: duration, transcript, flagged_keywords: liveFlags.map(f => f.keyword) } as any).eq('id', liveCallId);
      fetchDbCalls();
    }
  }, [stop, liveCallId, callStartTime, transcript, liveFlags, fetchDbCalls]);

  useEffect(() => {
    if (!callActive || !transcript) return;
    const newText = transcript.slice(lastCheckedRef.current);
    if (!newText.trim()) return;
    lastCheckedRef.current = transcript.length;
    const processEntries = async () => {
      const entries = await getWatchEntries();
      entries.forEach(async (entry) => {
        const matched = checkMatch(newText, entry);
        if (!matched) return;
        const sev: Severity = entry.type === 'regex' ? 'critical' : entry.type === 'phrase' ? 'high' : 'medium';
        const contextSnippet = newText.slice(0, 200);
        const elapsed = callStartTime ? Math.round((Date.now() - callStartTime.getTime()) / 1000) : 0;
        const timeLabel = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`;
        setLiveFlags(prev => [...prev, { keyword: entry.pattern, severity: sev, timestamp: timeLabel, context: contextSnippet }]);
        toast.warning(`Keyword flagged: "${matched}"`, { description: contextSnippet.slice(0, 80), duration: 5000 });
        await supabase.from('pulse_alerts' as any).insert({ agent_name: AGENT_NAME, keyword: entry.pattern, matched_text: matched, context: contextSnippet, severity: sev, match_type: entry.type, call_id: liveCallId } as any);
      });
    };
    processEntries();
  }, [transcript, callActive, liveCallId, callStartTime, getWatchEntries]);

  useEffect(() => {
    const channel = supabase.channel('pulse-agent-messages-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pulse_agent_messages', filter: `agent_name=eq.${AGENT_NAME}` }, (payload) => {
        const msg = payload.new as any;
        toast.info(msg.message, { description: 'Manager coaching message', duration: 10000, icon: <MessageSquare className="w-4 h-4 text-primary" /> });
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className={cn(embedded ? "" : "min-h-screen bg-background text-foreground")}>
      {!embedded && (
        <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-6 border-b border-border bg-secondary/30 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link to="/pulse" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-3.5 h-3.5" /></Link>
            <User className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{AGENT_NAME}</span>
            <span className="text-xs text-muted-foreground">{dbCalls.length} calls</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-3 h-3 text-destructive" />
              <span className="text-xs font-medium">{liveFlags.length} flags</span>
            </div>
          </div>
          <Badge variant="destructive" className="text-[10px]">BETA</Badge>
        </header>
      )}

      <main className={cn("max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[340px_1fr]", embedded ? "" : "min-h-[calc(100vh-3.5rem)]")}>
        <div className="border-r border-border/40 bg-secondary/5">
          <div className="p-3 border-b border-border/30"><h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Phone className="w-3 h-3" /> Recent Calls</h2></div>
          <ScrollArea className="h-[calc(100vh-7rem)]">
            <div className="p-2 space-y-1">
              {dbCalls.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center px-6"><Phone className="w-8 h-8 text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground">No calls yet</p></div>
              ) : dbCalls.map(call => (
                <div key={call.id} className="p-3 rounded-lg border border-border bg-secondary/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{call.agent_name}</span>
                    <Badge variant={call.status === 'active' ? 'default' : 'secondary'} className="text-[9px] h-4 px-1.5">{call.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{new Date(call.created_at).toLocaleTimeString()}</span>
                    {call.flagged_keywords?.length > 0 && <Badge variant="destructive" className="text-[9px] h-4 px-1.5">{call.flagged_keywords.length} flags</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="overflow-y-auto">
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div><h1 className="text-lg font-bold">Live Transcription</h1><p className="text-xs text-muted-foreground mt-0.5">{callActive ? 'Listening… speak or type below' : 'Press Start Call to begin'}</p></div>
              <div className="flex items-center gap-2">
                {!callActive ? (
                  <button onClick={startCall} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-compliance-pass text-white text-sm font-semibold hover:opacity-90 transition-opacity"><Mic className="w-4 h-4" /> Start Call</button>
                ) : (
                  <button onClick={stopCall} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity"><StopCircle className="w-4 h-4" /> End Call</button>
                )}
              </div>
            </div>
            {!isSupported && <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-xs">Speech recognition is not supported in this browser. Use Chrome or Edge.</div>}
            {callActive && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-compliance-pass/10 border border-compliance-pass/20">
                <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-compliance-pass opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-compliance-pass" /></span>
                <span className="text-xs font-medium text-compliance-pass">Recording</span>
              </div>
            )}
            {callActive && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/40"><Keyboard className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground font-medium">Manual Input</span></div>
                <input type="text" value={manualText} onChange={e => setManualText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleManualSubmit(); }} placeholder="Type text to simulate speech…" className="flex-1 h-8 px-3 text-xs bg-secondary/40 border border-border/40 rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                <button onClick={handleManualSubmit} disabled={!manualText.trim()} className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 hover:opacity-90 disabled:opacity-40"><SendHorizonal className="w-3 h-3" /> Send</button>
              </div>
            )}
            {liveFlags.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-destructive" /> Flagged Keywords</h2>
                {liveFlags.map((flag, i) => { const sm = SEVERITY_META[flag.severity]; const SI = sm.icon; return (
                  <div key={i} className={cn('p-3 rounded-lg border border-border', sm.bg)}>
                    <div className="flex items-center gap-2 mb-1"><SI className={cn('w-3.5 h-3.5', sm.color)} /><Badge variant="destructive" className="text-[10px]">{flag.keyword}</Badge><span className={cn('text-[10px] font-semibold uppercase', sm.color)}>{sm.label}</span><span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {flag.timestamp}</span></div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{flag.context}</p>
                  </div>
                ); })}
              </div>
            )}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><FileText className="w-3 h-3 text-primary" /> Live Transcript</h2>
              <ScrollArea className="h-[50vh] rounded-lg bg-secondary/20 border border-border p-4">
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {transcript || (callActive ? '' : 'No transcript yet. Start a call to begin.')}
                  {interimText && <span className="text-muted-foreground/50">{interimText}</span>}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PulseAgent;
