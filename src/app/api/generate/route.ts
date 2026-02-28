import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRAGAnswer } from '@/lib/rag';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId required' },
        { status: 400 }
      );
    }

    // Get all questions for this project
    const { data: questionnaires } = await supabase
      .from('questionnaires')
      .select('id')
      .eq('project_id', projectId);

    if (!questionnaires || questionnaires.length === 0) {
      return NextResponse.json(
        { error: 'No questionnaires found' },
        { status: 404 }
      );
    }

    const questionnaireIds = questionnaires.map((q) => q.id);
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .in('questionnaire_id', questionnaireIds)
      .order('question_number');

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found' },
        { status: 404 }
      );
    }

    // Generate answers in parallel batches of 3 for speed
    const BATCH_SIZE = 3;
    const results: { question: typeof questions[0]; answer: unknown; citations: unknown[] }[] = [];

    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = questions.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (question) => {
          const ragResult = await generateRAGAnswer(
            question.question_text,
            projectId
          );

          // Store answer
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
            const citationsToInsert = ragResult.citations.map((c) => ({
              answer_id: answer.id,
              document_id: c.document_id,
              chunk_id: c.chunk_id,
              source_filename: c.source_filename,
              snippet: c.snippet,
            }));

            await supabase.from('citations').insert(citationsToInsert);
          }

          return { question, answer, citations: ragResult.citations };
        })
      );

      results.push(...batchResults);
    }

    return NextResponse.json({ results, count: results.length });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
