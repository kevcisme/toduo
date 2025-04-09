import { initializeDatabase } from './schema';
import * as models from './models';

// Initialize the database
initializeDatabase();

export * from './models';
export { default as db } from './config'; 