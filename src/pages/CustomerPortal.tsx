import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PortalAuthForm from "@/components/auth/PortalAuthForm";
import { Loader2 } from "lucide-react";

export default function CustomerPortal() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/portal/dashboard", { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <PortalAuthForm onAuthenticated={() => navigate("/portal/dashboard")} />
    </div>
  );
}
