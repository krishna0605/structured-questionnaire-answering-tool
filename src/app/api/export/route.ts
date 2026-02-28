import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { generateDocx } from '@/lib/export';
import type { QuestionWithAnswer } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, versionId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId required' },
        { status: 400 }
      );
    }

    // Use service client for DB operations (bypasses RLS in serverless)
    const db = await createServiceClient();

    // Get project info
    const { data: project } = await db
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

    let qaPairs: QuestionWithAnswer[];
    let exportLabel = '';

    if (versionId) {
      // ── Export from saved version snapshot ──
      const { data: version, error: vErr } = await db
        .from('answer_versions')
        .select('snapshot, label, version_number')
        .eq('id', versionId)
        .single();

      if (vErr || !version) {
        return NextResponse.json(
          { error: 'Version not found' },
          { status: 404 }
        );
      }

      exportLabel = version.label || `Version ${version.version_number}`;

      // Parse snapshot — stored as { questions: [{ question, answer, citations }] }
      let raw = version.snapshot;
      if (typeof raw === 'string') raw = JSON.parse(raw);

      type SnapshotItem = {
        question: { id: string; question_number: number; question_text: string; questionnaire_id?: string; original_context?: string | null; created_at?: string };
        answer: { id: string; question_id: string; answer_text: string; confidence_score: number | null; evidence_snippets: string; is_not_found: boolean; is_edited: boolean; version: number; created_at: string } | null;
        citations: { id: string; answer_id: string; source_filename: string; snippet: string; chunk_id: string; document_id: string }[];
      };

      let snapshotItems: SnapshotItem[] = [];
      if (Array.isArray(raw)) {
        snapshotItems = raw;
      } else if (raw && typeof raw === 'object' && 'questions' in raw && Array.isArray((raw as { questions: unknown[] }).questions)) {
        snapshotItems = (raw as { questions: SnapshotItem[] }).questions;
      }

      qaPairs = snapshotItems.map((item) => ({
        question: {
          id: item.question?.id || '',
          question_number: item.question?.question_number || 0,
          question_text: item.question?.question_text || 'Unknown',
          questionnaire_id: item.question?.questionnaire_id || '',
          original_context: item.question?.original_context ?? null,
          created_at: item.question?.created_at || '',
        },
        answer: item.answer || {
          id: '', question_id: '', answer_text: 'No answer generated yet.',
          confidence_score: 0, evidence_snippets: '[]', is_not_found: true,
          is_edited: false, version: 0, created_at: new Date().toISOString(),
        },
        citations: item.citations || [],
      }));
    } else {
      // ── Export live data (existing behavior) ──
      const { data: questionnaires } = await db
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
      const { data: questions } = await db
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

      qaPairs = [];
      for (const question of questions) {
        const { data: answers } = await db
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

        const { data: citations } = await db
          .from('citations')
          .select('*')
          .eq('answer_id', answer.id);

        qaPairs.push({
          question,
          answer,
          citations: citations || [],
        });
      }
    }

    // Generate DOCX
    const docTitle = exportLabel
      ? `${project.name} — ${exportLabel}`
      : project.name;
    const buffer = await generateDocx(docTitle, qaPairs);

    // Return as downloadable file
    const safeFilename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}${exportLabel ? `_${exportLabel.replace(/[^a-zA-Z0-9]/g, '_')}` : ''}_answers.docx`;
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
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

