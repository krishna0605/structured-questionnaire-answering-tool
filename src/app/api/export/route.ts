import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDocx } from '@/lib/export';
import type { QuestionWithAnswer } from '@/types';

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

    // Get project info
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get all questions with their answers and citations
    const { data: questionnaires } = await supabase
      .from('questionnaires')
      .select('id')
      .eq('project_id', projectId);

    if (!questionnaires) {
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

    // Build question-answer pairs
    const qaPairs: QuestionWithAnswer[] = [];
    for (const question of questions) {
      const { data: answers } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', question.id)
        .order('version', { ascending: false })
        .limit(1);

      const answer = answers && answers.length > 0
        ? answers[0]
        : {
            id: '',
            question_id: question.id,
            answer_text: 'No answer generated yet.',
            confidence_score: 0,
            evidence_snippets: '[]',
            is_not_found: true,
            is_edited: false,
            version: 0,
            created_at: new Date().toISOString(),
          };

      const { data: citations } = await supabase
        .from('citations')
        .select('*')
        .eq('answer_id', answer.id);

      qaPairs.push({
        question,
        answer,
        citations: citations || [],
      });
    }

    // Generate DOCX
    const buffer = await generateDocx(project.name, qaPairs);

    // Return as downloadable file
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_answers.docx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
