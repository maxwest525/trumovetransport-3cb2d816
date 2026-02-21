import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AgentProfile {
  displayName: string;
  email: string | null;
  isLoggedIn: boolean;
  loading: boolean;
}

export function useAgentProfile(): AgentProfile {
  const [profile, setProfile] = useState<AgentProfile>({
    displayName: "Agent",
    email: null,
    isLoggedIn: false,
    loading: true,
  });

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, email")
        .eq("id", userId)
        .single();

      setProfile({
        displayName: data?.display_name || data?.email?.split("@")[0] || "Agent",
        email: data?.email || null,
        isLoggedIn: true,
        loading: false,
      });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile({ displayName: "Agent", email: null, isLoggedIn: false, loading: false });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(p => ({ ...p, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return profile;
}
