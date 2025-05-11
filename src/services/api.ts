import {
  taskService,
  noteService,
  kanbanService,
  calendarService,
  tagService,
  canvasService,
} from "./databaseService";
import {
  Task,
  Note,
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  CalendarEvent,
  Tag,
  Canvas,
  CanvasItem,
} from "../db/models";
import { Document } from "@/components/DocumentUpload";
import { CanvasItemUnion } from "@/types/canvas";

// Use relative '/api' so that Vite's dev server proxy handles routing to backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Task API
export const taskApi = {
  getAll: async () => {
    // Use mock data instead of trying to connect to a backend server
    return [];
  },

  create: async (title: string, description?: string) => {
    // Return mock response
    return {
      id: Date.now(),
      title,
      description,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  // Get task by ID
  getTaskById: async (id: number): Promise<Task | undefined> => {
    // Return mock task
    return {
      id,
      title: "Mock Task",
      description: "This is a mock task",
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  // Update a task
  updateTask: async (
    id: number,
    updates: Partial<Task>,
  ): Promise<{ changes: number }> => {
    // Return mock response
    return { changes: 1 };
  },

  // Delete a task
  deleteTask: async (id: number): Promise<{ changes: number }> => {
    // Return mock response
    return { changes: 1 };
  },

  // Get tags for a task
  getTaskTags: async (taskId: number): Promise<Tag[]> => {
    // Return mock tags
    return [];
  },

  // Add a tag to a task
  addTagToTask: async (
    taskId: number,
    tagId: number,
  ): Promise<{ changes: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/tasks/${taskId}/tags/${tagId}`,
      {
        method: "POST",
      },
    );
    return response.json();
  },

  // Remove a tag from a task
  removeTagFromTask: async (
    taskId: number,
    tagId: number,
  ): Promise<{ changes: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/tasks/${taskId}/tags/${tagId}`,
      {
        method: "DELETE",
      },
    );
    return response.json();
  },
};

// Note API
export const noteApi = {
  getAll: async () => {
    // Return mock notes
    return [];
  },

  create: async (title: string, content?: string) => {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  updateNote: async (
    id: number,
    updates: Partial<Note>,
  ): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Delete a note
  deleteNote: async (id: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Get tags for a note
  getNoteTags: async (noteId: number): Promise<Tag[]> => {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}/tags`);
    return response.json();
  },

  // Add a tag to a note
  addTagToNote: async (
    noteId: number,
    tagId: number,
  ): Promise<{ changes: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/notes/${noteId}/tags/${tagId}`,
      {
        method: "POST",
      },
    );
    return response.json();
  },

  // Remove a tag from a note
  removeTagFromNote: async (
    noteId: number,
    tagId: number,
  ): Promise<{ changes: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/notes/${noteId}/tags/${tagId}`,
      {
        method: "DELETE",
      },
    );
    return response.json();
  },
};

// Kanban API
export const kanbanApi = {
  // Get all boards
  getAllBoards: async (): Promise<KanbanBoard[]> => {
    // Return mock boards
    return [];
  },

  // Get board by ID
  getBoardById: async (id: number): Promise<KanbanBoard | undefined> => {
    const response = await fetch(`${API_BASE_URL}/boards/${id}`);
    return response.json();
  },

  // Create a new board
  createBoard: async (
    title: string,
  ): Promise<{ lastInsertRowid: number | bigint }> => {
    const response = await fetch(`${API_BASE_URL}/boards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });
    return response.json();
  },

  // Update a board
  updateBoard: async (
    id: number,
    updates: Partial<KanbanBoard>,
  ): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Delete a board
  deleteBoard: async (id: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Get all columns for a board
  getColumnsByBoardId: async (boardId: number): Promise<KanbanColumn[]> => {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns`);
    return response.json();
  },

  // Create a new column
  createColumn: async (
    boardId: number,
    title: string,
    position: number,
  ): Promise<{ lastInsertRowid: number | bigint }> => {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, position }),
    });
    return response.json();
  },

  // Update a column
  updateColumn: async (
    id: number,
    updates: Partial<KanbanColumn>,
  ): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/columns/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Delete a column
  deleteColumn: async (id: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/columns/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Get all cards for a column
  getCardsByColumnId: async (columnId: number): Promise<KanbanCard[]> => {
    const response = await fetch(
      `${API_BASE_URL}/boards/columns/${columnId}/cards`,
    );
    return response.json();
  },

  // Create a new card
  createCard: async (
    columnId: number,
    title: string,
    description?: string,
    position?: number,
  ): Promise<{ lastInsertRowid: number | bigint }> => {
    const response = await fetch(
      `${API_BASE_URL}/boards/columns/${columnId}/cards`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, position }),
      },
    );
    return response.json();
  },

  // Update a card
  updateCard: async (
    id: number,
    updates: Partial<KanbanCard>,
  ): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/cards/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Delete a card
  deleteCard: async (id: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/boards/cards/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Card tag operations
  getCardTags: async (cardId: number): Promise<Tag[]> => {
    const response = await fetch(`${API_BASE_URL}/boards/cards/${cardId}/tags`);
    return response.json();
  },

  addTagToCard: async (
    cardId: number,
    tagId: number,
  ): Promise<{ changes: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/boards/cards/${cardId}/tags/${tagId}`,
      {
        method: "POST",
      },
    );
    return response.json();
  },

  removeTagFromCard: async (
    cardId: number,
    tagId: number,
  ): Promise<{ changes: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/boards/cards/${cardId}/tags/${tagId}`,
      {
        method: "DELETE",
      },
    );
    return response.json();
  },
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
  getEventsByDateRange: async (
    startDate: string,
    endDate: string,
  ): Promise<CalendarEvent[]> => {
    const response = await fetch(
      `${API_BASE_URL}/events?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.json();
  },

  // Create a new event
  createEvent: async (
    title: string,
    description?: string,
    startTime?: string,
    endTime?: string,
    allDay?: boolean,
  ): Promise<{ lastInsertRowid: number | bigint }> => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description, startTime, endTime, allDay }),
    });
    return response.json();
  },

  // Update an event
  updateEvent: async (
    id: number,
    updates: Partial<CalendarEvent>,
  ): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Delete an event
  deleteEvent: async (id: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Get tags for an event
  getEventTags: async (eventId: number): Promise<Tag[]> => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/tags`);
    return response.json();
  },

  // Add a tag to an event
  addTagToEvent: async (
    eventId: number,
    tagId: number,
  ): Promise<{ changes: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/events/${eventId}/tags/${tagId}`,
      {
        method: "POST",
      },
    );
    return response.json();
  },

  // Remove a tag from an event
  removeTagFromEvent: async (
    eventId: number,
    tagId: number,
  ): Promise<{ changes: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/events/${eventId}/tags/${tagId}`,
      {
        method: "DELETE",
      },
    );
    return response.json();
  },
};

// Tag API
export const tagApi = {
  // Get all tags
  getAllTags: async (): Promise<Tag[]> => {
    // Return mock tags
    return [];
  },

  // Get tag by ID
  getTagById: async (id: number): Promise<Tag | undefined> => {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`);
    return response.json();
  },

  // Create a new tag
  createTag: async (
    name: string,
    color?: string,
  ): Promise<{ lastInsertRowid: number | bigint }> => {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, color }),
    });
    return response.json();
  },

  // Delete a tag
  deleteTag: async (id: number): Promise<{ changes: number }> => {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },
};

