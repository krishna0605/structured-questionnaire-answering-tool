import { chunkText } from '@/lib/chunker';

describe('chunkText', () => {
  it('should return empty array for empty input', () => {
    expect(chunkText('')).toEqual([]);
  });

  it('should return empty array for whitespace-only input', () => {
    expect(chunkText('   \n\t  ')).toEqual([]);
  });

  it('should return a single chunk for short text', () => {
    const text = 'This is a short piece of text for testing.';
    const result = chunkText(text);

    expect(result).toHaveLength(1);
    expect(result[0].chunk_index).toBe(0);
    expect(result[0].content).toBe(text);
  });

  it('should assign sequential chunk indices', () => {
    // Generate text long enough for multiple chunks with small maxTokens
    const words = Array.from({ length: 100 }, (_, i) => `word${i}`);
    const text = words.join(' ');
    const result = chunkText(text, 20, 5);

    result.forEach((chunk, idx) => {
      expect(chunk.chunk_index).toBe(idx);
    });
    expect(result.length).toBeGreaterThan(1);
  });

  it('should create overlapping chunks', () => {
    const words = Array.from({ length: 100 }, (_, i) => `word${i}`);
    const text = words.join(' ');
    const result = chunkText(text, 30, 10);

    // Check that consecutive chunks share some content (overlap)
    for (let i = 0; i < result.length - 1; i++) {
      const wordsInCurrent = result[i].content.split(' ');
      const wordsInNext = result[i + 1].content.split(' ');
      const lastWordsOfCurrent = wordsInCurrent.slice(-5);

      // At least some of the last words of current chunk should appear
      // at the start of the next chunk
      const overlap = lastWordsOfCurrent.some((w) =>
        wordsInNext.slice(0, 10).includes(w)
      );
      expect(overlap).toBe(true);
    }
  });

  it('should respect custom maxTokens parameter', () => {
    const words = Array.from({ length: 200 }, (_, i) => `word${i}`);
    const text = words.join(' ');

    const smallChunks = chunkText(text, 20, 5);
    const largeChunks = chunkText(text, 100, 5);

    expect(smallChunks.length).toBeGreaterThan(largeChunks.length);
  });

  it('should not produce empty chunks', () => {
    const text = 'Hello world this is a test of the chunking system';
    const result = chunkText(text, 10, 2);

    result.forEach((chunk) => {
      expect(chunk.content.trim().length).toBeGreaterThan(0);
    });
  });

  it('should handle a single word', () => {
    const result = chunkText('Hello');
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('Hello');
    expect(result[0].chunk_index).toBe(0);
  });
});
