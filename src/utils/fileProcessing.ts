/**
 * File processing utilities for extracting text from various document types
 */

import { Document } from "@/components/DocumentUpload";

/**
 * Extract text from a file based on its type
 * @param file The file to extract text from
 * @returns A promise that resolves to the extracted text
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type.toLowerCase();

  // Plain text files
  if (fileType.includes("text/plain") || file.name.endsWith(".txt")) {
    return extractTextFromTextFile(file);
  }

  // PDF files
  if (fileType.includes("pdf")) {
    return extractTextFromPDF(file);
  }

  // Word documents
  if (
    fileType.includes("word") ||
    file.name.endsWith(".doc") ||
    file.name.endsWith(".docx")
  ) {
    return extractTextFromWord(file);
  }

  // Excel spreadsheets
  if (
    fileType.includes("excel") ||
    fileType.includes("spreadsheet") ||
    file.name.endsWith(".xls") ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".csv")
  ) {
    return extractTextFromExcel(file);
  }

  // PowerPoint presentations
  if (
    fileType.includes("presentation") ||
    file.name.endsWith(".ppt") ||
    file.name.endsWith(".pptx")
  ) {
    return extractTextFromPowerPoint(file);
  }

  // Default fallback
  return `Unable to extract text from ${file.name}. Unsupported file type.`;
}

/**
 * Process a file and create a Document object with extracted text
 * @param file The file to process
 * @returns A promise that resolves to a Document object
 */
export async function processFile(file: File): Promise<Document> {
  try {
    const extractedText = await extractTextFromFile(file);
    let scheduleData = null;

    // Try to extract schedule data from any text-based file
    if (
      file.type.includes("pdf") ||
      file.type.includes("text") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".doc") ||
      file.name.endsWith(".docx")
    ) {
      scheduleData = extractScheduleDataFromText(extractedText, file.name);
    }

    return {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      extractedText,
      scheduleData,
    };
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
    return {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      extractedText: `Error extracting text from ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Extract URL content and metadata
 * @param url The URL to extract content from
 * @returns A promise that resolves to an object with URL metadata and content
 */
export async function extractUrlContent(url: string): Promise<{
  title: string;
  description: string;
  favicon?: string;
  previewImage?: string;
  extractedText?: string;
}> {
  try {
    // In a real implementation, this would call a server API to fetch and parse the URL
    // For now, we'll simulate it with a basic implementation

    // Normalize the URL
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

    // Extract domain for basic metadata
    const domain = new URL(normalizedUrl).hostname;
    const title = domain.replace(/^www\./, "");

    // Generate a favicon URL using Google's favicon service
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}`;

    // Simulate a delay for the network request
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      title: title,
      description: `Content from ${title}`,
      favicon,
      previewImage: undefined, // In a real implementation, this would be extracted from the page's meta tags
      extractedText: `This is simulated extracted text from ${normalizedUrl}. In a real implementation, this would contain the actual text content of the webpage.`,
    };
  } catch (error) {
    console.error(`Error extracting content from URL ${url}:`, error);
    throw error;
  }
}

/**
 * Extract schedule data from text content
 * @param text The text content to extract schedule data from
 * @param fileName The name of the file (used for determining the type of schedule)
 * @returns The extracted schedule data or null if no schedule data could be extracted
 */
