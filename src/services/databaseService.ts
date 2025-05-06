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
  canvasOperations,
  canvasItemOperations,
  documentCanvasItemOperations,
  urlCanvasItemOperations,
  taskCanvasItemOperations,
  noteCanvasItemOperations,
  eventCanvasItemOperations,
  canvasChatOperations,
  canvasChatMessageOperations,
  canvasChatReferenceOperations,
  Task,
  Note,
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  CalendarEvent,
  Tag,
  Canvas,
  CanvasItem,
  DocumentCanvasItem,
  UrlCanvasItem,
  TaskCanvasItem,
  NoteCanvasItem,
  EventCanvasItem,
  CanvasChat,
  CanvasChatMessage,
  CanvasChatReference,
} from "../db/models";
import {
  indexNote,
  deleteNoteEmbedding,
  reindexAllNotes,
} from "./embeddingService";

// TODO: Improve offline conflict resolution for cloud sync
// TODO: Add data export/import functionality
// TODO: Implement end-to-end encryption for cloud data
// TODO: Update database operations to support storing integration/source metadata with tasks
// TODO: Sync integration connection state and tokens with local database
// TODO: Implement caching for canvas items to improve performance

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
  },
};

// Note service
export const noteService = {
  createNote: async (title: string, content?: string) => {
    const result = noteOperations.create(title, content);
    // Get the newly created note to index it
    if (result.lastInsertRowid) {
      const newNote = noteOperations.getById(result.lastInsertRowid as number);
      if (newNote) {
        await indexNote(newNote);
      }
    }
    return result;
  },

  getAllNotes: () => {
    return noteOperations.getAll();
  },

  getNoteById: (id: number) => {
    return noteOperations.getById(id);
  },

  updateNote: async (id: number, updates: Partial<Note>) => {
    const result = noteOperations.update(id, updates);
    // Get the updated note to reindex it
    const updatedNote = noteOperations.getById(id);
    if (updatedNote) {
      await indexNote(updatedNote);
    }
    return result;
  },

  deleteNote: (id: number) => {
    const result = noteOperations.delete(id);
    // Delete the note's embedding
    deleteNoteEmbedding(id.toString());
    return result;
  },

  getNoteTags: (noteId: number) => {
    return noteTagOperations.getNoteTags(noteId);
  },

  addTagToNote: (noteId: number, tagId: number) => {
    return noteTagOperations.addTagToNote(noteId, tagId);
  },

  removeTagFromNote: (noteId: number, tagId: number) => {
    return noteTagOperations.removeTagFromNote(noteId, tagId);
  },

  // New method for semantic search
  reindexAllNotes: async () => {
    const notes = noteOperations.getAll();
    await reindexAllNotes(notes);
    return notes.length;
  },
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
  createCard: (
    columnId: number,
    title: string,
    description: string | undefined,
    position: number,
  ) => {
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
  },
};

// Calendar service
export const calendarService = {
  createEvent: (
    title: string,
    description: string | undefined,
    startTime: string,
    endTime: string,
    allDay: boolean,
  ) => {
    return calendarEventOperations.create(
      title,
      description,
      startTime,
      endTime,
      allDay,
    );
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
  },
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
  },
};

