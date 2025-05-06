import React, { useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import {
  CanvasItemUnion,
  CanvasChatMessage,
  CanvasChatReference,
} from "@/types/canvas";
import { useDatabase } from "@/contexts/DatabaseContext";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  references?: CanvasChatReference[];
}

interface CanvasChatBarProps {
  canvasId?: string;
  items: CanvasItemUnion[];
}

// Mock API service for RAG functionality
const mockRagService = {
  // TODO: Replace with actual API call to backend RAG service
  processQuery: async (
    query: string,
    documents: Array<{
      id: string;
      title: string;
      content: string;
      type: string;
    }>,
  ) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock search for relevant content
    const relevantDocs = documents
      .filter(
        (doc) =>
          doc.content &&
          doc.content.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 3);

    // Generate mock references
    const references: CanvasChatReference[] = relevantDocs.map((doc) => ({
      itemId: doc.id,
      snippet:
        doc.content.substring(0, 100) + (doc.content.length > 100 ? "..." : ""),
      relevanceScore: 0.8 + Math.random() * 0.2, // Random score between 0.8 and 1.0
    }));

    // Generate mock response
    let responseContent = "";
    if (relevantDocs.length > 0) {
      responseContent = `Based on the content in your canvas, I found some relevant information about "${query}". ${documents.length > 0 ? "Here's what I found:" : "However, your canvas doesn't have much content yet."}`;
    } else {
      responseContent = `I don't see any specific information about "${query}" in your canvas items. ${documents.length > 0 ? "Try adding more relevant content or rephrasing your question." : "Try adding some documents, URLs, tasks, notes, or events to your canvas first."}`;
    }

    return {
      content: responseContent,
      references: references.length > 0 ? references : undefined,
    };
  },

  // TODO: Replace with actual API call to check if API key is valid
  validateApiKey: async (apiKey: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return apiKey && apiKey.startsWith("sk-");
  },
};

const CanvasChatBar: React.FC<CanvasChatBarProps> = ({ canvasId, items }) => {
  const { llmConfig } = useDatabase();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Welcome to Canvas Chat! Ask me questions about the documents in your canvas.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to extract content from canvas items
  const extractContentFromItems = useCallback(() => {
    return items.map((item) => {
      let content = "";

      switch (item.type) {
        case "document":
          content = item.document?.extractedText || "";
          break;
        case "url":
          content = item.extractedText || item.description || item.url;
          break;
        case "task":
          content = `Task: ${item.title}${item.task?.description ? ` - ${item.task.description}` : ""}`;
          break;
        case "note":
          content = `Note: ${item.title}${item.note?.content ? ` - ${item.note.content}` : ""}`;
          break;
        case "event":
          content = `Event: ${item.title}${item.event?.description ? ` - ${item.event.description}` : ""}`;
          break;
      }

      return {
        id: item.id,
        title: item.title,
        type: item.type,
        content,
      };
    });
  }, [items]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Extract content from canvas items
      const canvasContent = extractContentFromItems();

      // Check if LLM config is available
      if (!llmConfig?.openaiApiKey) {
        throw new Error(
          "OpenAI API key not configured. Please add it in Settings.",
        );
      }

      // TODO: In a real implementation, validate the API key with a backend service
      // For now, we'll use our mock service
      const isValidApiKey = await mockRagService.validateApiKey(
        llmConfig.openaiApiKey,
      );
      if (!isValidApiKey) {
        throw new Error(
          "Invalid OpenAI API key format. Please check your settings.",
        );
      }

      // TODO: In a real implementation, this would call a backend API to process the query
      // For now, we'll use our mock service
      const response = await mockRagService.processQuery(
        inputValue,
        canvasContent,
      );

      // Create AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response.content,
        sender: "ai",
        timestamp: new Date(),
        references: response.references,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error processing chat query:", error);

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: `Error: ${error instanceof Error ? error.message : "Failed to process your request. Please try again."}`,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full border-l">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Canvas Chat</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions about your canvas items
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <p className="text-sm">{message.content}</p>
                {message.references && message.references.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium">References:</p>
                    {message.references.map((ref, index) => (
                      <div
                        key={index}
                        className="text-xs bg-background/50 p-1.5 rounded border"
                      >
                        <p className="font-medium">
                          {items.find((item) => item.id === ref.itemId)
                            ?.title || "Unknown item"}
                        </p>
                        <p className="text-muted-foreground">{ref.snippet}</p>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about your canvas..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button size="icon" onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!llmConfig?.openaiApiKey && (
          <p className="text-xs text-amber-500 mt-2">
            Note: OpenAI API key not configured. Set it in Settings for better
            responses.
          </p>
        )}
      </div>
    </div>
  );
};

export default CanvasChatBar;
