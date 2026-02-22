import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import { Users, BarChart3, Shield, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const ROLES = [
  {
    id: "agent",
    title: "Agent",
    description: "Manage leads, deals, and customer relationships from your personal dashboard.",
    icon: Users,
    href: "/agent/dashboard",
  },
  {
    id: "manager",
    title: "Manager",
    description: "Monitor team performance, approve changes, and review campaign health.",
    icon: BarChart3,
    href: "/manager/dashboard",
  },
  {
    id: "admin",
    title: "Admin",
    description: "Configure users, integrations, branding, and system settings.",
    icon: Shield,
    href: "/admin/dashboard",
  },
];

const STORAGE_KEY = "trumove_remembered_role";

export default function AgentLogin() {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const role = ROLES.find((r) => r.id === saved);
      if (role) {
        navigate(role.href, { replace: true });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [navigate]);

  const handleClick = (roleId: string, href: string) => {
    if (remember) {
      localStorage.setItem(STORAGE_KEY, roleId);
    }
    navigate(href);
  };

  return (
    <SiteShell centered>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Choose your workspace</h1>
        <p className="text-sm text-muted-foreground mb-10">Select where you'd like to go</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleClick(role.id, role.href)}
                className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 hover:border-foreground/20 hover:shadow-md transition-all text-left"
              >
                <Icon className="w-6 h-6 text-foreground" />
                <div>
                  <h3 className="font-semibold text-foreground">{role.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{role.description}</p>
                </div>
                <div className="mt-auto pt-2">
                  <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-foreground text-background group-hover:gap-3 transition-all">
                    Enter {role.title} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 mt-8 cursor-pointer select-none">
          <Checkbox
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
            className="border-muted-foreground/40"
          />
          <span className="text-xs text-muted-foreground">Remember my choice on this device</span>
        </label>
      </div>
    </SiteShell>
  );
}
