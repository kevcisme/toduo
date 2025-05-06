/**
 * Mock implementation of better-sqlite3 for browser environments
 * This provides empty implementations of the SQLite functions
 * that will be used when running in the browser
 */

class Statement {
  constructor() {
    // Empty constructor
  }

  run() {
    console.warn("SQLite operations are not supported in browser environment");
    return { changes: 0, lastInsertRowid: null };
  }

  get() {
    console.warn("SQLite operations are not supported in browser environment");
    return null;
  }

  all() {
    console.warn("SQLite operations are not supported in browser environment");
    return [];
  }
}

class Database {
  constructor() {
    console.warn(
      "SQLite is not supported in browser environment. Using mock implementation.",
    );
  }

  prepare(sql) {
    return new Statement();
  }

  exec() {
    console.warn("SQLite operations are not supported in browser environment");
    return this;
  }

  close() {
    return true;
  }

  transaction(fn) {
    return fn;
  }
}

function database() {
  return new Database();
}

database.Database = Database;
database.Statement = Statement;

export default database;
