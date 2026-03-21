import { useState } from "react";
import { Trash2, Printer, Download, GripVertical } from "lucide-react";
import { type InventoryItem, calculateTotalWeight, calculateTotalCubicFeet, DENSITY_FACTOR } from "@/lib/priceCalculator";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  items: InventoryItem[];
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
  onRemoveItem: (id: string) => void;
  onClear: () => void;
  onReorder?: (items: InventoryItem[]) => void;
}

// Helper to get cubic feet for an item
const getItemCubicFeet = (item: InventoryItem): number => {
  return item.cubicFeet || Math.ceil(item.weightEach / DENSITY_FACTOR);
};

// Sortable Row Component
interface SortableRowProps {
  item: InventoryItem;
  index: number;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
  onRemoveItem: (id: string) => void;
}

function SortableRow({ item, index, onUpdateItem, onRemoveItem }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cubicFt = getItemCubicFeet(item);

  return (
    <tr 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "border-b border-border/20 hover:bg-muted/20 transition-colors",
        isDragging && "bg-muted/40 opacity-80 shadow-lg"
      )}
    >
      {/* Drag Handle + Order */}
      <td className="px-2 py-3 print-hide">
        <div 
          className="flex items-center gap-1 cursor-grab active:cursor-grabbing" 
          {...attributes} 
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-bold text-muted-foreground w-5 text-center">{index + 1}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Larger thumbnail */}
          <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-muted/30 border border-border/30">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-base text-muted-foreground">📦</span>
              </div>
            )}
          </div>
          <span className="font-medium text-foreground">{item.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{item.room}</td>
      <td className="px-4 py-3 text-center">
        {/* Hidden span for print, input for screen */}
        <span className="print-qty-value hidden">{item.quantity}</span>
        <input
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => onUpdateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
          className="w-14 h-8 text-center rounded-lg border border-border/40 bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 print-hide"
        />
      </td>
      <td className="px-4 py-3 text-center text-muted-foreground">
        {item.weightEach}
      </td>
      <td className="px-4 py-3 text-center text-muted-foreground">
        {cubicFt}
      </td>
      <td className="px-4 py-3 text-center font-semibold">
        {item.quantity * item.weightEach}
      </td>
      <td className="px-4 py-3 text-center font-semibold">
        {item.quantity * cubicFt}
      </td>
      <td className="px-4 py-3 text-center print-hide">
        <button
          type="button"
          onClick={() => onRemoveItem(item.id)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

export default function InventoryTable({ items, onUpdateItem, onRemoveItem, onClear, onReorder }: InventoryTableProps) {
  const [localItems, setLocalItems] = useState(items);
  const totalWeight = calculateTotalWeight(items);
  const totalCubicFeet = calculateTotalCubicFeet(items);

  // Update local items when props change
  if (items !== localItems && items.length !== localItems.length) {
    setLocalItems(items);
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setLocalItems(newItems);
      onReorder?.(newItems);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const currentDate = format(new Date(), "MMMM d, yyyy");
    
    // Header - Match print styling exactly
    // Green header bar
    doc.setFillColor(34, 197, 94); // Primary green
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Logo text
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("TruMove", 14, 16);
    
    // Date on right
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${currentDate}`, pageWidth - 14, 16, { align: "right" });
    
    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Your Move Inventory", 14, 40);

    // Helper function to load image as base64
    const loadImageAsBase64 = (url: string): Promise<string | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#f5f5f5';
              ctx.fillRect(0, 0, 32, 32);
              
              // Calculate scaling to fit while maintaining aspect ratio
              const scale = Math.min(28 / img.width, 28 / img.height);
              const scaledWidth = img.width * scale;
              const scaledHeight = img.height * scale;
              const x = (32 - scaledWidth) / 2;
              const y = (32 - scaledHeight) / 2;
              
              ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
              resolve(canvas.toDataURL('image/png'));
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    };

    // Pre-load all images
    const imagePromises = items.map(async (item) => {
      if (item.imageUrl) {
        const base64 = await loadImageAsBase64(item.imageUrl);
        return { id: item.id, base64 };
      }
      return { id: item.id, base64: null };
    });
    
    const loadedImages = await Promise.all(imagePromises);
    const imageMap = new Map(loadedImages.map(img => [img.id, img.base64]));
    
    // Table data - matching print columns exactly
    const tableData = items.map((item, index) => {
      const cubicFt = getItemCubicFeet(item);
      return [
        (index + 1).toString(),
        '', // Image placeholder - we'll draw it in didDrawCell
        item.name,
        item.room,
        item.quantity.toString(),
        `${item.weightEach}`,
        `${cubicFt}`,
        `${item.quantity * item.weightEach}`,
        `${item.quantity * cubicFt}`
      ];
    });
    
    // Add table with print-matching styling
    autoTable(doc, {
      startY: 50,
      head: [['#', '', 'Item', 'Room', 'Qty', 'Weight', 'Cu Ft', 'Total Wt', 'Total Cu Ft']],
      body: tableData,
      foot: [[
        '', '', '', '', 'Totals:', '-', '-', 
        `${totalWeight.toLocaleString()} lbs`, 
        `${totalCubicFeet} cu ft`
      ]],
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 4,
      },
      footStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
        minCellHeight: 12,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, // #
        1: { cellWidth: 14 }, // Image
        2: { cellWidth: 38 }, // Item
        3: { cellWidth: 28 }, // Room
        4: { cellWidth: 12, halign: 'center' }, // Qty
        5: { cellWidth: 18, halign: 'center' }, // Weight
        6: { cellWidth: 16, halign: 'center' }, // Cu Ft
        7: { cellWidth: 22, halign: 'center' }, // Total Weight
        8: { cellWidth: 22, halign: 'center' }, // Total Cu Ft
      },
      styles: {
        overflow: 'linebreak',
        lineColor: [230, 230, 230],
        lineWidth: 0.5,
      },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.5,
      didDrawCell: (data) => {
        // Draw images in the image column (column index 1) for body rows
        if (data.section === 'body' && data.column.index === 1) {
          const item = items[data.row.index];
          if (item) {
            const base64 = imageMap.get(item.id);
            if (base64) {
              try {
                const imgSize = 10;
                const x = data.cell.x + (data.cell.width - imgSize) / 2;
                const y = data.cell.y + (data.cell.height - imgSize) / 2;
                doc.addImage(base64, 'PNG', x, y, imgSize, imgSize);
              } catch (e) {
                // Silently fail if image can't be added
              }
            }
          }
        }
      },
    });
    
    // Footer - matching print footer
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Generated by TruMove - AI-powered moving quotes", 14, finalY + 12);
    doc.text("www.trumove.com", 14, finalY + 18);
    
    doc.save('trumove-inventory.pdf');
  };

  const currentDate = format(new Date(), "MMMM d, yyyy");

  return (
    <div className="print-inventory rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* Print-only header with logo and date */}
      <div className="print-header hidden">
        <div className="print-header-content">
          <div className="print-logo">TruMove</div>
          <div className="print-date">Generated: {currentDate}</div>
        </div>
      </div>
      
      {/* Header - Enlarged and Centered */}
      <div className="tru-summary-header-large border-b border-border/40">
        <div className="text-center flex-1">
          <h3 className="text-lg font-black uppercase tracking-wide">
            YOUR MOVE <span className="text-primary">INVENTORY</span>
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="w-16 px-2 py-3 font-bold text-xs tracking-wide uppercase text-muted-foreground print-hide">Order</th>
                <th className="text-left px-4 py-3 font-bold text-xs tracking-wide uppercase text-muted-foreground">Item</th>
                <th className="text-left px-4 py-3 font-bold text-xs tracking-wide uppercase text-muted-foreground">Room</th>
                <th className="text-center px-4 py-3 font-bold text-xs tracking-wide uppercase text-muted-foreground">Qty</th>
                <th className="text-center px-4 py-3 font-bold text-xs tracking-wide uppercase text-muted-foreground">Weight (lbs)</th>
                <th className="text-center px-4 py-3 font-bold text-xs tracking-wide uppercase text-muted-foreground">Cu Ft</th>
                <th className="text-center px-4 py-3 font-bold text-xs tracking-wide uppercase text-muted-foreground">Total Weight</th>
                <th className="text-center px-4 py-3 font-bold text-xs tracking-wide uppercase text-muted-foreground">Total Cu Ft</th>
                <th className="w-12 print-hide"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    No items yet. Start by adding a sofa, bed, or boxes.
                  </td>
                </tr>
              ) : (
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  {items.map((item, index) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      index={index}
                      onUpdateItem={onUpdateItem}
                      onRemoveItem={onRemoveItem}
                    />
                  ))}
                </SortableContext>
              )}
            </tbody>
            {/* Table Footer with Totals */}
            {items.length > 0 && (
              <tfoot>
                <tr className="border-t border-border/40 bg-muted/20 font-bold">
                  <td className="print-hide"></td>
                  <td colSpan={3} className="px-4 py-3 text-right text-sm text-muted-foreground">Totals:</td>
                  <td className="px-4 py-3 text-center text-sm">-</td>
                  <td className="px-4 py-3 text-center text-sm">-</td>
                  <td className="px-4 py-3 text-center text-sm text-foreground">{totalWeight.toLocaleString()} lbs</td>
                  <td className="px-4 py-3 text-center text-sm text-foreground">{totalCubicFeet} cu ft</td>
                  <td className="print-hide"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </DndContext>
      </div>

      {/* Actions - Hidden in print */}
      <div className="print-actions p-4 border-t border-border/40 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePrint}
          disabled={items.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 bg-card text-sm font-semibold text-foreground hover:bg-muted/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="w-4 h-4" />
          Print inventory
        </button>
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={items.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 bg-card text-sm font-semibold text-foreground hover:bg-muted/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Download as PDF
        </button>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}