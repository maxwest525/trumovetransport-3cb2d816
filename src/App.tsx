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
import AdminDeveloper from "./pages/AdminDeveloper";
import ScanRoom from "./pages/ScanRoom";
import Classic from "./pages/Classic";
import LiveTracking from "./pages/LiveTracking";
import ElevenLabsTrudyWidget from "./components/ElevenLabsTrudyWidget";
import ScrollToTop from "./components/ScrollToTop";
import CustomerService from "./pages/CustomerService";
import AdminSupportTickets from "./pages/AdminSupportTickets";
import AgentPipeline from "./pages/AgentPipeline";
import ProfileSettings from "./pages/ProfileSettings";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminLeadVendors from "./pages/AdminLeadVendors";
import LeadsDashboard from "./pages/LeadsDashboard";
import LeadsPerformance from "./pages/LeadsPerformance";
import KpiDashboard from "./pages/KpiDashboard";
import ResetPassword from "./pages/ResetPassword";
import SetPassword from "./pages/SetPassword";
import GrowthDashboard from "./pages/growth-engine/GrowthDashboard";
import GrowthCampaigns from "./pages/growth-engine/GrowthCampaigns";
import GrowthIntegrations from "./pages/growth-engine/GrowthIntegrations";
import GrowthLandingPages from "./pages/growth-engine/GrowthLandingPages";
import GrowthRouting from "./pages/growth-engine/GrowthRouting";
import AccountingDashboard from "./pages/AccountingDashboard";
import AgentOperations from "./pages/AgentOperations";
import AgentNewCustomer from "./pages/AgentNewCustomer";
import AgentDialerPage from "./pages/AgentDialerPage";
import AgentESign from "./pages/AgentESign";
import ESignViewPage from "./pages/ESignViewPage";
import AgentPayment from "./pages/AgentPayment";
import AgentCustomers from "./pages/AgentCustomers";
import AgentCustomerDetail from "./pages/AgentCustomerDetail";
import AgentMessaging from "./pages/AgentMessaging";
import AgentTeamChat from "./pages/AgentTeamChat";
import CustomerPortal from "./pages/CustomerPortal";
import CustomerPortalDashboard from "./pages/CustomerPortalDashboard";
import HomepageV2 from "./pages/HomepageV2";
import AgentInventory from "./pages/AgentInventory";
import AgentMoveDetails from "./pages/AgentMoveDetails";
import CustomerFacingSites from "./pages/CustomerFacingSites";
import IntegrationPlaceholder from "./pages/IntegrationPlaceholder";
import AdminPricing from "./pages/AdminPricing";
import PulseCallReview from "./pages/pulse/PulseCallReview";
import AgentPulse from "./pages/AgentPulse";
import ManagerPulse from "./pages/ManagerPulse";
import AdminPulse from "./pages/AdminPulse";
import AgentPulseCallReview from "./pages/AgentPulseCallReview";
import ManagerPulseCallReview from "./pages/ManagerPulseCallReview";
import AdminPulseCallReview from "./pages/AdminPulseCallReview";
import ManagerTeamChat from "./pages/ManagerTeamChat";
import AdminTeamChat from "./pages/AdminTeamChat";
import Leaderboard from "./pages/Leaderboard";
import DispatchDashboard from "./pages/DispatchDashboard";

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
            {/* ── Root = CRM Portal Hub (always) ──────────────────── */}
            <Route path="/" element={<AgentLogin />} />
            <Route path="/login" element={<AgentLogin />} />

            {/* Legacy route redirect */}
            <Route path="/agent-login" element={<Navigate to="/" replace />} />

            {/* ── Customer-facing website under /site ─────────────── */}
            <Route path="/site" element={<Index />} />
            <Route path="/site/online-estimate" element={<OnlineEstimate />} />
            <Route path="/site/book" element={<Book />} />
            <Route path="/site/vetting" element={<CarrierVetting />} />
            <Route path="/site/vetting-dashboard" element={<VettingDashboard />} />
            <Route path="/site/carrier-vetting" element={<CarrierVetting />} />
            <Route path="/site/faq" element={<FAQ />} />
            <Route path="/site/about" element={<About />} />
            <Route path="/site/privacy" element={<Privacy />} />
            <Route path="/site/terms" element={<Terms />} />
            <Route path="/site/property-lookup" element={<PropertyLookup />} />
            <Route path="/site/auth" element={<Auth />} />
            <Route path="/site/scan-room" element={<ScanRoom />} />
            <Route path="/site/classic" element={<Classic />} />
            <Route path="/site/track" element={<LiveTracking />} />
            <Route path="/site/customer-service" element={<CustomerService />} />

            {/* ── CRM / Backend routes ─────────────────────────────── */}
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/admin/developer" element={<AdminDeveloper />} />
            <Route path="/admin/employee-requests" element={<AdminSupportTickets />} />
            <Route path="/agent/pipeline" element={<AgentPipeline />} />
            <Route path="/agent/profile" element={<ProfileSettings />} />
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/lead-vendors" element={<AdminLeadVendors />} />
            <Route path="/leads/dashboard" element={<LeadsDashboard />} />
            <Route path="/leads/vendors" element={<AdminLeadVendors />} />
            <Route path="/leads/performance" element={<LeadsPerformance />} />
            <Route path="/kpi" element={<KpiDashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/marketing/dashboard" element={<GrowthDashboard />} />
            <Route path="/marketing/campaigns" element={<GrowthCampaigns />} />
            <Route path="/marketing/integrations" element={<GrowthIntegrations />} />
            <Route path="/marketing/landing-pages" element={<GrowthLandingPages />} />
            <Route path="/marketing/routing" element={<GrowthRouting />} />
            <Route path="/accounting/dashboard" element={<AccountingDashboard />} />
            
            <Route path="/agent/operations" element={<AgentOperations />} />
            <Route path="/agent/new-customer" element={<AgentNewCustomer />} />
            <Route path="/agent/move-details/:leadId" element={<AgentMoveDetails />} />
            <Route path="/agent/inventory/:leadId" element={<AgentInventory />} />
            <Route path="/agent/dialer" element={<AgentDialerPage />} />
            <Route path="/agent/esign" element={<AgentESign />} />
            <Route path="/agent/esign/view" element={<ESignViewPage />} />
            <Route path="/agent/payment" element={<AgentPayment />} />
            <Route path="/agent/customers" element={<AgentCustomers />} />
            <Route path="/agent/customers/:id" element={<AgentCustomerDetail />} />
            <Route path="/agent/messages" element={<AgentMessaging />} />
            <Route path="/agent/team-chat" element={<AgentTeamChat />} />
            
            <Route path="/portal" element={<CustomerPortal />} />
            <Route path="/portal/dashboard" element={<CustomerPortalDashboard />} />
            <Route path="/homepage-2" element={<HomepageV2 />} />
            <Route path="/customer-facing-sites" element={<CustomerFacingSites />} />
            <Route path="/tools/:tool" element={<IntegrationPlaceholder />} />
            <Route path="/agent/pulse" element={<AgentPulse />} />
            <Route path="/agent/pulse/call/:callId" element={<AgentPulseCallReview />} />
            <Route path="/manager/pulse" element={<ManagerPulse />} />
            <Route path="/manager/pulse/call/:callId" element={<ManagerPulseCallReview />} />
            <Route path="/admin/pulse" element={<AdminPulse />} />
            <Route path="/admin/pulse/call/:callId" element={<AdminPulseCallReview />} />
            <Route path="/manager/team-chat" element={<ManagerTeamChat />} />
            <Route path="/admin/team-chat" element={<AdminTeamChat />} />
            <Route path="/dispatch/dashboard" element={<DispatchDashboard />} />
            
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
