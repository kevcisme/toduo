import React, { useState, useEffect } from "react";
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
import { useDatabase } from "../contexts/DatabaseContext";
import { Note as DBNote, Tag as DBTag } from "../db/models";

interface NotesManagerProps {
  className?: string;
}
const NotesManager: React.FC<NotesManagerProps> = ({ className = "" }) => {
  const { noteApi, tagService } = useDatabase();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [isLinkNoteOpen, setIsLinkNoteOpen] = useState(false);
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [isScheduleViewOpen, setIsScheduleViewOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState<Omit<Note, "id" | "createdAt" | "updatedAt">>({
    title: "",
    content: "",
    tags: [],
  });
  const [dbNotes, setDbNotes] = useState<DBNote[]>([]);
  const [dbTags, setDbTags] = useState<DBTag[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    dailyEntries: {},
    weekly: null
  });
  const [viewNoteOpen, setViewNoteOpen] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  // Schedule view state
  const [showScheduleView, setShowScheduleView] = useState(false);
  const [selectedDailyEntry, setSelectedDailyEntry] =
    useState<DailyEntry | null>(null);
  const [viewMode, setViewMode] = useState<"weekly" | "daily">("weekly");

  // New state for tabbed pane
  const [openNotes, setOpenNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // State for inline new note creation
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Function to load notes from server and update state
  const loadNotesFromApi = async () => {
    try {
      const loadedNotes = await noteApi.getAll();
      const uiNotes = loadedNotes.map(dbNote => ({
        id: dbNote.id.toString(),
        title: dbNote.title,
        content: dbNote.content || "",
        createdAt: new Date(dbNote.created_at),
        updatedAt: new Date(dbNote.updated_at),
        tags: [],
        linkedTaskIds: [],
        linkedEventIds: [],
        filePath: (dbNote as any).filePath,
      }));
      // Only update notes here; leave filteredNotes to be set in the filter effect
      setNotes(uiNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  // Restore initial load effect to only run once (APIs):
  useEffect(() => {
    loadNotesFromApi();
    const loadTags = async () => {
      try {
        const loadedTags = await tagService.getAllTags();
        setDbTags(loadedTags);
      } catch (error) {
        console.error("Error loading tags:", error);
      }
    };
    loadTags();
  }, [noteApi, tagService]);

  // Filter notes based on search query and active tab
  useEffect(() => {
    const filtered = notes
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
    
    setFilteredNotes(filtered);
  }, [notes, searchQuery, activeTab]);

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])));

  // --- Tabbed Pane Logic ---
  const handleOpenNote = (note: Note) => {
    setOpenNotes((prev) => {
      if (prev.find((n) => n.id === note.id)) return prev;
      return [...prev, note];
    });
    setActiveNoteId(note.id);
  };

  const handleCloseTab = (noteId: string) => {
    setOpenNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (activeNoteId === noteId) {
      const idx = openNotes.findIndex((n) => n.id === noteId);
      const next = openNotes[idx + 1] || openNotes[idx - 1] || null;
      setActiveNoteId(next?.id || null);
    }
  };

  const handleTabClick = (noteId: string) => {
    setActiveNoteId(noteId);
  };

  // --- Note CRUD ---
  const handleAddNote = async (
    noteData: Omit<Note, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const saveRes = await fetch('/api/vault/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: noteData.title, content: noteData.content }),
      });
      const { filePath } = await saveRes.json();
      const result = await noteApi.create(noteData.title, noteData.content);
      const dbNote = await noteApi.getNoteById(result.lastInsertRowid as number);
      if (dbNote) {
        const uiNote: Note = {
          id: dbNote.id.toString(),
          title: dbNote.title,
          content: dbNote.content || "",
          createdAt: new Date(dbNote.created_at),
          updatedAt: new Date(dbNote.updated_at),
          filePath,
          tags: noteData.tags || [],
          linkedTaskIds: [],
          linkedEventIds: [],
        };
        setNotes((prev) => [uiNote, ...prev]);
        setIsCreatingNew(false);
        handleOpenNote(uiNote);
      }
      setNewNote({ title: "", content: "", tags: [] });
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleUpdateNote = async (
    noteData: Omit<Note, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!activeNoteId) return;
    const selectedNote = openNotes.find((n) => n.id === activeNoteId);
    if (!selectedNote) return;
    try {
      // Update markdown file via server API
      const updateRes = await fetch('/api/vault/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: selectedNote.filePath, title: noteData.title, content: noteData.content }),
      });
      const { filePath } = await updateRes.json();
      // Update note in database
      await noteApi.updateNote(parseInt(selectedNote.id), {
        title: noteData.title,
        content: noteData.content,
      });
      const updatedNote: Note = {
        ...selectedNote,
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags || [],
        filePath,
      };
      setNotes((prev) =>
        prev.map((note) => (note.id === selectedNote.id ? updatedNote : note))
      );
      setOpenNotes((prev) =>
        prev.map((note) => (note.id === selectedNote.id ? updatedNote : note))
      );
      // Refresh to ensure sidebar sync
      await loadNotesFromApi();
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await noteApi.deleteNote(parseInt(id));
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setOpenNotes((prev) => prev.filter((note) => note.id !== id));
      if (activeNoteId === id) {
        const idx = openNotes.findIndex((n) => n.id === id);
        const next = openNotes[idx + 1] || openNotes[idx - 1] || null;
        setActiveNoteId(next?.id || null);
      }
      // Refresh sidebar after deletion
      await loadNotesFromApi();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

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
    <div className={`flex h-full ${className}`}> {/* Main flex container */}
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col bg-white h-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold">Notes</span>
            <Button size="sm" variant="outline" onClick={() => setIsCreatingNew(true)}>
              <PlusCircle className="h-4 w-4 mr-2" /> New Note
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="p-2 border-b">
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
        <div className="flex-1 overflow-auto p-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notes found. Create a new note to get started.
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-3 border rounded-lg hover:bg-accent/10 cursor-pointer mb-2"
                onClick={() => handleOpenNote(note)}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium">{note.title}</h3>
                  <div className="flex items-center gap-1">
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
                  {(note.linkedTaskIds?.length || note.linkedEventIds?.length) && (
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
        <div className="border-t p-2 text-sm text-muted-foreground">
          {notes.length} notes total
        </div>
      </div>
      {/* Tabbed Pane */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {/* Tab Bar */}
        <div className="flex border-b bg-muted min-h-[40px]">
          {isCreatingNew && (
            <div
              className={`px-4 py-2 cursor-pointer flex items-center border-r ${
                activeNoteId === null
                  ? "bg-white border-t border-l border-r rounded-t font-bold"
                  : "hover:bg-accent/10"
              }`}
              onClick={() => setIsCreatingNew(true)}
            >
              <span className="mr-2">New Note</span>
              <button
                className="ml-1 text-xs text-muted-foreground hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreatingNew(false);
                }}
                title="Close"
              >
                ×
              </button>
            </div>
          )}
          {openNotes.map((note) => (
            <div
              key={note.id}
              className={`px-4 py-2 cursor-pointer flex items-center border-r ${
                note.id === activeNoteId
                  ? "bg-white border-t border-l border-r rounded-t font-bold"
                  : "hover:bg-accent/10"
              }`}
              onClick={() => handleTabClick(note.id)}
            >
              <span className="mr-2 line-clamp-1 max-w-[120px]">{note.title}</span>
              <button
                className="ml-1 text-xs text-muted-foreground hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTab(note.id);
                }}
                title="Close tab"
              >
                ×
              </button>
            </div>
          ))}
          {openNotes.length === 0 && !isCreatingNew && (
            <div className="p-2 text-muted-foreground">No notes open</div>
          )}
        </div>
        {/* Active Note Editor */}
        <div className="flex-1 overflow-auto p-4">
          {isCreatingNew ? (
            <NoteEditor
              inline
              onSave={handleAddNote}
              onCancel={() => setIsCreatingNew(false)}
              availableTasks={[]}
            />
          ) : activeNoteId ? (
            <NoteEditor
              inline
              note={openNotes.find((n) => n.id === activeNoteId)}
              onSave={handleUpdateNote}
              onCancel={() => handleCloseTab(activeNoteId)}
              availableTasks={[]}
            />
          ) : (
            <div className="text-center text-muted-foreground mt-16">
              Select a note from the sidebar to view or edit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesManager;
