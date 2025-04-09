import { useState, useEffect } from "react";
import { Reminder } from "@/components/dashboard/RemindersList";

interface Metrics {
  tasksCompleted: number;
  tasksCompletionRate: number;
  upcomingDeadlines: number;
  streak: number;
}

interface Quote {
  text: string;
  author: string;
}

interface DashboardData {
  metrics: Metrics;
  reminders: Reminder[];
  quote: Quote;
  isLoading: boolean;
  error: Error | null;
  updateMetrics: (newMetrics: Partial<Metrics>) => void;
  completeReminder: (id: string) => void;
  refreshData: () => void;
}

// This would be replaced with actual API calls in a real application
const fetchDashboardData = async (): Promise<{
  metrics: Metrics;
  reminders: Reminder[];
  quote: Quote;
}> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock data
  return {
    metrics: {
      tasksCompleted: 12,
      tasksCompletionRate: 75,
      upcomingDeadlines: 3,
      streak: 5,
    },
    reminders: [
      {
        id: "1",
        title: "Complete project proposal",
        dueDate: "Today, 5:00 PM",
        priority: "high",
        completed: false,
      },
      {
        id: "2",
        title: "Schedule team meeting",
        dueDate: "Tomorrow, 10:00 AM",
        priority: "medium",
        completed: false,
      },
      {
        id: "3",
        title: "Review quarterly goals",
        dueDate: "Friday, 3:00 PM",
        priority: "low",
        completed: false,
      },
    ],
    quote: {
      text: "The secret of getting ahead is getting started.",
      author: "Mark Twain",
    },
  };
};

export const useDashboardData = (): DashboardData => {
  const [metrics, setMetrics] = useState<Metrics>({
    tasksCompleted: 0,
    tasksCompletionRate: 0,
    upcomingDeadlines: 0,
    streak: 0,
  });
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [quote, setQuote] = useState<Quote>({ text: "", author: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardData();
      setMetrics(data.metrics);
      setReminders(data.reminders);
      setQuote(data.quote);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateMetrics = (newMetrics: Partial<Metrics>) => {
    setMetrics((prev) => ({ ...prev, ...newMetrics }));
  };

  const completeReminder = (id: string) => {
    setReminders((prevReminders) =>
      prevReminders.map((reminder) =>
        reminder.id === id
          ? { ...reminder, completed: !reminder.completed }
          : reminder,
      ),
    );

    // Update metrics when a task is completed
    const reminder = reminders.find((r) => r.id === id);
    if (reminder && !reminder.completed) {
      updateMetrics({
        tasksCompleted: metrics.tasksCompleted + 1,
        tasksCompletionRate: Math.min(100, metrics.tasksCompletionRate + 2),
      });
    } else if (reminder && reminder.completed) {
      updateMetrics({
        tasksCompleted: Math.max(0, metrics.tasksCompleted - 1),
        tasksCompletionRate: Math.max(0, metrics.tasksCompletionRate - 2),
      });
    }
  };

  return {
    metrics,
    reminders,
    quote,
    isLoading,
    error,
    updateMetrics,
    completeReminder,
    refreshData: fetchData,
  };
};
