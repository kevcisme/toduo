import React, { useState } from "react";
import Dashboard from "./Dashboard";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Calendar,
  CheckSquare,
  Kanban,
  Menu,
  Settings,
  FileText,
} from "lucide-react";
import NotesManager from "./NotesManager";

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard");

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <div className="w-16 md:w-64 h-full border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold hidden md:block">Todo App</h1>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 p-2 space-y-2">
          <Button
            variant={activeView === "dashboard" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("dashboard")}
          >
            <CheckSquare className="h-5 w-5 mr-2" />
            <span className="hidden md:inline">Dashboard</span>
          </Button>
          <Button
            variant={activeView === "tasks" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("tasks")}
          >
            <CheckSquare className="h-5 w-5 mr-2" />
            <span className="hidden md:inline">Tasks</span>
          </Button>
          <Button
            variant={activeView === "calendar" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("calendar")}
          >
            <Calendar className="h-5 w-5 mr-2" />
            <span className="hidden md:inline">Calendar</span>
          </Button>
          <Button
            variant={activeView === "kanban" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("kanban")}
          >
            <Kanban className="h-5 w-5 mr-2" />
            <span className="hidden md:inline">Kanban</span>
          </Button>
          <Button
            variant={activeView === "notes" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("notes")}
          >
            <FileText className="h-5 w-5 mr-2" />
            <span className="hidden md:inline">Notes</span>
          </Button>
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-5 w-5 mr-2" />
            <span className="hidden md:inline">Settings</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-4">
          <h2 className="text-xl font-semibold">
            {activeView === "dashboard" && "Dashboard"}
            {activeView === "tasks" && "Tasks"}
            {activeView === "calendar" && "Calendar"}
            {activeView === "kanban" && "Kanban Board"}
            {activeView === "notes" && "Notes"}
          </h2>
          <div className="flex items-center space-x-2">
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4">
          {activeView === "dashboard" && <Dashboard showSidebar={false} />}

          {activeView === "tasks" && (
            <div className="grid gap-4">
              <Tabs defaultValue="all">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="all">All Tasks</TabsTrigger>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                  <Button size="sm" variant="outline">
                    Filter
                  </Button>
                </div>
                <TabsContent value="all" className="space-y-4">
                  <p className="text-center text-muted-foreground py-8">
                    Your tasks will appear here. Create a new task to get
                    started.
                  </p>
                </TabsContent>
                <TabsContent value="today" className="space-y-4">
                  <p className="text-center text-muted-foreground py-8">
                    No tasks scheduled for today.
                  </p>
                </TabsContent>
                <TabsContent value="upcoming" className="space-y-4">
                  <p className="text-center text-muted-foreground py-8">
                    No upcoming tasks.
                  </p>
                </TabsContent>
                <TabsContent value="completed" className="space-y-4">
                  <p className="text-center text-muted-foreground py-8">
                    No completed tasks yet.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeView === "calendar" && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <Tabs defaultValue="week">
                  <TabsList>
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button size="sm" variant="outline">
                  Connect Calendar
                </Button>
              </div>
              <div className="flex-1 border rounded-lg p-4 bg-card">
                <p className="text-center text-muted-foreground py-8">
                  Connect your Google Calendar or Outlook to see your events
                  here.
                </p>
              </div>
            </div>
          )}

          {activeView === "kanban" && (
            <div className="h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Kanban Board</h3>
                <Button size="sm" variant="outline">
                  Add Column
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-3rem)]">
                <div className="border rounded-lg p-4 bg-card">
                  <h4 className="font-medium mb-2 flex justify-between items-center">
                    To Do{" "}
                    <span className="text-muted-foreground text-sm">0</span>
                  </h4>
                  <div className="space-y-2">
                    <p className="text-center text-muted-foreground py-8">
                      No tasks in this column.
                    </p>
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-card">
                  <h4 className="font-medium mb-2 flex justify-between items-center">
                    In Progress{" "}
                    <span className="text-muted-foreground text-sm">0</span>
                  </h4>
                  <div className="space-y-2">
                    <p className="text-center text-muted-foreground py-8">
                      No tasks in this column.
                    </p>
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-card">
                  <h4 className="font-medium mb-2 flex justify-between items-center">
                    Done{" "}
                    <span className="text-muted-foreground text-sm">0</span>
                  </h4>
                  <div className="space-y-2">
                    <p className="text-center text-muted-foreground py-8">
                      No tasks in this column.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "notes" && (
            <div className="h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Notes</h3>
              </div>
              <div className="h-[calc(100%-3rem)]">
                <NotesManager />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
