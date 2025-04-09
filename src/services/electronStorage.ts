import { Task, Note, Board, Column, Card, Tag } from '@/types';

interface StorageData {
  tasks: Task[];
  notes: Note[];
  boards: Board[];
  columns: Column[];
  cards: Card[];
  tags: Tag[];
}

class ElectronStorage {
  private static instance: ElectronStorage;
  private data: StorageData;

  private constructor() {
    this.data = {
      tasks: [],
      notes: [],
      boards: [],
      columns: [],
      cards: [],
      tags: []
    };
    this.loadData();
  }

  public static getInstance(): ElectronStorage {
    if (!ElectronStorage.instance) {
      ElectronStorage.instance = new ElectronStorage();
    }
    return ElectronStorage.instance;
  }

  private loadData(): void {
    try {
      // In a real Electron app, we would use electron-store or similar
      // For now, we'll just initialize with empty arrays
      console.log('Loading data from local storage');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private saveData(): void {
    try {
      // In a real Electron app, we would save to disk
      console.log('Saving data to local storage');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Task methods
  public getTasks(): Task[] {
    return this.data.tasks;
  }

  public createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.tasks.push(newTask);
    this.saveData();
    return newTask;
  }

  public updateTask(id: string, task: Partial<Task>): Task {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    const updatedTask = {
      ...this.data.tasks[index],
      ...task,
      updatedAt: new Date().toISOString()
    };
    this.data.tasks[index] = updatedTask;
    this.saveData();
    return updatedTask;
  }

  public deleteTask(id: string): void {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    this.data.tasks.splice(index, 1);
    this.saveData();
  }

  // Note methods
  public getNotes(): Note[] {
    return this.data.notes;
  }

  public createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.notes.push(newNote);
    this.saveData();
    return newNote;
  }

  public updateNote(id: string, note: Partial<Note>): Note {
    const index = this.data.notes.findIndex(n => n.id === id);
    if (index === -1) {
      throw new Error(`Note with id ${id} not found`);
    }
    const updatedNote = {
      ...this.data.notes[index],
      ...note,
      updatedAt: new Date().toISOString()
    };
    this.data.notes[index] = updatedNote;
    this.saveData();
    return updatedNote;
  }

  public deleteNote(id: string): void {
    const index = this.data.notes.findIndex(n => n.id === id);
    if (index === -1) {
      throw new Error(`Note with id ${id} not found`);
    }
    this.data.notes.splice(index, 1);
    this.saveData();
  }

  // Board methods
  public getBoards(): Board[] {
    return this.data.boards;
  }

  public createBoard(board: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>): Board {
    const newBoard: Board = {
      ...board,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.boards.push(newBoard);
    this.saveData();
    return newBoard;
  }

  public updateBoard(id: string, board: Partial<Board>): Board {
    const index = this.data.boards.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error(`Board with id ${id} not found`);
    }
    const updatedBoard = {
      ...this.data.boards[index],
      ...board,
      updatedAt: new Date().toISOString()
    };
    this.data.boards[index] = updatedBoard;
    this.saveData();
    return updatedBoard;
  }

  public deleteBoard(id: string): void {
    const index = this.data.boards.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error(`Board with id ${id} not found`);
    }
    this.data.boards.splice(index, 1);
    this.saveData();
  }

  // Column methods
  public getColumns(): Column[] {
    return this.data.columns;
  }

  public getColumnsByBoardId(boardId: string): Column[] {
    return this.data.columns.filter(c => c.boardId === boardId);
  }

  public createColumn(column: Omit<Column, 'id' | 'createdAt' | 'updatedAt'>): Column {
    const newColumn: Column = {
      ...column,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.columns.push(newColumn);
    this.saveData();
    return newColumn;
  }

  public updateColumn(id: string, column: Partial<Column>): Column {
    const index = this.data.columns.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Column with id ${id} not found`);
    }
    const updatedColumn = {
      ...this.data.columns[index],
      ...column,
      updatedAt: new Date().toISOString()
    };
    this.data.columns[index] = updatedColumn;
    this.saveData();
    return updatedColumn;
  }

  public deleteColumn(id: string): void {
    const index = this.data.columns.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Column with id ${id} not found`);
    }
    this.data.columns.splice(index, 1);
    this.saveData();
  }

  // Card methods
  public getCards(): Card[] {
    return this.data.cards;
  }

  public getCardsByColumnId(columnId: string): Card[] {
    return this.data.cards.filter(c => c.columnId === columnId);
  }

  public createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Card {
    const newCard: Card = {
      ...card,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.cards.push(newCard);
    this.saveData();
    return newCard;
  }

  public updateCard(id: string, card: Partial<Card>): Card {
    const index = this.data.cards.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Card with id ${id} not found`);
    }
    const updatedCard = {
      ...this.data.cards[index],
      ...card,
      updatedAt: new Date().toISOString()
    };
    this.data.cards[index] = updatedCard;
    this.saveData();
    return updatedCard;
  }

  public deleteCard(id: string): void {
    const index = this.data.cards.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Card with id ${id} not found`);
    }
    this.data.cards.splice(index, 1);
    this.saveData();
  }

  // Tag methods
  public getTags(): Tag[] {
    return this.data.tags;
  }

  public createTag(tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Tag {
    const newTag: Tag = {
      ...tag,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.tags.push(newTag);
    this.saveData();
    return newTag;
  }

  public updateTag(id: string, tag: Partial<Tag>): Tag {
    const index = this.data.tags.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Tag with id ${id} not found`);
    }
    const updatedTag = {
      ...this.data.tags[index],
      ...tag,
      updatedAt: new Date().toISOString()
    };
    this.data.tags[index] = updatedTag;
    this.saveData();
    return updatedTag;
  }

  public deleteTag(id: string): void {
    const index = this.data.tags.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Tag with id ${id} not found`);
    }
    this.data.tags.splice(index, 1);
    this.saveData();
  }
}

export default ElectronStorage; 