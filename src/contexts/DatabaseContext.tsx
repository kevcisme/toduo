import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { taskApi, noteApi, kanbanApi, tagApi } from '../services/api';
import { googleCalendarService } from '../services/calendarAuthService';

// Create context
interface DatabaseContextType {
  taskApi: typeof taskApi;
  noteApi: typeof noteApi;
  kanbanService: typeof kanbanApi;
  tagService: typeof tagApi;
  googleCalendarService: typeof googleCalendarService;
  googleCalendarError: string | null;
  resetGoogleCalendarError: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Provider component
interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [googleCalendarError, setGoogleCalendarError] = useState<string | null>(null);

  // Initialize Google Calendar services when the app starts
  useEffect(() => {
    const initGoogleCalendar = async () => {
      try {
        await googleCalendarService.initialize();
      } catch (error) {
        console.error('Failed to initialize Google Calendar service:', error);
        setGoogleCalendarError('Failed to initialize Google Calendar service. Please try again later.');
      }
    };
    
    initGoogleCalendar();
  }, []);

  const resetGoogleCalendarError = () => {
    setGoogleCalendarError(null);
  };

  return (
    <DatabaseContext.Provider
      value={{
        taskApi,
        noteApi,
        kanbanService: kanbanApi,
        tagService: tagApi,
        googleCalendarService,
        googleCalendarError,
        resetGoogleCalendarError
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