import { useState, useEffect } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Mail, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Open', icon: AlertCircle, variant: 'destructive' },
  in_progress: { label: 'In Progress', icon: Clock, variant: 'default' },
  resolved: { label: 'Resolved', icon: CheckCircle, variant: 'secondary' },
  closed: { label: 'Closed', icon: XCircle, variant: 'outline' },
};

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Failed to load tickets', variant: 'destructive' });
      console.error(error);
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    } else {
      toast({ title: `Ticket marked as ${statusConfig[newStatus]?.label || newStatus}` });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    }
  };

  const filtered = tickets.filter(t => {
    const matchesSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      (t.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      t.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminShell breadcrumb=" / Employee Requests">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Employee Requests</h1>
          <p className="text-sm text-muted-foreground">{tickets.length} total requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTickets} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
              className={`rounded-xl border p-4 text-left transition-all ${
                filterStatus === key ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{cfg.label}</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{statusCounts[key] || 0}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, subject, or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading tickets...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search || filterStatus !== 'all' ? 'No tickets match your filters.' : 'No support tickets yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const cfg = statusConfig[ticket.status] || statusConfig.open;
            const isExpanded = expandedId === ticket.id;

            return (
              <div key={ticket.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                  className="w-full px-5 py-4 text-left flex items-start gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-foreground">{ticket.name}</span>
                      <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{ticket.subject || ticket.message}</p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(ticket.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Email</span>
                        <a href={`mailto:${ticket.email}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-0.5">
                          <Mail className="w-3.5 h-3.5" /> {ticket.email}
                        </a>
                      </div>
                      {ticket.subject && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Subject</span>
                          <p className="text-sm text-foreground mt-0.5">{ticket.subject}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Message</span>
                      <p className="text-sm text-foreground mt-1 whitespace-pre-wrap bg-muted/30 rounded-lg p-3">{ticket.message}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground">Update status:</span>
                      <Select value={ticket.status} onValueChange={(v) => updateStatus(ticket.id, v)}>
                        <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
