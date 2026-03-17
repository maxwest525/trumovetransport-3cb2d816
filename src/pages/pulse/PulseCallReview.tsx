import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, User, Phone, Shield, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type Severity = 'low' | 'medium' | 'high' | 'critical';
const SEVERITY_META: Record<Severity, { label: string; color: string; icon: React.ElementType }> = {
  low: { label: 'Low', color: 'text-muted-foreground', icon: ShieldCheck },
  medium: { label: 'Medium', color: 'text-compliance-review', icon: Shield },
  high: { label: 'High', color: 'text-orange-500', icon: ShieldAlert },
  critical: { label: 'Critical', color: 'text-destructive', icon: AlertTriangle },
};

const PulseCallReview: React.FC<{ embedded?: boolean; basePath?: string }> = ({ embedded = false, basePath = '/pulse/dashboard' }) => {
  const { callId } = useParams<{ callId: string }>();
  const [call, setCall] = useState<any>(null);
  const [callAlerts, setCallAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCall = useCallback(async () => {
    if (!callId) return;
    setIsLoading(true);
    const [callRes, alertsRes] = await Promise.all([
      supabase.from('pulse_calls' as any).select('*').eq('id', callId).single(),
      supabase.from('pulse_alerts' as any).select('*').eq('call_id', callId).order('created_at', { ascending: true }),
    ]);
    if (callRes.data) setCall(callRes.data);
    if (alertsRes.data) setCallAlerts(alertsRes.data);
    setIsLoading(false);
  }, [callId]);

  useEffect(() => { fetchCall(); }, [fetchCall]);

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords.length || !text) return text;
    try {
      const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
      return text.split(regex).map((seg, i) => regex.test(seg) ? (regex.lastIndex = 0, <mark key={i} className="bg-destructive/30 text-destructive-foreground px-0.5 rounded-sm font-semibold">{seg}</mark>) : (regex.lastIndex = 0, seg));
    } catch { return text; }
  };

  if (isLoading) return <div className={cn(embedded ? "flex items-center justify-center py-20" : "min-h-screen bg-background flex items-center justify-center")}><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  if (!call) return <div className={cn(embedded ? "flex flex-col items-center justify-center py-20 text-muted-foreground" : "min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground")}><AlertTriangle className="w-10 h-10 mb-3 opacity-30" /><p className="text-sm">Call not found</p><Link to={basePath} className="text-xs text-primary mt-2 hover:underline">← Back to Dashboard</Link></div>;

  const sev = (call.severity as Severity) || 'medium';
  const sevMeta = SEVERITY_META[sev];
  const SevIcon = sevMeta.icon;
  const flaggedKws = call.flagged_keywords || [];

  return (
    <div className={cn(embedded ? "flex flex-col" : "min-h-screen bg-background text-foreground")}>
      {!embedded && (
        <header className="sticky top-0 z-40 h-14 flex items-center gap-3 px-6 border-b border-border bg-background/80 backdrop-blur-xl">
          <Link to={basePath} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Link>
          <div className="w-px h-5 bg-border/50 mx-2" />
          <span className="font-bold text-lg tracking-tight">Call Review</span>
          <Badge variant="destructive" className="text-[10px]">BETA</Badge>
          <div className={`flex items-center gap-1.5 ml-3 ${sevMeta.color}`}><SevIcon className="w-4 h-4" /><span className="text-xs font-bold uppercase">{sevMeta.label}</span></div>
        </header>
      )}

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-6 p-4 rounded-xl border border-border bg-secondary/20">
          <div className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /><div><p className="text-sm font-semibold">{call.agent_name}</p><p className="text-[10px] text-muted-foreground uppercase">Agent</p></div></div>
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><div><p className="text-sm font-semibold">{call.client_name}</p><p className="text-[10px] text-muted-foreground uppercase">Client</p></div></div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><div><p className="text-sm font-semibold">{call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, '0')}` : '—'}</p><p className="text-[10px] text-muted-foreground uppercase">Duration</p></div></div>
          {flaggedKws.length > 0 && <div className="ml-auto flex items-center gap-1.5">{flaggedKws.map((kw: string) => <Badge key={kw} variant="destructive" className="text-[10px]">{kw}</Badge>)}</div>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            {call.summary && <div className="rounded-xl border border-border bg-card/50 p-4"><h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Call Summary</h3><p className="text-sm leading-relaxed">{call.summary}</p></div>}
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Full Transcript</h3>
              <ScrollArea className="h-[55vh]">
                <div className="space-y-1 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {call.transcript.split('\n').map((line: string, i: number) => (
                    <div key={i} className={`py-1.5 px-2 rounded ${line.includes('Agent:') ? 'bg-primary/5' : ''}`}>{highlightKeywords(line, flaggedKws)}</div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-20">
            <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compliance Score</h3>
              {call.compliance_score !== null ? (
                <div className="flex items-center justify-center">
                  <div className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center ${call.compliance_score >= 80 ? 'border-compliance-pass text-compliance-pass' : call.compliance_score >= 60 ? 'border-compliance-review text-compliance-review' : 'border-destructive text-destructive'}`}>
                    <span className="text-2xl font-bold">{call.compliance_score}</span>
                  </div>
                </div>
              ) : <p className="text-xs text-muted-foreground text-center py-4">Score not available</p>}
            </div>
            {callAlerts.length > 0 && (
              <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Flagged Keywords <Badge variant="secondary" className="text-[9px] ml-2">{callAlerts.length}</Badge></h3>
                <div className="space-y-2">
                  {callAlerts.map((alert: any) => {
                    const aSev = (alert.severity as Severity) || 'medium';
                    const aMeta = SEVERITY_META[aSev];
                    return (
                      <div key={alert.id} className="p-2.5 rounded-lg border border-border bg-secondary/10">
                        <div className="flex items-center gap-2"><Badge variant="destructive" className="text-[10px]">{alert.matched_text}</Badge><span className={`text-[10px] font-bold uppercase ${aMeta.color}`}>{aMeta.label}</span></div>
                        {alert.context && <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">{alert.context}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PulseCallReview;
