import { Link, useLocation } from "react-router-dom";
import { Scan, Package } from "lucide-react";

const options = [
  { href: "/site/online-estimate", label: "Build Manually", icon: Package },
  { href: "/site/scan-room", label: "AI Room Scan", icon: Scan, badge: "Beta" },
];

export default function EstimatorNavToggle() {
  const { pathname } = useLocation();

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center gap-1 rounded-full bg-muted/60 p-1 border border-border/40 shadow-sm">
        {options.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              to={href}
              className={`
                flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all
                ${active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                }`}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
