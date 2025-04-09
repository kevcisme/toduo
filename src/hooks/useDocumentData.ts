import { useState } from "react";
import { Document } from "@/components/DocumentUpload";
import { processFile } from "@/utils/fileProcessing";

/**
 * Custom hook for handling document upload and processing
 */
export function useDocumentData(initialDocuments: Document[] = []) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Process files and extract data from them
   */
  const processFiles = async (files: File[]): Promise<Document[]> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Process each file to extract text and schedule data
      const processedDocs = await Promise.all(
        files.map(async (file) => {
          try {
            return await processFile(file);
          } catch (err) {
            console.error(`Error processing file ${file.name}:`, err);
            return {
              id:
                Date.now().toString() +
                Math.random().toString(36).substring(2, 9),
              name: file.name,
              type: file.type,
              size: file.size,
              uploadedAt: new Date(),
              extractedText: `Error extracting text from ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`,
            };
          }
        }),
      );

      // Update documents state with new processed documents
      const updatedDocuments = [...documents, ...processedDocs];
      setDocuments(updatedDocuments);
      return processedDocs;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error processing files";
      setError(errorMessage);
      console.error("Error processing files:", err);
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Remove a document from the collection
   */
  const removeDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  return {
    documents,
    setDocuments,
    isProcessing,
    error,
    processFiles,
    removeDocument,
  };
}
