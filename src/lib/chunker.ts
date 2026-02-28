export interface TextChunk {
  content: string;
  chunk_index: number;
}

/**
 * Chunks text into overlapping segments of approximately `maxTokens` tokens.
 * Uses a simple word-based approach (~4 chars per token).
 */
export function chunkText(
  text: string,
  maxTokens: number = 500,
  overlapTokens: number = 50
): TextChunk[] {
  const chunks: TextChunk[] = [];
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  // Approximate: 1 token ≈ 0.75 words (conservative)
  const wordsPerChunk = Math.floor(maxTokens * 0.75);
  const overlapWords = Math.floor(overlapTokens * 0.75);

  let start = 0;
  let chunkIndex = 0;

  while (start < words.length) {
    const end = Math.min(start + wordsPerChunk, words.length);
    const chunkContent = words.slice(start, end).join(' ');

    if (chunkContent.trim().length > 0) {
      chunks.push({
        content: chunkContent.trim(),
        chunk_index: chunkIndex,
      });
      chunkIndex++;
    }

    // Move start forward, accounting for overlap
    start = end - overlapWords;
    if (start >= words.length || end === words.length) break;
  }

  return chunks;
}