export function extractScheduleDataFromText(
  text: string,
  fileName: string,
): ScheduleData | null {
  // Initialize schedule data
  const scheduleData: ScheduleData = {
    weekly: null,
    dailyEntries: {},
  };

  // Check if this is a weekly schedule
  if (
    text.includes("Weekly Big 3") ||
    text.includes("New Week") ||
    fileName.toLowerCase().includes("week")
  ) {
    // Extract weekly data
    const weeklyData: WeeklyData = {
      weekStartDate: new Date(),
      weeklyBigThree: {
        one: "",
        two: "",
        three: "",
      },
      dailyEntries: [],
      unfinishedTasks: [],
      weeklyTasks: [],
      wins: [],
      reflections: {},
    };

    // Extract week start date
    const weekStartMatch = text.match(/Week Start:\s+([\d\/]+)/);
    if (weekStartMatch && weekStartMatch[1]) {
      weeklyData.weekStartDate = new Date(weekStartMatch[1]);
    }

    // Extract week number if available
    const weekNumberMatch = text.match(/Week\s+number\s+(\d+)/);
    if (weekNumberMatch && weekNumberMatch[1]) {
      weeklyData.weekNumber = parseInt(weekNumberMatch[1], 10);
    }

    // Extract weekly big three items
    const big1Match = text.match(/Big 1:\s+([^\n]+)/);
    if (big1Match) weeklyData.weeklyBigThree.one = big1Match[1].trim();

    const big2Match = text.match(/Big 2:\s+([^\n]+)/);
    if (big2Match) weeklyData.weeklyBigThree.two = big2Match[1].trim();

    const big3Match = text.match(/Big 3:\s+([^\n]+)/);
    if (big3Match) weeklyData.weeklyBigThree.three = big3Match[1].trim();

    // Extract reflections
    const reflectionsMatch = text.match(
      /Weekly Reflections:\s*([\s\S]*?)(?=\n\n|$)/,
    );
    if (reflectionsMatch && reflectionsMatch[1]) {
      const reflectionLines = reflectionsMatch[1]
        .split("\n")
        .filter((line) => line.trim().startsWith("-"));
      weeklyData.reflections.futureThoughts = reflectionLines
        .map((line) => line.trim().substring(1).trim())
        .join("\n");
    }

    // Extract daily entries using regex for both formats
    const dateRegex = /(?:@([\w\s,]+)|([\d]{8}))\s*(?:\(([\d]{8})\))?/g;
    let dateMatch;
    const processedDates = new Set<string>(); // To avoid duplicate entries

    while ((dateMatch = dateRegex.exec(text)) !== null) {
      let date: Date;
      let dateStr = dateMatch[1] || dateMatch[2] || dateMatch[3];

      if (!dateStr) continue;

      if (dateMatch[1]) {
        // Format: @September 16, 2024
        date = new Date(dateStr);
      } else {
        // Format: 20240916
        const year = parseInt(dateStr.substring(0, 4), 10);
        const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JS months are 0-indexed
        const day = parseInt(dateStr.substring(6, 8), 10);
        date = new Date(year, month, day);
      }

      const dateFormatted = date.toLocaleDateString();

      // Skip if we've already processed this date
      if (processedDates.has(dateFormatted)) continue;
      processedDates.add(dateFormatted);

      // Get the section of text for this date
      const startIndex = dateMatch.index;
      const nextDateMatch = dateRegex.exec(text);
      const endIndex = nextDateMatch ? nextDateMatch.index : text.length;
      dateRegex.lastIndex = startIndex + 1; // Reset to continue from after current match

      const dateSection = text.substring(startIndex, endIndex);

      // Create a daily entry
      const dailyEntry: DailyEntry = {
        date,
        dateFormatted,
        bigThree: {
          date,
        },
        tasks: [],
        scheduleItems: [],
      };

      // Extract daily big three items
      const dailyBig1Match = dateSection.match(/Big 1:\s+([^\n]+)/);
      if (dailyBig1Match) dailyEntry.bigThree.one = dailyBig1Match[1].trim();

      const dailyBig2Match = dateSection.match(/Big 2:\s+([^\n]+)/);
      if (dailyBig2Match) dailyEntry.bigThree.two = dailyBig2Match[1].trim();

      const dailyBig3Match = dateSection.match(/Big 3:\s+([^\n]+)/);
      if (dailyBig3Match) dailyEntry.bigThree.three = dailyBig3Match[1].trim();

      // Extract tasks
      const taskRegex = /☐\s+([^\n]+)/g;
      let taskMatch;

      while ((taskMatch = taskRegex.exec(dateSection)) !== null) {
        const taskTitle = taskMatch[1].trim();
        dailyEntry.tasks.push({
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: taskTitle,
          completed: false,
          date,
          category: determineTaskCategory(taskTitle, dateSection),
        });
      }

      // Add the daily entry to both collections
      weeklyData.dailyEntries.push(dailyEntry);
      scheduleData.dailyEntries[dailyEntry.dateFormatted] = dailyEntry;
    }

    // Extract unfinished tasks
    const unfinishedTasksRegex = /☐\s+([^\n]+)/g;
    let unfinishedMatch;

    while ((unfinishedMatch = unfinishedTasksRegex.exec(text)) !== null) {
      const taskTitle = unfinishedMatch[1].trim();
      // Check if this task is not already in a daily entry
      const isInDailyEntry = Object.values(scheduleData.dailyEntries).some(
        (entry) => entry.tasks.some((task) => task.title === taskTitle),
      );

      if (!isInDailyEntry) {
        weeklyData.unfinishedTasks.push({
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: taskTitle,
          completed: false,
          date: new Date(),
        });
      }
    }

    scheduleData.weekly = weeklyData;
  }

  // Check if this is a daily schedule
  else if (
    text.includes("Daily Schedule") ||
    text.includes("Daily Tasks") ||
    fileName.toLowerCase().includes("day") ||
    fileName.toLowerCase().includes("daily")
  ) {
    // Extract date from the text
    const dateMatch =
      text.match(/(\d{8})\s+([A-Za-z]+)/) ||
      text.match(/Daily Schedule\s*-\s*([\d\/]+)/) ||
      text.match(/Date:\s*([\d\/]+)/);
    let date = new Date();

    if (dateMatch && dateMatch[1]) {
      const dateStr = dateMatch[1];

      if (dateStr.includes("/")) {
        date = new Date(dateStr);
      } else {
        // Format: 20240916
        const year = parseInt(dateStr.substring(0, 4), 10);
        const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JS months are 0-indexed
        const day = parseInt(dateStr.substring(6, 8), 10);
        date = new Date(year, month, day);
      }
    }

    // Create a daily entry
    const dailyEntry: DailyEntry = {
      date,
      dateFormatted: date.toLocaleDateString(),
      bigThree: {
        date,
      },
      tasks: [],
      scheduleItems: [],
    };

    // Extract big three items
    const big1Match = text.match(/Big 1:\s+([^\n]+)/);
    if (big1Match) dailyEntry.bigThree.one = big1Match[1].trim();

    const big2Match = text.match(/Big 2:\s+([^\n]+)/);
    if (big2Match) dailyEntry.bigThree.two = big2Match[1].trim();

    const big3Match = text.match(/Big 3:\s+([^\n]+)/);
    if (big3Match) dailyEntry.bigThree.three = big3Match[1].trim();

    // Extract tasks
    const taskRegex = /☐\s+([^\n]+)/g;
    let taskMatch;

    while ((taskMatch = taskRegex.exec(text)) !== null) {
      const taskTitle = taskMatch[1].trim();
      const taskContext = text.substring(
        Math.max(0, taskMatch.index - 100),
        taskMatch.index,
      );

      dailyEntry.tasks.push({
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: taskTitle,
        completed: false,
        date,
        category: determineTaskCategory(taskTitle, taskContext),
      });
    }

    // Extract schedule items by category
    extractScheduleItems(text, dailyEntry, "Morning", "morning");
    extractScheduleItems(text, dailyEntry, "Workday", "workday");
    extractScheduleItems(text, dailyEntry, "Afternoon", "workday");
    extractScheduleItems(text, dailyEntry, "Evening", "evening");

    // Add the daily entry to the collection
    scheduleData.dailyEntries[dailyEntry.dateFormatted] = dailyEntry;
  }

  // Check if this is a task list
  else if (
    text.includes("Task List") ||
    fileName.toLowerCase().includes("task") ||
    fileName.toLowerCase().includes("todo")
  ) {
    // Create a daily entry for today
    const today = new Date();
    const dailyEntry: DailyEntry = {
      date: today,
      dateFormatted: today.toLocaleDateString(),
      bigThree: {
        date: today,
      },
      tasks: [],
      scheduleItems: [],
    };

    // Extract tasks by priority
    extractTasksByPriority(text, dailyEntry, "High Priority", "high");
    extractTasksByPriority(text, dailyEntry, "Medium Priority", "medium");
    extractTasksByPriority(text, dailyEntry, "Low Priority", "low");

    // Extract action items if present
    const actionItemsRegex = /Action Items:\s*([\s\S]*?)(?=\n\n|$)/;
    const actionItemsMatch = text.match(actionItemsRegex);

    if (actionItemsMatch && actionItemsMatch[1]) {
      const actionItemsSection = actionItemsMatch[1];
      const actionItemRegex = /☐\s+([^\n]+)/g;
      let actionItemMatch;

      while (
        (actionItemMatch = actionItemRegex.exec(actionItemsSection)) !== null
      ) {
        const taskTitle = actionItemMatch[1].trim();
        dailyEntry.tasks.push({
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: taskTitle,
          completed: false,
          date: today,
          category: "action",
        });
      }
    }

    // Add the daily entry to the collection if it has tasks
    if (dailyEntry.tasks.length > 0) {
      scheduleData.dailyEntries[dailyEntry.dateFormatted] = dailyEntry;
    }
  }

  // Check if this is a note with tasks
  else if (
    text.includes("Meeting Notes") ||
    text.includes("Action Items") ||
    fileName.toLowerCase().includes("note")
  ) {
    // Create a daily entry for today
    const today = new Date();
    const dailyEntry: DailyEntry = {
      date: today,
      dateFormatted: today.toLocaleDateString(),
      bigThree: {
        date: today,
      },
      tasks: [],
      scheduleItems: [],
    };

    // Extract date if available
    const dateMatch = text.match(/Date:\s*([\d\/]+)/);
    if (dateMatch && dateMatch[1]) {
      const noteDate = new Date(dateMatch[1]);
      dailyEntry.date = noteDate;
      dailyEntry.dateFormatted = noteDate.toLocaleDateString();
      dailyEntry.bigThree.date = noteDate;
    }

    // Extract action items
    const actionItemsRegex = /Action Items:\s*([\s\S]*?)(?=\n\n|$)/;
    const actionItemsMatch = text.match(actionItemsRegex);

    if (actionItemsMatch && actionItemsMatch[1]) {
      const actionItemsSection = actionItemsMatch[1];
      const actionItemRegex = /☐\s+([^\n]+)/g;
      let actionItemMatch;

      while (
        (actionItemMatch = actionItemRegex.exec(actionItemsSection)) !== null
      ) {
        const taskTitle = actionItemMatch[1].trim();
        dailyEntry.tasks.push({
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: taskTitle,
          completed: false,
          date: dailyEntry.date,
          category: "action",
        });
      }
    }

    // Add the daily entry to the collection if it has tasks
    if (dailyEntry.tasks.length > 0) {
      scheduleData.dailyEntries[dailyEntry.dateFormatted] = dailyEntry;
    }
  }

  return Object.keys(scheduleData.dailyEntries).length > 0 ||
    scheduleData.weekly
    ? scheduleData
    : null;
}

