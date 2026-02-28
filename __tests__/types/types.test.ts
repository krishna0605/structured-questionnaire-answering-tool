/**
 * Type shape validation tests.
 * These tests verify that objects conforming to our interfaces
 * satisfy the expected structure at runtime.
 */
import type {
  Project,
  Question,
  Answer,
  Citation,
  QuestionWithAnswer,
  CoverageSummary,
  GeneratedAnswer,
} from '@/types';

describe('Type Definitions', () => {
  it('should validate Project shape', () => {
    const project: Project = {
      id: '123',
      user_id: 'user-1',
      name: 'Test Project',
      description: 'A test project',
      created_at: '2026-01-01T00:00:00Z',
    };

    expect(project.id).toBeDefined();
    expect(project.user_id).toBeDefined();
    expect(project.name).toBeDefined();
    expect(typeof project.description).toBe('string');
    expect(project.created_at).toBeDefined();
  });

  it('should validate Project with null description', () => {
    const project: Project = {
      id: '123',
      user_id: 'user-1',
      name: 'Test Project',
      description: null,
      created_at: '2026-01-01T00:00:00Z',
    };

    expect(project.description).toBeNull();
  });

  it('should validate Question shape', () => {
    const question: Question = {
      id: 'q1',
      questionnaire_id: 'qn1',
      question_number: 1,
      question_text: 'What is your policy?',
      original_context: null,
    };

    expect(question.question_number).toBe(1);
    expect(typeof question.question_text).toBe('string');
  });

  it('should validate Answer shape', () => {
    const answer: Answer = {
      id: 'a1',
      question_id: 'q1',
      answer_text: 'Our policy is...',
      confidence_score: 0.85,
      evidence_snippets: '["snippet1"]',
      is_not_found: false,
      is_edited: false,
      version: 1,
      created_at: '2026-01-01T00:00:00Z',
    };

    expect(answer.confidence_score).toBe(0.85);
    expect(answer.is_not_found).toBe(false);
  });

  it('should validate Citation shape', () => {
    const citation: Citation = {
      id: 'c1',
      answer_id: 'a1',
      document_id: 'd1',
      chunk_id: 'ch1',
      source_filename: 'policy.pdf',
      snippet: 'Relevant text from document...',
    };

    expect(citation.source_filename).toBe('policy.pdf');
    expect(typeof citation.snippet).toBe('string');
  });

  it('should validate QuestionWithAnswer composite shape', () => {
    const qa: QuestionWithAnswer = {
      question: {
        id: 'q1',
        questionnaire_id: 'qn1',
        question_number: 1,
        question_text: 'Test question?',
        original_context: null,
      },
      answer: {
        id: 'a1',
        question_id: 'q1',
        answer_text: 'Test answer',
        confidence_score: 0.9,
        evidence_snippets: null,
        is_not_found: false,
        is_edited: true,
        version: 2,
        created_at: '2026-01-01T00:00:00Z',
      },
      citations: [],
    };

    expect(qa.question.id).toBe('q1');
    expect(qa.answer.question_id).toBe('q1');
    expect(qa.citations).toHaveLength(0);
  });

  it('should validate CoverageSummary shape', () => {
    const summary: CoverageSummary = {
      total_questions: 10,
      answered: 8,
      not_found: 2,
      avg_confidence: 0.87,
    };

    expect(summary.total_questions).toBe(10);
    expect(summary.answered + summary.not_found).toBeLessThanOrEqual(summary.total_questions);
  });

  it('should validate GeneratedAnswer shape', () => {
    const answer: GeneratedAnswer = {
      answer_text: 'Generated answer',
      confidence_score: 0.75,
      evidence_snippets: ['snippet1', 'snippet2'],
      is_not_found: false,
      citations: [
        {
          source_filename: 'doc.pdf',
          snippet: 'relevant text',
          chunk_id: 'ch1',
          document_id: 'd1',
        },
      ],
    };

    expect(answer.evidence_snippets).toHaveLength(2);
    expect(answer.citations).toHaveLength(1);
    expect(answer.citations[0].source_filename).toBe('doc.pdf');
  });
});
