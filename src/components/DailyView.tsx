import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sunrise,
  Sun,
  Sunset,
} from "lucide-react";
import { DailyEntry, DailyScheduleItem, DailyTask } from "@/types/app";

interface DailyViewProps {
  dailyEntry: DailyEntry | null;
  onDateChange?: (date: Date) => void;
  onBackToWeekly?: () => void;
  className?: string;
}

const DailyView: React.FC<DailyViewProps> = ({
  dailyEntry,
  onDateChange,
  onBackToWeekly,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<string>("schedule");

  if (!dailyEntry) {
    return (
      <Card className={`bg-white h-full flex flex-col ${className}`}>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Daily Schedule</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No daily schedule data available</p>
            <p className="text-sm mt-2">
              Select a day from the weekly view or upload a daily schedule
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { date, dateFormatted, bigThree, tasks, scheduleItems } = dailyEntry;

  const handlePrevDay = () => {
    if (onDateChange) {
      const prevDay = new Date(date);
      prevDay.setDate(prevDay.getDate() - 1);
      onDateChange(prevDay);
    }
  };

  const handleNextDay = () => {
    if (onDateChange) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      onDateChange(nextDay);
    }
  };

  const renderScheduleItems = (
    category: "morning" | "workday" | "evening" | "other",
  ) => {
    const filteredItems = scheduleItems.filter(
      (item) => item.category === category,
    );

    if (filteredItems.length === 0) {
      return (
        <div className="text-sm text-muted-foreground">No items scheduled</div>
      );
    }

    return (
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox id={item.id} checked={item.completed} />
            <Label
              htmlFor={item.id}
              className="text-sm font-normal cursor-pointer"
            >
              {item.title}
              {item.time && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({item.time})
                </span>
              )}
            </Label>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={`bg-white h-full flex flex-col ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBackToWeekly}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Weekly
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handlePrevDay}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="mx-2">{dateFormatted}</span>
            <Button variant="ghost" size="icon" onClick={handleNextDay}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <div className="px-6 py-2">
        <div className="bg-muted/20 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">Daily Big 3</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
              >
                1
              </Badge>
              <p>{bigThree.one || "Not set"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
              >
                2
              </Badge>
              <p>{bigThree.two || "Not set"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
              >
                3
              </Badge>
              <p>{bigThree.three || "Not set"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="schedule" className="flex-grow">
              Schedule
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex-grow">
              Tasks
            </TabsTrigger>
            {dailyEntry.journal && (
              <TabsTrigger value="journal" className="flex-grow">
                Journal
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>

      <CardContent className="flex-1 overflow-auto pt-0">
        <ScrollArea className="h-[calc(100%-2rem)]">
          <TabsContent value="schedule" className="mt-0">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Sunrise className="h-4 w-4 mr-2" />
                  Morning
                </h3>
                {renderScheduleItems("morning")}
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Sun className="h-4 w-4 mr-2" />
                  Workday
                </h3>
                {renderScheduleItems("workday")}
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Sunset className="h-4 w-4 mr-2" />
                  Evening
                </h3>
                {renderScheduleItems("evening")}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No tasks for today
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-2 p-2 border rounded-md"
                  >
                    <Checkbox id={task.id} checked={task.completed} />
                    <div className="flex-1">
                      <Label
                        htmlFor={task.id}
                        className="font-normal cursor-pointer"
                      >
                        {task.title}
                      </Label>
                      {task.category && (
                        <Badge variant="outline" className="text-xs ml-2">
                          {task.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {dailyEntry.journal && (
            <TabsContent value="journal" className="mt-0">
              <div className="space-y-4">
                {dailyEntry.journal.pastDay && (
                  <div>
                    <h3 className="font-semibold mb-1">
                      What happened in the past day?
                    </h3>
                    <p className="text-sm">{dailyEntry.journal.pastDay}</p>
                  </div>
                )}

                {dailyEntry.journal.achievements && (
                  <div>
                    <h3 className="font-semibold mb-1">
                      What did I achieve today?
                    </h3>
                    <p className="text-sm">{dailyEntry.journal.achievements}</p>
                  </div>
                )}

                {dailyEntry.journal.feelings && (
                  <div>
                    <h3 className="font-semibold mb-1">
                      How am I feeling right now?
                    </h3>
                    <p className="text-sm">{dailyEntry.journal.feelings}</p>
                  </div>
                )}

                {dailyEntry.journal.gratitude && (
                  <div>
                    <h3 className="font-semibold mb-1">
                      What am I grateful for today?
                    </h3>
                    <p className="text-sm">{dailyEntry.journal.gratitude}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {tasks.filter((t) => t.completed).length}/{tasks.length} tasks
          completed
        </div>
        <Button variant="outline" size="sm" className="ml-auto">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Complete Day
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DailyView;
