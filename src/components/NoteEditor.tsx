import React, { useState } from "react";
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
import { PlusCircle, Edit, Trash2 } from "lucide-react";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  linkedTaskIds?: string[];
  linkedEventIds?: string[];
  tags?: string[];
}

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  trigger?: React.ReactNode;
  title?: string;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  trigger,
  title = note ? "Edit Note" : "Create Note",
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
          tags: note.tags || [],
        }
      : {
          title: "",
          content: "",
          linkedTaskIds: [],
          linkedEventIds: [],
          tags: [],
        },
  );

  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (noteData.title.trim() === "") return;
    onSave(noteData);
    setOpen(false);
    if (!note) {
      setNoteData({
        title: "",
        content: "",
        linkedTaskIds: [],
        linkedEventIds: [],
        tags: [],
      });
    }
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
