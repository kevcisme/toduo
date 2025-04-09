import React from "react";
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
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { WeeklyData, DailyEntry } from "@/types/app";

interface WeeklyViewProps {
  weeklyData: WeeklyData | null;
  onDaySelect?: (date: Date) => void;
  className?: string;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({
  weeklyData,
  onDaySelect,
  className = "",
}) => {
  if (!weeklyData) {
    return (
      <Card className={`bg-white h-full flex flex-col ${className}`}>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No weekly schedule data available</p>
            <p className="text-sm mt-2">
              Upload a weekly schedule document to view your week
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { weekStartDate, weekNumber, weeklyBigThree, dailyEntries } =
    weeklyData;

  return (
    <Card className={`bg-white h-full flex flex-col ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            <span>
              Week {weekNumber || ""} ({weekStartDate.toLocaleDateString()} -{" "}
              {new Date(
                weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000,
              ).toLocaleDateString()}
              )
            </span>
          </div>
          <Badge variant="outline" className="ml-2">
            {dailyEntries.length} days
          </Badge>
        </CardTitle>
      </CardHeader>

      <div className="px-6 py-2">
        <div className="bg-muted/20 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">Weekly Big 3</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
              >
                1
              </Badge>
              <p>{weeklyBigThree.one || "Not set"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
              >
                2
              </Badge>
              <p>{weeklyBigThree.two || "Not set"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
              >
                3
              </Badge>
              <p>{weeklyBigThree.three || "Not set"}</p>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="flex-1 overflow-auto pt-0">
        <h3 className="font-semibold mb-2">Daily Look</h3>
        <ScrollArea className="h-[calc(100%-2rem)]">
          <div className="space-y-2">
            {dailyEntries.map((entry: DailyEntry) => (
              <div
                key={entry.dateFormatted}
                className="p-3 border rounded-lg hover:bg-accent/10 cursor-pointer"
                onClick={() => onDaySelect && onDaySelect(entry.date)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{entry.dateFormatted}</div>
                  <Badge variant="outline">{entry.tasks.length} tasks</Badge>
                </div>

                {entry.bigThree && (
                  <div className="mt-2 text-sm">
                    <div className="flex items-start gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs shrink-0 mt-0.5"
                      >
                        1
                      </Badge>
                      <span className="line-clamp-1">
                        {entry.bigThree.one || "Not set"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs shrink-0 mt-0.5"
                      >
                        2
                      </Badge>
                      <span className="line-clamp-1">
                        {entry.bigThree.two || "Not set"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs shrink-0 mt-0.5"
                      >
                        3
                      </Badge>
                      <span className="line-clamp-1">
                        {entry.bigThree.three || "Not set"}
                      </span>
                    </div>
                  </div>
                )}

                {entry.tasks.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Tasks:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {entry.tasks.slice(0, 3).map((task) => (
                        <Badge
                          key={task.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {task.title}
                        </Badge>
                      ))}
                      {entry.tasks.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{entry.tasks.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {weeklyData.unfinishedTasks.length} unfinished tasks
        </div>
        <Button variant="outline" size="sm" className="ml-auto">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Weekly Review
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WeeklyView;
