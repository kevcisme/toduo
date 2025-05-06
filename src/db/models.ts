import db from './config';

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
    const stmt = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
    return stmt.all() as Task[];
  },

  getById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id) as Task | undefined;
  },

  update: (id: number, updates: Partial<Task>) => {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);
    
    const stmt = db.prepare(`
      UPDATE tasks 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    return stmt.run(id);
  }
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
    const stmt = db.prepare('SELECT * FROM notes ORDER BY updated_at DESC');
    return stmt.all() as Note[];
  },

  getById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    return stmt.get(id) as Note | undefined;
  },

  update: (id: number, updates: Partial<Note>) => {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);
    
    const stmt = db.prepare(`
      UPDATE notes 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    return stmt.run(id);
  }
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
    const stmt = db.prepare('SELECT * FROM kanban_boards ORDER BY created_at DESC');
    return stmt.all() as KanbanBoard[];
  },

  getById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM kanban_boards WHERE id = ?');
    return stmt.get(id) as KanbanBoard | undefined;
  },

  update: (id: number, updates: Partial<KanbanBoard>) => {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);
    
    const stmt = db.prepare(`
      UPDATE kanban_boards 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM kanban_boards WHERE id = ?');
    return stmt.run(id);
  }
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
    const stmt = db.prepare('SELECT * FROM kanban_columns WHERE board_id = ? ORDER BY position');
    return stmt.all(boardId) as KanbanColumn[];
  },

  update: (id: number, updates: Partial<KanbanColumn>) => {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);
    
    const stmt = db.prepare(`
      UPDATE kanban_columns 
      SET ${fields}
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM kanban_columns WHERE id = ?');
    return stmt.run(id);
  }
};

// Kanban card operations
export const kanbanCardOperations = {
  create: (columnId: number, title: string, description: string | undefined, position: number) => {
    const stmt = db.prepare(`
      INSERT INTO kanban_cards (column_id, title, description, position)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(columnId, title, description, position);
  },

  getByColumnId: (columnId: number) => {
    const stmt = db.prepare('SELECT * FROM kanban_cards WHERE column_id = ? ORDER BY position');
    return stmt.all(columnId) as KanbanCard[];
  },

  update: (id: number, updates: Partial<KanbanCard>) => {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);
    
    const stmt = db.prepare(`
      UPDATE kanban_cards 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM kanban_cards WHERE id = ?');
    return stmt.run(id);
  }
};

// Calendar event operations
export const calendarEventOperations = {
  create: (title: string, description: string | undefined, startTime: string, endTime: string, allDay: boolean) => {
    const stmt = db.prepare(`
      INSERT INTO calendar_events (title, description, start_time, end_time, all_day)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(title, description, startTime, endTime, allDay);
  },

  getAll: () => {
    const stmt = db.prepare('SELECT * FROM calendar_events ORDER BY start_time');
    return stmt.all() as CalendarEvent[];
  },

  getById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM calendar_events WHERE id = ?');
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
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);
    
    const stmt = db.prepare(`
      UPDATE calendar_events 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM calendar_events WHERE id = ?');
    return stmt.run(id);
  }
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
    const stmt = db.prepare('SELECT * FROM tags ORDER BY name');
    return stmt.all() as Tag[];
  },

  getById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM tags WHERE id = ?');
    return stmt.get(id) as Tag | undefined;
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM tags WHERE id = ?');
    return stmt.run(id);
  }
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
  }
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
  }
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
  }
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
  }
};

// TODO: Add models and operations for managing integration connections and tokens 