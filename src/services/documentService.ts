/**
 * Document service for handling document uploads and text extraction
 */

import { Document } from "@/components/DocumentUpload";
import { processFile } from "@/utils/fileProcessing";

// In-memory storage for documents (would be replaced with a database in production)
let documents: Document[] = [];

/**
 * Upload and process a document
 * @param file The file to upload and process
 * @returns A promise that resolves to the processed document
 */
export async function uploadDocument(file: File): Promise<Document> {
  const processedDocument = await processFile(file);

  // Store the document in our in-memory storage
  documents.push(processedDocument);

  return processedDocument;
}

/**
 * Upload and process multiple documents
 * @param files The files to upload and process
 * @returns A promise that resolves to an array of processed documents
 */
export async function uploadDocuments(files: File[]): Promise<Document[]> {
  const uploadPromises = files.map((file) => uploadDocument(file));
  return Promise.all(uploadPromises);
}

/**
 * Get all documents
 * @returns An array of all documents
 */
export function getAllDocuments(): Document[] {
  return [...documents];
}

/**
 * Get a document by ID
 * @param id The ID of the document to get
 * @returns The document with the specified ID, or undefined if not found
 */
export function getDocumentById(id: string): Document | undefined {
  return documents.find((doc) => doc.id === id);
}

/**
 * Delete a document by ID
 * @param id The ID of the document to delete
 * @returns True if the document was deleted, false otherwise
 */
export function deleteDocument(id: string): boolean {
  const initialLength = documents.length;
  documents = documents.filter((doc) => doc.id !== id);
  return documents.length < initialLength;
}

/**
 * Associate a document with a note
 * @param documentId The ID of the document to associate
 * @param noteId The ID of the note to associate with
 * @returns True if the association was successful, false otherwise
 */
export function associateDocumentWithNote(
  documentId: string,
  noteId: string,
): boolean {
  const document = documents.find((doc) => doc.id === documentId);

  if (!document) {
    return false;
  }

  document.noteId = noteId;
  return true;
}

/**
 * Get all documents associated with a note
 * @param noteId The ID of the note
 * @returns An array of documents associated with the note
 */
export function getDocumentsByNoteId(noteId: string): Document[] {
  return documents.filter((doc) => doc.noteId === noteId);
}
