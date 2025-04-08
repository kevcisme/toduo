import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import TaskManager from "./TaskManager";
import CalendarView from "./CalendarView";
import KanbanBoard from "./KanbanBoard";
import NotesManager from "./NotesManager";
import {
  Menu,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Kanban,
  Settings,
  PanelLeft,
  FileText,
} from "lucide-react";

interface DashboardProps {
  className?: string;
}

const Dashboard = ({ className = "" }: DashboardProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [layout, setLayout] = useState([
    { id: "tasks", title: "Tasks", component: TaskManager, visible: true },
    {
      id: "calendar",
      title: "Calendar",
      component: CalendarView,
      visible: true,
    },
    {
      id: "kanban",
      title: "Kanban Board",
      component: KanbanBoard,
      visible: true,
    },
    {
      id: "notes",
      title: "Notes",
      component: NotesManager,
      visible: true,
    },
  ]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(layout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLayout(items);
  };

  const toggleComponentVisibility = (id: string) => {
    setLayout(
      layout.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item,
      ),
    );
  };

  return (
    <div className={`flex h-screen bg-background ${className}`}>
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-card border-r transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          {!sidebarCollapsed && <h2 className="text-xl font-bold">Todo App</h2>}
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeft className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <Button
              variant={activeView === "dashboard" ? "default" : "ghost"}
              className={`w-full justify-start mb-1 ${sidebarCollapsed ? "px-2" : "px-4"}`}
              onClick={() => setActiveView("dashboard")}
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Button>

            <Button
              variant={activeView === "tasks" ? "default" : "ghost"}
              className={`w-full justify-start mb-1 ${sidebarCollapsed ? "px-2" : "px-4"}`}
              onClick={() => setActiveView("tasks")}
            >
              <CheckSquare className="h-5 w-5 mr-2" />
              {!sidebarCollapsed && <span>Tasks</span>}
            </Button>

            <Button
              variant={activeView === "calendar" ? "default" : "ghost"}
              className={`w-full justify-start mb-1 ${sidebarCollapsed ? "px-2" : "px-4"}`}
              onClick={() => setActiveView("calendar")}
            >
              <Calendar className="h-5 w-5 mr-2" />
              {!sidebarCollapsed && <span>Calendar</span>}
            </Button>

            <Button
              variant={activeView === "kanban" ? "default" : "ghost"}
              className={`w-full justify-start mb-1 ${sidebarCollapsed ? "px-2" : "px-4"}`}
              onClick={() => setActiveView("kanban")}
            >
              <Kanban className="h-5 w-5 mr-2" />
              {!sidebarCollapsed && <span>Kanban</span>}
            </Button>

            <Button
              variant={activeView === "notes" ? "default" : "ghost"}
              className={`w-full justify-start mb-1 ${sidebarCollapsed ? "px-2" : "px-4"}`}
              onClick={() => setActiveView("notes")}
            >
              <FileText className="h-5 w-5 mr-2" />
              {!sidebarCollapsed && <span>Notes</span>}
            </Button>
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-4"}`}
          >
            <Settings className="h-5 w-5 mr-2" />
            {!sidebarCollapsed && <span>Settings</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === "dashboard" && (
          <div className="h-full p-4 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4 mr-2" />
                  Customize Layout
                </Button>
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable
                droppableId="dashboard-components"
                direction="vertical"
              >
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    <ResizablePanelGroup
                      direction="vertical"
                      className="min-h-[800px]"
                    >
                      {layout.map(
                        (item, index) =>
                          item.visible && (
                            <React.Fragment key={item.id}>
                              {index > 0 && <ResizableHandle withHandle />}
                              <ResizablePanel
                                defaultSize={
                                  100 / layout.filter((i) => i.visible).length
                                }
                              >
                                <Draggable draggableId={item.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                    >
                                      <Card className="h-full">
                                        <div
                                          className="p-4 border-b flex items-center justify-between"
                                          {...provided.dragHandleProps}
                                        >
                                          <h2 className="text-lg font-semibold">
                                            {item.title}
                                          </h2>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              toggleComponentVisibility(item.id)
                                            }
                                          >
                                            Hide
                                          </Button>
                                        </div>
                                        <CardContent className="p-0 h-[calc(100%-57px)]">
                                          <item.component />
                                        </CardContent>
                                      </Card>
                                    </div>
                                  )}
                                </Draggable>
                              </ResizablePanel>
                            </React.Fragment>
                          ),
                      )}
                    </ResizablePanelGroup>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {layout.some((item) => !item.visible) && (
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">Hidden Components</h3>
                <div className="flex space-x-2">
                  {layout.map(
                    (item) =>
                      !item.visible && (
                        <Button
                          key={item.id}
                          variant="outline"
                          size="sm"
                          onClick={() => toggleComponentVisibility(item.id)}
                        >
                          Show {item.title}
                        </Button>
                      ),
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === "tasks" && (
          <div className="h-full p-4">
            <h1 className="text-2xl font-bold mb-6">Tasks</h1>
            <TaskManager />
          </div>
        )}

        {activeView === "calendar" && (
          <div className="h-full p-4">
            <h1 className="text-2xl font-bold mb-6">Calendar</h1>
            <CalendarView />
          </div>
        )}

        {activeView === "kanban" && (
          <div className="h-full p-4">
            <h1 className="text-2xl font-bold mb-6">Kanban Board</h1>
            <KanbanBoard />
          </div>
        )}

        {activeView === "notes" && (
          <div className="h-full p-4">
            <h1 className="text-2xl font-bold mb-6">Notes</h1>
            <NotesManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
