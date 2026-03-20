import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OnlineEstimate from "./pages/OnlineEstimate";
import Book from "./pages/Book";
import CarrierVetting from "./pages/CarrierVetting";
import VettingDashboard from "./pages/VettingDashboard";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PropertyLookup from "./pages/PropertyLookup";
import ScanRoom from "./pages/ScanRoom";
import Classic from "./pages/Classic";
import LiveTracking from "./pages/LiveTracking";
import CustomerService from "./pages/CustomerService";
import ElevenLabsTrudyWidget from "./components/ElevenLabsTrudyWidget";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* ── Customer-facing website ─────────────── */}
            <Route path="/" element={<Index />} />
            <Route path="/site" element={<Navigate to="/" replace />} />
            <Route path="/online-estimate" element={<OnlineEstimate />} />
            <Route path="/book" element={<Book />} />
            <Route path="/vetting" element={<CarrierVetting />} />
            <Route path="/vetting-dashboard" element={<VettingDashboard />} />
            <Route path="/carrier-vetting" element={<CarrierVetting />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/property-lookup" element={<PropertyLookup />} />
            <Route path="/scan-room" element={<ScanRoom />} />
            <Route path="/classic" element={<Classic />} />
            <Route path="/track" element={<LiveTracking />} />
            <Route path="/customer-service" element={<CustomerService />} />

            {/* Legacy /site/* redirects */}
            <Route path="/site/*" element={<Navigate to="/" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <ElevenLabsTrudyWidget />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
