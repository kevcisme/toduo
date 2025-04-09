import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Reminder {
  id: string;
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

interface RemindersListProps {
  reminders: Reminder[];
  onComplete?: (id: string) => void;
  className?: string;
}

const RemindersList = ({
  reminders,
  onComplete,
  className = "",
}: RemindersListProps) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "low":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle>Upcoming Reminders</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        {reminders.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No upcoming reminders
          </p>
        ) : (
          <ul className="space-y-3">
            {reminders.map((reminder) => (
              <li
                key={reminder.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => onComplete && onComplete(reminder.id)}
                  >
                    {reminder.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                    )}
                  </Button>
                  <div>
                    <p
                      className={`font-medium ${reminder.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {reminder.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="flex items-center text-xs text-muted-foreground">
                        {getPriorityIcon(reminder.priority)}
                        <span className="ml-1">{reminder.priority}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Due: {reminder.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RemindersList;
