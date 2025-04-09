/**
 * Application data types for task management and scheduling
 */

export interface WeeklyBigThree {
  one?: string;
  two?: string;
  three?: string;
}

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  date: Date;
  category?: string;
}

export interface DailyBigThree {
  one?: string;
  two?: string;
  three?: string;
  date: Date;
}

export interface DailyScheduleItem {
  id: string;
  title: string;
  time?: string;
  completed: boolean;
  category: "morning" | "workday" | "evening" | "other";
  date: Date;
}

export interface WeeklyData {
  weekStartDate: Date;
  weekNumber?: number;
  weeklyBigThree: WeeklyBigThree;
  dailyEntries: DailyEntry[];
  unfinishedTasks: DailyTask[];
  weeklyTasks: DailyTask[];
  wins: string[];
  reflections: {
    futureThoughts?: string;
    bigThreeProgress?: string[];
    monthlyGoalsRelation?: string;
  };
}

export interface DailyEntry {
  date: Date;
  dateFormatted: string;
  dayOfYear?: number;
  weekNumber?: number;
  bigThree: DailyBigThree;
  exercise?: string;
  readingCareer?: string;
  readingFun?: string;
  tasks: DailyTask[];
  scheduleItems: DailyScheduleItem[];
  journal?: {
    pastDay?: string;
    achievements?: string;
    feelings?: string;
    gratitude?: string;
    worries?: string;
    improvements?: string;
    goals?: string;
    rejections?: string;
    learnings?: string;
  };
}

export interface ScheduleData {
  weekly: WeeklyData | null;
  dailyEntries: Record<string, DailyEntry>;
}
