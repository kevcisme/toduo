import db from "./config";

// Types
export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  // TODO: Extend Task model to include source/integration metadata (e.g., source type, source ID, integration name)
}

export interface Note {
  id: number;
  title: string;
  content?: string;
  created_at: string;
  updated_at: string;
}

export interface KanbanBoard {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface KanbanColumn {
  id: number;
  board_id: number;
  title: string;
  position: number;
  created_at: string;
}

export interface KanbanCard {
  id: number;
  column_id: number;
  title: string;
  description?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  created_at: string;
}

// Canvas Types
export interface Canvas {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CanvasItem {
  id: string;
  canvas_id: string;
  type: "document" | "url" | "task" | "note" | "event";
  title: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentCanvasItem {
  item_id: string;
  document_id: string;
}

export interface UrlCanvasItem {
  item_id: string;
  url: string;
  favicon?: string;
  description?: string;
  preview_image?: string;
  extracted_text?: string;
}

export interface TaskCanvasItem {
  item_id: string;
  task_id: number;
}

export interface NoteCanvasItem {
  item_id: string;
  note_id: number;
}

export interface EventCanvasItem {
  item_id: string;
  event_id: number;
}

export interface CanvasChat {
  id: string;
  canvas_id: string;
  created_at: string;
  updated_at: string;
}

export interface CanvasChatMessage {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface CanvasChatReference {
  id: string;
  message_id: string;
  item_id: string;
  snippet: string;
  relevance_score?: number;
}

// Task operations
export const taskOperations = {
  create: (title: string, description?: string) => {
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description)
      VALUES (?, ?)
    `);
    return stmt.run(title, description);
  },

  getAll: () => {
    const stmt = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC");
    return stmt.all() as Task[];
  },

  getById: (id: number) => {
    const stmt = db.prepare("SELECT * FROM tasks WHERE id = ?");
    return stmt.get(id) as Task | undefined;
  },

  update: (id: number, updates: Partial<Task>) => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    const stmt = db.prepare(`
      UPDATE tasks 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM tasks WHERE id = ?");
    return stmt.run(id);
  },
};

// Note operations
export const noteOperations = {
  create: (title: string, content?: string) => {
    const stmt = db.prepare(`
      INSERT INTO notes (title, content)
      VALUES (?, ?)
    `);
    return stmt.run(title, content);
  },

  getAll: () => {
    const stmt = db.prepare("SELECT * FROM notes ORDER BY updated_at DESC");
    return stmt.all() as Note[];
  },

  getById: (id: number) => {
    const stmt = db.prepare("SELECT * FROM notes WHERE id = ?");
    return stmt.get(id) as Note | undefined;
  },

  update: (id: number, updates: Partial<Note>) => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    const stmt = db.prepare(`
      UPDATE notes 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM notes WHERE id = ?");
    return stmt.run(id);
  },
};

// Kanban board operations
export const kanbanBoardOperations = {
  create: (title: string) => {
    const stmt = db.prepare(`
      INSERT INTO kanban_boards (title)
      VALUES (?)
    `);
    return stmt.run(title);
  },

  getAll: () => {
    const stmt = db.prepare(
      "SELECT * FROM kanban_boards ORDER BY created_at DESC",
    );
    return stmt.all() as KanbanBoard[];
  },

  getById: (id: number) => {
    const stmt = db.prepare("SELECT * FROM kanban_boards WHERE id = ?");
    return stmt.get(id) as KanbanBoard | undefined;
  },

  update: (id: number, updates: Partial<KanbanBoard>) => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    const stmt = db.prepare(`
      UPDATE kanban_boards 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM kanban_boards WHERE id = ?");
    return stmt.run(id);
  },
};

// Kanban column operations
export const kanbanColumnOperations = {
  create: (boardId: number, title: string, position: number) => {
    const stmt = db.prepare(`
      INSERT INTO kanban_columns (board_id, title, position)
      VALUES (?, ?, ?)
    `);
    return stmt.run(boardId, title, position);
  },

  getByBoardId: (boardId: number) => {
    const stmt = db.prepare(
      "SELECT * FROM kanban_columns WHERE board_id = ? ORDER BY position",
    );
    return stmt.all(boardId) as KanbanColumn[];
  },

  update: (id: number, updates: Partial<KanbanColumn>) => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    const stmt = db.prepare(`
      UPDATE kanban_columns 
      SET ${fields}
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM kanban_columns WHERE id = ?");
    return stmt.run(id);
  },
};

// Kanban card operations
export const kanbanCardOperations = {
  create: (
    columnId: number,
    title: string,
    description: string | undefined,
    position: number,
  ) => {
    const stmt = db.prepare(`
      INSERT INTO kanban_cards (column_id, title, description, position)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(columnId, title, description, position);
  },

  getByColumnId: (columnId: number) => {
    const stmt = db.prepare(
      "SELECT * FROM kanban_cards WHERE column_id = ? ORDER BY position",
    );
    return stmt.all(columnId) as KanbanCard[];
  },

  update: (id: number, updates: Partial<KanbanCard>) => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    const stmt = db.prepare(`
      UPDATE kanban_cards 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM kanban_cards WHERE id = ?");
    return stmt.run(id);
  },
};

// Calendar event operations
export const calendarEventOperations = {
  create: (
    title: string,
    description: string | undefined,
    startTime: string,
    endTime: string,
    allDay: boolean,
  ) => {
    const stmt = db.prepare(`
      INSERT INTO calendar_events (title, description, start_time, end_time, all_day)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(title, description, startTime, endTime, allDay);
  },

  getAll: () => {
    const stmt = db.prepare(
      "SELECT * FROM calendar_events ORDER BY start_time",
    );
    return stmt.all() as CalendarEvent[];
  },

  getById: (id: number) => {
    const stmt = db.prepare("SELECT * FROM calendar_events WHERE id = ?");
    return stmt.get(id) as CalendarEvent | undefined;
  },

  getByDateRange: (startDate: string, endDate: string) => {
    const stmt = db.prepare(`
      SELECT * FROM calendar_events 
      WHERE start_time >= ? AND end_time <= ?
      ORDER BY start_time
    `);
    return stmt.all(startDate, endDate) as CalendarEvent[];
  },

  update: (id: number, updates: Partial<CalendarEvent>) => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    const stmt = db.prepare(`
      UPDATE calendar_events 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM calendar_events WHERE id = ?");
    return stmt.run(id);
  },
};

// Tag operations
export const tagOperations = {
  create: (name: string, color?: string) => {
    const stmt = db.prepare(`
      INSERT INTO tags (name, color)
      VALUES (?, ?)
    `);
    return stmt.run(name, color);
  },

  getAll: () => {
    const stmt = db.prepare("SELECT * FROM tags ORDER BY name");
    return stmt.all() as Tag[];
  },

  getById: (id: number) => {
    const stmt = db.prepare("SELECT * FROM tags WHERE id = ?");
    return stmt.get(id) as Tag | undefined;
  },

  delete: (id: number) => {
    const stmt = db.prepare("DELETE FROM tags WHERE id = ?");
    return stmt.run(id);
  },
};

// Task-Tag relationship operations
export const taskTagOperations = {
  addTagToTask: (taskId: number, tagId: number) => {
    const stmt = db.prepare(`
      INSERT INTO task_tags (task_id, tag_id)
      VALUES (?, ?)
    `);
    return stmt.run(taskId, tagId);
  },

  removeTagFromTask: (taskId: number, tagId: number) => {
    const stmt = db.prepare(`
      DELETE FROM task_tags
      WHERE task_id = ? AND tag_id = ?
    `);
    return stmt.run(taskId, tagId);
  },

  getTaskTags: (taskId: number) => {
    const stmt = db.prepare(`
      SELECT t.* FROM tags t
      JOIN task_tags tt ON t.id = tt.tag_id
      WHERE tt.task_id = ?
    `);
    return stmt.all(taskId) as Tag[];
  },
};

// Note-Tag relationship operations
export const noteTagOperations = {
  addTagToNote: (noteId: number, tagId: number) => {
    const stmt = db.prepare(`
      INSERT INTO note_tags (note_id, tag_id)
      VALUES (?, ?)
    `);
    return stmt.run(noteId, tagId);
  },

  removeTagFromNote: (noteId: number, tagId: number) => {
    const stmt = db.prepare(`
      DELETE FROM note_tags
      WHERE note_id = ? AND tag_id = ?
    `);
    return stmt.run(noteId, tagId);
  },

  getNoteTags: (noteId: number) => {
    const stmt = db.prepare(`
      SELECT t.* FROM tags t
      JOIN note_tags nt ON t.id = nt.tag_id
      WHERE nt.note_id = ?
    `);
    return stmt.all(noteId) as Tag[];
  },
};

// Kanban card-Tag relationship operations
export const kanbanCardTagOperations = {
  addTagToCard: (cardId: number, tagId: number) => {
    const stmt = db.prepare(`
      INSERT INTO kanban_card_tags (card_id, tag_id)
      VALUES (?, ?)
    `);
    return stmt.run(cardId, tagId);
  },

  removeTagFromCard: (cardId: number, tagId: number) => {
    const stmt = db.prepare(`
      DELETE FROM kanban_card_tags
      WHERE card_id = ? AND tag_id = ?
    `);
    return stmt.run(cardId, tagId);
  },

  getCardTags: (cardId: number) => {
    const stmt = db.prepare(`
      SELECT t.* FROM tags t
      JOIN kanban_card_tags ct ON t.id = ct.tag_id
      WHERE ct.card_id = ?
    `);
    return stmt.all(cardId) as Tag[];
  },
};

// Calendar event-Tag relationship operations
export const calendarEventTagOperations = {
  addTagToEvent: (eventId: number, tagId: number) => {
    const stmt = db.prepare(`
      INSERT INTO calendar_event_tags (event_id, tag_id)
      VALUES (?, ?)
    `);
    return stmt.run(eventId, tagId);
  },

  removeTagFromEvent: (eventId: number, tagId: number) => {
    const stmt = db.prepare(`
      DELETE FROM calendar_event_tags
      WHERE event_id = ? AND tag_id = ?
    `);
    return stmt.run(eventId, tagId);
  },

  getEventTags: (eventId: number) => {
    const stmt = db.prepare(`
      SELECT t.* FROM tags t
      JOIN calendar_event_tags et ON t.id = et.tag_id
      WHERE et.event_id = ?
    `);
    return stmt.all(eventId) as Tag[];
  },
};

// Canvas operations
export const canvasOperations = {
  create: (id: string, name: string, description?: string) => {
    const stmt = db.prepare(`
      INSERT INTO canvases (id, name, description)
      VALUES (?, ?, ?)
    `);
    return stmt.run(id, name, description);
  },

  getAll: () => {
    const stmt = db.prepare("SELECT * FROM canvases ORDER BY created_at DESC");
    return stmt.all() as Canvas[];
  },

  getById: (id: string) => {
    const stmt = db.prepare("SELECT * FROM canvases WHERE id = ?");
    return stmt.get(id) as Canvas | undefined;
  },

  update: (id: string, updates: Partial<Canvas>) => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    const stmt = db.prepare(`
      UPDATE canvases 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: string) => {
    const stmt = db.prepare("DELETE FROM canvases WHERE id = ?");
    return stmt.run(id);
  },
};

// Canvas item operations
export const canvasItemOperations = {
  create: (item: CanvasItem) => {
    const stmt = db.prepare(`
      INSERT INTO canvas_items (id, canvas_id, type, title, position_x, position_y, width, height)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      item.id,
      item.canvas_id,
      item.type,
      item.title,
      item.position_x,
      item.position_y,
      item.width,
      item.height,
    );
  },

  getByCanvasId: (canvasId: string) => {
    const stmt = db.prepare(
      "SELECT * FROM canvas_items WHERE canvas_id = ? ORDER BY created_at DESC",
    );
    return stmt.all(canvasId) as CanvasItem[];
  },

  getById: (id: string) => {
    const stmt = db.prepare("SELECT * FROM canvas_items WHERE id = ?");
    return stmt.get(id) as CanvasItem | undefined;
  },

  update: (id: string, updates: Partial<CanvasItem>) => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    const stmt = db.prepare(`
      UPDATE canvas_items 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: string) => {
    const stmt = db.prepare("DELETE FROM canvas_items WHERE id = ?");
    return stmt.run(id);
  },
};

// Document canvas item operations
export const documentCanvasItemOperations = {
  create: (itemId: string, documentId: string) => {
    const stmt = db.prepare(`
      INSERT INTO document_canvas_items (item_id, document_id)
      VALUES (?, ?)
    `);
    return stmt.run(itemId, documentId);
  },

  getByItemId: (itemId: string) => {
    const stmt = db.prepare(
      "SELECT * FROM document_canvas_items WHERE item_id = ?",
    );
    return stmt.get(itemId) as DocumentCanvasItem | undefined;
  },

  delete: (itemId: string) => {
    const stmt = db.prepare(
      "DELETE FROM document_canvas_items WHERE item_id = ?",
    );
    return stmt.run(itemId);
  },
};

// URL canvas item operations
export const urlCanvasItemOperations = {
  create: (
    itemId: string,
    url: string,
    favicon?: string,
    description?: string,
    previewImage?: string,
    extractedText?: string,
  ) => {
    const stmt = db.prepare(`
      INSERT INTO url_canvas_items (item_id, url, favicon, description, preview_image, extracted_text)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      itemId,
      url,
      favicon,
      description,
      previewImage,
      extractedText,
    );
  },

  getByItemId: (itemId: string) => {
    const stmt = db.prepare("SELECT * FROM url_canvas_items WHERE item_id = ?");
    return stmt.get(itemId) as UrlCanvasItem | undefined;
  },

  update: (itemId: string, updates: Partial<UrlCanvasItem>) => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    const stmt = db.prepare(`
      UPDATE url_canvas_items 
      SET ${fields}
      WHERE item_id = ?
    `);
    return stmt.run(...values, itemId);
  },

  delete: (itemId: string) => {
    const stmt = db.prepare("DELETE FROM url_canvas_items WHERE item_id = ?");
    return stmt.run(itemId);
  },
};

// Task canvas item operations
export const taskCanvasItemOperations = {
  create: (itemId: string, taskId: number) => {
    const stmt = db.prepare(`
      INSERT INTO task_canvas_items (item_id, task_id)
      VALUES (?, ?)
    `);
    return stmt.run(itemId, taskId);
  },

  getByItemId: (itemId: string) => {
    const stmt = db.prepare(
      "SELECT * FROM task_canvas_items WHERE item_id = ?",
    );
    return stmt.get(itemId) as TaskCanvasItem | undefined;
  },

  delete: (itemId: string) => {
    const stmt = db.prepare("DELETE FROM task_canvas_items WHERE item_id = ?");
    return stmt.run(itemId);
  },
};

// Note canvas item operations
export const noteCanvasItemOperations = {
  create: (itemId: string, noteId: number) => {
    const stmt = db.prepare(`
      INSERT INTO note_canvas_items (item_id, note_id)
      VALUES (?, ?)
    `);
    return stmt.run(itemId, noteId);
  },

  getByItemId: (itemId: string) => {
    const stmt = db.prepare(
      "SELECT * FROM note_canvas_items WHERE item_id = ?",
    );
    return stmt.get(itemId) as NoteCanvasItem | undefined;
  },

  delete: (itemId: string) => {
    const stmt = db.prepare("DELETE FROM note_canvas_items WHERE item_id = ?");
    return stmt.run(itemId);
  },
};

// Event canvas item operations
export const eventCanvasItemOperations = {
  create: (itemId: string, eventId: number) => {
    const stmt = db.prepare(`
      INSERT INTO event_canvas_items (item_id, event_id)
      VALUES (?, ?)
    `);
    return stmt.run(itemId, eventId);
  },

  getByItemId: (itemId: string) => {
    const stmt = db.prepare(
      "SELECT * FROM event_canvas_items WHERE item_id = ?",
    );
    return stmt.get(itemId) as EventCanvasItem | undefined;
  },

  delete: (itemId: string) => {
    const stmt = db.prepare("DELETE FROM event_canvas_items WHERE item_id = ?");
    return stmt.run(itemId);
  },
};

// Canvas chat operations
export const canvasChatOperations = {
  create: (id: string, canvasId: string) => {
    const stmt = db.prepare(`
      INSERT INTO canvas_chats (id, canvas_id)
      VALUES (?, ?)
    `);
    return stmt.run(id, canvasId);
  },

  getByCanvasId: (canvasId: string) => {
    const stmt = db.prepare("SELECT * FROM canvas_chats WHERE canvas_id = ?");
    return stmt.get(canvasId) as CanvasChat | undefined;
  },

  delete: (id: string) => {
    const stmt = db.prepare("DELETE FROM canvas_chats WHERE id = ?");
    return stmt.run(id);
  },
};

// Canvas chat message operations
export const canvasChatMessageOperations = {
  create: (
    id: string,
    chatId: string,
    role: "user" | "assistant",
    content: string,
  ) => {
    const stmt = db.prepare(`
      INSERT INTO canvas_chat_messages (id, chat_id, role, content)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(id, chatId, role, content);
  },

  getByChatId: (chatId: string) => {
    const stmt = db.prepare(
      "SELECT * FROM canvas_chat_messages WHERE chat_id = ? ORDER BY timestamp ASC",
    );
    return stmt.all(chatId) as CanvasChatMessage[];
  },

  delete: (id: string) => {
    const stmt = db.prepare("DELETE FROM canvas_chat_messages WHERE id = ?");
    return stmt.run(id);
  },
};

// Canvas chat reference operations
export const canvasChatReferenceOperations = {
  create: (
    id: string,
    messageId: string,
    itemId: string,
    snippet: string,
    relevanceScore?: number,
  ) => {
    const stmt = db.prepare(`
      INSERT INTO canvas_chat_references (id, message_id, item_id, snippet, relevance_score)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(id, messageId, itemId, snippet, relevanceScore);
  },

  getByMessageId: (messageId: string) => {
    const stmt = db.prepare(
      "SELECT * FROM canvas_chat_references WHERE message_id = ? ORDER BY relevance_score DESC",
    );
    return stmt.all(messageId) as CanvasChatReference[];
  },

  delete: (id: string) => {
    const stmt = db.prepare("DELETE FROM canvas_chat_references WHERE id = ?");
    return stmt.run(id);
  },
};

// TODO: Add models and operations for managing integration connections and tokens
