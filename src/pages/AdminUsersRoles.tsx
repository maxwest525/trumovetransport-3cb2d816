import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { Users, Plus, Shield, Crown, BarChart3, UserCheck, Loader2, Mail, X, Sparkles, DollarSign, Pencil, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type AppRole = "owner" | "admin" | "manager" | "agent" | "marketing" | "accounting";

interface UserWithRole {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  role: AppRole | null;
}

const ROLE_CONFIG: Record<AppRole, { label: string; icon: React.ElementType; color: string }> = {
  owner: { label: "Owner", icon: Crown, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  admin: { label: "Admin", icon: Shield, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  manager: { label: "Manager", icon: BarChart3, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  agent: { label: "Agent", icon: UserCheck, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  marketing: { label: "Marketing", icon: Sparkles, color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400" },
  accounting: { label: "Accounting", icon: DollarSign, color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400" },
};

export default function AdminUsersRoles() {
  const { toast } = useToast();
  const { isOwner, isAdmin, userId } = useUserRole();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("agent");
  const [inviting, setInviting] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");

    const roleMap = new Map<string, AppRole>();
    (roles ?? []).forEach((r: any) => roleMap.set(r.user_id, r.role));

    const combined: UserWithRole[] = (profiles ?? []).map((p: any) => ({
      id: p.id,
      email: p.email,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      created_at: p.created_at,
      role: roleMap.get(p.id) ?? null,
    }));

    const order: Record<string, number> = { owner: 0, admin: 1, manager: 2, agent: 3, marketing: 4, accounting: 5 };
    combined.sort((a, b) => (order[a.role ?? ""] ?? 6) - (order[b.role ?? ""] ?? 6));

    setUsers(combined);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);

    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { action: "invite", email: inviteEmail.trim(), role: inviteRole, display_name: inviteName.trim() || undefined },
    });

    setInviting(false);
    if (error || data?.error) {
      toast({ title: "Invite failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "Invite sent", description: `${inviteEmail} invited as ${inviteRole}` });
      setInviteEmail("");
      setInviteName("");
      setInviteOpen(false);
      fetchUsers();
    }
  };

  const handleChangeRole = async (targetUserId: string, newRole: AppRole) => {
    setChangingRole(targetUserId);
    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { action: "assign_role", user_id: targetUserId, role: newRole },
    });
    setChangingRole(null);
    if (error || data?.error) {
      toast({ title: "Role change failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "Role updated", description: `Role changed to ${newRole}` });
      fetchUsers();
    }
  };

  const handleRemoveRole = async (targetUserId: string) => {
    setChangingRole(targetUserId);
    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { action: "remove_role", user_id: targetUserId },
    });
    setChangingRole(null);
    if (error || data?.error) {
      toast({ title: "Failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "Role removed" });
      fetchUsers();
    }
  };

  const handleDeleteUser = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    setDeletingUser(targetUserId);
    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { action: "delete_user", user_id: targetUserId },
    });
    setDeletingUser(null);
    if (error || data?.error) {
      toast({ title: "Delete failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "User deleted" });
      fetchUsers();
    }
  };

  const handleSaveName = async (targetUserId: string) => {
    if (!editNameValue.trim()) return;
    setChangingRole(targetUserId);
    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { action: "update_name", user_id: targetUserId, display_name: editNameValue.trim() },
    });
    setChangingRole(null);
    setEditingName(null);
    if (error || data?.error) {
      toast({ title: "Update failed", description: data?.error || error?.message, variant: "destructive" });
    } else {
      toast({ title: "Name updated" });
      fetchUsers();
    }
  };

  const availableRoles: AppRole[] = isOwner
    ? ["owner", "admin", "manager", "agent", "marketing", "accounting"]
    : ["admin", "manager", "agent", "marketing", "accounting"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Users & Roles</h1>
          <p className="text-sm text-muted-foreground">{users.length} users in your organization</p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Invite User
        </button>
      </div>

      {/* Invite Form */}
      {inviteOpen && (
        <div className="rounded-xl border border-border bg-card p-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" /> Invite a new user
            </h2>
            <button onClick={() => setInviteOpen(false)} className="p-1 rounded hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="text"
              placeholder="Display name (optional)"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="sm:w-40 h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as AppRole)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {availableRoles.map((r) => (
                <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="h-9 px-5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {inviting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Send Invite
            </button>
          </form>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_140px_220px] items-center gap-4 px-4 py-2.5 border-b border-border bg-muted/30">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">User</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Role</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</span>
          </div>
          {users.map((user) => {
            const isSelf = user.id === userId;
            const roleConfig = user.role ? ROLE_CONFIG[user.role] : null;
            const RoleIcon = roleConfig?.icon;
            const isEditing = editingName === user.id;
            return (
              <div
                key={user.id}
                className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_140px_220px] items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
              >
                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground shrink-0">
                    {user.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveName(user.id)}
                          className="h-6 px-2 rounded border border-border bg-background text-sm w-36 focus:outline-none focus:ring-1 focus:ring-ring"
                          autoFocus
                        />
                        <button onClick={() => handleSaveName(user.id)} className="p-0.5 rounded hover:bg-muted">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </button>
                        <button onClick={() => setEditingName(null)} className="p-0.5 rounded hover:bg-muted">
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.display_name || "Unnamed"}
                        {isSelf && <span className="text-[10px] text-muted-foreground ml-1.5">(you)</span>}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>

                {/* Role badge */}
                <div>
                  {roleConfig && RoleIcon ? (
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium", roleConfig.color)}>
                      <RoleIcon className="w-3 h-3" />
                      {roleConfig.label}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50 italic">No role</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5">
                  {(changingRole === user.id || deletingUser === user.id) ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : isSelf ? (
                    <span className="text-[11px] text-muted-foreground">—</span>
                  ) : (
                    <>
                      <select
                        value={user.role ?? ""}
                        onChange={(e) => {
                          const val = e.target.value as AppRole;
                          if (val) handleChangeRole(user.id, val);
                        }}
                        className="h-7 px-2 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="" disabled>Assign…</option>
                        {availableRoles.map((r) => (
                          <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => { setEditingName(user.id); setEditNameValue(user.display_name || ""); }}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit name"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No users found. Invite your first team member above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
