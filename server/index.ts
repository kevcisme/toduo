import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

// In-memory data store
const dataStore = {
  tasks: [
    { id: 1, title: 'Complete project proposal', description: 'Write a detailed proposal for the new project', completed: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, title: 'Schedule team meeting', description: 'Set up a meeting with the development team', completed: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  notes: [
    { id: 1, title: 'Meeting notes', content: 'Key points from the team meeting', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, title: 'Project ideas', content: 'List of potential project ideas', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  boards: [
    { id: 1, title: 'Project Board', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  columns: [
    { id: 1, board_id: 1, title: 'To Do', position: 0, created_at: new Date().toISOString() },
    { id: 2, board_id: 1, title: 'In Progress', position: 1, created_at: new Date().toISOString() },
    { id: 3, board_id: 1, title: 'Done', position: 2, created_at: new Date().toISOString() },
  ],
  cards: [
    { id: 1, column_id: 1, title: 'Create wireframes', description: 'Design wireframes for the new feature', position: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, column_id: 2, title: 'Implement authentication', description: 'Add user authentication to the app', position: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, column_id: 3, title: 'Set up project repository', description: 'Initialize Git repository and set up CI/CD', position: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  tags: [
    { id: 1, name: 'Frontend', color: '#3498db', created_at: new Date().toISOString() },
    { id: 2, name: 'Backend', color: '#e74c3c', created_at: new Date().toISOString() },
    { id: 3, name: 'Design', color: '#2ecc71', created_at: new Date().toISOString() },
  ],
};

// Middleware
app.use(cors());
app.use(express.json());

// Task routes
app.get('/api/tasks', (req, res) => {
  res.json(dataStore.tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;
  const newTask = {
    id: dataStore.tasks.length + 1,
    title,
    description,
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  dataStore.tasks.push(newTask);
  res.json({ lastInsertRowid: newTask.id });
});

app.get('/api/tasks/:id', (req, res) => {
  const task = dataStore.tasks.find(t => t.id === parseInt(req.params.id));
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = dataStore.tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    dataStore.tasks[taskIndex] = {
      ...dataStore.tasks[taskIndex],
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    res.json({ changes: 1 });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = dataStore.tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    dataStore.tasks.splice(taskIndex, 1);
    res.json({ changes: 1 });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Note routes
app.get('/api/notes', (req, res) => {
  res.json(dataStore.notes);
});

app.post('/api/notes', (req, res) => {
  const { title, content } = req.body;
  const newNote = {
    id: dataStore.notes.length + 1,
    title,
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  dataStore.notes.push(newNote);
  res.json({ lastInsertRowid: newNote.id });
});

app.get('/api/notes/:id', (req, res) => {
  const note = dataStore.notes.find(n => n.id === parseInt(req.params.id));
  if (note) {
    res.json(note);
  } else {
    res.status(404).json({ error: 'Note not found' });
  }
});

app.put('/api/notes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const noteIndex = dataStore.notes.findIndex(n => n.id === id);
  if (noteIndex !== -1) {
    dataStore.notes[noteIndex] = {
      ...dataStore.notes[noteIndex],
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    res.json({ changes: 1 });
  } else {
    res.status(404).json({ error: 'Note not found' });
  }
});

app.delete('/api/notes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const noteIndex = dataStore.notes.findIndex(n => n.id === id);
  if (noteIndex !== -1) {
    dataStore.notes.splice(noteIndex, 1);
    res.json({ changes: 1 });
  } else {
    res.status(404).json({ error: 'Note not found' });
  }
});

// Board routes
app.get('/api/boards', (req, res) => {
  res.json(dataStore.boards);
});

app.get('/api/boards/:id', (req, res) => {
  const board = dataStore.boards.find(b => b.id === parseInt(req.params.id));
  if (board) {
    res.json(board);
  } else {
    res.status(404).json({ error: 'Board not found' });
  }
});

app.post('/api/boards', (req, res) => {
  const { title } = req.body;
  const newBoard = {
    id: dataStore.boards.length + 1,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  dataStore.boards.push(newBoard);
  res.json({ lastInsertRowid: newBoard.id });
});

app.put('/api/boards/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const boardIndex = dataStore.boards.findIndex(b => b.id === id);
  if (boardIndex !== -1) {
    dataStore.boards[boardIndex] = {
      ...dataStore.boards[boardIndex],
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    res.json({ changes: 1 });
  } else {
    res.status(404).json({ error: 'Board not found' });
  }
});

app.delete('/api/boards/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const boardIndex = dataStore.boards.findIndex(b => b.id === id);
  if (boardIndex !== -1) {
    dataStore.boards.splice(boardIndex, 1);
    res.json({ changes: 1 });
  } else {
    res.status(404).json({ error: 'Board not found' });
  }
});

// Column routes
app.get('/api/boards/:boardId/columns', (req, res) => {
  const boardId = parseInt(req.params.boardId);
  const columns = dataStore.columns.filter(c => c.board_id === boardId);
  res.json(columns);
});

app.post('/api/boards/:boardId/columns', (req, res) => {
  const boardId = parseInt(req.params.boardId);
  const { title, position } = req.body;
  const newColumn = {
    id: dataStore.columns.length + 1,
    board_id: boardId,
    title,
    position,
    created_at: new Date().toISOString(),
  };
  dataStore.columns.push(newColumn);
  res.json({ lastInsertRowid: newColumn.id });
});

app.put('/api/boards/columns/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const columnIndex = dataStore.columns.findIndex(c => c.id === id);
  if (columnIndex !== -1) {
    dataStore.columns[columnIndex] = {
      ...dataStore.columns[columnIndex],
      ...req.body,
    };
    res.json({ changes: 1 });
  } else {
    res.status(404).json({ error: 'Column not found' });
  }
});

app.delete('/api/boards/columns/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const columnIndex = dataStore.columns.findIndex(c => c.id === id);
  if (columnIndex !== -1) {
    dataStore.columns.splice(columnIndex, 1);
    res.json({ changes: 1 });
  } else {
    res.status(404).json({ error: 'Column not found' });
  }
});

// Card routes
app.get('/api/boards/columns/:columnId/cards', (req, res) => {
  const columnId = parseInt(req.params.columnId);
  const cards = dataStore.cards.filter(c => c.column_id === columnId);
  res.json(cards);
});

app.post('/api/boards/columns/:columnId/cards', (req, res) => {
  const columnId = parseInt(req.params.columnId);
  const { title, description, position } = req.body;
  const newCard = {
    id: dataStore.cards.length + 1,
    column_id: columnId,
    title,
    description,
    position: position || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  dataStore.cards.push(newCard);
  res.json({ lastInsertRowid: newCard.id });
});

app.put('/api/boards/cards/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cardIndex = dataStore.cards.findIndex(c => c.id === id);
  if (cardIndex !== -1) {
    dataStore.cards[cardIndex] = {
      ...dataStore.cards[cardIndex],
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    res.json({ changes: 1 });
  } else {
    res.status(404).json({ error: 'Card not found' });
  }
});

app.delete('/api/boards/cards/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cardIndex = dataStore.cards.findIndex(c => c.id === id);
  if (cardIndex !== -1) {
    dataStore.cards.splice(cardIndex, 1);
    res.json({ changes: 1 });
  } else {
    res.status(404).json({ error: 'Card not found' });
  }
});

// Tag routes
app.get('/api/tags', (req, res) => {
  res.json(dataStore.tags);
});

app.get('/api/tags/:id', (req, res) => {
  const tag = dataStore.tags.find(t => t.id === parseInt(req.params.id));
  if (tag) {
    res.json(tag);
  } else {
    res.status(404).json({ error: 'Tag not found' });
  }
});

app.post('/api/tags', (req, res) => {
  const { name, color } = req.body;
  const newTag = {
    id: dataStore.tags.length + 1,
    name,
    color,
    created_at: new Date().toISOString(),
  };
  dataStore.tags.push(newTag);
  res.json({ lastInsertRowid: newTag.id });
});

app.delete('/api/tags/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const tagIndex = dataStore.tags.findIndex(t => t.id === id);
  if (tagIndex !== -1) {
    dataStore.tags.splice(tagIndex, 1);
    res.json({ changes: 1 });
  } else {
    res.status(404).json({ error: 'Tag not found' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 