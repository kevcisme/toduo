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
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project proposal",
      description: "Finish the draft and send it to the team for review",
      completed: false,
      priority: "high",
      dueDate: "2023-06-15",
      linkedNoteIds: ["2"],
    },
    {
      id: "2",
      title: "Schedule team meeting",
      description: "Coordinate with all team members for weekly sync",
      completed: true,
      priority: "medium",
      dueDate: "2023-06-10",
      linkedNoteIds: [],
    },
    {
      id: "3",
      title: "Research new tools",
      description: "Look into productivity tools for the team",
      completed: false,
      priority: "low",
      dueDate: null,
      linkedNoteIds: [],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    completed: false,
    priority: "medium",
    dueDate: null,
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showLinkNotesDialog, setShowLinkNotesDialog] = useState(false);
  const [selectedTaskForNotes, setSelectedTaskForNotes] = useState<Task | null>(
    null,
  );
  const [searchNotesQuery, setSearchNotesQuery] = useState("");

  const handleAddTask = () => {
    if (newTask.title.trim() === "") return;

    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      description: "",
      completed: false,
      priority: "medium",
      dueDate: null,
    });
  };

  const handleUpdateTask = () => {
    if (!editingTask || editingTask.title.trim() === "") return;

    setTasks(
      tasks.map((task) => (task.id === editingTask.id ? editingTask : task)),
    );
    setEditingTask(null);
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
    setShowLinkNotesDialog(false);
    setSelectedTaskForNotes(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const filteredTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter(
      (task) => filterPriority === "all" || task.priority === filterPriority,
    )
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        return 0;
      }
    });

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
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto">
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterPriority} onValueChange={setFilterPriority}>
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
                          {editingTask && (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                  id="edit-title"
                                  value={editingTask.title}
                                  onChange={(e) =>
                                    setEditingTask({
                                      ...editingTask,
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
                                  value={editingTask.description}
                                  onChange={(e) =>
                                    setEditingTask({
                                      ...editingTask,
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-priority">Priority</Label>
                                <Select
                                  value={editingTask.priority}
                                  onValueChange={(value) =>
                                    setEditingTask({
                                      ...editingTask,
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
                                  value={editingTask.dueDate || ""}
                                  onChange={(e) =>
                                    setEditingTask({
                                      ...editingTask,
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
                        setSelectedTaskForNotes(task);
                        setShowLinkNotesDialog(true);
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
      <Dialog open={showLinkNotesDialog} onOpenChange={setShowLinkNotesDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Link Notes to Task</DialogTitle>
            <DialogDescription>
              {selectedTaskForNotes && (
                <span>Task: {selectedTaskForNotes.title}</span>
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
                              {selectedTaskForNotes &&
                              selectedTaskForNotes.linkedNoteIds?.includes(
                                note.id,
                              ) ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (selectedTaskForNotes) {
                                      handleUnlinkNote(
                                        selectedTaskForNotes.id,
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
                                    if (selectedTaskForNotes) {
                                      handleLinkNote(
                                        selectedTaskForNotes.id,
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
                  if (selectedTaskForNotes) {
                    // Add the task ID to the linkedTaskIds array
                    const updatedNoteData = {
                      ...noteData,
                      linkedTaskIds: [
                        ...(noteData.linkedTaskIds || []),
                        selectedTaskForNotes.id,
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
            <Button onClick={() => setShowLinkNotesDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TaskManager;
