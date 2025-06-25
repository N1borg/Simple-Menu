import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { id, name, display_style, display_order } = await req.json()
  const supabase = await getServerSupabase()

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 })
  }

  const { error } = await supabase
    .from('categories')
    .update({ name, display_style, display_order })
    .eq('id', id)

  if (error) {
    console.error('Erreur update catégorie:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
