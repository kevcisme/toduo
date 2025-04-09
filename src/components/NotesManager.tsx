import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Link,
  Tag,
  Calendar,
} from "lucide-react";
import NoteEditor, { Note } from "./NoteEditor";
import DocumentUpload, { Document } from "./DocumentUpload";
import { DailyTask } from "@/types/app";
import WeeklyView from "./WeeklyView";
import DailyView from "./DailyView";
import { DailyEntry, ScheduleData } from "@/types/app";
import {
  uploadDocument,
  associateDocumentWithNote,
  getDocumentsByNoteId,
} from "@/services/documentService";

interface NotesManagerProps {
  className?: string;
}

const NotesManager: React.FC<NotesManagerProps> = ({ className = "" }) => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Project Ideas",
      content:
        "- Create a personal dashboard\n- Build a recipe app\n- Learn GraphQL",
      createdAt: new Date(2023, 5, 10),
      updatedAt: new Date(2023, 5, 15),
      tags: ["projects", "ideas"],
    },
    {
      id: "2",
      title: "Meeting Notes: Team Sync",
      content: "Discussed project timeline and assigned tasks to team members.",
      createdAt: new Date(2023, 5, 12),
      updatedAt: new Date(2023, 5, 12),
      linkedTaskIds: ["1"],
      linkedEventIds: ["1"],
      tags: ["meeting", "team"],
    },
    {
      id: "3",
      title: "Learning Resources",
      content:
        "- React Advanced Patterns\n- TypeScript Best Practices\n- CSS Grid Layouts",
      createdAt: new Date(2023, 5, 8),
      updatedAt: new Date(2023, 5, 14),
      tags: ["learning", "resources"],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewNoteOpen, setViewNoteOpen] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Schedule view state
  const [showScheduleView, setShowScheduleView] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [selectedDailyEntry, setSelectedDailyEntry] =
    useState<DailyEntry | null>(null);
  const [viewMode, setViewMode] = useState<"weekly" | "daily">("weekly");

  // Get all tasks from schedule data
  const getAllScheduleTasks = (): DailyTask[] => {
    if (!scheduleData) return [];

    const tasks: DailyTask[] = [];

    // Add tasks from daily entries
    Object.values(scheduleData.dailyEntries).forEach((entry) => {
      tasks.push(...entry.tasks);
    });

    // Add unfinished tasks from weekly data
    if (scheduleData.weekly?.unfinishedTasks) {
      tasks.push(...scheduleData.weekly.unfinishedTasks);
    }

    return tasks;
  };

  const handleAddNote = (
    noteData: Omit<Note, "id" | "createdAt" | "updatedAt">,
  ) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes([...notes, newNote]);
  };

  const handleUpdateNote = (
    noteData: Omit<Note, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (!selectedNote) return;

    setNotes(
      notes.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              ...noteData,
              updatedAt: new Date(),
            }
          : note,
      ),
    );

    setSelectedNote(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setViewNoteOpen(false);
    }
  };

  const filteredNotes = notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((note) => {
      if (activeTab === "all") return true;
      if (
        activeTab === "linked" &&
        (note.linkedTaskIds?.length || note.linkedEventIds?.length)
      )
        return true;
      if (
        activeTab === "unlinked" &&
        !note.linkedTaskIds?.length &&
        !note.linkedEventIds?.length
      )
        return true;
      return note.tags?.includes(activeTab);
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])));

  const handleDocumentUpload = async (document: Document) => {
    setDocuments((prev) => [...prev, document]);

    // If a note is selected, associate the document with it
    if (selectedNote) {
      associateDocumentWithNote(document.id, selectedNote.id);
    }

    // If the document has schedule data, update the schedule state
    if (document.scheduleData) {
      setScheduleData(document.scheduleData);
      // If we have daily entries, show the schedule view
      if (Object.keys(document.scheduleData.dailyEntries).length > 0) {
        setShowScheduleView(true);
      }
    }
  };

  const handleDocumentSelect = (documentId: string) => {
    // For now, just log the selection. We'll implement document viewing later
    console.log(`Selected document: ${documentId}`);

    // Find the document
    const selectedDoc = documents.find((doc) => doc.id === documentId);
    if (selectedDoc?.scheduleData) {
      setScheduleData(selectedDoc.scheduleData);
      setShowScheduleView(true);
    }
  };

  const toggleDocumentUpload = () => {
    setShowDocumentUpload(!showDocumentUpload);
  };

  const toggleScheduleView = () => {
    setShowScheduleView(!showScheduleView);
    // Reset to weekly view when toggling
    setViewMode("weekly");
    setSelectedDailyEntry(null);
  };

  const handleDaySelect = (date: Date) => {
    if (scheduleData) {
      const dateStr = date.toLocaleDateString();
      const entry = scheduleData.dailyEntries[dateStr];
      if (entry) {
        setSelectedDailyEntry(entry);
        setViewMode("daily");
      }
    }
  };

  const handleBackToWeekly = () => {
    setViewMode("weekly");
    setSelectedDailyEntry(null);
  };

  const handleDateChange = (date: Date) => {
    if (scheduleData) {
      const dateStr = date.toLocaleDateString();
      const entry = scheduleData.dailyEntries[dateStr];
      if (entry) {
        setSelectedDailyEntry(entry);
      } else {
        // If we don't have data for this date, create a basic entry
        const newEntry: DailyEntry = {
          date,
          dateFormatted: dateStr,
          bigThree: { date },
          tasks: [],
          scheduleItems: [],
        };
        setSelectedDailyEntry(newEntry);
      }
    }
  };

  return (
    <Card className={`bg-white h-full flex flex-col ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          <span>Notes</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleDocumentUpload}>
              {showDocumentUpload ? "Hide Documents" : "Show Documents"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleScheduleView}
              className={showScheduleView ? "bg-primary/10" : ""}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {showScheduleView ? "Hide Schedule" : "Show Schedule"}
            </Button>
            <NoteEditor
              onSave={handleAddNote}
              availableTasks={getAllScheduleTasks()}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <div className="px-6 py-2 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {showDocumentUpload && (
        <div className="px-6 pb-4">
          <DocumentUpload
            onDocumentUpload={handleDocumentUpload}
            onDocumentSelect={handleDocumentSelect}
            documents={documents}
            className="border rounded-lg"
          />
        </div>
      )}

      {showScheduleView && (
        <div className="px-6 pb-4">
          {viewMode === "weekly" ? (
            <WeeklyView
              weeklyData={scheduleData?.weekly}
              onDaySelect={handleDaySelect}
              className="border rounded-lg"
            />
          ) : (
            <DailyView
              dailyEntry={selectedDailyEntry}
              onDateChange={handleDateChange}
              onBackToWeekly={handleBackToWeekly}
              className="border rounded-lg"
            />
          )}
        </div>
      )}
      <div className="px-6 pb-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full h-auto flex flex-wrap">
            <TabsTrigger value="all" className="flex-grow">
              All Notes
            </TabsTrigger>
            <TabsTrigger value="linked" className="flex-grow">
              Linked
            </TabsTrigger>
            <TabsTrigger value="unlinked" className="flex-grow">
              Unlinked
            </TabsTrigger>
            {allTags.map((tag) => (
              <TabsTrigger key={tag} value={tag} className="flex-grow">
                {tag}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <CardContent className="flex-1 overflow-auto pt-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 mt-2">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No notes found. Create a new note to get started.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 border rounded-lg hover:bg-accent/10 cursor-pointer"
                  onClick={() => {
                    setSelectedNote(note);
                    setViewNoteOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{note.title}</h3>
                    <div className="flex items-center gap-1">
                      <NoteEditor
                        note={note}
                        onSave={handleUpdateNote}
                        availableTasks={getAllScheduleTasks()}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNote(note);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {note.content}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {(note.linkedTaskIds?.length ||
                      note.linkedEventIds?.length) && (
                      <Badge variant="secondary" className="text-xs">
                        <Link className="h-3 w-3 mr-1" />
                        {(note.linkedTaskIds?.length || 0) +
                          (note.linkedEventIds?.length || 0)}{" "}
                        links
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Updated {note.updatedAt.toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {notes.length} notes total
        </div>
      </CardFooter>

      {/* View Note Dialog */}
      <Dialog open={viewNoteOpen} onOpenChange={setViewNoteOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedNote && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedNote.title}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="whitespace-pre-wrap">
                  {selectedNote.content}
                </div>
                {selectedNote.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {selectedNote.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <div className="text-sm text-muted-foreground mr-auto">
                  Created: {selectedNote.createdAt.toLocaleDateString()}
                  {selectedNote.createdAt.getTime() !==
                    selectedNote.updatedAt.getTime() && (
                    <>
                      {" "}
                      · Updated: {selectedNote.updatedAt.toLocaleDateString()}
                    </>
                  )}
                </div>
                <NoteEditor
                  note={selectedNote}
                  onSave={handleUpdateNote}
                  availableTasks={getAllScheduleTasks()}
                  trigger={<Button>Edit</Button>}
                />
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default NotesManager;
