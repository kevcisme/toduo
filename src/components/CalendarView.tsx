import React, { useState } from "react";
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
import {
  CalendarIcon,
  PlusIcon,
  RefreshCw,
  CalendarDays,
  Clock,
  Calendar as CalendarLucide,
} from "lucide-react";

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
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events = [
    {
      id: "1",
      title: "Team Meeting",
      description: "Weekly team sync",
      start: new Date(new Date().setHours(10, 0, 0, 0)),
      end: new Date(new Date().setHours(11, 0, 0, 0)),
      source: "google",
      color: "#4285F4",
      linkedNoteIds: ["2"],
    },
    {
      id: "2",
      title: "Lunch with Client",
      description: "Discuss project requirements",
      start: new Date(new Date().setHours(12, 30, 0, 0)),
      end: new Date(new Date().setHours(13, 30, 0, 0)),
      source: "outlook",
      color: "#0078D4",
      linkedNoteIds: [],
    },
    {
      id: "3",
      title: "Project Review",
      start: new Date(new Date().setHours(15, 0, 0, 0)),
      end: new Date(new Date().setHours(16, 0, 0, 0)),
      source: "local",
      color: "#6E56CF",
      linkedNoteIds: [],
    },
  ],
  onAddEvent = () => {},
  onConnectCalendar = () => {},
  onRefreshCalendar = () => {},
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
    source: "local" as const,
  });

  // Get hours for the current day
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter events for the selected date
  const filteredEvents = events.filter((event) => {
    if (!date) return false;

    const eventDate = new Date(event.start);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });

  const handleAddEvent = () => {
    onAddEvent(newEvent);
    setNewEventOpen(false);
    setNewEvent({
      title: "",
      description: "",
      start: new Date(),
      end: new Date(new Date().getTime() + 60 * 60 * 1000),
      source: "local",
    });
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
    if (!date || filteredEvents.length === 0) return [];

    // Sort events by start time
    const sortedEvents = [...filteredEvents].sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    );

    const freeBlocks = [];
    let lastEndTime = new Date(date);
    lastEndTime.setHours(9, 0, 0, 0); // Start day at 9 AM

    const endOfDay = new Date(date);
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
          <Dialog open={newEventOpen} onOpenChange={setNewEventOpen}>
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
                  onClick={() => setNewEventOpen(false)}
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
                selected={date}
                onSelect={setDate}
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
                {date?.toLocaleDateString(undefined, {
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
    </Card>
  );
};

export default CalendarView;