// Canvas service
export const canvasService = {
  // Canvas operations
  createCanvas: (id: string, name: string, description?: string) => {
    return canvasOperations.create(id, name, description);
  },

  getAllCanvases: () => {
    return canvasOperations.getAll();
  },

  getCanvasById: (id: string) => {
    return canvasOperations.getById(id);
  },

  updateCanvas: (id: string, updates: Partial<Canvas>) => {
    return canvasOperations.update(id, updates);
  },

  deleteCanvas: (id: string) => {
    return canvasOperations.delete(id);
  },

  // Canvas item operations
  createCanvasItem: (item: CanvasItem) => {
    return canvasItemOperations.create(item);
  },

  getCanvasItemsByCanvasId: (canvasId: string) => {
    return canvasItemOperations.getByCanvasId(canvasId);
  },

  getCanvasItemById: (id: string) => {
    return canvasItemOperations.getById(id);
  },

  updateCanvasItem: (id: string, updates: Partial<CanvasItem>) => {
    return canvasItemOperations.update(id, updates);
  },

  deleteCanvasItem: (id: string) => {
    return canvasItemOperations.delete(id);
  },

  // Document canvas item operations
  createDocumentCanvasItem: (itemId: string, documentId: string) => {
    return documentCanvasItemOperations.create(itemId, documentId);
  },

  getDocumentCanvasItemByItemId: (itemId: string) => {
    return documentCanvasItemOperations.getByItemId(itemId);
  },

  deleteDocumentCanvasItem: (itemId: string) => {
    return documentCanvasItemOperations.delete(itemId);
  },

  // URL canvas item operations
  createUrlCanvasItem: (
    itemId: string,
    url: string,
    favicon?: string,
    description?: string,
    previewImage?: string,
    extractedText?: string,
  ) => {
    return urlCanvasItemOperations.create(
      itemId,
      url,
      favicon,
      description,
      previewImage,
      extractedText,
    );
  },

  getUrlCanvasItemByItemId: (itemId: string) => {
    return urlCanvasItemOperations.getByItemId(itemId);
  },

  updateUrlCanvasItem: (itemId: string, updates: Partial<UrlCanvasItem>) => {
    return urlCanvasItemOperations.update(itemId, updates);
  },

  deleteUrlCanvasItem: (itemId: string) => {
    return urlCanvasItemOperations.delete(itemId);
  },

  // Task canvas item operations
  createTaskCanvasItem: (itemId: string, taskId: number) => {
    return taskCanvasItemOperations.create(itemId, taskId);
  },

  getTaskCanvasItemByItemId: (itemId: string) => {
    return taskCanvasItemOperations.getByItemId(itemId);
  },

  deleteTaskCanvasItem: (itemId: string) => {
    return taskCanvasItemOperations.delete(itemId);
  },

  // Note canvas item operations
  createNoteCanvasItem: (itemId: string, noteId: number) => {
    return noteCanvasItemOperations.create(itemId, noteId);
  },

  getNoteCanvasItemByItemId: (itemId: string) => {
    return noteCanvasItemOperations.getByItemId(itemId);
  },

  deleteNoteCanvasItem: (itemId: string) => {
    return noteCanvasItemOperations.delete(itemId);
  },

  // Event canvas item operations
  createEventCanvasItem: (itemId: string, eventId: number) => {
    return eventCanvasItemOperations.create(itemId, eventId);
  },

  getEventCanvasItemByItemId: (itemId: string) => {
    return eventCanvasItemOperations.getByItemId(itemId);
  },

  deleteEventCanvasItem: (itemId: string) => {
    return eventCanvasItemOperations.delete(itemId);
  },

  // Canvas chat operations
  createCanvasChat: (id: string, canvasId: string) => {
    return canvasChatOperations.create(id, canvasId);
  },

  getCanvasChatByCanvasId: (canvasId: string) => {
    return canvasChatOperations.getByCanvasId(canvasId);
  },

  deleteCanvasChat: (id: string) => {
    return canvasChatOperations.delete(id);
  },

  // Canvas chat message operations
  createCanvasChatMessage: (
    id: string,
    chatId: string,
    role: "user" | "assistant",
    content: string,
  ) => {
    return canvasChatMessageOperations.create(id, chatId, role, content);
  },

  getCanvasChatMessagesByChatId: (chatId: string) => {
    return canvasChatMessageOperations.getByChatId(chatId);
  },

  deleteCanvasChatMessage: (id: string) => {
    return canvasChatMessageOperations.delete(id);
  },

  // Canvas chat reference operations
  createCanvasChatReference: (
    id: string,
    messageId: string,
    itemId: string,
    snippet: string,
    relevanceScore?: number,
  ) => {
    return canvasChatReferenceOperations.create(
      id,
      messageId,
      itemId,
      snippet,
      relevanceScore,
    );
  },

  getCanvasChatReferencesByMessageId: (messageId: string) => {
    return canvasChatReferenceOperations.getByMessageId(messageId);
  },

  deleteCanvasChatReference: (id: string) => {
    return canvasChatReferenceOperations.delete(id);
  },

  // Helper methods for working with canvas items
  getFullCanvasWithItems: async (canvasId: string) => {
    const canvas = canvasOperations.getById(canvasId);
    if (!canvas) return null;

    const canvasItems = canvasItemOperations.getByCanvasId(canvasId);
    const fullItems = [];

    for (const item of canvasItems) {
      let fullItem: any = {
        ...item,
        position: { x: item.position_x, y: item.position_y },
        size: { width: item.width, height: item.height },
      };

      switch (item.type) {
        case "document": {
          const docItem = documentCanvasItemOperations.getByItemId(item.id);
          if (docItem) {
            fullItem.documentId = docItem.document_id;
          }
          break;
        }
        case "url": {
          const urlItem = urlCanvasItemOperations.getByItemId(item.id);
          if (urlItem) {
            fullItem = { ...fullItem, ...urlItem };
          }
          break;
        }
        case "task": {
          const taskItem = taskCanvasItemOperations.getByItemId(item.id);
          if (taskItem) {
            fullItem.taskId = taskItem.task_id;
            const task = taskOperations.getById(taskItem.task_id);
            if (task) fullItem.task = task;
          }
          break;
        }
        case "note": {
          const noteItem = noteCanvasItemOperations.getByItemId(item.id);
          if (noteItem) {
            fullItem.noteId = noteItem.note_id;
            const note = noteOperations.getById(noteItem.note_id);
            if (note) fullItem.note = note;
          }
          break;
        }
        case "event": {
          const eventItem = eventCanvasItemOperations.getByItemId(item.id);
          if (eventItem) {
            fullItem.eventId = eventItem.event_id;
            const event = calendarEventOperations.getById(eventItem.event_id);
            if (event) fullItem.event = event;
          }
          break;
        }
      }

      fullItems.push(fullItem);
    }

    return {
      ...canvas,
      items: fullItems,
    };
  },
};
