import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import {
  PlusCircle,
  Edit,
  Trash2,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import { Document } from "./DocumentUpload";
import {
  getDocumentsByNoteId,
  getAllDocuments,
} from "@/services/documentService";
import { DailyTask } from "@/types/app";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  linkedTaskIds?: string[];
  linkedEventIds?: string[];
  linkedDocumentIds?: string[];
  linkedScheduleTaskIds?: string[];
  tags?: string[];
}

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  trigger?: React.ReactNode;
  title?: string;
  availableDocuments?: Document[];
  availableTasks?: DailyTask[];
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  trigger,
  title = note ? "Edit Note" : "Create Note",
  availableDocuments = [],
  availableTasks = [],
}) => {
  const [noteData, setNoteData] = useState<
    Omit<Note, "id" | "createdAt" | "updatedAt">
  >(
    note
      ? {
          title: note.title,
          content: note.content,
          linkedTaskIds: note.linkedTaskIds || [],
          linkedEventIds: note.linkedEventIds || [],
          linkedDocumentIds: note.linkedDocumentIds || [],
          linkedScheduleTaskIds: note.linkedScheduleTaskIds || [],
          tags: note.tags || [],
        }
      : {
          title: "",
          content: "",
          linkedTaskIds: [],
          linkedEventIds: [],
          linkedDocumentIds: [],
          linkedScheduleTaskIds: [],
          tags: [],
        },
  );

  const [documents, setDocuments] = useState<Document[]>(availableDocuments);

  useEffect(() => {
    // If no documents were provided, get all documents
    if (availableDocuments.length === 0) {
      // Use a constant instead of calling a function that could cause re-renders
      const allDocs = getAllDocuments();
      setDocuments(allDocs);
    } else {
      setDocuments(availableDocuments);
    }
  }, [availableDocuments.length]); // Only depend on the length of availableDocuments

  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (noteData.title.trim() === "") return;

    // Add a tag for linked tasks if there are any
    let updatedTags = [...(noteData.tags || [])];
    if (
      noteData.linkedScheduleTaskIds &&
      noteData.linkedScheduleTaskIds.length > 0
    ) {
      if (!updatedTags.includes("tasks")) {
        updatedTags.push("tasks");
      }
    }

    // Save the note with updated tags
    onSave({
      ...noteData,
      tags: updatedTags,
    });

    setOpen(false);
    if (!note) {
      setNoteData({
        title: "",
        content: "",
        linkedTaskIds: [],
        linkedEventIds: [],
        linkedDocumentIds: [],
        linkedScheduleTaskIds: [],
        tags: [],
      });
    }
  };

  const toggleDocumentLink = (documentId: string) => {
    const currentLinkedDocs = [...(noteData.linkedDocumentIds || [])];
    const index = currentLinkedDocs.indexOf(documentId);

    if (index === -1) {
      // Add document ID to linked documents
      setNoteData({
        ...noteData,
        linkedDocumentIds: [...currentLinkedDocs, documentId],
      });
    } else {
      // Remove document ID from linked documents
      currentLinkedDocs.splice(index, 1);
      setNoteData({
        ...noteData,
        linkedDocumentIds: currentLinkedDocs,
      });
    }
  };

  const isDocumentLinked = (documentId: string) => {
    return noteData.linkedDocumentIds?.includes(documentId) || false;
  };

  const toggleTaskLink = (taskId: string) => {
    const currentLinkedTasks = [...(noteData.linkedScheduleTaskIds || [])];
    const index = currentLinkedTasks.indexOf(taskId);

    if (index === -1) {
      // Add task ID to linked tasks
      setNoteData({
        ...noteData,
        linkedScheduleTaskIds: [...currentLinkedTasks, taskId],
      });

      // Find the task to add its details to the note content if it's empty
      if (noteData.content.trim() === "") {
        const task = availableTasks.find((task) => task.id === taskId);
        if (task) {
          setNoteData((prev) => ({
            ...prev,
            content: `Task: ${task.title}\nDate: ${task.date.toLocaleDateString()}\nStatus: ${task.completed ? "Completed" : "Pending"}${task.category ? `\nCategory: ${task.category}` : ""}`,
            title: noteData.title || `Note for: ${task.title}`,
          }));
        }
      }
    } else {
      // Remove task ID from linked tasks
      currentLinkedTasks.splice(index, 1);
      setNoteData({
        ...noteData,
        linkedScheduleTaskIds: currentLinkedTasks,
      });
    }
  };

  const isTaskLinked = (taskId: string) => {
    return noteData.linkedScheduleTaskIds?.includes(taskId) || false;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            {note ? (
              <>
                <Edit className="h-4 w-4 mr-2" /> Edit Note
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" /> New Note
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={noteData.title}
              onChange={(e) =>
                setNoteData({ ...noteData, title: e.target.value })
              }
              placeholder="Note title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={noteData.content}
              onChange={(e) =>
                setNoteData({ ...noteData, content: e.target.value })
              }
              placeholder="Write your note here..."
              className="min-h-[200px]"
            />
          </div>

          {/* Linked Documents Section */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Linked Documents
            </Label>
            {documents.length === 0 ? (
              <div className="text-sm text-muted-foreground p-2 border rounded-md">
                No documents available to link
              </div>
            ) : (
              <ScrollArea className="h-[150px] border rounded-md p-2">
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`doc-${doc.id}`}
                        checked={isDocumentLinked(doc.id)}
                        onCheckedChange={() => toggleDocumentLink(doc.id)}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <Label
                          htmlFor={`doc-${doc.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {doc.name}
                        </Label>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {doc.type.split("/")[1] || doc.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Linked Tasks Section */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Linked Tasks
            </Label>
            {availableTasks.length === 0 ? (
              <div className="text-sm text-muted-foreground p-2 border rounded-md">
                No tasks available to link
              </div>
            ) : (
              <ScrollArea className="h-[150px] border rounded-md p-2">
                <div className="space-y-2">
                  {availableTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={isTaskLinked(task.id)}
                        onCheckedChange={() => toggleTaskLink(task.id)}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1">
                          <Label
                            htmlFor={`task-${task.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {task.title}
                          </Label>
                          <div className="text-xs text-muted-foreground">
                            {task.date.toLocaleDateString()}
                            {task.category && ` • ${task.category}`}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={task.completed ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {task.completed ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditor;
