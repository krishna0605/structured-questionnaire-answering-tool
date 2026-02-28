// ==========================================
// TypeScript Type Definitions
// ==========================================

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Questionnaire {
  id: string;
  project_id: string;
  filename: string;
  storage_path: string;
  status: 'uploaded' | 'parsing' | 'parsed' | 'error';
  created_at: string;
}

export interface ReferenceDocument {
  id: string;
  project_id: string;
  filename: string;
  storage_path: string;
  status: 'uploaded' | 'embedding' | 'embedded' | 'error';
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  embedding?: number[];
}

export interface Question {
  id: string;
  questionnaire_id: string;
  question_number: number;
  question_text: string;
  original_context: string | null;
}

export interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  confidence_score: number | null;
  evidence_snippets: string | null;
  is_not_found: boolean;
  is_edited: boolean;
  version: number;
  created_at: string;
}

export interface Citation {
  id: string;
  answer_id: string;
  document_id: string | null;
  chunk_id: string | null;
  source_filename: string;
  snippet: string;
}

export interface AnswerVersion {
  id: string;
  project_id: string;
  version_number: number;
  label: string | null;
  snapshot: AnswerSnapshot;
  created_at: string;
}

export interface AnswerSnapshot {
  questions: QuestionWithAnswer[];
  generated_at: string;
}

export interface QuestionWithAnswer {
  question: Question;
  answer: Answer;
  citations: Citation[];
}

export interface CoverageSummary {
  total_questions: number;
  answered: number;
  not_found: number;
  avg_confidence: number;
}

export interface GeneratedAnswer {
  answer_text: string;
  confidence_score: number;
  evidence_snippets: string[];
  is_not_found: boolean;
  citations: {
    source_filename: string;
    snippet: string;
    chunk_id: string;
    document_id: string;
  }[];
}
