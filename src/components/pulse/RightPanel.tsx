import React, { useState } from 'react';
import { usePulse } from '@/hooks/usePulseStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Flag, FileText, GraduationCap, ShieldCheck, Plus, AlertTriangle, AlertCircle, Info, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { FlagSeverity, CoachingTask, Rule } from '@/data/pulseTypes';

const severityIcon: Record<FlagSeverity, React.ReactNode> = {
  high: <AlertTriangle className="w-3 h-3 text-compliance-fail" />,
  medium: <AlertCircle className="w-3 h-3 text-compliance-review" />,
  low: <Info className="w-3 h-3 text-primary" />,
};
const severityBg: Record<FlagSeverity, string> = {
  high: 'border-compliance-fail/30 bg-compliance-fail/5',
  medium: 'border-compliance-review/30 bg-compliance-review/5',
  low: 'border-primary/20 bg-primary/5',
};

export const RightPanel: React.FC = () => {
  const { rightTab, setRightTab, calls, selectedCallId } = usePulse();

  return (
    <aside className="flex flex-col h-full border-l border-border/40">
      <Tabs value={rightTab} onValueChange={setRightTab} className="flex flex-col h-full">
        <TabsList className="mx-2 mt-2 bg-secondary/50 h-8">
          <TabsTrigger value="flags" className="text-[10px] gap-1 h-6"><Flag className="w-3 h-3" />Flags</TabsTrigger>
          <TabsTrigger value="scorecard" className="text-[10px] gap-1 h-6"><FileText className="w-3 h-3" />Score</TabsTrigger>
          <TabsTrigger value="coaching" className="text-[10px] gap-1 h-6"><GraduationCap className="w-3 h-3" />Coach</TabsTrigger>
          <TabsTrigger value="rules" className="text-[10px] gap-1 h-6"><ShieldCheck className="w-3 h-3" />Rules</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-auto p-3 scrollbar-thin">
          <TabsContent value="flags" className="mt-0"><FlagsTab /></TabsContent>
          <TabsContent value="scorecard" className="mt-0"><ScorecardTab /></TabsContent>
          <TabsContent value="coaching" className="mt-0"><CoachingTab /></TabsContent>
          <TabsContent value="rules" className="mt-0"><RulesTab /></TabsContent>
        </div>
      </Tabs>
    </aside>
  );
};

