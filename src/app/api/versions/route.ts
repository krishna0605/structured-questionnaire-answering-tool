import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId required' },
        { status: 400 }
      );
    }

    const { data: versions } = await supabase
      .from('answer_versions')
      .select('*')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false });

    return NextResponse.json({ versions: versions || [] });
  } catch (error) {
    console.error('Versions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, label } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId required' },
        { status: 400 }
      );
    }

    // Get all current Q&A data for snapshot
    const { data: questionnaires } = await supabase
      .from('questionnaires')
      .select('id')
      .eq('project_id', projectId);

    const questionnaireIds = questionnaires?.map((q) => q.id) || [];
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .in('questionnaire_id', questionnaireIds)
      .order('question_number');

    const snapshot = [];
    for (const question of questions || []) {
      const { data: answers } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', question.id)
        .order('version', { ascending: false })
        .limit(1);

      const answer = answers?.[0] || null;
      let citations = [];
      if (answer) {
        const { data: citData } = await supabase
          .from('citations')
          .select('*')
          .eq('answer_id', answer.id);
        citations = citData || [];
      }

      snapshot.push({ question, answer, citations });
    }

    // Compute a content hash for change detection
    // Extract only the meaningful data (answer texts, confidence, edit flags) for hashing
    const contentForHash = snapshot.map((s) => ({
      qid: s.question?.id,
      qt: s.question?.question_text,
      at: s.answer?.answer_text || '',
      cs: s.answer?.confidence_score ?? null,
      nf: s.answer?.is_not_found ?? false,
      ed: s.answer?.is_edited ?? false,
    }));
    const hashInput = JSON.stringify(contentForHash);

    // Simple string hash (FNV-1a inspired) — fast, no crypto needed
    let hash = 2166136261;
    for (let i = 0; i < hashInput.length; i++) {
      hash ^= hashInput.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const snapshotHash = (hash >>> 0).toString(36);

    // Check if last version has the same hash
    const { data: lastVersion } = await supabase
      .from('answer_versions')
      .select('snapshot_hash')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (lastVersion && lastVersion.length > 0 && lastVersion[0].snapshot_hash === snapshotHash) {
      return NextResponse.json({ noChanges: true });
    }

    // Get next version number
    const { data: maxVersion } = await supabase
      .from('answer_versions')
      .select('version_number')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = maxVersion && maxVersion.length > 0
      ? maxVersion[0].version_number + 1
      : 1;

    const { data: version, error } = await supabase
      .from('answer_versions')
      .insert({
        project_id: projectId,
        version_number: nextVersion,
        label: label || `Version ${nextVersion}`,
        snapshot: { questions: snapshot, generated_at: new Date().toISOString() },
        snapshot_hash: snapshotHash,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ version });
  } catch (error) {
    console.error('Versions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
