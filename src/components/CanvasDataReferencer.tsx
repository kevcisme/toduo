import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, Calendar, CheckSquare, FileText } from "lucide-react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { Task, Note, CalendarEvent } from "@/db/models";
import { CanvasItemUnion } from "@/types/canvas";

interface CanvasDataReferencerProps {
  onAddItem: (item: CanvasItemUnion) => void;
}

const CanvasDataReferencer: React.FC<CanvasDataReferencerProps> = ({
  onAddItem,
}) => {
  const { taskApi, noteApi, kanbanService } = useDatabase();
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState({
    tasks: false,
    notes: false,
    events: false,
  });

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading({ tasks: true, notes: true, events: true });

        // Load tasks
        const tasksData = await taskApi.getAll();
        setTasks(tasksData);

        // Load notes
        const notesData = await noteApi.getAll();
        setNotes(notesData);

        // Load calendar events
        // This would typically come from a calendar API
        // For now, we'll use an empty array
        setEvents([]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading({ tasks: false, notes: false, events: false });
      }
    };

    loadData();
  }, [taskApi, noteApi]);

  // Filter data based on search query
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Add task to canvas
  const handleAddTask = (task: Task) => {
    const newItem: CanvasItemUnion = {
      id: `task-${Date.now()}`,
      type: "task",
      taskId: task.id,
      title: task.title,
      position: { x: 100, y: 100 },
      size: { width: 250, height: 150 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onAddItem(newItem);
  };

  // Add note to canvas
  const handleAddNote = (note: Note) => {
    const newItem: CanvasItemUnion = {
      id: `note-${Date.now()}`,
      type: "note",
      noteId: note.id,
      title: note.title,
      position: { x: 100, y: 100 },
      size: { width: 300, height: 200 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onAddItem(newItem);
  };

  // Add event to canvas
  const handleAddEvent = (event: CalendarEvent) => {
    const newItem: CanvasItemUnion = {
      id: `event-${Date.now()}`,
      type: "event",
      eventId: event.id,
      title: event.title,
      position: { x: 100, y: 100 },
      size: { width: 250, height: 150 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onAddItem(newItem);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-2">Reference Data</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks, notes, events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="tasks" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="tasks">
            <CheckSquare className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="notes">
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="flex-1 p-2">
          <ScrollArea className="h-full">
            {loading.tasks ? (
              <div className="text-center py-4">Loading tasks...</div>
            ) : filteredTasks.length > 0 ? (
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 border rounded-md hover:bg-accent/10 cursor-pointer"
                    onClick={() => handleAddTask(task)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckSquare className="h-4 w-4 mr-2" />
                        <span className="font-medium">{task.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddTask(task);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {task.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {searchQuery ? "No matching tasks found" : "No tasks available"}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="notes" className="flex-1 p-2">
          <ScrollArea className="h-full">
            {loading.notes ? (
              <div className="text-center py-4">Loading notes...</div>
            ) : filteredNotes.length > 0 ? (
              <div className="space-y-2">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 border rounded-md hover:bg-accent/10 cursor-pointer"
                    onClick={() => handleAddNote(note)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="font-medium">{note.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddNote(note);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    {note.content && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {note.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {searchQuery ? "No matching notes found" : "No notes available"}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="events" className="flex-1 p-2">
          <ScrollArea className="h-full">
            {loading.events ? (
              <div className="text-center py-4">Loading events...</div>
            ) : filteredEvents.length > 0 ? (
              <div className="space-y-2">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 border rounded-md hover:bg-accent/10 cursor-pointer"
                    onClick={() => handleAddEvent(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-medium">{event.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddEvent(event);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {event.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {searchQuery
                  ? "No matching events found"
                  : "No events available"}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CanvasDataReferencer;
