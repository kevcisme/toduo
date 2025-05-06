import React, { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./ui/resizable";
import CanvasSidebar from "./CanvasSidebar";
import CanvasMainPanel from "./CanvasMainPanel";
import CanvasChatBar from "./CanvasChatBar";
import { Canvas as CanvasType, CanvasItemUnion } from "@/types/canvas";
import { MessageCircle, X } from "lucide-react";
import { Button } from "./ui/button";

interface CanvasProps {
  className?: string;
}

const Canvas: React.FC<CanvasProps> = ({ className = "" }) => {
  const [activeCanvas, setActiveCanvas] = useState<CanvasType | null>(null);
  const [items, setItems] = useState<CanvasItemUnion[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleAddItem = (item: CanvasItemUnion) => {
    setItems((prevItems) => [...prevItems, item]);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handleUpdateItemPosition = (itemId: string, x: number, y: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, position: { x, y } } : item,
      ),
    );
  };

  const handleUpdateItemSize = (
    itemId: string,
    width: number,
    height: number,
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, size: { width, height } } : item,
      ),
    );
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className={`flex h-full w-full bg-background ${className}`}>
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        {/* Sidebar */}
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={30}
          className="bg-card"
        >
          <CanvasSidebar
            activeCanvas={activeCanvas}
            setActiveCanvas={setActiveCanvas}
            onAddItem={handleAddItem}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Canvas Area */}
        <ResizablePanel
          defaultSize={isChatOpen ? 60 : 80}
          className="bg-background"
        >
          <CanvasMainPanel
            items={items}
            onRemoveItem={handleRemoveItem}
            onUpdateItemPosition={handleUpdateItemPosition}
            onUpdateItemSize={handleUpdateItemSize}
          />
        </ResizablePanel>

        {/* Chat Panel (conditionally rendered) */}
        {isChatOpen && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={20}
              minSize={15}
              maxSize={40}
              className="bg-card"
            >
              <CanvasChatBar canvasId={activeCanvas?.id} items={items} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {/* Chat Toggle Button */}
      <Button
        className="absolute bottom-4 right-4 rounded-full shadow-lg"
        size="icon"
        onClick={toggleChat}
      >
        {isChatOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default Canvas;
