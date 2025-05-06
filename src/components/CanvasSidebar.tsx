import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import {
  Search,
  Plus,
  File,
  Link,
  Calendar,
  CheckSquare,
  FileText,
} from "lucide-react";
import { Canvas, CanvasItemUnion, CanvasItemType } from "@/types/canvas";

interface CanvasSidebarProps {
  activeCanvas: Canvas | null;
  setActiveCanvas: (canvas: Canvas | null) => void;
  onAddItem: (item: CanvasItemUnion) => void;
}

const CanvasSidebar: React.FC<CanvasSidebarProps> = ({
  activeCanvas,
  setActiveCanvas,
  onAddItem,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"files" | "search" | "add">(
    "files",
  );

  // Mock data for canvases
  const [canvases, setCanvases] = useState<Canvas[]>([
    {
      id: "canvas-1",
      name: "Project Research",
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "canvas-2",
      name: "Meeting Notes",
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const handleCreateCanvas = () => {
    const newCanvas: Canvas = {
      id: `canvas-${Date.now()}`,
      name: "New Canvas",
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCanvases([...canvases, newCanvas]);
    setActiveCanvas(newCanvas);
  };

  const handleAddItemClick = (type: CanvasItemType) => {
    // This would open a modal or dialog to select the specific item
    console.log(`Add ${type} clicked`);

    // For demonstration purposes, we'll create a placeholder item
    const newItem: CanvasItemUnion = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 150 },
      title: `New ${type}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(type === "document" && { documentId: "placeholder" }),
      ...(type === "url" && { url: "https://example.com" }),
      ...(type === "task" && { taskId: 0 }),
      ...(type === "note" && { noteId: 0 }),
      ...(type === "event" && { eventId: 0 }),
    } as CanvasItemUnion;

    onAddItem(newItem);
  };

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-2">Canvas</h2>

        <div className="flex items-center gap-2">
          <select
            className="flex-1 p-2 border rounded-md bg-background"
            value={activeCanvas?.id || ""}
            onChange={(e) => {
              const selected = canvases.find((c) => c.id === e.target.value);
              setActiveCanvas(selected || null);
            }}
          >
            <option value="">Select Canvas</option>
            {canvases.map((canvas) => (
              <option key={canvas.id} value={canvas.id}>
                {canvas.name}
              </option>
            ))}
          </select>

          <Button size="icon" variant="outline" onClick={handleCreateCanvas}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="files"
        className="flex-1 flex flex-col"
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "files" | "search" | "add")
        }
      >
        <TabsList className="grid grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="add">Add</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="flex-1 p-2">
          <ScrollArea className="h-full">
            {activeCanvas?.items.length ? (
              <div className="space-y-2">
                {activeCanvas.items.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:bg-accent/10"
                  >
                    <CardContent className="p-3 flex items-center gap-2">
                      {item.type === "document" && <File className="h-4 w-4" />}
                      {item.type === "url" && <Link className="h-4 w-4" />}
                      {item.type === "task" && (
                        <CheckSquare className="h-4 w-4" />
                      )}
                      {item.type === "note" && <FileText className="h-4 w-4" />}
                      {item.type === "event" && (
                        <Calendar className="h-4 w-4" />
                      )}
                      <span className="text-sm truncate">{item.title}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No items in this canvas yet
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="search" className="flex-1 p-2 flex flex-col">
          <div className="mb-2">
            <Input
              placeholder="Search files, tasks, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <ScrollArea className="flex-1">
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No results found" : "Enter a search term"}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="add" className="flex-1 p-2">
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAddItemClick("document")}
            >
              <File className="h-4 w-4 mr-2" />
              Upload Document
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAddItemClick("url")}
            >
              <Link className="h-4 w-4 mr-2" />
              Add URL
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAddItemClick("task")}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Add Task
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAddItemClick("note")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Add Note
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAddItemClick("event")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add Calendar Event
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CanvasSidebar;
