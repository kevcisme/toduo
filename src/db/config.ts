// Mock database implementation
const db = {
  pragma: () => {},
  prepare: () => ({
    run: () => ({ changes: 0, lastInsertRowid: null }),
    get: () => null,
    all: () => [],
  }),
  exec: () => {},
  close: () => {},
  transaction: (fn: Function) => fn,
};

export default db;
