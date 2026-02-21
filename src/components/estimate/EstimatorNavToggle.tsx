import { Link, useLocation } from "react-router-dom";
import { Scan, Package } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const options: { href: string; label: string; icon: typeof Scan; badge?: string }[] = [
  { href: "/scan-room", label: "AI Scan", icon: Scan, badge: "Beta" },
  { href: "/online-estimate", label: "Manual Builder", icon: Package },
];

export default function EstimatorNavToggle() {
  const { pathname } = useLocation();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5 rounded-full bg-white/8 p-0.5 border border-white/10 mx-auto">
        {options.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href;
          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  to={href}
                  className={`
                    relative flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200
                    ${active
                      ? "bg-white text-slate-900 shadow-[0_1px_8px_rgba(255,255,255,0.15)]"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                  {badge && (
                    <span className={`hidden sm:inline text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                      active ? "bg-slate-900/10 text-slate-600" : "bg-white/10 text-white/50"
                    }`}>
                      {badge}
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="sm:hidden">
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
