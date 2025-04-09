import React, { useState, useEffect } from "react";
import DragDropContextWrapper from "./DragDropContextWrapper";
import DroppableWrapper from "./DroppableWrapper";
import DraggableWrapper from "./DraggableWrapper";
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
import { useDatabase } from "../contexts/DatabaseContext";
import { KanbanBoard as DBBoard, KanbanColumn as DBColumn, KanbanCard as DBCard, Tag as DBTag } from "../db/models";

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
  const { kanbanService, tagService } = useDatabase();
  const [columns, setColumns] = useState<Column[]>([]);
  const [dbBoards, setDbBoards] = useState<DBBoard[]>([]);
  const [dbColumns, setDbColumns] = useState<DBColumn[]>([]);
  const [dbCards, setDbCards] = useState<DBCard[]>([]);
  const [dbTags, setDbTags] = useState<DBTag[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<DBBoard | null>(null);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    priority: "medium",
    labels: [],
  });
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [labelFilter, setLabelFilter] = useState<string>("all");

  // Load boards from database
  useEffect(() => {
    const loadBoards = async () => {
      try {
        const loadedBoards = await kanbanService.getAllBoards();
        setDbBoards(loadedBoards);
        
        if (loadedBoards.length > 0) {
          setSelectedBoard(loadedBoards[0]);
        }
      } catch (error) {
        console.error("Error loading boards:", error);
      }
    };
    
    const loadTags = async () => {
      try {
        const loadedTags = await tagService.getAllTags();
        setDbTags(loadedTags);
      } catch (error) {
        console.error("Error loading tags:", error);
      }
    };
    
    loadBoards();
    loadTags();
  }, [kanbanService, tagService]);

  // Load columns and cards when a board is selected
  useEffect(() => {
    if (!selectedBoard) return;
    
    const loadColumnsAndCards = async () => {
      try {
        const loadedColumns = await kanbanService.getColumnsByBoardId(selectedBoard.id);
        setDbColumns(loadedColumns);
        
        // Load cards for each column
        const loadedCards: DBCard[] = [];
        for (const column of loadedColumns) {
          const columnCards = await kanbanService.getCardsByColumnId(column.id);
          loadedCards.push(...columnCards);
        }
        setDbCards(loadedCards);
        
        // Convert to UI format
        const uiColumns: Column[] = loadedColumns.map(column => {
          const columnCards = loadedCards.filter(card => card.column_id === column.id);
          return {
            id: column.id.toString(),
            title: column.title,
            tasks: columnCards.map(card => ({
              id: card.id.toString(),
              title: card.title,
              description: card.description || "",
              priority: "medium" as const, // Default priority
              labels: [],
            })),
          };
        });
        
        setColumns(uiColumns);
      } catch (error) {
        console.error("Error loading columns and cards:", error);
      }
    };
    
    loadColumnsAndCards();
  }, [selectedBoard, kanbanService]);

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId, type } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // If dragging a column
    if (type === "column") {
      const newColumns = Array.from(columns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);
      
      // Update column positions in database
      newColumns.forEach((column, index) => {
        kanbanService.updateColumn(parseInt(column.id), { position: index });
      });
      
      setColumns(newColumns);
      return;
    }

    // If dragging a task
    const sourceColumn = columns.find(
      (col) => col.id === source.droppableId
    );
    const destColumn = columns.find(
      (col) => col.id === destination.droppableId
    );

    if (!sourceColumn || !destColumn) return;

    const sourceTasks = Array.from(sourceColumn.tasks);
    const destTasks =
      source.droppableId === destination.droppableId
        ? sourceTasks
        : Array.from(destColumn.tasks);

    const [removed] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, removed);

    const newColumns = columns.map((col) => {
      if (col.id === source.droppableId) {
        return {
          ...col,
          tasks: sourceTasks,
        };
      }
      if (col.id === destination.droppableId) {
        return {
          ...col,
          tasks: destTasks,
        };
      }
      return col;
    });
    
    // Update card positions in database
    destTasks.forEach((task, index) => {
      kanbanService.updateCard(parseInt(task.id), { 
        column_id: parseInt(destination.droppableId),
        position: index 
      });
    });
    
    setColumns(newColumns);
  };

  const handleAddColumn = async () => {
    if (!selectedBoard || newColumnTitle.trim() === "") return;
    
    try {
      // Add column to database
      const result = await kanbanService.createColumn(
        selectedBoard.id,
        newColumnTitle,
        columns.length
      );
      
      // Create UI column
      const newColumn: Column = {
        id: result.lastInsertRowid.toString(),
        title: newColumnTitle,
        tasks: [],
      };
      
      setColumns([...columns, newColumn]);
      setNewColumnTitle("");
      setIsAddColumnOpen(false);
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  const handleAddTask = async () => {
    if (!selectedColumn || newTask.title.trim() === "") return;
    
    try {
      // Add card to database
      const result = await kanbanService.createCard(
        parseInt(selectedColumn.id),
        newTask.title,
        newTask.description,
        selectedColumn.tasks.length
      );
      
      // Create UI task
      const newTaskItem: Task = {
        id: result.lastInsertRowid.toString(),
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        labels: newTask.labels,
      };
      
      // Update UI
      const updatedColumns = columns.map((col) => {
        if (col.id === selectedColumn.id) {
          return {
            ...col,
            tasks: [...col.tasks, newTaskItem],
          };
        }
        return col;
      });
      
      setColumns(updatedColumns);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        labels: [],
      });
      setIsAddTaskOpen(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Filter tasks based on priority and label
  const getFilteredTasks = (tasks: Task[]) => {
    return tasks.filter((task) => {
      const priorityMatch =
        priorityFilter === "all" || task.priority === priorityFilter;
      const labelMatch =
        labelFilter === "all" ||
        (task.labels && task.labels.includes(labelFilter));
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
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
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
            <Select value={labelFilter} onValueChange={setLabelFilter}>
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
            open={isAddColumnOpen}
            onOpenChange={setIsAddColumnOpen}
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
        <DragDropContextWrapper onDragEnd={onDragEnd}>
          <div className="flex space-x-4 h-full">
            {columns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>{column.title}</CardTitle>
                      <Dialog
                        open={
                          isAddTaskOpen && selectedColumn?.id === column.id
                        }
                        onOpenChange={(open) => {
                          setIsAddTaskOpen(open);
                          if (open) setSelectedColumn(column);
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
                    <DroppableWrapper droppableId={column.id}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 min-h-[200px]"
                        >
                          {getFilteredTasks(column.tasks).map((task, index) => (
                            <DraggableWrapper
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
                            </DraggableWrapper>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </DroppableWrapper>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </DragDropContextWrapper>
      </div>
    </div>
  );
};

export default KanbanBoard;