// Canvas API
export const canvasApi = {
  // Get all canvases
  getAllCanvases: async (): Promise<Canvas[]> => {
    try {
      return canvasService.getAllCanvases();
    } catch (error) {
      console.error("Error getting all canvases:", error);
      return [];
    }
  },

  // Get canvas by ID
  getCanvasById: async (id: string): Promise<Canvas | null> => {
    try {
      const canvas = await canvasService.getFullCanvasWithItems(id);
      return canvas || null;
    } catch (error) {
      console.error(`Error getting canvas with ID ${id}:`, error);
      return null;
    }
  },

  // Create a new canvas
  createCanvas: async (name: string, description?: string): Promise<Canvas> => {
    try {
      const id = `canvas-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      await canvasService.createCanvas(id, name, description);
      const canvas = canvasService.getCanvasById(id);
      if (!canvas) {
        throw new Error("Failed to create canvas");
      }
      return {
        ...canvas,
        items: [],
      } as any;
    } catch (error) {
      console.error("Error creating canvas:", error);
      throw error;
    }
  },

  // Update a canvas
  updateCanvas: async (canvas: Canvas): Promise<void> => {
    try {
      const { id, name, description } = canvas;
      await canvasService.updateCanvas(id, { name, description });
    } catch (error) {
      console.error(`Error updating canvas with ID ${canvas.id}:`, error);
      throw error;
    }
  },

  // Delete a canvas
  deleteCanvas: async (id: string): Promise<void> => {
    try {
      await canvasService.deleteCanvas(id);
    } catch (error) {
      console.error(`Error deleting canvas with ID ${id}:`, error);
      throw error;
    }
  },

  // Add an item to a canvas
  addItemToCanvas: async (
    canvasId: string,
    item: CanvasItemUnion,
  ): Promise<void> => {
    try {
      // Create the base canvas item
      const canvasItem: CanvasItem = {
        id: item.id,
        canvas_id: canvasId,
        type: item.type,
        title: item.title,
        position_x: item.position.x,
        position_y: item.position.y,
        width: item.size.width,
        height: item.size.height,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await canvasService.createCanvasItem(canvasItem);

      // Create the specific item type
      switch (item.type) {
        case "document":
          await canvasService.createDocumentCanvasItem(
            item.id,
            item.documentId,
          );
          break;
        case "url":
          await canvasService.createUrlCanvasItem(
            item.id,
            item.url,
            item.favicon,
            item.description,
            item.previewImage,
            item.extractedText,
          );
          break;
        case "task":
          await canvasService.createTaskCanvasItem(item.id, item.taskId);
          break;
        case "note":
          await canvasService.createNoteCanvasItem(item.id, item.noteId);
          break;
        case "event":
          await canvasService.createEventCanvasItem(item.id, item.eventId);
          break;
      }
    } catch (error) {
      console.error(`Error adding item to canvas ${canvasId}:`, error);
      throw error;
    }
  },

  // Remove an item from a canvas
  removeItemFromCanvas: async (
    canvasId: string,
    itemId: string,
  ): Promise<void> => {
    try {
      const item = await canvasService.getCanvasItemById(itemId);
      if (!item || item.canvas_id !== canvasId) {
        throw new Error(`Item ${itemId} not found in canvas ${canvasId}`);
      }

      // Delete the specific item type first
      switch (item.type) {
        case "document":
          await canvasService.deleteDocumentCanvasItem(itemId);
          break;
        case "url":
          await canvasService.deleteUrlCanvasItem(itemId);
          break;
        case "task":
          await canvasService.deleteTaskCanvasItem(itemId);
          break;
        case "note":
          await canvasService.deleteNoteCanvasItem(itemId);
          break;
        case "event":
          await canvasService.deleteEventCanvasItem(itemId);
          break;
      }

      // Then delete the base canvas item
      await canvasService.deleteCanvasItem(itemId);
    } catch (error) {
      console.error(
        `Error removing item ${itemId} from canvas ${canvasId}:`,
        error,
      );
      throw error;
    }
  },

  // Update a canvas item
  updateCanvasItem: async (
    canvasId: string,
    item: CanvasItemUnion,
  ): Promise<void> => {
    try {
      const existingItem = await canvasService.getCanvasItemById(item.id);
      if (!existingItem || existingItem.canvas_id !== canvasId) {
        throw new Error(`Item ${item.id} not found in canvas ${canvasId}`);
      }

      // Update the base canvas item
      await canvasService.updateCanvasItem(item.id, {
        title: item.title,
        position_x: item.position.x,
        position_y: item.position.y,
        width: item.size.width,
        height: item.size.height,
      });

      // Update the specific item type if needed
      if (item.type === "url") {
        await canvasService.updateUrlCanvasItem(item.id, {
          url: item.url,
          favicon: item.favicon,
          description: item.description,
          preview_image: item.previewImage,
          extracted_text: item.extractedText,
        });
      }
    } catch (error) {
      console.error(
        `Error updating item ${item.id} in canvas ${canvasId}:`,
        error,
      );
      throw error;
    }
  },
};

// Document API
export const documentApi = {
  // Process a document file
  processDocument: async (file: File): Promise<Document> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/documents/process`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to process document: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error processing document:", error);
      throw error;
    }
  },

  // Extract content from a URL
  extractUrlContent: async (
    url: string,
  ): Promise<{
    title: string;
    description: string;
    favicon?: string;
    previewImage?: string;
    extractedText?: string;
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/url/extract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to extract URL content: ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error extracting URL content:", error);
      throw error;
    }
  },
};

// TODO: Add webhook endpoint handlers for integrations (e.g., Slack, Google Calendar push notifications)
// TODO: Implement an event bus or queue to decouple integration event ingestion from task extraction/storage
