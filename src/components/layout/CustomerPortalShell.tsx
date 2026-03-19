import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Package, FileText, MessageCircle, Upload, Home, PenTool } from "lucide-react";
import logoImg from "@/assets/logo.png";

interface CustomerPortalShellProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  customerName?: string;
}

const navItems = [
  { id: "tracker", label: "Move Tracker", icon: Package },
  { id: "quote", label: "Quote", icon: FileText },
  { id: "esigns", label: "E-Signs", icon: PenTool },
  { id: "documents", label: "Documents", icon: Upload },
  { id: "messages", label: "Messages", icon: MessageCircle },
];

export default function CustomerPortalShell({ children, activeTab, onTabChange, customerName }: CustomerPortalShellProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/portal");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="TruMove" className="h-6" />
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-tight">TruMove Portal</h1>
            {customerName && <p className="text-xs text-muted-foreground">{customerName}</p>}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors h-9 px-3 rounded-lg hover:bg-muted"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </header>

      {/* Tab navigation */}
      <nav className="border-b border-border bg-card px-2 flex gap-1 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`flex items-center gap-2 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
