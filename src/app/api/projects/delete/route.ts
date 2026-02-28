import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function DELETE(request: NextRequest) {
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
      return NextResponse.json({ error: 'projectId required' }, { status: 400 });
    }

    const db = await createServiceClient();

    // Verify ownership
    const { data: project } = await db
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single();

    if (!project || project.user_id !== user.id) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    // 1. Get questionnaire IDs
    const { data: questionnaires } = await db
      .from('questionnaires')
      .select('id')
      .eq('project_id', projectId);
    const questionnaireIds = (questionnaires || []).map((q) => q.id);

    // 2. Get question IDs
    let questionIds: string[] = [];
    if (questionnaireIds.length > 0) {
      const { data: questions } = await db
        .from('questions')
        .select('id')
        .in('questionnaire_id', questionnaireIds);
      questionIds = (questions || []).map((q) => q.id);
    }

    // 3. Get answer IDs
    let answerIds: string[] = [];
    if (questionIds.length > 0) {
      const { data: answers } = await db
        .from('answers')
        .select('id')
        .in('question_id', questionIds);
      answerIds = (answers || []).map((a) => a.id);
    }

    // 4. Delete citations
    if (answerIds.length > 0) {
      await db.from('citations').delete().in('answer_id', answerIds);
    }

    // 5. Delete answers
    if (questionIds.length > 0) {
      await db.from('answers').delete().in('question_id', questionIds);
    }

    // 6. Delete answer_versions
    await db.from('answer_versions').delete().eq('project_id', projectId);

    // 7. Delete questions
    if (questionnaireIds.length > 0) {
      await db.from('questions').delete().in('questionnaire_id', questionnaireIds);
    }

    // 8. Delete questionnaires
    await db.from('questionnaires').delete().eq('project_id', projectId);

    // 9. Get document IDs
    const { data: documents } = await db
      .from('reference_documents')
      .select('id')
      .eq('project_id', projectId);
    const documentIds = (documents || []).map((d) => d.id);

    // 10. Delete document_chunks
    if (documentIds.length > 0) {
      await db.from('document_chunks').delete().in('document_id', documentIds);
    }

    // 11. Delete documents
    await db.from('reference_documents').delete().eq('project_id', projectId);

    // 12. Delete the project
    await db.from('projects').delete().eq('id', projectId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
