import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// TODO: Implement AI/NLP utilities for extracting actionable tasks from calendar events, emails, and messages
// TODO: Add deduplication logic to prevent duplicate tasks from the same source
// TODO: Add utilities for plugin/integration framework to allow easy addition of new sources

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