/**
 * Determine the category of a task based on its title and context
 * @param taskTitle The title of the task
 * @param context The surrounding text context
 * @returns The category of the task
 */
function determineTaskCategory(
  taskTitle: string,
  context: string,
): string | undefined {
  const lowerTitle = taskTitle.toLowerCase();
  const lowerContext = context.toLowerCase();

  // Check for time indicators
  if (
    taskTitle.match(/\d{1,2}:\d{2}\s*(AM|PM)/i) ||
    taskTitle.includes("meeting") ||
    taskTitle.includes("call") ||
    taskTitle.includes("appointment")
  ) {
    return "scheduled";
  }

  // Check context for section headers
  if (lowerContext.includes("high priority")) return "high";
  if (lowerContext.includes("medium priority")) return "medium";
  if (lowerContext.includes("low priority")) return "low";
  if (lowerContext.includes("morning")) return "morning";
  if (lowerContext.includes("workday") || lowerContext.includes("afternoon"))
    return "workday";
  if (lowerContext.includes("evening")) return "evening";
  if (lowerContext.includes("action items")) return "action";

  // Check for common task types
  if (lowerTitle.includes("review") || lowerTitle.includes("check"))
    return "review";
  if (lowerTitle.includes("prepare") || lowerTitle.includes("create"))
    return "create";
  if (lowerTitle.includes("meeting") || lowerTitle.includes("call"))
    return "meeting";
  if (lowerTitle.includes("email") || lowerTitle.includes("message"))
    return "communication";

  return undefined;
}

