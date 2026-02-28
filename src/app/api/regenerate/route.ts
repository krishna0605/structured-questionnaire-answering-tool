import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRAGAnswer } from '@/lib/rag';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, questionIds } = await request.json();

    if (!projectId || !questionIds || questionIds.length === 0) {
      return NextResponse.json(
        { error: 'projectId and questionIds required' },
        { status: 400 }
      );
    }

    // Get the selected questions
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .in('id', questionIds);

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Questions not found' },
        { status: 404 }
      );
    }

    // Process questions in parallel batches of 3 for speed
    const BATCH_SIZE = 3;
    const results: { question: typeof questions[0]; answer: unknown; citations: unknown[] }[] = [];

    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = questions.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (question) => {
          // Delete existing answers and citations for this question
          const { data: existingAnswers } = await supabase
            .from('answers')
            .select('id')
            .eq('question_id', question.id);

          if (existingAnswers) {
            const answerIds = existingAnswers.map((a) => a.id);
            if (answerIds.length > 0) {
              await supabase.from('citations').delete().in('answer_id', answerIds);
              await supabase.from('answers').delete().eq('question_id', question.id);
            }
          }

          // Re-generate answer
          const ragResult = await generateRAGAnswer(
            question.question_text,
            projectId
          );

          // Store new answer
          const { data: answer } = await supabase
            .from('answers')
            .insert({
              question_id: question.id,
              answer_text: ragResult.answer_text,
              confidence_score: ragResult.confidence_score,
              evidence_snippets: JSON.stringify(ragResult.evidence_snippets),
              is_not_found: ragResult.is_not_found,
              version: 1,
            })
            .select()
            .single();

          // Store citations
          if (answer && ragResult.citations.length > 0) {
            await supabase.from('citations').insert(
              ragResult.citations.map((c) => ({
                answer_id: answer.id,
                document_id: c.document_id,
                chunk_id: c.chunk_id,
                source_filename: c.source_filename,
                snippet: c.snippet,
              }))
            );
          }

          return { question, answer, citations: ragResult.citations };
        })
      );

      results.push(...batchResults);
    }

    return NextResponse.json({ results, count: results.length });
  } catch (error) {
    console.error('Regenerate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
