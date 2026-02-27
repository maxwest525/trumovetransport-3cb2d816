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
import ScrollToTop from "./components/ScrollToTop";
import CustomerService from "./pages/CustomerService";
import AdminSupportTickets from "./pages/AdminSupportTickets";
import AgentPipeline from "./pages/AgentPipeline";
import ProfileSettings from "./pages/ProfileSettings";
import Demo from "./pages/Demo";
import AgentLoginOld from "./pages/AgentLoginOld";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";
import KpiDashboard from "./pages/KpiDashboard";
import ResetPassword from "./pages/ResetPassword";
import MarketingDashboard from "./pages/MarketingDashboard";
import AccountingDashboard from "./pages/AccountingDashboard";
import ManagerCoaching from "./pages/ManagerCoaching";
import ManagerDialerMonitor from "./pages/ManagerDialerMonitor";

import AgentLeads from "./pages/AgentLeads";
import AgentOperations from "./pages/AgentOperations";
import AgentNewCustomer from "./pages/AgentNewCustomer";
import AgentDialerPage from "./pages/AgentDialerPage";
import AgentESign from "./pages/AgentESign";
import AgentPayment from "./pages/AgentPayment";
import AgentCustomers from "./pages/AgentCustomers";
import AgentMessaging from "./pages/AgentMessaging";
import AgentTeamChat from "./pages/AgentTeamChat";
import CustomerPortal from "./pages/CustomerPortal";
import CustomerPortalDashboard from "./pages/CustomerPortalDashboard";

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
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/coaching" element={<ManagerCoaching />} />
            <Route path="/manager/dialer" element={<ManagerDialerMonitor />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/kpi" element={<KpiDashboard />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/marketing/dashboard" element={<MarketingDashboard />} />
            <Route path="/accounting/dashboard" element={<AccountingDashboard />} />
            
            <Route path="/agent/leads" element={<AgentLeads />} />
            <Route path="/agent/operations" element={<AgentOperations />} />
            <Route path="/agent/new-customer" element={<AgentNewCustomer />} />
            <Route path="/agent/dialer" element={<AgentDialerPage />} />
            <Route path="/agent/esign" element={<AgentESign />} />
            <Route path="/agent/payment" element={<AgentPayment />} />
            <Route path="/agent/customers" element={<AgentCustomers />} />
            <Route path="/agent/messages" element={<AgentMessaging />} />
            <Route path="/agent/team-chat" element={<AgentTeamChat />} />
            
            <Route path="/portal" element={<CustomerPortal />} />
            <Route path="/portal/dashboard" element={<CustomerPortalDashboard />} />
            
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
