import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, MoreHorizontal, Tag, Calendar, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  labels?: string[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const KanbanBoard = () => {
  // Default columns and sample tasks
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "todo",
      title: "To Do",
      tasks: [
        {
          id: "task-1",
          title: "Research project requirements",
          description:
            "Gather all necessary information for the upcoming project",
          priority: "high",
          dueDate: "2023-06-15",
          labels: ["research", "planning"],
        },
        {
          id: "task-2",
          title: "Update documentation",
          description: "Review and update existing documentation",
          priority: "medium",
          dueDate: "2023-06-20",
          labels: ["documentation"],
        },
      ],
    },
    {
      id: "in-progress",
      title: "In Progress",
      tasks: [
        {
          id: "task-3",
          title: "Design user interface",
          description: "Create wireframes and mockups for the new feature",
          priority: "high",
          dueDate: "2023-06-10",
          labels: ["design", "ui"],
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      tasks: [
        {
          id: "task-4",
          title: "Setup development environment",
          description: "Install and configure necessary tools",
          priority: "low",
          dueDate: "2023-06-05",
          labels: ["setup", "dev"],
        },
      ],
    },
  ]);

  // State for new column dialog
  const [isNewColumnDialogOpen, setIsNewColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // State for new task dialog
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTaskColumnId, setNewTaskColumnId] = useState("");
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    labels: [],
  });

  // State for task filter
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterLabel, setFilterLabel] = useState<string>("all");

  // Handle drag and drop
  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped back to its original position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Find the source and destination columns
    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find(
      (col) => col.id === destination.droppableId,
    );

    if (!sourceColumn || !destColumn) return;

    // Create new arrays to avoid mutating state directly
    const newColumns = [...columns];
    const sourceColumnIndex = newColumns.findIndex(
      (col) => col.id === source.droppableId,
    );
    const destColumnIndex = newColumns.findIndex(
      (col) => col.id === destination.droppableId,
    );

    // Find the task being moved
    const task = sourceColumn.tasks.find((task) => task.id === draggableId);
    if (!task) return;

    // Remove task from source column
    newColumns[sourceColumnIndex] = {
      ...sourceColumn,
      tasks: sourceColumn.tasks.filter((task) => task.id !== draggableId),
    };

    // Add task to destination column
    const newTasks = [...destColumn.tasks];
    newTasks.splice(destination.index, 0, task);
    newColumns[destColumnIndex] = {
      ...destColumn,
      tasks: newTasks,
    };

    setColumns(newColumns);
  };

  // Add a new column
  const handleAddColumn = () => {
    if (newColumnTitle.trim() === "") return;

    const newColumn: Column = {
      id: `column-${Date.now()}`,
      title: newColumnTitle,
      tasks: [],
    };

    setColumns([...columns, newColumn]);
    setNewColumnTitle("");
    setIsNewColumnDialogOpen(false);
  };

  // Add a new task
  const handleAddTask = () => {
    if (newTask.title.trim() === "" || !newTaskColumnId) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      ...newTask,
    };

    const newColumns = columns.map((column) => {
      if (column.id === newTaskColumnId) {
        return {
          ...column,
          tasks: [...column.tasks, task],
        };
      }
      return column;
    });

    setColumns(newColumns);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      labels: [],
    });
    setIsNewTaskDialogOpen(false);
  };

  // Filter tasks based on priority and label
  const getFilteredTasks = (tasks: Task[]) => {
    return tasks.filter((task) => {
      const priorityMatch =
        filterPriority === "all" || task.priority === filterPriority;
      const labelMatch =
        filterLabel === "all" ||
        (task.labels && task.labels.includes(filterLabel));
      return priorityMatch && labelMatch;
    });
  };

  // Get all unique labels from all tasks
  const getAllLabels = () => {
    const labels = new Set<string>();
    columns.forEach((column) => {
      column.tasks.forEach((task) => {
        if (task.labels) {
          task.labels.forEach((label) => labels.add(label));
        }
      });
    });
    return Array.from(labels);
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Kanban Board</h2>

        <div className="flex space-x-4">
          {/* Filter by priority */}
          <div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter by label */}
          <div>
            <Select value={filterLabel} onValueChange={setFilterLabel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Labels</SelectItem>
                {getAllLabels().map((label) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add new column button */}
          <Dialog
            open={isNewColumnDialogOpen}
            onOpenChange={setIsNewColumnDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Column
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Column</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="column-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="column-title"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddColumn}>Add Column</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-4 h-full">
            {columns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>{column.title}</CardTitle>
                      <Dialog
                        open={
                          isNewTaskDialogOpen && newTaskColumnId === column.id
                        }
                        onOpenChange={(open) => {
                          setIsNewTaskDialogOpen(open);
                          if (open) setNewTaskColumnId(column.id);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="task-title"
                                className="text-right"
                              >
                                Title
                              </Label>
                              <Input
                                id="task-title"
                                value={newTask.title}
                                onChange={(e) =>
                                  setNewTask({
                                    ...newTask,
                                    title: e.target.value,
                                  })
                                }
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="task-description"
                                className="text-right"
                              >
                                Description
                              </Label>
                              <Input
                                id="task-description"
                                value={newTask.description || ""}
                                onChange={(e) =>
                                  setNewTask({
                                    ...newTask,
                                    description: e.target.value,
                                  })
                                }
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="task-priority"
                                className="text-right"
                              >
                                Priority
                              </Label>
                              <Select
                                value={newTask.priority}
                                onValueChange={(
                                  value: "low" | "medium" | "high",
                                ) =>
                                  setNewTask({ ...newTask, priority: value })
                                }
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="task-due-date"
                                className="text-right"
                              >
                                Due Date
                              </Label>
                              <Input
                                id="task-due-date"
                                type="date"
                                value={newTask.dueDate || ""}
                                onChange={(e) =>
                                  setNewTask({
                                    ...newTask,
                                    dueDate: e.target.value,
                                  })
                                }
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="task-labels"
                                className="text-right"
                              >
                                Labels
                              </Label>
                              <Input
                                id="task-labels"
                                placeholder="Comma-separated labels"
                                value={(newTask.labels || []).join(", ")}
                                onChange={(e) =>
                                  setNewTask({
                                    ...newTask,
                                    labels: e.target.value
                                      .split(",")
                                      .map((label) => label.trim())
                                      .filter(Boolean),
                                  })
                                }
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAddTask}>Add Task</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto">
                    <Droppable droppableId={column.id}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 min-h-[200px]"
                        >
                          {getFilteredTasks(column.tasks).map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white p-3 rounded-md shadow-sm border border-gray-200"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium">
                                      {task.title}
                                    </h3>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  {task.description && (
                                    <p className="text-sm text-gray-600 mb-2">
                                      {task.description}
                                    </p>
                                  )}

                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {task.labels &&
                                      task.labels.map((label) => (
                                        <Badge
                                          key={label}
                                          variant="outline"
                                          className="flex items-center"
                                        >
                                          <Tag className="h-3 w-3 mr-1" />
                                          {label}
                                        </Badge>
                                      ))}
                                  </div>

                                  <div className="flex justify-between text-xs text-gray-500">
                                    <div className="flex items-center">
                                      <Badge
                                        className={`${getPriorityColor(task.priority)} text-white`}
                                      >
                                        {task.priority}
                                      </Badge>
                                    </div>

                                    {task.dueDate && (
                                      <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(
                                          task.dueDate,
                                        ).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
