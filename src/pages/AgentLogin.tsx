import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import { Users, BarChart3, Shield, ArrowRight } from "lucide-react";

const ROLES = [
  {
    id: "agent",
    title: "Agent",
    description: "Manage leads, deals, and customer relationships from your personal dashboard.",
    icon: Users,
    href: "/agent/dashboard",
    ready: true,
  },
  {
    id: "manager",
    title: "Manager",
    description: "Monitor team performance, approve changes, and review campaign health.",
    icon: BarChart3,
    href: "#",
    ready: false,
  },
  {
    id: "admin",
    title: "Admin",
    description: "Configure users, integrations, branding, and system settings.",
    icon: Shield,
    href: "#",
    ready: false,
  },
];

export default function AgentLogin() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <SiteShell centered>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Choose your workspace</h1>
        <p className="text-sm text-muted-foreground mb-10">Select where you'd like to go</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
          {ROLES.map((role) => {
            const Icon = role.icon;
            if (!role.ready) {
              return (
                <div
                  key={role.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 opacity-50 cursor-not-allowed"
                >
                  <Icon className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-foreground">{role.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{role.description}</p>
                  </div>
                  <div className="mt-auto pt-2">
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-muted text-muted-foreground">
                      Coming Soon
                    </span>
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={role.id}
                to={role.href}
                className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 hover:border-foreground/20 hover:shadow-md transition-all"
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
              </Link>
            );
          })}
        </div>
      </div>
    </SiteShell>
  );
}
