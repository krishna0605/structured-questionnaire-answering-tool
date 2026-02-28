import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { embedDocument } from '@/lib/rag';

// Force Node.js runtime (embedDocument uses Buffer + OpenAI) and allow longer execution
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

    // Upload file to storage
    const storagePath = `${user.id}/${projectId}/${Date.now()}_${filename}`;
    const { error: uploadError } = await supabase.storage
      .from('references')
      .upload(storagePath, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Create reference document record
    const { data: document, error: dbError } = await supabase
      .from('reference_documents')
      .insert({
        project_id: projectId,
        filename,
        storage_path: storagePath,
        status: 'uploaded',
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Embed the document (async processing)
    await embedDocument(document.id, buffer, filename);

    return NextResponse.json({
      document,
      message: 'Document uploaded and embedded successfully',
    });
  } catch (error) {
    console.error('Embed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
