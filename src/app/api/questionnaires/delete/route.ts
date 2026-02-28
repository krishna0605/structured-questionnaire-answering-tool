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

    const { questionnaireId } = await request.json();

    if (!questionnaireId) {
      return NextResponse.json({ error: 'questionnaireId required' }, { status: 400 });
    }

    const db = await createServiceClient();

    // Delete questions first
    await db.from('questions').delete().eq('questionnaire_id', questionnaireId);

    // Delete the questionnaire
    const { error } = await db.from('questionnaires').delete().eq('id', questionnaireId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete questionnaire' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete questionnaire error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
