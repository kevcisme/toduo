import React, { useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Upload,
  File,
  X,
  FileText,
  FileSpreadsheet,
  FileImage,
} from "lucide-react";

import { ScheduleData } from "@/types/app";
import { useDocumentData } from "@/hooks/useDocumentData";

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  extractedText?: string;
  noteId?: string;
  scheduleData?: ScheduleData | null;
}

interface DocumentUploadProps {
  onDocumentUpload?: (document: Document) => void;
  onDocumentSelect?: (documentId: string) => void;
  documents?: Document[];
  className?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onDocumentUpload,
  onDocumentSelect,
  documents = [],
  className = "",
}) => {
  const {
    documents: uploadedDocuments,
    isProcessing,
    error,
    processFiles,
    removeDocument: handleRemoveDocument,
  } = useDocumentData(documents);

  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const processedDocs = await processFiles(files);

      // Notify parent component about new documents
      processedDocs.forEach((doc) => {
        if (onDocumentUpload) {
          onDocumentUpload(doc);
        }
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const processedDocs = await processFiles(files);

      // Notify parent component about new documents
      processedDocs.forEach((doc) => {
        if (onDocumentUpload) {
          onDocumentUpload(doc);
        }
      });
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) {
      return <FileText className="h-5 w-5" />;
    } else if (
      type.includes("spreadsheet") ||
      type.includes("excel") ||
      type.includes("csv")
    ) {
      return <FileSpreadsheet className="h-5 w-5" />;
    } else if (type.includes("image")) {
      return <FileImage className="h-5 w-5" />;
    } else {
      return <File className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <Card className={`bg-white h-full flex flex-col ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Document Upload</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pt-0">
        <div
          className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Drag and drop files here</p>
          <p className="text-xs text-muted-foreground">or click to browse</p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports PDF, PowerPoint, Excel, and text files
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt,.csv"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="mb-4 p-3 border border-blue-300 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing documents...
          </div>
        )}

        <div className="grid-paper-background rounded-lg overflow-hidden">
          <ScrollArea className="h-[300px] p-4">
            {uploadedDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No documents uploaded yet
              </div>
            ) : (
              <div className="space-y-2">
                {uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 border rounded-lg hover:bg-accent/10 cursor-pointer flex items-center justify-between"
                    onClick={() => onDocumentSelect && onDocumentSelect(doc.id)}
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.type)}
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {formatFileSize(doc.size)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Uploaded {doc.uploadedAt.toLocaleDateString()}
                          </span>
                          {doc.scheduleData && (
                            <Badge variant="secondary" className="text-xs">
                              Schedule data extracted
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDocument(doc.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {uploadedDocuments.length} document
          {uploadedDocuments.length !== 1 ? "s" : ""} uploaded
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentUpload;
