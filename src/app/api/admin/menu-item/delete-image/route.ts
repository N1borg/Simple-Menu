import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase();
  try {
    const { item_id } = await req.json();
    if (!item_id) {
      return NextResponse.json({ error: 'Missing item_id' }, { status: 400 });
    }
    const { error } = await supabase
      .from('menu_items')
      .update({ image_url: null })
      .eq('id', item_id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
