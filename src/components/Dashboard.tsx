import React, { useState, useEffect } from "react";
import DragDropContextWrapper from "./DragDropContextWrapper";
import DroppableWrapper from "./DroppableWrapper";
import DraggableWrapper from "./DraggableWrapper";
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
import MetricCard from "./dashboard/MetricCard";
import QuoteCard from "./dashboard/QuoteCard";
import RemindersList, { Reminder } from "./dashboard/RemindersList";
import HackerNewsWidget from "@/components/widgets/HackerNewsWidget";
// import YouTubeWidget from "@/components/widgets/YouTubeWidget";
import RSSFeedWidget from "@/components/widgets/RSSFeedWidget";
import RAGSearch from "@/components/dashboard/RAGSearch";
import {
  Menu,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Kanban,
  Settings,
  PanelLeft,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface DashboardProps {
  className?: string;
}

const Dashboard = ({
  className = "",
  showSidebar = true,
}: DashboardProps & { showSidebar?: boolean }) => {
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

  // Mock data for dashboard metrics
  const [metrics, setMetrics] = useState({
    tasksCompleted: 12,
    tasksCompletionRate: 75,
    upcomingDeadlines: 3,
    streak: 5,
  });

  // Mock data for reminders
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      title: "Complete project proposal",
      dueDate: "Today, 5:00 PM",
      priority: "high",
      completed: false,
    },
    {
      id: "2",
      title: "Schedule team meeting",
      dueDate: "Tomorrow, 10:00 AM",
      priority: "medium",
      completed: false,
    },
    {
      id: "3",
      title: "Review quarterly goals",
      dueDate: "Friday, 3:00 PM",
      priority: "low",
      completed: false,
    },
  ]);

  // Mock data for quote of the day
  const [quote, setQuote] = useState({
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  });

  // Handle completing a reminder
  const handleCompleteReminder = (id: string) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === id
          ? { ...reminder, completed: !reminder.completed }
          : reminder,
      ),
    );

    // Update metrics when a task is completed
    const reminder = reminders.find((r) => r.id === id);
    if (reminder && !reminder.completed) {
      setMetrics((prev) => ({
        ...prev,
        tasksCompleted: prev.tasksCompleted + 1,
        tasksCompletionRate: Math.min(100, prev.tasksCompletionRate + 2),
      }));
    } else if (reminder && reminder.completed) {
      setMetrics((prev) => ({
        ...prev,
        tasksCompleted: Math.max(0, prev.tasksCompleted - 1),
        tasksCompletionRate: Math.max(0, prev.tasksCompletionRate - 2),
      }));
    }
  };

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
      {/* Sidebar - only shown when showSidebar prop is true */}
      {showSidebar && (
        <div
          className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-card border-r transition-all duration-300 flex flex-col`}
        >
          <div className="p-4 flex items-center justify-between border-b">
            {!sidebarCollapsed && (
              <div className="flex items-center">
                <img
                  src="tuduo.png"
                  alt="Toduo Logo"
                  className="h-10 w-10 mr-2"
                />
                {/* <h2 className="text-xl font-bold">Toduo</h2> */}
              </div>
            )}
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
      )}

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

            {/* Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard
                title="Tasks Completed"
                value={metrics.tasksCompleted}
                icon={<CheckCircle className="h-5 w-5 text-primary" />}
                trend={{ value: 12, isPositive: true }}
              />
              <MetricCard
                title="Completion Rate"
                value={`${metrics.tasksCompletionRate}%`}
                icon={<TrendingUp className="h-5 w-5 text-primary" />}
                description="Based on last 30 days"
              />
              <MetricCard
                title="Upcoming Deadlines"
                value={metrics.upcomingDeadlines}
                icon={<Clock className="h-5 w-5 text-primary" />}
                description="Due in the next 48 hours"
              />
              <MetricCard
                title="Current Streak"
                value={`${metrics.streak} days`}
                icon={<AlertCircle className="h-5 w-5 text-primary" />}
                description="Keep it going!"
              />
            </div>

            {/* Reminders and Quote Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2">
                <RemindersList
                  reminders={reminders}
                  onComplete={handleCompleteReminder}
                />
              </div>
              <div>
                <QuoteCard quote={quote.text} author={quote.author} />
              </div>
            </div>

            {/* Featured Widgets */}
            <h2 className="text-xl font-semibold mb-4">Featured Widgets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <HackerNewsWidget />
              {/* <YouTubeWidget /> */}
              <RSSFeedWidget />
              <RAGSearch />
            </div>
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

// TODO: Implement drag-and-drop for task reordering
// TODO: Add support for nested tasks and subtasks
// TODO: Create custom lists/categories for better organization
// TODO: Add dark/light theme toggle
// TODO: Implement keyboard shortcuts for power users
// TODO: Design mobile-responsive layouts for all screen sizes
// TODO: Improve offline conflict resolution for cloud sync
// TODO: Add data export/import functionality
// TODO: Implement end-to-end encryption for cloud data
// TODO: Add shared lists with permission controls
// TODO: Implement real-time collaborative editing
// TODO: Create notification system for shared task updates
// TODO: Calendar integration (Google Calendar, Apple Calendar)
// TODO: Email integration for task creation via email
// TODO: API for third-party integrations
// TODO: Optimize database queries for faster loading
// TODO: Implement lazy loading for large task lists
// TODO: Reduce Electron app memory footprint
// TODO: Surface auto-extracted tasks from integrations in the dashboard
// TODO: Visually distinguish tasks that were auto-extracted from integrations (e.g., badge, icon, or section)
// TODO: Allow users to confirm, edit, or dismiss suggested tasks from integrations
