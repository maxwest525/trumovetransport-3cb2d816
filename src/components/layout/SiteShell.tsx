import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SaferTrustStrip from "@/components/SaferTrustStrip";

interface SiteShellProps {
  children: ReactNode;
  centered?: boolean;
  hideTrustStrip?: boolean;
  hideHeader?: boolean;
  backendMode?: boolean;
  stickySubHeader?: ReactNode;
}

function BackendFooter() {
  return (
    <footer className="border-t border-border/40 py-4 px-6 text-center">
      <span className="text-xs text-muted-foreground">TruMove Backend</span>
    </footer>
  );
}

export default function SiteShell({ children, centered = false, hideTrustStrip = false, hideHeader = false, backendMode = false, stickySubHeader }: SiteShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {!hideHeader && (
        <div className="sticky top-0 z-[90]">
          <div className="dark px-4 md:px-6 relative z-10">
            <Header />
            {!hideTrustStrip && !backendMode && <SaferTrustStrip />}
          </div>
          {stickySubHeader}
          {!backendMode && !stickySubHeader && (
            <div className="hidden md:block h-8 bg-gradient-to-b from-background to-transparent -mt-8 pointer-events-none" />
          )}
        </div>
      )}
      <main className={`flex-1 w-full ${centered ? 'flex flex-col justify-center' : ''}`}>{children}</main>
      {backendMode ? <BackendFooter /> : <Footer />}
    </div>
  );
}
