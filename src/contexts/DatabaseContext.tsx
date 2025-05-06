import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { taskApi, noteApi, kanbanApi, tagApi } from "../services/api";
import { googleCalendarService } from "../services/calendarAuthService";

// LLM Configuration interface
export interface LlmConfig {
  openaiApiKey?: string;
  openaiModel?: string;
  keywordWeight?: number;
}

// Create context
interface DatabaseContextType {
  taskApi: typeof taskApi;
  noteApi: typeof noteApi;
  kanbanService: typeof kanbanApi;
  tagService: typeof tagApi;
  googleCalendarService: typeof googleCalendarService;
  googleCalendarError: string | null;
  resetGoogleCalendarError: () => void;
  llmConfig: LlmConfig | null;
  updateLlmConfig: (config: LlmConfig) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined,
);

// Provider component
interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
}) => {
  const [googleCalendarError, setGoogleCalendarError] = useState<string | null>(
    null,
  );
  const [llmConfig, setLlmConfig] = useState<LlmConfig | null>(null);

  // Initialize Google Calendar services when the app starts
  useEffect(() => {
    const initGoogleCalendar = async () => {
      try {
        await googleCalendarService.initialize();
      } catch (error) {
        console.error("Failed to initialize Google Calendar service:", error);
        setGoogleCalendarError(
          "Failed to initialize Google Calendar service. Please try again later.",
        );
      }
    };

    initGoogleCalendar();
  }, []);

  // Load LLM configuration from local storage
  useEffect(() => {
    const loadLlmConfig = () => {
      try {
        const storedConfig = localStorage.getItem("llmConfig");
        if (storedConfig) {
          setLlmConfig(JSON.parse(storedConfig));
        }
      } catch (error) {
        console.error("Failed to load LLM configuration:", error);
      }
    };

    loadLlmConfig();
  }, []);

  // Update LLM configuration
  const updateLlmConfig = async (config: LlmConfig) => {
    try {
      // Store in local storage
      localStorage.setItem("llmConfig", JSON.stringify(config));
      setLlmConfig(config);
    } catch (error) {
      console.error("Failed to update LLM configuration:", error);
      throw new Error("Failed to update LLM configuration");
    }
  };

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
        resetGoogleCalendarError,
        llmConfig,
        updateLlmConfig,
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
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

// TODO: Provide integration connection state and actions via context for use in UI and services
