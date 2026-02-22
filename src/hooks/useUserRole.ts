import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "owner" | "admin" | "manager" | "agent" | "marketing" | "accounting";

export function useUserRole() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const uid = session?.user?.id ?? null;
        setUserId(uid);
        if (uid) {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", uid);
          setRoles((data ?? []).map((r: any) => r.role as AppRole));
        } else {
          setRoles([]);
        }
        setLoading(false);
      }
    );

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid)
          .then(({ data }) => {
            setRoles((data ?? []).map((r: any) => r.role as AppRole));
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    roles,
    loading,
    userId,
    isOwner: roles.includes("owner"),
    isAdmin: roles.includes("admin"),
    isManager: roles.includes("manager"),
    isAgent: roles.includes("agent"),
    isMarketing: roles.includes("marketing"),
    isAccounting: roles.includes("accounting"),
    hasRole: (role: AppRole) => roles.includes(role),
    highestRole: roles.includes("owner")
      ? "owner"
      : roles.includes("admin")
      ? "admin"
      : roles.includes("manager")
      ? "manager"
      : roles.includes("marketing")
      ? "marketing"
      : roles.includes("accounting")
      ? "accounting"
      : roles.includes("agent")
      ? "agent"
      : null,
  };
}
