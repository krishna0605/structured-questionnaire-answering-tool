import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { parsePDF, parseXLSX, extractQuestionsFromText } from '@/lib/parser';

// Force Node.js runtime (pdf-parse/xlsx need it) and allow file uploads up to 10MB
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

    // Use service client for DB/storage operations (bypasses RLS in serverless)
    const db = await createServiceClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'File and projectId required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const ext = filename.toLowerCase().split('.').pop();

    // Upload file to storage
    const storagePath = `${user.id}/${projectId}/${Date.now()}_${filename}`;
    const { error: uploadError } = await db.storage
      .from('questionnaires')
      .upload(storagePath, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Create questionnaire record
    const { data: questionnaire, error: dbError } = await db
      .from('questionnaires')
      .insert({
        project_id: projectId,
        filename,
        storage_path: storagePath,
        status: 'parsing',
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Parse questions based on file type
    let questions;
    if (ext === 'xlsx' || ext === 'xls') {
      questions = parseXLSX(buffer);
    } else if (ext === 'pdf') {
      const text = await parsePDF(buffer);
      questions = extractQuestionsFromText(text);
    } else {
      // Plain text
      const text = buffer.toString('utf-8');
      questions = extractQuestionsFromText(text);
    }

    // Store parsed questions
    if (questions.length > 0) {
      const questionsToInsert = questions.map((q) => ({
        questionnaire_id: questionnaire.id,
        question_number: q.question_number,
        question_text: q.question_text,
        original_context: q.original_context,
      }));

      await db.from('questions').insert(questionsToInsert);
    }

    // Update questionnaire status
    await db
      .from('questionnaires')
      .update({ status: 'parsed' })
      .eq('id', questionnaire.id);

    return NextResponse.json({
      questionnaire,
      questions_count: questions.length,
      questions,
    });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