/**
 * Extract schedule items from a specific section of text
 * @param text The full text content
 * @param dailyEntry The daily entry to add schedule items to
 * @param sectionName The name of the section to extract from
 * @param category The category to assign to the schedule items
 */
function extractScheduleItems(
  text: string,
  dailyEntry: DailyEntry,
  sectionName: string,
  category: "morning" | "workday" | "evening" | "other",
): void {
  const sectionRegex = new RegExp(
    `${sectionName}:\s*([\s\S]*?)(?=\n\n|\n[A-Za-z]+:|$)`,
  );
  const sectionMatch = text.match(sectionRegex);

  if (sectionMatch && sectionMatch[1]) {
    const sectionText = sectionMatch[1];
    const itemRegex = /☐\s+([^\n]+)/g;
    let itemMatch;

    while ((itemMatch = itemRegex.exec(sectionText)) !== null) {
      const itemTitle = itemMatch[1].trim();
      let time: string | undefined;

      // Extract time if present in parentheses
      const timeMatch = itemTitle.match(/\((\d{1,2}:\d{2}\s*(AM|PM))\)/i);
      let cleanTitle = itemTitle;

      if (timeMatch) {
        time = timeMatch[1];
        cleanTitle = itemTitle.replace(timeMatch[0], "").trim();
      }

      dailyEntry.scheduleItems.push({
        id: `schedule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: cleanTitle,
        time,
        completed: false,
        category,
        date: dailyEntry.date,
      });
    }
  }
}

/**
 * Extract tasks by priority from a specific section of text
 * @param text The full text content
 * @param dailyEntry The daily entry to add tasks to
 * @param prioritySection The name of the priority section to extract from
 * @param category The category to assign to the tasks
 */
function extractTasksByPriority(
  text: string,
  dailyEntry: DailyEntry,
  prioritySection: string,
  category: string,
): void {
  const sectionRegex = new RegExp(
    `${prioritySection}:\s*([\s\S]*?)(?=\n\n|\n[A-Za-z]+\sPriority:|$)`,
  );
  const sectionMatch = text.match(sectionRegex);

  if (sectionMatch && sectionMatch[1]) {
    const sectionText = sectionMatch[1];
    const taskRegex = /☐\s+([^\n]+)/g;
    let taskMatch;

    while ((taskMatch = taskRegex.exec(sectionText)) !== null) {
      const taskTitle = taskMatch[1].trim();
      dailyEntry.tasks.push({
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: taskTitle,
        completed: false,
        date: dailyEntry.date,
        category,
      });
    }
  }
}

/**
 * Extract text from a plain text file
 * @param file The text file to extract text from
 * @returns A promise that resolves to the extracted text
 */
async function extractTextFromTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Failed to read text file"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading text file"));
    };

    reader.readAsText(file);
  });
}

import { DailyEntry, DailyTask, ScheduleData, WeeklyData } from "@/types/app";

/**
 * Extract text from a PDF file
 * This implementation simulates PDF parsing with more realistic extraction
 * @param file The PDF file to extract text from
 * @returns A promise that resolves to the extracted text
 */
async function extractTextFromPDF(file: File): Promise<string> {
  // Simulate PDF parsing with a more realistic extraction
  // In a real implementation, we would use a library like pdf.js

  // For demo purposes, we'll simulate different content based on filename patterns
  const filename = file.name.toLowerCase();

  if (filename.includes("weekly") || filename.includes("week")) {
    return generateWeeklyScheduleText(file.name);
  } else if (filename.includes("daily") || filename.includes("day")) {
    return generateDailyScheduleText(file.name);
  } else if (filename.includes("task") || filename.includes("todo")) {
    return generateTaskListText(file.name);
  } else if (filename.includes("note") || filename.includes("doc")) {
    return generateNoteText(file.name);
  } else {
    // Generic schedule with mixed content
    return generateGenericScheduleText(file.name);
  }
}

/**
 * Generate sample weekly schedule text
 * @param filename The name of the file
 * @returns Sample weekly schedule text
 */
function generateWeeklyScheduleText(filename: string): string {
  const today = new Date();
  const weekStartDate = new Date(today);
  weekStartDate.setDate(today.getDate() - today.getDay()); // Set to the start of the current week (Sunday)

  const weekNumber = Math.ceil(
    (today.getDate() -
      1 +
      new Date(today.getFullYear(), today.getMonth(), 0).getDay()) /
      7,
  );

  let text = `Weekly Schedule - Week number ${weekNumber}\n`;
  text += `Week Start: ${weekStartDate.toLocaleDateString()}\n\n`;
  text += "Weekly Big 3:\n";
  text += "Big 1: Complete project proposal for client\n";
  text += "Big 2: Finalize Q3 budget planning\n";
  text += "Big 3: Prepare for team offsite\n\n";

  // Add daily entries for the week
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStartDate);
    currentDate.setDate(weekStartDate.getDate() + i);
    const dateFormatted = currentDate.toLocaleDateString();
    const dateFormatYYYYMMDD = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, "0")}${String(currentDate.getDate()).padStart(2, "0")}`;

    text += `@${dateFormatted} (${dateFormatYYYYMMDD})\n`;
    text += "Daily Big 3:\n";
    text += `Big 1: ${getDailyTask(i, 1)}\n`;
    text += `Big 2: ${getDailyTask(i, 2)}\n`;
    text += `Big 3: ${getDailyTask(i, 3)}\n\n`;

    text += "Tasks:\n";
    text += `☐ ${getDailyTask(i, 4)}\n`;
    text += `☐ ${getDailyTask(i, 5)}\n`;
    text += `☐ ${getDailyTask(i, 6)}\n`;

    if (i === 1 || i === 3) {
      text += `☐ AI Talk\n`;
    }
    if (i === 2 || i === 4) {
      text += `☐ Training\n`;
    }

    text += "\n";
  }

  text += "Weekly Reflections:\n";
  text += "- Focus on completing the big three items early in the week\n";
  text += "- Schedule buffer time for unexpected client requests\n";
  text += "- Remember to prepare materials for the team offsite\n";

  return text;
}

/**
 * Generate sample daily schedule text
 * @param filename The name of the file
 * @returns Sample daily schedule text
 */
function generateDailyScheduleText(filename: string): string {
  const today = new Date();
  const dateFormatYYYYMMDD = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = dayNames[today.getDay()];

  let text = `${dateFormatYYYYMMDD} ${dayName} - Daily Schedule\n\n`;
  text += `Date: ${today.toLocaleDateString()}\n\n`;
  text += "Daily Big 3:\n";
  text += "Big 1: Complete project presentation\n";
  text += "Big 2: Review quarterly reports\n";
  text += "Big 3: Prepare for team meeting\n\n";

  text += "Morning:\n";
  text += "☐ Check emails (8:00 AM)\n";
  text += "☐ Team standup (9:30 AM)\n";
  text += "☐ Review yesterday's progress\n\n";

  text += "Workday:\n";
  text += "☐ Client meeting (11:00 AM)\n";
  text += "☐ Lunch break (12:30 PM)\n";
  text += "☐ Work on project deliverables (2:00 PM)\n";
  text += "☐ Review pull requests\n\n";

  text += "Evening:\n";
  text += "☐ Wrap up daily tasks\n";
  text += "☐ Plan for tomorrow\n";
  text += "☐ Exercise (6:30 PM)\n";

  return text;

  /**
   * Generate sample task list text
   * @param filename The name of the file
   * @returns Sample task list text
   */
  function generateTaskListText(filename: string): string {
    let text = "Task List\n\n";

    text += "High Priority:\n";
    text += "☐ Complete project proposal\n";
    text += "☐ Prepare presentation for client meeting\n";
    text += "☐ Review quarterly financial reports\n\n";

    text += "Medium Priority:\n";
    text += "☐ Update team documentation\n";
    text += "☐ Schedule interviews for open position\n";
    text += "☐ Research new tools for project management\n\n";

    text += "Low Priority:\n";
    text += "☐ Clean up old project files\n";
    text += "☐ Organize digital assets\n";
    text += "☐ Update personal development plan\n\n";

    text += "Action Items:\n";
    text += "☐ Follow up with marketing team about campaign\n";
    text += "☐ Send meeting notes to stakeholders\n";
    text += "☐ Schedule next planning session\n";

    return text;
  }

  /**
   * Generate sample note text
   * @param filename The name of the file
   * @returns Sample note text
   */
  function generateNoteText(filename: string): string {
    const today = new Date();

    let text = "Meeting Notes\n\n";
    text += `Date: ${today.toLocaleDateString()}\n\n`;
    text += "Attendees: John Doe, Jane Smith, Alex Johnson\n\n";

    text += "Agenda:\n";
    text += "1. Project Status Update\n";
    text += "2. Budget Review\n";
    text += "3. Timeline Adjustments\n";
    text += "4. Open Discussion\n\n";

    text += "Discussion Points:\n";
    text +=
      "- Project is currently on track with minor delays in the design phase\n";
    text +=
      "- Budget is within expected parameters, but additional resources may be needed for testing\n";
    text += "- Timeline needs adjustment due to upcoming holiday season\n";
    text +=
      "- Team raised concerns about integration with third-party services\n\n";

    text += "Action Items:\n";
    text += "☐ John to provide updated design timeline by Friday\n";
    text += "☐ Jane to prepare budget adjustment proposal\n";
    text += "☐ Alex to contact third-party vendor about integration issues\n";
    text += "☐ Schedule follow-up meeting for next week\n\n";

    text +=
      "Next Meeting: " +
      new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();

    return text;
  }

  /**
   * Generate generic schedule text with mixed content
   * @param filename The name of the file
   * @returns Sample generic schedule text
   */
  function generateGenericScheduleText(filename: string): string {
    const today = new Date();

    let text = `Schedule for ${today.toLocaleDateString()}\n\n`;

    text += "Priority Tasks:\n";
    text += "☐ Complete main project deliverable\n";
    text += "☐ Prepare for client presentation\n";
    text += "☐ Review team progress\n\n";

    text += "Schedule:\n";
    text += "☐ Morning check-in (9:00 AM)\n";
    text += "☐ Team meeting (10:30 AM)\n";
    text += "☐ Lunch (12:00 PM)\n";
    text += "☐ Client call (2:00 PM)\n";
    text += "☐ Project work (3:00 PM - 5:00 PM)\n\n";

    text += "Notes:\n";
    text += "- Remember to discuss the new feature request\n";
    text += "- Follow up on yesterday's action items\n";
    text += "- Prepare questions for the client call\n";

    return text;
  }

  /**
   * Get a sample daily task based on day and task index
   * @param dayIndex The index of the day (0-6)
   * @param taskIndex The index of the task (1-6)
   * @returns A sample task description
   */
  function getDailyTask(dayIndex: number, taskIndex: number): string {
    const tasks = [
      // Day 1 tasks
      [
        "Review project requirements",
        "Set up development environment",
        "Create project timeline",
        "Research competitors",
        "Draft initial design concepts",
        "Schedule kickoff meeting",
      ],
      // Day 2 tasks
      [
        "Finalize project scope",
        "Create wireframes",
        "Set up repository",
        "Draft technical specifications",
        "Meet with design team",
        "Review resource allocation",
      ],
      // Day 3 tasks
      [
        "Begin development",
        "Refine design mockups",
        "Set up CI/CD pipeline",
        "Create test plan",
        "Update project documentation",
        "Review progress with stakeholders",
      ],
      // Day 4 tasks
      [
        "Continue development",
        "Start writing tests",
        "Review design implementation",
        "Update project board",
        "Prepare for demo",
        "Address feedback from stakeholders",
      ],
      // Day 5 tasks
      [
        "Complete core functionality",
        "Run initial tests",
        "Fix critical bugs",
        "Prepare documentation",
        "Review code quality",
        "Update project status",
      ],
      // Day 6 tasks
      [
        "Finalize features",
        "Complete testing",
        "Prepare deployment plan",
        "Create user guide",
        "Final review with team",
        "Address any remaining issues",
      ],
      // Day 7 tasks
      [
        "Deploy to staging",
        "Conduct final testing",
        "Prepare for launch",
        "Create release notes",
        "Brief support team",
        "Plan post-launch monitoring",
      ],
    ];

    // Ensure we have valid indices
    const day = dayIndex % tasks.length;
    const task = (taskIndex - 1) % tasks[day].length;

    return tasks[day][task];
  }

  /**
   * Extract text from a Word document
   * @param file The Word document to extract text from
   * @returns A promise that resolves to the extracted text
   */
  async function extractTextFromWord(file: File): Promise<string> {
    // In a real implementation, we would use a library to parse Word documents
    // For now, we'll simulate it with a basic implementation
    return (
      `This is simulated text extracted from the Word document: ${file.name}\n\n` +
      "The actual implementation would use a library like mammoth.js to extract text from .docx files."
    );
  }

  /**
   * Extract text from an Excel spreadsheet
   * @param file The Excel spreadsheet to extract text from
   * @returns A promise that resolves to the extracted text
   */
  async function extractTextFromExcel(file: File): Promise<string> {
    // In a real implementation, we would use a library to parse Excel files
    // For now, we'll simulate it with a basic implementation
    return (
      `This is simulated text extracted from the Excel spreadsheet: ${file.name}\n\n` +
      "The actual implementation would use a library like xlsx to extract data from Excel files."
    );
  }

  /**
   * Extract text from a PowerPoint presentation
   * @param file The PowerPoint presentation to extract text from
   * @returns A promise that resolves to the extracted text
   */
  async function extractTextFromPowerPoint(file: File): Promise<string> {
    // In a real implementation, we would use a library to parse PowerPoint files
    // For now, we'll simulate it with a basic implementation
    return (
      `This is simulated text extracted from the PowerPoint presentation: ${file.name}\n\n` +
      "The actual implementation would use a specialized library to extract text from PowerPoint files."
    );
  }
}
