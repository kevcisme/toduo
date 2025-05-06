import { Note } from "../db/models";

// Types for embedding functionality
export interface EmbeddingVector {
  id: string;
  vector: number[];
  metadata: {
    title: string;
    content: string;
    noteId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface SearchResult {
  noteId: string;
  title: string;
  content: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  keywordMatchScore?: number; // Optional score from keyword matching
}

// Simple in-memory vector store for development
// In production, this would be replaced with a proper vector database
class InMemoryVectorStore {
  private vectors: EmbeddingVector[] = [];

  addVector(vector: EmbeddingVector): void {
    this.vectors.push(vector);
  }

  getAllVectors(): EmbeddingVector[] {
    return this.vectors;
  }

  deleteVector(id: string): void {
    this.vectors = this.vectors.filter((v) => v.id !== id);
  }

  // Simple cosine similarity search
  search(queryVector: number[], limit: number = 5): SearchResult[] {
    if (this.vectors.length === 0) return [];

    // Calculate cosine similarity for each vector
    const results = this.vectors.map((vec) => {
      const similarity = this.cosineSimilarity(queryVector, vec.vector);
      return {
        noteId: vec.metadata.noteId,
        title: vec.metadata.title,
        content: vec.metadata.content,
        score: similarity,
        createdAt: vec.metadata.createdAt,
        updatedAt: vec.metadata.updatedAt,
      };
    });

    // Sort by similarity score (highest first)
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error("Vectors must have the same dimensions");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Clear all vectors
  clear(): void {
    this.vectors = [];
  }
}

// Singleton instance of the vector store
export const vectorStore = new InMemoryVectorStore();

// Mock embedding function - in production, this would call an LLM API
export async function generateEmbedding(text: string): Promise<number[]> {
  // This is a placeholder that creates a simple mock embedding
  // In a real implementation, this would call an API like OpenAI or use a local model

  // Create a deterministic but simplistic embedding based on the text
  // This is NOT suitable for production - just for demonstration
  const mockDimension = 128;
  const embedding = new Array(mockDimension).fill(0);

  // Simple hash function to generate values
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  // Use the hash to seed the embedding values
  for (let i = 0; i < mockDimension; i++) {
    // Generate a pseudo-random but deterministic value based on position and hash
    embedding[i] = Math.sin(i * hash * 0.001) * 0.5 + 0.5;
  }

  // Normalize the vector
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0),
  );
  return embedding.map((val) => val / magnitude);
}

// Function to generate and store embeddings for a note
export async function indexNote(note: Note): Promise<void> {
  try {
    // Combine title and content for better semantic representation
    const textToEmbed = `${note.title} ${note.content || ""}`;

    // Generate embedding
    const vector = await generateEmbedding(textToEmbed);

    // Store the embedding with metadata
    vectorStore.addVector({
      id: note.id.toString(),
      vector,
      metadata: {
        noteId: note.id.toString(),
        title: note.title,
        content: note.content || "",
        createdAt: note.created_at,
        updatedAt: note.updated_at,
      },
    });

    console.log(`Indexed note: ${note.title}`);
  } catch (error) {
    console.error("Error indexing note:", error);
  }
}

// Function to search notes by semantic similarity with optional keyword matching
export async function semanticSearch(
  query: string,
  limit: number = 5,
  keywordWeight: number = 0.3, // Default weight for keyword matching (0-1)
): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const queryVector = await generateEmbedding(query);

    // Get semantic search results
    const semanticResults = vectorStore.search(queryVector, limit * 2); // Get more results than needed for hybrid ranking

    if (keywordWeight <= 0) {
      // If keyword weight is 0 or negative, return pure semantic results
      return semanticResults.slice(0, limit);
    }

    // Prepare for keyword matching
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);

    // If no meaningful keywords, return semantic results
    if (keywords.length === 0) {
      return semanticResults.slice(0, limit);
    }

    // Combine semantic and keyword matching
    const hybridResults = semanticResults.map((result) => {
      // Calculate keyword match score
      let keywordScore = 0;
      const contentLower = (result.title + " " + result.content).toLowerCase();

      // Count keyword matches
      keywords.forEach((keyword) => {
        const regex = new RegExp(keyword, "gi");
        const matches = (contentLower.match(regex) || []).length;
        if (matches > 0) {
          keywordScore += matches / keywords.length;
        }
      });

      // Normalize keyword score to 0-1 range
      keywordScore = Math.min(keywordScore, 1);

      // Combine scores with weighting
      const combinedScore =
        (1 - keywordWeight) * result.score + keywordWeight * keywordScore;

      return {
        ...result,
        score: combinedScore,
        keywordMatchScore: keywordScore,
      };
    });

    // Sort by combined score and limit results
    return hybridResults.sort((a, b) => b.score - a.score).slice(0, limit);
  } catch (error) {
    console.error("Error during semantic search:", error);
    return [];
  }
}

// Function to reindex all notes
export async function reindexAllNotes(notes: Note[]): Promise<void> {
  // Clear existing vectors
  vectorStore.clear();

  // Index each note
  for (const note of notes) {
    await indexNote(note);
  }

  console.log(`Reindexed ${notes.length} notes`);
}

// Function to delete a note's embedding
export function deleteNoteEmbedding(noteId: string): void {
  vectorStore.deleteVector(noteId);
  console.log(`Deleted embedding for note: ${noteId}`);
}
