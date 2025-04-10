import {
  taskOperations,
  noteOperations,
  kanbanBoardOperations,
  kanbanColumnOperations,
  kanbanCardOperations,
  calendarEventOperations,
  tagOperations,
  taskTagOperations,
  noteTagOperations,
  kanbanCardTagOperations,
  calendarEventTagOperations,
  Task,
  Note,
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  CalendarEvent,
  Tag
} from '../db/models';

// Task service
export const taskService = {
  createTask: (title: string, description?: string) => {
    return taskOperations.create(title, description);
  },
  
  getAllTasks: () => {
    return taskOperations.getAll();
  },
  
  getTaskById: (id: number) => {
    return taskOperations.getById(id);
  },
  
  updateTask: (id: number, updates: Partial<Task>) => {
    return taskOperations.update(id, updates);
  },
  
  deleteTask: (id: number) => {
    return taskOperations.delete(id);
  },
  
  getTaskTags: (taskId: number) => {
    return taskTagOperations.getTaskTags(taskId);
  },
  
  addTagToTask: (taskId: number, tagId: number) => {
    return taskTagOperations.addTagToTask(taskId, tagId);
  },
  
  removeTagFromTask: (taskId: number, tagId: number) => {
    return taskTagOperations.removeTagFromTask(taskId, tagId);
  }
};

// Note service
export const noteService = {
  createNote: (title: string, content?: string) => {
    return noteOperations.create(title, content);
  },
  
  getAllNotes: () => {
    return noteOperations.getAll();
  },
  
  getNoteById: (id: number) => {
    return noteOperations.getById(id);
  },
  
  updateNote: (id: number, updates: Partial<Note>) => {
    return noteOperations.update(id, updates);
  },
  
  deleteNote: (id: number) => {
    return noteOperations.delete(id);
  },
  
  getNoteTags: (noteId: number) => {
    return noteTagOperations.getNoteTags(noteId);
  },
  
  addTagToNote: (noteId: number, tagId: number) => {
    return noteTagOperations.addTagToNote(noteId, tagId);
  },
  
  removeTagFromNote: (noteId: number, tagId: number) => {
    return noteTagOperations.removeTagFromNote(noteId, tagId);
  }
};

// Kanban service
export const kanbanService = {
  // Board operations
  createBoard: (title: string) => {
    return kanbanBoardOperations.create(title);
  },
  
  getAllBoards: () => {
    return kanbanBoardOperations.getAll();
  },
  
  getBoardById: (id: number) => {
    return kanbanBoardOperations.getById(id);
  },
  
  updateBoard: (id: number, updates: Partial<KanbanBoard>) => {
    return kanbanBoardOperations.update(id, updates);
  },
  
  deleteBoard: (id: number) => {
    return kanbanBoardOperations.delete(id);
  },
  
  // Column operations
  createColumn: (boardId: number, title: string, position: number) => {
    return kanbanColumnOperations.create(boardId, title, position);
  },
  
  getColumnsByBoardId: (boardId: number) => {
    return kanbanColumnOperations.getByBoardId(boardId);
  },
  
  updateColumn: (id: number, updates: Partial<KanbanColumn>) => {
    return kanbanColumnOperations.update(id, updates);
  },
  
  deleteColumn: (id: number) => {
    return kanbanColumnOperations.delete(id);
  },
  
  // Card operations
  createCard: (columnId: number, title: string, description: string | undefined, position: number) => {
    return kanbanCardOperations.create(columnId, title, description, position);
  },
  
  getCardsByColumnId: (columnId: number) => {
    return kanbanCardOperations.getByColumnId(columnId);
  },
  
  updateCard: (id: number, updates: Partial<KanbanCard>) => {
    return kanbanCardOperations.update(id, updates);
  },
  
  deleteCard: (id: number) => {
    return kanbanCardOperations.delete(id);
  },
  
  // Card tag operations
  getCardTags: (cardId: number) => {
    return kanbanCardTagOperations.getCardTags(cardId);
  },
  
  addTagToCard: (cardId: number, tagId: number) => {
    return kanbanCardTagOperations.addTagToCard(cardId, tagId);
  },
  
  removeTagFromCard: (cardId: number, tagId: number) => {
    return kanbanCardTagOperations.removeTagFromCard(cardId, tagId);
  }
};

// Calendar service
export const calendarService = {
  createEvent: (title: string, description: string | undefined, startTime: string, endTime: string, allDay: boolean) => {
    return calendarEventOperations.create(title, description, startTime, endTime, allDay);
  },
  
  getAllEvents: () => {
    return calendarEventOperations.getAll();
  },
  
  getEventById: (id: number) => {
    return calendarEventOperations.getById(id);
  },
  
  getEventsByDateRange: (startDate: string, endDate: string) => {
    return calendarEventOperations.getByDateRange(startDate, endDate);
  },
  
  updateEvent: (id: number, updates: Partial<CalendarEvent>) => {
    return calendarEventOperations.update(id, updates);
  },
  
  deleteEvent: (id: number) => {
    return calendarEventOperations.delete(id);
  },
  
  // Event tag operations
  getEventTags: (eventId: number) => {
    return calendarEventTagOperations.getEventTags(eventId);
  },
  
  addTagToEvent: (eventId: number, tagId: number) => {
    return calendarEventTagOperations.addTagToEvent(eventId, tagId);
  },
  
  removeTagFromEvent: (eventId: number, tagId: number) => {
    return calendarEventTagOperations.removeTagFromEvent(eventId, tagId);
  }
};

// Tag service
export const tagService = {
  createTag: (name: string, color?: string) => {
    return tagOperations.create(name, color);
  },
  
  getAllTags: () => {
    return tagOperations.getAll();
  },
  
  getTagById: (id: number) => {
    return tagOperations.getById(id);
  },
  
  deleteTag: (id: number) => {
    return tagOperations.delete(id);
  }
}; 