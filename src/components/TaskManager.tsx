import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Search,
  Filter,
  CheckCircle,
  Circle,
  Trash2,
  Edit,
  Calendar,
  ArrowUpDown,
  Clock,
  FileText,
  Link,
  LinkIcon,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import NoteEditor, { Note } from "./NoteEditor";
import { useDatabase } from "../contexts/DatabaseContext";
import { Task as DBTask, Tag as DBTag } from "../db/models";
import { taskApi, tagApi } from '../services/api';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  linkedNoteIds?: string[];
}

interface TaskManagerProps {
  className?: string;
  notes?: Note[];
  onCreateNote?: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
}

const TaskManager = ({
  className = "",
  notes = [],
  onCreateNote = () => {},
}: TaskManagerProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [searchNotesQuery, setSearchNotesQuery] = useState("");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isLinkNoteOpen, setIsLinkNoteOpen] = useState(false);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    completed: false,
    priority: "medium",
    dueDate: null,
    linkedNoteIds: [],
  });
  const [dbTasks, setDbTasks] = useState<DBTask[]>([]);
  const [dbTags, setDbTags] = useState<DBTag[]>([]);
  const [tags, setTags] = useState<DBTag[]>([]);

  // Load tasks from database
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const loadedTasks = await taskApi.getAll();
        setDbTasks(loadedTasks);
        
        // Convert DB tasks to UI tasks
        const uiTasks = loadedTasks.map(dbTask => ({
          id: dbTask.id.toString(),
          title: dbTask.title,
          description: dbTask.description || "",
          completed: dbTask.completed,
          priority: "medium" as const, // Default priority
          dueDate: null, // No due date in DB schema yet
          linkedNoteIds: [],
        }));
        
        setTasks(uiTasks);
        setFilteredTasks(uiTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    };
    
    const loadTags = async () => {
      try {
        const loadedTags = await tagApi.getAllTags();
        setDbTags(loadedTags);
        setTags(loadedTags);
      } catch (error) {
        console.error("Error loading tags:", error);
      }
    };
    
    loadTasks();
    loadTags();
  }, []);

  useEffect(() => {
    const filtered = tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTasks(filtered);
  }, [searchTerm, tasks]);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const result = await taskApi.create(newTask.title, newTask.description);
      const newTaskWithId = {
        id: result.lastInsertRowid.toString(),
        title: newTask.title,
        description: newTask.description,
        completed: false,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        linkedNoteIds: [],
      };
      setTasks([...tasks, newTaskWithId]);
      setNewTask({
        title: "",
        description: "",
        completed: false,
        priority: "medium",
        dueDate: null,
        linkedNoteIds: [],
      });
      setIsAddTaskOpen(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !selectedTask.title.trim()) return;

    try {
      const taskToUpdate = {
        title: selectedTask.title,
        description: selectedTask.description,
        completed: selectedTask.completed,
        priority: selectedTask.priority,
        dueDate: selectedTask.dueDate,
        linkedNoteIds: selectedTask.linkedNoteIds
      };
      
      await taskApi.updateTask(parseInt(selectedTask.id), taskToUpdate);
      setTasks(tasks.map(task =>
        task.id === selectedTask.id ? selectedTask : task
      ));
      setIsEditTaskOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleLinkNote = (taskId: string, noteId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const linkedNoteIds = task.linkedNoteIds || [];
          if (!linkedNoteIds.includes(noteId)) {
            return {
              ...task,
              linkedNoteIds: [...linkedNoteIds, noteId],
            };
          }
        }
        return task;
      }),
    );
  };

  const handleUnlinkNote = (taskId: string, noteId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId && task.linkedNoteIds) {
          return {
            ...task,
            linkedNoteIds: task.linkedNoteIds.filter((id) => id !== noteId),
          };
        }
        return task;
      }),
    );
  };

  const handleCreateNoteForTask = (
    noteData: Omit<Note, "id" | "createdAt" | "updatedAt">,
  ) => {
    // Call the parent component's onCreateNote function
    onCreateNote(noteData);

    // Close the dialog
    setIsLinkNoteOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskApi.deleteTask(parseInt(id));
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleToggleComplete = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const updatedTask = { ...task, completed: !task.completed };
      const taskToUpdate = {
        title: updatedTask.title,
        description: updatedTask.description,
        completed: updatedTask.completed,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate,
        linkedNoteIds: updatedTask.linkedNoteIds
      };
      
      await taskApi.updateTask(parseInt(id), taskToUpdate);
      setTasks(tasks.map(t =>
        t.id === id ? updatedTask : t
      ));
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card className={`bg-white h-full flex flex-col ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          <span>Task Manager</span>
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto" onClick={() => setIsAddTaskOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="Task title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    placeholder="Task description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) =>
                      setNewTask({
                        ...newTask,
                        priority: value as "low" | "medium" | "high",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate || ""}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        dueDate: e.target.value || null,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddTask}>Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <div className="px-6 py-2 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-2 mt-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found. Add a new task to get started.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 border rounded-lg flex items-start gap-2 ${task.completed ? "bg-muted/50" : ""}`}
              >
                <div className="mt-1">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleComplete(task.id)}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3
                      className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Badge variant={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
                          </DialogHeader>
                          {selectedTask && (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                  id="edit-title"
                                  value={selectedTask.title}
                                  onChange={(e) =>
                                    setSelectedTask({
                                      ...selectedTask,
                                      title: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-description">
                                  Description
                                </Label>
                                <Textarea
                                  id="edit-description"
                                  value={selectedTask.description}
                                  onChange={(e) =>
                                    setSelectedTask({
                                      ...selectedTask,
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-priority">Priority</Label>
                                <Select
                                  value={selectedTask.priority}
                                  onValueChange={(value) =>
                                    setSelectedTask({
                                      ...selectedTask,
                                      priority: value as
                                        | "low"
                                        | "medium"
                                        | "high",
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">
                                      Medium
                                    </SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-dueDate">
                                  Due Date (Optional)
                                </Label>
                                <Input
                                  id="edit-dueDate"
                                  type="date"
                                  value={selectedTask.dueDate || ""}
                                  onChange={(e) =>
                                    setSelectedTask({
                                      ...selectedTask,
                                      dueDate: e.target.value || null,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button onClick={handleUpdateTask}>
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {task.dueDate && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {task.linkedNoteIds && task.linkedNoteIds.length > 0 && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs"
                      >
                        <FileText className="h-3 w-3" />
                        {task.linkedNoteIds.length}{" "}
                        {task.linkedNoteIds.length === 1 ? "note" : "notes"}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                        setIsLinkNoteOpen(true);
                      }}
                    >
                      <LinkIcon className="h-3 w-3 mr-1" />
                      {task.linkedNoteIds && task.linkedNoteIds.length > 0
                        ? "Manage Notes"
                        : "Link Notes"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {tasks.filter((t) => t.completed).length} of {tasks.length} tasks
          completed
        </div>
      </CardFooter>

      {/* Link Notes Dialog */}
      <Dialog open={isLinkNoteOpen} onOpenChange={setIsLinkNoteOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Link Notes to Task</DialogTitle>
            <DialogDescription>
              {selectedTask && (
                <span>Task: {selectedTask.title}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                className="pl-8"
                value={searchNotesQuery}
                onChange={(e) => setSearchNotesQuery(e.target.value)}
              />
            </div>
            <div className="border rounded-md">
              <ScrollArea className="h-[300px]">
                <div className="p-4 space-y-4">
                  {notes.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No notes available. Create a new note to link to this
                      task.
                    </div>
                  ) : (
                    notes
                      .filter(
                        (note) =>
                          note.title
                            .toLowerCase()
                            .includes(searchNotesQuery.toLowerCase()) ||
                          note.content
                            .toLowerCase()
                            .includes(searchNotesQuery.toLowerCase()),
                      )
                      .map((note) => (
                        <div key={note.id} className="border rounded-md p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{note.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {note.content}
                              </p>
                            </div>
                            <div>
                              {selectedTask &&
                              selectedTask.linkedNoteIds?.includes(
                                note.id,
                              ) ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (selectedTask) {
                                      handleUnlinkNote(
                                        selectedTask.id,
                                        note.id,
                                      );
                                    }
                                  }}
                                >
                                  Unlink
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (selectedTask) {
                                      handleLinkNote(
                                        selectedTask.id,
                                        note.id,
                                      );
                                    }
                                  }}
                                >
                                  <Link className="h-4 w-4 mr-1" />
                                  Link
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </div>
            <div className="flex justify-center">
              <NoteEditor
                onSave={(noteData) => {
                  if (selectedTask) {
                    // Add the task ID to the linkedTaskIds array
                    const updatedNoteData = {
                      ...noteData,
                      linkedTaskIds: [
                        ...(noteData.linkedTaskIds || []),
                        selectedTask.id,
                      ],
                    };
                    handleCreateNoteForTask(updatedNoteData);
                  }
                }}
                trigger={
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Note
                  </Button>
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsLinkNoteOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TaskManager;

// TODO: Implement drag-and-drop for task reordering
// TODO: Add support for nested tasks and subtasks
// TODO: Create custom lists/categories for better organization
// TODO: Handle and display tasks that originate from integrations (calendar, email, messaging)
// TODO: Allow user actions (confirm, edit, dismiss) on suggested tasks from integrations
