import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  taskApi,
  noteApi,
  kanbanApi,
  tagApi,
  documentApi,
  canvasApi,
} from "../services/api";
import { googleCalendarService } from "../services/calendarAuthService";
import { Canvas, CanvasItemUnion } from "@/types/canvas";
import { Document } from "@/components/DocumentUpload";

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
  documentApi: typeof documentApi;
  canvasApi: typeof canvasApi;
  googleCalendarService: typeof googleCalendarService;
  googleCalendarError: string | null;
  resetGoogleCalendarError: () => void;
  llmConfig: LlmConfig | null;
  updateLlmConfig: (config: LlmConfig) => Promise<void>;

  // Canvas-specific functions
  activeCanvas: Canvas | null;
  setActiveCanvas: (canvas: Canvas | null) => void;
  canvases: Canvas[];
  loadCanvases: () => Promise<void>;
  createCanvas: (name: string, description?: string) => Promise<Canvas>;
  updateCanvas: (canvas: Canvas) => Promise<void>;
  deleteCanvas: (canvasId: string) => Promise<void>;
  addItemToCanvas: (canvasId: string, item: CanvasItemUnion) => Promise<void>;
  removeItemFromCanvas: (canvasId: string, itemId: string) => Promise<void>;
  updateCanvasItem: (canvasId: string, item: CanvasItemUnion) => Promise<void>;

  // Document processing functions
  processDocument: (file: File) => Promise<Document>;
  extractUrlContent: (
    url: string,
  ) => Promise<{
    title: string;
    description: string;
    favicon?: string;
    previewImage?: string;
    extractedText?: string;
  }>;
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
  const [activeCanvas, setActiveCanvas] = useState<Canvas | null>(null);
  const [canvases, setCanvases] = useState<Canvas[]>([]);

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

  // Canvas functions
  const loadCanvases = async () => {
    try {
      const loadedCanvases = await canvasApi.getAllCanvases();
      setCanvases(loadedCanvases);
      return loadedCanvases;
    } catch (error) {
      console.error("Failed to load canvases:", error);
      throw new Error("Failed to load canvases");
    }
  };

  const createCanvas = async (
    name: string,
    description?: string,
  ): Promise<Canvas> => {
    try {
      const newCanvas = await canvasApi.createCanvas(name, description);
      setCanvases((prev) => [...prev, newCanvas]);
      return newCanvas;
    } catch (error) {
      console.error("Failed to create canvas:", error);
      throw new Error("Failed to create canvas");
    }
  };

  const updateCanvas = async (canvas: Canvas): Promise<void> => {
    try {
      await canvasApi.updateCanvas(canvas);
      setCanvases((prev) => prev.map((c) => (c.id === canvas.id ? canvas : c)));
      if (activeCanvas?.id === canvas.id) {
        setActiveCanvas(canvas);
      }
    } catch (error) {
      console.error("Failed to update canvas:", error);
      throw new Error("Failed to update canvas");
    }
  };

  const deleteCanvas = async (canvasId: string): Promise<void> => {
    try {
      await canvasApi.deleteCanvas(canvasId);
      setCanvases((prev) => prev.filter((c) => c.id !== canvasId));
      if (activeCanvas?.id === canvasId) {
        setActiveCanvas(null);
      }
    } catch (error) {
      console.error("Failed to delete canvas:", error);
      throw new Error("Failed to delete canvas");
    }
  };

  const addItemToCanvas = async (
    canvasId: string,
    item: CanvasItemUnion,
  ): Promise<void> => {
    try {
      await canvasApi.addItemToCanvas(canvasId, item);
      setCanvases((prev) =>
        prev.map((c) => {
          if (c.id === canvasId) {
            return {
              ...c,
              items: [...c.items, item],
              updatedAt: new Date(),
            };
          }
          return c;
        }),
      );

      if (activeCanvas?.id === canvasId) {
        setActiveCanvas((prev) =>
          prev
            ? {
                ...prev,
                items: [...prev.items, item],
                updatedAt: new Date(),
              }
            : null,
        );
      }
    } catch (error) {
      console.error("Failed to add item to canvas:", error);
      throw new Error("Failed to add item to canvas");
    }
  };

  const removeItemFromCanvas = async (
    canvasId: string,
    itemId: string,
  ): Promise<void> => {
    try {
      await canvasApi.removeItemFromCanvas(canvasId, itemId);
      setCanvases((prev) =>
        prev.map((c) => {
          if (c.id === canvasId) {
            return {
              ...c,
              items: c.items.filter((item) => item.id !== itemId),
              updatedAt: new Date(),
            };
          }
          return c;
        }),
      );

      if (activeCanvas?.id === canvasId) {
        setActiveCanvas((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.filter((item) => item.id !== itemId),
                updatedAt: new Date(),
              }
            : null,
        );
      }
    } catch (error) {
      console.error("Failed to remove item from canvas:", error);
      throw new Error("Failed to remove item from canvas");
    }
  };

  const updateCanvasItem = async (
    canvasId: string,
    updatedItem: CanvasItemUnion,
  ): Promise<void> => {
    try {
      await canvasApi.updateCanvasItem(canvasId, updatedItem);
      setCanvases((prev) =>
        prev.map((c) => {
          if (c.id === canvasId) {
            return {
              ...c,
              items: c.items.map((item) =>
                item.id === updatedItem.id ? updatedItem : item,
              ),
              updatedAt: new Date(),
            };
          }
          return c;
        }),
      );

      if (activeCanvas?.id === canvasId) {
        setActiveCanvas((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.map((item) =>
                  item.id === updatedItem.id ? updatedItem : item,
                ),
                updatedAt: new Date(),
              }
            : null,
        );
      }
    } catch (error) {
      console.error("Failed to update canvas item:", error);
      throw new Error("Failed to update canvas item");
    }
  };

  // Document processing functions
  const processDocument = async (file: File): Promise<Document> => {
    try {
      return await documentApi.processDocument(file);
    } catch (error) {
      console.error("Failed to process document:", error);
      throw new Error("Failed to process document");
    }
  };

  const extractUrlContent = async (url: string) => {
    try {
      return await documentApi.extractUrlContent(url);
    } catch (error) {
      console.error("Failed to extract URL content:", error);
      throw new Error("Failed to extract URL content");
    }
  };

  // Load canvases when the provider mounts
  useEffect(() => {
    loadCanvases().catch(console.error);
  }, []);

  return (
    <DatabaseContext.Provider
      value={{
        taskApi,
        noteApi,
        kanbanService: kanbanApi,
        tagService: tagApi,
        documentApi,
        canvasApi,
        googleCalendarService,
        googleCalendarError,
        resetGoogleCalendarError,
        llmConfig,
        updateLlmConfig,
        activeCanvas,
        setActiveCanvas,
        canvases,
        loadCanvases,
        createCanvas,
        updateCanvas,
        deleteCanvas,
        addItemToCanvas,
        removeItemFromCanvas,
        updateCanvasItem,
        processDocument,
        extractUrlContent,
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
