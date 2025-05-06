import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, FileText, CheckSquare, StickyNote } from "lucide-react";

type SearchResultType = "document" | "task" | "note";

interface SearchResult {
  id: string;
  title: string;
  content?: string;
  type: SearchResultType;
  relevanceScore?: number;
}

interface RAGSearchProps {
  className?: string;
}

const RAGSearch = ({ className = "" }: RAGSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock search function - will be replaced with actual RAG search
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock results - will be replaced with actual search results
    const mockResults: SearchResult[] = [
      {
        id: "doc1",
        title: "Project Proposal",
        content:
          "This document contains the project proposal with budget estimates.",
        type: "document",
        relevanceScore: 0.92,
      },
      {
        id: "task1",
        title: "Complete quarterly report",
        content: "Need to finish the Q2 financial report by Friday.",
        type: "task",
        relevanceScore: 0.85,
      },
      {
        id: "note1",
        title: "Meeting notes - Product team",
        content: "Discussed new feature priorities for the next sprint.",
        type: "note",
        relevanceScore: 0.78,
      },
    ].filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    setResults(mockResults);
    setIsSearching(false);
  };

  // Handle search when query changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Get icon based on result type
  const getResultIcon = (type: SearchResultType) => {
    switch (type) {
      case "document":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "task":
        return <CheckSquare className="h-4 w-4 text-green-500" />;
      case "note":
        return <StickyNote className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Smart Search</h3>
          </div>

          <div className="relative">
            <Input
              type="text"
              placeholder="Search documents, tasks, notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-8"
            />
            {isSearching && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {results.length > 0 ? (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="p-2 hover:bg-muted rounded-md cursor-pointer flex items-start space-x-2"
                  >
                    <div className="mt-0.5">{getResultIcon(result.type)}</div>
                    <div>
                      <p className="font-medium text-sm">{result.title}</p>
                      {result.content && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : query && !isSearching ? (
            <div className="py-8 text-center text-muted-foreground">
              No results found
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default RAGSearch;
