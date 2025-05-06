import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload, File, X } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Document } from "./DocumentUpload";
import { processFile } from "@/utils/fileProcessing";

interface CanvasDocumentUploadProps {
  onDocumentUpload: (document: Document) => void;
}

const CanvasDocumentUpload: React.FC<CanvasDocumentUploadProps> = ({
  onDocumentUpload,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setIsUploading(true);

    const files = Array.from(e.dataTransfer.files);
    await processUploadedFiles(files);

    setIsUploading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const files = Array.from(e.target.files);
      await processUploadedFiles(files);
      setIsUploading(false);
    }
  };

  const processUploadedFiles = async (files: File[]) => {
    for (const file of files) {
      try {
        const processedDocument = await processFile(file);
        setUploadedFiles((prev) => [...prev, processedDocument]);
        onDocumentUpload(processedDocument);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Upload Documents</h2>
        <p className="text-sm text-muted-foreground">
          Drag and drop files or click to upload
        </p>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* Upload area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4 transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload
            className={`h-12 w-12 ${isDragging ? "text-primary" : "text-muted-foreground/50"}`}
          />
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragging ? "Drop files here" : "Drag files here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports PDF, Word, Excel, PowerPoint, and text files
            </p>
          </div>
          <Label htmlFor="file-upload" className="cursor-pointer">
            <Button size="sm" variant="outline">
              Browse Files
            </Button>
            <Input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            />
          </Label>
        </div>

        {/* Uploaded files list */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Uploaded Files</h3>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[200px]">
                        {file.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {isUploading && (
          <div className="text-center text-sm text-muted-foreground">
            Processing files...
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasDocumentUpload;
