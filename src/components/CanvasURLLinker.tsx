import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Globe, X, Loader2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { UrlCanvasItem } from "@/types/canvas";

interface CanvasURLLinkerProps {
  onUrlAdd: (
    urlItem: Omit<UrlCanvasItem, "id" | "createdAt" | "updatedAt">,
  ) => void;
}

interface UrlPreview {
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  previewImage?: string;
  extractedText?: string;
}

const CanvasURLLinker: React.FC<CanvasURLLinkerProps> = ({ onUrlAdd }) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlPreviews, setUrlPreviews] = useState<UrlPreview[]>([]);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleAddUrl = async () => {
    if (!url.trim()) return;

    // Validate URL format
    if (!validateUrl(url)) {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call an API to fetch metadata
      // For now, we'll simulate it with a timeout and basic data
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const domain = new URL(normalizedUrl).hostname;
      const title = domain.replace(/^www\./, "");

      const urlPreview: UrlPreview = {
        url: normalizedUrl,
        title: title,
        description: `Content from ${title}`,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}`,
      };

      setUrlPreviews((prev) => [...prev, urlPreview]);

      // Add to canvas
      onUrlAdd({
        type: "url",
        url: normalizedUrl,
        title: title,
        position: { x: 100, y: 100 },
        size: { width: 300, height: 200 },
        favicon: urlPreview.favicon,
        description: urlPreview.description,
        previewImage: urlPreview.previewImage,
        extractedText: urlPreview.extractedText,
      });

      // Clear input
      setUrl("");
    } catch (error) {
      console.error("Error fetching URL metadata:", error);
      setError("Failed to fetch URL metadata");
    } finally {
      setIsLoading(false);
    }
  };

  const removeUrlPreview = (url: string) => {
    setUrlPreviews((prev) => prev.filter((preview) => preview.url !== url));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Add URLs</h2>
        <p className="text-sm text-muted-foreground">
          Add links to websites and articles
        </p>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="url-input">Enter URL</Label>
          <div className="flex gap-2">
            <Input
              id="url-input"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://example.com"
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleAddUrl} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {/* URL previews list */}
        {urlPreviews.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Added URLs</h3>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <div className="space-y-2">
                {urlPreviews.map((preview) => (
                  <div
                    key={preview.url}
                    className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      {preview.favicon ? (
                        <img src={preview.favicon} alt="" className="h-4 w-4" />
                      ) : (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm truncate max-w-[200px]">
                        {preview.title || preview.url}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeUrlPreview(preview.url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasURLLinker;
