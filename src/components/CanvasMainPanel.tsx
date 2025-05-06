import React from "react";
import { CanvasItemUnion } from "@/types/canvas";
import { Card, CardContent } from "./ui/card";
import { File, Link, CheckSquare, FileText, Calendar } from "lucide-react";

interface CanvasMainPanelProps {
  items: CanvasItemUnion[];
  onRemoveItem: (itemId: string) => void;
  onUpdateItemPosition: (itemId: string, x: number, y: number) => void;
  onUpdateItemSize: (itemId: string, width: number, height: number) => void;
}

const CanvasMainPanel: React.FC<CanvasMainPanelProps> = ({
  items,
  onRemoveItem,
  onUpdateItemPosition,
  onUpdateItemSize,
}) => {
  // State to track dragging
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  // Handle drag start
  const handleDragStart = (
    e: React.MouseEvent,
    itemId: string,
    itemX: number,
    itemY: number,
  ) => {
    setDraggedItem(itemId);
    // Calculate offset from the top-left corner of the item
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    // Prevent default to allow drag
    e.preventDefault();
  };

  // Handle drag
  const handleDrag = (e: React.MouseEvent) => {
    if (!draggedItem) return;

    // Calculate new position based on mouse position and drag offset
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;

    // Update item position
    onUpdateItemPosition(draggedItem, x, y);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Handle mouse move for dragging
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedItem) {
        // Calculate new position based on mouse position and drag offset
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;

        // Update item position
        onUpdateItemPosition(draggedItem, x, y);
      }
    };

    const handleMouseUp = () => {
      setDraggedItem(null);
    };

    if (draggedItem) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedItem, dragOffset, onUpdateItemPosition]);

  return (
    <div
      className="h-full w-full overflow-auto relative bg-background"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute cursor-move"
          style={{
            left: `${item.position.x}px`,
            top: `${item.position.y}px`,
            width: `${item.size.width}px`,
            height: `${item.size.height}px`,
          }}
          onMouseDown={(e) =>
            handleDragStart(e, item.id, item.position.x, item.position.y)
          }
        >
          <Card className="h-full w-full">
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {item.type === "document" && <File className="h-4 w-4" />}
                  {item.type === "url" && <Link className="h-4 w-4" />}
                  {item.type === "task" && <CheckSquare className="h-4 w-4" />}
                  {item.type === "note" && <FileText className="h-4 w-4" />}
                  {item.type === "event" && <Calendar className="h-4 w-4" />}
                  <span className="font-medium truncate">{item.title}</span>
                </div>
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveItem(item.id)}
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-auto text-sm">
                {/* Content based on item type */}
                {item.type === "document" && (
                  <p className="text-muted-foreground">Document content...</p>
                )}
                {item.type === "url" && (
                  <p className="text-muted-foreground">
                    {item.url || "https://example.com"}
                  </p>
                )}
                {item.type === "task" && (
                  <p className="text-muted-foreground">Task details...</p>
                )}
                {item.type === "note" && (
                  <p className="text-muted-foreground">Note content...</p>
                )}
                {item.type === "event" && (
                  <p className="text-muted-foreground">Event details...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default CanvasMainPanel;
