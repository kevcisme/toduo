import db from "./config";

// Create tables
const initializeDatabase = () => {
  // Tasks table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  ).run();

  // Notes table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  ).run();

  // Kanban boards table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS kanban_boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  ).run();

  // Kanban columns table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS kanban_columns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      position INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (board_id) REFERENCES kanban_boards(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Kanban cards table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS kanban_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      column_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      position INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (column_id) REFERENCES kanban_columns(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Calendar events table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      all_day BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  ).run();

  // Tags table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  ).run();

  // Task-Tag relationship table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS task_tags (
      task_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (task_id, tag_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Note-Tag relationship table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS note_tags (
      note_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (note_id, tag_id),
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Kanban card-Tag relationship table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS kanban_card_tags (
      card_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (card_id, tag_id),
      FOREIGN KEY (card_id) REFERENCES kanban_cards(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Calendar event-Tag relationship table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS calendar_event_tags (
      event_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (event_id, tag_id),
      FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Canvas table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS canvases (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  ).run();

  // Canvas items table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS canvas_items (
      id TEXT PRIMARY KEY,
      canvas_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      position_x INTEGER NOT NULL,
      position_y INTEGER NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (canvas_id) REFERENCES canvases(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Document canvas items table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS document_canvas_items (
      item_id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      FOREIGN KEY (item_id) REFERENCES canvas_items(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // URL canvas items table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS url_canvas_items (
      item_id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      favicon TEXT,
      description TEXT,
      preview_image TEXT,
      extracted_text TEXT,
      FOREIGN KEY (item_id) REFERENCES canvas_items(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Task canvas items table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS task_canvas_items (
      item_id TEXT PRIMARY KEY,
      task_id INTEGER NOT NULL,
      FOREIGN KEY (item_id) REFERENCES canvas_items(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Note canvas items table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS note_canvas_items (
      item_id TEXT PRIMARY KEY,
      note_id INTEGER NOT NULL,
      FOREIGN KEY (item_id) REFERENCES canvas_items(id) ON DELETE CASCADE,
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Event canvas items table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS event_canvas_items (
      item_id TEXT PRIMARY KEY,
      event_id INTEGER NOT NULL,
      FOREIGN KEY (item_id) REFERENCES canvas_items(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Canvas chat table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS canvas_chats (
      id TEXT PRIMARY KEY,
      canvas_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (canvas_id) REFERENCES canvases(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Canvas chat messages table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS canvas_chat_messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES canvas_chats(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Canvas chat references table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS canvas_chat_references (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      snippet TEXT NOT NULL,
      relevance_score REAL,
      FOREIGN KEY (message_id) REFERENCES canvas_chat_messages(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES canvas_items(id) ON DELETE CASCADE
    )
  `,
  ).run();
};

export { initializeDatabase };
