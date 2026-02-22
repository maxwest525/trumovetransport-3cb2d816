import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OnlineEstimate from "./pages/OnlineEstimate";
import Book from "./pages/Book";
import Vetting from "./pages/Vetting";
import VettingDashboard from "./pages/VettingDashboard";
import CarrierVetting from "./pages/CarrierVetting";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PropertyLookup from "./pages/PropertyLookup";
import Auth from "./pages/Auth";
import AgentLogin from "./pages/AgentLogin";
import AgentDashboard from "./pages/AgentDashboard";
import AdminIntegrations from "./pages/AdminIntegrations";
import ScanRoom from "./pages/ScanRoom";
import Classic from "./pages/Classic";
import LiveTracking from "./pages/LiveTracking";
import ElevenLabsTrudyWidget from "./components/ElevenLabsTrudyWidget";
import CustomerService from "./pages/CustomerService";
import AdminSupportTickets from "./pages/AdminSupportTickets";
import AgentPipeline from "./pages/AgentPipeline";
import ProfileSettings from "./pages/ProfileSettings";
import Demo from "./pages/Demo";
import AgentLoginOld from "./pages/AgentLoginOld";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
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
            <Route path="/auth" element={<Auth />} />
            <Route path="/agent-login" element={<AgentLogin />} />
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/admin/integrations" element={<AdminIntegrations />} />
            <Route path="/scan-room" element={<ScanRoom />} />
            <Route path="/classic" element={<Classic />} />
            <Route path="/track" element={<LiveTracking />} />
            <Route path="/customer-service" element={<CustomerService />} />
            <Route path="/admin/support-tickets" element={<AdminSupportTickets />} />
            <Route path="/agent/pipeline" element={<AgentPipeline />} />
            <Route path="/agent/profile" element={<ProfileSettings />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/agent-login-old" element={<AgentLoginOld />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ElevenLabsTrudyWidget />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
