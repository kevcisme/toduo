import React, { createContext, useContext, ReactNode } from 'react';
import { taskApi, noteApi, kanbanApi, tagApi } from '../services/api';

// Create context
interface DatabaseContextType {
  taskApi: typeof taskApi;
  noteApi: typeof noteApi;
  kanbanService: typeof kanbanApi;
  tagService: typeof tagApi;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Provider component
interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  return (
    <DatabaseContext.Provider
      value={{
        taskApi,
        noteApi,
        kanbanService: kanbanApi,
        tagService: tagApi,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

// Custom hook to use the database context
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}; 