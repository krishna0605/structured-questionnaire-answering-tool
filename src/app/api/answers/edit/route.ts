import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answerId, answerText } = await request.json();

    if (!answerId || typeof answerText !== 'string') {
      return NextResponse.json(
        { error: 'answerId and answerText required' },
        { status: 400 }
      );
    }

    // Use service client to bypass RLS
    const db = await createServiceClient();

    const { error } = await db
      .from('answers')
      .update({ answer_text: answerText, is_edited: true })
      .eq('id', answerId);

    if (error) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Edit answer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
