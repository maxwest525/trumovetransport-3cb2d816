import { KPI_WIDGETS, DEFAULT_WIDGET_IDS } from "./KpiWidgetCatalog";

export default function CustomKpiDashboard() {
  const widgets = DEFAULT_WIDGET_IDS.map(id => KPI_WIDGETS.find(w => w.id === id)).filter(Boolean);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-foreground">My KPIs</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {widgets.map(w => {
          const Icon = w!.icon;
          return (
            <div key={w!.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{w!.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{w!.defaultValue}</div>
              {w!.defaultSub && <span className="text-[10px] text-muted-foreground">{w!.defaultSub}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
