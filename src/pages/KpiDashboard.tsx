import { useEffect } from "react";
import CustomKpiDashboard from "@/components/kpi/CustomKpiDashboard";
import { usePortalContext } from "@/hooks/usePortalContext";
import AgentShell from "@/components/layout/AgentShell";
import AdminShell from "@/components/layout/AdminShell";
import ManagerShell from "@/components/layout/ManagerShell";

export default function KpiDashboard() {
  const portalContext = usePortalContext();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const content = <CustomKpiDashboard />;

  if (portalContext === "admin") {
    return <AdminShell breadcrumb=" / KPIs">{content}</AdminShell>;
  }

  if (portalContext === "manager") {
    return <ManagerShell breadcrumb=" / KPIs">{content}</ManagerShell>;
  }

  return <AgentShell breadcrumb=" / KPIs">{content}</AgentShell>;
}
