import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { name, display_style, display_order, establishment_id } = await req.json()
  const supabase = await getServerSupabase()

  if (!name || !establishment_id) {
    return NextResponse.json({ success: false, error: 'Nom et établissement requis' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, display_style, display_order, establishment_id }])
    .select()
    .single()

  if (error) {
    console.error('Erreur création catégorie:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }

  return NextResponse.json({ success: true, category: data }, { status: 200 })
}
