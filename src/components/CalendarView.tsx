import React, { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarIcon,
  PlusIcon,
  RefreshCw,
  CalendarDays,
  Clock,
  Calendar as CalendarLucide,
  FileText,
  Link as LinkIcon,
  Plus,
  Search,
} from "lucide-react";
import NoteEditor, { Note } from "./NoteEditor";
import { useDatabase } from "../contexts/DatabaseContext";
import { CalendarEvent as DBCalendarEvent, Tag as DBTag } from "../db/models";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  source: "google" | "outlook" | "local";
  color?: string;
  linkedNoteIds?: string[];
}

interface CalendarViewProps {
  events?: CalendarEvent[];
  onAddEvent?: (event: Omit<CalendarEvent, "id">) => void;
  onConnectCalendar?: (provider: "google" | "outlook") => void;
  onRefreshCalendar?: () => void;
  notes?: Note[];
  onCreateNote?: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
}

// Move this outside the component
const calendarService = {
  getAllEvents: () => [],
  createEvent: (title: string, description: string, start: string, end: string, allDay: boolean) => ({ lastInsertRowid: Date.now() }),
  getEventById: (id: number) => null
};

const CalendarView: React.FC<CalendarViewProps> = ({
  events = [],
  onAddEvent = () => {},
  onConnectCalendar = () => {},
  onRefreshCalendar = () => {},
  notes = [],
  onCreateNote = () => {},
}) => {
  const { tagService } = useDatabase();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isLinkNoteOpen, setIsLinkNoteOpen] = useState(false);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, "id">>({
    title: "",
    description: "",
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
    source: "local",
    color: "#6E56CF",
    linkedNoteIds: [],
  });
  const [dbEvents, setDbEvents] = useState<DBCalendarEvent[]>([]);
  const [dbTags, setDbTags] = useState<DBTag[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Combine both loading functions into a single useEffect
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load events
        const loadedEvents = calendarService.getAllEvents();
        const uiEvents = loadedEvents.map(dbEvent => ({
          id: dbEvent.id.toString(),
          title: dbEvent.title,
          description: dbEvent.description || "",
          start: new Date(dbEvent.start_time),
          end: new Date(dbEvent.end_time),
          source: "local" as const,
          color: "#6E56CF",
          linkedNoteIds: [],
        }));
        setDbEvents(loadedEvents);

        // Load tags
        const loadedTags = await tagService.getAllTags();
        setDbTags(loadedTags);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [tagService]); // Only depend on tagService since it comes from context

  const handleAddEvent = () => {
    if (newEvent.title.trim() === "") return;
    
    try {
      // Add event to database
      const result = calendarService.createEvent(
        newEvent.title,
        newEvent.description,
        newEvent.start.toISOString(),
        newEvent.end.toISOString(),
        false // Not all day by default
      );
      
      // Create UI event from DB event
      const dbEvent = calendarService.getEventById(result.lastInsertRowid as number);
      if (dbEvent) {
        const uiEvent: CalendarEvent = {
          id: dbEvent.id.toString(),
          title: dbEvent.title,
          description: dbEvent.description || "",
          start: new Date(dbEvent.start_time),
          end: new Date(dbEvent.end_time),
          source: "local" as const,
          color: "#6E56CF",
          linkedNoteIds: [],
        };
        
        setDbEvents([...dbEvents, dbEvent]);
      }
      
      setNewEvent({
        title: "",
        description: "",
        start: new Date(),
        end: new Date(new Date().getTime() + 60 * 60 * 1000),
        source: "local",
        color: "#6E56CF",
        linkedNoteIds: [],
      });
      setIsAddEventOpen(false);
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [showLinkNotesDialog, setShowLinkNotesDialog] = useState(false);
  const [selectedEventForNotes, setSelectedEventForNotes] =
    useState<CalendarEvent | null>(null);
  const [searchNotesQuery, setSearchNotesQuery] = useState("");

  // Get hours for the current day
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter events for the selected date
  const filteredEvents = events.filter((event) => {
    if (!selectedDate) return false;

    const eventDate = new Date(event.start);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const handleLinkNote = (eventId: string, noteId: string) => {
    // This would typically update the state and/or call an API
    const updatedEvents = events.map((event) => {
      if (event.id === eventId) {
        const linkedNoteIds = event.linkedNoteIds || [];
        if (!linkedNoteIds.includes(noteId)) {
          return {
            ...event,
            linkedNoteIds: [...linkedNoteIds, noteId],
          };
        }
      }
      return event;
    });
    // In a real app, you would update the state or call an API here
    console.log("Updated events:", updatedEvents);
  };

  const handleUnlinkNote = (eventId: string, noteId: string) => {
    // This would typically update the state and/or call an API
    const updatedEvents = events.map((event) => {
      if (event.id === eventId && event.linkedNoteIds) {
        return {
          ...event,
          linkedNoteIds: event.linkedNoteIds.filter((id) => id !== noteId),
        };
      }
      return event;
    });
    // In a real app, you would update the state or call an API here
    console.log("Updated events:", updatedEvents);
  };

  const handleCreateNoteForEvent = (
    noteData: Omit<Note, "id" | "createdAt" | "updatedAt">,
  ) => {
    // Call the parent component's onCreateNote function
    if (selectedEventForNotes) {
      // Add the event ID to the linkedEventIds array
      const updatedNoteData = {
        ...noteData,
        linkedEventIds: [
          ...(noteData.linkedEventIds || []),
          selectedEventForNotes.id,
        ],
      };
      onCreateNote(updatedNoteData);
    }

    // Close the dialog
    setShowLinkNotesDialog(false);
    setSelectedEventForNotes(null);
  };

  const getSourceBadge = (source: "google" | "outlook" | "local") => {
    switch (source) {
      case "google":
        return <Badge className="bg-[#4285F4]">Google</Badge>;
      case "outlook":
        return <Badge className="bg-[#0078D4]">Outlook</Badge>;
      case "local":
        return <Badge variant="outline">Local</Badge>;
    }
  };

  // Find free time blocks
  const getFreeTimeBlocks = () => {
    if (!selectedDate || filteredEvents.length === 0) return [];

    // Sort events by start time
    const sortedEvents = [...filteredEvents].sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    );

    const freeBlocks = [];
    let lastEndTime = new Date(selectedDate);
    lastEndTime.setHours(9, 0, 0, 0); // Start day at 9 AM

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(17, 0, 0, 0); // End day at 5 PM

    for (const event of sortedEvents) {
      if (event.start.getTime() > lastEndTime.getTime()) {
        freeBlocks.push({
          start: new Date(lastEndTime),
          end: new Date(event.start),
        });
      }
      lastEndTime = new Date(
        Math.max(lastEndTime.getTime(), event.end.getTime()),
      );
    }

    if (lastEndTime.getTime() < endOfDay.getTime()) {
      freeBlocks.push({
        start: new Date(lastEndTime),
        end: new Date(endOfDay),
      });
    }

    return freeBlocks;
  };

  const freeTimeBlocks = getFreeTimeBlocks();

  return (
    <Card className="w-full h-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>
            Manage your schedule and view free time blocks
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onRefreshCalendar}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Create a new event in your calendar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="title">Title</label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description">Description</label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="start">Start Time</label>
                    <Input
                      id="start"
                      type="datetime-local"
                      value={newEvent.start.toISOString().slice(0, 16)}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          start: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="end">End Time</label>
                    <Input
                      id="end"
                      type="datetime-local"
                      value={newEvent.end.toISOString().slice(0, 16)}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          end: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddEventOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>Save Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="mb-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Connected Calendars
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-md border">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#4285F4] flex items-center justify-center text-white mr-2">
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                      <span>Google Calendar</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onConnectCalendar("google")}
                    >
                      Connect
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md border">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#0078D4] flex items-center justify-center text-white mr-2">
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                      <span>Outlook Calendar</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onConnectCalendar("outlook")}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Free Time Blocks</h3>
                <div className="space-y-2">
                  {freeTimeBlocks.length > 0 ? (
                    freeTimeBlocks.map((block, index) => (
                      <div
                        key={index}
                        className="p-2 rounded-md border border-dashed border-green-500 bg-green-50"
                      >
                        <div className="flex items-center text-green-700">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>
                            {block.start.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -
                            {block.end.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          {Math.round(
                            (block.end.getTime() - block.start.getTime()) /
                              (1000 * 60),
                          )}{" "}
                          minutes available
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No free time blocks available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <Tabs
                defaultValue="day"
                className="w-[300px]"
                onValueChange={(value) => setView(value as any)}
              >
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="text-sm font-medium">
                {selectedDate?.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            {view === "day" && (
              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-[60px_1fr] h-[600px] overflow-y-auto">
                  <div className="border-r">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="h-20 flex items-center justify-center text-sm text-gray-500 border-b"
                      >
                        {hour === 0
                          ? "12 AM"
                          : hour < 12
                            ? `${hour} AM`
                            : hour === 12
                              ? "12 PM"
                              : `${hour - 12} PM`}
                      </div>
                    ))}
                  </div>
                  <div className="relative">
                    {hours.map((hour) => (
                      <div key={hour} className="h-20 border-b"></div>
                    ))}

                    {filteredEvents.map((event) => {
                      const startHour =
                        event.start.getHours() + event.start.getMinutes() / 60;
                      const endHour =
                        event.end.getHours() + event.end.getMinutes() / 60;
                      const duration = endHour - startHour;

                      return (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 rounded-md p-2 overflow-hidden"
                          style={{
                            top: `${startHour * 80}px`,
                            height: `${duration * 80}px`,
                            backgroundColor: event.color || "#6E56CF",
                          }}
                        >
                          <div className="text-white font-medium truncate">
                            {event.title}
                          </div>
                          <div className="text-white text-xs opacity-90 truncate">
                            {event.start.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -
                            {event.end.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="absolute top-1 right-1">
                            {getSourceBadge(event.source)}
                          </div>
                          <div className="absolute bottom-1 right-1">
                            {event.linkedNoteIds &&
                              event.linkedNoteIds.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-white/20 text-white text-xs"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  {event.linkedNoteIds.length}
                                </Badge>
                              )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute bottom-1 left-1 h-6 px-2 text-xs bg-white/20 text-white hover:bg-white/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEventForNotes(event);
                              setShowLinkNotesDialog(true);
                            }}
                          >
                            <LinkIcon className="h-3 w-3 mr-1" />
                            {event.linkedNoteIds &&
                            event.linkedNoteIds.length > 0
                              ? "Notes"
                              : "Link"}
                          </Button>
                        </div>
                      );
                    })}

                    {freeTimeBlocks.map((block, index) => {
                      const startHour =
                        block.start.getHours() + block.start.getMinutes() / 60;
                      const endHour =
                        block.end.getHours() + block.end.getMinutes() / 60;
                      const duration = endHour - startHour;

                      return (
                        <div
                          key={`free-${index}`}
                          className="absolute left-1 right-1 rounded-md border border-dashed border-green-500 bg-green-50 p-2"
                          style={{
                            top: `${startHour * 80}px`,
                            height: `${duration * 80}px`,
                            zIndex: -1,
                          }}
                        >
                          <div className="text-green-700 text-xs">
                            Free: {Math.round(duration * 60)} min
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {view === "week" && (
              <div className="border rounded-md p-4 h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <CalendarDays className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Week view will be implemented here</p>
                </div>
              </div>
            )}

            {view === "month" && (
              <div className="border rounded-md p-4 h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <CalendarLucide className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Month view will be implemented here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#4285F4] mr-1"></div>
            <span>Google Calendar</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#0078D4] mr-1"></div>
            <span>Outlook Calendar</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#6E56CF] mr-1"></div>
            <span>Local Events</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-50 border border-dashed border-green-500 mr-1"></div>
            <span>Free Time</span>
          </div>
        </div>
      </CardFooter>

      {/* Link Notes Dialog */}
      <Dialog open={showLinkNotesDialog} onOpenChange={setShowLinkNotesDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Link Notes to Event</DialogTitle>
            <DialogDescription>
              {selectedEventForNotes && (
                <span>Event: {selectedEventForNotes.title}</span>
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
                      event.
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
                              {selectedEventForNotes &&
                              selectedEventForNotes.linkedNoteIds?.includes(
                                note.id,
                              ) ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (selectedEventForNotes) {
                                      handleUnlinkNote(
                                        selectedEventForNotes.id,
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
                                    if (selectedEventForNotes) {
                                      handleLinkNote(
                                        selectedEventForNotes.id,
                                        note.id,
                                      );
                                    }
                                  }}
                                >
                                  <LinkIcon className="h-4 w-4 mr-1" />
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
                  if (selectedEventForNotes) {
                    // Add the event ID to the linkedEventIds array
                    const updatedNoteData = {
                      ...noteData,
                      linkedEventIds: [
                        ...(noteData.linkedEventIds || []),
                        selectedEventForNotes.id,
                      ],
                    };
                    handleCreateNoteForEvent(updatedNoteData);
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

export default CalendarView;
