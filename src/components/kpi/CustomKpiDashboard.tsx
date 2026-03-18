import { useState, useEffect } from "react";
import { Plus, X, GripVertical, Settings2 } from "lucide-react";
import { KPI_WIDGETS, DEFAULT_WIDGET_IDS, type KpiWidgetDef } from "./KpiWidgetCatalog";
import { cn } from "@/lib/utils";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, rectSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STORAGE_KEY = "trumove_kpi_widgets";

function loadWidgets(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_WIDGET_IDS;
}

function saveWidgets(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function SortableWidget({ widget, onRemove }: { widget: KpiWidgetDef; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });
  const Icon = widget.icon;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-xl border border-border bg-card p-3.5 relative group",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5"
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </button>
      <button
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 rounded"
      >
        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
      </button>
      <span className="text-[11px] text-muted-foreground">{widget.label}</span>
      <div className="mt-1 text-xl font-bold text-foreground">{widget.defaultValue}</div>
      {widget.defaultSub && <span className="text-[10px] text-muted-foreground">{widget.defaultSub}</span>}
    </div>
  );
}

export default function CustomKpiDashboard() {
  const [activeIds, setActiveIds] = useState<string[]>(loadWidgets);
  const [showPicker, setShowPicker] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => { saveWidgets(activeIds); }, [activeIds]);

  const activeWidgets = activeIds.map(id => KPI_WIDGETS.find(w => w.id === id)).filter(Boolean) as KpiWidgetDef[];
  const availableWidgets = KPI_WIDGETS.filter(w => !activeIds.includes(w.id));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setActiveIds(prev => {
        const oldIdx = prev.indexOf(active.id as string);
        const newIdx = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const addWidget = (id: string) => {
    setActiveIds(prev => [...prev, id]);
  };

  const removeWidget = (id: string) => {
    setActiveIds(prev => prev.filter(x => x !== id));
  };

  const categories = ["revenue", "pipeline", "operations", "team"] as const;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">My KPIs</h1>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border",
            showPicker
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings2 className="w-3.5 h-3.5" />
          {showPicker ? "Done" : "Customize"}
        </button>
      </div>

      {/* Widget picker */}
      {showPicker && (
        <div className="rounded-xl border border-border bg-card p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-semibold text-foreground mb-3">Available Widgets</p>
          {availableWidgets.length === 0 ? (
            <p className="text-xs text-muted-foreground">All widgets are already on your dashboard.</p>
          ) : (
            <div className="space-y-3">
              {categories.map(cat => {
                const catWidgets = availableWidgets.filter(w => w.category === cat);
                if (catWidgets.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{cat}</p>
                    <div className="flex flex-wrap gap-2">
                      {catWidgets.map(w => {
                        const Icon = w.icon;
                        return (
                          <button
                            key={w.id}
                            onClick={() => addWidget(w.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-foreground hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3 text-muted-foreground" />
                            <Icon className="w-3 h-3" />
                            {w.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Active widgets grid */}
      {activeWidgets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">No widgets selected. Click Customize to add KPIs.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={activeIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {activeWidgets.map(w => (
                <SortableWidget key={w.id} widget={w} onRemove={() => removeWidget(w.id)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
