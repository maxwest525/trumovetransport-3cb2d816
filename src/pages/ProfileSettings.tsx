import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AgentShell from "@/components/layout/AgentShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Camera, Loader2, Save } from "lucide-react";

interface ProfileData {
  display_name: string;
  email: string;
  avatar_url: string | null;
}

export default function ProfileSettings() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    display_name: "",
    email: "",
    avatar_url: null,
  });

  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    soundAlerts: true,
    desktopNotifications: false,
    timezone: "auto",
  });

  useEffect(() => {
    const saved = localStorage.getItem("agent_preferences");
    if (saved) setPrefs(JSON.parse(saved));

    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("display_name, email, avatar_url")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setProfile({
          display_name: data.display_name || "",
          email: data.email || session.user.email || "",
          avatar_url: data.avatar_url,
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: profile.display_name })
      .eq("id", session.user.id);

    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully" });
    }
    setSaving(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("agent_preferences", JSON.stringify(prefs));
    toast({ title: "Preferences saved" });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const ext = file.name.split(".").pop();
    const path = `${session.user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", session.user.id);

    setProfile((p) => ({ ...p, avatar_url: avatarUrl }));
    toast({ title: "Avatar updated" });
    setUploading(false);
  };

  const initials = profile.display_name
    ? profile.display_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "AG";

  if (loading) {
    return (
      <AgentShell breadcrumb=" / Profile">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AgentShell>
    );
  }

  return (
    <AgentShell breadcrumb=" / Profile">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Avatar & Name */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information and avatar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <Avatar className="w-20 h-20 border-2 border-border">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{profile.display_name || "Agent"}</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={profile.display_name} onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))} placeholder="Enter your display name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Notification and display preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive email alerts for deal updates</p>
              </div>
              <Switch checked={prefs.emailNotifications} onCheckedChange={(v) => setPrefs((p) => ({ ...p, emailNotifications: v }))} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Sound Alerts</p>
                <p className="text-xs text-muted-foreground">Play sound on new notifications</p>
              </div>
              <Switch checked={prefs.soundAlerts} onCheckedChange={(v) => setPrefs((p) => ({ ...p, soundAlerts: v }))} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Desktop Notifications</p>
                <p className="text-xs text-muted-foreground">Browser push notifications</p>
              </div>
              <Switch checked={prefs.desktopNotifications} onCheckedChange={(v) => setPrefs((p) => ({ ...p, desktopNotifications: v }))} />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={prefs.timezone} onValueChange={(v) => setPrefs((p) => ({ ...p, timezone: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-[100]">
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                  <SelectItem value="America/Anchorage">Alaska (AKT)</SelectItem>
                  <SelectItem value="Pacific/Honolulu">Hawaii (HT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSavePreferences} variant="outline" className="gap-2">
              <Save className="w-4 h-4" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </AgentShell>
  );
}