const FlagsTab: React.FC = () => {
  const { calls, selectedCallId, addCoachingTask } = usePulse();
  const { toast } = useToast();
  const call = calls.find(c => c.id === selectedCallId);
  if (!call) return <EmptyTabState message="Select a call to view flags" />;
  if (call.flags.length === 0) return <EmptyTabState message="No flags detected — great compliance!" icon={<CheckCircle className="w-8 h-8 text-compliance-pass opacity-30" />} />;

  const grouped = { high: call.flags.filter(f => f.severity === 'high'), medium: call.flags.filter(f => f.severity === 'medium'), low: call.flags.filter(f => f.severity === 'low') };

  return (
    <div className="space-y-4 animate-fade-in">
      {(['high', 'medium', 'low'] as FlagSeverity[]).map(sev => grouped[sev].length > 0 && (
        <div key={sev}>
          <div className="flex items-center gap-1.5 mb-2">
            {severityIcon[sev]}
            <span className="text-[10px] font-semibold uppercase tracking-wider">{sev} Severity</span>
            <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded-full ml-auto">{grouped[sev].length}</span>
          </div>
          <div className="space-y-1.5">
            {grouped[sev].map(flag => (
              <div key={flag.id} className={`p-2.5 rounded-lg border ${severityBg[sev]}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-mono text-[9px] text-muted-foreground">{flag.timestamp}</span>
                </div>
                <p className="text-[11px] font-medium mb-1">"{flag.phrase}"</p>
                <p className="text-[10px] text-muted-foreground mb-2">{flag.recommendation}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2 gap-1"
                  onClick={() => {
                    addCoachingTask({
                      id: `ct-${Date.now()}`,
                      title: `Address: "${flag.phrase.slice(0, 30)}..."`,
                      assignee: call.agent.name,
                      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                      priority: flag.severity,
                      status: 'pending',
                      tags: ['compliance', flag.severity],
                    });
                    toast({ title: 'Coaching task created', description: `Task assigned to ${call.agent.name}` });
                  }}
                >
                  <Plus className="w-3 h-3" /> Create coaching task
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ScorecardTab: React.FC = () => {
  const { calls, selectedCallId, updateScore } = usePulse();
  const { toast } = useToast();
  const call = calls.find(c => c.id === selectedCallId);
  if (!call) return <EmptyTabState message="Select a call to score" />;

  const totalWeighted = call.scorecard.reduce((s, c) => s + (c.score / c.maxScore) * c.weight, 0);
  const totalWeight = call.scorecard.reduce((s, c) => s + c.weight, 0);
  const total = Math.round((totalWeighted / totalWeight) * 100);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold">Scorecard</span>
        <span className={`text-lg font-bold font-mono ${total >= 80 ? 'text-compliance-pass' : total >= 60 ? 'text-compliance-review' : 'text-compliance-fail'}`}>
          {total}%
        </span>
      </div>
      <div className="space-y-3">
        {call.scorecard.map(cat => (
          <div key={cat.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium">{cat.name}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{cat.score}/{cat.maxScore} (w:{cat.weight})</span>
            </div>
            <Slider
              value={[cat.score]}
              max={cat.maxScore}
              step={1}
              onValueChange={([v]) => updateScore(call.id, cat.id, v)}
              className="h-5"
            />
          </div>
        ))}
      </div>
      <Button
        size="sm"
        className="w-full h-8 text-xs"
        onClick={() => toast({ title: 'Scorecard saved', description: `Overall score: ${total}%` })}
      >
        Save Scorecard
      </Button>
    </div>
  );
};

const CoachingTab: React.FC = () => {
  const { coachingTasks, addCoachingTask, updateCoachingTaskStatus, calls, selectedCallId } = usePulse();
  const { toast } = useToast();
  const call = calls.find(c => c.id === selectedCallId);
  const [title, setTitle] = useState('');

  const statusColors = {
    pending: 'bg-compliance-review/15 text-compliance-review',
    'in-progress': 'bg-primary/15 text-primary',
    completed: 'bg-compliance-pass/15 text-compliance-pass',
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">New Task</span>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task description..."
            className="flex-1 h-7 px-2 text-[11px] bg-secondary/60 border border-border/40 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <Button
            size="sm"
            className="h-7 text-[10px] px-2"
            disabled={!title.trim()}
            onClick={() => {
              addCoachingTask({
                id: `ct-${Date.now()}`,
                title: title.trim(),
                assignee: call?.agent.name || 'Unassigned',
                dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                priority: 'medium',
                status: 'pending',
                tags: ['coaching'],
              });
              setTitle('');
              toast({ title: 'Task created' });
            }}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Coaching Plan</span>
        <div className="mt-2 space-y-1.5 text-[11px]">
          {['Review call recording with agent', 'Discuss compliance language requirements', 'Practice objection handling', 'Role-play disclosure script', 'Follow-up assessment in 1 week'].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-secondary/30">
              <input type="checkbox" className="rounded border-border" defaultChecked={i < 2} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tasks ({coachingTasks.length})</span>
        <div className="mt-2 space-y-1.5">
          {coachingTasks.map(t => (
            <div key={t.id} className="p-2 rounded-lg border-2 border-foreground/20 bg-card/50 shadow-sm">
              <div className="flex items-start justify-between gap-1">
                <span className="text-[11px] font-medium">{t.title}</span>
                <button
                  onClick={() => {
                    const next = t.status === 'pending' ? 'in-progress' : t.status === 'in-progress' ? 'completed' : 'pending';
                    updateCoachingTaskStatus(t.id, next as CoachingTask['status']);
                  }}
                  className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${statusColors[t.status]}`}
                >
                  {t.status}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground">
                <span>{t.assignee}</span>
                <span>•</span>
                <span className="font-mono">{t.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RulesTab: React.FC = () => {
  const { rules, toggleRule, addRule } = usePulse();
  const { toast } = useToast();
  const [newPhrase, setNewPhrase] = useState('');
  const [newSeverity, setNewSeverity] = useState<FlagSeverity>('medium');
  const [newAction, setNewAction] = useState<'flag' | 'auto-fail' | 'alert'>('flag');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Active Rules ({rules.filter(r => r.enabled).length}/{rules.length})</span>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-6 text-[10px] px-2 gap-1"><Plus className="w-3 h-3" />New Rule</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-sm">New Rule</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground">Phrase match</label>
                <input
                  value={newPhrase}
                  onChange={e => setNewPhrase(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-secondary border border-border rounded-md mt-1 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="Enter phrase to detect..."
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground">Severity</label>
                  <Select value={newSeverity} onValueChange={v => setNewSeverity(v as FlagSeverity)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground">Action</label>
                  <Select value={newAction} onValueChange={v => setNewAction(v as 'flag' | 'auto-fail' | 'alert')}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flag">Flag</SelectItem>
                      <SelectItem value="auto-fail">Auto-fail</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="w-full h-8 text-xs"
                disabled={!newPhrase.trim()}
                onClick={() => {
                  addRule({
                    id: `r-${Date.now()}`,
                    phrase: newPhrase.trim(),
                    severity: newSeverity,
                    action: newAction,
                    scope: 'All Teams',
                    enabled: true,
                  });
                  setNewPhrase('');
                  setDialogOpen(false);
                  toast({ title: 'Rule created' });
                }}
              >
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-1">
        {rules.map(rule => (
          <div key={rule.id} className="flex items-center gap-2 p-2 rounded-lg border-2 border-foreground/20 shadow-sm hover:bg-card/50">
            <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} className="scale-75" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium truncate">"{rule.phrase}"</div>
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                <span>{rule.scope}</span>
                <span>•</span>
                <span className={rule.action === 'auto-fail' ? 'text-compliance-fail font-semibold' : ''}>{rule.action}</span>
              </div>
            </div>
            {severityIcon[rule.severity]}
          </div>
        ))}
      </div>

      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Risk Policies</span>
        <div className="mt-2 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between p-2 rounded-lg border-2 border-foreground/20 shadow-sm">
            <span>Auto-fail on forbidden phrase</span>
            <Switch defaultChecked className="scale-75" />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg border-2 border-foreground/20 shadow-sm">
            <span>Disclosure completion ≥ 95%</span>
            <Switch defaultChecked className="scale-75" />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg border-2 border-foreground/20 shadow-sm">
            <span>Alert if call &gt; 15 minutes</span>
            <Switch defaultChecked className="scale-75" />
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyTabState: React.FC<{ message: string; icon?: React.ReactNode }> = ({ message, icon }) => (
  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
    {icon || <FileText className="w-8 h-8 opacity-20" />}
    <span className="text-xs">{message}</span>
  </div>
);
