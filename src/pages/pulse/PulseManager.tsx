import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Plus, X, Volume2, VolumeX, AlertTriangle, Code, Type, Quote, Settings, Send, Mail, MessageSquare, Eye, Phone, Users, Upload, FileText, Trash2, CheckCircle2, ToggleLeft, Shield, Flame, Scale, Lock, HandMetal, MessageCircleWarning, Pencil, Check, RotateCcw, Search, Undo2, CloudUpload, Key, UserPlus, Bell, Globe, Smartphone, Radio, Hash, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type MatchType = 'keyword' | 'phrase' | 'regex';
type Severity = 'low' | 'medium' | 'high' | 'critical';
type Category = 'legal' | 'anger' | 'escalation' | 'compliance' | 'pii' | 'rebuttal' | 'safety';

const CATEGORY_META: Record<Category, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  legal: { label: 'Legal', icon: Scale, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
  anger: { label: 'Anger', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' },
  escalation: { label: 'Escalation', icon: AlertTriangle, color: 'text-compliance-review', bg: 'bg-compliance-review/10 border-compliance-review/20' },
  compliance: { label: 'Compliance', icon: Shield, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  pii: { label: 'PII / NIST', icon: Lock, color: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/20' },
  rebuttal: { label: 'Rebuttal', icon: MessageCircleWarning, color: 'text-cyan-600', bg: 'bg-cyan-600/10 border-cyan-600/20' },
  safety: { label: 'Safety', icon: HandMetal, color: 'text-red-600', bg: 'bg-red-600/10 border-red-600/20' },
};

interface WatchEntry { id: string; pattern: string; type: MatchType; category?: Category; }
interface Alert { id: string; entry: WatchEntry; matched: string; context: string; timestamp: Date; agentName: string; clientName: string; severity: Severity; }
interface Recipient { id: string; label: string; value: string; enabled: boolean; }
interface ChannelRecipients { enabled: boolean; credential: string; credentials: Record<string, string>; recipients: Recipient[]; }
type NotificationSettings = Record<string, ChannelRecipients>;

const CHANNEL_ICON_MAP: Record<string, React.ElementType> = { email: Mail, slack: MessageSquare, sms: Phone, teams: Users, discord: Hash, whatsapp: Smartphone, pagerduty: Bell, webhook: Globe, telegram: Send, custom: Radio };
const getChannelIcon = (key: string): React.ElementType => CHANNEL_ICON_MAP[key.toLowerCase()] || Bell;

const PREDEFINED_CHANNELS = [
  { key: 'discord', label: 'Discord' }, { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'pagerduty', label: 'PagerDuty' }, { key: 'webhook', label: 'Webhook' }, { key: 'telegram', label: 'Telegram' },
];

const emptyChannel = (): ChannelRecipients => ({ enabled: false, credential: '', credentials: {}, recipients: [] });
const DEFAULT_CHANNELS: NotificationSettings = { email: emptyChannel(), slack: emptyChannel(), sms: emptyChannel(), teams: emptyChannel() };

const migrateNotifSettings = (raw: any): NotificationSettings => {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_CHANNELS };
  const result: NotificationSettings = {};
  for (const [key, val] of Object.entries(raw)) {
    if (val && typeof val === 'object' && 'recipients' in (val as any)) {
      const ch = val as any;
      result[key] = { enabled: ch.enabled ?? false, credential: ch.credential ?? '', credentials: ch.credentials ?? {}, recipients: Array.isArray(ch.recipients) ? ch.recipients : [] };
    }
  }
  for (const key of Object.keys(DEFAULT_CHANNELS)) { if (!result[key]) result[key] = emptyChannel(); }
  return result;
};

const defaultEntries: WatchEntry[] = [
  { id: '1', pattern: 'cancel', type: 'keyword', category: 'legal' },
  { id: '2', pattern: 'refund', type: 'keyword', category: 'legal' },
  { id: '3', pattern: 'lawsuit', type: 'keyword', category: 'legal' },
  { id: '4', pattern: 'attorney', type: 'keyword', category: 'legal' },
  { id: '20', pattern: 'furious', type: 'keyword', category: 'anger' },
  { id: '21', pattern: 'outraged', type: 'keyword', category: 'anger' },
  { id: '40', pattern: 'speak to a supervisor', type: 'phrase', category: 'escalation' },
  { id: '41', pattern: 'speak to a manager', type: 'phrase', category: 'escalation' },
  { id: '60', pattern: 'I guarantee', type: 'phrase', category: 'compliance' },
  { id: '61', pattern: 'I promise', type: 'phrase', category: 'compliance' },
  { id: '70', pattern: 'social security', type: 'phrase', category: 'pii' },
  { id: '80', pattern: 'too expensive', type: 'phrase', category: 'rebuttal' },
  { id: '90', pattern: 'lawsuit|attorney|legal action|litigat', type: 'regex', category: 'legal' },
  { id: '93', pattern: 'discriminat|harass|threaten', type: 'regex', category: 'safety' },
  { id: '96', pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b', type: 'regex', category: 'pii' },
];

// Compliance Scripts sub-component
interface ComplianceScript { id: string; name: string; file_path: string; file_size: number; mime_type: string; description: string | null; is_active: boolean; created_at: string; }
const ACCEPTED_TYPES = '.txt,.pdf,.doc,.docx,.md';

const ComplianceScripts: React.FC = () => {
  const [scripts, setScripts] = useState<ComplianceScript[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchScripts = useCallback(async () => {
    const { data } = await supabase.from('pulse_compliance_scripts' as any).select('*').order('created_at', { ascending: false });
    if (data) setScripts(data as unknown as ComplianceScript[]);
  }, []);

  useEffect(() => { fetchScripts(); }, [fetchScripts]);

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10 MB'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'txt';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: storageErr } = await supabase.storage.from('pulse-compliance-scripts').upload(path, file);
      if (storageErr) throw storageErr;
      const { error: dbErr } = await supabase.from('pulse_compliance_scripts' as any).insert({ name: file.name, file_path: path, file_size: file.size, mime_type: file.type || 'application/octet-stream' } as any);
      if (dbErr) throw dbErr;
      toast.success(`"${file.name}" uploaded`);
      fetchScripts();
    } catch (err: any) { toast.error(err.message || 'Upload failed'); } finally { setUploading(false); }
  }, [fetchScripts]);

  const deleteScript = useCallback(async (script: ComplianceScript) => {
    await supabase.storage.from('pulse-compliance-scripts').remove([script.file_path]);
    await supabase.from('pulse_compliance_scripts' as any).delete().eq('id', script.id);
    toast.success(`"${script.name}" removed`);
    fetchScripts();
  }, [fetchScripts]);

  const toggleActive = useCallback(async (script: ComplianceScript) => {
    await supabase.from('pulse_compliance_scripts' as any).update({ is_active: !script.is_active } as any).eq('id', script.id);
    fetchScripts();
  }, [fetchScripts]);

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) uploadFile(file); }, [uploadFile]);
  const formatSize = (bytes: number) => { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; };
  const getPublicUrl = (path: string) => { const { data } = supabase.storage.from('pulse-compliance-scripts').getPublicUrl(path); return data.publicUrl; };

  return (
    <div className="rounded-xl border-2 border-foreground/30 bg-card/50 shadow-md hover:shadow-lg transition-shadow duration-200 p-4 space-y-3">
      <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">Scripts</h3><Badge variant="secondary" className="text-[9px] h-4 px-1.5 ml-auto">{scripts.filter(s => s.is_active).length} active</Badge></div>
      <p className="text-xs text-muted-foreground leading-relaxed">Upload call scripts that agents should follow.</p>
      <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()} className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors shadow-md ${dragOver ? 'border-primary bg-primary/5' : 'border-foreground/35 hover:border-primary/40 hover:bg-secondary/20'}`}>
        <Upload className={`w-6 h-6 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="text-xs text-muted-foreground">{uploading ? 'Uploading…' : 'Drop a script file here or click to browse'}</span>
        <span className="text-[10px] text-muted-foreground/60">TXT, PDF, DOC, DOCX, MD — max 10 MB</span>
        <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) uploadFile(file); e.target.value = ''; }} />
      </div>
      {scripts.length > 0 && (
        <ScrollArea className={scripts.length > 4 ? 'max-h-56' : ''}>
          <div className="space-y-1.5">
            {scripts.map(script => (
              <div key={script.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors group ${script.is_active ? 'border-primary/20 bg-primary/5' : 'border-border/30 bg-secondary/10 opacity-60'}`}>
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <a href={getPublicUrl(script.file_path)} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline truncate block">{script.name}</a>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{formatSize(script.file_size)}</span><span>•</span><span>{new Date(script.created_at).toLocaleDateString()}</span>
                    {script.is_active && <><span>•</span><span className="flex items-center gap-0.5 text-compliance-pass"><CheckCircle2 className="w-2.5 h-2.5" /> Active</span></>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => toggleActive(script)}><ToggleLeft className={`w-3.5 h-3.5 ${script.is_active ? 'text-compliance-pass' : 'text-muted-foreground'}`} /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteScript(script)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      {scripts.length === 0 && !uploading && <p className="text-[10px] text-muted-foreground/50 italic text-center py-2">No scripts uploaded yet</p>}
    </div>
  );
};

const PulseManager: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [entries, setEntries] = useState<WatchEntry[]>(() => {
    try { const saved = localStorage.getItem('pulse-watch-entries'); if (saved) return JSON.parse(saved); } catch {}
    return defaultEntries;
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [newPhrase, setNewPhrase] = useState('');
  const [newRegex, setNewRegex] = useState('');
  const [regexError, setRegexError] = useState<string | null>(null);
  const [openTypeModal, setOpenTypeModal] = useState<MatchType | null>(null);
  const [keywordViewMode, setKeywordViewMode] = useState<'list' | 'horizontal'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previousEntries, setPreviousEntries] = useState<WatchEntry[] | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const defaultNotifSettings: NotificationSettings = useMemo(() => ({ ...DEFAULT_CHANNELS }), []);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('pulse-notif-settings');
    if (saved) { try { return migrateNotifSettings(JSON.parse(saved)); } catch {} }
    return defaultNotifSettings;
  });
  const [dbLoaded, setDbLoaded] = useState(false);
  const [dbPatternsLoaded, setDbPatternsLoaded] = useState(false);
  const [patternsSyncedAt, setPatternsSyncedAt] = useState<Date | null>(null);
  const [notifSyncedAt, setNotifSyncedAt] = useState<Date | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const patternsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load patterns from DB
  useEffect(() => {
    const loadPatternsFromDb = async () => {
      try {
        const { data, error } = await supabase.from('pulse_watch_patterns' as any).select('patterns').eq('config_key', 'default').maybeSingle();
        if (!error && data && (data as any).patterns) {
          const dbPatterns = (data as any).patterns as WatchEntry[];
          if (Array.isArray(dbPatterns) && dbPatterns.length > 0) { setEntries(dbPatterns); localStorage.setItem('pulse-watch-entries', JSON.stringify(dbPatterns)); }
        }
      } catch {} finally { setDbPatternsLoaded(true); }
    };
    loadPatternsFromDb();
  }, []);

  // Load notif settings from DB
  useEffect(() => {
    const loadFromDb = async () => {
      try {
        const { data, error } = await supabase.from('pulse_notification_settings' as any).select('settings').eq('config_key', 'default').maybeSingle();
        if (!error && data && (data as any).settings) {
          const parsed = migrateNotifSettings((data as any).settings);
          setNotifSettings(parsed);
          localStorage.setItem('pulse-notif-settings', JSON.stringify(parsed));
        }
      } catch {} finally { setDbLoaded(true); }
    };
    loadFromDb();
  }, []);

  // Persist watch entries
  useEffect(() => {
    localStorage.setItem('pulse-watch-entries', JSON.stringify(entries));
    if (!dbPatternsLoaded) return;
    if (patternsDebounceRef.current) clearTimeout(patternsDebounceRef.current);
    patternsDebounceRef.current = setTimeout(async () => {
      try {
        const { data: existing } = await supabase.from('pulse_watch_patterns' as any).select('id').eq('config_key', 'default').maybeSingle();
        if (existing) { await supabase.from('pulse_watch_patterns' as any).update({ patterns: entries as any, updated_at: new Date().toISOString() } as any).eq('config_key', 'default'); }
        else { await supabase.from('pulse_watch_patterns' as any).insert({ config_key: 'default', patterns: entries as any } as any); }
        setPatternsSyncedAt(new Date());
      } catch {}
    }, 1000);
    return () => { if (patternsDebounceRef.current) clearTimeout(patternsDebounceRef.current); };
  }, [entries, dbPatternsLoaded]);

  // Persist notif settings
  useEffect(() => {
    localStorage.setItem('pulse-notif-settings', JSON.stringify(notifSettings));
    if (!dbLoaded) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data: existing } = await supabase.from('pulse_notification_settings' as any).select('id').eq('config_key', 'default').maybeSingle();
        if (existing) { await supabase.from('pulse_notification_settings' as any).update({ settings: notifSettings as any, updated_at: new Date().toISOString() } as any).eq('config_key', 'default'); }
        else { await supabase.from('pulse_notification_settings' as any).insert({ config_key: 'default', settings: notifSettings as any } as any); }
        setNotifSyncedAt(new Date());
      } catch {}
    }, 1000);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [notifSettings, dbLoaded]);

  const resetToDefaults = useCallback(() => { setPreviousEntries(entries); setEntries(defaultEntries); toast.success(`Reset to ${defaultEntries.length} default patterns`); }, [entries]);
  const restorePrevious = useCallback(() => { if (previousEntries) { setEntries(previousEntries); setPreviousEntries(null); toast.success(`Restored ${previousEntries.length} patterns`); } }, [previousEntries]);

  const addEntry = useCallback((type: MatchType) => {
    const inputMap = { keyword: newKeyword, phrase: newPhrase, regex: newRegex };
    const setterMap = { keyword: setNewKeyword, phrase: setNewPhrase, regex: setNewRegex };
    const pattern = inputMap[type].trim();
    if (!pattern) return;
    if (entries.some(e => e.pattern === pattern && e.type === type)) return;
    if (type === 'regex') { try { new RegExp(pattern); } catch (e: any) { setRegexError(e.message); return; } }
    setRegexError(null);
    setEntries(prev => [...prev, { id: crypto.randomUUID(), pattern, type }]);
    setterMap[type]('');
  }, [newKeyword, newPhrase, newRegex, entries]);

  const removeEntry = useCallback((id: string) => { setEntries(prev => prev.filter(e => e.id !== id)); }, []);
  const startEdit = useCallback((entry: WatchEntry) => { setEditingId(entry.id); setEditValue(entry.pattern); }, []);
  const saveEdit = useCallback((id: string, type: MatchType) => {
    const pattern = editValue.trim();
    if (!pattern) return;
    if (type === 'regex') { try { new RegExp(pattern); } catch { return; } }
    setEntries(prev => prev.map(e => e.id === id ? { ...e, pattern } : e));
    setEditingId(null); setEditValue('');
  }, [editValue]);

  const toggleChannel = useCallback((channel: string) => { setNotifSettings(prev => ({ ...prev, [channel]: { ...prev[channel], enabled: !prev[channel].enabled } })); }, []);
  const setChannelCredentialField = useCallback((channel: string, field: string, value: string) => { setNotifSettings(prev => ({ ...prev, [channel]: { ...prev[channel], credentials: { ...prev[channel].credentials, [field]: value } } })); }, []);
  const addRecipient = useCallback((channel: string, label: string, value: string) => {
    if (!value.trim()) return;
    setNotifSettings(prev => ({ ...prev, [channel]: { ...prev[channel], recipients: [...prev[channel].recipients, { id: crypto.randomUUID(), label: label || value.split('@')[0] || `${channel} ${prev[channel].recipients.length + 1}`, value: value.trim(), enabled: true }] } }));
  }, []);
  const removeRecipient = useCallback((channel: string, id: string) => { setNotifSettings(prev => ({ ...prev, [channel]: { ...prev[channel], recipients: prev[channel].recipients.filter(r => r.id !== id) } })); }, []);
  const toggleRecipient = useCallback((channel: string, id: string) => { setNotifSettings(prev => ({ ...prev, [channel]: { ...prev[channel], recipients: prev[channel].recipients.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r) } })); }, []);
  const updateRecipient = useCallback((channel: string, id: string, updates: Partial<Recipient>) => { setNotifSettings(prev => ({ ...prev, [channel]: { ...prev[channel], recipients: prev[channel].recipients.map(r => r.id === id ? { ...r, ...updates } : r) } })); }, []);
  const addChannel = useCallback((key: string) => { setNotifSettings(prev => { if (prev[key]) { toast.error(`${key} already exists`); return prev; } return { ...prev, [key]: emptyChannel() }; }); toast.success(`Added ${key} channel`); }, []);
  const removeChannel = useCallback((key: string) => { setNotifSettings(prev => { const next = { ...prev }; delete next[key]; return next; }); toast.success(`Removed ${key} channel`); }, []);

  const activeRecipientCount = Object.values(notifSettings).reduce((acc, c) => acc + (c.enabled ? c.recipients.filter(r => r.enabled).length : 0), 0);

  const [recipientsModalOpen, setRecipientsModalOpen] = useState(false);
  const [recipientsModalChannel, setRecipientsModalChannel] = useState<string | null>(null);
  const [credentialEditChannel, setCredentialEditChannel] = useState<string | null>(null);
  const [credentialEditField, setCredentialEditField] = useState<string | null>(null);
  const [addChannelModalOpen, setAddChannelModalOpen] = useState(false);
  const [customChannelName, setCustomChannelName] = useState('');

  return (
    <div className={embedded ? "" : "min-h-screen bg-background text-foreground"}>
      {!embedded && (
        <header className="sticky top-0 z-40 h-14 flex items-center gap-3 px-6 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <Link to="/pulse" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-3.5 h-3.5" /></Link>
          <Settings className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg tracking-tight">Compliance Settings</span>
          <Badge variant="destructive" className="text-[10px]">BETA</Badge>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${soundEnabled ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => setSoundEnabled(p => !p)}>
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Badge variant="secondary" className="text-[10px]">{entries.length} patterns</Badge>
        </header>
      )}

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Watch Patterns */}
          <div className="rounded-xl border-2 border-foreground/30 bg-card/50 shadow-md p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Watch Patterns</h3>
              {patternsSyncedAt && <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-1"><CloudUpload className="w-3 h-3 text-compliance-pass" /><span>Synced</span></div>}
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5 ml-auto">{entries.length}</Badge>
            </div>
            <div className="space-y-2">
              {([
                { type: 'keyword' as MatchType, label: 'Keywords', icon: Type, color: 'text-primary', desc: 'Single words flagged anywhere in speech' },
                { type: 'phrase' as MatchType, label: 'Phrases', icon: Quote, color: 'text-compliance-review', desc: 'Exact multi-word sequences to detect' },
                { type: 'regex' as MatchType, label: 'Regex', icon: Code, color: 'text-destructive', desc: 'Advanced pattern matching' },
              ]).map(item => {
                const Icon = item.icon;
                const count = entries.filter(e => e.type === item.type).length;
                return (
                  <div key={item.type} className="rounded-lg p-3 shadow-sm border border-foreground/10 border-2 border-foreground/30 bg-card/50">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <div className="flex-1 min-w-0"><span className={`text-xs font-semibold ${item.color}`}>{item.label}</span><p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{item.desc}</p></div>
                      <Button variant="outline" size="sm" className="h-6 text-[9px] gap-1 px-2 shrink-0" onClick={() => setOpenTypeModal(item.type)}><Plus className="w-2.5 h-2.5" /> Add</Button>
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5 shrink-0">{count}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 flex-1" onClick={resetToDefaults}><RotateCcw className="w-3 h-3" /> Reset</Button>
              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 flex-1" onClick={restorePrevious} disabled={!previousEntries}><Undo2 className="w-3 h-3" /> Restore</Button>
            </div>
          </div>

          {/* Type Modals */}
          {([
            { type: 'keyword' as MatchType, label: 'Keywords', icon: Type, color: 'text-primary', example: 'cancel', value: newKeyword, setter: setNewKeyword, mono: false },
            { type: 'phrase' as MatchType, label: 'Phrases', icon: Quote, color: 'text-compliance-review', example: 'speak to a supervisor', value: newPhrase, setter: setNewPhrase, mono: false },
            { type: 'regex' as MatchType, label: 'Regex Patterns', icon: Code, color: 'text-destructive', example: 'lawsuit|attorney', value: newRegex, setter: (v: string) => { setNewRegex(v); setRegexError(null); }, mono: true },
          ]).map(section => {
            const allItems = entries.filter(e => e.type === section.type);
            const items = searchFilter ? allItems.filter(e => e.pattern.toLowerCase().includes(searchFilter.toLowerCase())) : allItems;
            const Icon = section.icon;
            return (
              <Dialog key={section.type} open={openTypeModal === section.type} onOpenChange={open => { setOpenTypeModal(open ? section.type : null); if (!open) { setSearchFilter(''); setSelectedIds(new Set()); } }}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
                  <DialogHeader><DialogTitle className="flex items-center gap-2"><Icon className={`w-5 h-5 ${section.color}`} />{section.label}<Badge variant="secondary" className="text-[10px] ml-1">{allItems.length}</Badge></DialogTitle></DialogHeader>
                  <div className="flex items-center gap-2">
                    <input type="text" value={section.value} onChange={e => section.setter(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEntry(section.type)} placeholder={`Add ${section.type}… e.g. ${section.example}`} className={`flex-1 h-9 px-3 text-sm bg-secondary/30 border border-border/40 rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 ${section.mono ? 'font-mono' : ''}`} autoFocus />
                    <Button size="sm" className="h-9 gap-1" onClick={() => addEntry(section.type)}><Plus className="w-3.5 h-3.5" /> Add</Button>
                  </div>
                  {section.type === 'regex' && regexError && <p className="text-xs text-destructive -mt-1">Invalid: {regexError}</p>}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                    <input type="text" value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="Search patterns…" className="w-full h-8 pl-8 pr-3 text-xs bg-secondary/20 border border-border/30 rounded-md placeholder:text-muted-foreground/40 focus:outline-none" />
                  </div>
                  {items.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Checkbox checked={items.length > 0 && items.every(e => selectedIds.has(e.id))} onCheckedChange={checked => { setSelectedIds(prev => { const next = new Set(prev); items.forEach(e => { if (checked) next.add(e.id); else next.delete(e.id); }); return next; }); }} />
                      <span className="text-[11px] text-muted-foreground flex-1">{selectedIds.size > 0 && items.some(e => selectedIds.has(e.id)) ? `${items.filter(e => selectedIds.has(e.id)).length} selected` : 'Select all'}</span>
                      {items.some(e => selectedIds.has(e.id)) && (
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 text-destructive border-destructive/30" onClick={() => { setEntries(prev => prev.filter(e => !selectedIds.has(e.id))); setSelectedIds(new Set()); toast.success('Deleted'); }}><Trash2 className="w-3 h-3" /> Delete</Button>
                      )}
                    </div>
                  )}
                  <ScrollArea className="flex-1 min-h-0 max-h-[55vh] overflow-y-auto">
                    {items.length === 0 ? (
                      <p className="text-sm text-muted-foreground/60 italic text-center py-6">{searchFilter ? 'No matches' : `No ${section.label.toLowerCase()} yet`}</p>
                    ) : (
                      <div className="space-y-1 pr-3">
                        {items.map(entry => {
                          const catMeta = entry.category ? CATEGORY_META[entry.category] : null;
                          const isEditing = editingId === entry.id;
                          return (
                            <div key={entry.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors group cursor-pointer ${selectedIds.has(entry.id) ? 'border-primary/30 bg-primary/5' : 'border-border/30 hover:bg-secondary/20'}`} onClick={() => { if (!isEditing) setSelectedIds(prev => { const next = new Set(prev); if (next.has(entry.id)) next.delete(entry.id); else next.add(entry.id); return next; }); }}>
                              {!isEditing && <Checkbox checked={selectedIds.has(entry.id)} onCheckedChange={() => {}} className="shrink-0 pointer-events-none" />}
                              {isEditing ? (
                                <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveEdit(entry.id, section.type); if (e.key === 'Escape') setEditingId(null); }} className={`flex-1 h-7 px-2 text-sm bg-secondary/40 border border-primary/30 rounded ${section.mono ? 'font-mono' : ''}`} autoFocus />
                              ) : (
                                <span className={`text-sm flex-1 truncate ${section.mono ? 'font-mono' : ''}`}>{entry.pattern}</span>
                              )}
                              {catMeta && !isEditing && <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${catMeta.bg} ${catMeta.color}`}>{catMeta.label}</span>}
                              {isEditing ? (
                                <><button onClick={e => { e.stopPropagation(); saveEdit(entry.id, section.type); }} className="text-compliance-pass shrink-0"><Check className="w-3.5 h-3.5" /></button><button onClick={e => { e.stopPropagation(); setEditingId(null); }} className="text-muted-foreground shrink-0"><X className="w-3.5 h-3.5" /></button></>
                              ) : (
                                <><button onClick={e => { e.stopPropagation(); startEdit(entry); }} className="text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100"><Pencil className="w-3 h-3" /></button><button onClick={e => { e.stopPropagation(); removeEntry(entry.id); }} className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100"><X className="w-3.5 h-3.5" /></button></>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            );
          })}

          {/* Notification Channels */}
          <div className="rounded-xl border-2 border-foreground/30 bg-card/50 shadow-md p-4 space-y-3 overflow-hidden">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Notification Channels</h3>
              {notifSyncedAt && <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-1"><CloudUpload className="w-3 h-3 text-compliance-pass" /><span>Synced</span></div>}
              {activeRecipientCount > 0 && <Badge variant="default" className="text-[9px] h-4 px-1.5 ml-auto">{activeRecipientCount} active</Badge>}
            </div>
            <div className="space-y-2">
              {Object.entries(notifSettings).map(([channelKey, ch]) => {
                const Icon = getChannelIcon(channelKey);
                const label = channelKey.charAt(0).toUpperCase() + channelKey.slice(1);
                const enabledMembers = ch.recipients.filter(r => r.enabled).length;
                const isDefault = ['email', 'slack', 'sms', 'teams'].includes(channelKey);
                return (
                  <div key={channelKey} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border-2 border-foreground/30 bg-card/50 shadow-md group">
                    <Switch checked={ch.enabled} onCheckedChange={() => toggleChannel(channelKey)} className="scale-75 shrink-0" />
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[11px] font-semibold shrink-0">{label}</span>
                    <div className="flex-1" />
                    <button onClick={() => { setRecipientsModalChannel(channelKey); setRecipientsModalOpen(true); }} className="inline-flex items-center gap-1 px-3 py-0.5 text-[10px] font-semibold rounded border-2 border-primary/30 bg-primary/10 shadow-md hover:bg-primary/20 cursor-pointer shrink-0"><Plus className="w-2.5 h-2.5" /> Add Users</button>
                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5 shrink-0">{enabledMembers}/{ch.recipients.length}</Badge>
                    {!isDefault && <button onClick={() => removeChannel(channelKey)} className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100"><X className="w-3.5 h-3.5" /></button>}
                  </div>
                );
              })}
            </div>
            <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5" onClick={() => setAddChannelModalOpen(true)}><Plus className="w-3 h-3" /> Add Channel</Button>
          </div>

          {/* Recipients Modal */}
          <Dialog open={recipientsModalOpen} onOpenChange={v => { setRecipientsModalOpen(v); if (!v) setRecipientsModalChannel(null); }}>
            <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
              {recipientsModalChannel && notifSettings[recipientsModalChannel] && (() => {
                const channelMeta: Record<string, { placeholder: string; labelPlaceholder: string }> = {
                  email: { placeholder: 'alice@company.com', labelPlaceholder: 'e.g. Alice' },
                  slack: { placeholder: 'https://hooks.slack.com/services/...', labelPlaceholder: 'e.g. #alerts' },
                  sms: { placeholder: '+1 555-123-4567', labelPlaceholder: 'e.g. On-call Mgr' },
                  teams: { placeholder: 'https://outlook.office.com/webhook/...', labelPlaceholder: 'e.g. Compliance' },
                };
                const meta = channelMeta[recipientsModalChannel] || { placeholder: 'Enter destination…', labelPlaceholder: 'e.g. Label' };
                const Icon = getChannelIcon(recipientsModalChannel);
                const channelLabel = recipientsModalChannel.charAt(0).toUpperCase() + recipientsModalChannel.slice(1);
                const recipients = notifSettings[recipientsModalChannel].recipients;
                return (
                  <>
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><Icon className="w-5 h-5 text-primary" />{channelLabel} Users<Badge variant="secondary" className="text-[10px] ml-1">{recipients.length}</Badge></DialogTitle></DialogHeader>
                    <ScrollArea className="flex-1 min-h-0 max-h-[55vh]">
                      <div className="space-y-2 pr-3">
                        {recipients.map(r => (
                          <div key={r.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border group ${r.enabled ? 'border-primary/20 bg-primary/5' : 'border-border/30 bg-secondary/10 opacity-60'}`}>
                            <Switch checked={r.enabled} onCheckedChange={() => toggleRecipient(recipientsModalChannel, r.id)} className="scale-75" />
                            <span className="text-[11px] font-semibold min-w-[60px] truncate">{r.label}</span>
                            <span className="text-[10px] text-muted-foreground truncate flex-1 font-mono">{r.value}</span>
                            <button onClick={() => removeRecipient(recipientsModalChannel, r.id)} className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                        {recipients.length === 0 && <p className="text-sm text-muted-foreground/50 italic text-center py-4">No users yet.</p>}
                      </div>
                    </ScrollArea>
                    <div className="pt-2 border-t border-border/30">
                      <RecipientAdder channel={recipientsModalChannel} placeholder={meta.placeholder} labelPlaceholder={meta.labelPlaceholder} onAdd={addRecipient} />
                    </div>
                  </>
                );
              })()}
            </DialogContent>
          </Dialog>

          {/* Credential Edit Dialog */}
          <Dialog open={!!credentialEditChannel && !!credentialEditField} onOpenChange={v => { if (!v) { setCredentialEditChannel(null); setCredentialEditField(null); } }}>
            <DialogContent className="sm:max-w-md">
              {credentialEditChannel && credentialEditField && (() => {
                const fieldLabels: Record<string, string> = { apiKey: 'API Key', secret: 'Secret Token', webhook: 'Webhook URL' };
                const channelLabel = credentialEditChannel.charAt(0).toUpperCase() + credentialEditChannel.slice(1);
                return (
                  <>
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><Key className="w-4 h-4 text-primary" />{channelLabel} — {fieldLabels[credentialEditField] || credentialEditField}</DialogTitle></DialogHeader>
                    <input type="text" defaultValue={notifSettings[credentialEditChannel]?.credentials?.[credentialEditField] || ''} placeholder="Enter value…" className="w-full h-9 px-3 text-sm font-mono bg-secondary/30 border border-border/40 rounded-md" autoFocus onKeyDown={e => { if (e.key === 'Enter') { setChannelCredentialField(credentialEditChannel, credentialEditField, (e.target as HTMLInputElement).value); setCredentialEditChannel(null); setCredentialEditField(null); toast.success('Saved'); } }} />
                    <DialogFooter>
                      <Button variant="outline" size="sm" onClick={() => { setCredentialEditChannel(null); setCredentialEditField(null); }}>Cancel</Button>
                    </DialogFooter>
                  </>
                );
              })()}
            </DialogContent>
          </Dialog>

          {/* Add Channel Modal */}
          <Dialog open={addChannelModalOpen} onOpenChange={v => { setAddChannelModalOpen(v); if (!v) setCustomChannelName(''); }}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Add Channel</DialogTitle></DialogHeader>
              <div className="space-y-2">
                {PREDEFINED_CHANNELS.filter(pc => !notifSettings[pc.key]).map(pc => {
                  const Icon = getChannelIcon(pc.key);
                  return (<button key={pc.key} onClick={() => { addChannel(pc.key); setAddChannelModalOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-foreground/30 bg-card/50 shadow-md hover:bg-foreground/5 cursor-pointer"><Icon className="w-4 h-4 text-muted-foreground" /><span className="text-xs font-semibold">{pc.label}</span></button>);
                })}
              </div>
              <div className="border-t border-border/30 pt-3 space-y-2">
                <p className="text-[11px] text-muted-foreground font-medium">Or add custom:</p>
                <div className="flex items-center gap-1.5">
                  <input type="text" value={customChannelName} onChange={e => setCustomChannelName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && customChannelName.trim()) { addChannel(customChannelName.trim().toLowerCase().replace(/\s+/g, '_')); setAddChannelModalOpen(false); setCustomChannelName(''); } }} placeholder="e.g. Discord…" className="flex-1 h-8 px-2.5 text-xs bg-secondary/30 border border-border/40 rounded-md" autoFocus />
                  <Button size="sm" className="h-8 text-xs gap-1" disabled={!customChannelName.trim()} onClick={() => { addChannel(customChannelName.trim().toLowerCase().replace(/\s+/g, '_')); setAddChannelModalOpen(false); setCustomChannelName(''); }}><Plus className="w-3 h-3" /> Add</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ComplianceScripts />
      </main>
    </div>
  );
};

const RecipientAdder: React.FC<{ channel: string; placeholder: string; labelPlaceholder: string; onAdd: (channel: any, label: string, value: string) => void }> = ({ channel, placeholder, labelPlaceholder, onAdd }) => {
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  return (
    <div className="flex items-center gap-1.5">
      <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder={labelPlaceholder} className="w-24 h-7 px-2 text-[11px] bg-secondary/30 border border-border/40 rounded-md" />
      <input type="text" value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && value.trim()) { onAdd(channel, label, value); setLabel(''); setValue(''); } }} placeholder={placeholder} className="flex-1 h-7 px-2 text-[11px] font-mono bg-secondary/30 border border-border/40 rounded-md" />
      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0" onClick={() => { if (value.trim()) { onAdd(channel, label, value); setLabel(''); setValue(''); } }}><Plus className="w-3.5 h-3.5" /></Button>
    </div>
  );
};

export default PulseManager;
