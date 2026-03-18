import { useEffect } from "react";
import CustomKpiDashboard from "@/components/kpi/CustomKpiDashboard";
import ManagerKpiDashboard from "@/components/kpi/ManagerKpiDashboard";
import { usePortalContext } from "@/hooks/usePortalContext";
import AgentShell from "@/components/layout/AgentShell";
import AdminShell from "@/components/layout/AdminShell";
import ManagerShell from "@/components/layout/ManagerShell";

export default function KpiDashboard() {
  const portalContext = usePortalContext();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (portalContext === "admin") {
    return <AdminShell breadcrumb=" / KPIs"><CustomKpiDashboard /></AdminShell>;
  }

  if (portalContext === "manager") {
    return <ManagerShell breadcrumb=" / KPIs"><ManagerKpiDashboard /></ManagerShell>;
  }

  return <AgentShell breadcrumb=" / KPIs"><CustomKpiDashboard /></AgentShell>;
}
