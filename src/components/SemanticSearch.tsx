import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Search } from "lucide-react";
import { semanticSearch, SearchResult } from "../services/embeddingService";

interface SemanticSearchProps {
  onResultClick?: (noteId: string) => void;
  className?: string;
}

const SemanticSearch: React.FC<SemanticSearchProps> = ({
  onResultClick,
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await semanticSearch(query);
      setResults(searchResults);
    } catch (err) {
      console.error("Error during semantic search:", err);
      setError("Failed to perform semantic search. Please try again.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by meaning..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8"
            disabled={isSearching}
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {results.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Found {results.length} results
          </p>
          {results.map((result) => (
            <Card
              key={result.noteId}
              className="hover:bg-accent/10 cursor-pointer"
              onClick={() => onResultClick?.(result.noteId)}
            >
              <CardContent className="p-4">
                <h4 className="font-medium">{result.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {result.content}
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  Score: {result.score.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : query && !isSearching ? (
        <p className="text-sm text-muted-foreground">No results found</p>
      ) : null}
    </div>
  );
};

export default SemanticSearch;
