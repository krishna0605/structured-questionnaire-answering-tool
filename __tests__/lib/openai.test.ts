// Mock the OpenAI module before importing
jest.mock('openai', () => {
  const mockCreate = jest.fn();
  const mockEmbeddingsCreate = jest.fn();

  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
      embeddings: {
        create: mockEmbeddingsCreate,
      },
    })),
    _mockCreate: mockCreate,
    _mockEmbeddingsCreate: mockEmbeddingsCreate,
  };
});

import { generateEmbedding, generateAnswer } from '@/lib/openai';

// Access the mock functions
const openaiMock = jest.requireMock('openai');
const mockEmbeddingsCreate = openaiMock._mockEmbeddingsCreate;
const mockCreate = openaiMock._mockCreate;

describe('generateEmbedding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an embedding array from the API response', async () => {
    const fakeEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];
    mockEmbeddingsCreate.mockResolvedValue({
      data: [{ embedding: fakeEmbedding }],
    });

    const result = await generateEmbedding('test text');

    expect(result).toEqual(fakeEmbedding);
    expect(mockEmbeddingsCreate).toHaveBeenCalledWith({
      model: 'text-embedding-3-small',
      input: 'test text',
    });
  });
});

describe('generateAnswer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should parse a valid JSON response from the LLM', async () => {
    const llmResponse = {
      answer_text: 'We use AES-256 encryption.',
      confidence_score: 0.92,
      evidence_snippets: ['AES-256 is used for all data at rest'],
      is_not_found: false,
    };

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(llmResponse) } }],
    });

    const result = await generateAnswer('What encryption do you use?', 'Context here');

    expect(result.answer_text).toBe('We use AES-256 encryption.');
    expect(result.confidence_score).toBe(0.92);
    expect(result.is_not_found).toBe(false);
    expect(result.evidence_snippets).toHaveLength(1);
  });

  it('should handle malformed JSON gracefully with fallback', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'This is not valid JSON at all' } }],
    });

    const result = await generateAnswer('Some question?', 'Some context');

    expect(result.answer_text).toBe('This is not valid JSON at all');
    expect(result.confidence_score).toBe(0.5);
    expect(result.evidence_snippets).toEqual([]);
    expect(result.is_not_found).toBe(false);
  });

  it('should handle empty response content', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '' } }],
    });

    const result = await generateAnswer('Some question?', 'Some context');

    // Empty string should trigger JSON parse failure → fallback
    expect(result.answer_text).toBe('');
    expect(result.confidence_score).toBe(0.5);
  });
});
