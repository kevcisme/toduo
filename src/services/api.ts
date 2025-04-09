import { taskService, noteService, kanbanService, calendarService, tagService } from './databaseService';
import { Task, Note, KanbanBoard, KanbanColumn, KanbanCard, CalendarEvent, Tag } from '../db/models';

const API_BASE_URL = 'http://localhost:3000/api';

// Task API
export const taskApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    return response.json();
  },

  create: async (title: string, description?: string) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    });
    return response.json();
  },

  // Get task by ID
  getTaskById: async (id: number): Promise<Task | undefined> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    return response.json();
  },
  
  // Update a task
  updateTask: async (id: number, updates: Partial<Task>): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },
  
  // Delete a task
  deleteTask: async (id: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  // Get tags for a task
  getTaskTags: async (taskId: number): Promise<Tag[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/tags`);
    return response.json();
  },
  
  // Add a tag to a task
  addTagToTask: async (taskId: number, tagId: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/tags/${tagId}`, {
      method: 'POST',
    });
    return response.json();
  },
  
  // Remove a tag from a task
  removeTagFromTask: async (taskId: number, tagId: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/tags/${tagId}`, {
      method: 'DELETE',
    });
    return response.json();
  }
};

// Note API
export const noteApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/notes`);
    return response.json();
  },

  create: async (title: string, content?: string) => {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });
    return response.json();
  },

  // Get note by ID
  getNoteById: async (id: number): Promise<Note | undefined> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`);
    return response.json();
  },
  
  // Update a note
  updateNote: async (id: number, updates: Partial<Note>): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },
  
  // Delete a note
  deleteNote: async (id: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  // Get tags for a note
  getNoteTags: async (noteId: number): Promise<Tag[]> => {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}/tags`);
    return response.json();
  },
  
  // Add a tag to a note
  addTagToNote: async (noteId: number, tagId: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}/tags/${tagId}`, {
      method: 'POST',
    });
    return response.json();
  },
  
  // Remove a tag from a note
  removeTagFromNote: async (noteId: number, tagId: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}/tags/${tagId}`, {
      method: 'DELETE',
    });
    return response.json();
  }
};

// Kanban API
export const kanbanApi = {
  // Get all boards
  getAllBoards: async (): Promise<KanbanBoard[]> => {
    const response = await fetch(`${API_BASE_URL}/boards`);
    return response.json();
  },
  
  // Get board by ID
  getBoardById: async (id: number): Promise<KanbanBoard | undefined> => {
    const response = await fetch(`${API_BASE_URL}/boards/${id}`);
    return response.json();
  },
  
  // Create a new board
  createBoard: async (title: string): Promise<{ lastInsertRowid: number | bigint }> => {
    const response = await fetch(`${API_BASE_URL}/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    return response.json();
  },
  
  // Update a board
  updateBoard: async (id: number, updates: Partial<KanbanBoard>): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },
  
  // Delete a board
  deleteBoard: async (id: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  // Get all columns for a board
  getColumnsByBoardId: async (boardId: number): Promise<KanbanColumn[]> => {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns`);
    return response.json();
  },
  
  // Create a new column
  createColumn: async (boardId: number, title: string, position: number): Promise<{ lastInsertRowid: number | bigint }> => {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, position }),
    });
    return response.json();
  },
  
  // Update a column
  updateColumn: async (id: number, updates: Partial<KanbanColumn>): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/columns/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },
  
  // Delete a column
  deleteColumn: async (id: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/columns/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  // Get all cards for a column
  getCardsByColumnId: async (columnId: number): Promise<KanbanCard[]> => {
    const response = await fetch(`${API_BASE_URL}/boards/columns/${columnId}/cards`);
    return response.json();
  },
  
  // Create a new card
  createCard: async (columnId: number, title: string, description?: string, position?: number): Promise<{ lastInsertRowid: number | bigint }> => {
    const response = await fetch(`${API_BASE_URL}/boards/columns/${columnId}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description, position }),
    });
    return response.json();
  },
  
  // Update a card
  updateCard: async (id: number, updates: Partial<KanbanCard>): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/cards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },
  
  // Delete a card
  deleteCard: async (id: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/cards/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  // Card tag operations
  getCardTags: async (cardId: number): Promise<Tag[]> => {
    const response = await fetch(`${API_BASE_URL}/boards/cards/${cardId}/tags`);
    return response.json();
  },
  
  addTagToCard: async (cardId: number, tagId: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/cards/${cardId}/tags/${tagId}`, {
      method: 'POST',
    });
    return response.json();
  },
  
  removeTagFromCard: async (cardId: number, tagId: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/cards/${cardId}/tags/${tagId}`, {
      method: 'DELETE',
    });
    return response.json();
  }
};

// Calendar API
export const calendarApi = {
  // Get all events
  getAllEvents: async (): Promise<CalendarEvent[]> => {
    const response = await fetch(`${API_BASE_URL}/events`);
    return response.json();
  },
  
  // Get event by ID
  getEventById: async (id: number): Promise<CalendarEvent | undefined> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`);
    return response.json();
  },
  
  // Get events by date range
  getEventsByDateRange: async (startDate: string, endDate: string): Promise<CalendarEvent[]> => {
    const response = await fetch(`${API_BASE_URL}/events?startDate=${startDate}&endDate=${endDate}`);
    return response.json();
  },
  
  // Create a new event
  createEvent: async (title: string, description?: string, startTime?: string, endTime?: string, allDay?: boolean): Promise<{ lastInsertRowid: number | bigint }> => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description, startTime, endTime, allDay }),
    });
    return response.json();
  },
  
  // Update an event
  updateEvent: async (id: number, updates: Partial<CalendarEvent>): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },
  
  // Delete an event
  deleteEvent: async (id: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  // Get tags for an event
  getEventTags: async (eventId: number): Promise<Tag[]> => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/tags`);
    return response.json();
  },
  
  // Add a tag to an event
  addTagToEvent: async (eventId: number, tagId: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/tags/${tagId}`, {
      method: 'POST',
    });
    return response.json();
  },
  
  // Remove a tag from an event
  removeTagFromEvent: async (eventId: number, tagId: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/tags/${tagId}`, {
      method: 'DELETE',
    });
    return response.json();
  }
};

// Tag API
export const tagApi = {
  // Get all tags
  getAllTags: async (): Promise<Tag[]> => {
    const response = await fetch(`${API_BASE_URL}/tags`);
    return response.json();
  },
  
  // Get tag by ID
  getTagById: async (id: number): Promise<Tag | undefined> => {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`);
    return response.json();
  },
  
  // Create a new tag
  createTag: async (name: string, color?: string): Promise<{ lastInsertRowid: number | bigint }> => {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, color }),
    });
    return response.json();
  },
  
  // Delete a tag
  deleteTag: async (id: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }
}; 