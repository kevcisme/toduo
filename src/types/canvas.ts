/**
 * Canvas data types for the canvas feature
 */

import { Document } from "@/components/DocumentUpload";
import { Task } from "@/db/models";
import { Note } from "@/db/models";
import { CalendarEvent } from "@/db/models";

export type CanvasItemType = "document" | "url" | "task" | "note" | "event";

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasItem {
  id: string;
  type: CanvasItemType;
  position: CanvasPosition;
  size: CanvasSize;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentCanvasItem extends CanvasItem {
  type: "document";
  documentId: string;
  document?: Document;
}

export interface UrlCanvasItem extends CanvasItem {
  type: "url";
  url: string;
  favicon?: string;
  description?: string;
  previewImage?: string;
  extractedText?: string;
}

export interface TaskCanvasItem extends CanvasItem {
  type: "task";
  taskId: number;
  task?: Task;
}

export interface NoteCanvasItem extends CanvasItem {
  type: "note";
  noteId: number;
  note?: Note;
}

export interface EventCanvasItem extends CanvasItem {
  type: "event";
  eventId: number;
  event?: CalendarEvent;
}

export type CanvasItemUnion =
  | DocumentCanvasItem
  | UrlCanvasItem
  | TaskCanvasItem
  | NoteCanvasItem
  | EventCanvasItem;

export interface Canvas {
  id: string;
  name: string;
  description?: string;
  items: CanvasItemUnion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CanvasChat {
  id: string;
  canvasId: string;
  messages: CanvasChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CanvasChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  references?: CanvasChatReference[];
}

export interface CanvasChatReference {
  itemId: string;
  snippet: string;
  relevanceScore?: number;
}
