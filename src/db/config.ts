import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const db = new Database(path.join(__dirname, '../../data.sqlite'), {
  verbose: console.log
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

export default db; 