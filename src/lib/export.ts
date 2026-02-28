import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import type { QuestionWithAnswer } from '@/types';

export async function generateDocx(
  projectName: string,
  questions: QuestionWithAnswer[]
): Promise<Buffer> {
  const doc = new Document({
    creator: 'ShieldSync Questionnaire Tool',
    title: `${projectName} - Questionnaire Answers`,
    description: 'AI-generated answers with citations',
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: projectName,
                bold: true,
                size: 36,
                color: '1a1a2e',
                font: 'Segoe UI',
              }),
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Questionnaire Answers Report',
                size: 24,
                color: '666666',
                font: 'Segoe UI',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated on: ${new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}`,
                size: 20,
                color: '999999',
                italics: true,
                font: 'Segoe UI',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),

          // Horizontal rule
          new Paragraph({
            border: {
              bottom: {
                color: 'cccccc',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { after: 400 },
          }),

          // Generate Q&A sections
          ...questions.flatMap((qa, index) => {
            const children: Paragraph[] = [];

            // Question header
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Question ${qa.question.question_number}: `,
                    bold: true,
                    size: 24,
                    color: '7c3aed',
                    font: 'Segoe UI',
                  }),
                  new TextRun({
                    text: qa.question.question_text,
                    size: 24,
                    color: '1a1a2e',
                    font: 'Segoe UI',
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              })
            );

            // Confidence badge
            if (qa.answer.confidence_score !== null) {
              const score = Math.round(qa.answer.confidence_score * 100);
              const color =
                score >= 80
                  ? '059669'
                  : score >= 50
                    ? 'D97706'
                    : 'DC2626';
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Confidence: ${score}%`,
                      bold: true,
                      size: 18,
                      color: color,
                      font: 'Segoe UI',
                    }),
                    new TextRun({
                      text: qa.answer.is_not_found
                        ? '  •  ⚠ Information not found in reference documents'
                        : '',
                      size: 18,
                      color: 'DC2626',
                      font: 'Segoe UI',
                    }),
                  ],
                  spacing: { after: 200 },
                })
              );
            }

            // Answer text
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Answer: ',
                    bold: true,
                    size: 22,
                    color: '333333',
                    font: 'Segoe UI',
                  }),
                  new TextRun({
                    text: qa.answer.answer_text,
                    size: 22,
                    color: '333333',
                    font: 'Segoe UI',
                  }),
                ],
                spacing: { after: 200 },
              })
            );

            // Citations
            if (qa.citations && qa.citations.length > 0) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Sources:',
                      bold: true,
                      size: 18,
                      color: '666666',
                      font: 'Segoe UI',
                    }),
                  ],
                  spacing: { before: 100, after: 100 },
                })
              );

              qa.citations.forEach((citation, i) => {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `  [${i + 1}] ${citation.source_filename}`,
                        size: 18,
                        color: '7c3aed',
                        italics: true,
                        font: 'Segoe UI',
                      }),
                      new TextRun({
                        text: ` — "${citation.snippet}"`,
                        size: 16,
                        color: '888888',
                        font: 'Segoe UI',
                      }),
                    ],
                    spacing: { after: 50 },
                  })
                );
              });
            }

            // Separator between questions
            if (index < questions.length - 1) {
              children.push(
                new Paragraph({
                  border: {
                    bottom: {
                      color: 'eeeeee',
                      space: 1,
                      style: BorderStyle.SINGLE,
                      size: 4,
                    },
                  },
                  spacing: { before: 200, after: 300 },
                })
              );
            }

            return children;
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer as Buffer;
}
