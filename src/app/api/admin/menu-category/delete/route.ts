import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { id } = await req.json()
  const supabase = await getServerSupabase()

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 })
  }

  // Optionally: delete all menu_items in this category first
  await supabase.from('menu_items').delete().eq('category_id', id)

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erreur suppression catégorie:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
