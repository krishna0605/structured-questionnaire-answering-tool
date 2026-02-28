// Mock the docx module
jest.mock('docx', () => {
  return {
    Document: jest.fn().mockImplementation(() => ({})),
    Packer: {
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-docx-content')),
    },
    Paragraph: jest.fn().mockImplementation(() => ({})),
    TextRun: jest.fn().mockImplementation(() => ({})),
    HeadingLevel: { TITLE: 'TITLE', HEADING_2: 'HEADING_2' },
    AlignmentType: { CENTER: 'CENTER' },
    BorderStyle: { SINGLE: 'SINGLE' },
    Table: jest.fn(),
    TableRow: jest.fn(),
    TableCell: jest.fn(),
    WidthType: {},
    ShadingType: {},
  };
});

import { generateDocx } from '@/lib/export';
import { Packer } from 'docx';
import type { QuestionWithAnswer } from '@/types';

describe('generateDocx', () => {
  const mockQuestions: QuestionWithAnswer[] = [
    {
      question: {
        id: 'q1',
        questionnaire_id: 'qn1',
        question_number: 1,
        question_text: 'What is your data retention policy?',
        original_context: null,
      },
      answer: {
        id: 'a1',
        question_id: 'q1',
        answer_text: 'We retain data for 7 years as per regulatory requirements.',
        confidence_score: 0.95,
        evidence_snippets: '["Data retained for 7 years"]',
        is_not_found: false,
        is_edited: false,
        version: 1,
        created_at: '2026-01-01T00:00:00Z',
      },
      citations: [
        {
          id: 'c1',
          answer_id: 'a1',
          document_id: 'd1',
          chunk_id: 'ch1',
          source_filename: 'data-policy.pdf',
          snippet: 'Data is retained for a minimum of 7 years...',
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a Buffer', async () => {
    const result = await generateDocx('Test Project', mockQuestions);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(Packer.toBuffer).toHaveBeenCalledTimes(1);
  });

  it('should handle empty questions array', async () => {
    const result = await generateDocx('Empty Project', []);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(Packer.toBuffer).toHaveBeenCalledTimes(1);
  });

  it('should handle questions without citations', async () => {
    const noCitations: QuestionWithAnswer[] = [
      {
        ...mockQuestions[0],
        citations: [],
      },
    ];

    const result = await generateDocx('No Citations', noCitations);

    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it('should handle questions with null confidence score', async () => {
    const nullConfidence: QuestionWithAnswer[] = [
      {
        ...mockQuestions[0],
        answer: {
          ...mockQuestions[0].answer,
          confidence_score: null,
        },
      },
    ];

    const result = await generateDocx('Null Confidence', nullConfidence);

    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it('should handle not-found answers', async () => {
    const notFound: QuestionWithAnswer[] = [
      {
        ...mockQuestions[0],
        answer: {
          ...mockQuestions[0].answer,
          is_not_found: true,
          confidence_score: 0,
          answer_text: 'No relevant information found.',
        },
      },
    ];

    const result = await generateDocx('Not Found', notFound);

    expect(Buffer.isBuffer(result)).toBe(true);
  });
});
