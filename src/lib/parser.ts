import { extractText } from 'unpdf';
import * as XLSX from 'xlsx';

export interface ParsedQuestion {
  question_number: number;
  question_text: string;
  original_context: string | null;
}

export async function parsePDF(buffer: Buffer): Promise<string> {
  const { text } = await extractText(new Uint8Array(buffer));
  return Array.isArray(text) ? text.join('\n') : text;
}

export function parseXLSX(buffer: Buffer): ParsedQuestion[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

  const questions: ParsedQuestion[] = [];
  rows.forEach((row, index) => {
    // Try to find a column that contains the question text
    const values = Object.values(row);
    const keys = Object.keys(row);

    // Look for question-like columns
    const questionKey = keys.find(
      (k) =>
        k.toLowerCase().includes('question') ||
        k.toLowerCase().includes('query') ||
        k.toLowerCase().includes('item')
    );

    const questionText = questionKey
      ? row[questionKey]
      : values[0]; // Default to first column

    if (questionText && typeof questionText === 'string' && questionText.trim()) {
      questions.push({
        question_number: index + 1,
        question_text: questionText.trim(),
        original_context: JSON.stringify(row),
      });
    }
  });

  return questions;
}

export function extractQuestionsFromText(text: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  // Split by common question patterns
  // Pattern 1: Numbered questions (1. / 1) / Q1: / Q1. / 1:)
  const lines = text.split('\n').filter((l) => l.trim());
  let currentQuestion = '';
  let questionNumber = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if this line starts a new question
    const questionMatch = trimmed.match(
      /^(?:Q?\.?\s*)?(\d+)[.):\s]+\s*(.+)/i
    );

    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion) {
        questions.push({
          question_number: questionNumber,
          question_text: currentQuestion.trim(),
          original_context: null,
        });
      }
      questionNumber = parseInt(questionMatch[1]);
      currentQuestion = questionMatch[2];
    } else if (currentQuestion && trimmed) {
      // Continuation of the current question
      currentQuestion += ' ' + trimmed;
    }
  }

  // Save last question
  if (currentQuestion) {
    questions.push({
      question_number: questionNumber,
      question_text: currentQuestion.trim(),
      original_context: null,
    });
  }

  // If no numbered questions found, treat each line/paragraph as a question
  if (questions.length === 0) {
    const paragraphs = text
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 10);
    paragraphs.forEach((p, i) => {
      const trimmed = p.trim();
      if (trimmed.includes('?') || trimmed.length > 20) {
        questions.push({
          question_number: i + 1,
          question_text: trimmed,
          original_context: null,
        });
      }
    });
  }

  return questions;
}
